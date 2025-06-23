import pytest
import os
import shutil
import json
from pathlib import Path
import numpy as np # Import numpy for mocking embeddings

# Import classes from your application
from app.document_loader import DocumentLoader
from app.embeddings_manager import EmbeddingsManager
from app.rag_system import RAGSystem
import openai # Import openai to patch AsyncOpenAI
from unittest.mock import AsyncMock, Mock # Explicitly import AsyncMock and Mock

# Define a temporary directory for test documents
@pytest.fixture(scope="function")
def temp_documents_dir(tmp_path: Path):
    """
    Fixture to create a temporary 'data/documents' directory for testing DocumentLoader.
    It cleans up after each test function.
    """
    # Create the 'data/documents' structure within the temporary path
    test_data_dir = tmp_path / "data" / "documents"
    test_data_dir.mkdir(parents=True, exist_ok=True)

    # Create dummy course files
    web_dev_courses = [
        {
            "name": "Test HTML Basics",
            "category": "Web Development",
            "topics": ["HTML"],
            "primary_tech": ["HTML"],
            "levels": ["Beginner"],
            "tags": ["frontend"],
            "recommended": True
        },
        {
            "name": "Test CSS Styling",
            "category": "Web Development",
            "topics": ["CSS"],
            "primary_tech": ["CSS"],
            "levels": ["Beginner"],
            "tags": ["frontend"],
            "recommended": True
        }
    ]
    data_science_courses = [
        {
            "name": "Test Python for Data",
            "category": "Data Science",
            "topics": ["Python", "Pandas"],
            "primary_tech": ["Python"],
            "levels": ["Beginner"],
            "tags": ["data analysis"],
            "recommended": True
        }
    ]
    cyber_security_courses = [
        {
            "name": "Introduction to Cyber Security",
            "category": "Computer Security",
            "topics": ["Fundamentals", "Threats"],
            "primary_tech": ["General Security Concepts"],
            "levels": ["Beginner"],
            "tags": ["basics", "security"],
            "recommended": True
        },
        {
            "name": "Cloud Security Essentials",
            "category": "Computer Security",
            "topics": ["AWS Security", "Azure Security", "Cloud Concepts"],
            "primary_tech": ["AWS", "Azure"],
            "levels": ["Intermediate"],
            "tags": ["cloud", "aws", "azure"],
            "recommended": True
        },
        {
            "name": "Secure Coding Practices",
            "category": "Computer Security",
            "topics": ["Secure SDLC", "Vulnerability Prevention"],
            "primary_tech": ["Python", "Java"],
            "levels": ["Intermediate"],
            "tags": ["developer", "coding", "security"],
            "recommended": True
        }
    ]


    with open(test_data_dir / "web_dev.json", "w", encoding="utf-8") as f:
        json.dump(web_dev_courses, f, indent=2)
    with open(test_data_dir / "data_science.json", "w", encoding="utf-8") as f:
        json.dump(data_science_courses, f, indent=2)
    with open(test_data_dir / "cyber_security.json", "w", encoding="utf-8") as f:
        json.dump(cyber_security_courses, f, indent=2)


    # Yield the path to the 'data/documents' directory
    yield test_data_dir

    # Cleanup (optional, tmp_path handles most cleanup but explicit is good)
    # shutil.rmtree(tmp_path) # tmp_path already handles this


@pytest.fixture(scope="function")
def mock_rag_system(mocker):
    """
    Fixture to create a RAGSystem instance with its dependencies mocked.
    This allows testing RAGSystem's internal logic in isolation.
    """
    # 1. Mock os.getenv for API key
    mocker.patch('os.getenv', return_value='test-api-key')

    # 2. Mock the openai.AsyncOpenAI constructor so that any instance
    # of AsyncOpenAI created (e.g., in RAGSystem.__init__) is a mock.
    mock_openai_client_class = mocker.patch('openai.AsyncOpenAI', autospec=True)
    mock_openai_client_instance = mock_openai_client_class.return_value # The actual mock instance

    # Explicitly set up nested mocks for chat.completions.create
    mock_completions_create = AsyncMock()
    mock_completions_create.return_value = mocker.Mock(
        choices=[mocker.Mock(message=mocker.Mock(content=json.dumps({
            "intro_paragraph": "This is a mock introduction.",
            "recommended_courses": [
                {"name": "Mock Course 1", "description": "Description for mock course 1.", "level": "Beginner"},
                {"name": "Mock Course 2", "description": "Description for mock course 2.", "level": "Intermediate"},
                {"name": "Mock Course 3", "description": "Description for mock course 3.", "level": "Advanced"},
                {"name": "Mock Course 4", "description": "Description for mock course 4.", "level": "Beginner"},
                {"name": "Mock Course 5", "description": "Description for mock course 5.", "level": "Intermediate"}
            ],
            "conclusion_paragraph": "This is a mock conclusion."
        })))])

    # Assign the mocked create method to the completions attribute, and completions to chat
    # This correctly builds the mock chain: openai_client.chat.completions.create
    mock_openai_client_instance.chat = Mock()
    mock_openai_client_instance.chat.completions = Mock()
    mock_openai_client_instance.chat.completions.create = mock_completions_create


    # 3. Instantiate RAGSystem. At this point, its openai_client will be the mock instance.
    # Its loader and embeddings_manager will be real instances.
    rag_system = RAGSystem()

    # 4. Now, patch the *methods* of the instances created within RAGSystem.
    # Mock DocumentLoader's load_documents method on the actual loader instance
    mocker.patch.object(rag_system.loader, 'load_documents', side_effect=lambda category: {
        "Web Development": [
            {"name": "Mock Course 1", "category": "Web Development", "topics": ["Mock"], "primary_tech": ["Mock"], "levels": ["Beginner"], "tags": ["mock"], "recommended": True},
            {"name": "Mock Course 2", "category": "Web Development", "topics": ["Mock"], "primary_tech": ["Mock"], "levels": ["Intermediate"], "tags": ["mock"], "recommended": True},
            {"name": "Mock Course 3", "category": "Web Development", "topics": ["Mock"], "primary_tech": ["Mock"], "levels": ["Advanced"], "tags": ["mock"], "recommended": False}
        ],
        "Data Science": [
            {"name": "Mock Course 4", "category": "Data Science", "topics": ["Mock"], "primary_tech": ["Mock"], "levels": ["Beginner"], "tags": ["mock"], "recommended": True},
            {"name": "Mock Course 5", "category": "Data Science", "topics": ["Mock"], "primary_tech": ["Mock"], "levels": ["Intermediate"], "tags": ["mock"], "recommended": False}
        ],
        "Computer Security": [ # Added this for your specific prompt example
            {"name": "Introduction to Cyber Security", "category": "Computer Security", "topics": ["Fundamentals", "Threats"], "primary_tech": ["General Security Concepts"], "levels": ["Beginner"], "tags": ["basics", "security"], "recommended": True},
            {"name": "Cloud Security Essentials", "category": "Computer Security", "topics": ["AWS Security", "Azure Security", "Cloud Concepts"], "primary_tech": ["AWS", "Azure"], "levels": ["Intermediate"], "tags": ["cloud", "aws", "azure"],
            "recommended": True},
            {"name": "Secure Coding Practices", "category": "Computer Security", "topics": ["Secure SDLC", "Vulnerability Prevention"], "primary_tech": ["Python", "Java"], "levels": ["Intermediate"], "tags": ["developer", "coding", "security"], "recommended": True}
        ]
    }.get(category, []))

    # Mock EmbeddingsManager's create_embeddings method on the actual embeddings_manager instance
    mocker.patch.object(rag_system.embeddings_manager, 'create_embeddings', new_callable=AsyncMock, return_value=[
        np.array([0.1, 0.2, 0.3]) # Return a dummy numpy array for embedding
    ])

    yield rag_system # Yield the actual RAGSystem instance with its mocked dependencies