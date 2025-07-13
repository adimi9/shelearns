import os # handle file paths
import json # handle JSON database
import psycopg2 # connect to a PostgreSQL database
from dotenv import load_dotenv # load environment variables

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env")

conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

ROOT_DIR = os.path.join(os.path.dirname(__file__), "..", "final_vfinal_courses")
XP_PER_RESOURCE = 100
XP_PER_QUIZ = 250 # XP for each individual quiz question, as it's now a resource

def create_tables():
    # drop tables in reverse order of dependency
    # The order now: Quiz_Resource depends on Resource.
    cursor.execute("""
        DROP TABLE IF EXISTS Quiz_Resource CASCADE; -- Drop Quiz_Resource first
        DROP TABLE IF EXISTS Web_Resource CASCADE;
        DROP TABLE IF EXISTS Video_Resource CASCADE;
        DROP TABLE IF EXISTS Resource CASCADE;
        DROP TABLE IF EXISTS Course_Level CASCADE;
        DROP TABLE IF EXISTS Course CASCADE;
    """)

    conn.commit() # save changes permanently

    print("✅ Existing tables dropped (if they existed).")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Course (
            Course_ID VARCHAR PRIMARY KEY,
            Course_Name TEXT,
            Course_Category TEXT
        );

        CREATE TABLE IF NOT EXISTS Course_Level (
            Level_ID SERIAL PRIMARY KEY,
            Course_ID VARCHAR REFERENCES Course(Course_ID) ON DELETE CASCADE,
            Level_Name VARCHAR CHECK (Level_Name IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED'))
        );

        -- Resource is the parent table for all specific resource types
        CREATE TABLE IF NOT EXISTS Resource (
            Resource_ID SERIAL PRIMARY KEY,
            Level_ID INT REFERENCES Course_Level(Level_ID) ON DELETE CASCADE,
            Resource_Type VARCHAR CHECK (Resource_Type IN ('NOTE', 'DOC', 'VIDEO', 'QUIZ')),
            Resource_XP INT,
            Resource_Order INT DEFAULT 0 -- This will now store quiz question order too
        );

        -- Web_Resource extends Resource
        CREATE TABLE IF NOT EXISTS Web_Resource (
            Resource_ID INT PRIMARY KEY REFERENCES Resource(Resource_ID) ON DELETE CASCADE,
            Name TEXT,
            Description TEXT,
            Link TEXT
        );

        -- Video_Resource extends Resource
        CREATE TABLE IF NOT EXISTS Video_Resource (
            Resource_ID INT PRIMARY KEY REFERENCES Resource(Resource_ID) ON DELETE CASCADE,
            Name TEXT,
            Duration TEXT,
            Link TEXT
        );

        -- !!! MODIFIED: Quiz_Resource now holds quiz question details and extends Resource directly !!!
        CREATE TABLE IF NOT EXISTS Quiz_Resource (
            Resource_ID INT PRIMARY KEY REFERENCES Resource(Resource_ID) ON DELETE CASCADE,
            Question TEXT,
            Option_1 TEXT,
            Option_2 TEXT,
            Option_3 TEXT,
            Option_4 TEXT,
            Correct_Option INT,
            Hint TEXT
            -- Question_Order is REMOVED from here, now handled by Resource.Resource_Order
        );
    """)
    conn.commit() # Commit the table creations
    print("✅ All tables created (or ensured to exist).")

# --- MODIFIED FUNCTIONS ---

def insert_course(course):
    cursor.execute("""
        INSERT INTO Course (Course_ID, Course_Name, Course_Category)
        VALUES (%s, %s, %s) ON CONFLICT (Course_ID) DO NOTHING
    """, (course["id"], course["name"], course["category"]))

def insert_level(course_id, level_name):
    cursor.execute("""
        INSERT INTO Course_Level (Course_ID, Level_Name)
        VALUES (%s, %s) RETURNING Level_ID
    """, (course_id, level_name))
    level_id = cursor.fetchone()[0]
    return level_id

def insert_resource(level_id, res_type, xp, resource_order):
    cursor.execute("""
        INSERT INTO Resource (Level_ID, Resource_Type, Resource_XP, Resource_Order)
        VALUES (%s, %s, %s, %s) RETURNING Resource_ID
    """, (level_id, res_type, xp, resource_order))
    resource_id = cursor.fetchone()[0]
    return resource_id

def insert_web_resource(resource_id, name, description, link):
    cursor.execute("""
        INSERT INTO Web_Resource (Resource_ID, Name, Description, Link)
        VALUES (%s, %s, %s, %s)
    """, (resource_id, name, description, link))

def insert_video_resource(resource_id, name, duration, link):
    cursor.execute("""
        INSERT INTO Video_Resource (Resource_ID, Name, Duration, Link)
        VALUES (%s, %s, %s, %s)
    """, (resource_id, name, duration, link))

# !!! MODIFIED: This function now inserts into Quiz_Resource and takes all question details !!!
def insert_quiz_resource_data(resource_id, question, options, correct_option, hint):
    cursor.execute("""
        INSERT INTO Quiz_Resource (Resource_ID, Question, Option_1, Option_2, Option_3, Option_4, Correct_Option, Hint)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (resource_id, question, options[0], options[1], options[2], options[3], correct_option, hint))

# --- END MODIFIED FUNCTIONS ---

def process_resources(level_id, resources):
    for rtype, key_name in [("DOC", "docs"), ("NOTE", "notes"), ("VIDEO", "videos")]:
        items = resources.get(key_name, [])
        for order, item in enumerate(items, start=1):
            xp = XP_PER_RESOURCE
            res_id = insert_resource(level_id, rtype, xp, order)
            if rtype == "VIDEO":
                insert_video_resource(res_id, item.get("title"), item.get("duration"), item.get("url"))
            else: # DOC or NOTE
                insert_web_resource(res_id, item.get("title"), item.get("description"), item.get("url"))

# !!! MODIFIED: process_quiz now directly inserts into Resource and Quiz_Resource !!!
def process_quiz(level_id, quizzes):
    # Each 'q' in 'quizzes' now represents a single Quiz_Resource (which is a question)
    for idx, q_data in enumerate(quizzes):
        # The order for this specific question within the level's resources
        # We assume the JSON might have a 'question_order' or we use the enumerate index
        question_order = q_data.get("question_order") or (idx + 1)

        # 1. Insert into the general Resource table first
        resource_id_for_quiz_question = insert_resource(level_id, "QUIZ", XP_PER_QUIZ, question_order)

        # 2. Then insert the specific quiz question details into the Quiz_Resource table
        insert_quiz_resource_data(
            resource_id_for_quiz_question, # Use the resource_id as the PK/FK for Quiz_Resource
            q_data.get("question"),
            q_data.get("options"),
            q_data.get("correct_option"),
            q_data.get("hint")
        )

def process_course_file(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        course_data = json.load(f)

    insert_course(course_data)
    for level_enum_str in ["BEGINNER", "INTERMEDIATE", "ADVANCED"]:
        level_id = insert_level(course_data["id"], level_enum_str)
        json_level_key = level_enum_str.lower()
        resources = course_data.get("resources", {}).get(json_level_key, {})
        process_resources(level_id, resources)
        # Assuming 'quizzes' is a list of individual quiz question objects
        quizzes = course_data.get("quiz", {}).get(json_level_key, [])
        process_quiz(level_id, quizzes)

    # --- BATCH PROCESSING ADDITION ---
    conn.commit() # Commit all changes for this single course file
    print(f"✅ Committed data for {os.path.basename(json_path)}")
    # --- END BATCH PROCESSING ADDITION ---

def main():
    try:
        print("📁 Scanning course JSON files...")
        create_tables() # Call create_tables to drop and create
        for root, _, files in os.walk(ROOT_DIR):
            for file in files:
                if file.endswith(".json"):
                    path = os.path.join(root, file)
                    print(f"Processing {path}...")
                    process_course_file(path) # This function will now commit per file
        print("\n✅ Data insertion complete.")
    except Exception as e:
        print(f"❌ An error occurred: {e}")
        conn.rollback() # Rollback on error
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        print("🔌 Database connection closed.")

if __name__ == "__main__":
    main()