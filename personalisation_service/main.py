import os
import json
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Union
import uvicorn

# Relative import for local modules
from app.rag_system import RAGSystem

# Initialize FastAPI app
app = FastAPI(
    title="Personalization Service API",
    description="API for generating personalized learning roadmaps using RAG and LLMs.",
    version="0.0.1",
)

# Initialize the RAGSystem globally
# This ensures it's only created once when the FastAPI app starts
rag_system = RAGSystem()

class PersonalizationRequest(BaseModel):
    prompt: str

class CourseRecommendation(BaseModel): # New Pydantic model for course items
    id: str
    name: str
    description: str

class PersonalizationResponse(BaseModel):
    intro_paragraph: str
    recommended_courses: List[CourseRecommendation] # Use the new CourseRecommendation model

@app.get("/health", response_model=Dict[str, str], summary="Health Check")
async def health_check():
    """
    Returns the status of the service.
    """
    return {"status": "ok", "message": "Personalization service is running."}

@app.post("/personalize-roadmap", response_model=PersonalizationResponse, summary="Generate Personalized Learning Roadmap")
async def personalize_roadmap(request: PersonalizationRequest):
    """
    Generates a personalized learning roadmap based on user questionnaire responses.
    """
    try:
        # Call the RAGSystem to get the roadmap. It already returns a JSON string.
        roadmap_json_str = await rag_system.answer_question(request.prompt)
        
        # Parse the JSON string received from RAGSystem.answer_question
        roadmap_data = json.loads(roadmap_json_str)
        
        # FastAPI will automatically validate roadmap_data against PersonalizationResponse
        # if the types match. If there's a mismatch (e.g., if LLM output an invalid structure
        # even with JSON schema), Pydantic will raise a ValidationError.
        return PersonalizationResponse(**roadmap_data)
    except json.JSONDecodeError as e:
        # This catch is for when rag_system.answer_question returns a string that isn't valid JSON,
        # or if there's an issue with its internal fallback.
        print(f"Error parsing JSON from RAGSystem response: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "intro_paragraph": "An internal error occurred: The AI response was malformed. Please try again later",
                "recommended_courses": []
            }
        )
    except Exception as e:
        # Catch any other unexpected errors
        print(f"An unexpected error occurred in personalize_roadmap endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "intro_paragraph": "An unexpected error occurred. Please try again later.",
                "recommended_courses": []
            }
        )


if __name__ == "__main__":
    load_dotenv()
    # It's better to run Uvicorn programmatically for testing/development
    # or use the 'uvicorn main:app --reload' command directly in your terminal.
    # This block is mainly for quick local testing.
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)