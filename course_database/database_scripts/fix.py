import os
import json

# Directory containing the 7 subfolders
BASE_DIR = os.path.join("..", "restructured_courses")

# Traverse all subdirectories and process JSON files
for root, _, files in os.walk(BASE_DIR):
    for file in files:
        if file.endswith(".json"):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)

                # If "resources" exists, preserve only level-specific keys
                if "resources" in data:
                    level_resources = {}
                    for level in ("beginner", "intermediate", "advanced"):
                        if level in data["resources"]:
                            level_resources[level] = data["resources"][level]
                    
                    if level_resources:
                        data["resources"] = level_resources
                    else:
                        del data["resources"]

                # Overwrite the file with modified content
                with open(file_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2)

                print(f"✅ Cleaned {file_path}")

            except Exception as e:
                print(f"❌ Failed to process {file_path}: {e}")
