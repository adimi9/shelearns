import json, os

def log(msg):
    print(msg)

def save_cache(cache, path="cache.json"):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(cache, f, indent=2, ensure_ascii=False)

def load_cache(path="cache.json"):
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return {}
