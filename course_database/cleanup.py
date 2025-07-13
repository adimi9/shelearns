import os
import shutil
import json # Import json to potentially validate files, though not strictly required for copying

def synchronize_json_files(source_dir="final_v3_courses/", destination_dir="final_vfinal_courses/"):
    """
    Synchronizes JSON files from a source directory to a destination directory.
    If a JSON file exists in the source but not in the destination (maintaining
    relative path), it will be copied to the destination.

    Args:
        source_dir (str): The path to the source directory (e.g., "final_v3_courses/").
        destination_dir (str): The path to the destination directory (e.g., "final_vfinal_courses/").
    """
    print(f"Starting synchronization from '{source_dir}' to '{destination_dir}'...")
    files_copied = 0
    files_skipped_exist = 0
    files_skipped_error = 0

    # Ensure source directory exists
    if not os.path.isdir(source_dir):
        print(f"Error: Source directory '{source_dir}' does not exist.")
        return

    # Walk through the source directory
    for root, dirs, files in os.walk(source_dir):
        for file_name in files:
            if file_name.endswith(".json"):
                source_file_path = os.path.join(root, file_name)

                # Get the relative path from the source_dir
                # e.g., if source_dir is 'final_v3_courses/' and root is 'final_v3_courses/subfolder1',
                # rel_path will be 'subfolder1/file.json'
                relative_path = os.path.relpath(source_file_path, source_dir)

                # Construct the full destination path
                destination_file_path = os.path.join(destination_dir, relative_path)
                destination_folder = os.path.dirname(destination_file_path)

                # Check if the file already exists in the destination
                if os.path.exists(destination_file_path):
                    # print(f"Skipping '{relative_path}': Already exists in destination.")
                    files_skipped_exist += 1
                else:
                    try:
                        # Create destination directory if it doesn't exist
                        os.makedirs(destination_folder, exist_ok=True)

                        # Copy the file
                        shutil.copy2(source_file_path, destination_file_path)
                        print(f"Copied: '{relative_path}' to '{destination_folder}'")
                        files_copied += 1
                    except Exception as e:
                        print(f"Error copying '{relative_path}': {e}")
                        files_skipped_error += 1

    print("\nSynchronization complete.")
    print(f"Total files copied: {files_copied}")
    print(f"Total files skipped (already exist): {files_skipped_exist}")
    print(f"Total files skipped (with errors): {files_skipped_error}")

# --- How to Run ---
# 1. Save this code as a Python file (e.g., `sync_courses.py`).
# 2. Place `sync_courses.py` in the same parent directory as `final_v3_courses/`
#    and `final_vfinal_courses/`.
# 3. Open your terminal or command prompt.
# 4. Navigate to the directory where you saved `sync_courses.py`.
# 5. Run the script:
#    python sync_courses.py

# Example usage (uncomment to run when the script is executed):
synchronize_json_files()
