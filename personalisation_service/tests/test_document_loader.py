import pytest
import json
from pathlib import Path

# Import the class to be tested
from app.document_loader import DocumentLoader

def test_load_documents_no_category(temp_documents_dir):
    """
    Test loading all documents without specifying a category.
    """
    loader = DocumentLoader(temp_documents_dir)
    documents = loader.load_documents()

    # Expect documents from all dummy files
    assert len(documents) == 6 # 2 from web_dev, 1 from data_science, 3 from cyber_security
    # Check for presence of known courses
    assert any(d['name'] == 'Test HTML Basics' for d in documents)
    assert any(d['name'] == 'Test Python for Data' for d in documents)
    assert any(d['name'] == 'Introduction to Cyber Security' for d in documents)


def test_load_documents_with_category(temp_documents_dir):
    """
    Test loading documents for a specific category.
    """
    loader = DocumentLoader(temp_documents_dir)

    # Test for 'Web Development'
    web_dev_docs = loader.load_documents(category="Web Development")
    assert len(web_dev_docs) == 2
    assert all(d['category'] == 'Web Development' for d in web_dev_docs)
    assert any(d['name'] == 'Test HTML Basics' for d in web_dev_docs)

    # Test for 'Data Science'
    data_science_docs = loader.load_documents(category="Data Science")
    assert len(data_science_docs) == 1
    assert all(d['category'] == 'Data Science' for d in data_science_docs)
    assert any(d['name'] == 'Test Python for Data' for d in data_science_docs)

    # Test for 'Computer Security' (case-insensitive)
    cyber_security_docs = loader.load_documents(category="computer security")
    assert len(cyber_security_docs) == 3
    assert all(d['category'] == 'Computer Security' for d in cyber_security_docs)
    assert any(d['name'] == 'Cloud Security Essentials' for d in cyber_security_docs)


def test_load_documents_non_existent_category(temp_documents_dir):
    """
    Test loading documents for a category that does not exist.
    """
    loader = DocumentLoader(temp_documents_dir)
    documents = loader.load_documents(category="NonExistentCategory")
    assert len(documents) == 0


def test_load_documents_invalid_json_file(tmp_path: Path):
    """
    Test handling of invalid JSON files in the documents directory.
    """
    test_data_dir = tmp_path / "data" / "documents"
    test_data_dir.mkdir(parents=True, exist_ok=True)
    (test_data_dir / "invalid.json").write_text("This is not JSON {")

    loader = DocumentLoader(test_data_dir)
    # The error will be printed to stdout/stderr, but the function should still return
    # and not crash.
    documents = loader.load_documents()
    assert len(documents) == 0 # No valid documents loaded
    # You could capture stdout/stderr to assert the error message was printed

def test_load_documents_mixed_valid_invalid(tmp_path: Path):
    """
    Test loading when there's a mix of valid and invalid JSON files.
    """
    test_data_dir = tmp_path / "data" / "documents"
    test_data_dir.mkdir(parents=True, exist_ok=True)

    # Valid JSON
    valid_courses = [{"name": "Valid Course", "category": "Valid", "topics": []}]
    with open(test_data_dir / "valid.json", "w", encoding="utf-8") as f:
        json.dump(valid_courses, f)

    # Invalid JSON
    (test_data_dir / "invalid.json").write_text("Definitely not json")

    loader = DocumentLoader(test_data_dir)
    documents = loader.load_documents()
    assert len(documents) == 1
    assert documents[0]['name'] == 'Valid Course'