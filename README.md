# ClaudeClimb
**A multi-agent career guidance system powered by Anthropic's Claude models**

[Watch the demo video](https://youtu.be/oSYAOCj3Pow?si=0zaD2TlslhQCF13w)

ClaudeClimb empowers all college students—especially those from under-resourced or under-represented communities—to:
- **Discover degree requirements & resources**  
  Gain equitable access to clear, up-to-date academic pathways, tutoring, advising, and campus support services.
- **Capture personal preferences** (MBTI, priorities, goals)  
  Ensure each student's unique strengths, values, and aspirations are heard and centered.
- **Receive tailored career recommendations**  
  Connect students to meaningful, sustainable career paths that align with both their skills and the needs of society.
- **Generate step-by-step development plans**  
  Provide actionable roadmaps—including coursework, internships, skills workshops, and well-being check-ins—to help every student thrive.

## 🚀 Features
- **Web Search Agent** (`/api/websearch`)  
  - Fetches degree requirements, advising resources, internship opportunities, notable faculty, and campus labs  
  - Caches results in a shared singleton state store  
- **Preference Agent** (`/api/mbti`, `/api/priorities`, `/api/goals-interests`, `/api/profile`)  
  - Stores student profile (name, college, major, grade, gender)  
  - Captures MBTI on a 0–100 scale (50 = neutral), maps to labels (e.g. Extraverted vs Introverted)  
  - Records career priorities and goals/interests  
- **Reasoning Agent** (`/api/career-reasoning`)  
  - Analyzes full profile + web search data  
  - Recommends 4–5 careers with match scores (0–100)  
  - Returns JSON-structured reasoning for each recommendation  
- **Planning Agent** (`/api/career-plan`)  
  - Takes chosen career path + profile data  
  - Generates a personalized roadmap:  
    - Coursework  
    - Extracurriculars & research  
    - Internships & work experiences  
    - Skills development  
    - Networking & campus resources  
    - Work-Life Balance
- **FastAPI Backend**  
  - Single `main.py` mounts four routers under `/api`  
  - CORS enabled for front-end at `http://localhost:3000`  
  - Health check at `GET /api/health`  
- **StateStore** (`state_store.py`)  
  - Singleton holding all application state  
  - Default MBTI midpoint of 50 for each dimension  
---
