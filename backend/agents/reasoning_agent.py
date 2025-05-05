"""
Reasoning Agent: Analyzes student profile data and generates career recommendations
Uses MBTI scores, priorities, goals, and interests to suggest suitable career paths
"""
import os
import sys
import asyncio
import json
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from anthropic import Anthropic
from dotenv import load_dotenv

# Fix import path for state_store
# This allows the file to be run directly and also imported as a module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from state_store import StateStore

# Load environment variables
load_dotenv()

# ============================================================
# Models
# ============================================================
class CareerReason(BaseModel):
    """Reason for a career recommendation"""
    strength: str = Field(..., description="Strength of the match (e.g., 'Strong match with Computer Science degree')")
    explanation: str = Field(..., description="Detailed explanation of why this career is a good match")


class CareerRecommendation(BaseModel):
    """Career recommendation with reasoning"""
    career: str = Field(..., description="Career title")
    score: int = Field(..., description="Match score (0-100)")
    description: str = Field(..., description="Brief description of the career")
    reasons: List[CareerReason] = Field(..., description="List of reasons why this career is a good match")


class ReasoningResponse(BaseModel):
    """Response from the reasoning agent"""
    recommendations: List[CareerRecommendation] = Field(..., description="List of career recommendations")


# ============================================================
# Helper Functions
# ============================================================
def format_mbti(scores):
    """Format MBTI scores as a type string with percentages"""
    mbti_type = ""
    mbti_type += "E" if scores["ei"] >= 50 else "I"
    mbti_type += "N" if scores["sn"] >= 50 else "S"
    mbti_type += "F" if scores["tf"] >= 50 else "T"
    mbti_type += "P" if scores["jp"] >= 50 else "J"
    
    # Calculate preference strengths (as percentages)
    ei_strength = abs(scores["ei"]) 
    sn_strength = abs(scores["sn"]) 
    tf_strength = abs(scores["tf"]) 
    jp_strength = abs(scores["jp"]) 
    
    return f"{mbti_type} with:\n" + \
           f"- {ei_strength}% preference for {'Extraversion' if scores['ei'] >= 50 else 'Introversion'}\n" + \
           f"- {sn_strength}% preference for {'Intuition' if scores['sn'] >= 50 else 'Sensing'}\n" + \
           f"- {tf_strength}% preference for {'Feeling' if scores['tf'] >= 50 else 'Thinking'}\n" + \
           f"- {jp_strength}% preference for {'Perceiving' if scores['jp'] >= 50 else 'Judging'}"


def get_mbti_description(scores):
    """Get a detailed description of the MBTI type"""
    mbti_type = ""
    mbti_type += "E" if scores["ei"] >= 50 else "I"
    mbti_type += "N" if scores["sn"] >= 50 else "S"
    mbti_type += "F" if scores["tf"] >= 50 else "T"
    mbti_type += "P" if scores["jp"] >= 50 else "J"
    
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


def format_goals_and_interests(goals_data):
    """Format goals and interests data for the prompt"""
    if not goals_data:
        return "No specific goals or interests provided."
    
    result = ""
    
    # Handle goals
    if goals_data.get("knowsGoals", False):
        goal_type_mapping = {
            "industry": "Industry Professional",
            "academia": "Research & Academia",
            "entrepreneurship": "Entrepreneurship",
            "creative": "Creative Arts",
            "other": "Other Path"
        }
        
        goal_type = goal_type_mapping.get(goals_data.get("goalType", ""), "Not specified")
        
        result += f"Career Direction: {goal_type}\n"
        if goals_data.get("goals"):
            result += f"Personal Goals: {goals_data.get('goals')}\n"
    else:
        result += "Career Direction: Not yet determined\n"
    
    # Handle interests
    if goals_data.get("interests"):
        interests = [i.strip() for i in goals_data.get("interests", "").split(",") if i.strip()]
        if interests:
            result += f"Interests & Passions: {', '.join(interests)}\n"
    
    # Handle skills
    if goals_data.get("skills"):
        skills = [s.strip() for s in goals_data.get("skills", "").split(",") if s.strip()]
        if skills:
            result += f"Natural Talents: {', '.join(skills)}\n"
    
    return result

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
    
    # Print debug information
    print(f"DEBUG: Student name: {store.name}")
    print(f"DEBUG: College: {store.college}")
    print(f"DEBUG: Major: {store.major}")
    print(f"DEBUG: Grade: {store.grade}")
    
    # Check if basic info is missing - we shouldn't proceed without it
    if not store.name or not store.college or not store.major:
        raise ValueError("Basic student information is missing. Please complete the profile first.")
    
    # Check for API key
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY environment variable not set")
    
    # Initialize Anthropic client
    client = Anthropic(api_key=api_key)
    model = os.getenv("ANTHROPIC_MODEL", "claude-3-7-sonnet-20250219")
    
    # Format MBTI type
    mbti_formatted = format_mbti(store.mbti_scores)
    mbti_description = get_mbti_description(store.mbti_scores)
    
    # Format goals and interests
    goals_interests_formatted = format_goals_and_interests(getattr(store, "goals_and_interests", {}))
    
    # Create prompt for Claude with explicit major info
    prompt = f"""
    I need detailed career recommendations with specific reasoning for a student with the following profile:
    
    Name: {store.name}
    College: {store.college}
    Major: {store.major}
    Year: {store.grade}
    
    MBTI Type: {mbti_formatted}
    MBTI Description: {mbti_description}
    
    Personal priorities: {", ".join(store.priorities)}
    
    Goals and Interests:
    {goals_interests_formatted}
    
    Here's some information about the degree program and resources at their college:
    
    {store.web_search_results}
    
    Please analyze this profile deeply and recommend 4-5 specific career paths that would be excellent matches.
    The student is majoring in {store.major} at {store.college}, so make sure to consider this
    academic background in your recommendations.
    
    For each career recommendation:
    
    1. Provide a match score from 0-100
    2. Give 3-4 specific reasons why this career would be a strong match, with detailed explanations for each reason
    3. Consider alignment with:
       - Their MBTI personality traits
       - Their stated priorities
       - Their college major ({store.major})
       - Their goals, interests, and natural talents
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
    
    IMPORTANT: The student's major is {store.major}, so make sure your recommendations align with this academic background.
    Ensure your reasoning is detailed, specific to this student, and shows deep analytical thinking about career fit.
    """
    
    # Print the prompt for debugging
    print(f"DEBUG: Prompt includes major: {store.major}")
    
    # Call Claude
    response = client.messages.create(
        model=model,
        max_tokens=4000,
        temperature=0,
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

@router.post("/reason", response_model=ReasoningResponse)
async def generate_recommendations() -> Dict[str, Any]:
    """
    API endpoint to generate career recommendations
    Uses the state store to access the complete student profile
    """
    try:
        # Get the state store instance
        store = StateStore.get_instance()
        
        # Log which agent is accessing the state store
        print(f"Reasoning agent accessing StateStore instance: {store.get_instance_id()}")
        
        # Check for API key
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable not set")
        
        # Initialize Anthropic client
        client = Anthropic(api_key=api_key)
        model = os.getenv("ANTHROPIC_MODEL", "claude-3-7-sonnet-20250219")
        
        # Format MBTI type
        mbti_type = ""
        mbti_type += "E" if store.mbti_scores["ei"] >= 50 else "I"
        mbti_type += "N" if store.mbti_scores["sn"] >= 50 else "S"
        mbti_type += "F" if store.mbti_scores["tf"] >= 50 else "T"
        mbti_type += "P" if store.mbti_scores["jp"] >= 50 else "J"
        
        # Create prompt for Claude
        prompt = f"""
        I need you to analyze a student's profile and suggest suitable career paths. Here's their information:

        Name: {store.name}
        College: {store.college}
        Major: {store.major}
        Grade: {store.grade}
        Gender: {store.gender}

        MBTI Type: {mbti_type}
        MBTI Scores:
        - Extraversion/Introversion: {store.mbti_scores["ei"]}% (≥50% is Extraverted)
        - Sensing/Intuition: {store.mbti_scores["sn"]}% (≥50% is Intuitive)
        - Thinking/Feeling: {store.mbti_scores["tf"]}% (≥50% is Feeling)
        - Judging/Perceiving: {store.mbti_scores["jp"]}% (≥50% is Perceiving)

        Priorities: {", ".join(store.priorities)}

        Goals and Interests:
        {format_goals_and_interests(getattr(store, "goals_and_interests", {}))}

        Based on this information, please suggest 5 career paths that would be a good match for this student.
        For each career, provide:
        1. A match score (0-100)
        2. A brief description of the career
        3. 3-4 specific reasons why this career would be a good match, considering their:
           - Major and academic background
           - MBTI personality type and preferences
           - Stated priorities and values
           - Goals and interests
           - Natural talents and skills

        Format your response as a JSON object with the following structure:
        {{
          "recommendations": [
            {{
              "career": "Career Title",
              "score": 85,
              "description": "Brief description of the career",
              "reasons": [
                {{
                  "strength": "Strength of the match",
                  "explanation": "Detailed explanation"
                }}
              ]
            }}
          ]
        }}

        Make sure your recommendations are:
        1. Realistic and achievable with their background
        2. Aligned with their personality type and preferences
        3. Matched to their stated priorities and values
        4. Supported by specific, detailed reasoning
        5. Varied in terms of different career paths
        """
        
        # Call Claude
        response = client.messages.create(
            model=model,
            max_tokens=4000,
            temperature=0,
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
                    
                    # Store the recommendations in the state store
                    store.career_reasoning = data
                    
                    return data
            except json.JSONDecodeError as e:
                print(f"JSON parsing error: {str(e)}")
                raise HTTPException(status_code=500, detail="Failed to parse reasoning agent response")
        
        raise HTTPException(status_code=500, detail="Failed to generate career recommendations")
        
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

def interpret_mbti(scores: Dict[str, int]) -> Dict[str, str]:
    return {
        "ei": "Extraverted" if scores["ei"] >= 50 else "Introverted",
        "sn": "Intuitive"   if scores["sn"] >= 50 else "Sensing",
        "tf": "Thinking"    if scores["tf"] >= 50 else "Feeling",
        "jp": "Perceiving"  if scores["jp"] >= 50 else "Judging",
    }


# ============================================================
# Initialize Test Data
# ============================================================
def initialize_test_data():
    """Initialize state store with test data for standalone testing"""
    store = StateStore.get_instance()
    
    # Ensure the store has basic info
    if not store.name or not store.college or not store.major:
        # These values are used only for testing
        store.update_basic_info(
            name="Alex Johnson",
            college="Stanford University",
            major="Computer Science",
            grade="Junior",
            gender="Non-binary"
        )
    
    # Ensure the store has MBTI scores
    if not store.mbti_scores or all(v == 50 for v in store.mbti_scores.values()):
        store.mbti_scores = {
            "ei": 65,   # Extraverted
            "sn": 40,   # Sensing
            "tf": 80,   # Thinking
            "jp": 30    # Judging
        }
    
    # Ensure the store has priorities
    if not store.priorities:
        store.priorities = [
            "Work-life balance",
            "Creative problem-solving",
            "High income potential",
            "Remote work options"
        ]
    
    # Ensure the store has web search results
    if not store.web_search_results:
        store.web_search_results = """
        Stanford University's Computer Science program is one of the top-ranked in the world.
        The program offers a comprehensive curriculum covering areas such as artificial intelligence,
        systems, theory, and human-computer interaction. Stanford has strong connections to Silicon Valley
        and offers numerous internship opportunities, entrepreneurship programs, and research positions.
        The university has state-of-the-art facilities and labs, and students have access to leading
        professors and researchers in the field.
        """
    
    # Ensure the store has goals and interests
    if not hasattr(store, 'goals_and_interests') or not store.goals_and_interests:
        store.goals_and_interests = {
            "knowsGoals": True,
            "goalType": "industry",
            "goals": "I want to become a tech leader who makes a positive impact through innovation.",
            "interests": "AI, Machine Learning, Photography, Hiking",
            "skills": "Problem Solving, Communication, Programming"
        }
    
    print("Test data initialized successfully")
    return store

# ============================================================
# Standalone Test Function
# ============================================================
async def test_reasoning_agent():
    """
    Test function that can be run directly
    """
    print("\n=== Testing Reasoning Agent ===")
    
    # Initialize test data first
    store = initialize_test_data()
    print(f"Profile info: {store.name} at {store.college}, studying {store.major}")
    print("MBTI raw scores:", store.mbti_scores)
    print("MBTI interpreted traits:", interpret_mbti(store.mbti_scores))

    
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