import json
from typing import Dict, Any

class CourseParser:
    @staticmethod
    def format_course_for_context(course_dict: Dict[str, Any]) -> str:
        """
        Formats a course dictionary into a human-readable string for context in prompts.

        Args:
            course_dict (Dict[str, Any]): Course data containing id, name, category, topics, primary_tech, tags.

        Returns:
            str: A formatted multi-line string describing the course.
        """
        course_id = course_dict.get('id', 'N/A')
        name = course_dict.get('name', 'N/A')
        category = course_dict.get('category', 'N/A')
        topics = ', '.join(course_dict.get('topics', []))
        primary_tech_raw = course_dict.get('primary_tech', [])
        primary_tech = ', '.join(primary_tech_raw if isinstance(primary_tech_raw, list) else [primary_tech_raw])
        tags = ', '.join(course_dict.get('tags', []))

        return (
            f"ID: {course_id}\n"
            f"Course Name: {name}\n"
            f"Category: {category}\n"
            f"Key Topics: {topics}\n"
            f"Technologies: {primary_tech}\n"
            f"Tags: {tags}\n"
            f"Description: This course covers topics like {topics}. It often involves {primary_tech}. "
        )
