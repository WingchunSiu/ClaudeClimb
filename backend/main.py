# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from agents.web_search_agent  import router as web_search_router
from agents.preference_agent  import router as preference_router
from agents.reasoning_agent   import router as reasoning_router
from agents.planning_agent    import router as planning_router

app = FastAPI(title="ClaudeClimb Multi-Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # adjust to your front-end origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all agent routers
app.include_router(web_search_router)   # → POST /api/websearch
app.include_router(preference_router)   # → POST /api/mbti, /api/priorities, /api/goals-interests & GET /api/profile
app.include_router(reasoning_router)    # → GET  /api/career-reasoning
app.include_router(planning_router)     # → POST /api/career-plan

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
