import os
import json

ROOT_DIR = os.path.join(os.path.dirname(__file__), "final_vfinal_courses")

def assign_resource_order(items):
    for idx, item in enumerate(items, 1):
        item["resource_order"] = idx
    return items

def process_json_file(path):
    print(f"🔍 Processing: {path}")
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        changed = False

        for level in ["beginner", "intermediate", "advanced"]:
            level_resources = data.get("resources", {}).get(level, {})

            for key in ["notes", "docs", "videos"]:
                items = level_resources.get(key)
                if isinstance(items, list):
                    before = json.dumps(items, sort_keys=True)
                    assign_resource_order(items)
                    after = json.dumps(items, sort_keys=True)
                    if before != after:
                        changed = True

        if changed:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"✅ Updated: {path}")
        else:
            print(f"✅ No change: {path}")

    except Exception as e:
        print(f"❌ Error processing {path}: {e}")

def main():
    print(f"Scanning folder: {ROOT_DIR}")

    for root, _, files in os.walk(ROOT_DIR):
        print(f"Checking folder: {root}")
        for file in files:
            if file.endswith(".json"):
                print(f"Found JSON file: {file} in {root}")
                process_json_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
