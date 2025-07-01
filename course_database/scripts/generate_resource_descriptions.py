import os
import json
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm

def get_meta_description(url):
    try:
        response = requests.get(url, timeout=5, headers={"User-Agent": "Mozilla/5.0"})
        soup = BeautifulSoup(response.text, 'html.parser')

        # Try standard meta description
        description = soup.find('meta', attrs={'name': 'description'})
        if description and description.get("content") and len(description['content'].strip()) > 50:
            return description['content'].strip()

        # Try Open Graph description
        og_desc = soup.find('meta', attrs={'property': 'og:description'})
        if og_desc and og_desc.get("content") and len(og_desc['content'].strip()) > 50:
            return og_desc['content'].strip()

        # Fallback: use first paragraph if meta descriptions are too short
        first_p = soup.find('p')
        if first_p:
            text = first_p.get_text().strip()
            if len(text) > 50:
                return text

        return "No useful description found."
    except Exception:
        return "No description found."


def structure_links_with_descriptions(links):
    result = []
    for url in tqdm(links):
        desc = get_meta_description(url)
        result.append({
            "url": url,
            "description": desc
        })
    return result

def process_file(file_path):
    with open(file_path, encoding="utf-8") as f:
        course = json.load(f)

    changed = False
    for res_type in ["docs", "notes", "videos"]:
        resources = course.get("resources", {}).get(res_type, [])
        # Skip if already processed into dict format
        if resources and isinstance(resources[0], dict):
            print(f"🔁 Overriding {res_type} descriptions in {file_path}")
            urls = [item["url"] for item in resources if isinstance(item, dict) and "url" in item]
            course["resources"][res_type] = structure_links_with_descriptions(urls)
            changed = True
        if resources:
            print(f"🔍 Processing {res_type} in {file_path}")
            structured = structure_links_with_descriptions(resources)
            course["resources"][res_type] = structured
            changed = True

    if changed:
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(course, f, indent=2, ensure_ascii=False)
        print(f"✅ Updated: {file_path}")
    else:
        print(f"➡️ Skipped (already structured): {file_path}")

def process_all_jsons(root="restructured_courses"):
    print(f"\n🚀 Starting to process JSON files in: {root}\n")
    for rootdir, _, files in os.walk(root):
        for fname in files:
            if fname.endswith(".json"):
                fpath = os.path.join(rootdir, fname)
                process_file(fpath)
    print("\n✅ All files processed.")

if __name__ == "__main__":
    process_all_jsons()
