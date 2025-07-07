# -------------------------------
# 📦 Pydantic models
# -------------------------------
from typing import Dict, List, Union
from pydantic import BaseModel


class QuestionnaireRequest(BaseModel):
    questionnaire: Dict[str, Union[str, List[str]]]

class CourseRecommendation(BaseModel):
    id: str
    name: str
    description: str

class PersonalizationResponse(BaseModel):
    intro_paragraph: str
    recommended_courses: List[CourseRecommendation]