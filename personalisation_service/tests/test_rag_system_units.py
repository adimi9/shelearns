import pytest
import json
from app.rag_system import RAGSystem
import openai # Import openai for error types
from unittest.mock import Mock # Import Mock for dummy response object

# We will use the mock_rag_system fixture from conftest.py
# This ensures that RAGSystem methods related to external APIs (OpenAI)
# or file loading are mocked, allowing us to unit test its internal logic.

@pytest.fixture
def rag_system_instance(mock_rag_system):
    """
    Provides a mocked RAGSystem instance for unit tests.
    """
    return mock_rag_system

def test_extract_questionnaire_json_valid(rag_system_instance):
    """
    Test that _extract_questionnaire_json correctly parses valid JSON.
    """
    prompt = """User's questionnaire responses: {"What are you interested in learning?": ["Web Development"], "level": "Beginner"}
    Some other text after the JSON."""
    expected = {"What are you interested in learning?": ["Web Development"], "level": "Beginner"}
    result = rag_system_instance._extract_questionnaire_json(prompt)
    assert result == expected

def test_extract_questionnaire_json_no_json(rag_system_instance):
    """
    Test that _extract_questionnaire_json returns None if no JSON is found.
    """
    prompt = "User's questionnaire responses: This is just a regular question without any JSON."
    result = rag_system_instance._extract_questionnaire_json(prompt)
    assert result is None

def test_extract_questionnaire_json_invalid_json(rag_system_instance):
    """
    Test that _extract_questionnaire_json returns None for malformed JSON.
    """
    prompt = "User's questionnaire responses: { \"key\": \"value\", }" # Trailing comma makes it invalid JSON
    result = rag_system_instance._extract_questionnaire_json(prompt)
    assert result is None

def test_extract_category_from_questionnaire_valid(rag_system_instance):
    """
    Test that _extract_category_from_questionnaire correctly extracts the category.
    """
    data = {"What are you interested in learning?": ["Web Development"], "level": "Beginner"}
    result = rag_system_instance._extract_category_from_questionnaire(data)
    assert result == "Web Development"

    data_multiple_interests = {"What are you interested in learning?": ["Data Science", "AI"], "level": "Intermediate"}
    result_multiple = rag_system_instance._extract_category_from_questionnaire(data_multiple_interests)
    assert result_multiple == "Data Science" # Should take the first one

def test_extract_category_from_questionnaire_missing_key(rag_system_instance):
    """
    Test that _extract_category_from_questionnaire returns None if the key is missing.
    """
    data = {"level": "Beginner"}
    result = rag_system_instance._extract_category_from_questionnaire(data)
    assert result is None

def test_extract_category_from_questionnaire_empty_list(rag_system_instance):
    """
    Test that _extract_category_from_questionnaire returns None if interest list is empty.
    """
    data = {"What are you interested in learning?": [], "level": "Beginner"}
    result = rag_system_instance._extract_category_from_questionnaire(data)
    assert result is None

def test_format_course_for_context_full_data(rag_system_instance):
    """
    Test _format_course_for_context with a complete course dictionary.
    """
    course = {
        "name": "Full-Stack Web Dev",
        "category": "Web Development",
        "topics": ["React", "Node.js"],
        "primary_tech": ["MERN"],
        "levels": ["Advanced"],
        "tags": ["fullstack"],
        "recommended": True
    }
    expected_output = (
        "Course Name: Full-Stack Web Dev\n"
        "Category: Web Development\n"
        "Key Topics Covered: React, Node.js\n"
        "Primary Technologies Used: MERN\n"
        "Target Levels: Advanced\n"
        "Tags: fullstack\n"
        "Recommended: Yes\n"
        "Description: This course is designed to cover React, Node.js. It focuses on MERN "
        "and is typically suitable for Advanced learners. This course is part of Web Development development."
    )
    assert rag_system_instance._format_course_for_context(course) == expected_output

def test_format_course_for_context_minimal_data(rag_system_instance):
    """
    Test _format_course_for_context with a minimal course dictionary.
    """
    course = {"name": "Minimal Course"}
    expected_output = (
        "Course Name: Minimal Course\n"
        "Category: N/A\n"
        "Key Topics Covered: \n"
        "Primary Technologies Used: \n"
        "Target Levels: \n"
        "Tags: \n"
        "Recommended: No\n"
        "Description: This course is designed to cover . It focuses on  "
        "and is typically suitable for  learners. This course is part of N/A development."
    )
    assert rag_system_instance._format_course_for_context(course) == expected_output

@pytest.mark.asyncio # Mark this test as async
async def test_answer_question_success(rag_system_instance, mocker):
    """
    Test the main answer_question method for a successful scenario.
    This relies heavily on the mocking in conftest.py.
    """
    prompt = """User's questionnaire responses: {"What are you interested in learning?": ["Web Development"], "What is your current experience level?": "Beginner"}"""

    response = await rag_system_instance.answer_question(prompt)
    parsed_response = json.loads(response)

    assert "intro_paragraph" in parsed_response
    assert "recommended_courses" in parsed_response
    assert len(parsed_response["recommended_courses"]) >= 5 # As per schema minItems
    assert all("level" in course for course in parsed_response["recommended_courses"])
    assert all(isinstance(course["level"], str) for course in parsed_response["recommended_courses"])


    # Verify that OpenAI chat completion was called with the correct system message and prompt
    # access the mock object via the rag_system_instance.openai_client
    rag_system_instance.openai_client.chat.completions.create.assert_awaited_once()
    args, kwargs = rag_system_instance.openai_client.chat.completions.create.call_args
    assert kwargs['model'] == "gpt-4o-2024-08-06"
    assert kwargs['messages'][0]['role'] == "system"
    assert "expert AI assistant" in kwargs['messages'][0]['content']
    assert kwargs['messages'][1]['role'] == "user"
    assert "User's personalized questionnaire responses:" in kwargs['messages'][1]['content']
    assert "Available Courses for Consideration in Web Development Development:" in kwargs['messages'][1]['content']

    # More robust check for the level property in the JSON schema
    response_format_schema_props = kwargs['response_format']['json_schema']['schema']['properties']['recommended_courses']['items']['properties']
    assert 'level' in response_format_schema_props
    assert response_format_schema_props['level'] == {'type': 'string'}
    assert 'level' in kwargs['response_format']['json_schema']['schema']['properties']['recommended_courses']['items']['required']


@pytest.mark.asyncio
async def test_answer_question_no_questionnaire_json(rag_system_instance):
    """
    Test handling of a prompt without valid questionnaire JSON.
    """
    prompt = "This is just a regular question without any JSON."
    response = await rag_system_instance.answer_question(prompt)
    parsed_response = json.loads(response)

    assert "error processing your questionnaire" in parsed_response["intro_paragraph"]
    assert not parsed_response["recommended_courses"]
    rag_system_instance.openai_client.chat.completions.create.assert_not_called() # LLM should not be called

@pytest.mark.asyncio
async def test_answer_question_no_category_extracted(rag_system_instance):
    """
    Test handling when no category can be extracted from the questionnaire.
    """
    prompt = """User's questionnaire responses: {"Some other question": "Answer"}"""
    response = await rag_system_instance.answer_question(prompt)
    parsed_response = json.loads(response)

    assert "Could not determine your primary learning interest" in parsed_response["intro_paragraph"]
    assert not parsed_response["recommended_courses"]
    rag_system_instance.openai_client.chat.completions.create.assert_not_called() # LLM should not be called

@pytest.mark.asyncio
async def test_answer_question_no_courses_for_category(rag_system_instance, mocker):
    """
    Test handling when DocumentLoader returns no courses for the extracted category.
    We need to specifically mock load_documents to return an empty list for a category.
    """
    # Temporarily override the mock_rag_system's load_documents to simulate no courses
    mocker.patch.object(rag_system_instance.loader, 'load_documents', return_value=[])

    prompt = """User's questionnaire responses: {"What are you interested in learning?": ["NonExistentCategory"], "level": "Beginner"}"""
    response = await rag_system_instance.answer_question(prompt)
    parsed_response = json.loads(response)

    assert "couldn't find specific course data" in parsed_response["intro_paragraph"]
    assert not parsed_response["recommended_courses"]
    rag_system_instance.openai_client.chat.completions.create.assert_not_called() # LLM should not be called

@pytest.mark.asyncio
async def test_answer_question_openai_api_error(rag_system_instance, mocker):
    """
    Test handling of OpenAI API errors.
    """
    # Create a mock response object that can be passed to the APIStatusError constructor
    mock_http_response = Mock()
    mock_http_response.status_code = 401
    mock_http_response.headers = {}
    mock_http_response.request = Mock(url="https://api.openai.com/v1/mock_endpoint") # Mock the request attribute and its URL
    mock_http_response.json = Mock(return_value={"error": {"message": "Mock API Error"}}) # Mock json() method if accessed

    # Access the mocked openai_client via the rag_system_instance
    # Provide all required args to the OpenAI error constructor
    mocker.patch.object(rag_system_instance.openai_client.chat.completions, 'create',
                        side_effect=openai.AuthenticationError(
                            "Invalid API Key", # message
                            response=mock_http_response, # required by APIStatusError
                            body={"error": "authentication_error"} # required by APIStatusError
                        ))

    prompt = """User's questionnaire responses: {"What are you interested in learning?": ["Web Development"]}"""
    response = await rag_system_instance.answer_question(prompt)
    parsed_response = json.loads(response)

    assert "There was an issue with the API key" in parsed_response["intro_paragraph"]
    assert not parsed_response["recommended_courses"]


@pytest.mark.asyncio
async def test_answer_question_llm_invalid_json_output(rag_system_instance, mocker):
    """
    Test handling when the LLM outputs malformed JSON despite schema (unlikely but good to test fallback).
    """
    # Simulate LLM returning invalid JSON by patching the method on the mocked client
    mocker.patch.object(rag_system_instance.openai_client.chat.completions, 'create',
                        return_value=mocker.Mock(choices=[mocker.Mock(message=mocker.Mock(content="Definitely not valid JSON"))]))

    prompt = """User's questionnaire responses: {"What are you interested in learning?": ["Web Development"]}"""
    response = await rag_system_instance.answer_question(prompt)
    parsed_response = json.loads(response)

    assert "An internal error occurred while generating the roadmap" in parsed_response["intro_paragraph"]
    assert not parsed_response["recommended_courses"]