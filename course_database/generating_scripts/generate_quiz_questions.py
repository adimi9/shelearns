import os
import json
from typing import List, Dict, Optional, Any
from dotenv import load_dotenv
import openai
import asyncio
import time
import random
import re

class QuizGenerator:
    """
    Generates quizzes for courses using OpenAI's language models.
    Each quiz consists of multiple-choice questions with hints.
    """

    def __init__(self, root_dir: str = "courses"):
        """
        Initializes the QuizGenerator with API credentials, OpenAI model,
        and the root directory where course JSON files are located.
        """
        load_dotenv()

        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not set in environment variables.")
        
        self.openai_client = openai.AsyncOpenAI(api_key=self.api_key)
        self.openai_model = "gpt-4o" 

        self.root_dir = root_dir

    # Helper to get the schema for a single quiz array (used for both main and alternative quizzes)
    def _get_quiz_array_schema(self, num_questions: int) -> Dict:
        return {
            "type": "array",
            "minItems": num_questions,
            "maxItems": num_questions,
            "items": {
                "type": "object",
                "properties": {
                    "question": {"type": "string", "description": "The quiz question."},
                    "options": {
                        "type": "array",
                        "items": {"type": "string"},
                        "minItems": 4,
                        "maxItems": 4,
                        "description": "Exactly 4 multiple-choice options."
                    },
                    "correct_option": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 3,
                        "description": "The 0-based index of the correct option."
                    },
                    "hint": {"type": "string", "description": "A hint for the question."}
                },
                "required": ["question", "options", "correct_option", "hint"],
                "additionalProperties": False
            }
        }

    def _get_top_level_quiz_schema(self, num_questions: int) -> Dict:
        """
        Returns the JSON schema definition for the top-level quiz output.
        This schema is now passed directly to the API's 'json_schema' parameter.
        """
        return {
            "type": "object",
            "properties": {
                "quiz": self._get_quiz_array_schema(num_questions)
            },
            "required": ["quiz"],
            "additionalProperties": False 
        }

    def _get_alternative_quiz_schema(self, num_questions: int) -> Dict:
        """
        Returns the JSON schema definition for an alternative quiz output.
        """
        return {
            "type": "object",
            "properties": {
                "alternative_quiz": self._get_quiz_array_schema(num_questions)
            },
            "required": ["alternative_quiz"],
            "additionalProperties": False
        }


    def _build_system_prompt(self) -> str:
        """
        Builds the system prompt. With 'json_schema' response_format,
        the explicit schema definition is handled by the API,
        so the system prompt can be simpler.
        """
        return """
        You are an expert quiz generator. Your sole purpose is to create multiple-choice quiz questions based on the user's request and the provided course context.
        Generate the quiz questions in a JSON format that strictly adheres to the schema provided separately.
        Do NOT include any conversational text, explanations, or markdown outside of the JSON object itself.
        """

    def _build_user_prompt_for_main_course(self, course_data: Dict[str, Any], num_questions: int) -> str:
        """
        Builds the user prompt specifically for the main course content.
        """
        course_name = course_data.get("name", "Unknown Course")
        main_topics = course_data.get("topics", [])
        primary_tech = course_data.get("primary_tech", [])
        levels = course_data.get("levels", [])

        context_parts = []
        if main_topics:
            context_parts.append(f"Key topics: {', '.join(main_topics)}")
        if primary_tech:
            context_parts.append(f"Primary technologies: {', '.join(primary_tech)}")
        if levels:
            context_parts.append(f"Target audience levels: {', '.join(levels)}")

        context_string = "\n        ".join(context_parts) if context_parts else "general concepts."

        return f"""
        Generate {num_questions} quiz questions for the main content of the course titled "{course_name}".
        Focus on:
        {context_string}
        """

    def _build_user_prompt_for_alternative(self, course_name: str, alternative_data: Dict[str, Any], num_questions: int) -> str:
        """
        Builds the user prompt specifically for a given alternative technology.
        """
        tech = alternative_data.get("tech", "an unspecified technology")
        reason = alternative_data.get("reason", "related concepts")
        tags = alternative_data.get("tags", [])
        preferred_if = alternative_data.get("preferred_if", [])

        context_parts = [
            f"Technology: {tech}",
            f"Reason for alternative: {reason}"
        ]
        if tags:
            context_parts.append(f"Related tags: {', '.join(tags)}")
        if preferred_if:
            context_parts.append(f"Use case/preference: {', '.join(preferred_if)}")

        context_string = "\n        ".join(context_parts)

        return f"""
        Generate {num_questions} quiz questions for the alternative technology/concept related to "{course_name}".
        Specifically, focus on:
        {context_string}
        """

    async def _make_quiz_api_call(self, user_msg: str, num_questions: int, course_name_for_logging: str, is_alternative_quiz: bool = False) -> List[Dict]:
        """
        Helper method to make a single OpenAI API call for quiz generation.
        Includes robust error handling and proper asynchronous waiting,
        with a retry mechanism for rate limits.
        """
        max_retries = 15  # Increased to 15 retries
        base_delay = 3    # Increased to 3 seconds base delay
        
        system_msg = self._build_system_prompt() 

        # Determine which schema to use based on whether it's a main or alternative quiz
        if is_alternative_quiz:
            schema_to_use = self._get_alternative_quiz_schema(num_questions)
            quiz_key = "alternative_quiz" # Key to extract from the response
        else:
            schema_to_use = self._get_top_level_quiz_schema(num_questions)
            quiz_key = "quiz" # Key to extract from the response

        for retry_count in range(max_retries):
            try:
                response = await self.openai_client.chat.completions.create(
                    model=self.openai_model,
                    messages=[
                        {"role": "system", "content": system_msg},
                        {"role": "user", "content": user_msg}
                    ],
                    temperature=0.7,
                    max_tokens=700,
                    response_format={
                        "type": "json_schema",
                        "json_schema": {
                            "name": quiz_key + "_output_schema", # Dynamic name for schema
                            "strict": True,
                            "schema": schema_to_use
                        }
                    }
                )
                
                # Extract quiz data using the determined key
                quiz_data = json.loads(response.choices[0].message.content)[quiz_key]
                print(f"  ✅ Successfully generated {len(quiz_data)} questions for '{course_name_for_logging}'.")
                return quiz_data

            except openai.RateLimitError as e:
                retry_after_ms = None
                match = re.search(r'Please try again in (\d+)ms', e.message)
                if match:
                    retry_after_ms = int(match.group(1))
                    delay = retry_after_ms / 1000.0
                else:
                    delay = base_delay * (2 ** retry_count) + random.uniform(0, 1)

                print(f"⚠️ Rate limit exceeded for '{course_name_for_logging}'. Retrying in {delay:.2f} seconds (Retry {retry_count + 1}/{max_retries}). Error: {e.message}")
                await asyncio.sleep(delay)
                continue

            except openai.APIConnectionError as e:
                print(f"❌ OpenAI API Connection Error for '{course_name_for_logging}': {e}")
                break
            except openai.AuthenticationError as e:
                print(f"❌ OpenAI API Authentication Error for '{course_name_for_logging}': {e}. Check your API key.")
                break
            except openai.APIStatusError as e:
                print(f"❌ OpenAI API Status Error (HTTP {e.status_code}) for '{course_name_for_logging}': {e.response.json() if e.response else e}")
                break 
            except json.JSONDecodeError as e:
                print(f"❌ Error decoding JSON response from OpenAI for '{course_name_for_logging}': {e}")
                raw_content = response.choices[0].message.content if 'response' in locals() and response and response.choices else 'N/A'
                print(f"Raw API response content: {raw_content}")
                break
            except Exception as e:
                print(f"❌ An unexpected error occurred during quiz generation for '{course_name_for_logging}': {e}")
                break

        print(f"❌ Failed to generate quiz for '{course_name_for_logging}' after {max_retries} retries due to persistent errors.")
        return []

    async def generate_full_quiz_for_course(self, course_data: Dict[str, Any], 
                                            main_course_qns: int = 5, 
                                            alternative_qns_per_alt: int = 5) -> None: # Changed return type to None
        """
        Generates a comprehensive quiz including questions for the main course and each alternative.
        Modifies the course_data dictionary in place.
        """
        course_name = course_data.get("name", "Unknown Course")

        print(f"  - Generating {main_course_qns} questions for main course: {course_name}")
        main_course_user_prompt = self._build_user_prompt_for_main_course(course_data, main_course_qns)
        
        main_quiz = await self._make_quiz_api_call(main_course_user_prompt, main_course_qns, course_name, is_alternative_quiz=False)
        
        if main_quiz:
            course_data["quiz"] = main_quiz
        else:
            print(f"⚠️ No main quiz generated for {course_name}.")
            course_data["quiz"] = [] # Ensure the key exists, even if empty

        alternative_tasks = []
        alternative_data_list = course_data.get("alternatives", [])
        
        # Create a list to store the results of alternative quiz generation
        # This will hold tuples of (index_of_alternative, quiz_data)
        alternative_quiz_results = [None] * len(alternative_data_list) 

        for i, alt in enumerate(alternative_data_list):
            alt_tech_name = alt.get("tech", f"Alternative {i+1}")
            print(f"  - Generating {alternative_qns_per_alt} questions for alternative: {alt_tech_name}")
            alt_user_prompt = self._build_user_prompt_for_alternative(course_name, alt, alternative_qns_per_alt)
            
            # Schedule the task and store its future, along with its original index
            async def _generate_alt_quiz(index, user_msg, num_qns, log_name):
                return index, await self._make_quiz_api_call(user_msg, num_qns, log_name, is_alternative_quiz=True)

            alternative_tasks.append(
                _generate_alt_quiz(i, alt_user_prompt, alternative_qns_per_alt, f"{course_name} ({alt_tech_name})")
            )
        
        if alternative_tasks:
            # Await all alternative quizzes for *this single course* to complete
            completed_alternative_quizzes = await asyncio.gather(*alternative_tasks)
            
            # Assign the generated quizzes back to their respective alternative objects
            for idx, quiz_list in completed_alternative_quizzes:
                if quiz_list:
                    alternative_data_list[idx]["alternative_quiz"] = quiz_list
                else:
                    print(f"⚠️ No quiz generated for alternative {alternative_data_list[idx].get('tech', f'Alternative {idx+1}')}.")
                    alternative_data_list[idx]["alternative_quiz"] = [] # Ensure the key exists, even if empty
        
        # The course_data object is modified in place, so no return value needed

    def _load_course(self, filepath: str) -> Optional[Dict]:
        """
        Loads a course JSON file and returns the parsed dictionary.
        Includes error handling for file operations.
        """
        try:
            with open(filepath, encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"⚠️ Course file not found at '{filepath}'.")
            return None
        except json.JSONDecodeError as e:
            print(f"⚠️ Failed to parse JSON from '{filepath}': {e}")
            print(f"Please check JSON syntax in: {filepath} at the reported line/column.")
            return None
        except Exception as e:
            print(f"⚠️ An unexpected error occurred loading course at '{filepath}': {e}")
            return None

    def _save_course(self, filepath: str, course_data: Dict) -> None:
        """
        Saves the updated course data with quiz back to the JSON file.
        Ensures proper UTF-8 encoding.
        """
        try:
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(course_data, f, indent=2, ensure_ascii=False)
            print(f"✅ Course data updated and saved to {filepath}") # Updated message
        except Exception as e:
            print(f"❌ Failed to save updated course to '{filepath}': {e}")

    async def enrich_course_file(self, filepath: str, main_course_qns: int = 5, alternative_qns_per_alt: int = 5) -> None:
        """
        Loads a course JSON file, generates quiz questions (main + alternatives),
        and writes the updated course data back to the file asynchronously.
        """
        course = self._load_course(filepath)
        if not course:
            return

        course_name = course.get("name", os.path.splitext(os.path.basename(filepath))[0])
        print(f"\n> Starting quiz generation for course: {course_name}")

        # generate_full_quiz_for_course now modifies 'course' directly
        await self.generate_full_quiz_for_course(course, main_course_qns, alternative_qns_per_alt) 
        
        # We save regardless, as the 'quiz' and 'alternative_quiz' keys will be added
        # even if empty, ensuring the structure is consistent.
        self._save_course(filepath, course)

    async def enrich_all_courses(self) -> None:
        """
        Recursively scans the course directory and processes all JSON files
        to append quizzes. Processes in batches to reduce concurrent API pressure.
        """
        all_file_paths = []
        if not os.path.exists(self.root_dir):
            print(f"Error: Course root directory '{self.root_dir}' does not exist.")
            return

        for dirpath, _, filenames in os.walk(self.root_dir):
            for filename in filenames:
                if filename.lower().endswith(".json") and not filename.lower().endswith((".json~", ".json.bak")):
                    filepath = os.path.join(dirpath, filename)
                    all_file_paths.append(filepath)
        
        if not all_file_paths:
            print(f"\nNo valid JSON course files found in '{self.root_dir}'.")
            return

        print(f"\nInitiating quiz generation for {len(all_file_paths)} course files in batches...")
        
        batch_size = 5 
        batch_delay = 10 

        for i in range(0, len(all_file_paths), batch_size):
            current_batch_paths = all_file_paths[i:i + batch_size]
            batch_num = (i // batch_size) + 1
            total_batches = (len(all_file_paths) + batch_size - 1) // batch_size 

            print(f"\n--- Processing Batch {batch_num}/{total_batches} ({len(current_batch_paths)} courses) ---")
            
            batch_tasks = []
            for filepath in current_batch_paths:
                batch_tasks.append(self.enrich_course_file(filepath))
            
            await asyncio.gather(*batch_tasks)

            if batch_num < total_batches:
                print(f"\nBatch {batch_num} complete. Waiting {batch_delay} seconds before next batch...")
                await asyncio.sleep(batch_delay)
        
        print(f"\nFinished quiz generation for all course files.")


if __name__ == "__main__":
    quiz_gen = QuizGenerator()
    asyncio.run(quiz_gen.enrich_all_courses())