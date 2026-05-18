# # #context_memory.py
# # SESSION_STATE = {}


# # def get_context(session_id):

# #     if session_id not in SESSION_STATE:

# #         SESSION_STATE[session_id] = {
# #             "context": {},
# #             "asked_fields": [],
# #             "conversation_stage": "discovery"
# #         }

# #     return SESSION_STATE[session_id]


# # def update_context(session_id, new_data):

# #     state = get_context(session_id)

# #     for k, v in new_data.items():

# #         if v:
# #             state["context"][k] = v

# #     return state



# # context_memory.py
# from typing import Any

# # In-memory store keyed by session_id
# SESSION_STATE: dict[str, dict] = {}

# REQUIRED_FIELDS = [
#     "geography",
#     "industry",
#     "industry_domain",
#     "job_function",
#     "job_level",
#     "employee_size",
#     "revenue_range",
# ]


# def get_context(session_id: str) -> dict:
#     """Get or initialize session state."""
#     if session_id not in SESSION_STATE:
#         SESSION_STATE[session_id] = {
#             "context": {},
#             "asked_fields": [],
#             "conversation_stage": "discovery",
#             "message_count": 0,
#         }
#     return SESSION_STATE[session_id]


# def update_context(session_id: str, new_data: dict) -> dict:
#     """Merge new data into session context."""
#     state = get_context(session_id)
#     for k, v in new_data.items():
#         if v and str(v).strip():
#             state["context"][k] = v
#     state["message_count"] += 1
#     return state


# def reset_context(session_id: str) -> None:
#     """Clear all session data (for new chat)."""
#     if session_id in SESSION_STATE:
#         del SESSION_STATE[session_id]


# def get_missing_fields(session_id: str) -> list[str]:
#     """Return list of required fields not yet collected."""
#     state = get_context(session_id)
#     ctx = state["context"]
#     return [f for f in REQUIRED_FIELDS if not ctx.get(f)]


# def is_complete(session_id: str) -> bool:
#     """Return True if all required fields are collected."""
#     return len(get_missing_fields(session_id)) == 0


# context_memory.py
from typing import Any

# In-memory store keyed by session_id
SESSION_STATE: dict[str, dict] = {}

REQUIRED_FIELDS = [
    "geography",
    "industry",
    "job_function",
    "job_level",
    "employee_size",
    "revenue_range",
]


def get_context(session_id: str) -> dict:
    """Get or initialize session state."""
    if session_id not in SESSION_STATE:
        SESSION_STATE[session_id] = {
            "context": {},
            "asked_fields": [],
            "conversation_stage": "discovery",
            "message_count": 0,
        }
    return SESSION_STATE[session_id]


def update_context(session_id: str, new_data: dict) -> dict:
    """Merge new data into session context."""
    state = get_context(session_id)
    for k, v in new_data.items():
        if v and str(v).strip():
            state["context"][k] = v
    state["message_count"] += 1
    return state


def reset_context(session_id: str) -> None:
    """Clear all session data (for new chat)."""
    if session_id in SESSION_STATE:
        del SESSION_STATE[session_id]


def get_missing_fields(session_id: str) -> list[str]:
    """Return list of required fields not yet collected."""
    state = get_context(session_id)
    ctx = state["context"]
    return [f for f in REQUIRED_FIELDS if not ctx.get(f)]


def is_complete(session_id: str) -> bool:
    """Return True if all required fields are collected."""
    return len(get_missing_fields(session_id)) == 0