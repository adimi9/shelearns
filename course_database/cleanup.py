import os
import json

def is_youtube_link(url):
    return "youtube.com" in url or "youtu.be" in url

def clean_notes_docs_and_save(src_path, dst_path):
    with open(src_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    modified = False
    levels = ["beginner", "intermediate", "advanced"]

    for level in levels:
        if level in data.get("resources", {}):
            for section in ["notes", "docs"]:
                original = data["resources"][level].get(section, [])
                filtered = [item for item in original if not is_youtube_link(item.get("url", ""))]

                if len(filtered) != len(original):
                    data["resources"][level][section] = filtered
                    modified = True

    # Ensure the destination directory exists
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)

    # Save cleaned version (even if unmodified, to preserve full copy structure)
    with open(dst_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

    if modified:
        print(f"Cleaned and saved: {dst_path}")
    else:
        print(f"No change (copied): {dst_path}")

def process_all_jsons(src_root, dst_root):
    for root, _, files in os.walk(src_root):
        for file in files:
            if file.endswith(".json"):
                rel_path = os.path.relpath(root, src_root)
                src_file = os.path.join(root, file)
                dst_file = os.path.join(dst_root, rel_path, file)
                clean_notes_docs_and_save(src_file, dst_file)

# Run the function
process_all_jsons("final_vfinal", "final_vfinal_courses")
