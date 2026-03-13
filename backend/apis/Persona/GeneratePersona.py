# # ./backend/apis/Persona/GeneratePersona.py
# import math
# from typing  import Optional
# from fastapi import APIRouter, Query, HTTPException
# from db      import get_conn          # synchronous mysql.connector pool

# router = APIRouter()
# TIER_ORDER = {
#     "Tier 1": 1,
#     "Tier 2": 2,
#     "Tier 3": 3,
#     "Tier 4": 4
# }


# # ================================================================
# # BUSINESS LOGIC HELPERS  (from Delphi Insights documentation)
# # ================================================================

# def derive_persona(job_level_desc: str, persona_tier: str) -> str:
#     """
#     Maps Job Level + Persona Tier → Persona label

#     CXO / C-Suite  + Tier 1-2  →  Economic Buyer
#     CXO / C-Suite  + Tier 3-4  →  Technical Buyer
#     Director / VP  + Tier 1-2  →  Champion
#     Director / VP  + Tier 3-4  →  Operational Influencer
#     Manager                    →  Evaluator
#     Senior / Lead / Principal  →  Technical Evaluator
#     Procurement / Admin        →  Gatekeeper
#     Others                     →  Influencer
#     """
#     level = (job_level_desc or "").strip().lower()
#     tier  = (persona_tier   or "Tier 4").strip()

#     if any(k in level for k in ["cxo", "c-suite", "chief", "ceo", "cio",
#                                   "cto", "cfo", "president"]):
#         return "Economic Buyer" if tier in ("Tier 1", "Tier 2") else "Technical Buyer"

#     if any(k in level for k in ["director", "vp", "vice president", "head"]):
#         return "Champion" if tier in ("Tier 1", "Tier 2") else "Operational Influencer"

#     if "manager" in level:
#         return "Evaluator"

#     if any(k in level for k in ["senior", "lead", "principal", "architect"]):
#         return "Technical Evaluator"

#     if any(k in level for k in ["procurement", "purchasing", "admin"]):
#         return "Gatekeeper"

#     return "Influencer"


# def derive_persona_role(
#     persona: str,
#     persona_tier: str,
#     engagement_score: float,
# ) -> str:
#     """
#     Persona Role from documentation:
#       Decision Maker   – Final approval authority
#       Internal Advocate– High-engagement champion
#       Champion         – Drives deal internally
#       Influencer       – Shapes decision
#       Blocker          – Slows or blocks progress
#     """
#     tier = (persona_tier or "Tier 4").strip()

#     if persona == "Economic Buyer":
#         return "Decision Maker"

#     if persona == "Champion" or (tier == "Tier 1" and engagement_score >= 70):
#         return "Internal Advocate" if engagement_score >= 75 else "Champion"

#     if persona == "Gatekeeper" or tier == "Tier 4":
#         return "Blocker"

#     if persona in ("Technical Buyer", "Technical Evaluator",
#                    "Evaluator", "Operational Influencer"):
#         return "Influencer"

#     return "Influencer"


# def derive_combined_priority(
#     icp_score: float,
#     propensity_score: float,
#     persona_tier: str,
# ) -> str:
#     """
#     Combined Priority from documentation Master Table:
#       Very High : ICP >= 85  AND  Propensity >= 75  AND  Tier 1
#       High      : (ICP >= 70 AND  Propensity >= 60) OR   Tier 1
#       Medium    : ICP >= 50  OR   Propensity >= 50
#       Low       : ICP >= 40  OR   Propensity >= 30
#       Very Low  : Everything else
#     """
#     tier = (persona_tier or "Tier 4").strip()

#     if icp_score >= 70 and propensity_score >= 80 and tier == "Tier 1":
#         return "Very High"

#     if (icp_score >= 50 or propensity_score >= 60) and tier == "Tier 2":
#         return "High"

#     if (icp_score >= 40 or propensity_score >= 50) and tier == "Tier 3":
#         return "Medium"

#     if (icp_score >= 30 or propensity_score >= 30) and tier == "Tier 4":
#         return "Low"

#     return "Very Low"


# def derive_recommended_action(
#     combined_priority: str,
#     persona_role: str,
#     persona: str,
# ) -> str:
#     """
#     Recommended Action from documentation
#     Master Persona × ICP × Propensity Table.
#     """
#     if combined_priority == "Very High":
#         if persona_role == "Decision Maker":
#             return "Fast-track to proposal"
#         if persona_role in ("Internal Advocate", "Champion"):
#             return "Equip with sales enablement"
#         return "Accelerate consensus building"

#     if combined_priority == "High":
#         if persona_role == "Decision Maker":
#             return "Personalized executive outreach"
#         if persona_role in ("Internal Advocate", "Champion"):
#             return "Equip with sales enablement"
#         if persona in ("Technical Buyer", "Technical Evaluator"):
#             return "Deep-dive architecture call"
#         if persona == "Evaluator":
#             return "Technical demo + validation"
#         return "Engage and qualify"

#     if combined_priority == "Medium":
#         if persona_role == "Decision Maker":
#             return "Nurture with ROI content"
#         if persona_role == "Blocker":
#             return "Deprioritize / monitor"
#         return "Tactical short-cycle close"

#     # Low / Very Low
#     if persona_role == "Blocker":
#         return "Suppress from active outreach"

#     return "Deprioritize / monitor"


# # ================================================================
# # HELPER : run a stored procedure and return all rows as dicts
# # ================================================================

# def call_proc(cursor, proc_name: str, args: list) -> list[dict]:
#     """
#     Calls a stored procedure and returns all result rows as
#     a list of dicts keyed by column name.

#     mysql.connector stores OUT results via stored_results()
#     after callproc() — we iterate every result set to find rows.
#     """
#     cursor.callproc(proc_name, args)

#     rows = []
#     for result in cursor.stored_results():
#         columns = [d[0] for d in result.description]
#         for row in result.fetchall():
#             rows.append(dict(zip(columns, row)))

#     return rows


# # ================================================================
# # ENDPOINT   GET /leadscores/persona/leads
# # ================================================================

# @router.get("/leads")
# def get_persona_leads(
#     # ── Filters — all optional, default = no filter ──────────
#     country_id         : Optional[int] = Query(None),
#     industry_id        : Optional[int] = Query(None),
#     job_level_id       : Optional[int] = Query(None),
#     jobfunction_id     : Optional[int] = Query(None),
#     job_title          : Optional[str] = Query(None),
#     experience         : Optional[str] = Query(None),
#     call_engagement_id : Optional[int] = Query(None),
#     call_rating_id     : Optional[int] = Query(None),
#     call_status_id     : Optional[int] = Query(None),
#     start_date         : Optional[str] = Query(None),
#     end_date           : Optional[str] = Query(None),
#     # ── Pagination ───────────────────────────────────────────
#     page               : int           = Query(1,  ge=1),
#     page_size          : int           = Query(50, ge=1, le=200),
# ):
#     """
#     Returns a paginated list of persona-scored leads.

#     Default (no filters): returns ALL qualified leads from
#     vw_persona_qualified_leads with full persona scores.

#     With filters: returns only matching leads.
#     """
#     conn   = None
#     cursor = None

#     try:
#         conn   = get_conn()
#         cursor = conn.cursor()

#         # --------------------------------------------------------
#         # STEP 1 : Get filtered lead list
#         # --------------------------------------------------------
#         all_leads = call_proc(
#             cursor,
#             "Usp_get_persona_filtered_leads",
#             [
#                 country_id,
#                 industry_id,
#                 job_level_id,
#                 jobfunction_id,
#                 job_title,
#                 experience,
#                 call_engagement_id,
#                 call_rating_id,
#                 call_status_id,
#                 start_date,
#                 end_date,
#             ],
#         )

#         total       = len(all_leads)
#         total_pages = max(1, math.ceil(total / page_size))

#         # Paginate in Python — avoids calling the proc once per page
#         start_idx  = (page - 1) * page_size
#         page_leads = all_leads[start_idx : start_idx + page_size]

#         # --------------------------------------------------------
#         # STEP 2 : Score each lead on the current page
#         # --------------------------------------------------------
#         result_rows = []

#         for idx, lead in enumerate(page_leads, start=start_idx + 1):

#             lead_id   = lead.get("Lead_id")
#             breakdown = {}

#             try:
#                 rows = call_proc(cursor, "Usp_get_persona_breakdown", [lead_id])
#                 if rows:
#                     breakdown = rows[0]
#             except Exception:
#                 # Score failure for one lead must not fail the whole page
#                 breakdown = {}

#             # ── Helper closures for safe type casting ────────
#             def sf(key, default=0.0):
#                 return float(breakdown.get(key) or default)

#             def si(key, default=0):
#                 return int(breakdown.get(key) or default)

#             # ── Extract scores ────────────────────────────────
#             final_score      = sf("Final_Persona_Score")
#             engagement_score = sf("Engagement_Score")
#             conversion_score = sf("Conversion_Score")
#             velocity_score   = sf("Deal_Velocity_Score")
#             deal_size_score  = sf("Deal_Size_Impact_Score")
#             persona_tier     = breakdown.get("Persona_Tier",     "Tier 4") or "Tier 4"
#             business_meaning = breakdown.get("Business_Meaning", "")       or ""

#             icp_score        = float(lead.get("total_icp_score")       or 0)
#             propensity_score = float(lead.get("total_propensity_score") or 0)
#             job_level_desc   = lead.get("Job_level_desc") or ""

#             # ── Derive display columns ────────────────────────
#             persona            = derive_persona(job_level_desc, persona_tier)
#             persona_role       = derive_persona_role(persona, persona_tier, engagement_score)
#             combined_priority  = derive_combined_priority(icp_score, propensity_score, persona_tier)
#             recommended_action = derive_recommended_action(combined_priority, persona_role, persona)

#             result_rows.append({
#                 # ── Table columns ─────────────────────────────
#                 "sr_no"              : idx,
#                 "lead_id"            : lead_id,
#                 "company_name"       : lead.get("Company_name")           or "",
#                 "job_title"          : lead.get("Job_title")              or "",
#                 "job_level_desc"     : job_level_desc,
#                 "job_function_desc"  : lead.get("Jobfunction_desc")       or "",
#                 "country_name"       : lead.get("Country_name")           or "",
#                 "industry_desc"      : lead.get("Standard_industry_desc") or "",

#                 # ── Scores ────────────────────────────────────
#                 "icp_score"          : round(icp_score,        2),
#                 "propensity_score"   : round(propensity_score, 2),
#                 "engagement_score"   : round(engagement_score, 2),
#                 "conversion_score"   : round(conversion_score, 2),
#                 "velocity_score"     : round(velocity_score,   2),
#                 "deal_size_score"    : round(deal_size_score,  2),
#                 "final_persona_score": round(final_score,      2),

#                 # ── Derived display columns ───────────────────
#                 "persona"            : persona,
#                 "persona_tier"       : persona_tier,
#                 "business_meaning"   : business_meaning,
#                 "persona_role"       : persona_role,
#                 "combined_priority"  : combined_priority,
#                 "recommended_action" : recommended_action,

#                 # ── Full breakdown for Report modal ───────────
#                 "score_breakdown": {
#                     "engagement": {
#                         "score" : round(engagement_score, 2),
#                         "weight": "30%",
#                         "params": {
#                             "call_engagement": {"score": sf("Eng_Call_Engagement_Score"), "weight": si("Eng_Call_Engagement_Weight")},
#                             "call_rating"    : {"score": sf("Eng_Call_Rating_Score"),     "weight": si("Eng_Call_Rating_Weight")},
#                             "call_status"    : {"score": sf("Eng_Call_Status_Score"),     "weight": si("Eng_Call_Status_Weight")},
#                         },
#                     },
#                     "conversion": {
#                         "score" : round(conversion_score, 2),
#                         "weight": "40%",
#                         "params": {
#                             "experience"  : {"score": sf("Conv_Experience_Score"),   "weight": si("Conv_Experience_Weight")},
#                             "job_level"   : {"score": sf("Conv_Job_Level_Score"),    "weight": si("Conv_Job_Level_Weight")},
#                             "job_function": {"score": sf("Conv_Job_Function_Score"), "weight": si("Conv_Job_Function_Weight")},
#                         },
#                     },
#                     "velocity": {
#                         "score" : round(velocity_score, 2),
#                         "weight": "20%",
#                         "params": {
#                             "call_engagement": {"score": sf("Vel_Call_Engagement_Score"), "weight": si("Vel_Call_Engagement_Weight")},
#                             "experience"     : {"score": sf("Vel_Experience_Score"),      "weight": si("Vel_Experience_Weight")},
#                             "call_rating"    : {"score": sf("Vel_Call_Rating_Score"),     "weight": si("Vel_Call_Rating_Weight")},
#                             "call_status"    : {"score": sf("Vel_Call_Status_Score"),     "weight": si("Vel_Call_Status_Weight")},
#                             "job_level"      : {"score": sf("Vel_Job_Level_Score"),       "weight": si("Vel_Job_Level_Weight")},
#                             "revenue_size"   : {"score": sf("Vel_Revenue_Size_Score"),    "weight": si("Vel_Revenue_Size_Weight")},
#                         },
#                     },
#                     "deal_size": {
#                         "score" : round(deal_size_score, 2),
#                         "weight": "10%",
#                         "params": {
#                             "revenue_size" : {"score": sf("Deal_Revenue_Size_Score"),  "weight": si("Deal_Revenue_Size_Weight")},
#                             "employee_size": {"score": sf("Deal_Employee_Size_Score"), "weight": si("Deal_Employee_Size_Weight")},
#                             "job_level"    : {"score": sf("Deal_Job_Level_Score"),     "weight": si("Deal_Job_Level_Weight")},
#                             "experience"   : {"score": sf("Deal_Experience_Score"),    "weight": si("Deal_Experience_Weight")},
#                         },
#                     },
#                 },
#             })

#         return {
#             "status"     : "success",
#             "total"      : total,
#             "page"       : page,
#             "page_size"  : page_size,
#             "total_pages": total_pages,
#             "leads"      : result_rows,
#         }

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

#     finally:
    
#         if cursor:
#             try: cursor.close()
#             except: pass
#         if conn:
#             try: conn.close()
#             except: pass





# ./backend/apis/Persona/GeneratePersona.py
import math
from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from db import get_conn

router = APIRouter()

# ================================================================
# SORTING PRIORITY MAPS
# ================================================================
PRIORITY_ORDER = {
    "Very High": 1,
    "High": 2,
    "Medium": 3,
    "Low": 4,
    "Very Low": 5
}

TIER_ORDER = {
    "Tier 1": 1,
    "Tier 2": 2,
    "Tier 3": 3,
    "Tier 4": 4
}

# ================================================================
# BUSINESS LOGIC HELPERS
# ================================================================

def derive_persona(job_level_desc: str, persona_tier: str) -> str:

    level = (job_level_desc or "").strip().lower()
    tier  = (persona_tier or "Tier 4").strip()

    if any(k in level for k in ["cxo","c-suite","chief","ceo","cio","cto","cfo","president"]):
        return "Economic Buyer" if tier in ("Tier 1","Tier 2") else "Technical Buyer"

    if any(k in level for k in ["director","vp","vice president","head"]):
        return "Champion" if tier in ("Tier 1","Tier 2") else "Operational Influencer"

    if "manager" in level:
        return "Evaluator"

    if any(k in level for k in ["senior","lead","principal","architect"]):
        return "Technical Evaluator"

    if any(k in level for k in ["procurement","purchasing","admin"]):
        return "Gatekeeper"

    return "Influencer"


def derive_persona_role(persona: str, persona_tier: str, engagement_score: float) -> str:

    tier = (persona_tier or "Tier 4").strip()

    if persona == "Economic Buyer":
        return "Decision Maker"

    if persona == "Champion" or (tier == "Tier 1" and engagement_score >= 70):
        return "Internal Advocate" if engagement_score >= 75 else "Champion"

    if persona == "Gatekeeper" or tier == "Tier 4":
        return "Blocker"

    if persona in ("Technical Buyer","Technical Evaluator","Evaluator","Operational Influencer"):
        return "Influencer"

    return "Influencer"


def derive_combined_priority(icp_score: float, propensity_score: float, persona_tier: str) -> str:

    tier = (persona_tier or "Tier 4").strip()

    if icp_score >= 50 and propensity_score >= 50 and tier == "Tier 1":
        return "Very High"

    if (icp_score >= 50 or propensity_score >= 60) and tier == "Tier 2":
        return "High"

    if (icp_score >= 40 or propensity_score >= 50) and tier == "Tier 3":
        return "Medium"

    if (icp_score >= 30 or propensity_score >= 30) and tier == "Tier 4":
        return "Low"

    return "Very Low"


def derive_recommended_action(combined_priority: str, persona_role: str, persona: str) -> str:

    if combined_priority == "Very High":

        if persona_role == "Decision Maker":
            return "Fast-track to proposal"

        if persona_role in ("Internal Advocate","Champion"):
            return "Equip with sales enablement"

        return "Accelerate consensus building"

    if combined_priority == "High":

        if persona_role == "Decision Maker":
            return "Personalized executive outreach"

        if persona_role in ("Internal Advocate","Champion"):
            return "Equip with sales enablement"

        if persona in ("Technical Buyer","Technical Evaluator"):
            return "Deep-dive architecture call"

        if persona == "Evaluator":
            return "Technical demo + validation"

        return "Engage and qualify"

    if combined_priority == "Medium":

        if persona_role == "Decision Maker":
            return "Nurture with ROI content"

        if persona_role == "Blocker":
            return "Deprioritize / monitor"

        return "Tactical short-cycle close"

    if persona_role == "Blocker":
        return "Suppress from active outreach"

    return "Deprioritize / monitor"


# ================================================================
# HELPER : run stored procedure
# ================================================================

def call_proc(cursor, proc_name: str, args: list) -> list[dict]:

    cursor.callproc(proc_name, args)

    rows = []

    for result in cursor.stored_results():

        columns = [d[0] for d in result.description]

        for row in result.fetchall():
            rows.append(dict(zip(columns,row)))

    return rows


# ================================================================
# ENDPOINT
# ================================================================

@router.get("/leads")
def get_persona_leads(

    country_id: Optional[int] = Query(None),
    industry_id: Optional[int] = Query(None),
    job_level_id: Optional[int] = Query(None),
    jobfunction_id: Optional[int] = Query(None),
    job_title: Optional[str] = Query(None),
    experience: Optional[str] = Query(None),
    call_engagement_id: Optional[int] = Query(None),
    call_rating_id: Optional[int] = Query(None),
    call_status_id: Optional[int] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),

    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200)

):

    conn=None
    cursor=None

    try:

        conn=get_conn()
        cursor=conn.cursor()

        # --------------------------------------------------------
        # STEP 1 : GET LEADS
        # --------------------------------------------------------

        all_leads=call_proc(
            cursor,
            "Usp_get_persona_filtered_leads",
            [
                country_id,
                industry_id,
                job_level_id,
                jobfunction_id,
                job_title,
                experience,
                call_engagement_id,
                call_rating_id,
                call_status_id,
                start_date,
                end_date
            ]
        )

        total=len(all_leads)
        total_pages=max(1,math.ceil(total/page_size))

        start_idx=(page-1)*page_size
        page_leads=all_leads[start_idx:start_idx+page_size]

        result_rows=[]

        # --------------------------------------------------------
        # STEP 2 : SCORE LEADS
        # --------------------------------------------------------

        for idx,lead in enumerate(page_leads,start=start_idx+1):

            lead_id=lead.get("Lead_id")

            breakdown={}

            try:

                rows=call_proc(cursor,"Usp_get_persona_breakdown",[lead_id])

                if rows:
                    breakdown=rows[0]

            except:
                breakdown={}

            def sf(key,default=0.0):
                return float(breakdown.get(key) or default)

            def si(key,default=0):
                return int(breakdown.get(key) or default)

            final_score=sf("Final_Persona_Score")
            engagement_score=sf("Engagement_Score")
            conversion_score=sf("Conversion_Score")
            velocity_score=sf("Deal_Velocity_Score")
            deal_size_score=sf("Deal_Size_Impact_Score")

            persona_tier=breakdown.get("Persona_Tier","Tier 4")
            business_meaning=breakdown.get("Business_Meaning","")

            icp_score=float(lead.get("total_icp_score") or 0)
            propensity_score=float(lead.get("total_propensity_score") or 0)
            job_level_desc=lead.get("Job_level_desc") or ""

            persona=derive_persona(job_level_desc,persona_tier)

            persona_role=derive_persona_role(
                persona,
                persona_tier,
                engagement_score
            )

            combined_priority=derive_combined_priority(
                icp_score,
                propensity_score,
                persona_tier
            )

            recommended_action=derive_recommended_action(
                combined_priority,
                persona_role,
                persona
            )

            result_rows.append({

                "sr_no":idx,
                "lead_id":lead_id,
                "company_name":lead.get("Company_name") or "",
                "job_title":lead.get("Job_title") or "",
                "job_level_desc":job_level_desc,
                "job_function_desc":lead.get("Jobfunction_desc") or "",
                "country_name":lead.get("Country_name") or "",
                "industry_desc":lead.get("Standard_industry_desc") or "",

                "icp_score":round(icp_score,2),
                "propensity_score":round(propensity_score,2),
                "engagement_score":round(engagement_score,2),
                "conversion_score":round(conversion_score,2),
                "velocity_score":round(velocity_score,2),
                "deal_size_score":round(deal_size_score,2),
                "final_persona_score":round(final_score,2),

                "persona":persona,
                "persona_tier":persona_tier,
                "business_meaning":business_meaning,
                "persona_role":persona_role,
                "combined_priority":combined_priority,
                "recommended_action":recommended_action
            })

        # --------------------------------------------------------
        # STEP 3 : SORT RESULTS
        # --------------------------------------------------------

        result_rows.sort(
            key=lambda x: (
                PRIORITY_ORDER.get(x["combined_priority"],6),
                TIER_ORDER.get(x["persona_tier"],5)
            )
        )

        return {

            "status":"success",
            "total":total,
            "page":page,
            "page_size":page_size,
            "total_pages":total_pages,
            "leads":result_rows

        }

    except Exception as e:

        raise HTTPException(status_code=500,detail=str(e))

    finally:

        if cursor:
            try: cursor.close()
            except: pass

        if conn:
            try: conn.close()
            except: pass