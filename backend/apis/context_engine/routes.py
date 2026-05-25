# # from fastapi import APIRouter
# # from pydantic import BaseModel

# # from .context_memory import get_context, update_context
# # from .context_builder import build_context

# # from .ai_taxonomy_service import (
# #     get_next_field,
# #     generate_next_question
# # )

# # from .prompt_builder import build_cortex_prompt
# # from .cortex_service import query_cortex_analyst

# # from .suggestion_engine import get_suggestions

# # router = APIRouter(prefix="/context", tags=["Context Engine"])


# # class ChatRequest(BaseModel):
# #     session_id: str
# #     message: str


# # @router.post("/chat")
# # def chat(req: ChatRequest):

# #     session_id = req.session_id
# #     user_input = req.message

# #     # -----------------------
# #     # LOAD CONTEXT
# #     # -----------------------
# #     state = get_context(session_id)
# #     context = state["context"]

# #     # -----------------------
# #     # UPDATE CONTEXT
# #     # -----------------------
# #     context = build_context(user_input, context)
# #     update_context(session_id, context)

# #     print("CONTEXT:", context)

# #     # -----------------------
# #     # NEXT FIELD
# #     # -----------------------
# #     next_field = get_next_field(context, user_input)

# #     # -----------------------
# #     # COMPLETE FLOW
# #     # -----------------------
# #     if not next_field:

# #         prompt = build_cortex_prompt(context)
# #         data = query_cortex_analyst(prompt)

# #         return {
# #             "status": "complete",
# #             "context": context,
# #             "data": data,
# #             "suggestions": {}
# #         }

# #     # -----------------------
# #     # QUESTION
# #     # -----------------------
# #     next_question = generate_next_question(context, user_input)

# #     # -----------------------
# #     # SUGGESTIONS (FIXED)
# #     # -----------------------
# #     suggestions = get_suggestions(context, next_field)

# #     return {
# #         "status": "in_progress",
# #         "context": context,
# #         "response": next_question,
# #         "suggestions": suggestions,
# #         "next_field": next_field
# #     }


# # routes.py
# from fastapi import APIRouter
# from pydantic import BaseModel

# from .context_memory import get_context, update_context, reset_context, is_complete
# from .context_builder import build_context
# from .ai_taxonomy_service import (
#     get_next_field,
#     generate_conversational_question,
#     generate_completion_message,
#     FIELD_ORDER,
# )
# from .intent_analyzer import is_off_topic, generate_off_topic_reply
# from .prompt_builder import build_cortex_prompt
# from .cortex_service import query_cortex_analyst
# from .suggestion_engine import get_suggestions

# router = APIRouter(prefix="/context", tags=["Context Engine"])


# class ChatRequest(BaseModel):
#     session_id: str
#     message: str


# class ResetRequest(BaseModel):
#     session_id: str


# @router.post("/chat")
# def chat(req: ChatRequest):
#     session_id = req.session_id
#     user_input = req.message.strip()

#     # ── Load session ──────────────────────────────────────────
#     state = get_context(session_id)
#     context = state["context"]

#     # ── Extract context from user input ──────────────────────
#     context = build_context(user_input, context)
#     update_context(session_id, context)

#     print(f"[Session={session_id}] Context: {context}")

#     # ── Check if off-topic ────────────────────────────────────
#     next_field = get_next_field(context)

#     if next_field and is_off_topic(user_input):
#         from .ai_taxonomy_service import QUESTION_MAP
#         fallback_q = QUESTION_MAP.get(next_field, "")
#         reply = generate_off_topic_reply(user_input, context, fallback_q)
#         suggestions = get_suggestions(context, next_field)
#         return {
#             "status": "in_progress",
#             "context": context,
#             "response": reply,
#             "suggestions": suggestions,
#             "next_field": next_field,
#             "off_topic": True,
#         }

#     # ── All context collected → query Cortex ─────────────────
#     if not next_field:
#         summary = generate_completion_message(context)
#         prompt = build_cortex_prompt(context, user_input)

#         try:
#             data = query_cortex_analyst(prompt)
#         except Exception as e:
#             print(f"[Cortex Error] {e}")
#             data = []

#         return {
#             "status": "complete",
#             "context": context,
#             "summary": summary,
#             "data": data,
#             "suggestions": {},
#         }

#     # ── More context needed ───────────────────────────────────
#     response = generate_conversational_question(context, user_input, next_field)
#     suggestions = get_suggestions(context, next_field)

#     # Track progress for frontend
#     filled_count = sum(1 for f in FIELD_ORDER if context.get(f))
#     total = len(FIELD_ORDER)

#     return {
#         "status": "in_progress",
#         "context": context,
#         "response": response,
#         "suggestions": suggestions,
#         "next_field": next_field,
#         "progress": {
#             "filled": filled_count,
#             "total": total,
#             "percent": round((filled_count / total) * 100),
#         },
#     }


# @router.post("/reset")
# def reset(req: ResetRequest):
#     """Clear session context for a new conversation."""
#     reset_context(req.session_id)
#     return {"status": "reset", "session_id": req.session_id}


# @router.get("/context/{session_id}")
# def get_session_context(session_id: str):
#     """Inspect current context for a session (debug/dev use)."""
#     state = get_context(session_id)
#     return {
#         "session_id": session_id,
#         "context": state["context"],
#         "message_count": state.get("message_count", 0),
#         "complete": is_complete(session_id),
#     }


# routes.py
# ─────────────────────────────────────────────────────────────
# Full pipeline per chat message:
#   1. Build / update context from user input
#   2. If incomplete → ask next question + suggestions
#   3. If complete   →
#        a. Build Cortex prompt → query Snowflake Cortex
#        b. Pass Cortex leads → Insight Engine (Propensity + ICP + Persona)
#        c. Match & filter: keep only leads scored by all models
#        d. AI Validator → summary, validation note, per-lead blurbs
#        e. Return enriched result set to frontend
# ─────────────────────────────────────────────────────────────

from fastapi import APIRouter
from pydantic import BaseModel

from .context_memory    import get_context, update_context, reset_context, is_complete
from .context_builder   import build_context
from .ai_taxonomy_service import (
    get_next_field,
    generate_conversational_question,
    generate_completion_message,
    FIELD_ORDER,
)
from .intent_analyzer   import is_off_topic, generate_off_topic_reply
from .prompt_builder    import build_cortex_prompt
from .cortex_service    import query_cortex_analyst
from .insight_engine    import run_insight_engine
from .ai_validator      import validate_and_enrich
from .suggestion_engine import get_suggestions

router = APIRouter(prefix="/context", tags=["Context Engine"])


class ChatRequest(BaseModel):
    session_id: str
    message: str


class ResetRequest(BaseModel):
    session_id: str


# ══════════════════════════════════════════════════════════════
# CHAT ENDPOINT
# ══════════════════════════════════════════════════════════════

@router.post("/chat")
def chat(req: ChatRequest):
    session_id = req.session_id
    user_input = req.message.strip()

    # ── Load session ──────────────────────────────────────────
    state   = get_context(session_id)
    context = state["context"]

    # ── Extract context from user input ──────────────────────
    context = build_context(user_input, context)
    update_context(session_id, context)

    print(f"[Session={session_id}] Context: {context}")

    # ── Check completion ──────────────────────────────────────
    next_field = get_next_field(context)

    # ── Off-topic guard ───────────────────────────────────────
    if next_field and is_off_topic(user_input):
        from .ai_taxonomy_service import QUESTION_MAP
        reply       = generate_off_topic_reply(user_input, context, QUESTION_MAP.get(next_field, ""))
        suggestions = get_suggestions(context, next_field)
        return {
            "status":      "in_progress",
            "context":     context,
            "response":    reply,
            "suggestions": suggestions,
            "next_field":  next_field,
            "off_topic":   True,
            "progress":    _progress(context),
        }

    # ── Still collecting context ──────────────────────────────
    if next_field:
        response    = generate_conversational_question(context, user_input, next_field)
        suggestions = get_suggestions(context, next_field)
        return {
            "status":      "in_progress",
            "context":     context,
            "response":    response,
            "suggestions": suggestions,
            "next_field":  next_field,
            "progress":    _progress(context),
        }

    # ══════════════════════════════════════════════════════════
    # ALL CONTEXT COLLECTED — RUN FULL PIPELINE
    # ══════════════════════════════════════════════════════════

    summary_msg = generate_completion_message(context)

    # ── Step 1: Cortex query ──────────────────────────────────
    cortex_prompt = build_cortex_prompt(context, user_input)
    try:
        cortex_leads = query_cortex_analyst(cortex_prompt)
        print(f"[Cortex] Returned {len(cortex_leads)} leads")
    except Exception as e:
        print(f"[Cortex Error] {e}")
        cortex_leads = []

    if not cortex_leads:
        return {
            "status":     "complete",
            "context":    context,
            "summary":    summary_msg,
            "response":   "Snowflake Cortex returned no leads for this criteria. Try broadening your filters.",
            "leads":      [],
            "validation": {"valid": False, "notes": "No leads returned from Cortex."},
            "suggestions": {},
        }

    # ── Step 2: Insight Engine (scores all 3 models) ──────────
    try:
        scored_leads = run_insight_engine(cortex_leads)
        print(f"[InsightEngine] {len(scored_leads)} leads passed threshold")
    except Exception as e:
        print(f"[InsightEngine Error] {e}")
        scored_leads = []

    if not scored_leads:
        return {
            "status":     "complete",
            "context":    context,
            "summary":    summary_msg,
            "response":   "Leads were found but none scored above the quality threshold. Try adjusting your targeting.",
            "leads":      [],
            "validation": {"valid": False, "notes": "No leads cleared the quality threshold."},
            "suggestions": {},
        }

    # ── Step 3: AI Validator + enrichment ────────────────────
    try:
        enriched = validate_and_enrich(context, scored_leads)
    except Exception as e:
        print(f"[AIValidator Error] {e}")
        enriched = {
            "summary":    summary_msg,
            "validation": {"valid": True, "notes": ""},
            "leads":      scored_leads,
        }

    return {
        "status":     "complete",
        "context":    context,
        "summary":    enriched.get("summary", summary_msg),
        "validation": enriched.get("validation", {}),
        "leads":      enriched.get("leads", []),
        "suggestions": {},
        "progress":   {"filled": 7, "total": 7, "percent": 100},
    }


# ══════════════════════════════════════════════════════════════
# UTILITY ENDPOINTS
# ══════════════════════════════════════════════════════════════

@router.post("/reset")
def reset(req: ResetRequest):
    reset_context(req.session_id)
    return {"status": "reset", "session_id": req.session_id}


@router.get("/context/{session_id}")
def get_session_context(session_id: str):
    state = get_context(session_id)
    return {
        "session_id":    session_id,
        "context":       state["context"],
        "message_count": state.get("message_count", 0),
        "complete":      is_complete(session_id),
    }


def _progress(context: dict) -> dict:
    filled = sum(1 for f in FIELD_ORDER if context.get(f))
    total  = len(FIELD_ORDER)
    return {"filled": filled, "total": total, "percent": round(filled / total * 100)}