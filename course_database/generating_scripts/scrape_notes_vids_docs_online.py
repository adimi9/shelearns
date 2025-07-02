import requests, json, os
import re # Import re for the file matching
from dotenv import load_dotenv # Assuming you still want to load .env for API keys

# Load environment variables from .env file
load_dotenv()

# 🎯 Add your (mock/test) API keys here
# These should ideally come from environment variables for security
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_CX = os.getenv("GOOGLE_CX")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

def google_search(query, num=3):
    """Generic search using Google Custom Search."""
    if not GOOGLE_API_KEY or not GOOGLE_CX:
        print("❌ Google API keys (GOOGLE_API_KEY or GOOGLE_CX) are not set. Cannot perform search.")
        return []

    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "q": query,
        "key": GOOGLE_API_KEY,
        "cx": GOOGLE_CX,
        "num": num
    }
    try:
        res = requests.get(url, params=params).json()
        return [i["link"] for i in res.get("items", [])]
    except Exception as e:
        print(f"❌ Google Search error for query: {query} — {e}")
        return []

def enrich_course(file_path):
    with open(file_path, encoding="utf-8") as f:
        course = json.load(f)

    name = course.get("name")
    print(f"> Processing resources for: {name}")

    # Ensure 'resources' dictionary exists
    course.setdefault("resources", {})
    # Ensure 'docs', 'notes', 'videos' lists exist within 'resources'
    course["resources"].setdefault("docs", [])
    course["resources"].setdefault("notes", [])
    course["resources"].setdefault("videos", [])

    # Only fetch if the list is empty
    if not course["resources"]["docs"]:
        docs_query = f"{name} documentation OR official docs OR API reference"
        docs = google_search(docs_query, num=3)[:3]
        course["resources"]["docs"] = docs
        if docs:
            print(f"  ✅ Docs updated for {name}")
        else:
            print(f"  ⚠️ No docs found for {name}")
    else:
        print(f"  ➡️ Docs already present for {name}. Skipping.")

    if not course["resources"]["notes"]:
        notes_query = f"{name} tutorial OR guide OR notes OR how-to"
        notes = google_search(notes_query, num=5)[:5]
        course["resources"]["notes"] = notes
        if notes:
            print(f"  ✅ Notes updated for {name}")
        else:
            print(f"  ⚠️ No notes found for {name}")
    else:
        print(f"  ➡️ Notes already present for {name}. Skipping.")

    if not course["resources"]["videos"]:
        # Corrected YouTube search query to be more effective with Google Custom Search
        # The original `site:youtube.com` is not a valid public domain for search.
        # A more common way to search YouTube via Google Search is to just include "youtube" in the query
        # or specify "site:youtube.com" if you have a specific YouTube API key for direct YouTube searches.
        # For general Google Search, just including "youtube" or "video" in the query is often sufficient.
        # If you want to use the YouTube Data API, you'd integrate the `youtube` tool here.
        vids_query = f"{name} tutorial OR crash course youtube"
        videos = google_search(vids_query, num=5)[:5]
        course["resources"]["videos"] = videos
        if videos:
            print(f"  ✅ Videos updated for {name}")
        else:
            print(f"  ⚠️ No videos found for {name}")
    else:
        print(f"  ➡️ Videos already present for {name}. Skipping.")

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(course, f, indent=2, ensure_ascii=False)

    print(f"✅ Updated {file_path}\n")

def enrich_all(root="restructured_courses"):
    """
    Loops through all subfolders in the root directory and processes JSON files.
    """
    if not GOOGLE_API_KEY or not GOOGLE_CX:
        print("\nWARNING: Google API keys (GOOGLE_API_KEY, GOOGLE_CX) are not set as environment variables.")
        print("Please set them in your .env file to enable resource enrichment.")
        return

    print(f"\nStarting resource enrichment for files in '{root}'...")
    for rootdir, _, files in os.walk(root):
        for f in files:
            if f.endswith(".json"):
                file_path = os.path.join(rootdir, f)
                enrich_course(file_path)
    print("\nResource enrichment complete.")

if __name__ == "__main__":
    enrich_all()