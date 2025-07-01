import os
import json
import asyncio
from extract import smart_description, logger

# Update all resource links with descriptions in a course JSON file
async def enrich_course(file_path):
    logger.info(f"Processing {file_path}")
    with open(file_path, encoding="utf-8") as f:
        course = json.load(f)

    resources = course.get("resources", {})
    updated = False

    # For each resource type (docs, notes, videos)
    for res_type in ["docs", "notes", "videos"]:
        links = resources.get(res_type, [])
        if not links:
            continue

        new_links = []
        for entry in links:
            # Entry could be a string (URL) or dict with description
            if isinstance(entry, str):
                url = entry
                desc = None
            elif isinstance(entry, dict):
                url = entry.get("url") or entry.get("link") or None
                desc = entry.get("description")
                if not url:
                    new_links.append(entry)
                    continue
            else:
                new_links.append(entry)
                continue

            # Get fresh description, override existing
            description = await smart_description(url)
            if description:
                new_entry = {"url": url, "description": description}
                updated = True
            else:
                new_entry = {"url": url}
            new_links.append(new_entry)

        resources[res_type] = new_links

    if updated:
        course["resources"] = resources
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(course, f, indent=2, ensure_ascii=False)
        logger.info(f"Updated descriptions in {file_path}")
    else:
        logger.info(f"No updates made for {file_path}")

async def enrich_all(root="restructured_courses"):
    tasks = []
    for rootdir, _, files in os.walk(root):
        for filename in files:
            if filename.endswith(".json"):
                file_path = os.path.join(rootdir, filename)
                tasks.append(enrich_course(file_path))

    # Run with limited concurrency (adjust as needed)
    await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(enrich_all())
