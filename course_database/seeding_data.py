import os, json
import psycopg2
from dotenv import load_dotenv
import urllib.parse as up


load_dotenv()

# Set up DB connection
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env")

conn = psycopg2.connect(DATABASE_URL)

cursor = conn.cursor()

# Constants
ROOT_DIR = "restructured_courses"
XP_PER_RESOURCE = 100
XP_PER_QUIZ = 250

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
    
    # Docs
    doc_ids = insert_resource(course_id, "DOC", len(res.get("docs", [])))
    for rid, item in zip(doc_ids, res.get("docs", [])):
        insert_linked_resources(rid, [item])

    # Notes
    note_ids = insert_resource(course_id, "NOTE", len(res.get("notes", [])))
    for rid, item in zip(note_ids, res.get("notes", [])):
        insert_linked_resources(rid, [item])

    # Videos
    vids = res.get("videos", [])
    if vids:
        vid_ids = insert_resource(course_id, "VIDEO", len(vids))
        for rid, link in zip(vid_ids, vids):
            insert_video_links(rid, [link])

    # Quiz
    quiz = course.get("quiz", [])
    if quiz:
        [quiz_id] = insert_resource(course_id, "QUIZ", 1)
        insert_quiz(quiz_id, quiz)

    print(f"✅ Inserted: {course['name']}")

def insert_all():
    for root, _, files in os.walk(ROOT_DIR):
        for fname in files:
            if fname.endswith(".json"):
                process_file(os.path.join(root, fname))
    conn.commit()
    print("\n✅ All data inserted into PostgreSQL.")

if __name__ == "__main__":
    insert_all()
