# # backend/apis/leadscores/__init__.py
# from fastapi import APIRouter

# # import the routers from filters
# from .filters.get_countries import router as countries_router
# from .filters.get_industries import router as industries_router
# from .filters.get_job_levels import router as job_levels_router
# from .filters.get_job_functions import router as job_functions_router
# from .filters.get_job_titles import router as job_titles_router 
# from .filters.get_employee_sizes import router as employee_sizes_router
# from .filters.get_revenue_sizes import router as revenue_sizes_router
# from .filters.get_campaigns import router as campaigns_router

# router = APIRouter(prefix="/leadscores")

# # endpoints will be mounted under /leadscores/filters/...
# router.include_router(countries_router, prefix="/filters")
# router.include_router(industries_router, prefix="/filters")
# router.include_router(job_levels_router, prefix="/filters")
# router.include_router(job_functions_router, prefix="/filters")
# router.include_router(job_titles_router, prefix="/filters")
# router.include_router(employee_sizes_router, prefix="/filters")
# router.include_router(revenue_sizes_router, prefix="/filters")
# router.include_router(campaigns_router, prefix="/filters")

# backend/apis/leadscores/__init__.py
# backend/apis/leadscores/__init__.py
# backend/apis/leadscores/__init__.py
from fastapi import APIRouter

from .filters import router as filters_router
from .leads import router as leads_router
from .scoring import router as scoring_router
router = APIRouter(
    prefix="/leadscores",
    tags=["LeadScoring"]
)

router.include_router(filters_router)
router.include_router(leads_router)
router.include_router(scoring_router)
