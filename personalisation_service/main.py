import os
import json
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Union
import uvicorn
# Relative import for local modules
from app.rag_output import RAGSystem


# model definitions
from models import QuestionnaireRequest, PersonalizationResponse


# ----------------------------------
# 🔧 Logging configuration
# ----------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

# ----------------------------------
# ✅ FastAPI app setup
# ----------------------------------
app = FastAPI(
    title="Personalization Service API",
    description="API for generating personalized learning roadmaps using RAG and LLMs.",
    version="0.0.1",
)

# Initialize the RAGSystem globally
rag_system = RAGSystem()

# -------------------------------
# ✅ Endpoints
# -------------------------------
@app.get("/health", response_model=Dict[str, str])
async def health_check():
    return {"status": "ok", "message": "Personalization service is running."}

@app.post("/personalize", response_model=PersonalizationResponse)
async def personalize_roadmap(request: QuestionnaireRequest):
    try:
        # 🔵 Log prompt from backend
        logger.info("🔵 Received questionnaire from Java backend:\n%s", json.dumps(request.questionnaire, indent=2))

        # 🎯 Get raw response from RAG system
        roadmap_json_str = await rag_system.answer_question(request.questionnaire)

        # 🔁 Log raw string before parsing
        logger.info("🟢 Raw response from RAGSystem:\n%s\n🟢 End of raw response", roadmap_json_str)

        # Parse it
        roadmap_data = json.loads(roadmap_json_str)

        # FastAPI + Pydantic will handle validation
        return PersonalizationResponse(**roadmap_data)

    except json.JSONDecodeError as e:
        logger.error("❌ JSON parsing error: %s", e)
        raise HTTPException(
            status_code=500,
            detail={
                "intro_paragraph": "An internal error occurred: The AI response was malformed. Please try again later.",
                "recommended_courses": []
            }
        )
    except Exception as e:
        logger.exception("❌ Unexpected error in /personalize endpoint")
        raise HTTPException(
            status_code=500,
            detail={
                "intro_paragraph": "An unexpected error occurred. Please try again later.",
                "recommended_courses": []
            }
        )

# -------------------------------
# 🏁 Entry point for local dev
# -------------------------------
if __name__ == "__main__":
    load_dotenv()
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
