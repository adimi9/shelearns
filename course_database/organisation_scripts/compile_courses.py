import os
import json

# Directory containing the 7 subfolders
BASE_DIR = os.path.join("..", "restructured_courses")

# Fields to extract
DESIRED_KEYS = {
    "id",
    "name",
    "category",
    "primary_tech",
    "topics",
    "recommended",
    "tags"
}

compiled_courses = []

# Traverse all subdirectories and process JSON files
for root, _, files in os.walk(BASE_DIR):
    for file in files:
        if file.endswith(".json"):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    # Extract only desired fields
                    filtered = {key: data[key] for key in DESIRED_KEYS if key in data}
                    compiled_courses.append(filtered)
            except Exception as e:
                print(f"Failed to process {file_path}: {e}")

# Output file
output_path = os.path.join(BASE_DIR, "restructured_courses.json")

# Write the final JSON array
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(compiled_courses, f, indent=2)

print(f"✅ Compiled {len(compiled_courses)} courses into {output_path}")
