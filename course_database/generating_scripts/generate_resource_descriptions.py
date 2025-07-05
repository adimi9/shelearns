import os
import json
import logging
from typing import List, Dict, Optional, Any, Tuple, Union
from dotenv import load_dotenv
import openai
import asyncio
import time
import random
import re
from pydantic import BaseModel, ValidationError, Field

# ----------------------------------
# 🔧 Logging configuration
# ----------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

# -------------------------------
# 📦 Pydantic models for Resource Structure
# -------------------------------
class ResourceDescription(BaseModel):
    # This model defines the expected output from the OpenAI API for a description.
    # We expect a single string description.
    description: str = Field(..., min_length=1) # Ensure description is a non-empty string

class CourseResourceItem(BaseModel):
    url: str
    description: str

class LevelResources(BaseModel):
    docs: List[CourseResourceItem] = []
    notes: List[CourseResourceItem] = []
    videos: List[str] = [] # Assuming videos remain a list of strings, not needing descriptions

class CourseResources(BaseModel):
    # This model now reflects the nested structure: levels (beginner, intermediate, advanced)
    beginner: Optional[LevelResources] = None
    intermediate: Optional[LevelResources] = None
    advanced: Optional[LevelResources] = None

# ----------------------------------
# Main ResourceDescriber Class
# ----------------------------------
class ResourceDescriber:
    """
    Generates one-line descriptions for each resource URL (docs and notes)
    in the course JSON files using OpenAI's language model.
    Handles rate limits, errors, and uses Pydantic for response validation.
    """

    def __init__(self, input_folder_name: str = "quizzed_courses", output_folder_name: str = "final_courses"):
        load_dotenv()
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not set in environment variables.")
        
        self.openai_client = openai.AsyncOpenAI(api_key=self.api_key)
        self.openai_model = "gpt-4o"
        
        # Determine the base directory for input and output relative to the script's location
        script_dir = os.path.dirname(__file__)
        self.input_root_dir = os.path.join(script_dir, "..", input_folder_name)
        self.output_root_dir = os.path.join(script_dir, "..", output_folder_name)
        
        self.levels = ["beginner", "intermediate", "advanced"] # Define levels

    def _build_system_prompt(self) -> str:
        return """
        You are an expert technical writer. Given a URL pointing to a technical resource (documentation or notes),
        generate a concise one-line description summarizing the content or purpose of that URL.
        Do NOT include the URL itself in the description.
        Respond ONLY with a JSON object containing a single key "description" and its value as the one-line description.
        For example: {"description": "A comprehensive guide to asynchronous programming in Python."}
        """

    def _build_user_prompt(self, url: str) -> str:
        return f"Please provide a brief, clear one-line description for the technical resource at this URL:\n{url}"

    # Helper to get the JSON schema for the API's expected output (an object with a "description" key)
    def _get_api_description_schema(self) -> Dict:
        return {
            "type": "object",
            "properties": {
                "description": {"type": "string", "description": "A concise one-line description of the resource."}
            },
            "required": ["description"],
            "additionalProperties": False
        }

    async def _describe_url(self, url: str) -> Optional[str]:
        """
        Makes an API call to OpenAI to generate a one-line description for the given URL.
        Includes retry and error handling for rate limits and network issues,
        and Pydantic validation for the response format.
        """
        max_retries = 10
        base_delay = 2 # Initial delay for retries
        api_max_tokens = 100 # Increased from 50 slightly to accommodate JSON overhead and good descriptions

        system_msg = self._build_system_prompt()
        user_msg = self._build_user_prompt(url)
        api_schema = self._get_api_description_schema()

        for retry_count in range(max_retries):
            try:
                response = await self.openai_client.chat.completions.create(
                    model=self.openai_model,
                    messages=[
                        {"role": "system", "content": system_msg},
                        {"role": "user", "content": user_msg}
                    ],
                    temperature=0.5,
                    max_tokens=api_max_tokens,
                    response_format={
                        "type": "json_schema",
                        "json_schema": {
                            "name": "resource_description_output_schema",
                            "strict": True,
                            "schema": api_schema
                        }
                    }
                )
                
                raw_response_content = json.loads(response.choices[0].message.content)
                
                # Validate with Pydantic
                validated_response = ResourceDescription(**raw_response_content)
                description = validated_response.description.strip()
                
                logger.info(f"    ✅ Generated description for URL: {url[:60]}... (Validated)")
                return description

            except openai.RateLimitError as e:
                # Extract retry-after from error message if available, otherwise use exponential backoff
                retry_after_ms = None
                match = re.search(r'Please try again in (\d+)ms', e.message)
                if match:
                    delay = int(match.group(1)) / 1000.0
                else:
                    delay = base_delay * (2 ** retry_count) + random.uniform(0, 1)
                logger.warning(f"⚠️ Rate limit hit, retrying in {delay:.2f}s (attempt {retry_count+1}/{max_retries}) for URL: {url}")
                await asyncio.sleep(delay)
                continue
            except openai.APIConnectionError as e:
                logger.error(f"❌ OpenAI API Connection Error for URL {url}: {e}")
                break
            except openai.AuthenticationError as e:
                logger.error(f"❌ OpenAI API Authentication Error for URL {url}: {e}. Check your API key.")
                break
            except openai.APIStatusError as e:
                logger.error(f"❌ OpenAI API Status Error (HTTP {e.status_code}) for URL {url}: {e.response.json() if e.response else e}")
                if retry_count < max_retries -1:
                    logger.warning(f"Retrying after API Status Error (attempt {retry_count + 1}/{max_retries})...")
                    await asyncio.sleep(base_delay)
                    continue
                break
            except json.JSONDecodeError as e:
                raw_content = response.choices[0].message.content if 'response' in locals() and response and response.choices else 'N/A'
                logger.error(f"❌ Error decoding JSON response from OpenAI for URL {url}: {e}")
                logger.debug(f"Raw API response content: {raw_content}")
                if retry_count < max_retries -1:
                    logger.warning(f"Retrying after JSON decode error (attempt {retry_count + 1}/{max_retries})...")
                    await asyncio.sleep(base_delay)
                    continue
                break
            except ValidationError as e:
                raw_content = response.choices[0].message.content if 'response' in locals() and response and response.choices else 'N/A'
                logger.error(f"❌ Pydantic Validation Error for URL {url}: {e}")
                logger.debug(f"Raw API response content that failed Pydantic validation: {raw_content}")
                if retry_count < max_retries - 1:
                    logger.warning(f"Retrying after Pydantic validation error (attempt {retry_count + 1}/{max_retries})...")
                    await asyncio.sleep(base_delay)
                    continue
                break
            except Exception as e:
                logger.exception(f"❌ An unexpected error occurred generating description for URL {url}")
                break

        logger.error(f"❌ Failed to generate description for URL {url} after {max_retries} retries.")
        return None

    def _load_course(self, filepath: str) -> Optional[Dict]:
        """
        Loads a single course JSON file.
        """
        try:
            with open(filepath, encoding="utf-8") as f:
                data = json.load(f)
                if not isinstance(data, dict):
                    logger.warning(f"⚠️ Warning: '{filepath}' root is not a dictionary. Skipping.")
                    return None
                return data
        except FileNotFoundError:
            logger.warning(f"⚠️ Course file not found at '{filepath}'.")
            return None
        except json.JSONDecodeError as e:
            logger.warning(f"⚠️ Failed to parse JSON from '{filepath}': {e}")
            logger.debug(f"Please check JSON syntax in: {filepath} at the reported line/column.")
            return None
        except Exception as e:
            logger.exception(f"⚠️ An unexpected error occurred loading course at '{filepath}'")
            return None

    def _save_course(self, filepath: str, course_data: Dict) -> None:
        """
        Saves the updated course data to the specified JSON file path.
        """
        try:
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(course_data, f, indent=2, ensure_ascii=False)
            logger.info(f"✅ Saved updated course to {filepath}")
        except Exception as e:
            logger.exception(f"❌ Failed to save course file {filepath}")

    async def _process_level_resources(self, course_name: str, level: str, level_resources_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes 'docs' and 'notes' within a specific level (e.g., 'beginner').
        """
        processed_level_resources = {
            "docs": [],
            "notes": [],
            "videos": [] # Videos are passed through unchanged
        }

        # Process 'docs' for this level
        if "docs" in level_resources_data and isinstance(level_resources_data["docs"], list):
            for i, url in enumerate(level_resources_data["docs"]):
                description = await self._describe_url(url)
                processed_level_resources["docs"].append(CourseResourceItem(url=url, description=description or "Description unavailable.").model_dump())
                if i < len(level_resources_data["docs"]) - 1:
                    await asyncio.sleep(0.5) # Small delay between each URL description
        else:
            logger.warning(f"⚠️ No 'docs' found or invalid format for '{level}' level in course '{course_name}'.")

        # Process 'notes' for this level
        if "notes" in level_resources_data and isinstance(level_resources_data["notes"], list):
            for i, url in enumerate(level_resources_data["notes"]):
                description = await self._describe_url(url)
                processed_level_resources["notes"].append(CourseResourceItem(url=url, description=description or "Description unavailable.").model_dump())
                if i < len(level_resources_data["notes"]) - 1:
                    await asyncio.sleep(0.5) # Small delay between each URL description
        else:
            logger.warning(f"⚠️ No 'notes' found or invalid format for '{level}' level in course '{course_name}'.")

        # Preserve 'videos' as-is
        if "videos" in level_resources_data and isinstance(level_resources_data["videos"], list):
            processed_level_resources["videos"] = level_resources_data["videos"]
        else:
            logger.info(f"ℹ️ No 'videos' found or invalid format for '{level}' level in course '{course_name}'.")

        return processed_level_resources

    async def enrich_course_file(self, input_filepath: str) -> None:
        """
        Loads a course JSON file, processes its resources to add descriptions,
        and writes the updated data to the corresponding path in the output directory.
        """
        course_data = self._load_course(input_filepath)
        if not course_data:
            return
        
        course_name = course_data.get("name", os.path.splitext(os.path.basename(input_filepath))[0])
        logger.info(f"\n> Generating resource descriptions for course: {course_name}")

        # Ensure 'resources' key exists and is a dictionary
        if "resources" not in course_data or not isinstance(course_data["resources"], dict):
            logger.warning(f"⚠️ No 'resources' section found or invalid format for course '{course_name}', skipping resource description.")
            # Even if no resources were found/processed, save the original structure to the new output path
            # This ensures all input files result in an output file
            relative_path = os.path.relpath(input_filepath, self.input_root_dir)
            output_filepath = os.path.join(self.output_root_dir, relative_path)
            self._save_course(output_filepath, course_data)
            return

        updated_course_resources = {}

        # Iterate through defined levels (beginner, intermediate, advanced)
        for level in self.levels:
            if level in course_data["resources"] and isinstance(course_data["resources"][level], dict):
                logger.info(f"    > Processing resources for '{level}' level in course: {course_name}")
                level_resources_data = course_data["resources"][level]
                processed_level_data = await self._process_level_resources(course_name, level, level_resources_data)
                updated_course_resources[level] = processed_level_data
                # Small delay between processing different levels within the same course
                await asyncio.sleep(1.0) 
            else:
                logger.info(f"    ℹ️ No '{level}' resources found or invalid format for course '{course_name}', skipping this level.")
                # Ensure the level key is still present even if empty or invalid, to maintain structure
                updated_course_resources[level] = course_data["resources"].get(level, {})

        course_data["resources"] = updated_course_resources
        
        # Calculate the relative path from the input root directory
        # This preserves the subfolder structure
        relative_path = os.path.relpath(input_filepath, self.input_root_dir)
        # Construct the new full path in the output root directory
        output_filepath = os.path.join(self.output_root_dir, relative_path)

        self._save_course(output_filepath, course_data)

    async def enrich_all_courses(self) -> None:
        """
        Recursively scans the input course directory and processes all JSON files
        to append resource descriptions, saving them to the output directory
        while preserving the original subfolder structure. Processes in batches.
        """
        all_file_paths = []
        if not os.path.exists(self.input_root_dir):
            logger.error(f"Error: Input directory '{self.input_root_dir}' does not exist.")
            return

        for dirpath, _, filenames in os.walk(self.input_root_dir):
            for filename in filenames:
                # Exclude temporary or backup JSON files
                if filename.lower().endswith(".json") and not filename.lower().endswith((".json~", ".json.bak")):
                    filepath = os.path.join(dirpath, filename)
                    all_file_paths.append(filepath)

        if not all_file_paths:
            logger.info(f"No JSON course files found in '{self.input_root_dir}'.")
            return

        logger.info(f"\nStarting resource description generation for {len(all_file_paths)} course files from '{self.input_root_dir}'...")
        logger.info(f"Output will be saved to '{self.output_root_dir}'.")

        batch_size = 3 # Process 3 files at a time
        batch_delay = 15 # Wait 15 seconds between batches

        for i in range(0, len(all_file_paths), batch_size):
            current_batch_paths = all_file_paths[i:i + batch_size]
            batch_num = (i // batch_size) + 1
            total_batches = (len(all_file_paths) + batch_size - 1) // batch_size

            logger.info(f"\n--- Processing Batch {batch_num}/{total_batches} ({len(current_batch_paths)} files) ---")
            tasks = [self.enrich_course_file(fp) for fp in current_batch_paths]
            await asyncio.gather(*tasks)

            if batch_num < total_batches:
                logger.info(f"\nBatch {batch_num} complete. Sleeping {batch_delay}s before next batch...")
                await asyncio.sleep(batch_delay)

        logger.info("\nFinished generating all resource descriptions.")


if __name__ == "__main__":
    # You can specify input/output folder names here if they are different from defaults.
    # By default, it looks for courses in 'quizzed_courses' (sibling to script dir)
    # and saves processed courses to 'final_courses' (also sibling to script dir).
    describer = ResourceDescriber(input_folder_name="quizzed_courses", output_folder_name="final_courses")
    asyncio.run(describer.enrich_all_courses())