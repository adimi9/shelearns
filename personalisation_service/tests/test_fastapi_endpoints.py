import pytest
from fastapi.testclient import TestClient # Import TestClient for async FastAPI testing
import json
from unittest.mock import AsyncMock

# Import the FastAPI app instance from your main.py
from main import app
from personalisation_service.app.rag_output import RAGSystem # Needed to mock its methods

# Create a TestClient instance for your FastAPI app
# This client can be used to send requests to your FastAPI application directly,
# without needing to run it with Uvicorn.
client = TestClient(app)

@pytest.mark.asyncio # Mark this test as async
async def test_health_endpoint():
    """
    Test the /health endpoint.
    """
    # Use the TestClient instance (remove await)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "Personalization service is running."}

@pytest.mark.asyncio # Mark this test as async
async def test_personalize_roadmap_endpoint_success(mocker):
    """
    Test the /personalize-roadmap endpoint for a successful response.
    We need to mock the RAGSystem.answer_question method because it calls OpenAI.
    """
    # Updated mock_roadmap_response to include the 'level' field
    mock_roadmap_response = json.dumps({
        "intro_paragraph": "Here is your personalized roadmap (mocked).",
        "recommended_courses": [
            {"name": "Mock Course A", "description": "Desc A"},
            {"name": "Mock Course B", "description": "Desc B"},
            {"name": "Mock Course C", "description": "Desc C"},
            {"name": "Mock Course D", "description": "Desc D"},
            {"name": "Mock Course E", "description": "Desc E"}
        ]
    })

    # Patch the answer_question method of the RAGSystem class directly
    # This mock will be used whenever the RAGSystem instance in main.py calls answer_question
    mocker.patch('app.rag_system.RAGSystem.answer_question', new_callable=AsyncMock, return_value=mock_roadmap_response)

    request_payload = {
        "prompt": "User's questionnaire responses: {\"What are you interested in learning?\": [\"Web Development\"], \"What is your current experience level?\": \"Beginner\"}"
    }

    # Use the TestClient instance to send the POST request (remove await)
    response = client.post("/personalize-roadmap", json=request_payload)

    assert response.status_code == 200
    response_data = response.json()
    assert response_data["intro_paragraph"] == "Here is your personalized roadmap (mocked)."
    assert len(response_data["recommended_courses"]) == 5
    assert response_data["recommended_courses"][0]["name"] == "Mock Course A"

    # Assert that the mocked answer_question was called correctly
    RAGSystem.answer_question.assert_awaited_once_with(request_payload["prompt"])


@pytest.mark.asyncio
async def test_personalize_roadmap_endpoint_rag_error(mocker):
    """
    Test the /personalize-roadmap endpoint when RAGSystem returns an error JSON.
    """
    error_response_from_rag = json.dumps({
        "intro_paragraph": "There was an error processing your questionnaire. Please refine your input and try again.",
        "recommended_courses": []
    })
    mocker.patch('app.rag_system.RAGSystem.answer_question', new_callable=AsyncMock, return_value=error_response_from_rag)

    request_payload = {
        "prompt": "User's questionnaire responses: {}" # This would cause RAGSystem to return an error
    }

    # Use the TestClient instance to send the POST request (remove await)
    response = client.post("/personalize-roadmap", json=request_payload)

    assert response.status_code == 200 # FastAPI wraps the RAGSystem's error JSON, so it's still a 200 OK HTTP status
    response_data = response.json()
    assert "error processing your questionnaire" in response_data["intro_paragraph"]
    assert not response_data["recommended_courses"]
    RAGSystem.answer_question.assert_awaited_once_with(request_payload["prompt"])

@pytest.mark.asyncio
async def test_personalize_roadmap_endpoint_invalid_input_format():
    """
    Test the /personalize-roadmap endpoint with an invalid request body (e.g., missing 'prompt').
    FastAPI's Pydantic validation should handle this.
    """
    # Use the TestClient instance to send the POST request (remove await)
    response = client.post("/personalize-roadmap", json={"invalid_key": "some value"})

    assert response.status_code == 422 # Unprocessable Entity - Pydantic validation error
    response_data = response.json()
    assert "detail" in response_data
    assert any(err['loc'] == ['body', 'prompt'] for err in response_data['detail'])