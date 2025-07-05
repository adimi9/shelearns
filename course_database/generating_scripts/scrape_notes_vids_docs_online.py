import requests, json, os, random, time
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_CX = os.getenv("GOOGLE_CX")

EXCLUDED_SITES = [
    "medium.com",
    "quora.com",
    "reddit.com",
    "dev.to",
    "hashnode.com"
]

def build_query(base_query):
    exclusions = " ".join([f"-site:{site}" for site in EXCLUDED_SITES])
    return f"{base_query} {exclusions}"

def google_search(query, num=5, delay=2, retries=3):
    if not GOOGLE_API_KEY or not GOOGLE_CX:
        print("❌ Google API keys are not set.")
        return []

    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "q": query,
        "key": GOOGLE_API_KEY,
        "cx": GOOGLE_CX,
        "num": num
    }

    attempt = 0
    while attempt < retries:
        try:
            time.sleep(delay)
            res = requests.get(url, params=params)
            data = res.json()

            if "items" in data:
                return [item["link"] for item in data["items"]]
            elif "error" in data:
                print(f"⚠️ API Error: {data['error'].get('message', 'Unknown error')} (attempt {attempt + 1})")
        except Exception as e:
            print(f"❌ Exception during search: {e} (attempt {attempt + 1})")

        attempt += 1
        time.sleep(delay * (2 ** attempt))

    print(f"❌ Failed: {query}")
    return []

def enrich_course(file_path):
    with open(file_path, encoding="utf-8") as f:
        course = json.load(f)

    name = course.get("name")
    print(f"> Enriching: {name}")

    course.setdefault("resources", {})

    for level in ["beginner", "intermediate", "advanced"]:
        course["resources"].setdefault(level, {})

        level_modifier = {
            "beginner": "for beginners OR basics OR introduction",
            "intermediate": "for intermediates OR use cases OR workflows",
            "advanced": "advanced OR deep dive OR expert guide OR internals"
        }[level]

        # Docs
        docs_count = random.randint(3, 5)
        docs_query = build_query(f"{name} documentation OR official docs OR API reference {level_modifier}")
        docs = google_search(docs_query, num=docs_count)
        course["resources"][level]["docs"] = docs
        print(f"  [{level}] {'✅' if docs else '⚠️'} Docs: {len(docs)}")

        # Notes
        notes_count = random.randint(5, 7)
        notes_query = build_query(f"{name} tutorial OR notes {level_modifier}")
        notes = google_search(notes_query, num=notes_count)
        course["resources"][level]["notes"] = notes
        print(f"  [{level}] {'✅' if notes else '⚠️'} Notes: {len(notes)}")

        # Videos
        videos_count = random.randint(8, 10)
        vids_query = build_query(f"{name} tutorial OR course {level_modifier} site:youtube.com")
        videos = google_search(vids_query, num=videos_count)
        course["resources"][level]["videos"] = videos
        print(f"  [{level}] {'✅' if videos else '⚠️'} Videos: {len(videos)}")

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(course, f, indent=2, ensure_ascii=False)

    print(f"✅ Saved: {file_path}\n")

ROOT_DIR = os.path.join(os.path.dirname(__file__), "..", "restructured_courses")

def enrich_all(root=ROOT_DIR):
    if not GOOGLE_API_KEY or not GOOGLE_CX:
        print("❗ Missing Google API keys. Set them in .env.")
        return

    print(f"\n🚀 Starting enrichment in '{root}'...\n")
    for rootdir, _, files in os.walk(root):
        for f in files:
            if f.endswith(".json"):
                file_path = os.path.join(rootdir, f)
                enrich_course(file_path)
    print("✅ All files processed.\n")

if __name__ == "__main__":
    enrich_all()
