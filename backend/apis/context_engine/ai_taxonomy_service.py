# # from .openai_service import ask_gpt

# # REQUIRED_FIELDS = [
# #     "geography",
# #     "industry",
# #     "industry_domain",
# #     "job_function",
# #     "job_level",
# #     "employee_size",
# #     "revenue_range"
# # ]


# # # STRICT ORDER (NON-NEGOTIABLE)
# # ORDER = [
# #     "geography",
# #     "industry",
# #     "industry_domain",
# #     "job_function",
# #     "job_level",
# #     "employee_size",
# #     "revenue_range"
# # ]


# # def get_next_field(context, user_input=""):

# #     # -------------------------
# #     # LLM suggestion (optional)
# #     # -------------------------
# #     prompt = f"""
# # You are a strict routing engine.

# # Pick NEXT field only.

# # Allowed:
# # {REQUIRED_FIELDS}

# # Order priority:
# # {ORDER}

# # Context:
# # {context}

# # Return only one field name.
# # """

# #     try:
# #         res = ask_gpt(prompt, 0).strip()
# #         if res in REQUIRED_FIELDS and not context.get(res):
# #             return res
# #     except:
# #         pass

# #     # -------------------------
# #     # HARD RULE FALLBACK
# #     # -------------------------
# #     for field in ORDER:
# #         if not context.get(field):
# #             return field

# #     return None


# # QUESTION_MAP = {
# #     "geography": "Which geography would you like to target?",
# #     "industry": "Which industry are you targeting?",
# #     "industry_domain": "Which domain or sector does your product belong to?",
# #     "job_function": "Which department or job function are you targeting?",
# #     "job_level": "What seniority level should we focus on?",
# #     "employee_size": "What employee size range should we target?",
# #     "revenue_range": "What company revenue range should we focus on?"
# # }


# # def generate_next_question(context, user_input=""):
# #     field = get_next_field(context, user_input)
# #     return QUESTION_MAP.get(field)


# # ai_taxonomy_service.py
# import json
# from .openai_service import ask_gpt

# REQUIRED_FIELDS = [
#     "geography",
#     "industry",
#     "industry_domain",
#     "job_function",
#     "job_level",
#     "employee_size",
#     "revenue_range",
# ]

# # Fixed priority order
# FIELD_ORDER = [
#     "geography",
#     "industry",
#     "industry_domain",
#     "job_function",
#     "job_level",
#     "employee_size",
#     "revenue_range",
# ]

# QUESTION_MAP = {
#     "geography":       "Which geography are you targeting? (e.g. USA, Europe, India)",
#     "industry":        "Which industry are you focusing on?",
#     "industry_domain": "Which specific sector or domain within that industry?",
#     "job_function":    "Which department or job function are you targeting?",
#     "job_level":       "What seniority level should we focus on?",
#     "employee_size":   "What company size range are you targeting?",
#     "revenue_range":   "What annual revenue range should the companies have?",
# }

# FIELD_LABELS = {
#     "geography":       "Geography",
#     "industry":        "Industry",
#     "industry_domain": "Sector / Domain",
#     "job_function":    "Job Function",
#     "job_level":       "Seniority Level",
#     "employee_size":   "Company Size",
#     "revenue_range":   "Revenue Range",
# }


# def get_next_field(context: dict) -> str | None:
#     """Return the next required field not yet in context, in strict order."""
#     for field in FIELD_ORDER:
#         if not context.get(field):
#             return field
#     return None


# def generate_next_question(context: dict) -> str | None:
#     """Return the question for the next missing field."""
#     field = get_next_field(context)
#     return QUESTION_MAP.get(field) if field else None


# def generate_conversational_question(
#     context: dict,
#     user_input: str,
#     next_field: str
# ) -> str:
#     """
#     Generate a context-aware, conversational question using GPT.
#     Falls back to static question if GPT fails.
#     """
#     filled = {k: v for k, v in context.items() if v}
#     base_question = QUESTION_MAP.get(next_field, "")
#     field_label = FIELD_LABELS.get(next_field, next_field)

#     prompt = f"""You are Delphi, a smart B2B lead targeting assistant.

# Context collected so far:
# {json.dumps(filled, indent=2)}

# User's last message: "{user_input}"

# Now ask about: {field_label}

# Write ONE short, conversational question (max 2 sentences) that:
# 1. Acknowledges what the user just told you (briefly, naturally)
# 2. Asks for: {base_question}
# 3. Sounds like a helpful consultant, not a form

# Do NOT use filler phrases like "Great!" or "Awesome!" or "Perfect!".
# Do NOT use bullet points.
# Be direct and warm."""

#     try:
#         reply = ask_gpt(prompt, temperature=0.6, max_tokens=120)
#         return reply if reply else base_question
#     except:
#         return base_question


# def generate_completion_message(context: dict) -> str:
#     """
#     Generate a summary message when all context is collected.
#     """
#     prompt = f"""You are Delphi, a B2B lead targeting assistant.

# The user has provided all required targeting context:
# {json.dumps(context, indent=2)}

# Write a SHORT confirmation message (2-3 sentences) that:
# 1. Confirms you have all the information
# 2. Summarizes the targeting criteria in plain English
# 3. Says you are now fetching the best matching leads

# Be direct and professional. No fluff."""

#     try:
#         return ask_gpt(prompt, temperature=0.5, max_tokens=150)
#     except:
#         return "Perfect, I have all the information I need. Fetching your best matching leads now..."


# ai_taxonomy_service.py
import json
from .openai_service import ask_gpt

REQUIRED_FIELDS = [
    "geography",
    "industry",
    "job_function",
    "job_level",
    "employee_size",
    "revenue_range",
]

# Fixed priority order
FIELD_ORDER = [
    "geography",
    "industry",
    "industry_domain",
    "job_function",
    "job_level",
    "employee_size",
    "revenue_range",
]

QUESTION_MAP = {
    "geography":       "Which geography are you targeting? (e.g. USA, Europe, India)",
    "industry":        "Which industry are you focusing on?",
    "industry_domain": "Which specific sector or domain within that industry?",
    "job_function":    "Which department or job function are you targeting?",
    "job_level":       "What seniority level should we focus on?",
    "employee_size":   "What company size range are you targeting?",
    "revenue_range":   "What annual revenue range should the companies have?",
}

FIELD_LABELS = {
    "geography":       "Geography",
    "industry":        "Industry",
    "industry_domain": "Sector / Domain",
    "job_function":    "Job Function",
    "job_level":       "Seniority Level",
    "employee_size":   "Company Size",
    "revenue_range":   "Revenue Range",
}


def get_next_field(context: dict) -> str | None:
    """Return the next required field not yet in context, in strict order."""
    for field in FIELD_ORDER:
        if not context.get(field):
            return field
    return None


def generate_next_question(context: dict) -> str | None:
    """Return the question for the next missing field."""
    field = get_next_field(context)
    return QUESTION_MAP.get(field) if field else None


def generate_conversational_question(
    context: dict,
    user_input: str,
    next_field: str
) -> str:
    """
    Generate a context-aware, conversational question using GPT.
    Falls back to static question if GPT fails.
    """
    filled = {k: v for k, v in context.items() if v}
    base_question = QUESTION_MAP.get(next_field, "")
    field_label = FIELD_LABELS.get(next_field, next_field)

    prompt = f"""You are Delphi, a smart B2B lead targeting assistant.

Context collected so far:
{json.dumps(filled, indent=2)}

User's last message: "{user_input}"

Now ask about: {field_label}

Write ONE short, conversational question (max 2 sentences) that:
1. Acknowledges what the user just told you (briefly, naturally)
2. Asks for: {base_question}
3. Sounds like a helpful consultant, not a form

Do NOT use filler phrases like "Great!" or "Awesome!" or "Perfect!".
Do NOT use bullet points.
Be direct and warm."""

    try:
        reply = ask_gpt(prompt, temperature=0.6, max_tokens=120)
        return reply if reply else base_question
    except:
        return base_question


def generate_completion_message(context: dict) -> str:
    """
    Generate a summary message when all context is collected.
    """
    prompt = f"""You are Delphi, a B2B lead targeting assistant.

The user has provided all required targeting context:
{json.dumps(context, indent=2)}

Write a SHORT confirmation message (2-3 sentences) that:
1. Confirms you have all the information
2. Summarizes the targeting criteria in plain English
3. Says you are now fetching the best matching leads

Be direct and professional. No fluff."""

    try:
        return ask_gpt(prompt, temperature=0.5, max_tokens=150)
    except:
        return "Perfect, I have all the information I need. Fetching your best matching leads now..."