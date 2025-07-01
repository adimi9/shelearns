import aiohttp
import asyncio
from bs4 import BeautifulSoup
import logging
import json
import os
import time
import openai

# Configure your OpenAI API key here or via environment variable
openai.api_key = os.getenv("OPENAI_API_KEY")

CACHE_PATH = "cache.json"
SEM_LIMIT = 5  # Max concurrent requests
REQUEST_TIMEOUT = 10

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# Load cache or start empty
def load_cache():
    if os.path.exists(CACHE_PATH):
        try:
            with open(CACHE_PATH, encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError:
            logger.warning("Cache file invalid, starting with empty cache.")
            return {}
    return {}

# Save cache to disk
def save_cache(cache):
    with open(CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(cache, f, indent=2, ensure_ascii=False)

cache = load_cache()

# Async fetch page content
async def fetch_html(session, url):
    try:
        async with session.get(url, timeout=REQUEST_TIMEOUT) as resp:
            if resp.status == 200:
                return await resp.text()
            else:
                logger.warning(f"Failed to fetch {url} - Status {resp.status}")
                return None
    except Exception as e:
        logger.warning(f"Exception fetching {url}: {e}")
        return None

# Extract text from meta description or paragraphs
def extract_text(html):
    soup = BeautifulSoup(html, "html.parser")
    meta = soup.find("meta", attrs={"name": "description"})
    if meta and meta.get("content") and len(meta["content"]) > 50:
        return meta["content"]
    # Fallback: first 3 paragraphs concatenated
    paragraphs = soup.find_all("p")
    if paragraphs:
        texts = [p.get_text(strip=True) for p in paragraphs[:3]]
        combined = " ".join(texts)
        if len(combined) > 30:
            return combined
    return None

# Use OpenAI to generate a detailed description from text
async def generate_description_with_openai(text):
    if not openai.api_key:
        logger.warning("OpenAI API key not set, skipping AI description.")
        return None

    prompt = f"Please provide a detailed, clear description of the following content:\n\n{text}"
    try:
        # Use async OpenAI client or run sync in thread executor
        # Here, using synchronous call inside an executor for simplicity
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: openai.ChatCompletion.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=300,
                temperature=0.7,
            )
        )
        description = response.choices[0].message.content.strip()
        return description
    except Exception as e:
        logger.warning(f"OpenAI request failed: {e}")
        return None

# Semaphore for rate limiting
semaphore = asyncio.Semaphore(SEM_LIMIT)

# Main function to get a smart description for a single URL
async def smart_description(url):
    if url in cache:
        logger.info(f"Cache hit for {url}")
        return cache[url]

    async with semaphore:
        logger.info(f"Fetching description for {url}")
        async with aiohttp.ClientSession() as session:
            html = await fetch_html(session, url)
            if not html:
                return None

            text = extract_text(html)
            if not text:
                logger.info(f"No suitable content extracted for {url}")
                return None

            # Try AI description
            ai_desc = await generate_description_with_openai(text)
            final_desc = ai_desc or text

            # Save to cache
            cache[url] = final_desc
            save_cache(cache)
            return final_desc
