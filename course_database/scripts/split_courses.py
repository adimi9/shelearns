import os
import json
import re

# Load the JSON file
with open("courses.json", "r", encoding="utf-8") as f:
    courses = json.load(f)

# Ensure the base directory exists
base_dir = "courses"
os.makedirs(base_dir, exist_ok=True)

def sanitize_filename(text):
    # Replace spaces and special characters with underscores
    return re.sub(r'\W+', '_', text.strip())

for course in courses:
    category = course.get("category", "Uncategorized")
    category_folder = sanitize_filename(category.lower())
    
    # Create the category folder inside /courses/
    full_category_path = os.path.join(base_dir, category_folder)
    os.makedirs(full_category_path, exist_ok=True)

    course_id = course.get("id", "unknown")
    course_name = course.get("name", "unnamed")
    file_name = f"{course_id}_{sanitize_filename(course_name)}.json"

    # Write the course JSON to the file
    file_path = os.path.join(full_category_path, file_name)
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(course, f, indent=2, ensure_ascii=False)

print("✅ All courses split successfully into categorized JSON files.")
