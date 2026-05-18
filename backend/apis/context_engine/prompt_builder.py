# # # # # prompt_builder.py
# # # # def build_cortex_prompt(context: dict) -> str:

# # # #     parts = []

# # # #     if context.get("geography"):
# # # #         parts.append(f"in {context['geography']}")

# # # #     if context.get("industry"):
# # # #         parts.append(f"targeting {context['industry']} companies")

# # # #     if context.get("employee_size"):
# # # #         parts.append(f"with {context['employee_size']} employees")

# # # #     if context.get("revenue_range"):
# # # #         parts.append(f"having revenue {context['revenue_range']}")

# # # #     if context.get("job_function"):
# # # #         parts.append(f"for {context['job_function']} function")

# # # #     if context.get("job_level"):
# # # #         job_level = context['job_level'].replace("-", " ")
# # # #         parts.append(f"at {job_level} level")

# # # #     sentence = "Find companies " + ", ".join(parts)
# # # #     print(sentence)
# # # #     return sentence


# # # # prompt_builder.py

# # # import re

# # # def extract_limit(text: str) -> int:
# # #     """
# # #     Tries to extract limit like:
# # #     - top 10
# # #     - limit 20
# # #     - show 7
# # #     """
# # #     if not text:
# # #         return 5

# # #     patterns = [
# # #         r"top\s+(\d+)",
# # #         r"limit\s+(\d+)",
# # #         r"show\s+(\d+)"
# # #     ]

# # #     for pattern in patterns:
# # #         match = re.search(pattern, text.lower())
# # #         if match:
# # #             return int(match.group(1))

# # #     return 5


# # # def build_cortex_prompt(context: dict, user_query: str = "") -> str:

# # #     parts = []

# # #     # Default limit logic
# # #     limit = extract_limit(user_query)

# # #     # Geography
# # #     if context.get("geography"):
# # #         parts.append(f"in {context['geography']}")

# # #     # Industry
# # #     if context.get("industry"):
# # #         parts.append(f"where industry is {context['industry']}")

# # #     # Job Function
# # #     if context.get("job_function"):
# # #         parts.append(f"for job function {context['job_function']}")

# # #     # Job Level
# # #     if context.get("job_level"):
# # #         job_level = context["job_level"].replace("-", " ")
# # #         parts.append(f"at job level {job_level}")

# # #     # Build final sentence
# # #     sentence = "Find leads " + " and ".join(parts)

# # #     # Always enforce TOP N behavior
# # #     sentence += f" ordered by lead score descending limit {limit}"

# # #     print(sentence)
# # #     return sentence

# # # prompt_builder.py
# # def build_cortex_prompt(context):

# #     parts = []

# #     if context.get("industry"):
# #         parts.append(f"industry = {context['industry']}")

# #     if context.get("geography"):
# #         parts.append(f"geography = {context['geography']}")

# #     if context.get("job_function"):
# #         parts.append(f"job function = {context['job_function']}")

# #     if context.get("job_level"):
# #         parts.append(f"job level = {context['job_level']}")

# #     sentence = "Find leads where " + " and ".join(parts)

# #     sentence += " ordered by lead score desc limit 10"

# #     return sentence


# # prompt_builder.py
# import re


# def _extract_limit(user_query: str) -> int:
#     """Extract numeric limit from phrases like 'top 10', 'show 20'."""
#     if not user_query:
#         return 10
#     patterns = [r"top\s+(\d+)", r"limit\s+(\d+)", r"show\s+(\d+)", r"get\s+(\d+)"]
#     for pattern in patterns:
#         match = re.search(pattern, user_query.lower())
#         if match:
#             return int(match.group(1))
#     return 10


# def build_cortex_prompt(context: dict, user_query: str = "") -> str:
#     """
#     Build a natural language prompt for Snowflake Cortex Analyst
#     based on collected context.
#     """
#     parts = []
#     limit = _extract_limit(user_query)

#     if context.get("geography"):
#         parts.append(f"geography is {context['geography']}")

#     if context.get("industry"):
#         parts.append(f"industry is {context['industry']}")

#     if context.get("industry_domain"):
#         parts.append(f"sector is {context['industry_domain']}")

#     if context.get("job_function"):
#         parts.append(f"job function is {context['job_function']}")

#     if context.get("job_level"):
#         parts.append(f"job level is {context['job_level']}")

#     if context.get("employee_size"):
#         parts.append(f"employee size is {context['employee_size']}")

#     if context.get("revenue_range"):
#         parts.append(f"revenue range is {context['revenue_range']}")

#     if not parts:
#         return "Find top leads ordered by lead score descending limit 10"

#     criteria = " and ".join(parts)
#     prompt = f"Find top leads where {criteria} ordered by lead score descending limit {limit}"

#     print(f"[CortexPrompt] {prompt}")
#     return prompt



# prompt_builder.py
import re


def _extract_limit(user_query: str) -> int:
    """Extract numeric limit from phrases like 'top 10', 'show 20'."""
    if not user_query:
        return 10
    patterns = [r"top\s+(\d+)", r"limit\s+(\d+)", r"show\s+(\d+)", r"get\s+(\d+)"]
    for pattern in patterns:
        match = re.search(pattern, user_query.lower())
        if match:
            return int(match.group(1))
    return 10


def build_cortex_prompt(context: dict, user_query: str = "") -> str:
    """
    Build a natural language prompt for Snowflake Cortex Analyst
    based on collected context.
    """
    parts = []
    limit = _extract_limit(user_query)

    if context.get("geography"):
        parts.append(f"geography is {context['geography']}")

    if context.get("industry"):
        parts.append(f"industry is {context['industry']}")

    # if context.get("industry_domain"):
    #     parts.append(f"sector is {context['industry_domain']}")

    if context.get("job_function"):
        parts.append(f"job function is {context['job_function']}")

    if context.get("job_level"):
        parts.append(f"job level is {context['job_level']}")

    if context.get("employee_size"):
        parts.append(f"employee size is {context['employee_size']}")

    if context.get("revenue_range"):
        parts.append(f"revenue range is {context['revenue_range']}")

    if not parts:
        return "Find top leads ordered by lead_id descending limit 10"

    criteria = " and ".join(parts)
    prompt = f"Find top leads where {criteria} ordered by lead_id descending limit {limit}"

    print(f"[CortexPrompt] {prompt}")
    return prompt