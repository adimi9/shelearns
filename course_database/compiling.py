import os
import json

def process_course_data(input_directory="final_vfinal_courses/", output_file="final_output.json"):
    """
    Processes JSON files from subfolders within a given directory, extracts relevant data,
    and consolidates it into a single JSON file.

    Args:
        input_directory (str): The path to the directory containing subfolders with JSON files.
        output_file (str): The name of the output JSON file.
    """
    all_courses_data = []

    # Walk through the input directory
    for root, dirs, files in os.walk(input_directory):
        for file in files:
            if file.endswith(".json"):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        course_data = json.load(f)

                    # Extract relevant fields according to the desired schema
                    extracted_data = {
                        "primary_tech": course_data.get("primary_tech"),
                        "category": course_data.get("category"),
                        "topics": course_data.get("topics", []),
                        "tags": course_data.get("tags", []),
                        "name": course_data.get("name"),
                        "id": course_data.get("id"),
                        "recommended": course_data.get("recommended")
                    }
                    all_courses_data.append(extracted_data)

                except json.JSONDecodeError:
                    print(f"Error: Could not decode JSON from {file_path}. Skipping.")
                except FileNotFoundError:
                    print(f"Error: File not found at {file_path}. Skipping.")
                except Exception as e:
                    print(f"An unexpected error occurred while processing {file_path}: {e}")

    # Write the consolidated data to the output JSON file
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_courses_data, f, indent=2, ensure_ascii=False)
        print(f"Successfully processed {len(all_courses_data)} course files and saved to {output_file}")
    except Exception as e:
        print(f"Error writing to output file {output_file}: {e}")

# To run the script, save the code above as a .py file (e.g., `process_json.py`)
# and then execute it from your terminal.
# Ensure your 'final_vfinal_courses/' directory is in the same location as the script,
# or provide the full path to the directory.

# Example usage:
process_course_data()
# If your directory is elsewhere, specify the path:
# process_course_data(input_directory="/path/to/your/final_vfinal_courses/")