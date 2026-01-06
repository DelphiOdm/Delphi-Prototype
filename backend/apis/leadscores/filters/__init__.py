# backend/apis/leadscores/filters/__init__.py
from fastapi import APIRouter

from .get_countries import router as countries_router
from .get_industries import router as industries_router
from .get_job_levels import router as job_levels_router
from .get_job_functions import router as job_functions_router
from .get_job_titles import router as job_titles_router
from .get_employee_sizes import router as employee_sizes_router
from .get_revenue_sizes import router as revenue_sizes_router
from .get_campaigns import router as campaigns_router

router = APIRouter(prefix="/filters")

router.include_router(countries_router)
router.include_router(industries_router)
router.include_router(job_levels_router)
router.include_router(job_functions_router)
router.include_router(job_titles_router)
router.include_router(employee_sizes_router)
router.include_router(revenue_sizes_router)
router.include_router(campaigns_router)
