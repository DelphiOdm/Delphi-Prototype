# apis/Persona/__init__.py
from fastapi import APIRouter
from .GeneratePersona import router as generate_persona_router

router = APIRouter()

router.include_router(generate_persona_router)

