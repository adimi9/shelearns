import os
import json
import logging
from typing import List, Dict, Optional, Any, Tuple, Union
from dotenv import load_dotenv
import openai
import asyncio
import time
import random
import re
from pydantic import BaseModel, Field, ValidationError

# ----------------------------------
# 🔧 Logging configuration
# ----------------------------------
logging.basicConfig(
    level=logging.DEBUG, # Change this to logging.DEBUG to see ALL the granular logs
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)


# -------------------------------
# 📦 Pydantic models for Quiz Structure
# -------------------------------
class QuizQuestion(BaseModel):
    question: str
    options: List[str] = Field(min_length=4, max_length=4)
    correct_option: int = Field(ge=0, le=3)
    hint: str

# Modified Pydantic model to explicitly enforce the number of questions
class LevelQuizOutput(BaseModel):
    questions: List[QuizQuestion] = Field(
        ..., # ... indicates the field is required
        min_length=5, # Ensure at least 5 questions
        max_length=5  # Ensure at most 5 questions, so exactly 5
    )

# ----------------------------------
# Main QuizGenerator Class
# ----------------------------------
class QuizGenerator:
    """
    Generates quizzes for courses using OpenAI's language models.
    Each quiz consists of multiple-choice questions with hints, organized by difficulty level.
    Handles course JSON files that are either a single object or a list of objects.
    """

    def __init__(self):
        """
        Initializes the QuizGenerator with API credentials, OpenAI model,
        and the root directory where course JSON files are located.
        """
        logger.debug("QuizGenerator.__init__ called.")
        logger.info("Initializing QuizGenerator...")
        load_dotenv()
        logger.debug("Environment variables loaded.")

        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            logger.critical("OPENAI_API_KEY not set in environment variables. Exiting.")
            raise ValueError("OPENAI_API_KEY not set in environment variables.")
        logger.info("OPENAI_API_KEY found.")
        
        self.openai_client = openai.AsyncOpenAI(api_key=self.api_key)
        self.openai_model = "gpt-4o" 
        logger.info(f"OpenAI client initialized with model: {self.openai_model}")

        self.root_dir = os.path.join(os.path.dirname(__file__), "..", "restructured_courses")
        logger.info(f"Root directory for input courses set to: {self.root_dir}")

        # --- NEW: Define output directory ---
        self.output_dir = os.path.join(os.path.dirname(__file__), "..", "quizzed_courses")
        logger.info(f"Output directory for quizzed courses set to: {self.output_dir}")

        self.levels = ["beginner", "intermediate", "advanced"] # Define levels
        self.questions_per_level = 5 # Set the desired number of questions per level
        logger.info(f"Quiz generation settings: {self.questions_per_level} questions per level for levels: {', '.join(self.levels)}")
        logger.info("QuizGenerator initialization complete.")
        logger.debug("QuizGenerator.__init__ finished.")

    # Helper to get the JSON schema for a single quiz question
    def _get_quiz_question_schema(self) -> Dict:
        logger.debug("_get_quiz_question_schema called.")
        schema = {
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
        logger.debug("_get_quiz_question_schema returning schema.")
        return schema

    # Helper to get the JSON schema for the *object* that wraps the quiz array for the API
    def _get_api_level_quiz_schema(self, num_questions: int) -> Dict:
        logger.debug(f"_get_api_level_quiz_schema called with num_questions={num_questions}.")
        schema = {
            "type": "object",
            "properties": {
                "questions": { # This key will contain the array of questions
                    "type": "array",
                    "minItems": num_questions,
                    "maxItems": num_questions,
                    "items": self._get_quiz_question_schema()
                }
            },
            "required": ["questions"],
            "additionalProperties": False
        }
        logger.debug("_get_api_level_quiz_schema returning schema.")
        return schema

    def _build_system_prompt(self) -> str:
        """
        Builds the system prompt. With 'json_schema' response_format,
        the explicit schema definition is handled by the API,
        so the system prompt can be simpler.
        """
        logger.debug("_build_system_prompt called.")
        prompt = """
        You are an expert quiz generator. Your sole purpose is to create multiple-choice quiz questions based on the user's request and the provided course context.
        Generate the quiz questions in a JSON format that strictly adheres to the schema provided separately.
        Do NOT include any conversational text, explanations, or markdown outside of the JSON object itself.
        """
        logger.debug("_build_system_prompt returning prompt.")
        return prompt

    def _build_user_prompt_for_main_course(self, course_data: Dict[str, Any], num_questions: int, level: str) -> str:
        """
        Builds the user prompt specifically for a given level of the main course content.
        """
        logger.debug(f"_build_user_prompt_for_main_course called with course_data (keys: {list(course_data.keys())}), num_questions={num_questions}, level='{level}'.")
        course_name = course_data.get("name", "Unknown Course")
        main_topics = course_data.get("topics", [])
        primary_tech = course_data.get("primary_tech", [])
        course_levels_overview = course_data.get("levels", []) 

        context_parts = []
        if main_topics:
            context_parts.append(f"Key topics: {', '.join(main_topics)}")
        if primary_tech:
            context_parts.append(f"Primary technologies: {', '.join(primary_tech)}")
        if course_levels_overview:
            context_parts.append(f"Overall course levels: {', '.join(course_levels_overview)}")

        context_string = "\n          ".join(context_parts) if context_parts else "general concepts."

        user_prompt = f"""
        Generate {num_questions} quiz questions for the main content of the course titled "{course_name}", specifically tailored for the "{level}" difficulty level.
        Focus on:
        {context_string}
        """
        logger.debug(f"_build_user_prompt_for_main_course returning user prompt (first 200 chars): {user_prompt[:200]}...")
        return user_prompt

    async def _make_quiz_api_call(self, user_msg: str, num_questions: int, course_name_for_logging: str, level: str) -> List[Dict]:
        """
        Helper method to make a single OpenAI API call for quiz generation.
        Includes robust error handling and proper asynchronous waiting,
        with a retry mechanism for rate limits.
        """
        logger.debug(f"_make_quiz_api_call called for course='{course_name_for_logging}', level='{level}', num_questions={num_questions}.")
        logger.info(f"Attempting API call for '{course_name_for_logging}' ({level} level)...")
        max_retries = 15  
        base_delay = 5    
        api_max_tokens = 2000 

        system_msg = self._build_system_prompt() 
        logger.debug(f"System message for API call: {system_msg[:100]}...")

        api_schema = self._get_api_level_quiz_schema(num_questions)
        logger.debug(f"API schema for response_format: {json.dumps(api_schema, indent=2)}")
        
        quiz_key_for_extraction = "questions" 
        logger.debug(f"Expecting quiz data under key: '{quiz_key_for_extraction}'")

        for retry_count in range(max_retries):
            logger.debug(f"API call attempt {retry_count + 1}/{max_retries} for '{course_name_for_logging}' ({level}).")
            try:
                logger.debug(f"Making OpenAI API call with model '{self.openai_model}'.")
                response = await self.openai_client.chat.completions.create(
                    model=self.openai_model,
                    messages=[
                        {"role": "system", "content": system_msg},
                        {"role": "user", "content": user_msg}
                    ],
                    temperature=0.7,
                    max_tokens=api_max_tokens, 
                    response_format={
                        "type": "json_schema",
                        "json_schema": {
                            "name": f"quiz_{level}_output_schema",
                            "strict": True,
                            "schema": api_schema
                        }
                    }
                )
                logger.debug(f"OpenAI API call successful for '{course_name_for_logging}' ({level}). Response received.")
                
                raw_response_content_str = response.choices[0].message.content
                logger.debug(f"Raw API response content string (first 500 chars): {raw_response_content_str[:500]}...")
                
                logger.debug("Attempting to parse raw JSON string.")
                raw_response_content = json.loads(raw_response_content_str)
                logger.debug(f"Successfully parsed raw JSON. Content keys: {list(raw_response_content.keys()) if isinstance(raw_response_content, dict) else 'Not a dict'}")

                logger.debug("Attempting Pydantic validation.")
                validated_response = LevelQuizOutput(**raw_response_content)
                quiz_data_list_of_models = validated_response.questions
                logger.debug(f"Pydantic validation successful. Found {len(quiz_data_list_of_models)} questions for '{level}'.")

                quiz_data = [q.model_dump() for q in quiz_data_list_of_models]
                logger.debug(f"Converted Pydantic models to list of dictionaries. First question: {quiz_data[0] if quiz_data else 'N/A'}")
                logger.info(f"✅ Successfully generated {len(quiz_data)} questions for '{course_name_for_logging}' ({level} level) and validated with Pydantic.")
                logger.debug(f"_make_quiz_api_call returning {len(quiz_data)} questions.")
                return quiz_data

            except openai.RateLimitError as e:
                retry_after_ms = None
                match = re.search(r'Please try again in (\d+)ms', e.message)
                if match:
                    delay = int(match.group(1)) / 1000.0
                else:
                    delay = base_delay * (2 ** retry_count) + random.uniform(0, 1)

                logger.warning(f"⚠️ Rate limit exceeded for '{course_name_for_logging}' ({level}). Retrying in {delay:.2f} seconds (Retry {retry_count + 1}/{max_retries}). Error: {e.message}")
                await asyncio.sleep(delay)
                continue

            except openai.APIConnectionError as e:
                logger.error(f"❌ OpenAI API Connection Error for '{course_name_for_logging}' ({level}): {e}")
                logger.debug("_make_quiz_api_call exiting due to APIConnectionError.")
                break
            except openai.AuthenticationError as e:
                logger.critical(f"❌ OpenAI API Authentication Error for '{course_name_for_logging}' ({level}): {e}. Check your API key. Exiting.")
                logger.debug("_make_quiz_api_call exiting due to AuthenticationError.")
                break
            except openai.APIStatusError as e:
                logger.error(f"❌ OpenAI API Status Error (HTTP {e.status_code}) for '{course_name_for_logging}' ({level}): {e.response.json() if e.response else e}")
                if retry_count < max_retries -1:
                    logger.warning(f"Retrying after API Status Error (Retry {retry_count + 1}/{max_retries})...")
                    await asyncio.sleep(base_delay)
                    continue
                logger.debug("_make_quiz_api_call exiting due to persistent APIStatusError.")
                break 
            except json.JSONDecodeError as e:
                raw_content = response.choices[0].message.content if 'response' in locals() and response and response.choices else 'N/A'
                logger.error(f"❌ Error decoding JSON response from OpenAI for '{course_name_for_logging}' ({level}): {e}")
                logger.debug(f"Raw API response content that caused JSONDecodeError: {raw_content}") 
                
                if retry_count < max_retries -1:
                    logger.warning(f"Retrying after JSON decode error (Retry {retry_count + 1}/{max_retries})...")
                    await asyncio.sleep(base_delay) 
                    continue
                logger.debug("_make_quiz_api_call exiting due to persistent JSONDecodeError.")
                break 
            except ValidationError as e:
                raw_content = response.choices[0].message.content if 'response' in locals() and response and response.choices else 'N/A'
                logger.error(f"❌ Pydantic Validation Error for '{course_name_for_logging}' ({level}): {e}")
                logger.debug(f"Raw API response content that failed Pydantic validation: {raw_content}")
                
                if retry_count < max_retries - 1:
                    logger.warning(f"Retrying after Pydantic validation error (Retry {retry_count + 1}/{max_retries})...")
                    await asyncio.sleep(base_delay)
                    continue
                logger.debug("_make_quiz_api_call exiting due to persistent Pydantic ValidationError.")
                break
            except Exception as e:
                logger.exception(f"❌ An unexpected error occurred during quiz generation for '{course_name_for_logging}' ({level})") 
                logger.debug("_make_quiz_api_call exiting due to unexpected error.")
                break

        logger.error(f"❌ Failed to generate quiz for '{course_name_for_logging}' ({level}) after {max_retries} retries due to persistent errors.")
        logger.debug("_make_quiz_api_call returning empty list due to failures.")
        return []

    async def _process_single_course_object(self, course_data: Dict[str, Any]) -> None:
        """
        Generates quizzes for a single course dictionary object.
        Modifies the course_data dictionary in place.
        """
        course_name = course_data.get("name", "Unknown Course")
        logger.debug(f"_process_single_course_object called for course: '{course_name}'.")
        logger.info(f"   > Processing course: {course_name}")

        logger.debug(f"Checking 'quiz' key existence and type for '{course_name}'. Current 'quiz' type: {type(course_data.get('quiz'))}. Quiz content: {course_data.get('quiz')}")
        if "quiz" not in course_data or not isinstance(course_data["quiz"], dict):
            logger.info(f"     Initializing/Resetting 'quiz' section for '{course_name}'.")
            course_data["quiz"] = {} 
        else:
            # This log will now correctly reflect that the loaded 'course_data'
            # (which comes from the *original* file, which might have been modified in a prior run)
            # already contains a 'quiz' section. This is no longer an issue
            # because we will save to a *new* file.
            logger.info(f"     'quiz' section already exists for '{course_name}'. It will be overwritten with new quiz data.")
        logger.debug(f"'quiz' section for '{course_name}' in memory is now: {course_data['quiz']}.")
        
        for level_idx, level in enumerate(self.levels):
            logger.info(f"     - Generating {self.questions_per_level} questions for '{course_name}' ({level} level)")
            user_prompt = self._build_user_prompt_for_main_course(course_data, self.questions_per_level, level)
            
            logger.debug(f"Calling _make_quiz_api_call for '{course_name}' ({level}).")
            quiz_list = await self._make_quiz_api_call(user_prompt, self.questions_per_level, course_name, level=level)
            logger.debug(f"Received quiz_list (length: {len(quiz_list)}) from _make_quiz_api_call for '{course_name}' ({level}).")
            
            if quiz_list:
                course_data["quiz"][level] = quiz_list
                logger.info(f"     ✅ Quiz for '{course_name}' ({level} level) successfully added/overwritten in memory.")
                logger.debug(f"Assigned {len(quiz_list)} questions to course_data['quiz']['{level}'].")
            else:
                logger.warning(f"     ⚠️ No quiz generated for '{course_name}' ({level} level). Setting to empty list.")
                course_data["quiz"][level] = [] 
                logger.debug(f"Assigned empty list to course_data['quiz']['{level}'].")

            if level_idx < len(self.levels) - 1: # Check if it's not the last level
                logger.debug(f"     Waiting 1.5 seconds before processing next level for '{course_name}'...")
                await asyncio.sleep(1.5) 
        logger.info(f"   > Finished processing all levels for course: {course_name}")
        logger.debug(f"_process_single_course_object finished for course: '{course_name}'.")

    # ... (other methods like _build_user_prompt_for_main_course, _make_quiz_api_call)

    def _load_course(self, filepath: str) -> Optional[Tuple[Union[Dict, List[Dict]], bool]]:
        """
        Loads a course JSON file and returns the parsed data along with a boolean
        indicating if the original root was a list.
        Returns (data, was_list) or None on error.
        """
        logger.debug(f"_load_course called with filepath='{filepath}'.")
        logger.info(f"Attempting to load course file: {filepath}")
        try:
            with open(filepath, encoding="utf-8") as f:
                data = json.load(f)
                logger.info(f"Successfully loaded JSON from {filepath}.")
                if isinstance(data, list):
                    logger.debug(f"File root is a list. Found {len(data)} items.")
                    valid_data = [item for item in data if isinstance(item, dict)]
                    if len(valid_data) < len(data):
                        logger.warning(f"⚠️ Warning: '{filepath}' contains non-dictionary items in the root array. Only dictionary items will be processed. Invalid items: {len(data) - len(valid_data)}")
                    if not valid_data:
                        logger.warning(f"⚠️ Warning: '{filepath}' contains an empty or invalid array. Skipping this file.")
                        logger.debug(f"_load_course returning None for invalid list file.")
                        return None
                    logger.info(f"Returning {len(valid_data)} valid course objects from list.")
                    logger.debug(f"_load_course returning (valid_data, True).")
                    return (valid_data, True)
                elif isinstance(data, dict):
                    logger.info(f"File root is a single dictionary course object.")
                    logger.debug(f"_load_course returning (data, False).")
                    return (data, False)
                else:
                    logger.warning(f"⚠️ Warning: '{filepath}' root is neither a dictionary nor a list. Skipping. Type: {type(data)}")
                    logger.debug(f"_load_course returning None for invalid root type.")
                    return None
        except FileNotFoundError:
            logger.warning(f"⚠️ Course file not found at '{filepath}'.")
            logger.debug(f"_load_course returning None due to FileNotFoundError.")
            return None
        except json.JSONDecodeError as e:
            logger.warning(f"⚠️ Failed to parse JSON from '{filepath}': {e}")
            logger.debug(f"Please check JSON syntax in: {filepath} at the reported line/column.")
            logger.debug(f"_load_course returning None due to JSONDecodeError.")
            return None
        except Exception as e:
            logger.exception(f"⚠️ An unexpected error occurred loading course at '{filepath}'")
            logger.debug(f"_load_course returning None due to unexpected Exception.")
            return None

    # ... (the _save_course method comes after this)

    # --- MODIFIED: _save_course now takes the target path directly ---
    def _save_course(self, target_filepath: str, data_to_save: Union[Dict, List[Dict]]) -> None:
        """
        Saves the updated course data to the specified target JSON file.
        Accepts either a dictionary (single course) or a list of dictionaries (multiple courses).
        Ensures proper UTF-8 encoding.
        """
        logger.debug(f"_save_course called with target_filepath='{target_filepath}' and data_to_save type: {type(data_to_save)}. Data size: {len(data_to_save) if isinstance(data_to_save, (list, dict)) else 'N/A'}.")
        logger.info(f"Attempting to save updated course data to NEW location: {target_filepath}")
        try:
            os.makedirs(os.path.dirname(target_filepath), exist_ok=True)
            logger.debug(f"Ensured directory exists: {os.path.dirname(target_filepath)}")
            with open(target_filepath, "w", encoding="utf-8") as f:
                json.dump(data_to_save, f, indent=2, ensure_ascii=False)
            logger.info(f"✅ Course data updated and saved to {target_filepath}")
            logger.debug(f"_save_course finished for '{target_filepath}'.")
        except Exception as e:
            logger.exception(f"❌ Failed to save updated course to '{target_filepath}'")
            logger.debug(f"_save_course failed for '{target_filepath}'.")

    async def enrich_course_file(self, filepath: str) -> None:
        """
        Loads a course JSON file, processes its contents (single course or list of courses),
        generates quiz questions, and writes the updated data to the *new output directory*
        maintaining its original top-level structure.
        """
        logger.debug(f"enrich_course_file called for input filepath='{filepath}'.")
        logger.info(f"\n> Starting quiz generation for file: {filepath}")
        loaded_data_tuple = self._load_course(filepath)
        if loaded_data_tuple is None:
            logger.warning(f"Skipping file {filepath} due to loading errors.")
            logger.debug(f"enrich_course_file returning early due to failed load.")
            return

        original_data, was_list = loaded_data_tuple
        logger.debug(f"File {filepath} loaded. Root was list: {was_list}. Data type: {type(original_data)}.")

        # Calculate the relative path from the root_dir to maintain structure
        relative_filepath = os.path.relpath(filepath, self.root_dir)
        new_save_filepath = os.path.join(self.output_dir, relative_filepath)
        logger.debug(f"Calculated new save path: {new_save_filepath}")

        if was_list:
            logger.info(f"Processing multiple courses within file: {filepath}")
            logger.debug(f"Iterating through {len(original_data)} courses in the list.")
            for i, course_data in enumerate(original_data):
                course_name = course_data.get("name", f"Course {i+1} in list")
                logger.info(f"   Processing individual course '{course_name}' (Index {i+1}/{len(original_data)}) from list.")
                logger.debug(f"Calling _process_single_course_object for course '{course_name}'.")
                await self._process_single_course_object(course_data)
                logger.debug(f"_process_single_course_object completed for course '{course_name}'.")
                if i < len(original_data) -1: 
                    logger.info(f"   > Waiting 2 seconds before processing next course in {os.path.basename(filepath)}...")
                    await asyncio.sleep(2.0) 
            logger.info(f"Finished processing all courses in file: {filepath}. Preparing to save to new location.")
            logger.debug(f"Calling _save_course for file: {new_save_filepath} with updated list data.")
            self._save_course(new_save_filepath, original_data) # --- MODIFIED CALL ---
        else:
            logger.info(f"Processing single course file: {filepath}")
            logger.debug(f"Calling _process_single_course_object for single course '{filepath}'.")
            await self._process_single_course_object(original_data)
            logger.debug(f"_process_single_course_object completed for single course '{filepath}'.")
            logger.info(f"Finished processing single course in file: {filepath}. Preparing to save to new location.")
            logger.debug(f"Calling _save_course for file: {new_save_filepath} with updated dictionary data.")
            self._save_course(new_save_filepath, original_data) # --- MODIFIED CALL ---
        logger.info(f"> Finished quiz generation and saving for file: {filepath} to NEW location: {new_save_filepath}\n")
        logger.debug(f"enrich_course_file finished for input filepath='{filepath}'.")

    async def enrich_all_courses(self) -> None:
        """
        Recursively scans the course directory and processes all JSON files
        to append quizzes. Processes in batches to reduce concurrent API pressure.
        """
        logger.debug("enrich_all_courses called.")
        logger.info("Starting overall quiz generation process for all course files.")
        all_file_paths = []
        if not os.path.exists(self.root_dir):
            logger.error(f"Error: Course input directory '{self.root_dir}' does not exist. Please check the path.")
            logger.debug(f"enrich_all_courses returning early due to missing root directory.")
            return

        # Ensure the output directory exists
        os.makedirs(self.output_dir, exist_ok=True)
        logger.info(f"Ensured output directory '{self.output_dir}' exists.")


        logger.info(f"Scanning directory '{self.root_dir}' for JSON files...")
        for dirpath, _, filenames in os.walk(self.root_dir):
            logger.debug(f"Scanning directory: {dirpath}")
            for filename in filenames:
                if filename.lower().endswith(".json") and not filename.lower().endswith((".json~", ".json.bak")):
                    filepath = os.path.join(dirpath, filename)
                    all_file_paths.append(filepath)
                    logger.debug(f"Found JSON file: {filepath}")
        
        if not all_file_paths:
            logger.info(f"\nNo valid JSON course files found in '{self.root_dir}'. Nothing to process.")
            logger.debug(f"enrich_all_courses returning early as no files were found.")
            return

        logger.info(f"\nInitiating quiz generation for {len(all_file_paths)} course files in batches...")
        
        batch_size = 3 
        batch_delay = 15 

        total_batches = (len(all_file_paths) + batch_size - 1) // batch_size 
        logger.info(f"Configured batch size: {batch_size}, batch delay: {batch_delay} seconds. Total batches: {total_batches}")
        logger.debug(f"All file paths: {all_file_paths}")

        for i in range(0, len(all_file_paths), batch_size):
            current_batch_paths = all_file_paths[i:i + batch_size]
            batch_num = (i // batch_size) + 1
            
            logger.info(f"\n--- Processing Batch {batch_num}/{total_batches} ({len(current_batch_paths)} files) ---")
            logger.debug(f"Files in current batch: {[os.path.basename(p) for p in current_batch_paths]}")
            
            batch_tasks = []
            for filepath in current_batch_paths:
                logger.debug(f"Adding enrich_course_file task for: {filepath}")
                batch_tasks.append(self.enrich_course_file(filepath))
            
            logger.debug(f"Gathering {len(batch_tasks)} tasks for current batch.")
            await asyncio.gather(*batch_tasks)
            logger.info(f"Batch {batch_num}/{total_batches} file processing tasks completed.")

            if batch_num < total_batches:
                logger.info(f"\nBatch {batch_num} complete. Waiting {batch_delay} seconds before next batch to prevent rate limiting...")
                logger.debug(f"Delaying for {batch_delay} seconds.")
                await asyncio.sleep(batch_delay)
            else:
                logger.info(f"Last batch ({batch_num}/{total_batches}) completed. No further delay needed.")
        
        logger.info(f"\nFinished quiz generation for all {len(all_file_paths)} course files. Script execution complete.")
        logger.debug("enrich_all_courses finished.")


if __name__ == "__main__":
    logger.info("Script started.")
    quiz_gen = QuizGenerator()
    asyncio.run(quiz_gen.enrich_all_courses())
    logger.info("Script finished.")