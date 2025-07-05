import os
import json
import re
from pathlib import Path
from dotenv import load_dotenv
import requests
from isodate import parse_duration
from datetime import datetime

# Load API key from .env
load_dotenv()
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

INPUT_DIR = Path(__file__).parent.parent / "final_final_courses"
OUTPUT_DIR = Path(__file__).parent.parent / "final_v3_courses"
LOG_FILE = Path(__file__).parent / "yt_metadata.log"

def log(message):
    timestamp = datetime.now().strftime("[%Y-%m-%d %H:%M:%S]")
    print(f"{timestamp} {message}")
    with open(LOG_FILE, "a", encoding="utf-8") as logf:
        logf.write(f"{timestamp} {message}\n")

def extract_video_id(url):
    match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11})", url)
    return match.group(1) if match else None

def fetch_metadata(url):
    video_id = extract_video_id(url)
    if not video_id:
        log(f"[!] Invalid or non-video URL: {url}")
        return {"url": url}

    api_url = (
        f"https://www.googleapis.com/youtube/v3/videos"
        f"?part=snippet,contentDetails&id={video_id}&key={YOUTUBE_API_KEY}"
    )
    response = requests.get(api_url)
    if response.status_code != 200:
        log(f"[!] API error for {url}: {response.status_code} - {response.text}")
        return {"url": url}

    data = response.json()
    items = data.get("items", [])
    if not items:
        log(f"[!] No metadata found for: {url}")
        return {"url": url}

    snippet = items[0]["snippet"]
    duration = parse_duration(items[0]["contentDetails"]["duration"])
    duration_min = int(duration.total_seconds() // 60)

    log(f"[✓] Fetched metadata: {url} → '{snippet['title']}', {duration_min}m")
    return {
        "url": url,
        "title": snippet["title"],
        "duration": f"{duration_min}m"
    }

def process_course_file(json_path):
    rel_path = json_path.relative_to(INPUT_DIR)
    output_path = OUTPUT_DIR / rel_path
    output_path.parent.mkdir(parents=True, exist_ok=True)

    log(f"Processing file: {rel_path}")

    updated = False

    try:
        with open(json_path, "r", encoding="utf-8") as f:
            course_data = json.load(f)
    except Exception as e:
        log(f"[!] Failed to load JSON: {rel_path} — {e}")
        return

    for level in course_data.get("resources", {}):
        for resource_type, resources in course_data["resources"][level].items():
            for i, item in enumerate(resources):
                if isinstance(item, str):  # for bare URLs in 'videos'
                    url = item
                    if "youtube.com" in url or "youtu.be" in url:
                        metadata = fetch_metadata(url)
                        # convert bare URL into metadata dict
                        course_data["resources"][level][resource_type][i] = metadata
                        updated = True
                elif isinstance(item, dict):
                    url = item.get("url", "")
                    log(f"Found URL: {url} → title: {item.get('title')} | description: {item.get('description')}")
                    if "youtube.com" in url or "youtu.be" in url:
                        if "title" in item and "duration" in item:
                            continue
                        metadata = fetch_metadata(url)
                        item.update(metadata)
                        updated = True

    if updated:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(course_data, f, indent=2, ensure_ascii=False)
        log(f"[✓] Updated and saved: {output_path.relative_to(OUTPUT_DIR)}")
    else:
        log(f"[→] No updates needed: {rel_path}")

def main():
    log("===== Start Processing =====")
    for json_path in INPUT_DIR.rglob("*.json"):
        process_course_file(json_path)
    log("===== Done =====")

if __name__ == "__main__":
    main()
