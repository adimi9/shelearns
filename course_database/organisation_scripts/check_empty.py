import os
import json

ROOT_DIR = os.path.join(os.path.dirname(__file__), "..", "restructured_courses")

def check_empty_resources(root=ROOT_DIR):
    print(f"🔍 Checking resources in: {root}\n")
    issues_found = False

    for rootdir, _, files in os.walk(root):
        for file in files:
            if file.endswith(".json"):
                path = os.path.join(rootdir, file)
                with open(path, encoding="utf-8") as f:
                    data = json.load(f)

                course_id = data.get("id", "UNKNOWN")
                name = data.get("name", "Unnamed Course")
                resources = data.get("resources", {})

                for section in ["docs", "notes", "videos"]:
                    if section not in resources or not resources[section]:
                        print(f"⚠️  {course_id} — {name}: Missing or empty top-level '{section}'")
                        issues_found = True

                for level in ["beginner", "intermediate", "advanced"]:
                    if level not in resources:
                        print(f"⚠️  {course_id} — {name}: Missing '{level}' section")
                        issues_found = True
                        continue

                    for section in ["docs", "notes", "videos"]:
                        if section not in resources[level] or not resources[level][section]:
                            print(f"⚠️  {course_id} — {name}: Missing or empty '{level}.{section}'")
                            issues_found = True

    if not issues_found:
        print("✅ All resources look good!\n")

if __name__ == "__main__":
    check_empty_resources()
