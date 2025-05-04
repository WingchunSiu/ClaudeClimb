"""
Simple state store for ClaudeClimb
Stores all application state in a single object
MBTI scores are on a 0–100 scale, with 50 as neutral midpoint
"""

class StateStore:
    """Simple singleton state store"""
    _instance = None
    
    @classmethod
    def get_instance(cls):
        """Get the singleton instance"""
        if cls._instance is None:
            cls._instance = StateStore()
        return cls._instance
    
    def __init__(self):
        """Initialize with default state"""
        # Basic info
        self.name = ""
        self.college = ""
        self.major = ""
        self.grade = ""
        self.gender = ""
        
        # Web search results
        self.web_search_results = ""
        
        # MBTI scores on 0–100 scale (50 = neutral)
        self.mbti_scores = {
            "ei": 50,  # Extraversion vs Introversion
            "sn": 50,  # Sensing vs Intuition
            "tf": 50,  # Thinking vs Feeling
            "jp": 50,  # Judging vs Perceiving
        }
        
        # Priorities
        self.priorities = []
        
        # Goals and interests
        self.goals_and_interests = {
            "knowsGoals": False,
            "goalType": None,
            "goals": None,
            "interests": "",
            "skills": ""
        }
        
        # Career options
        self.career_options = []
        
        # Career reasoning
        self.career_reasoning = {}
        
        # Selected career
        self.selected_career = None
    
    def update_basic_info(self, name, college, major, grade, gender):
        """Update basic info"""
        self.name = name
        self.college = college
        self.major = major
        self.grade = grade
        self.gender = gender
    
    def update_web_search(self, results):
        """Store web search results"""
        self.web_search_results = results
    
    def update_mbti(self, ei, sn, tf, jp):
        """Update MBTI scores (0–100)"""
        self.mbti_scores = {
            "ei": ei,
            "sn": sn,
            "tf": tf,
            "jp": jp,
        }
    
    def update_priorities(self, priorities):
        """Update priorities"""
        self.priorities = priorities
    
    def update_goals_and_interests(self, goals_data):
        """Update goals and interests data"""
        self.goals_and_interests = goals_data
    
    def update_career_options(self, options):
        """Update career options"""
        self.career_options = options
    
    def update_career_reasoning(self, reasoning):
        """Update career reasoning with detailed analysis"""
        self.career_reasoning = reasoning
    
    def select_career(self, career):
        """Select a career"""
        self.selected_career = career
    
    def get_full_profile(self):
        """Get the complete profile as a dictionary"""
        return {
            "basic_info": {
                "name": self.name,
                "college": self.college,
                "major": self.major,
                "grade": self.grade,
                "gender": self.gender,
            },
            "mbti_scores": self.mbti_scores,
            "priorities": self.priorities,
            "goals_and_interests": self.goals_and_interests,
            "web_search_results": self.web_search_results,
        }
