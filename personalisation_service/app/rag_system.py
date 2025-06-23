import os
import json
import re
from dotenv import load_dotenv
from typing import List, Dict, Any, Union
import openai # For AsyncOpenAI client
import numpy as np

# Relative imports from the same package
from .document_loader import DocumentLoader
from .embeddings_manager import EmbeddingsManager
# Note: TextProcessor and RetrievalSystem are not directly used in RAGSystem.answer_question
# but are kept here as per original code structure if they were intended for future use.
# from .retrieval_system import RetrievalSystem
# from .text_processor import TextProcessor


class RAGSystem:
    def __init__(self):
        load_dotenv() # Load environment variables from .env file
        self.api_key = os.getenv('OPENAI_API_KEY')

        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables. Please set it in a .env file.")

        self.loader = DocumentLoader('data/documents')
        self.embeddings_manager = EmbeddingsManager(self.api_key)
        # Initialize the asynchronous OpenAI client for chat completions
        self.openai_client = openai.AsyncOpenAI(api_key=self.api_key)


    def _extract_questionnaire_json(self, full_prompt: str) -> Dict[str, Any] | None:
        """
        Extracts and parses the JSON part of the questionnaire responses from the full prompt string.
        """
        # Adjusted regex to be more robust, looking for a JSON object after "User's questionnaire responses:"
        match = re.search(r"User's questionnaire responses:\s*(\{.*?})\s*(?:$|\n)", full_prompt, re.DOTALL)
        if match:
            json_str = match.group(1)
            try:
                return json.loads(json_str)
            except json.JSONDecodeError as e:
                print(f"Error decoding JSON from prompt: {e}")
                return None
        print("No questionnaire JSON found in the prompt.")
        return None

    def _extract_category_from_questionnaire(self, questionnaire_data: Dict[str, Any]) -> str | None:
        """
        Extracts the 'category' (interest) from the parsed questionnaire data.
        """
        interest_key = "What are you interested in learning?"
        if interest_key in questionnaire_data and isinstance(questionnaire_data[interest_key], list):
            if questionnaire_data[interest_key]:
                # Assuming the first item in the list is the primary interest
                return str(questionnaire_data[interest_key][0])
        return None

    def _format_course_for_context(self, course_dict: Dict[str, Any]) -> str:
        """
        Formats a single course dictionary into a readable string for the LLM context.
        Customize this to highlight the most important course details for the LLM to select from.
        """
        name = course_dict.get('name', 'N/A')
        category = course_dict.get('category', 'N/A')
        topics = ', '.join(course_dict.get('topics', []))
        primary_tech = ', '.join(course_dict.get('primary_tech', []))
        levels = ', '.join(course_dict.get('levels', []))
        tags = ', '.join(course_dict.get('tags', []))
        recommended_str = "Yes" if course_dict.get('recommended', False) else "No"

        return (
            f"Course Name: {name}\n"
            f"Category: {category}\n"
            f"Key Topics Covered: {topics}\n"
            f"Primary Technologies Used: {primary_tech}\n"
            f"Target Levels: {levels}\n"
            f"Tags: {tags}\n"
            f"Recommended: {recommended_str}\n"
            f"Description: This course is designed to cover {topics}. It focuses on {primary_tech} "
            f"and is typically suitable for {levels} learners. This course is part of {category} development."
        )

    async def answer_question(self, question_prompt: str) -> str:
        """
        Generates a personalized learning roadmap based on the user's questionnaire and available courses.
        This method is now asynchronous.
        """
        # Step 1: Extract the JSON questionnaire data from the full prompt string
        questionnaire_data = self._extract_questionnaire_json(question_prompt)

        if not questionnaire_data:
            print("Error: Could not parse questionnaire JSON from the prompt. Cannot proceed.")
            return json.dumps({
                "intro_paragraph": "There was an error processing your questionnaire. Please ensure it's in a valid JSON format within the prompt.",
                "recommended_courses": [],
                "conclusion_paragraph": "Please refine your input and try again."
            })

        # Step 2: Extract the category from the parsed questionnaire data
        category = self._extract_category_from_questionnaire(questionnaire_data)
        print(f"Extracted category from prompt: {category}")

        if not category:
            print("Error: Could not determine your primary learning interest from the questionnaire. Cannot proceed.")
            return json.dumps({
                "intro_paragraph": "Could not determine your primary learning interest from the provided questionnaire. Please ensure the first question ('What are you interested in learning?') is answered clearly.",
                "recommended_courses": [],
                "conclusion_paragraph": "Please refine your input and try again."
            })

        # --- Step 3: Load ALL documents for the extracted category ---
        category_courses_data = self.loader.load_documents(category=category)

        if not category_courses_data:
            print(f"Warning: No course documents found for category '{category}'. Cannot generate detailed roadmap.")
            return json.dumps({
                "intro_paragraph": f"Based on your interest in '{category}', we couldn't find specific course data to build a detailed roadmap at this moment.",
                "recommended_courses": [],
                "conclusion_paragraph": "Please try another query or broaden your interests."
            })

        # --- Step 4: Format ALL loaded courses into a single context string ---
        context_courses_list = [self._format_course_for_context(course) for course in category_courses_data]
        context = "\n\n--- Available Course for Consideration ---\n\n".join(context_courses_list)

        # --- Step 5: Embed the question (optional, but good for LLM's understanding of user's query) ---
        try:
            # Await the asynchronous embedding creation
            question_embedding = (await self.embeddings_manager.create_embeddings([question_prompt]))[0]
        except Exception as e:
            print(f"Warning: Could not create embedding for question: {e}")
            # Decide if you want to abort or continue without embedding.
            # For this example, we'll continue.

        # Create the final prompt to send to OpenAI
        prompt = f"""User's personalized questionnaire responses:
{question_prompt}

Available Courses for Consideration in {category} Development:
{context}

Based on the 'User's personalized questionnaire responses' and the 'Available Courses for Consideration' listed above, generate a personalized learning roadmap.

**Important Instructions for Roadmap Generation:**
1.  **Relevant Courses Only:** From the 'Available Courses for Consideration', identify and include ONLY the courses that are most relevant to the user's expressed interests, prior experience, motivation, and timeline.
2.  **Minimum and No Maximum:** You must recommend a **minimum of 5 courses**. There is **no upper limit** to the number of courses you can recommend if they are relevant; include as many as you deem truly helpful for the user's path.
3.  **Roadmap Structure:** The roadmap must be a JSON object conforming strictly to the provided schema. It should contain an 'intro_paragraph', a 'recommended_courses' array, and a 'conclusion_paragraph'.
4.  **Course Details:** Each object within the 'recommended_courses' array must have a 'name' (exactly matching a 'Course Name' from 'Available Courses for Consideration') and a 'description'. Provide accurate and helpful descriptions, either directly from the provided context or reasonably inferred from its topics/technologies. Do not invent course names not present in the 'Available Courses for Consideration'.
5.  **Logical Order:** Present the courses within the 'recommended_courses' array in a logical learning order, from foundational to more advanced. Do NOT group them into phases or any other hierarchical structure.

Answer:"""

        try:
            # Await the asynchronous chat completion
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-2024-08-06",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert AI assistant specialized in generating personalized learning roadmaps based on user profiles and a curated list of available courses. Your task is to intelligently select the most relevant courses and structure them into a coherent, flat, ordered list in JSON format. Ensure strict adherence to the provided JSON schema."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "personalized_roadmap",
                        "strict": True,
                        "schema": {
                            "type": "object",
                            "properties": {
                                "intro_paragraph": { "type": "string" },
                                "recommended_courses": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "name": { "type": "string" },
                                            "description": { "type": "string" }
                                        },
                                        "required": ["name", "description"],
                                        "additionalProperties": False
                                    },
                                    "minItems": 5 # Ensure at least 5 courses are recommended
                                },
                                "conclusion_paragraph": { "type": "string" }
                            },
                            "required": ["intro_paragraph", "recommended_courses", "conclusion_paragraph"],
                            "additionalProperties": False
                        }
                    }
                }
            )

            raw_response_content = response.choices[0].message.content

            # --- Post-processing / Robust JSON Parsing ---
            try:
                parsed_json = json.loads(raw_response_content)
                # The 'strict' schema enforcement and JSONDecodeError handling below
                # largely cover issues like duplicate keys or malformed JSON.
                # No further explicit check for duplicate keys within `parsed_json` is typically needed
                # if json.loads succeeds and the schema is strict.

                return json.dumps(parsed_json) # Return valid, formatted JSON
            except json.JSONDecodeError as e:
                print(f"CRITICAL ERROR: LLM produced invalid JSON despite schema enforcement: {e}")
                print(f"Raw response content: {raw_response_content}")
                # Fallback to a structured error message if JSON parsing fails
                return json.dumps({
                    "intro_paragraph": "An internal error occurred while generating the roadmap due to an invalid response format from the AI. Please try again.",
                    "recommended_courses": [],
                    "conclusion_paragraph": "We apologize for the inconvenience."
                })
            except Exception as e:
                print(f"An unexpected error occurred during post-processing: {e}")
                return json.dumps({
                    "intro_paragraph": "An unexpected internal error occurred while processing the roadmap. Please try again.",
                    "recommended_courses": [],
                    "conclusion_paragraph": "We apologize for the inconvenience."
                })
        except openai.APIErrors.APIConnectionError as e:
            print(f"OpenAI API Connection Error: {e}")
            return json.dumps({
                "intro_paragraph": "The service could not connect to the OpenAI API. Please check your network connection or API key.",
                "recommended_courses": [],
                "conclusion_paragraph": "Please try again later."
            })
        except openai.APIErrors.RateLimitError as e:
            print(f"OpenAI API Rate Limit Exceeded: {e}")
            return json.dumps({
                "intro_paragraph": "Our service is currently experiencing high demand. Please try again in a few moments.",
                "recommended_courses": [],
                "conclusion_paragraph": "Thank you for your patience."
            })
        except openai.APIErrors.AuthenticationError as e:
            print(f"OpenAI API Authentication Error: {e}")
            return json.dumps({
                "intro_paragraph": "There was an issue with the API key provided to the service. Please contact support.",
                "recommended_courses": [],
                "conclusion_paragraph": "Error: Invalid API key."
            })
        except openai.APIErrors.OpenAIError as e:
            print(f"OpenAI API Error: {e}")
            return json.dumps({
                "intro_paragraph": f"An error occurred with the OpenAI API: {e.args[0]}",
                "recommended_courses": [],
                "conclusion_paragraph": "Please try again or contact support if the issue persists."
            })
        except Exception as e:
            print(f"An unexpected error occurred during API call or processing: {e}")
            return json.dumps({
                "intro_paragraph": "An unexpected internal error occurred while generating the roadmap. Please try again.",
                "recommended_courses": [],
                "conclusion_paragraph": "We apologize for the inconvenience."
            })