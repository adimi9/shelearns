import os
import json
import time
from pathlib import Path
from urllib.parse import urlparse
from datetime import datetime
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

# Get root directory (one level up from where script is)
ROOT_DIR = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT_DIR / 'final_courses'
DEST_DIR = ROOT_DIR / 'final_final_courses'
CACHE_PATH = ROOT_DIR / ".cache.json"
ERROR_LOG_PATH = ROOT_DIR / "errors.log"

# Config
MAX_RETRIES = 3
TIMEOUT_MS = 20_000  # 20 seconds

# ANSI Colors
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
RESET = "\033[0m"

def is_youtube_link(url):
    parsed = urlparse(url)
    return "youtube.com" in parsed.netloc or "youtu.be" in parsed.netloc

def log_error(message):
    with open(ERROR_LOG_PATH, 'a', encoding='utf-8') as f:
        f.write(f"[{datetime.now().isoformat()}] {message}\n")

def load_cache():
    if CACHE_PATH.exists():
        with open(CACHE_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_cache(cache):
    with open(CACHE_PATH, 'w', encoding='utf-8') as f:
        json.dump(cache, f, indent=2, ensure_ascii=False)

def fetch_title_playwright(playwright, url, src_file, cache):
    if url in cache:
        print(f"{GREEN}[✓]{RESET} Cached: {url}")
        return cache[url]

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            browser = playwright.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url, timeout=TIMEOUT_MS)
            title = page.title()
            browser.close()
            if title:
                print(f"{GREEN}[✓]{RESET} {url} → {title}")
                cache[url] = title
                return title
        except PlaywrightTimeout:
            print(f"{YELLOW}[!] Timeout (Attempt {attempt}){RESET} for {url}")
            log_error(f"Timeout for {url} in {src_file}")
        except Exception as e:
            print(f"{RED}[✗]{RESET} Error (Attempt {attempt}) for {url}: {e}")
            log_error(f"Error for {url} in {src_file}: {e}")
        time.sleep(1)
    return None

def enrich_resources(resources, playwright, src_file, cache):
    for level in resources.values():
        for section in ['docs', 'notes']:
            for item in level.get(section, []):
                url = item['url']
                if is_youtube_link(url):
                    print(f"{YELLOW}[-]{RESET} Skipping YouTube link: {url}")
                    continue
                title = fetch_title_playwright(playwright, url, src_file, cache)
                if title:
                    item['title'] = title
    return resources

def process_json_file(playwright, src_path, dest_path, cache):
    print(f"\n{GREEN}[→]{RESET} Processing: {src_path.relative_to(SOURCE_DIR)}")
    with open(src_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    data['resources'] = enrich_resources(data['resources'], playwright, str(src_path), cache)

    dest_path.parent.mkdir(parents=True, exist_ok=True)
    with open(dest_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def main():
    cache = load_cache()
    with sync_playwright() as playwright:
        for dirpath, _, filenames in os.walk(SOURCE_DIR):
            for filename in filenames:
                if filename.endswith(".json"):
                    src_path = Path(dirpath) / filename
                    relative_path = src_path.relative_to(SOURCE_DIR)
                    dest_path = DEST_DIR / relative_path
                    process_json_file(playwright, src_path, dest_path, cache)
    save_cache(cache)
    print(f"\n{GREEN}[✓] Done!{RESET} Titles cached: {len(cache)} | Errors logged to: {ERROR_LOG_PATH.name}")

if __name__ == "__main__":
    main()
