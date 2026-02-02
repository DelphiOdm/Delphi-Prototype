# backend/apis/ICP/__init__.py
from fastapi import APIRouter
from .generate_ICP import router as generate_tal_router

router = APIRouter()
router.include_router(generate_tal_router)
