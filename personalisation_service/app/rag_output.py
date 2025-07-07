import os
import json
from typing import Dict, Optional
from dotenv import load_dotenv
import openai

from .document_loader import DocumentLoader
from .embeddings_manager import EmbeddingsManager
from .input_handler.input_parser import InputParser
from .input_handler.course_parser import CourseParser

# logging
import logging

logger = logging.getLogger(__name__)

class RAGSystem:
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv('OPENAI_API_KEY')

        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable not found. Please set it in a .env file.")

        self.loader = DocumentLoader('data/documents')
        self.embeddings_manager = EmbeddingsManager(self.api_key)
        self.openai_client = openai.AsyncOpenAI(api_key=self.api_key)
        self.openai_model = "gpt-4o-2024-08-06"

    async def answer_question(self, questionnaire_data: Dict) -> str:
        validated = InputParser.validate_questionnaire_dict(questionnaire_data)
        if not validated:
            return self._error_response("Invalid questionnaire")

        category = questionnaire_data["What are you interested in learning?"]
        logger.info(f"Extracted learning interest: {category}")

        category_courses = self.loader.load_documents(category=category)
        if not category_courses:
            logger.info(f"No course documents found for category '{category}'.")
            return self._error_response(f"Based on your interest in **{category}**, I currently don't have enough specific course data to build a detailed roadmap.")

        course_context = self._format_courses_context(category_courses)
        formatted_questionnaire = InputParser.format_questionnaire_for_prompt(questionnaire_data)
        system_message = self._get_system_message()
        user_message = self._get_user_message(formatted_questionnaire, course_context, category)

        try:
            response = await self.openai_client.chat.completions.create(
                model=self.openai_model,
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": user_message},
                ],
                response_format=self._get_response_format()
            )
            return self._parse_response(response)

        except openai.OpenAIError as e:
            return self._handle_openai_error(e)

    def _error_response(self, intro: str) -> str:
        return json.dumps({
            "intro_paragraph": intro,
            "recommended_courses": []
        })


    def _format_courses_context(self, courses: list) -> str:
        course_strs = [CourseParser.format_course_for_context(c) for c in courses]
        return "\n\n--- Available Course for Consideration ---\n\n".join(course_strs)


    def _get_system_message(self) -> str:
        return (
            "You are an expert AI assistant specialized in generating personalized learning roadmaps based on user profiles "
            "and a curated list of available courses. Your task is to intelligently select the most relevant courses and "
            "structure them into a coherent, flat, ordered list in JSON format. Ensure strict adherence to the provided JSON schema. "
            "**Generate the 'intro_paragraph' using clear, concise language with appropriate "
            "markdown for emphasis (e.g., bolding or italics). Do NOT use markdown within the 'description' fields of individual courses.**"
        )


    def _get_user_message(self, questionnaire: str, course_context: str, category: str) -> str:
        return f"""User's personalized questionnaire responses:
                {questionnaire}

                Available Courses for Consideration in {category} Development:
                {course_context}

                Based on the 'User's personalized questionnaire responses' and the 'Available Courses for Consideration' listed above, generate a personalized learning roadmap.

                1. Relevance is Key: From the 'Available Courses for Consideration', identify and include ONLY the courses that are most relevant to the user's expressed interests, prior experience, motivation, and timeline.
                2. Minimum and No Maximum: You must recommend a minimum of 10 courses. There is no upper limit to the number of courses you can recommend if they are truly relevant and beneficial for the user's path.
                3. Roadmap JSON Structure: The entire roadmap must be a JSON object conforming strictly to the provided schema. It should contain an intro_paragraph and a recommended_courses array.
                    DO NOT USE ANY OTHER MARKDOWN SYNTAX (e.g., no numbered lists, no code blocks, no blockquotes, etc.). Output raw markdown.
                4.  Course Details Accuracy: Each object within the `recommended_courses` array must have:
                    * `id`: Exactly match the ID from the corresponding 'Available Course for Consideration'. 
                    * `name`: Exactly matching a 'Course Name' from 'Available Courses for Consideration'. Do NOT invent course names.
                    * `description`: Provide accurate and helpful descriptions, either directly from the provided context or reasonably inferred from its topics/technologies. Do NOT use markdown in this field.
                5.  Logical Order: Present the courses within the `recommended_courses` array in a logical learning order, progressing from foundational to more advanced concepts. Do NOT group them into phases or any other hierarchical structure; keep it a flat list.
                6.  Introductory Paragraph Content: The `intro_paragraph` must be a single paragraph. It should succinctly:
                    * Acknowledge the user's primary learning interest/goal (e.g., "Based on your interest in X...").
                    * Briefly state why these courses are recommended (e.g., "we've curated courses covering Y key areas...").
                    * Set an expectation for the outcome (e.g., "By the end, you will be equipped with skills in Z.").
                    * Incorporate relevant details from the questionnaire responses naturally.
                Answer:
                """


    def _get_response_format(self) -> dict:
        return {
            "type": "json_schema",
            "json_schema": {
                "name": "personalized_roadmap",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "intro_paragraph": {"type": "string"},
                        "recommended_courses": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "id": {"type": "string"},
                                    "name": {"type": "string"},
                                    "description": {"type": "string"},
                                },
                                "required": ["id", "name", "description"],
                                "additionalProperties": False,
                            },
                            "minItems": 10,
                        },
                    },
                    "required": ["intro_paragraph", "recommended_courses"],
                    "additionalProperties": False,
                },
            },
        }


    def _parse_response(self, response) -> str:
        raw = response.choices[0].message.content
        try:
            parsed = json.loads(raw)
            return json.dumps(parsed, indent=2)
        except json.JSONDecodeError as e:
            logger.error(f"LLM invalid JSON despite schema enforcement: {e}")
            logger.error(f"Raw response: '{raw}'")
            return self._error_response("An internal processing error occurred: the AI's response was not in the expected format. We're working to fix this!")


    def _handle_openai_error(self, error) -> str:
        if isinstance(error, openai.APIConnectionError):
            logger.error(f"OpenAI API Connection Error: {error}")
            return self._error_response("I'm having trouble connecting to the learning modules right now. Please check your internet connection and try again.")
        elif isinstance(error, openai.RateLimitError):
            logger.error(f"OpenAI API Rate Limit Exceeded: {error}")
            return self._error_response("It's a busy day for our learning assistant! We're experiencing high demand. Please try again in a few moments.")
        elif isinstance(error, openai.AuthenticationError):
            logger.error(f"OpenAI API Authentication Error: {error}")
            return self._error_response("Oops! There's an authentication issue. It seems our access to the learning modules might be misconfigured. Please contact support.")
        elif isinstance(error, openai.APIStatusError):
            logger.error(f"OpenAI API Status Error (HTTP {error.status_code}): {error.response}")
            return self._error_response(f"An issue occurred with the learning module service (Error {error.status_code}). This might be a temporary problem.")
        else:
            logger.error(f"General OpenAI API Error: {error}")
            return self._error_response("An unexpected error occurred while processing your request. Please try again later.")
            
