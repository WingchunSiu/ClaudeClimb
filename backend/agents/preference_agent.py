"""
Preference Agent: Processes and stores student profile preferences
Handles MBTI scores and priorities
"""
import os
import sys
import asyncio
from typing import Dict, Any, List
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
            
        def update_mbti(self, ei, sn, tf, jp):
            self.mbti_scores = {"ei": ei, "sn": sn, "tf": tf, "jp": jp}
            
        def update_priorities(self, priorities):
            self.priorities = priorities

# ============================================================
# Models
# ============================================================
class MbtiScores(BaseModel):
    """MBTI scores"""
    ei: int = Field(..., description="Extraversion vs Introversion score (-10 to +10)")
    sn: int = Field(..., description="Sensing vs Intuition score (-10 to +10)")
    tf: int = Field(..., description="Thinking vs Feeling score (-10 to +10)")
    jp: int = Field(..., description="Judging vs Perceiving score (-10 to +10)")


class MbtiUpdateRequest(BaseModel):
    """Request to update MBTI scores"""
    scores: MbtiScores = Field(..., description="MBTI scores")


class PrioritiesUpdateRequest(BaseModel):
    """Request to update priorities"""
    priorities: List[str] = Field(..., description="List of career priorities and values")


class ProfileResponse(BaseModel):
    """Response with the current profile state"""
    name: str = Field("", description="Student's name")
    college: str = Field("", description="College name")
    major: str = Field("", description="Major")
    grade: str = Field("", description="Academic year")
    gender: str = Field("", description="Gender")
    mbti_scores: Dict[str, int] = Field(..., description="MBTI scores")
    priorities: List[str] = Field(..., description="List of priorities")
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
        for key, value in scores.dict().items():
            if value < -10 or value > 10:
                raise HTTPException(
                    status_code=400, 
                    detail=f"MBTI score {key} must be between -10 and +10"
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
            "has_web_search_results": bool(store.web_search_results)
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail=f"Error updating priorities: {str(e)}")


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
            "has_web_search_results": bool(store.web_search_results)
        }
        
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail=f"Error retrieving profile: {str(e)}")


# ============================================================
# Standalone Test Function
# ============================================================
async def test_preference_agent():
    """
    Test function that can be run directly
    """
    print("\n=== Testing Preference Agent ===")
    
    # Get the state store
    store = StateStore.get_instance()
    
    # Simulate basic info (would normally come from web_search_agent)
    store.update_basic_info(
        name="Test Student",
        college="Stanford University",
        major="Computer Science",
        grade="Junior",
        gender="Other"
    )
    
    # Test updating MBTI scores
    test_mbti = MbtiScores(
        ei=5,    # Extraverted
        sn=3,    # Intuitive
        tf=-4,   # Thinking
        jp=2     # Perceiving
    )
    
    print("\nUpdating MBTI scores...")
    store.update_mbti(
        ei=test_mbti.ei,
        sn=test_mbti.sn,
        tf=test_mbti.tf,
        jp=test_mbti.jp
    )
    
    print("MBTI scores updated:")
    print(f"EI: {store.mbti_scores['ei']} (Extraverted)" if store.mbti_scores['ei'] > 0 else f"EI: {store.mbti_scores['ei']} (Introverted)")
    print(f"SN: {store.mbti_scores['sn']} (Intuitive)" if store.mbti_scores['sn'] > 0 else f"SN: {store.mbti_scores['sn']} (Sensing)")
    print(f"TF: {store.mbti_scores['tf']} (Feeling)" if store.mbti_scores['tf'] > 0 else f"TF: {store.mbti_scores['tf']} (Thinking)")
    print(f"JP: {store.mbti_scores['jp']} (Perceiving)" if store.mbti_scores['jp'] > 0 else f"JP: {store.mbti_scores['jp']} (Judging)")
    
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
    
    # Show the complete profile
    print("\n=== Complete Profile ===")
    print(f"Name: {store.name}")
    print(f"College: {store.college}")
    print(f"Major: {store.major}")
    print(f"Grade: {store.grade}")
    print(f"Gender: {store.gender}")
    print(f"MBTI: {format_mbti(store.mbti_scores)}")
    print(f"Priorities: {', '.join(store.priorities)}")
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