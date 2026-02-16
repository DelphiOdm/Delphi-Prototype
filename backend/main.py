#./backend/main.py
""" 
uvicorn main:app --reload
"""
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apis.leadscores import router as leadscores_router
from apis.dashboard import router as dashboard_router
from apis.ICP import router as icp_router
from apis.ICP.ScoreConfig import router as icp_score_router



load_dotenv()
app = FastAPI()


# CORS
frontend = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount LeadScoring APIs
app.include_router(leadscores_router)
app.include_router(dashboard_router)
app.include_router(icp_router, prefix="/leadscores/scoring")
app.include_router(icp_score_router, prefix="/leadscores/icp/scoring")


@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def root():
    return {"message": "LeadScoring API running"}


