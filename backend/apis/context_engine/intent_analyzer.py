# intent_analyzer.py
import json
from .openai_service import ask_gpt

FIELDS = [
    "geography",
    "industry",
    "industry_domain",
    "job_function",
    "job_level",
    "employee_size",
    "revenue_range"
]


def analyze_intent(user_input: str) -> dict:
    """
    Use GPT to extract structured B2B targeting context from free-form user input.
    Returns a dict with only non-empty fields populated.
    """
    prompt = f"""You are an expert B2B marketing strategist.

Analyze the user input and extract targeting context.

Rules:
- Only extract values that are CLEARLY mentioned or strongly implied.
- Leave fields as empty string "" if not mentioned.
- Do NOT guess or hallucinate values.
- geography: country, region, or continent (e.g. "USA", "Europe", "India")
- industry: high-level industry (e.g. "Technology", "Healthcare", "Finance")
- industry_domain: specific sector/sub-industry (e.g. "SaaS", "Banking", "Retail")
- job_function: department/function (e.g. "Sales", "Marketing", "Engineering")
- job_level: seniority level (e.g. "C-Level", "VP", "Manager", "Director")
- employee_size: company size range (e.g. "50-249", "1000+")
- revenue_range: company revenue (e.g. "$25M-$100M", ">$1B")

Return ONLY valid JSON, no explanation, no markdown:
{{
    "geography": "",
    "industry": "",
    "industry_domain": "",
    "job_function": "",
    "job_level": "",
    "employee_size": "",
    "revenue_range": ""
}}

User Input: {user_input}"""

    try:
        response = ask_gpt(prompt, temperature=0.1, max_tokens=300)
        # Strip markdown fences if present
        clean = response.strip().strip("```json").strip("```").strip()
        extracted = json.loads(clean)
        # Return only non-empty string values
        return {k: v for k, v in extracted.items() if v and isinstance(v, str) and v.strip()}
    except Exception as e:
        print(f"[IntentAnalyzer Error] {e}")
        return {}


def is_off_topic(user_input: str) -> bool:
    """
    Detect if user input is completely off-topic for B2B lead targeting.
    """
    prompt = f"""You are a B2B lead targeting assistant.

Determine if the user input is relevant to B2B lead targeting context like:
- geography, industry, sector, job function, job level, company size, revenue

Answer ONLY "yes" if relevant, "no" if completely off-topic.

User Input: {user_input}"""

    try:
        res = ask_gpt(prompt, temperature=0, max_tokens=5)
        return res.lower().strip() == "no"
    except:
        return False


def generate_off_topic_reply(user_input: str, context: dict, next_question: str) -> str:
    """
    Generate a polite, intelligent fallback reply for off-topic input.
    """
    prompt = f"""You are Delphi, a smart B2B lead targeting assistant.

The user said something that is off-topic for lead targeting.

Current context collected so far:
{json.dumps(context, indent=2)}

Next question to ask: "{next_question}"

Write a SHORT, friendly, professional reply that:
1. Acknowledges their input briefly
2. Politely steers back to the task
3. Re-asks the next targeting question naturally

Keep it under 3 sentences. Sound human, not robotic."""

    try:
        return ask_gpt(prompt, temperature=0.7, max_tokens=150)
    except:
        return f"I appreciate your message! Let's continue building your lead filter. {next_question}"