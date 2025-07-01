import json
import os
import re
import asyncio
import time
import random
from dotenv import load_dotenv
import openai
from typing import Dict, Any, List, Optional

# --- Configuration and Initialization ---

# Load environment variables from .env file
load_dotenv()

# Get API key from environment variable
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable not found. Please set it in a .env file.")

# Initialize the AsyncOpenAI client globally (or pass it around)
openai_client = openai.AsyncOpenAI(api_key=OPENAI_API_KEY)
openai_model = "gpt-4o" # Or "gpt-4o-mini" for cost-efficiency

# Define the JSON Schema for AI-generated Alternative Course Details
ALTERNATIVE_COURSE_SCHEMA_DEFINITION = {
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "description": "A catchy and descriptive course title for the alternative course, relevant to backend development."
        },
        "tags": {
            "type": "array",
            "items": {
                "type": "string"
            },
            "description": "An array of 3-7 relevant keywords/tags for this course (e.g., ['javascript', 'runtime', 'expressjs', 'api-development'])."
        },
        "topics": {
            "type": "array",
            "items": {
                "type": "string"
            },
            "description": "An array of 5-8 key learning topics that would be covered in this course, starting with fundamentals and covering core backend concepts for the technology."
        }
    },
    "required": ["name", "tags", "topics"],
    "additionalProperties": False # Ensures no extra fields are generated
}

# The full response_format object for the OpenAI API call
OPENAI_RESPONSE_FORMAT_FOR_ALT_COURSE = {
    "type": "json_schema",
    "json_schema": {
        "name": "alternative_course_details_schema", # Name for the schema itself
        "strict": True, # Enforce strict adherence
        "schema": ALTERNATIVE_COURSE_SCHEMA_DEFINITION # The actual schema content
    }
}


# --- Core Async Functions with Rate Limiting and Retries ---

async def call_openai_for_generation_with_schema(prompt: str, course_context_for_log: str, model: str = openai_model, temperature: float = 0.7) -> Optional[Dict[str, Any]]:
    """
    Makes an asynchronous call to the OpenAI API for text generation with strict JSON schema enforcement,
    including retry logic for rate limits and other common API errors.
    """
    max_retries = 10
    base_delay = 2  # seconds
    
    for retry_count in range(max_retries):
        try:
            response = await openai_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are an expert curriculum designer. Generate course details in strict JSON format."},
                    {"role": "user", "content": prompt}
                ],
                temperature=temperature,
                response_format=OPENAI_RESPONSE_FORMAT_FOR_ALT_COURSE # Use the correctly structured format here
            )
            
            # The API guarantees JSON adherence with response_format, so direct parsing is safer
            generated_content = json.loads(response.choices[0].message.content)
            print(f"  ✨ AI generation successful for '{course_context_for_log}'.")
            return generated_content
        
        except openai.RateLimitError as e:
            delay = base_delay * (2 ** retry_count) + random.uniform(0, 1) # Exponential backoff with jitter
            print(f"  ⚠️ Rate limit hit for '{course_context_for_log}'. Retrying in {delay:.2f}s (Retry {retry_count + 1}/{max_retries}). Error: {e.message}")
            await asyncio.sleep(delay)
            continue # Try again

        except openai.APIConnectionError as e:
            print(f"  ❌ OpenAI API Connection Error for '{course_context_for_log}': {e}. Retrying...")
            await asyncio.sleep(base_delay * (2 ** retry_count) + random.uniform(0, 1))
            continue
        
        except openai.AuthenticationError as e:
            print(f"  ❌ OpenAI API Authentication Error for '{course_context_for_log}': {e}. Please check your API key. Aborting retries.")
            return None
            
        except openai.APIStatusError as e:
            # Check for the specific malformed request error
            if e.status_code == 400 and "'response_format.type'" in str(e.message):
                 print(f"  ❌ Malformed response_format for '{course_context_for_log}': {e.message}. This is likely a code error, not a retryable one. Aborting.")
                 return None
            print(f"  ❌ OpenAI API Status Error (HTTP {e.status_olde}) for '{course_context_for_log}': {e.response.json() if e.response else e}. Aborting retries for critical status errors.")
            return None
        
        except json.JSONDecodeError:
            # This should ideally not happen often with response_format="json_schema"
            print(f"  ❌ Failed to decode JSON from OpenAI response for '{course_context_for_log}'. AI output might be malformed. Aborting retries.")
            return None
            
        except Exception as e:
            print(f"  ❌ An unexpected error occurred during OpenAI call for '{course_context_for_log}': {e}. Aborting retries.")
            return None

    print(f"  ❌ Failed to generate details for '{course_context_for_log}' after {max_retries} retries.")
    return None

async def _generate_alternative_course_details_via_ai(main_course_name: str, primary_tech_alt: str) -> tuple[str, List[str], List[str]]:
    """
    Generates more descriptive name, relevant tags, and topics for an alternative course
    by calling the OpenAI API, enforcing the defined schema.
    """
    prompt = f"""
    Design an alternative backend development course.
    The original course is "{main_course_name}".
    The primary technology for this alternative course is "{primary_tech_alt}".

    Generate the following details for this new course as a JSON object:
    1.  A "name" (string): A concise and descriptive course title.
    2.  "tags" (array of strings): 3-7 relevant tags for this specific course and technology.
    3.  "topics" (array of strings): 5-8 key learning topics, starting with fundamentals and covering core backend concepts.

    Ensure your response strictly adheres to the JSON schema provided to you.
    """
    
    generated_data = await call_openai_for_generation_with_schema(
        prompt=prompt,
        course_context_for_log=f"Alternative '{primary_tech_alt}' for '{main_course_name}'"
    )
    
    if generated_data:
        return generated_data.get("name", f"{main_course_name} - {primary_tech_alt} Alternative (AI Failed)"), \
               generated_data.get("tags", []), \
               generated_data.get("topics", [])
    else:
        print(f"  ⚠️ AI generation failed for {primary_tech_alt} (main: {main_course_name}). Using fallback data.")
        return f"{main_course_name} - {primary_tech_alt} Alternative (Fallback)", \
               ["backend", primary_tech_alt.lower()], \
               [f"{primary_tech_alt} Fundamentals", f"Backend Concepts for {primary_tech_alt}"]

# --- File Operations ---

def _load_course(filepath: str) -> Optional[Dict[str, Any]]:
    """
    Loads a course JSON file and returns the parsed dictionary.
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"  ❌ Error: Course file not found at '{filepath}'. Skipping.")
        return None
    except json.JSONDecodeError as e:
        print(f"  ❌ Error: Failed to parse JSON from '{filepath}': {e}. Skipping.")
        return None
    except Exception as e:
        print(f"  ❌ An unexpected error occurred loading course at '{filepath}': {e}. Skipping.")
        return None

def _save_course(filepath: str, course_data: Dict[str, Any]) -> None:
    """
    Saves the updated course data to the JSON file.
    """
    try:
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(course_data, f, indent=2, ensure_ascii=False)
        print(f"  ✅ Saved updated course to '{filepath}'.")
    except Exception as e:
        print(f"  ❌ Failed to save updated course to '{filepath}': {e}.")

# --- Main Restructuring Logic (Per File) ---

async def _restructure_single_course_file_async(
    filepath: str, 
    output_directory: str, 
    category_prefix_counters: Dict[str, List[int]]
) -> bool:
    """
    Loads a single course JSON file, restructures it, generates alternative details via AI,
    and saves the new files to the output directory.
    `category_prefix_counters` is a dictionary {prefix: [counter]} used to assign sequential
    IDs per category prefix.
    Returns True on success, False on failure.
    """
    data = _load_course(filepath)
    if not data:
        return False

    original_filename = os.path.basename(filepath)
    # Extract the prefix from the filename (e.g., "BE", "CSec", "GD")
    prefix_match = re.match(r"([A-Za-z]+)\d{1,2}_.*\.json", original_filename)
    if not prefix_match:
        print(f"  ⚠️ Could not extract prefix from filename '{original_filename}'. Skipping.")
        return False
    
    prefix = prefix_match.group(1)
    
    # Initialize counter for this prefix if it doesn't exist
    if prefix not in category_prefix_counters:
        category_prefix_counters[prefix] = [1] # Start counting from 1 for this prefix

    current_counter = category_prefix_counters[prefix] # Get the mutable counter list for this prefix

    original_course_name = data.get("name", original_filename.replace(".json", ""))
    print(f"\n> Processing original course file: '{original_filename}' (Category: {prefix})")

    try:
        # --- Create the main course file ---
        main_course_data = {
            "id": f"{prefix}{current_counter[0]}", 
            "name": data["name"],
            "category": data["category"],
            "primary_tech": data["primary_tech"],
            "topics": data["topics"],
            "recommended": data["recommended"],
            "tags": data["tags"],
            "resources": data["resources"],
            "quiz": data["quiz"]
        }
        if "preferred_if" in data:
            main_course_data["preferred_if"] = data["preferred_if"]

        # Increment counter for the main course
        current_counter[0] += 1

        # Sanitize name for filename
        main_course_filename_name = data['name'].replace(' ', '_').replace('/', '-').replace(':', '').replace('&', 'and').strip()
        if not main_course_filename_name:
            # Fallback filename if name sanitization results in empty string
            main_course_filename_name = f"{prefix}Course_{current_counter[0] - 1}"
        new_main_filename = f"{main_course_filename_name}.json" 
        new_main_filepath = os.path.join(output_directory, new_main_filename)
        
        _save_course(new_main_filepath, main_course_data)

        # --- Process alternatives ---
        if "alternatives" in data and data["alternatives"]:
            alternative_tasks = []
            for alt_index, alternative in enumerate(data["alternatives"]):
                # Schedule AI generation for each alternative concurrently
                task = _generate_alternative_course_details_via_ai(
                    main_course_name=original_course_name,
                    primary_tech_alt=alternative["tech"]
                )
                alternative_tasks.append(task)
            
            # Run all AI generation tasks for this course's alternatives concurrently
            generated_alt_details = await asyncio.gather(*alternative_tasks)

            for alt_index, (alt_name, alt_tags, alt_topics) in enumerate(generated_alt_details):
                alternative = data["alternatives"][alt_index] # Get original alternative data

                alternative_data = {
                    "id": f"{prefix}{current_counter[0]}", # Assign next sequential ID for this prefix
                    "name": alt_name,
                    "category": data["category"], 
                    "primary_tech": alternative["tech"],
                    "topics": alt_topics,
                    "recommended": False, 
                    "tags": alt_tags, 
                    "resources": alternative.get("resources", {}),
                    "quiz": alternative.get("alternative_quiz", [])
                }

                if "preferred_if" in alternative:
                    alternative_data["preferred_if"] = alternative["preferred_if"]
                
                # Increment counter for the alternative course (for this prefix)
                current_counter[0] += 1
                
                # Sanitize alternative course name for filename
                alt_filename_name = alt_name.replace(' ', '_').replace('/', '-').replace(':', '').replace('&', 'and').strip()
                if not alt_filename_name:
                    # Fallback filename if name sanitization results in empty string
                    alt_filename_name = f"{prefix}Alternative_{current_counter[0] - 1}"
                new_alt_filename = f"{alt_filename_name}.json" 
                new_alt_filepath = os.path.join(output_directory, new_alt_filename)
                
                _save_course(new_alt_filepath, alternative_data)
        
        return True # Indicate success
    
    except KeyError as e:
        print(f"  ❌ Error: Missing key '{e}' in {filepath}. Skipping file processing for '{original_filename}'.")
        return False
    except Exception as e:
        print(f"  ❌ An unexpected error occurred while restructuring '{filepath}': {e}. Skipping file processing for '{original_filename}'.")
        return False

# --- Batch Processing Orchestration per Category ---

async def restructure_category_batched(
    source_category_dir: str, 
    output_base_directory: str, 
    category_prefix_counters: Dict[str, List[int]]
) -> None:
    """
    Scans a single category directory for course JSON files, processes them in batches,
    and applies restructuring and AI generation for alternatives with rate limiting.
    The `category_prefix_counters` is used to assign unique IDs per category prefix.
    """
    category_name = os.path.basename(source_category_dir)
    output_directory = os.path.join(output_base_directory, category_name)
    
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)
        print(f"Created output directory for '{category_name}': {output_directory}")

    all_file_paths = []
    if not os.path.exists(source_category_dir):
        print(f"Error: Source directory '{source_category_dir}' does not exist. Skipping.")
        return

    for dirpath, _, filenames in os.walk(source_category_dir):
        for filename in filenames:
            # Updated regex: matches any sequence of letters, followed by 1 or 2 digits, underscore, etc.
            # This captures prefixes like BE, CSec, GD etc.
            if re.fullmatch(r"[A-Za-z]+\d{1,2}_.*\.json", filename): 
                filepath = os.path.join(dirpath, filename)
                all_file_paths.append(filepath)
    
    if not all_file_paths:
        print(f"\nNo valid course files found in '{source_category_dir}' matching pattern '[A-Za-z]##_*.json'.")
        return

    # Sort files to ensure consistent order of processing for a given prefix's IDs
    all_file_paths.sort() 

    print(f"\n--- Initiating restructuring for {len(all_file_paths)} files in category '{category_name}' ---")
    
    batch_size = 5 # Number of files to process concurrently in each batch
    batch_delay = 5 # seconds to wait between batches

    for i in range(0, len(all_file_paths), batch_size):
        current_batch_paths = all_file_paths[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (len(all_file_paths) + batch_size - 1) // batch_size 

        print(f"\n--- Processing Batch {batch_num}/{total_batches} for category '{category_name}' ({len(current_batch_paths)} courses) ---")
        
        batch_tasks = []
        for filepath in current_batch_paths:
            # Pass the shared category_prefix_counters to each task
            batch_tasks.append(_restructure_single_course_file_async(filepath, output_directory, category_prefix_counters))
        
        await asyncio.gather(*batch_tasks)

        if batch_num < total_batches:
            print(f"\nBatch {batch_num}/{total_batches} for '{category_name}' complete. Waiting {batch_delay} seconds before next batch...")
            await asyncio.sleep(batch_delay)
    
    print(f"\nFinished restructuring for category '{category_name}'.")


# --- Top-Level Orchestration ---
async def process_all_course_categories(base_source_dir: str = "courses", base_output_dir: str = "restructured_courses") -> None:
    """
    Scans the base_source_dir for subdirectories (course categories) and processes
    each category using batching and AI enrichment.
    """
    if not os.path.exists(base_source_dir):
        print(f"Error: Base source directory '{base_source_dir}' does not exist. Aborting.")
        return

    # Initialize a dictionary to hold mutable counters for each category prefix
    # e.g., {"BE": [1], "CSec": [1]}
    category_prefix_counters: Dict[str, List[int]] = {} 

    category_dirs = []
    for entry in os.listdir(base_source_dir):
        full_path = os.path.join(base_source_dir, entry)
        if os.path.isdir(full_path):
            category_dirs.append(full_path)
    
    if not category_dirs:
        print(f"\nNo course category subdirectories found in '{base_source_dir}'.")
        return

    print(f"\nStarting processing for {len(category_dirs)} course categories...")

    for category_dir in category_dirs:
        print(f"\n--- Starting processing for category: '{os.path.basename(category_dir)}' ---")
        # Pass the same category_prefix_counters dictionary to all category processors
        await restructure_category_batched(category_dir, base_output_dir, category_prefix_counters)
        print(f"\n--- Finished processing for category: '{os.path.basename(category_dir)}' ---")
    
    print(f"\nAll course categories processed.")
    print("\nFinal ID counters per prefix:")
    for prefix, counter_list in category_prefix_counters.items():
        print(f"  {prefix}: Last ID used was {prefix}{counter_list[0]-1}")


# --- Main Execution ---
async def main():
    await process_all_course_categories()

if __name__ == "__main__":
    asyncio.run(main())