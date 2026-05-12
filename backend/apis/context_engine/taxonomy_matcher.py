# # # taxonomy_matcher.py
# # from .taxonomy_service import (
# #     get_industries,
# #     get_industry_domains,
# #     get_job_functions,
# #     get_job_levels,
# #     get_employee_sizes,
# #     get_revenue_ranges,
# #     is_valid_geography
# # )

# # from .openai_service import ask_gpt


# # def llm_match(user_input: str, options: list):

# #     if not options:
# #         return None

# #     prompt = f"""
# # Pick best match only.

# # Input: {user_input}
# # Options: {options}

# # Return ONLY one match or NONE.
# # """

# #     try:
# #         res = ask_gpt(prompt, 0).strip()
# #         if res.upper() == "NONE":
# #             return None
# #         return res if res in options else None
# #     except:
# #         return None


# # def match_taxonomy_value(user_input: str):

# #     text = user_input.lower().strip()
# #     data = {}

# #     # -----------------------
# #     # INDUSTRY
# #     # -----------------------
# #     industries = get_industries()
# #     match = llm_match(user_input, industries)

# #     if match:
# #         data["industry"] = match

# #     # -----------------------
# #     # DOMAIN / SECTOR (FIXED)
# #     # -----------------------
# #     domains = get_industry_domains()

# #     match = llm_match(user_input, domains)
# #     if match:
# #         data["industry_domain"] = match

# #     # fallback keyword match (IMPORTANT)
# #     if "industry_domain" not in data:
# #         for d in domains:
# #             if d.lower() in text:
# #                 data["industry_domain"] = d
# #                 break

# #     # -----------------------
# #     # JOB FUNCTION
# #     # -----------------------
# #     functions = get_job_functions()
# #     match = llm_match(user_input, functions)
# #     if match:
# #         data["job_function"] = match

# #     # -----------------------
# #     # JOB LEVEL
# #     # -----------------------
# #     levels = get_job_levels()
# #     match = llm_match(user_input, levels)
# #     if match:
# #         data["job_level"] = match

# #     # -----------------------
# #     # EMPLOYEE SIZE
# #     # -----------------------
# #     sizes = get_employee_sizes()
# #     match = llm_match(user_input, sizes)
# #     if match:
# #         data["employee_size"] = match

# #     # -----------------------
# #     # REVENUE
# #     # -----------------------
# #     revenues = get_revenue_ranges()
# #     match = llm_match(user_input, revenues)
# #     if match:
# #         data["revenue_range"] = match

# #     # -----------------------
# #     # GEOGRAPHY
# #     # -----------------------
# #     if is_valid_geography(text):
# #         data["geography"] = user_input.title()

# #     return data



# # taxonomy_matcher.py
# from difflib import get_close_matches
# from .taxonomy_service import (
#     get_industries,
#     get_industry_domains,
#     get_job_functions,
#     get_job_levels,
#     get_employee_sizes,
#     get_revenue_ranges,
#     is_valid_geography,
# )
# from .openai_service import ask_gpt


# def _fuzzy_match(user_input: str, options: list, cutoff: float = 0.5) -> str | None:
#     """Fast fuzzy match without LLM."""
#     text = user_input.lower().strip()
#     # Direct substring match first
#     for opt in options:
#         if text in opt.lower() or opt.lower() in text:
#             return opt
#     # Fuzzy fallback
#     matches = get_close_matches(user_input, options, n=1, cutoff=cutoff)
#     return matches[0] if matches else None


# def _llm_match(user_input: str, options: list) -> str | None:
#     """
#     Use LLM to pick the best matching option.
#     Only called when fuzzy match fails.
#     """
#     if not options:
#         return None

#     prompt = f"""Match the user input to exactly ONE option from the list below.

# User Input: "{user_input}"
# Options: {options}

# Rules:
# - Return ONLY the exact matching option text
# - Return NONE if nothing matches
# - No explanation, no quotes"""

#     try:
#         res = ask_gpt(prompt, temperature=0, max_tokens=50).strip().strip('"').strip("'")
#         if res.upper() == "NONE" or res not in options:
#             return None
#         return res
#     except:
#         return None


# def match_taxonomy_value(user_input: str) -> dict:
#     """
#     Match user free-form input against all taxonomy fields.
#     Returns a dict of matched field → value pairs.
#     """
#     text = user_input.lower().strip()
#     data = {}

#     # --- GEOGRAPHY ---
#     if is_valid_geography(text):
#         data["geography"] = user_input.strip().title()

#     # --- INDUSTRY ---
#     industries = get_industries()
#     match = _fuzzy_match(user_input, industries) or _llm_match(user_input, industries)
#     if match:
#         data["industry"] = match

#     # --- INDUSTRY DOMAIN ---
#     domains = get_industry_domains()
#     match = _fuzzy_match(user_input, domains) or _llm_match(user_input, domains)
#     if match:
#         data["industry_domain"] = match

#     # --- JOB FUNCTION ---
#     functions = get_job_functions()
#     match = _fuzzy_match(user_input, functions) or _llm_match(user_input, functions)
#     if match:
#         data["job_function"] = match

#     # --- JOB LEVEL ---
#     levels = get_job_levels()
#     match = _fuzzy_match(user_input, levels) or _llm_match(user_input, levels)
#     if match:
#         data["job_level"] = match

#     # --- EMPLOYEE SIZE ---
#     sizes = get_employee_sizes()
#     match = _fuzzy_match(user_input, sizes, cutoff=0.8)
#     if match:
#         data["employee_size"] = match

#     # --- REVENUE RANGE ---
#     revenues = get_revenue_ranges()
#     match = _fuzzy_match(user_input, revenues, cutoff=0.8)
#     if match:
#         data["revenue_range"] = match

#     return data


# taxonomy_matcher.py
from difflib import get_close_matches
from .taxonomy_service import (
    get_industries,
    get_industry_domains,
    get_job_functions,
    get_job_levels,
    get_employee_sizes,
    get_revenue_ranges,
    is_valid_geography,
)
from .openai_service import ask_gpt


def _fuzzy_match(user_input: str, options: list, cutoff: float = 0.5) -> str | None:
    """Fast fuzzy match without LLM."""
    text = user_input.lower().strip()
    # Direct substring match first
    for opt in options:
        if len(text) >= 4:
            if text in opt.lower() or opt.lower() in text:
                return opt
    # Fuzzy fallback
    matches = get_close_matches(user_input, options, n=1, cutoff=cutoff)
    return matches[0] if matches else None


def _llm_match(user_input: str, options: list) -> str | None:
    """
    Use LLM to pick the best matching option.
    Only called when fuzzy match fails.
    """
    if not options:
        return None

    prompt = f"""Match the user input to exactly ONE option from the list below.

User Input: "{user_input}"
Options: {options}

Rules:
- Return ONLY the exact matching option text
- Return NONE if nothing matches
- No explanation, no quotes"""

    try:
        res = ask_gpt(prompt, temperature=0, max_tokens=50).strip().strip('"').strip("'")
        if res.upper() == "NONE" or res not in options:
            return None
        return res
    except:
        return None


def match_taxonomy_value(user_input: str) -> dict:
    """
    Match user free-form input against all taxonomy fields.
    Returns a dict of matched field → value pairs.
    """
    text = user_input.lower().strip()
    data = {}

    # --- GEOGRAPHY ---
    if is_valid_geography(text):
        data["geography"] = user_input.strip().title()

    # --- INDUSTRY ---
    industries = get_industries()
    match = _fuzzy_match(user_input, industries) or _llm_match(user_input, industries)
    if match:
        data["industry"] = match

    # --- INDUSTRY DOMAIN ---
    domains = get_industry_domains()
    match = _fuzzy_match(user_input, domains) or _llm_match(user_input, domains)
    if match:
        data["industry_domain"] = match

    # --- JOB FUNCTION ---
    functions = get_job_functions()
    match = _fuzzy_match(user_input, functions) or _llm_match(user_input, functions)
    if match:
        data["job_function"] = match

    # --- JOB LEVEL ---
    levels = get_job_levels()
    match = _fuzzy_match(user_input, levels) or _llm_match(user_input, levels)
    if match:
        data["job_level"] = match

    # --- EMPLOYEE SIZE ---
    sizes = get_employee_sizes()
    match = _fuzzy_match(user_input, sizes, cutoff=0.8)
    if match:
        data["employee_size"] = match

    # --- REVENUE RANGE ---
    revenues = get_revenue_ranges()
    match = _fuzzy_match(user_input, revenues, cutoff=0.8)
    if match:
        data["revenue_range"] = match

    return data