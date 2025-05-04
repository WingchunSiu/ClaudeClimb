"""
Preference Agent: Processes and stores student profile preferences
Handles MBTI scores, priorities, and goals/interests
"""
import os
import sys
import asyncio
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

# Fix import path for state_store
# This allows the file to be run directly and also imported as a module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from state_store import StateStore
except ImportError:
    print("WARNING: Could not import StateStore. Some functionality may be limited.")
    # Create a minimal StateStore for standalone testing
    class StateStore:
        _instance = None
        
        @classmethod
        def get_instance(cls):
            if cls._instance is None:
                cls._instance = StateStore()
            return cls._instance
        
        def __init__(self):
            self.mbti_scores = {"ei": 0, "sn": 0, "tf": 0, "jp": 0}
            self.priorities = []
            self.goals_and_interests = {}
            
        def update_mbti(self, ei, sn, tf, jp):
            self.mbti_scores = {"ei": ei, "sn": sn, "tf": tf, "jp": jp}
            
        def update_priorities(self, priorities):
            self.priorities = priorities
            
        def update_goals_and_interests(self, goals_data):
            self.goals_and_interests = goals_data

# ============================================================
# Models
# ============================================================
class MbtiScores(BaseModel):
    ei: int = Field(..., description="Extraversion vs Introversion preference score (0–100)")
    sn: int = Field(..., description="Sensing vs Intuition preference score (0–100)")
    tf: int = Field(..., description="Thinking vs Feeling preference score (0–100)")
    jp: int = Field(..., description="Judging vs Perceiving preference score (0–100)")



class MbtiUpdateRequest(BaseModel):
    """Request to update MBTI scores"""
    scores: MbtiScores = Field(..., description="MBTI scores")


class PrioritiesUpdateRequest(BaseModel):
    """Request to update priorities"""
    priorities: List[str] = Field(..., description="List of career priorities and values")


class GoalsInterestsRequest(BaseModel):
    """Request to update goals and interests"""
    knowsGoals: bool = Field(..., description="Whether the student has a clear vision")
    goalType: Optional[str] = Field(None, description="Type of career goal")
    goals: Optional[str] = Field(None, description="Description of goals and aspirations")
    interests: Optional[str] = Field(None, description="List of interests and hobbies")
    skills: Optional[str] = Field(None, description="List of natural talents and skills")


class ProfileResponse(BaseModel):
    """Response with the current profile state"""
    name: str = Field("", description="Student's name")
    college: str = Field("", description="College name")
    major: str = Field("", description="Major")
    grade: str = Field("", description="Academic year")
    gender: str = Field("", description="Gender")
    mbti_scores: Dict[str, int] = Field(..., description="MBTI scores")
    priorities: List[str] = Field(..., description="List of priorities")
    goals_and_interests: Dict[str, Any] = Field({}, description="Goals and interests data")
    has_web_search_results: bool = Field(..., description="Whether web search results exist")


# ============================================================
# FastAPI Router
# ============================================================
router = APIRouter(prefix="/api", tags=["preferences"])


@router.post("/mbti", response_model=ProfileResponse)
async def update_mbti(request: MbtiUpdateRequest) -> Dict[str, Any]:
    """
    API endpoint to update MBTI scores
    """
    try:
        # Validate MBTI scores (ensure they're within range -10 to +10)
        scores = request.scores
        # in update_mbti():
        for key, value in scores.dict().items():
            if value < 0 or value > 100:
                raise HTTPException(
                    status_code=400,
                    detail=f"MBTI score {key} must be between 0 and 100"
                )

        
        # Update the state store
        store = StateStore.get_instance()
        store.update_mbti(
            ei=scores.ei,
            sn=scores.sn,
            tf=scores.tf,
            jp=scores.jp
        )
        
        # Return the current profile state
        return {
            "name": store.name,
            "college": store.college,
            "major": store.major,
            "grade": store.grade,
            "gender": store.gender,
            "mbti_scores": store.mbti_scores,
            "priorities": store.priorities,
            "goals_and_interests": getattr(store, "goals_and_interests", {}),
            "has_web_search_results": bool(store.web_search_results)
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail=f"Error updating MBTI scores: {str(e)}")


@router.post("/priorities", response_model=ProfileResponse)
async def update_priorities(request: PrioritiesUpdateRequest) -> Dict[str, Any]:
    """
    API endpoint to update priorities
    """
    try:
        # Validate the priorities (ensure there are at least 1 and at most 10)
        if len(request.priorities) < 1:
            raise HTTPException(
                status_code=400,
                detail="At least one priority must be specified"
            )
        
        if len(request.priorities) > 10:
            raise HTTPException(
                status_code=400,
                detail="Too many priorities specified (maximum 10)"
            )
        
        # Update the state store
        store = StateStore.get_instance()
        store.update_priorities(request.priorities)
        
        # Return the current profile state
        return {
            "name": store.name,
            "college": store.college,
            "major": store.major,
            "grade": store.grade,
            "gender": store.gender,
            "mbti_scores": store.mbti_scores,
            "priorities": store.priorities,
            "goals_and_interests": getattr(store, "goals_and_interests", {}),
            "has_web_search_results": bool(store.web_search_results)
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail=f"Error updating priorities: {str(e)}")


@router.post("/goals-interests", response_model=ProfileResponse)
async def update_goals_interests(request: GoalsInterestsRequest) -> Dict[str, Any]:
    """
    API endpoint to update goals and interests
    """
    try:
        # Prepare the goals and interests data
        goals_data = {
            "knowsGoals": request.knowsGoals,
            "goalType": request.goalType if request.knowsGoals else None,
            "goals": request.goals if request.knowsGoals else None,
            "interests": request.interests or "",
            "skills": request.skills or ""
        }
        
        # Update the state store
        store = StateStore.get_instance()
        
        # Check if the state store has the method
        if hasattr(store, "update_goals_and_interests"):
            store.update_goals_and_interests(goals_data)
        else:
            # Fallback if method doesn't exist
            store.goals_and_interests = goals_data
        
        # Return the current profile state
        return {
            "name": store.name,
            "college": store.college,
            "major": store.major,
            "grade": store.grade,
            "gender": store.gender,
            "mbti_scores": store.mbti_scores,
            "priorities": store.priorities,
            "goals_and_interests": getattr(store, "goals_and_interests", {}),
            "has_web_search_results": bool(store.web_search_results)
        }
        
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail=f"Error updating goals and interests: {str(e)}")


@router.get("/profile", response_model=ProfileResponse)
async def get_profile() -> Dict[str, Any]:
    """
    API endpoint to get the current profile state
    """
    try:
        store = StateStore.get_instance()
        
        return {
            "name": store.name,
            "college": store.college,
            "major": store.major,
            "grade": store.grade,
            "gender": store.gender,
            "mbti_scores": store.mbti_scores,
            "priorities": store.priorities,
            "goals_and_interests": getattr(store, "goals_and_interests", {}),
            "has_web_search_results": bool(store.web_search_results)
        }
        
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail=f"Error retrieving profile: {str(e)}")

def interpret_mbti(scores: Dict[str, int]) -> Dict[str, str]:
    return {
        "ei": "Extraverted" if scores["ei"] >= 50 else "Introverted",
        "sn": "Intuitive"   if scores["sn"] >= 50 else "Sensing",
        "tf": "Thinking"    if scores["tf"] >= 50 else "Feeling",
        "jp": "Perceiving"  if scores["jp"] >= 50 else "Judging",
    }


# ============================================================
# Standalone Test Function
# ============================================================
async def test_preference_agent():
    """
    Test function that can be run directly
    """
    print("\n=== Testing Preference Agent ===")
    
    store = StateStore.get_instance()
    store.update_basic_info(
        name="Test Student",
        college="Stanford University",
        major="Computer Science",
        grade="Junior",
        gender="Other"
    )
    
    # Test updating MBTI scores on 0–100 scale
    test_mbti = MbtiScores(
        ei=65,   # Extraverted
        sn=40,   # Sensing
        tf=80,   # Thinking
        jp=30    # Judging
    )
    
    print("\nUpdating MBTI scores...")
    store.update_mbti(
        ei=test_mbti.ei,
        sn=test_mbti.sn,
        tf=test_mbti.tf,
        jp=test_mbti.jp
    )
    
    # Interpret each dimension
    labels = interpret_mbti(store.mbti_scores)
    
    print("MBTI raw scores:", store.mbti_scores)
    print("MBTI interpreted traits:", labels)
    
    # Test updating priorities
    test_priorities = [
        "Work-life balance",
        "Creative problem-solving",
        "High income potential",
        "Remote work options"
    ]
    
    print("\nUpdating priorities...")
    store.update_priorities(test_priorities)
    
    print("Priorities updated:")
    for i, priority in enumerate(store.priorities, 1):
        print(f"{i}. {priority}")
    
    # Test updating goals and interests
    test_goals_interests = {
        "knowsGoals": True,
        "goalType": "industry",
        "goals": "I want to become a tech leader who makes a positive impact through innovation.",
        "interests": "AI, Machine Learning, Photography, Hiking",
        "skills": "Problem Solving, Communication, Programming"
    }
    
    print("\nUpdating goals and interests...")
    if hasattr(store, "update_goals_and_interests"):
        store.update_goals_and_interests(test_goals_interests)
    else:
        store.goals_and_interests = test_goals_interests
    
    # Show the complete profile
    print("\n=== Complete Profile ===")
    print(f"Name: {store.name}")
    print(f"College: {store.college}")
    print(f"Major: {store.major}")
    print(f"Grade: {store.grade}")
    print(f"Gender: {store.gender}")
    print(f"MBTI: {format_mbti(store.mbti_scores)}")
    print(f"Priorities: {', '.join(store.priorities)}")
    
    goals_data = getattr(store, "goals_and_interests", {})
    if goals_data:
        print("\nGoals and Interests:")
        print(f"Clear vision: {'Yes' if goals_data.get('knowsGoals') else 'No'}")
        if goals_data.get('knowsGoals'):
            print(f"Goal type: {goals_data.get('goalType', 'Not specified')}")
            print(f"Goals: {goals_data.get('goals', 'Not specified')}")
        print(f"Interests: {goals_data.get('interests', 'None')}")
        print(f"Skills: {goals_data.get('skills', 'None')}")
    
    print(f"Has web search results: {bool(store.web_search_results)}")
    print("=========================\n")
    
    print("Test completed successfully")
    return store


def format_mbti(scores):
    """Format MBTI scores as a string"""
    mbti_type = ""
    mbti_type += "E" if scores["ei"] > 0 else "I"
    mbti_type += "N" if scores["sn"] > 0 else "S"
    mbti_type += "F" if scores["tf"] > 0 else "T"
    mbti_type += "P" if scores["jp"] > 0 else "J"
    return mbti_type


# ============================================================
# Main Entry Point
# ============================================================
if __name__ == "__main__":
    # Run the test function directly when this file is executed
    asyncio.run(test_preference_agent())