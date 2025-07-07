import json
from typing import Optional, Dict, Any

from models import QuestionnaireRequest

class InputParser:
    @staticmethod
    def validate_questionnaire_dict(data: QuestionnaireRequest) -> QuestionnaireRequest:
        """
        Validates a pre-parsed questionnaire dictionary.
        """
        if not data:
            print("Questionnaire dict is empty.")
            return None

        interest_key = "What are you interested in learning?"
        if interest_key not in data or not data[interest_key]:
            print(f"'{interest_key}' missing or empty in questionnaire.")
            return None

        return data

    @staticmethod
    def format_questionnaire_for_prompt(questionnaire_data: QuestionnaireRequest) -> str:
        """
        Formats the questionnaire dictionary into a readable list of question-answer pairs for prompt input.
        
        Args:
            questionnaire_data (Dict[str, Any]): Parsed questionnaire data.
        
        Returns:
            str: A string with each question and its answer on a separate line.
        """
        lines = []
        for question, answer in questionnaire_data.items():
            # Format answer nicely if it's a list
            if isinstance(answer, list):
                answer_str = ', '.join(str(a) for a in answer)
            else:
                answer_str = str(answer)
            lines.append(f"{question}: {answer_str}")
        return "\n".join(lines)
