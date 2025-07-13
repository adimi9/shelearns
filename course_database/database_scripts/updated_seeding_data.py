import os
import shutil
import json # Import json to potentially validate files, though not strictly required for copying
import psycopg2 # connect to a PostgreSQL database
from dotenv import load_dotenv # load environment variables

# Load environment variables from .env file
load_dotenv()

# Database connection details
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env")

# Global connection and cursor (managed in main for proper closing)
conn = None
cursor = None

# Root directory where course JSON files are located
ROOT_DIR = os.path.join(os.path.dirname(__file__), "..", "final_vfinal_courses")

# XP values for different resource types
XP_PER_RESOURCE = 100
XP_PER_QUIZ = 250 # XP for each individual quiz question

def create_tables():
    """
    Creates the necessary database tables if they do not already exist.
    Note: This function no longer drops tables to preserve existing data.
    """
    global cursor, conn # Ensure cursor and conn are accessible

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

        -- Quiz_Resource now holds quiz question details and extends Resource directly
        CREATE TABLE IF NOT EXISTS Quiz_Resource (
            Resource_ID INT PRIMARY KEY REFERENCES Resource(Resource_ID) ON DELETE CASCADE,
            Question TEXT,
            Option_1 TEXT,
            Option_2 TEXT,
            Option_3 TEXT,
            Option_4 TEXT,
            Correct_Option INT,
            Hint TEXT
        );
    """)
    conn.commit() # Commit the table creations
    print("✅ All tables created (or ensured to exist).")

def insert_course(course):
    """Inserts a new course into the Course table."""
    global cursor
    cursor.execute("""
        INSERT INTO Course (Course_ID, Course_Name, Course_Category)
        VALUES (%s, %s, %s) ON CONFLICT (Course_ID) DO NOTHING
    """, (course["id"], course["name"], course["category"]))

def insert_level(course_id, level_name):
    """Inserts a new course level and returns its Level_ID."""
    global cursor
    cursor.execute("""
        INSERT INTO Course_Level (Course_ID, Level_Name)
        VALUES (%s, %s) RETURNING Level_ID
    """, (course_id, level_name))
    level_id = cursor.fetchone()[0]
    return level_id

def insert_resource(level_id, res_type, xp, resource_order):
    """Inserts a general resource and returns its Resource_ID."""
    global cursor
    cursor.execute("""
        INSERT INTO Resource (Level_ID, Resource_Type, Resource_XP, Resource_Order)
        VALUES (%s, %s, %s, %s) RETURNING Resource_ID
    """, (level_id, res_type, xp, resource_order))
    resource_id = cursor.fetchone()[0]
    return resource_id

def insert_web_resource(resource_id, name, description, link):
    """Inserts a web-based resource (docs, notes)."""
    global cursor
    cursor.execute("""
        INSERT INTO Web_Resource (Resource_ID, Name, Description, Link)
        VALUES (%s, %s, %s, %s)
    """, (resource_id, name, description, link))

def insert_video_resource(resource_id, name, duration, link):
    """Inserts a video resource."""
    global cursor
    cursor.execute("""
        INSERT INTO Video_Resource (Resource_ID, Name, Duration, Link)
        VALUES (%s, %s, %s, %s)
    """, (resource_id, name, duration, link))

def insert_quiz_resource_data(resource_id, question, options, correct_option, hint):
    """Inserts quiz question details into the Quiz_Resource table."""
    global cursor
    cursor.execute("""
        INSERT INTO Quiz_Resource (Resource_ID, Question, Option_1, Option_2, Option_3, Option_4, Correct_Option, Hint)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (resource_id, question, options[0], options[1], options[2], options[3], correct_option, hint))

def process_resources(level_id, resources):
    """Processes and inserts document, note, and video resources for a given level."""
    for rtype, key_name in [("DOC", "docs"), ("NOTE", "notes"), ("VIDEO", "videos")]:
        items = resources.get(key_name, [])
        for order, item in enumerate(items, start=1):
            xp = XP_PER_RESOURCE
            res_id = insert_resource(level_id, rtype, xp, order)
            if rtype == "VIDEO":
                insert_video_resource(res_id, item.get("title"), item.get("duration"), item.get("url"))
            else: # DOC or NOTE
                insert_web_resource(res_id, item.get("title"), item.get("description"), item.get("url"))

def process_quiz(level_id, quizzes):
    """Processes and inserts quiz questions for a given level."""
    for idx, q_data in enumerate(quizzes):
        question_order = q_data.get("question_order") or (idx + 1)
        resource_id_for_quiz_question = insert_resource(level_id, "QUIZ", XP_PER_QUIZ, question_order)
        insert_quiz_resource_data(
            resource_id_for_quiz_question,
            q_data.get("question"),
            q_data.get("options"),
            q_data.get("correct_option"),
            q_data.get("hint")
        )

def process_course_data_for_db(course_data):
    """
    Processes a single course's data and inserts it into the database.
    This function now takes the loaded course_data dictionary directly.
    """
    global conn # Ensure conn is accessible for commit
    insert_course(course_data)
    for level_enum_str in ["BEGINNER", "INTERMEDIATE", "ADVANCED"]:
        level_id = insert_level(course_data["id"], level_enum_str)
        json_level_key = level_enum_str.lower()
        resources = course_data.get("resources", {}).get(json_level_key, {})
        process_resources(level_id, resources)
        quizzes = course_data.get("quiz", {}).get(json_level_key, [])
        process_quiz(level_id, quizzes)
    conn.commit() # Commit all changes for this single course file
    print(f"✅ Committed data for course ID: {course_data.get('id')}")


def main():
    """Main function to connect to DB, create tables, and process course files."""
    global conn, cursor # Declare global to assign connection and cursor

    try:
        # Establish database connection
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        print("📁 Scanning course JSON files...")
        create_tables() # Call create_tables to ensure tables exist (without dropping)

        # Fetch existing course IDs from the database to skip duplicates
        existing_course_ids = set()
        cursor.execute("SELECT Course_ID FROM Course")
        for row in cursor.fetchall():
            existing_course_ids.add(row[0])
        print(f"Found {len(existing_course_ids)} existing courses in the database.")

        for root, _, files in os.walk(ROOT_DIR):
            for file in files:
                if file.endswith(".json"):
                    path = os.path.join(root, file)
                    try:
                        with open(path, "r", encoding="utf-8") as f:
                            course_data = json.load(f)
                        course_id = course_data.get("id")

                        if course_id in existing_course_ids:
                            print(f"Skipping {file}: Course with ID '{course_id}' already exists in the database.")
                        else:
                            print(f"Processing new course: {file} (ID: {course_id})...")
                            process_course_data_for_db(course_data)
                            existing_course_ids.add(course_id) # Add to set to prevent re-processing in same run
                    except json.JSONDecodeError:
                        print(f"Error: Could not decode JSON from {path}. Skipping.")
                    except Exception as e:
                        print(f"An unexpected error occurred while processing {path}: {e}")

        print("\n✅ Data insertion complete.")

    except Exception as e:
        print(f"❌ An error occurred: {e}")
        if conn:
            conn.rollback() # Rollback on error
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        print("🔌 Database connection closed.")

if __name__ == "__main__":
    main()
