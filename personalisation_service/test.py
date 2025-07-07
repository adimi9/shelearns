import json
from personalisation_service.app.rag_output import RAGSystem # Assuming src.rag_system is the correct path

# Initialize the RAG system
rag = RAGSystem()

"""
test prompt:
{
  "questionnaire": {
    "What are you interested in learning?": "Game Development",
    "Why are you learning this?": "To improve my skills",
    "How much experience do you have in this area?": "I am a complete beginner",
    "Are there any specific technologies that you want to learn?": ["Unity", "Blender", "GameMaker"] 
  }
}
"""
# --- Define a list of different user scenarios (question prompts) ---
# We will create prompts for 5 different categories based on your QuestionFlow.tsx
test_scenarios = [
    {
        "name": "Frontend Development - Beginner interested in React",
        "prompt": """
User's questionnaire responses: {
  "What are you interested in learning?": [
    "Frontend Development"
  ],
  "Why are you learning Front End Web Development?": [
    "To build my own personal projects"
  ],
  "What is your experience with Front End Web Development?": [
    "I'm a complete beginner"
  ],
  "Are there any specific tools or technologies you're interested in?": [
    "React / Next.js",
    "CSS Frameworks (Tailwind, etc.)"
  ]
}
"""
    },
    {
        "name": "Backend Development - Wants to build APIs with Node.js",
        "prompt": """
User's questionnaire responses: {
  "What are you interested in learning?": [
    "Backend Development"
  ],
  "Why are you learning Back End Web Development?": [
    "To build robust APIs and services"
  ],
  "What is your experience with Back End Web Development?": [
    "I've written scripts (e.g., in Python or JS)"
  ],
  "Are there any specific tools or technologies you're interested in?": [
    "Node.js (Express, NestJS)",
    "Databases (SQL, NoSQL)"
  ]
}
"""
    },
    {
        "name": "Fullstack Development - Frontend Heavy, learning backend",
        "prompt": """
User's questionnaire responses: {
  "What are you interested in learning?": [
    "Fullstack Development"
  ],
  "Why are you learning Full Stack Web Development?": [
    "To be a versatile, end-to-end developer"
  ],
  "What is your experience with Full Stack Web Development?": [
    "Stronger on frontend, want to learn backend"
  ],
  "Are there any specific tools or technologies you're interested in?": [
    "MERN Stack (MongoDB, Express, React, Node)",
    "GraphQL"
  ]
}
"""
    },
    {
        "name": "Mobile App Development - App Idea with Flutter",
        "prompt": """
User's questionnaire responses: {
  "What are you interested in learning?": [
    "Mobile Development"
  ],
  "Why are you learning Mobile App Development?": [
    "I have a specific app idea I want to build"
  ],
  "What is your experience with Mobile App Development?": [
    "I'm a complete beginner"
  ],
  "Are there any specific tools or technologies you're interested in?": [
    "Flutter",
    "Mobile Backends (Firebase, Supabase)"
  ]
}
"""
    },
    {
        "name": "Cybersecurity - Career focused, interested in Pen Testing",
        "prompt": """
User's questionnaire responses: {
  "What are you interested in learning?": [
    "Cybersecurity"
  ],
  "Why are you learning Cybersecurity & Ethical Hacking?": [
    "To start a career in cybersecurity"
  ],
  "What is your experience with Cybersecurity & Ethical Hacking?": [
    "I'm a complete beginner"
  ],
  "Are there any specific tools or technologies you're interested in?": [
    "Penetration Testing Tools (Kali Linux)",
    "Network Analysis (Wireshark)"
  ]
}
"""
    }
]

# Loop through each test scenario
for i, scenario in enumerate(test_scenarios):
    print(f"\n--- Running Test Scenario {i+1}: {scenario['name']} ---")
    question_prompt = scenario['prompt']

    # Ask the RAG system to answer the question
    answer = rag.answer_question(question_prompt)

    # Attempt to parse and print the JSON response
    try:
        parsed = json.loads(answer)
        print(json.dumps(parsed, indent=4))
    except json.JSONDecodeError as e:
        print(f"Failed to parse JSON for scenario '{scenario['name']}': {e}")
        print("Raw response:")
        print(answer)
    except Exception as e:
        print(f"An unexpected error occurred for scenario '{scenario['name']}': {e}")
        print("Raw response:")
        print(answer)

    print(f"--- End of Scenario {i+1} ---")