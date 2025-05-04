"""
Reasoning Agent: Analyzes student profiles to determine suitable career paths
Provides detailed reasoning for each recommendation
"""
import os
import sys
import asyncio
import json
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from anthropic import Anthropic
from dotenv import load_dotenv

# Fix import path for state_store
# This allows the file to be run directly and also imported as a module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from state_store import StateStore
except ImportError:
    print("WARNING: Could not import StateStore. Creating minimal version...")
    # Create a minimal StateStore for standalone testing
    class StateStore:
        _instance = None
        
        @classmethod
        def get_instance(cls):
            if cls._instance is None:
                cls._instance = StateStore()
            return cls._instance
        
        def __init__(self):
            self.name = "Test Student"
            self.college = "Stanford University"
            self.major = "Computer Science"
            self.grade = "Junior"
            self.gender = "Other"
            self.web_search_results = "Stanford's Computer Science program is highly regarded..."
            self.mbti_scores = {"ei": 5, "sn": 3, "tf": -4, "jp": 2}
            self.priorities = ["Work-life balance", "Creative problem-solving", "High income potential"]
            self.career_options = []
            self.career_reasoning = {}
            
        def update_career_options(self, options):
            self.career_options = options
            
        def update_career_reasoning(self, reasoning):
            self.career_reasoning = reasoning

# Load environment variables
load_dotenv()

# ============================================================
# Models
# ============================================================
class CareerReason(BaseModel):
    """Reason for a career recommendation"""
    strength: str = Field(..., description="A strength or reason why this career fits")
    explanation: str = Field(..., description="Detailed explanation of the strength")


class CareerRecommendation(BaseModel):
    """Career recommendation with detailed reasoning"""
    career: str = Field(..., description="Career title or field")
    score: float = Field(..., description="Match score between 0-100")
    reasons: List[CareerReason] = Field(..., description="List of specific reasons for this recommendation")
    description: str = Field(..., description="Brief description of the career")


class ReasoningResponse(BaseModel):
    """Response from the reasoning agent"""
    recommendations: List[CareerRecommendation] = Field(..., description="List of career recommendations with reasoning")


# ============================================================
# Helper Functions
# ============================================================
def format_mbti(scores):
    """Format MBTI scores as a type string with percentages"""
    mbti_type = ""
    mbti_type += "E" if scores["ei"] > 0 else "I"
    mbti_type += "N" if scores["sn"] > 0 else "S"
    mbti_type += "F" if scores["tf"] > 0 else "T"
    mbti_type += "P" if scores["jp"] > 0 else "J"
    
    # Calculate preference strengths (as percentages)
    ei_strength = abs(scores["ei"]) * 10
    sn_strength = abs(scores["sn"]) * 10
    tf_strength = abs(scores["tf"]) * 10
    jp_strength = abs(scores["jp"]) * 10
    
    return f"{mbti_type} with:\n" + \
           f"- {ei_strength}% preference for {'Extraversion' if scores['ei'] > 0 else 'Introversion'}\n" + \
           f"- {sn_strength}% preference for {'Intuition' if scores['sn'] > 0 else 'Sensing'}\n" + \
           f"- {tf_strength}% preference for {'Feeling' if scores['tf'] > 0 else 'Thinking'}\n" + \
           f"- {jp_strength}% preference for {'Perceiving' if scores['jp'] > 0 else 'Judging'}"


def get_mbti_description(scores):
    """Get a detailed description of the MBTI type"""
    mbti_type = ""
    mbti_type += "E" if scores["ei"] > 0 else "I"
    mbti_type += "N" if scores["sn"] > 0 else "S"
    mbti_type += "F" if scores["tf"] > 0 else "T"
    mbti_type += "P" if scores["jp"] > 0 else "J"
    
    descriptions = {
        "INTJ": "Strategic, independent thinkers who excel at developing innovative solutions to analytical problems.",
        "INTP": "Logical, creative thinkers who enjoy theoretical concepts and finding patterns in complex systems.",
        "ENTJ": "Decisive leaders who naturally organize people and processes to achieve long-term goals.",
        "ENTP": "Innovative, entrepreneurial thinkers who enjoy intellectual challenges and strategic problem-solving.",
        "INFJ": "Insightful, principled individuals who are driven by their strong values and vision.",
        "INFP": "Creative, empathetic idealists who are guided by their core values and desire for meaning.",
        "ENFJ": "Charismatic leaders who inspire others and are driven by a desire to help people grow.",
        "ENFP": "Enthusiastic, creative people who see possibilities everywhere and make connections between ideas.",
        "ISTJ": "Practical, detail-oriented organizers who value reliability and methodical approaches.",
        "ISFJ": "Dedicated, warm protectors who enjoy creating order and helping others in practical ways.",
        "ESTJ": "Efficient organizers who value clear systems and traditions, focused on getting results.",
        "ESFJ": "Warm, conscientious people who seek harmony and enjoy helping others in tangible ways.",
        "ISTP": "Practical problem-solvers who excel at understanding how mechanical things work.",
        "ISFP": "Gentle, sensitive artists who value authenticity and prefer to express themselves through action.",
        "ESTP": "Energetic, realistic people who excel in crisis situations and enjoy living in the moment.",
        "ESFP": "Enthusiastic, friendly performers who bring fun and practical help to others."
    }
    
    return descriptions.get(mbti_type, "Unique personality type with a blend of different preferences.")

# ============================================================
# Core Logic (Independent of FastAPI)
# ============================================================
async def analyze_student_profile() -> List[Dict[str, Any]]:
    """
    Analyze the student profile to recommend careers with detailed reasoning
    
    Returns:
        List of career recommendations with reasons
    """
    # Get the state store
    store = StateStore.get_instance()
    
    # Check for API key
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY environment variable not set")
    
    # Initialize Anthropic client
    client = Anthropic(api_key=api_key)
    model = os.getenv("ANTHROPIC_MODEL", "claude-3-sonnet-20240229")
    
    # Format MBTI type
    mbti_formatted = format_mbti(store.mbti_scores)
    mbti_description = get_mbti_description(store.mbti_scores)
    
    # Create prompt for Claude
    prompt = f"""
    I need detailed career recommendations with specific reasoning for a student with the following profile:
    
    Name: {store.name}
    College: {store.college}
    Major: {store.major}
    Year: {store.grade}
    
    MBTI Type: {mbti_formatted}
    MBTI Description: {mbti_description}
    
    Personal priorities: {", ".join(store.priorities)}
    
    Here's some information about the degree program and resources at their college:
    
    {store.web_search_results}
    
    Please analyze this profile deeply and recommend 4-5 specific career paths that would be excellent matches.
    For each career recommendation:
    
    1. Provide a match score from 0-100
    2. Give 3-4 specific reasons why this career would be a strong match, with detailed explanations for each reason
    3. Consider alignment with:
       - Their MBTI personality traits
       - Their stated priorities
       - Their college major
       - Available resources and strengths of their specific college
       - Current and future job market prospects
    
    Format your response as a structured JSON object with the following format:
    
    {{
      "recommendations": [
        {{
          "career": "Career Title",
          "score": score_number,
          "description": "Brief description of the career",
          "reasons": [
            {{
              "strength": "A specific strength or reason",
              "explanation": "Detailed explanation of why this is a good match"
            }},
            // more reasons...
          ]
        }},
        // more recommendations...
      ]
    }}
    
    Ensure your reasoning is detailed, specific to this student, and shows deep analytical thinking about career fit.
    """
    
    # Call Claude
    response = client.messages.create(
        model=model,
        max_tokens=4000,
        temperature=0.7,
        messages=[{"role": "user", "content": prompt}]
    )
    
    # Extract the text content
    if response.content and len(response.content) > 0:
        content_block = response.content[0]
        if hasattr(content_block, 'text'):
            text_content = content_block.text
        else:
            text_content = str(content_block)
        
        # Try to extract JSON from the response
        try:
            # Find JSON content (look for opening and closing braces)
            json_start = text_content.find('{')
            json_end = text_content.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_content = text_content[json_start:json_end]
                data = json.loads(json_content)
                
                # Validate the structure
                if "recommendations" in data and isinstance(data["recommendations"], list):
                    # Try to store the reasoning in the state store
                    try:
                        # Check if the update_career_reasoning method exists
                        if hasattr(store, 'update_career_reasoning'):
                            store.update_career_reasoning(data)
                    except Exception as e:
                        print(f"Warning: Could not store career reasoning: {str(e)}")
                    
                    # Extract just the career options for the options list
                    career_options = [
                        {"name": rec["career"], "score": rec["score"]}
                        for rec in data["recommendations"]
                    ]
                    
                    # Try to update career options
                    try:
                        if hasattr(store, 'update_career_options'):
                            store.update_career_options(career_options)
                    except Exception as e:
                        print(f"Warning: Could not store career options: {str(e)}")
                    
                    # Return the recommendations
                    return data["recommendations"]
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {str(e)}")
            # If JSON parsing fails, try to extract in a different way
            pass
    
    # If we couldn't parse JSON or the response doesn't have the expected structure,
    # return a default response
    raise ValueError("Could not generate career recommendations. Please try again.")

# ============================================================
# FastAPI Router
# ============================================================
router = APIRouter(prefix="/api", tags=["reasoning"])

@router.get("/career-reasoning", response_model=ReasoningResponse)
async def get_career_reasoning() -> Dict[str, Any]:
    """
    API endpoint to get career recommendations with detailed reasoning
    Uses the state store to access the complete student profile
    """
    try:
        # Get recommendations
        recommendations = await analyze_student_profile()
        
        # Return the recommendations
        return {"recommendations": recommendations}
        
    except ValueError as e:
        # Handle expected errors
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail=f"Error generating career reasoning: {str(e)}")

# ============================================================
# Standalone Test Function
# ============================================================
async def test_reasoning_agent():
    """
    Test function that can be run directly
    """
    print("\n=== Testing Reasoning Agent ===")
    
    try:
        # Generate career recommendations
        recommendations = await analyze_student_profile()
        
        print("\n=== Career Recommendations ===")
        for i, rec in enumerate(recommendations, 1):
            print(f"\n{i}. {rec['career']} (Score: {rec['score']})")
            print(f"   Description: {rec['description']}")
            print(f"   Reasons:")
            for j, reason in enumerate(rec['reasons'], 1):
                print(f"      {j}. {reason['strength']}")
                print(f"         {reason['explanation']}")
        print("=========================\n")
        
        # Save the recommendations to a file
        with open("career_reasoning_results.json", "w") as f:
            json.dump({"recommendations": recommendations}, f, indent=2)
        print("Full results saved to career_reasoning_results.json")
        
        return {"recommendations": recommendations}
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

# ============================================================
# Main Entry Point
# ============================================================
if __name__ == "__main__":
    # Run the test function directly when this file is executed
    asyncio.run(test_reasoning_agent())