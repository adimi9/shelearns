import os
import json
from typing import List, Dict, Optional, Any
from dotenv import load_dotenv
import openai
import asyncio
import time
import random
import re

class ResourceDescriber:
    """
    Generates one-line descriptions for each resource URL (docs and notes)
    in the course JSON files using OpenAI's language model.
    """

    def __init__(self, root_dir: str = "restructured_courses"):
        load_dotenv()
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not set in environment variables.")
        
        self.openai_client = openai.AsyncOpenAI(api_key=self.api_key)
        self.openai_model = "gpt-4o"
        self.root_dir = root_dir

    def _build_system_prompt(self) -> str:
        return """
        You are an expert technical writer. Given a URL pointing to a technical resource (documentation or notes),
        generate a concise one-line description summarizing the content or purpose of that URL.
        Do NOT include the URL itself in the description.
        Respond only with the one-line description.
        """

    def _build_user_prompt(self, url: str) -> str:
        return f"Please provide a brief, clear one-line description for the technical resource at this URL:\n{url}"

    async def _describe_url(self, url: str) -> Optional[str]:
        """
        Makes an API call to OpenAI to generate a one-line description for the given URL.
        Includes retry and error handling for rate limits and network issues.
        """
        max_retries = 10
        base_delay = 2
        system_msg = self._build_system_prompt()
        user_msg = self._build_user_prompt(url)

        for retry_count in range(max_retries):
            try:
                response = await self.openai_client.chat.completions.create(
                    model=self.openai_model,
                    messages=[
                        {"role": "system", "content": system_msg},
                        {"role": "user", "content": user_msg}
                    ],
                    temperature=0.5,
                    max_tokens=50,
                )
                description = response.choices[0].message.content.strip()
                return description

            except openai.RateLimitError as e:
                retry_after_ms = None
                match = re.search(r'Please try again in (\d+)ms', e.message)
                if match:
                    retry_after_ms = int(match.group(1))
                    delay = retry_after_ms / 1000.0
                else:
                    delay = base_delay * (2 ** retry_count) + random.uniform(0, 1)
                print(f"⚠️ Rate limit hit, retrying in {delay:.2f}s (attempt {retry_count+1}/{max_retries}) for URL: {url}")
                await asyncio.sleep(delay)
            except Exception as e:
                print(f"❌ Error generating description for URL {url}: {e}")
                return None
        print(f"❌ Failed to generate description for URL {url} after {max_retries} retries.")
        return None

    def _load_course(self, filepath: str) -> Optional[Dict]:
        try:
            with open(filepath, encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"⚠️ Failed to load JSON from {filepath}: {e}")
            return None

    def _save_course(self, filepath: str, course_data: Dict) -> None:
        try:
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(course_data, f, indent=2, ensure_ascii=False)
            print(f"✅ Saved updated course to {filepath}")
        except Exception as e:
            print(f"❌ Failed to save course file {filepath}: {e}")

    async def _process_resources(self, resources: Dict[str, Any]) -> Dict[str, Any]:
        """
        Converts lists of URLs under 'docs' and 'notes' into lists of
        dicts with 'url' and generated 'description'. Leaves 'videos' unchanged.
        """
        updated_resources = {}

        # Process 'docs'
        if "docs" in resources and isinstance(resources["docs"], list):
            updated_resources["docs"] = []
            for url in resources["docs"]:
                desc = await self._describe_url(url)
                updated_resources["docs"].append({
                    "url": url,
                    "description": desc or "Description unavailable."
                })

        # Process 'notes'
        if "notes" in resources and isinstance(resources["notes"], list):
            updated_resources["notes"] = []
            for url in resources["notes"]:
                desc = await self._describe_url(url)
                updated_resources["notes"].append({
                    "url": url,
                    "description": desc or "Description unavailable."
                })

        # Preserve 'videos' as-is
        if "videos" in resources:
            updated_resources["videos"] = resources["videos"]

        return updated_resources

    async def enrich_course_file(self, filepath: str) -> None:
        course = self._load_course(filepath)
        if not course:
            return
        course_name = course.get("name", os.path.splitext(os.path.basename(filepath))[0])
        print(f"\n> Generating resource descriptions for course: {course_name}")

        resources = course.get("resources", {})
        if not resources:
            print(f"⚠️ No resources found for {course_name}, skipping.")
            return
        
        updated_resources = await self._process_resources(resources)
        course["resources"] = updated_resources
        self._save_course(filepath, course)

    async def enrich_all_courses(self) -> None:
        all_file_paths = []
        if not os.path.exists(self.root_dir):
            print(f"Error: Directory '{self.root_dir}' does not exist.")
            return

        for dirpath, _, filenames in os.walk(self.root_dir):
            for filename in filenames:
                if filename.lower().endswith(".json"):
                    all_file_paths.append(os.path.join(dirpath, filename))

        if not all_file_paths:
            print(f"No JSON course files found in '{self.root_dir}'.")
            return

        print(f"\nStarting resource description generation for {len(all_file_paths)} courses...")

        batch_size = 5
        batch_delay = 10

        for i in range(0, len(all_file_paths), batch_size):
            batch_files = all_file_paths[i:i + batch_size]
            batch_num = (i // batch_size) + 1
            total_batches = (len(all_file_paths) + batch_size - 1) // batch_size

            print(f"\n--- Processing batch {batch_num}/{total_batches} ({len(batch_files)} files) ---")
            tasks = [self.enrich_course_file(fp) for fp in batch_files]
            await asyncio.gather(*tasks)

            if batch_num < total_batches:
                print(f"\nBatch {batch_num} complete. Sleeping {batch_delay}s before next batch...")
                await asyncio.sleep(batch_delay)

        print("\nFinished generating all resource descriptions.")


if __name__ == "__main__":
    describer = ResourceDescriber()
    asyncio.run(describer.enrich_all_courses())
