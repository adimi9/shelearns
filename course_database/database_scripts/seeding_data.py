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
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Course (
            Course_ID VARCHAR PRIMARY KEY,
            Course_Name TEXT,
            Course_Category TEXT
        );

        CREATE TABLE IF NOT EXISTS Course_Level (
            Level_ID SERIAL PRIMARY KEY,
            Course_ID VARCHAR REFERENCES Course(Course_ID),
            Level_Name VARCHAR CHECK (Level_Name IN ('beginner', 'intermediate', 'advanced'))
        );

        CREATE TABLE IF NOT EXISTS Resource (
            Resource_ID SERIAL PRIMARY KEY,
            Level_ID INT REFERENCES Course_Level(Level_ID),
            Resource_Type VARCHAR CHECK (Resource_Type IN ('NOTE', 'DOC', 'VIDEO', 'QUIZ')),
            Resource_XP INT
        );

        CREATE TABLE IF NOT EXISTS Web_Resource (
            Resource_ID INT REFERENCES Resource(Resource_ID),
            Name TEXT,
            Description TEXT,
            Link TEXT
        );

        CREATE TABLE IF NOT EXISTS Video_Resource (
            Resource_ID INT REFERENCES Resource(Resource_ID), 
            Name TEXT, 
            Duration TEXT, 
            Link TEXT
        );

        CREATE TABLE IF NOT EXISTS Quiz_Resource (
            Resource_ID INT REFERENCES Resource(Resource_ID),
            Question_ID SERIAL PRIMARY KEY,
            Question_Order INT
        );

        CREATE TABLE IF NOT EXISTS Quiz_Question (
            Question_ID INT PRIMARY KEY,
            Question TEXT,
            Option_1 TEXT,
            Option_2 TEXT,
            Option_3 TEXT,
            Option_4 TEXT,
            Correct_Option INT,
            Hint TEXT
        );
    """)
    conn.commit()

def insert_course(course):
    cursor.execute(
        "INSERT INTO Course (Course_ID, Course_Name, Course_Category) VALUES (%s, %s, %s) ON CONFLICT (Course_ID) DO NOTHING",
        (course["id"], course["name"], course["category"])
    )
    conn.commit()

def insert_level(course_id, level_name):
    cursor.execute(
        "INSERT INTO Course_Level (Course_ID, Level_Name) VALUES (%s, %s) RETURNING Level_ID",
        (course_id, level_name)
    )
    level_id = cursor.fetchone()[0]
    conn.commit()
    return level_id

def insert_resource(level_id, res_type, xp):
    cursor.execute(
        "INSERT INTO Resource (Level_ID, Resource_Type, Resource_XP) VALUES (%s, %s, %s) RETURNING Resource_ID",
        (level_id, res_type, xp)
    )
    resource_id = cursor.fetchone()[0]
    conn.commit()
    return resource_id

def insert_web_resource(resource_id, name, description, link):
    cursor.execute(
        "INSERT INTO Web_Resource (Resource_ID, Name, Description, Link) VALUES (%s, %s, %s, %s)",
        (resource_id, name, description, link)
    )
    conn.commit()

def insert_video_resource(resource_id, name, duration, link):
    cursor.execute(
        "INSERT INTO Video_Resource (Resource_ID, Name, Duration, Link) VALUES (%s, %s, %s, %s)",
        (resource_id, name, duration, link)
    )
    conn.commit()

def insert_quiz_question(question_id, question, options, correct_option, hint):
    cursor.execute(
        """INSERT INTO Quiz_Question (Question_ID, Question, Option_1, Option_2, Option_3, Option_4, Correct_Option, Hint)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ON CONFLICT (Question_ID) DO NOTHING""",
        (question_id, question, options[0], options[1], options[2], options[3], correct_option, hint)
    )
    conn.commit()

def insert_quiz_resource(resource_id, question_order):
    cursor.execute(
        "INSERT INTO Quiz_Resource (Resource_ID, Question_Order) VALUES (%s, %s) RETURNING Question_ID",
        (resource_id, question_order)
    )
    question_id = cursor.fetchone()[0]
    conn.commit()
    return question_id

def process_resources(level_id, resources):
    # resources dict has keys: beginner, intermediate, advanced - but here should only be for given level
    # Insert docs, notes, videos for that level
    for rtype, key_name in [("DOC", "docs"), ("NOTE", "notes"), ("VIDEO", "videos")]:
        for item in resources.get(key_name, []):
            xp = XP_PER_RESOURCE
            res_id = insert_resource(level_id, rtype, xp)
            if rtype == "VIDEO":
                insert_video_resource(res_id, item.get("title"), item.get("duration"), item.get("url"))
            else:
                insert_web_resource(res_id, item.get("title"), item.get("description"), item.get("url"))

def process_quiz(level_id, quizzes):
    # quizzes dict with keys beginner, intermediate, advanced - process for current level only
    questions = quizzes or []
    for idx, q in enumerate(questions):
        xp = XP_PER_QUIZ
        # Insert resource of type QUIZ first
        res_id = insert_resource(level_id, "QUIZ", xp)
        # Insert question into Quiz_Question (use some unique question_id, can use SERIAL from DB or manually generate)
        # But your schema has Question_ID as SERIAL primary key and Quiz_Resource has Question_ID as primary key? 
        # Actually Quiz_Resource.Question_ID is PK, so we need to insert into Quiz_Resource first to get Question_ID? 
        # But Quiz_Resource has Question_ID SERIAL PRIMARY KEY. So we insert into Quiz_Resource first to get Question_ID, then into Quiz_Question with that same ID.
        
        # So do this: Insert into Quiz_Resource with Resource_ID and Question_Order, get Question_ID, then insert question details with that ID
        
        question_order = idx + 1
        question_id = insert_quiz_resource(res_id, question_order)
        insert_quiz_question(
            question_id,
            q.get("question"),
            q.get("options"),
            q.get("correct_option"),
            q.get("hint")
        )

def process_course_file(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        course_data = json.load(f)

    insert_course(course_data)
    # Each level: beginner, intermediate, advanced
    for level in ("beginner", "intermediate", "advanced"):
        level_id = insert_level(course_data["id"], level)
        # process resources for this level
        resources = course_data.get("resources", {}).get(level, {})
        process_resources(level_id, resources)
        # process quiz for this level
        quizzes = course_data.get("quiz", {}).get(level, [])
        process_quiz(level_id, quizzes)

def main():
    create_tables()
    # Walk through all subfolders and json files
    for root, dirs, files in os.walk(ROOT_DIR):
        for file in files:
            if file.endswith(".json"):
                file_path = os.path.join(root, file)
                print(f"Processing {file_path} ...")
                process_course_file(file_path)

if __name__ == "__main__":
    main()
    cursor.close()
    conn.close()
