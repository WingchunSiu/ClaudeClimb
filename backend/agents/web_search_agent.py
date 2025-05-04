"""
Web Search Agent: Searches for degree requirements and resources
Uses the simple state store to save results
"""
import os
import sys
import asyncio
from typing import Dict, Any
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
            self.name = "Test Student"
            self.college = ""
            self.major = ""
            self.grade = "Junior"
            self.gender = "Other"
            self.web_search_results = ""
        
        def update_basic_info(self, name, college, major, grade, gender):
            self.name = name
            self.college = college
            self.major = major
            self.grade = grade
            self.gender = gender
        
        def update_web_search(self, results):
            self.web_search_results = results

# Load environment variables
load_dotenv()

# ============================================================
# Models
# ============================================================
class WebSearchRequest(BaseModel):
    """Request model for web search"""
    college: str = Field(..., description="College or university name")
    major: str = Field(..., description="Student's major or field of study")
    name: str = Field(..., description="Student's name")
    grade: str = Field(..., description="Academic year or grade")
    gender: str = Field(..., description="Student's gender")

class WebSearchResponse(BaseModel):
    """Response model for web search results"""
    summary: str = Field(..., description="Summary of degree requirements and resources")

# ============================================================
# Core Logic (Independent of FastAPI)
# ============================================================
async def perform_web_search(college: str, major: str) -> str:
    """
    Core web search functionality 
    Can be used directly or through the API
    
    Args:
        college: Name of the college
        major: Major of study
        
    Returns:
        Summary text
    """
    # Check for API key
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY environment variable not set")
    
    # Initialize Anthropic client
    client = Anthropic(api_key=api_key)
    model = os.getenv("ANTHROPIC_MODEL", "claude-3-7-sonnet-20250219")
    
    # Create prompt for Claude
    prompt = f"""
    I'm a student at {college} studying {major}.
    Can you search the web for information about:
    
    1. The degree requirements for my major at my specific college, including
       core courses plan, electives, and any specializations 
       available(include class code).
    2. Available academic resources, such as tutoring, advising, or study groups
    3. Career services and internship opportunities related to my major
    4. Notable professors or researchers in my field at this institution
    5. Any specialized facilities, labs, or centers relevant to my major
    
    Please provide a comprehensive but concise summary that I can use to better
    understand the academic pathways and resources available to me.
    """
    
    # Call Claude
    response = client.messages.create(
        model=model,
        max_tokens= 4000,
        temperature=0.7,
        messages=[{"role": "user", "content": prompt}]
    )
    
    # Extract the text content
    if response.content and len(response.content) > 0:
        content_block = response.content[0]
        if hasattr(content_block, 'text'):
            return content_block.text
        return str(content_block)
    else:
        raise ValueError("No content in response")

# ============================================================
# FastAPI Router
# ============================================================
router = APIRouter(prefix="/api", tags=["websearch"])

@router.post("/websearch", response_model=WebSearchResponse)
async def get_degree_information(request: WebSearchRequest) -> Dict[str, Any]:
    """
    API endpoint to get degree information via web search
    Also stores basic info and search results in the state store
    """
    try:
        # Save basic info to the state store
        store = StateStore.get_instance()
        store.update_basic_info(
            name=request.name,
            college=request.college,
            major=request.major,
            grade=request.grade,
            gender=request.gender
        )
        
        # Perform the web search
        summary = await perform_web_search(request.college, request.major)
        
        # Save the web search results to the state store
        store.update_web_search(summary)
        
        # Return the summary
        return {"summary": summary}
        
    except ValueError as e:
        # Handle expected errors
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail=f"Error retrieving degree information: {str(e)}")

# ============================================================
# Standalone Test Function
# ============================================================
async def test_web_search():
    """
    Test function that can be run directly
    """
    print("\n=== Testing Web Search Agent ===")
    
    college = "Stanford University"
    major = "Computer Science"
    
    print(f"Testing for {college}, {major}")
    
    try:
        # Use the core logic function directly
        summary = await perform_web_search(college, major)
        
        # Save to the state store
        store = StateStore.get_instance()
        store.update_basic_info(
            name="Test Student",
            college=college,
            major=major,
            grade="Junior",
            gender="Other"
        )
        store.update_web_search(summary)
        
        print("\n=== Web Search Results ===")
        print(f"Summary length: {len(summary)} characters")
        print(f"Summary (first 300 chars):\n{summary[:300]}...")
        print("=========================\n")
        
        # Save the full response to a file
        with open("web_search_results.txt", "w") as f:
            f.write(summary)
        print("Full results saved to web_search_results.txt")
        
        return {"summary": summary}
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
    asyncio.run(test_web_search())