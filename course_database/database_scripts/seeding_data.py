import os, json
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# Set up DB connection
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env")

conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

# Adjusted path for sibling folder
ROOT_DIR = os.path.join(os.path.dirname(__file__), "..", "restructured_courses")
XP_PER_RESOURCE = 100
XP_PER_QUIZ = 250

# Create tables if not exist
def create_tables():
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Course (
            Course_ID VARCHAR PRIMARY KEY,
            Course_Name TEXT,
            Course_Category TEXT
        );

        CREATE TABLE IF NOT EXISTS Resource (
            Resource_ID SERIAL PRIMARY KEY,
            Course_ID VARCHAR REFERENCES Course(Course_ID),
            Resource_Type VARCHAR, 
            Resource_XP INT
        );

        CREATE TABLE IF NOT EXISTS Linked_Resource (
            Resource_ID INT REFERENCES Resource(Resource_ID),
            Name TEXT,
            Description TEXT,
            Link TEXT
        );

        CREATE TABLE IF NOT EXISTS Quiz (
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
    cursor.execute("""
        INSERT INTO Course (Course_ID, Course_Name, Course_Category)
        VALUES (%s, %s, %s)
        ON CONFLICT (Course_ID) DO NOTHING
    """, (course["id"], course["name"], course["category"]))

def insert_resource(course_id, rtype, count):
    xp = XP_PER_QUIZ if rtype == "QUIZ" else XP_PER_RESOURCE
    ids = []
    for _ in range(count):
        cursor.execute("""
            INSERT INTO Resource (Course_ID, Resource_Type, Resource_XP)
            VALUES (%s, %s, %s)
            RETURNING Resource_ID
        """, (course_id, rtype, xp))
        ids.append(cursor.fetchone()[0])
    return ids

def insert_linked_resources(resource_id, items):
    for item in items:
        cursor.execute("""
            INSERT INTO Linked_Resource (Resource_ID, Name, Description, Link)
            VALUES (%s, %s, %s, %s)
        """, (resource_id, None, item.get("description"), item["url"]))

def insert_video_links(resource_id, urls):
    for url in urls:
        cursor.execute("""
            INSERT INTO Linked_Resource (Resource_ID, Name, Description, Link)
            VALUES (%s, %s, %s, %s)
        """, (resource_id, None, None, url))

def insert_quiz(resource_id, quiz_data):
    for order, q in enumerate(quiz_data):
        cursor.execute("""
            INSERT INTO Quiz (Resource_ID, Question_Order)
            VALUES (%s, %s)
            RETURNING Question_ID
        """, (resource_id, order + 1))
        qid = cursor.fetchone()[0]
        cursor.execute("""
            INSERT INTO Quiz_Question (
                Question_ID, Question,
                Option_1, Option_2, Option_3, Option_4,
                Correct_Option, Hint
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            qid, q["question"],
            q["options"][0], q["options"][1], q["options"][2], q["options"][3],
            q["correct_option"], q["hint"]
        ))

def process_file(file_path):
    with open(file_path, encoding="utf-8") as f:
        course = json.load(f)

    course_id = course["id"]
    insert_course(course)

    res = course.get("resources", {})

    doc_ids = insert_resource(course_id, "DOC", len(res.get("docs", [])))
    for rid, item in zip(doc_ids, res.get("docs", [])):
        insert_linked_resources(rid, [item])

    note_ids = insert_resource(course_id, "NOTE", len(res.get("notes", [])))
    for rid, item in zip(note_ids, res.get("notes", [])):
        insert_linked_resources(rid, [item])

    vids = res.get("videos", [])
    if vids:
        vid_ids = insert_resource(course_id, "VIDEO", len(vids))
        for rid, link in zip(vid_ids, vids):
            insert_video_links(rid, [link])

    quiz = course.get("quiz", [])
    if quiz:
        [quiz_id] = insert_resource(course_id, "QUIZ", 1)
        insert_quiz(quiz_id, quiz)

    print(f"✅ Inserted: {course['name']}")

def insert_all():
    create_tables()
    for root, _, files in os.walk(ROOT_DIR):
        for fname in files:
            if fname.endswith(".json"):
                process_file(os.path.join(root, fname))
    conn.commit()
    print("\n✅ All data inserted into PostgreSQL.")

if __name__ == "__main__":
    insert_all()
