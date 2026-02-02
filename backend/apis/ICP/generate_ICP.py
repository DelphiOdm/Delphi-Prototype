# backend/apis/ICP/generate_tal.py
from fastapi import APIRouter

router = APIRouter(prefix="/leadscores", tags=["ICP Demo"])

@router.post("/generate-tal-demo")
async def generate_tal_demo():
    return {
        "data": [
            {"lead_id":"256486","company":"Zoho Corp","industry":"SaaS","job_title":"VP IT","icp_fit":88,"propensity":92,"quadrant":"Q1 – Core Growth Engine","action":"Immediate sales follow-up"},
            {"lead_id":"652356","company":"Paytm","industry":"BFSI","job_title":"Director Ops","icp_fit":82,"propensity":45,"quadrant":"Q2 – Future Pipeline","action":"Nurture (case studies, webinars)"},
            {"lead_id":"365214","company":"Global Health","industry":"Healthcare","job_title":"CIO","icp_fit":74,"propensity":78,"quadrant":"Q1 – Core Growth Engine","action":"Assign senior sales rep"},
            {"lead_id":"785256","company":"DMart","industry":"Retail","job_title":"IT Manager","icp_fit":48,"propensity":83,"quadrant":"Q3 – Opportunistic","action":"Tactical close if low effort"},
            {"lead_id":"965236","company":"Udemy","industry":"Education","job_title":"Admin Lead","icp_fit":42,"propensity":38,"quadrant":"Q4 – De-prioritize","action":"Archive / long-term nurture"},
            {"lead_id":"789445","company":"CloudNova","industry":"SaaS","job_title":"CTO","icp_fit":91,"propensity":63,"quadrant":"Q2 – Future Pipeline","action":"High-touch ABM nurture"},
            {"lead_id":"963852","company":"DHL","industry":"Logistics","job_title":"Ops Head","icp_fit":55,"propensity":72,"quadrant":"Q3 – Opportunistic","action":"Conditional pursuit"},
            {"lead_id":"741852","company":"Lombard","industry":"Insurance","job_title":"CXO","icp_fit":87,"propensity":29,"quadrant":"Q2 – Future Pipeline","action":"Warm-up campaigns"},
            {"lead_id":"254256","company":"XYZ Media","industry":"Media","job_title":"Marketing Lead","icp_fit":34,"propensity":61,"quadrant":"Q3 – Opportunistic","action":"Low-cost email follow-up"},
            {"lead_id":"365456","company":"Goldman Sachs","industry":"BFSI","job_title":"CIO","icp_fit":90,"propensity":88,"quadrant":"Q1 – Core Growth Engine","action":"Fast-track to proposal"}
        ]
    }
