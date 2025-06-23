import os
import json
from typing import List, Dict

class DocumentLoader:
    def __init__(self, documents_path: str):
        self.documents_path = documents_path

    def load_documents(self, category: str = None) -> List[Dict]:
        documents = []
        # Ensure the documents path exists
        if not os.path.exists(self.documents_path):
            print(f"Warning: Documents path '{self.documents_path}' does not exist.")
            return []

        for filename in os.listdir(self.documents_path):
            if filename.endswith('.json'):
                filepath = os.path.join(self.documents_path, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as file:
                        data = json.load(file)
                        if isinstance(data, list):  # Check if the JSON is a list of courses
                            for course in data:
                                if category is None or (course.get('category') and course['category'].lower() == category.lower()):
                                    documents.append(course)
                        elif isinstance(data, dict): # Handle a single course object if present
                            if category is None or (data.get('category') and data['category'].lower() == category.lower()):
                                documents.append(data)
                except json.JSONDecodeError as e:
                    print(f"Error decoding JSON from {filepath}: {e}")
                except Exception as e:
                    print(f"An unexpected error occurred while reading {filepath}: {e}")
        return documents