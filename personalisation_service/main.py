from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import json
import os

# Import your RAGSystem from the 'app' directory
from app.rag_system import RAGSystem

# Initialize FastAPI app
app = FastAPI(
    title="Personalization Service for Learning Roadmaps",
    description="An API to generate personalized learning roadmaps based on user questionnaire responses and available courses.",
    version="1.0.0"
)

# Pydantic model for the request body
class PromptRequest(BaseModel):
    prompt: str

# Initialize the RAGSystem globally
# This ensures that DocumentLoader and EmbeddingsManager are initialized only once
try:
    rag_system = RAGSystem()
except Exception as e:
    # Log the error and potentially raise a critical exception or handle gracefully
    print(f"Failed to initialize RAGSystem: {e}")
    # In a production environment, you might want to stop the app or enter a degraded state
    # For now, we'll let FastAPI start, but subsequent calls to the endpoint will fail
    rag_system = None


@app.post("/personalize-roadmap", response_model=Dict[str, Any])
async def generate_roadmap(request: PromptRequest):
    """
    Generates a personalized learning roadmap based on the provided user questionnaire prompt.

    The prompt should contain the user's questionnaire responses in a JSON format.
    Example:
    {
        "prompt": "User's questionnaire responses: {\"What are you interested in learning?\": [\"Web Development\"], \"What is your current experience level?\": \"Beginner\", \"How much time can you dedicate per week?\": \"5-10 hours\"}"
    }

    Returns a JSON object with an introduction, recommended courses, and a conclusion.
    """
    if rag_system is None:
        raise HTTPException(status_code=500, detail="Personalization service is not ready. RAGSystem failed to initialize.")

    try:
        # Call the answer_question method of your RAGSystem
        # This method is now async
        roadmap_json_str = await rag_system.answer_question(request.prompt)

        # Parse the JSON string received from the RAGSystem
        roadmap_data = json.loads(roadmap_json_str)

        return roadmap_data
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse roadmap data from RAG system response.")
    except Exception as e:
        print(f"Error generating roadmap: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred while generating the roadmap: {e}")


# health check endpoint
@app.get("/health")
async def health_check():
    """
    Checks the health of the personalization service.
    """
    return {"status": "ok", "message": "Personalization service is running."}