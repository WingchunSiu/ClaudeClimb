"""
Pydantic models and tool schemas for the ClaudeClimb application
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# ------------------------------
# Pydantic Models for API Input/Output
# ------------------------------

class BasicInfo(BaseModel):
    """Basic student information"""
    name: str = Field(..., description="Student's full name")
    college: str = Field(..., description="College or university name")
    major: str = Field(..., description="Student's major or field of study")
    grade: str = Field(..., description="Academic year or grade (e.g., Freshman, Sophomore)")
    gender: str = Field(..., description="Student's gender")


class MbtiScores(BaseModel):
    """Myers-Briggs Type Indicator scores"""
    ei: int = Field(..., description="Extraversion vs Introversion score (-10 to +10)")
    sn: int = Field(..., description="Sensing vs Intuition score (-10 to +10)")
    tf: int = Field(..., description="Thinking vs Feeling score (-10 to +10)")
    jp: int = Field(..., description="Judging vs Perceiving score (-10 to +10)")


class StudentProfile(BaseModel):
    """Complete student profile"""
    basic_info: BasicInfo
    mbti_scores: MbtiScores
    priorities: List[str] = Field(..., description="Career priorities and values")
    websearch_results: Optional[str] = Field(None, description="Results from web search")


class WebSearchRequest(BaseModel):
    """Web search request parameters"""
    college: str = Field(..., description="College or university name")
    major: str = Field(..., description="Student's major or field of study")


class WebSearchResponse(BaseModel):
    """Web search response"""
    summary: str = Field(..., description="Summary of degree requirements and resources")


class CareerOption(BaseModel):
    """Career option with score"""
    name: str = Field(..., description="Career title or field")
    score: float = Field(..., description="Match score between 0-100")


class CareerOptionsResponse(BaseModel):
    """Career options response"""
    careers: List[CareerOption] = Field(..., description="List of career options with scores")


class CareerDetailRequest(BaseModel):
    """Career detail request"""
    profile: StudentProfile = Field(..., description="Complete student profile")
    career_name: str = Field(..., description="Selected career name")


class CareerDetailResponse(BaseModel):
    """Career detail response"""
    reasons: List[str] = Field(..., description="Reasons why this career matches the profile")
    roadmap: List[str] = Field(..., description="Step-by-step roadmap to achieve this career")


class MentorResponse(BaseModel):
    """Mentor advice response"""
    advice: str = Field(..., description="Personalized mentorship advice")


# ------------------------------
# Tool Schemas for Claude Function Calling
# ------------------------------

# Web Search Tool Schema
WEB_SEARCH_TOOL = {
    "name": "search_degree_information",
    "description": """
    Search the web for comprehensive information about degree requirements and resources for 
    a specific college major. This tool searches for the latest information on:
    
    1. Formal degree requirements (required courses, electives, credit hours)
    2. Academic resources available (tutoring, libraries, labs, study groups)
    3. Career services and internship opportunities related to the major
    4. Notable professors or researchers in the field at the institution
    5. Specialized facilities, labs, or centers relevant to the major
    
    This is useful when a student needs detailed, up-to-date information about their 
    academic program and available resources at their specific institution.
    """,
    "input_schema": {
        "type": "object",
        "properties": {
            "college": {
                "type": "string", 
                "description": "The name of the college or university"
            },
            "major": {
                "type": "string", 
                "description": "The student's major or field of study"
            },
            "summary": {
                "type": "string", 
                "description": "Comprehensive summary of degree requirements and resources"
            }
        },
        "required": ["summary"]
    }
}

# Career Options Tool Schema
CAREER_OPTIONS_TOOL = {
    "name": "suggest_career_options",
    "description": """
    Generate personalized career recommendations based on a student's profile,
    including their basic information, MBTI personality type, and stated priorities.
    This tool analyzes the compatibility between different careers and the student profile
    to suggest the most suitable options.
    
    Each career option is scored from 0-100 based on:
    1. Alignment with the student's major and academic background
    2. Compatibility with their MBTI personality type traits
    3. Match with their stated priorities and values
    4. Current job market prospects and growth potential
    
    A higher score indicates a stronger match between the career and the student's profile.
    """,
    "input_schema": {
        "type": "object",
        "properties": {
            "careers": {
                "type": "array",
                "description": "List of career options with match scores",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "Career title or field"
                        },
                        "score": {
                            "type": "number",
                            "description": "Match score between 0-100"
                        }
                    },
                    "required": ["name", "score"]
                }
            }
        },
        "required": ["careers"]
    }
}

# Career Detail Tool Schema
CAREER_DETAIL_TOOL = {
    "name": "provide_career_details",
    "description": """
    Generate detailed information about why a specific career is a good match for a student
    and provide a roadmap for pursuing that career. This tool analyzes the student's profile
    (including basic info, MBTI personality type, and priorities) and the selected career
    to produce:
    
    1. A list of specific reasons why the career matches the student's profile, focusing on
       alignment with their major, personality traits, and stated priorities
    2. A detailed roadmap with concrete steps the student should take to pursue this career,
       including courses, skills, experiences, certifications, and post-graduation steps
    
    The output is personalized to the student's specific situation and academic context.
    """,
    "input_schema": {
        "type": "object",
        "properties": {
            "reasons": {
                "type": "array",
                "description": "List of reasons why this career matches the student's profile",
                "items": {
                    "type": "string"
                }
            },
            "roadmap": {
                "type": "array",
                "description": "Step-by-step roadmap for pursuing this career",
                "items": {
                    "type": "string"
                }
            }
        },
        "required": ["reasons", "roadmap"]
    }
}

# Mentor Tool Schema
MENTOR_TOOL = {
    "name": "provide_mentor_advice",
    "description": """
    Generate personalized, motivational mentorship advice for a student regarding their
    chosen career path. This tool considers the student's profile and the selected career
    to craft encouraging, supportive guidance that:
    
    1. Acknowledges the student's choice and connects it to their priorities
    2. Addresses potential challenges they might face in this field
    3. Offers specific motivation and encouragement
    4. Provides a memorable piece of advice or inspirational quote
    
    The advice should feel personal, warm, and supportive - like guidance from a real mentor
    who cares about the student's success and well-being. Use a conversational, empathetic tone
    while keeping it professional.
    """,
    "input_schema": {
        "type": "object",
        "properties": {
            "advice": {
                "type": "string",
                "description": "Personalized mentorship advice"
            }
        },
        "required": ["advice"]
    }
}