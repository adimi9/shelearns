# test.py
from src.rag_system import RAGSystem
import json 

# Initialize the RAG system
rag = RAGSystem()

# Ask a question
question = """
    A user wants to learn Front End Web Development.
    
    Their profile:
    Motivation: I have ideas and want to build personal projects or prototypes.
    Prior Experience: Done some small web projects. Knows HTML Forms and Validations, and React Basics. Does not know DOM Manipulation, Fetch API/JSON, DevTools & Debugging, Using images, icons and fonts properly. 
    Timeline: 1-2 months.
    
    Using their background, suggest a personalized path. Keep the roadmap order, but only include steps that are relevant.
"""
answer = rag.answer_question(question)
try:
    parsed = json.loads(answer)
    print(json.dumps(parsed, indent=4))
except json.JSONDecodeError as e:
    print("Failed to parse JSON:", e)
    print("Raw response:")
    print(answer)