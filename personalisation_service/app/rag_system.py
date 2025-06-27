import os
import json
import re
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional
import openai
import numpy as np # Still imported, though not explicitly used in this snippet's core logic

# Relative imports from the same package
from .document_loader import DocumentLoader
from .embeddings_manager import EmbeddingsManager

class RAGSystem:
    """
    A Retrieval-Augmented Generation (RAG) system designed to create personalized
    learning roadmaps based on user questionnaire responses and a curated set of courses.
    """
    def __init__(self):
        """
        Initializes the RAGSystem by loading environment variables,
        setting up the document loader, embeddings manager, and OpenAI client.
        """
        load_dotenv()
        self.api_key = os.getenv('OPENAI_API_KEY')

        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable not found. Please set it in a .env file.")

        self.loader = DocumentLoader('data/documents')
        self.embeddings_manager = EmbeddingsManager(self.api_key)
        self.openai_client = openai.AsyncOpenAI(api_key=self.api_key)
        self.openai_model = "gpt-4o-2024-08-06" # Or "gpt-4o-mini" for cost-efficiency

    def _extract_questionnaire_json(self, full_prompt: str) -> Optional[Dict[str, Any]]:
        """
        Extracts and parses the JSON part of the questionnaire responses from the full prompt string.
        """
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

    def _extract_category_from_questionnaire(self, questionnaire_data: Dict[str, Any]) -> Optional[str]:
        """
        Extracts the primary learning category (interest) from the parsed questionnaire data.
        Assumes the primary interest is the first item in the list for the specific key.
        """
        interest_key = "What are you interested in learning?"
        if interest_key in questionnaire_data and isinstance(questionnaire_data[interest_key], list):
            if questionnaire_data[interest_key]:
                return str(questionnaire_data[interest_key][0])
        return None

    def _format_course_for_context(self, course_dict: Dict[str, Any]) -> str:
        """
        Formats a single course dictionary into a readable string for the LLM's context.
        Highlights important course details to help the LLM in its selection process.
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
            f"Key Topics: {topics}\n"
            f"Technologies: {primary_tech}\n"
            f"Target Levels: {levels}\n"
            f"Tags: {tags}\n"
            f"Description: This course covers topics like {topics}. It often involves {primary_tech}. "
            f"It's generally suitable for {levels} learners and falls under {category} development.\n"
            f"Recommended by system: {recommended_str}\n"
        )

    async def answer_question(self, question_prompt: str) -> str:
        """
        Generates a personalized learning roadmap based on the user's questionnaire
        and available course data. The output is a JSON string.
        """
        questionnaire_data = self._extract_questionnaire_json(question_prompt)
        if not questionnaire_data:
            print("Failed to parse questionnaire JSON from the prompt.")
            return json.dumps({
                "intro_paragraph": "I encountered an issue understanding your questionnaire. Please ensure it's in a valid JSON format.",
                "recommended_courses": [],
                # REMOVED "conclusion_paragraph"
            })

        category = self._extract_category_from_questionnaire(questionnaire_data)
        print(f"Extracted learning interest: {category}")
        if not category:
            print("Failed to determine primary learning interest from the questionnaire.")
            return json.dumps({
                "intro_paragraph": "It seems I couldn't pinpoint your primary learning interest. Please make sure the first question about your interest is clearly answered.",
                "recommended_courses": [],
                # REMOVED "conclusion_paragraph"
            })

        category_courses_data = self.loader.load_documents(category=category)
        if not category_courses_data:
            print(f"No course documents found for the category '{category}'.")
            return json.dumps({
                "intro_paragraph": f"Based on your interest in **{category}**, I currently don't have enough specific course data to build a detailed roadmap. However, I can still offer general guidance.",
                "recommended_courses": [],
                # REMOVED "conclusion_paragraph"
            })

        context_courses_list = [self._format_course_for_context(course) for course in category_courses_data]
        course_context = "\n\n--- Available Course for Consideration ---\n\n".join(context_courses_list)

        question_embedding = None
        try:
            question_embedding = (await self.embeddings_manager.create_embeddings([question_prompt]))[0]
        except Exception as e:
            print(f"Warning: Failed to create embedding for the question: {e}")

        # Construct the detailed prompt for the LLM
        system_message_content = (
            "You are an expert AI assistant specialized in generating personalized learning roadmaps based on user profiles "
            "and a curated list of available courses. Your task is to intelligently select the most relevant courses and "
            "structure them into a coherent, flat, ordered list in JSON format. Ensure strict adherence to the provided JSON schema. "
            "**Generate the 'intro_paragraph' using clear, concise language with appropriate "
            "markdown for emphasis (e.g., bolding or italics). Do NOT use markdown within the 'description' fields of individual courses.**"
        )

        user_message_content = f"""User's personalized questionnaire responses:
{question_prompt}

Available Courses for Consideration in {category} Development:
{course_context}

Based on the 'User's personalized questionnaire responses' and the 'Available Courses for Consideration' listed above, generate a personalized learning roadmap.

**Important Instructions for Roadmap Generation:**
1.  **Relevance is Key:** From the 'Available Courses for Consideration', identify and include **ONLY** the courses that are most relevant to the user's expressed interests, prior experience, motivation, and timeline.
2.  **Minimum and No Maximum:** You **must** recommend a **minimum of 5 courses**. There is **no upper limit** to the number of courses you can recommend if they are truly relevant and beneficial for the user's path.
3.  **Roadmap JSON Structure:** The entire roadmap **must** be a JSON object conforming strictly to the provided schema. It should contain an `intro_paragraph` and a `recommended_courses` array.
    **CRITICAL MARKDOWN RULE:** For `intro_paragraph` field, use markdown for emphasis. **ONLY USE THE FOLLOWING MARKDOWN SYNTAX:**
    * `## Heading`
    * `### Subheading`
    * `* list item`
    * `*italic*`
    * `**bold**`
    * `[link text](url)`
    **DO NOT USE ANY OTHER MARKDOWN SYNTAX (e.g., no numbered lists, no code blocks, no blockquotes, etc.). Output raw markdown.**
4.  **Course Details Accuracy:** Each object within the `recommended_courses` array **must** have:
    * `name`: Exactly matching a 'Course Name' from 'Available Courses for Consideration'. Do **NOT** invent course names.
    * `description`: Provide accurate and helpful descriptions, either directly from the provided context or reasonably inferred from its topics/technologies. Do **NOT** use markdown in this field.
5.  **Logical Order:** Present the courses within the `recommended_courses` array in a logical learning order, progressing from foundational to more advanced concepts. Do **NOT** group them into phases or any other hierarchical structure; keep it a flat list.
6.  **Introductory Paragraph Content:** The `intro_paragraph` **must be a single paragraph**. It should succinctly:
    * Acknowledge the user's primary learning interest/goal (e.g., "Based on your interest in X...").
    * Briefly state *why* these courses are recommended (e.g., "we've curated courses covering Y key areas...").
    * Set an expectation for the outcome (e.g., "By the end, you will be equipped with skills in Z.").
    * Incorporate relevant details from the questionnaire responses naturally.
Answer:"""

        try:
            response = await self.openai_client.chat.completions.create(
                model=self.openai_model,
                messages=[
                    {"role": "system", "content": system_message_content},
                    {"role": "user", "content": user_message_content}
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
                                    "minItems": 5
                                },
                            },
                            "required": ["intro_paragraph", "recommended_courses"],
                            "additionalProperties": False # This is correctly set to False
                        }
                    }
                }
            )

            raw_response_content = response.choices[0].message.content

            try:
                parsed_json = json.loads(raw_response_content)
                return json.dumps(parsed_json, indent=2)
        
            except json.JSONDecodeError as e:
                print(f"CRITICAL ERROR: LLM produced invalid JSON despite schema enforcement: {e}")
                print(f"Raw response content from LLM: '{raw_response_content}'")
                return json.dumps({
                    "intro_paragraph": "An internal processing error occurred: the AI's response was not in the expected format. We're working to fix this!",
                    "recommended_courses": [],
                })

        except openai.APIConnectionError as e:
            print(f"OpenAI API Connection Error: {e}")
            return json.dumps({
                "intro_paragraph": "I'm having trouble connecting to the learning modules right now. Please check your internet connection and try again.",
                "recommended_courses": [],
                # REMOVED "conclusion_paragraph"
            })
        except openai.RateLimitError as e:
            print(f"OpenAI API Rate Limit Exceeded: {e}")
            return json.dumps({
                "intro_paragraph": "It's a busy day for our learning assistant! We're experiencing high demand. Please try again in a few moments.",
                "recommended_courses": [],
                # REMOVED "conclusion_paragraph"
            })
        except openai.AuthenticationError as e:
            print(f"OpenAI API Authentication Error: {e}")
            return json.dumps({
                "intro_paragraph": "Oops! There's an authentication issue. It seems our access to the learning modules might be misconfigured. Please contact support.",
                "recommended_courses": [],
                # REMOVED "conclusion_paragraph"
            })
        except openai.APIStatusError as e:
            print(f"OpenAI API Status Error (HTTP {e.status_code}): {e.response}")
            return json.dumps({
                "intro_paragraph": f"An issue occurred with the learning module service (Error {e.status_code}). This might be a temporary problem.",
                "recommended_courses": [],
                # REMOVED "conclusion_paragraph"
            })
        except openai.OpenAIError as e:
            print(f"General OpenAI API Error: {e}")
            return json.dumps({
                "intro_paragraph": f"An unexpected error occurred while generating your roadmap from our learning modules: {e.args[0]}",
                "recommended_courses": [],
                # REMOVED "conclusion_paragraph"
            })
        except Exception as e:
            print(f"An unhandled internal error occurred: {e}")
            return json.dumps({
                "intro_paragraph": "An unexpected internal error occurred while generating your personalized roadmap. Our apologies!",
                "recommended_courses": [],
                # REMOVED "conclusion_paragraph"
            })