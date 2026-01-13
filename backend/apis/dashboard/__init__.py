# backend/apis/dashboard/__init__.py
from fastapi import APIRouter
from .monthly_stats import router as monthly_router
from .top_leads import router as top_leads_router

router = APIRouter(prefix="/dashboard")

router.include_router(monthly_router)
router.include_router(top_leads_router)