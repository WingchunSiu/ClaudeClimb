"""
Planning Agent: Creates personalized career roadmaps and development plans
Combines all student profile data with chosen career path to generate a detailed plan
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
            self.name = "Alex Johnson"
            self.college = "Stanford University"
            self.major = "Computer Science"
            self.grade = "Junior"
            self.gender = "Non-binary"
            self.web_search_results = "Stanford's Computer Science program is highly regarded..."
            self.mbti_scores = {"ei": 50, "sn": 33, "tf": 40, "jp": 20}
            self.priorities = ["Work-life balance", "Creative problem-solving", "High income potential"]
            self.goals_and_interests = {
                "knowsGoals": True,
                "goalType": "industry",
                "goals": "I want to become a tech leader who makes a positive impact through innovation.",
                "interests": "AI, Machine Learning, Photography, Hiking",
                "skills": "Problem Solving, Communication, Programming"
            }
            self.career_options = []
            self.career_reasoning = {}
            self.selected_career = "Software Engineer"
            self.career_plan = {}
            
        def update_career_options(self, options):
            self.career_options = options
            
        def update_career_reasoning(self, reasoning):
            self.career_reasoning = reasoning
            
        def select_career(self, career):
            self.selected_career = career
            
        def update_career_plan(self, plan):
            self.career_plan = plan
            
        def update_basic_info(self, name, college, major, grade, gender):
            self.name = name
            self.college = college
            self.major = major
            self.grade = grade
            self.gender = gender

# Load environment variables
load_dotenv()

# ============================================================
# Models
# ============================================================
class CareerPlanRequest(BaseModel):
    """Request to generate a career plan"""
    career: str = Field(..., description="The selected career path")


class PlanStep(BaseModel):
    """Step in a career plan"""
    title: str = Field(..., description="Title of the step")
    description: str = Field(..., description="Detailed description of what to do")
    timeline: str = Field(..., description="When to complete this step")
    resources: Optional[List[str]] = Field(None, description="Helpful resources for this step")


class CareerPlanSection(BaseModel):
    """Section of a career plan"""
    title: str = Field(..., description="Title of the section")
    description: str = Field(..., description="Description of this section")
    steps: List[PlanStep] = Field(..., description="Steps in this section")


class CareerPlanResponse(BaseModel):
    """Complete career plan response"""
    career: str = Field(..., description="The selected career path")
    introduction: str = Field(..., description="Personalized introduction to the plan")
    sections: List[CareerPlanSection] = Field(..., description="Sections of the plan")
    conclusion: str = Field(..., description="Final thoughts and encouragement")


# ============================================================
# Helper Functions
# ============================================================
def format_mbti(scores):
    """Format MBTI scores as a type string with percentages"""
    mbti_type = ""
    mbti_type += "E" if scores["ei"] >= 50 else "I"
    mbti_type += "N" if scores["sn"] >= 50  else "S"
    mbti_type += "F" if scores["tf"] >= 50  else "T"
    mbti_type += "P" if scores["jp"] >= 50  else "J"
    
    # Calculate preference strengths (as percentages)
    ei_strength = abs(scores["ei"]) 
    sn_strength = abs(scores["sn"])
    tf_strength = abs(scores["tf"]) 
    jp_strength = abs(scores["jp"]) 
    
    return f"{mbti_type} with:\n" + \
           f"- {ei_strength}% preference for {'Extraversion' if scores['ei'] >= 50  else 'Introversion'}\n" + \
           f"- {sn_strength}% preference for {'Intuition' if scores['sn'] >= 50  else 'Sensing'}\n" + \
           f"- {tf_strength}% preference for {'Feeling' if scores['tf'] >= 50 else 'Thinking'}\n" + \
           f"- {jp_strength}% preference for {'Perceiving' if scores['jp'] >= 50  else 'Judging'}"


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


def get_career_reasoning(store, career):
    """Get the reasoning for a specific career from the career reasoning data"""
    if not hasattr(store, 'career_reasoning') or not store.career_reasoning:
        return "No specific reasoning available for this career."
    
    # Try to find the career in the recommendations
    if "recommendations" in store.career_reasoning:
        for rec in store.career_reasoning["recommendations"]:
            if rec["career"].lower() == career.lower():
                # Extract the explanation
                reasons = []
                for reason in rec["reasons"]:
                    reasons.append(f"{reason['strength']}: {reason['explanation']}")
                
                return "\n\n".join(reasons)
    
    return "No specific reasoning available for this career."


def determine_academic_year(grade):
    """Convert grade to a more specific academic year"""
    grade_lower = grade.lower()
    
    if "freshman" in grade_lower or "first" in grade_lower or "1st" in grade_lower:
        return "first year"
    elif "sophomore" in grade_lower or "second" in grade_lower or "2nd" in grade_lower:
        return "second year"
    elif "junior" in grade_lower or "third" in grade_lower or "3rd" in grade_lower:
        return "third year"
    elif "senior" in grade_lower or "fourth" in grade_lower or "4th" in grade_lower:
        return "final year"
    else:
        return grade

# ============================================================
# Core Logic (Independent of FastAPI)
# ============================================================
async def generate_career_plan(selected_career: str) -> Dict[str, Any]:
    """
    Generate a detailed career plan for the chosen career path
    
    Args:
        selected_career: The career path chosen by the student
        
    Returns:
        A structured career plan
    """
    # Get the state store
    store = StateStore.get_instance()
    
    # Print debug information
    print(f"DEBUG: Student name: {store.name}")
    print(f"DEBUG: College: {store.college}")
    print(f"DEBUG: Major: {store.major}")
    print(f"DEBUG: Grade: {store.grade}")
    print(f"DEBUG: Selected career: {selected_career}")
    
    # Check if basic info is missing
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
    
    # Format goals and interests
    goals_interests_formatted = format_goals_and_interests(getattr(store, "goals_and_interests", {}))
    
    # Get career reasoning
    career_reasoning = get_career_reasoning(store, selected_career)
    
    # Determine academic year for more specific guidance
    academic_year = determine_academic_year(store.grade)
    
    # Create prompt for Claude with personal, empathetic tone
    prompt = f"""
    I'd like you to create a personalized career development plan for {store.name}, a {academic_year} {store.major} student at {store.college}, who wants to pursue a career as a {selected_career}.
    
    Here's {store.name}'s profile:
    
    Major: {store.major}
    Year: {store.grade}
    
    MBTI Personality: {mbti_formatted}
    
    Personal priorities: {", ".join(store.priorities)}
    
    Goals and Interests:
    {goals_interests_formatted}
    
    Information about their college program:
    {store.web_search_results}
    
    Why this career is a good match for them:
    {career_reasoning}
    
    Based on this information, please create a detailed, personalized career development plan for {store.name}. The plan should be tailored to their specific situation as a {store.major} student at {store.college}, and should provide a roadmap for how they can prepare for a career as a {selected_career}.
    
    The plan should include:
    
    1. Relevant coursework they should take
    2. Extracurricular activities they should consider
    3. Internships, research, or work experiences to pursue
    4. Skills they should develop
    5. Networking opportunities and connections to make
    6. Resources available at {store.college} they should utilize
    7. How to relax and have fun considering {store.college}'s location/culture and {store.name}'s interests
    
    Make the plan specific to their current situation - they're a {academic_year} student, so focus on what they can do now and in their remaining time at college.
    
    Write in a warm, personal, and empathetic tone. Address them directly using their name. Be encouraging and supportive, while providing specific, actionable guidance.
    
    Format your plan as a structured JSON object with the following format:
    
    {{
      "career": "{selected_career}",
      "introduction": "A warm, personalized introduction to the plan...",
      "sections": [
        {{
          "title": "Section title (e.g., 'Coursework')",
          "description": "Brief description of this section",
          "steps": [
            {{
              "title": "Step title",
              "description": "Detailed description of what to do",
              "timeline": "When to complete this step",
              "resources": ["Resource 1", "Resource 2", ...]
            }},
            // more steps...
          ]
        }},
        // more sections...
      ],
      "conclusion": "Final thoughts and encouragement..."
    }}
    
    Make sure your plan is:
    1. Specific to {store.name}'s situation
    2. Tailored to {store.college}'s resources and programs
    3. Realistic and achievable
    4. Aligned with their personal priorities and interests
    5. Personalized with their name and details throughout
    6. Written in a warm, supportive tone
    
    This plan will be extremely important for helping {store.name} achieve their career goals, so make it as thoughtful, specific, and helpful as possible.
    """
    
    # Call Claude
    response = client.messages.create(
        model=model,
        max_tokens=5000,
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
                
                # Validate the basic structure
                if "career" in data and "introduction" in data and "sections" in data:
                    # Try to store the plan in the state store
                    try:
                        if hasattr(store, 'update_career_plan'):
                            store.update_career_plan(data)
                    except Exception as e:
                        print(f"Warning: Could not store career plan: {str(e)}")
                    
                    # Update the selected career
                    try:
                        if hasattr(store, 'select_career'):
                            store.select_career(selected_career)
                    except Exception as e:
                        print(f"Warning: Could not update selected career: {str(e)}")
                    
                    # Return the plan
                    return data
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {str(e)}")
            # If JSON parsing fails, try to extract in a different way
            pass
    
    # If we couldn't parse JSON or the response doesn't have the expected structure,
    # return a default response
    raise ValueError("Could not generate career plan. Please try again.")

# ============================================================
# FastAPI Router
# ============================================================
router = APIRouter(prefix="/api", tags=["planning"])

@router.post("/career-plan", response_model=CareerPlanResponse)
async def get_career_plan(request: CareerPlanRequest) -> Dict[str, Any]:
    """
    API endpoint to generate a personalized career development plan
    Uses the state store to access the complete student profile
    """
    try:
        # Generate the career plan
        plan = await generate_career_plan(request.career)
        
        # Return the plan
        return plan
        
    except ValueError as e:
        # Handle expected errors
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail=f"Error generating career plan: {str(e)}")

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
        "ei": 65,   # ≥50 → Extraverted
        "sn": 40,   # <50 → Sensing
        "tf": 80,   # ≥50 → Thinking
        "jp": 30    # <50 → Judging
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
        # Computer Science at Stanford University: Academic Pathways & Resources

## Degree Requirements

### Core Requirements
Stanford's CS program (within the School of Engineering) requires:

- **Math**: CS 103, CS 109, MATH 51
- **Science**: 11 units (PHYSICS 41, 43 common choices)
- **Technology in Society**: CS 182, CS 181, CS 182W
- **Engineering Fundamentals**: CS 106B or 106X
- **Writing**: PWR 1 and PWR 2, plus a Writing in the Major course

### CS Core (26 units)
- CS 103: Mathematical Foundations of Computing
- CS 107: Computer Organization & Systems
- CS 109: Probability for Computer Scientists
- CS 110: Principles of Computer Systems
- CS 111: Operating Systems Principles
- CS 161: Design and Analysis of Algorithms

### Track Requirements
You must complete one of these specialization tracks (20+ units):

- Artificial Intelligence
- Biocomputation
- Computer Engineering
- Graphics
- Human-Computer Interaction
- Information
- Systems
- Theory
- Unspecialized

Each track has specific required and elective courses. For example, the AI track requires CS 221 (Artificial Intelligence) plus electives from areas like machine learning and robotics.

## Academic Resources

- **CS Department Advising**: Assigned faculty advisors plus peer advisors
- **Gates Computer Science Building**: Main hub for CS resources
- **Office Hours**: Most CS courses offer extensive TA and professor office hours
- **LaIR (Learning And Interactive Resources)**: Drop-in tutoring for introductory CS courses
- **SUMO (Stanford Undergraduate Mathematical Organization)**: Peer tutoring for math courses
- **Academic Skills Coaching**: Through the Center for Teaching and Learning

## Career Services & Internships

- **Handshake**: Stanford's job and internship portal
- **BEAM (Bridging Education, Ambition & Meaningful Work)**: Career counseling, resume reviews, interview prep
- **CS-specific career fairs**: Held multiple times annually
- **Company Info Sessions**: Regular recruiting events on campus
- **CS198 Program**: Teaching assistant opportunities for undergraduates
- **CURIS (Computer Research Internship for Undergraduates)**: Summer research program

## Notable CS Faculty

- **Fei-Fei Li**: AI and computer vision pioneer, co-director of Stanford HAI
- **John Hennessy**: Former Stanford president, computer architecture expert
- **Dan Boneh**: Cryptography and computer security expert
- **Daphne Koller**: Probabilistic modeling and machine learning
- **Andrew Ng**: Machine learning and AI pioneer
- **Jennifer Widom**: Database systems and data management

## Specialized Facilities & Centers

- **Stanford Artificial Intelligence Laboratory (SAIL)**
- **Stanford Human-Computer Interaction Group**
- **Stanford SystemX Alliance**: Hardware/software systems research
- **Stanford Institute for Human-Centered AI (HAI)**
- **Stanford Computer Graphics Laboratory**
- **Center for Blockchain Research**
- **Stanford Robotics Laboratory**

For the most current and detailed information, I recommend consulting your official CS department advisor and the Stanford Computer Science website.
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
    
    # Ensure the store has a selected career
    if not hasattr(store, 'selected_career') or not store.selected_career:
        store.selected_career = "Software Engineer"
    
    # Mock career reasoning
    if not hasattr(store, 'career_reasoning') or not store.career_reasoning:
        store.career_reasoning = {
            "recommendations": [
                {
                    "career": "Software Engineer",
                    "score": 90,
                    "description": "Designing, developing, and maintaining software applications and systems.",
                    "reasons": [
                        {
                        "strength": "Strong match with Computer Science degree",
                        "explanation": "Alex's Computer Science degree from Stanford University provides the technical skills and knowledge required to excel as a software engineer. The program's comprehensive curriculum in areas like artificial intelligence, systems, and theory aligns well with the core responsibilities of a software engineer."
                        },
                        {
                        "strength": "Alignment with MBTI personality traits",
                        "explanation": "As an ESFJ, Alex is likely to thrive in a role that involves tangible problem-solving, collaboration, and helping others. Software engineering often requires working with cross-functional teams to develop user-friendly applications, which plays to Alex's strengths in terms of being warm, conscientious, and focused on creating positive outcomes."
                        },
                        {
                        "strength": "Opportunity for creativity and high income potential",
                        "explanation": "Software engineering offers a balance of creative problem-solving and high earning potential, which aligns with Alex's stated priorities. The field allows for innovative thinking and the development of novel solutions, while also providing strong job prospects and competitive salaries, especially at leading tech companies in Silicon Valley."
                        },
                        {
                        "strength": "Availability of internships and career support",
                        "explanation": "Stanford University's strong connections to Silicon Valley and its robust internship program provide Alex with ample opportunities to gain relevant experience and build a professional network in the software engineering field. The university's state-of-the-art facilities and access to leading experts in computer science further enhance Alex's ability to develop the necessary skills and knowledge to succeed as a software engineer."
                        }
                    ]
                }
            ]
        }
    
    print("Test data initialized successfully")
    return store

# ============================================================
# Standalone Test Function
# ============================================================
async def test_planning_agent():
    """
    Test function that can be run directly
    """
    print("\n=== Testing Planning Agent ===")
    
    # Initialize test data first
    store = initialize_test_data()
    print(f"Profile info: {store.name} at {store.college}, studying {store.major}")
    print(f"Selected career: {store.selected_career}")
    
    try:
        # Generate career plan
        career_plan = await generate_career_plan(store.selected_career)
        
        print("\n=== Career Development Plan ===")
        print(f"Career: {career_plan['career']}")
        print(f"\nIntroduction: {career_plan['introduction']}")
        
        for i, section in enumerate(career_plan['sections'], 1):
            print(f"\n{i}. {section['title']}")
            print(f"   {section['description']}")
            
            for j, step in enumerate(section['steps'], 1):
                print(f"   {j}. {step['title']}")
                print(f"      Timeline: {step['timeline']}")
                print(f"      {step['description']}")
                
                if step.get('resources'):
                    print(f"      Resources: {', '.join(step['resources'])}")
        
        print(f"\nConclusion: {career_plan['conclusion']}")
        print("=========================\n")
        
        # Save the plan to a file
        with open("career_plan_results.json", "w") as f:
            json.dump(career_plan, f, indent=2)
        print("Full plan saved to career_plan_results.json")
        
        return career_plan
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
    asyncio.run(test_planning_agent())