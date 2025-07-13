import os
import json
from typing import List, Dict, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import openai

# Load environment variables
load_dotenv()

# Pydantic Models for Input Data
class VideoResource(BaseModel):
    resourceId: int
    resourceType: str
    resourceOrder: int
    resourceXp: int
    completedByUser: bool
    name: str
    duration: str
    link: str

class WebResource(BaseModel):
    resourceId: int
    resourceType: str
    resourceOrder: int
    resourceXp: int
    completedByUser: bool
    name: str
    description: str
    link: str

class QuizResource(BaseModel):
    resourceId: int
    resourceType: str
    resourceOrder: int
    resourceXp: int
    completedByUser: bool
    question: str
    option1: str
    option2: str
    option3: str
    option4: str
    correctOption: int
    hint: str
    userSelectedOption: str
    userIsCorrect: bool
    userScore: int
    userQuizCompleted: bool

class CompletedCourse(BaseModel):
    courseId: str
    courseName: str
    courseCategory: str
    levelId: int
    levelName: str
    levelOverallProgressPercentage: float
    totalResourcesInLevel: int
    completedResourcesCount: int
    inProgressResourcesCount: int
    notStartedResourcesCount: int
    videoResources: List[VideoResource]
    webResources: List[WebResource]
    quizResources: List[QuizResource]

class InProgressCourse(BaseModel):
    courseId: str
    courseName: str

class UserProgressData(BaseModel):
    completedCourses: List[CompletedCourse]
    inProgressCourses: List[InProgressCourse]

# Pydantic Model for OpenAI Output
class AIProgressAnalysis(BaseModel):
    overall_paragraph: str = Field(..., description="An overall paragraph summarizing the user's progress.")
    strengths: List[str] = Field(..., min_items=3, max_items=5, description="3 to 5 strengths of the user.")
    recommendations: List[str] = Field(..., min_items=3, max_items=5, description="3 to 5 recommendations for the user.")

app = FastAPI()

class ProgressAnalyzer:
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable not found. Please set it in a .env file.")
        self.openai_client = openai.AsyncOpenAI(api_key=self.api_key)
        self.openai_model = "gpt-4o-2024-08-06" # Or another suitable model

    def _format_user_data_for_prompt(self, data: UserProgressData) -> str:
        completed_courses_str = "Completed Courses:\n"
        if data.completedCourses:
            for course in data.completedCourses:
                completed_courses_str += f"- Course ID: {course.courseId}, Name: {course.courseName}, Category: {course.courseCategory}, Progress: {course.levelOverallProgressPercentage}%\n"
                completed_quizzes = [q for q in course.quizResources if q.completedByUser]
                correct_quizzes = [q for q in completed_quizzes if q.userIsCorrect]
                if completed_quizzes:
                    completed_courses_str += f"  Quizzes Completed: {len(completed_quizzes)}, Correct Answers: {len(correct_quizzes)}/{len(completed_quizzes)}\n"
        else:
            completed_courses_str += "No completed courses.\n"

        in_progress_courses_str = "\nIn Progress Courses:\n"
        if data.inProgressCourses:
            for course in data.inProgressCourses:
                in_progress_courses_str += f"- Course ID: {course.courseId}, Name: {course.courseName}\n"
        else:
            in_progress_courses_str += "No courses currently in progress.\n"
        
        return f"{completed_courses_str}\n{in_progress_courses_str}"

    async def analyze_progress(self, user_data: UserProgressData) -> AIProgressAnalysis:
        formatted_data = self._format_user_data_for_prompt(user_data)

        system_message = (
            "You are an AI assistant specialized in analyzing user learning progress. "
            "Your task is to provide a concise and encouraging analysis of the user's "
            "learning journey based on their completed and in-progress courses. "
            "The analysis should include an overall paragraph, 3-5 specific strengths, "
            "and 3-5 actionable recommendations. "
            "Ensure the output is strictly in the specified JSON format."
        )

        user_message = (
            f"Here is the user's course progress data:\n\n{formatted_data}\n\n"
            "Please provide an AI progress analysis in the following JSON format:\n"
            "{\n"
            "  \"overall_paragraph\": \"<summary_paragraph>\",\n"
            "  \"strengths\": [\n"
            "    \"<strength_1>\",\n"
            "    \"<strength_2>\",\n"
            "    \"<strength_3>\"\n"
            "  ],\n"
            "  \"recommendations\": [\n"
            "    \"<recommendation_1>\",\n"
            "    \"<recommendation_2>\",\n"
            "    \"<recommendation_3>\"\n"
            "  ]\n"
            "}\n"
            "Ensure strengths and recommendations are between 3 and 5 items each."
        )

        try:
            response = await self.openai_client.chat.completions.create(
                model=self.openai_model,
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": user_message},
                ],
                response_format={"type": "json_object"}
            )
            
            raw_response = response.choices[0].message.content
            parsed_response = json.loads(raw_response)
            
            # Validate the parsed response against the Pydantic model
            analysis = AIProgressAnalysis(**parsed_response)
            return analysis

        except openai.APIConnectionError as e:
            raise HTTPException(status_code=500, detail=f"OpenAI API Connection Error: {e}")
        except openai.RateLimitError as e:
            raise HTTPException(status_code=429, detail=f"OpenAI API Rate Limit Exceeded: {e}")
        except openai.AuthenticationError as e:
            raise HTTPException(status_code=401, detail=f"OpenAI API Authentication Error: {e}. Please check your API key.")
        except openai.APIStatusError as e:
            raise HTTPException(status_code=e.status_code, detail=f"OpenAI API Status Error: {e.response}")
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to parse OpenAI response as JSON.")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

analyzer = ProgressAnalyzer()

@app.post("/analyze-progress/", response_model=AIProgressAnalysis)
async def analyze_user_progress(data: UserProgressData):
    """
    Receives user course progress data and generates an AI analysis.
    """
    return await analyzer.analyze_progress(data)

# To run this FastAPI application:
# 1. Save the code as a Python file (e.g., main.py).
# 2. Install necessary libraries: `pip install fastapi uvicorn pydantic python-dotenv openai`
# 3. Create a `.env` file in the same directory with your OpenAI API key: `OPENAI_API_KEY="your_openai_api_key_here"`
# 4. Run the server: `uvicorn main:app --reload`
# 5. Access the API at `http://127.0.0.1:8000/analyze-progress/`