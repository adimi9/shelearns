import os
import json
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env")

conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

ROOT_DIR = os.path.join(os.path.dirname(__file__), "..", "final_vfinal_courses")
XP_PER_RESOURCE = 100
XP_PER_QUIZ = 250

def create_tables():
    # Drop tables in reverse order of dependency to avoid foreign key constraints issues
    # Resource depends on Course_Level, Course_Level depends on Course
    # Web_Resource, Video_Resource, Quiz_Resource depend on Resource
    # Quiz_Resource also depends on Quiz_Question
    cursor.execute("""
        DROP TABLE IF EXISTS Quiz_Resource CASCADE;
        DROP TABLE IF EXISTS Quiz_Question CASCADE;
        DROP TABLE IF EXISTS Web_Resource CASCADE;
        DROP TABLE IF EXISTS Video_Resource CASCADE;
        DROP TABLE IF EXISTS Resource CASCADE;
        DROP TABLE IF EXISTS Course_Level CASCADE;
        DROP TABLE IF EXISTS Course CASCADE;
    """)
    conn.commit() # Commit the drops before creating

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

        CREATE TABLE IF NOT EXISTS Resource (
            Resource_ID SERIAL PRIMARY KEY,
            Level_ID INT REFERENCES Course_Level(Level_ID) ON DELETE CASCADE,
            Resource_Type VARCHAR CHECK (Resource_Type IN ('NOTE', 'DOC', 'VIDEO', 'QUIZ')),
            Resource_XP INT,
            Resource_Order INT DEFAULT 0 -- Moved Resource_Order here
        );

        CREATE TABLE IF NOT EXISTS Web_Resource (
            Resource_ID INT PRIMARY KEY REFERENCES Resource(Resource_ID) ON DELETE CASCADE,
            Name TEXT,
            Description TEXT,
            Link TEXT
            -- Resource_Order is now in the main Resource table
        );

        CREATE TABLE IF NOT EXISTS Video_Resource (
            Resource_ID INT PRIMARY KEY REFERENCES Resource(Resource_ID) ON DELETE CASCADE,
            Name TEXT,
            Duration TEXT,
            Link TEXT
            -- Resource_Order is now in the main Resource table
        );

        CREATE TABLE IF NOT EXISTS Quiz_Question (
            Question_ID SERIAL PRIMARY KEY,
            Question TEXT,
            Option_1 TEXT,
            Option_2 TEXT,
            Option_3 TEXT,
            Option_4 TEXT,
            Correct_Option INT,
            Hint TEXT
        );

        CREATE TABLE IF NOT EXISTS Quiz_Resource (
            Resource_ID INT PRIMARY KEY REFERENCES Resource(Resource_ID) ON DELETE CASCADE,
            Question_ID INT REFERENCES Quiz_Question(Question_ID) ON DELETE CASCADE
            -- Question_Order is now handled by Resource_Order in the main Resource table
        );
    """)
    conn.commit()
    print("✅ All tables created (or ensured to exist).")

def insert_course(course):
    cursor.execute("""
        INSERT INTO Course (Course_ID, Course_Name, Course_Category)
        VALUES (%s, %s, %s) ON CONFLICT (Course_ID) DO NOTHING
    """, (course["id"], course["name"], course["category"]))
    conn.commit()

def insert_level(course_id, level_name):
    cursor.execute("""
        INSERT INTO Course_Level (Course_ID, Level_Name)
        VALUES (%s, %s) RETURNING Level_ID
    """, (course_id, level_name))
    level_id = cursor.fetchone()[0]
    conn.commit()
    return level_id

# Modified insert_resource to accept resource_order
def insert_resource(level_id, res_type, xp, resource_order):
    cursor.execute("""
        INSERT INTO Resource (Level_ID, Resource_Type, Resource_XP, Resource_Order)
        VALUES (%s, %s, %s, %s) RETURNING Resource_ID
    """, (level_id, res_type, xp, resource_order))
    resource_id = cursor.fetchone()[0]
    conn.commit()
    return resource_id

# Modified insert_web_resource - removed resource_order parameter and SQL column
def insert_web_resource(resource_id, name, description, link):
    cursor.execute("""
        INSERT INTO Web_Resource (Resource_ID, Name, Description, Link)
        VALUES (%s, %s, %s, %s)
    """, (resource_id, name, description, link))
    conn.commit()

# Modified insert_video_resource - removed resource_order parameter and SQL column
def insert_video_resource(resource_id, name, duration, link):
    cursor.execute("""
        INSERT INTO Video_Resource (Resource_ID, Name, Duration, Link)
        VALUES (%s, %s, %s, %s)
    """, (resource_id, name, duration, link))
    conn.commit()

def insert_quiz_question(question, options, correct_option, hint):
    cursor.execute("""
        INSERT INTO Quiz_Question (Question, Option_1, Option_2, Option_3, Option_4, Correct_Option, Hint)
        VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING Question_ID
    """, (question, options[0], options[1], options[2], options[3], correct_option, hint))
    question_id = cursor.fetchone()[0]
    conn.commit()
    return question_id

# Modified insert_quiz_resource - removed order parameter and SQL column
def insert_quiz_resource(resource_id, question_id):
    cursor.execute("""
        INSERT INTO Quiz_Resource (Resource_ID, Question_ID)
        VALUES (%s, %s)
    """, (resource_id, question_id))
    conn.commit()

def process_resources(level_id, resources):
    for rtype, key_name in [("DOC", "docs"), ("NOTE", "notes"), ("VIDEO", "videos")]:
        items = resources.get(key_name, [])
        for order, item in enumerate(items, start=1):
            xp = XP_PER_RESOURCE
            # Pass the 'order' to insert_resource
            res_id = insert_resource(level_id, rtype, xp, order)
            if rtype == "VIDEO":
                # Removed 'order' from here as it's now handled by Resource table
                insert_video_resource(res_id, item.get("title"), item.get("duration"), item.get("url"))
            else:
                # Removed 'order' from here as it's now handled by Resource table
                insert_web_resource(res_id, item.get("title"), item.get("description"), item.get("url"))

def process_quiz(level_id, quizzes):
    for idx, q in enumerate(quizzes):
        # Pass the 'idx + 1' as resource_order for quizzes
        res_id = insert_resource(level_id, "QUIZ", XP_PER_QUIZ, idx + 1)
        question_id = insert_quiz_question(
            q.get("question"),
            q.get("options"),
            q.get("correct_option"),
            q.get("hint")
        )
        # Removed 'idx + 1' from here as it's now handled by Resource table
        insert_quiz_resource(res_id, question_id)

def process_course_file(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        course_data = json.load(f)

    insert_course(course_data)
    # The Course_Level table expects 'BEGINNER', 'INTERMEDIATE', 'ADVANCED' (uppercase)
    # for Level_Name, so we keep level_enum_str as is for insert_level.
    for level_enum_str in ["BEGINNER", "INTERMEDIATE", "ADVANCED"]:
        level_id = insert_level(course_data["id"], level_enum_str)

        # Convert level_enum_str to lowercase for accessing JSON data
        json_level_key = level_enum_str.lower()

        # Access resources using the lowercase key
        resources = course_data.get("resources", {}).get(json_level_key, {})
        process_resources(level_id, resources)

        # Access quizzes using the lowercase key
        quizzes = course_data.get("quiz", {}).get(json_level_key, [])
        process_quiz(level_id, quizzes)

def main():
    try:
        print("📁 Scanning course JSON files...")
        create_tables() # Call create_tables to drop and create
        for root, _, files in os.walk(ROOT_DIR):
            for file in files:
                if file.endswith(".json"):
                    path = os.path.join(root, file)
                    print(f"Processing {path}...")
                    process_course_file(path)
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