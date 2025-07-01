import requests, json, os

# 🔐 API keys
GOOGLE_API_KEY = "AIzaSyCfwIbVoQqkDNx8k3bMuYAQO78ashiEpTc"
GOOGLE_CX = "f6983e96d757b4250"

def google_search(query, num=3):
    """Run Google Custom Search."""
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
        print(f"❌ Google Search error: {query} — {e}")
        return []

def generate_resources(name):
    """Create docs, notes, and videos resource lists."""
    docs_query = f"{name} documentation site:developer.mozilla.org OR site:reactjs.org OR site:nodejs.org"
    notes_query = f"{name} tutorial site:w3schools.com OR site:geeksforgeeks.org OR site:freecodecamp.org"
    vids_query = f"{name} tutorial OR crash course site:youtube.com"

    return {
        "docs": google_search(docs_query, num=3),
        "notes": google_search(notes_query, num=5),
        "videos": google_search(vids_query, num=5)
    }

def enrich_alternatives(file_path):
    with open(file_path, encoding="utf-8") as f:
        course = json.load(f)

    updated = False
    for alt in course.get("alternatives", []):
        tech = alt.get("tech")
        if tech and "resources" not in alt:
            print(f"> Enriching alternative: {tech}")
            alt["resources"] = generate_resources(tech)
            updated = True

    if updated:
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(course, f, indent=2, ensure_ascii=False)
        print(f"✅ Updated {file_path}\n")
    else:
        print(f"🟡 No update needed: {file_path}")

def enrich_all(root="courses"):
    for rootdir, _, files in os.walk(root):
        for f in files:
            if f.endswith(".json"):
                enrich_alternatives(os.path.join(rootdir, f))

if __name__ == "__main__":
    enrich_all()
