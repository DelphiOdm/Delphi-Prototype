# # backend/apis/leadscores/leads/get_campaign_leads.py
# from fastapi import APIRouter, Query, HTTPException
# from db import get_conn
# import math
# import logging

# router = APIRouter()

# @router.get("/campaign-leads")
# def get_campaign_leads(
#     order_id: int | None = Query(None),
#     country_id: int | None = Query(None),
#     industry_id: int | None = Query(None),
#     job_level_id: int | None = Query(None),
#     job_function_id: int | None = Query(None),
#     employee_size_id: int | None = Query(None),
#     revenue_size_id: int | None = Query(None),
#     start_date: str | None = Query(None),
#     end_date: str | None = Query(None),
#     page: int = Query(1, ge=1),
#     page_size: int = Query(25, ge=1, le=100)
# ):
#     conn = None
#     cur = None

#     try:
#         conn = get_conn()
#         cur = conn.cursor(dictionary=True)

#         # ================= CAMPAIGN FLOW =================
#         if order_id:
#             cur.callproc(
#                 "Usp_get_campaign_leads",
#                 (order_id, page, page_size)
#             )

#         # ================= FILTER FLOW =================
#         else:
#             cur.callproc(
#                 "Usp_get_filtered_leads",
#                 (
#                     country_id,
#                     industry_id,
#                     # job_title,
#                     job_level_id,
#                     job_function_id,
#                     employee_size_id,
#                     revenue_size_id,
#                     start_date,
#                     end_date,
#                     page,
#                     page_size
#                 )
#             )

#         # -------- First result set (TOTAL) --------
#         total = 0
#         for result in cur.stored_results():
#             row = result.fetchone()
#             if row and "total" in row:
#                 total = row["total"]
#                 break
        
    


#         # -------- Second result set (DATA) --------
#         leads = []
#         for result in cur.stored_results():
#             leads = result.fetchall()

#         return {
#             "page": page,
#             "page_size": page_size,
#             "total": total,
#             "total_pages": math.ceil(total / page_size) if page_size else 1,
#             "leads": leads
#         }

#     except Exception as e:
#         logging.exception("Lead fetch failed")
#         raise HTTPException(status_code=500, detail=str(e))

#     finally:
#         if cur:
#             cur.close()
#         if conn:
#             conn.close()



# backend/apis/leadscores/leads/get_campaign_leads.py

from fastapi import APIRouter, Query, HTTPException
from db import get_conn
import math
import logging

router = APIRouter()

@router.get("/campaign-leads")
def get_campaign_leads(
    order_id: int | None = Query(None),
    country_id: int | None = Query(None),
    industry_id: int | None = Query(None),
    job_level_id: int | None = Query(None),
    job_function_id: int | None = Query(None),
    employee_size_id: int | None = Query(None),
    revenue_size_id: int | None = Query(None),
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100)
):
    conn = None
    cur = None

    try:
        conn = get_conn()
        cur = conn.cursor(dictionary=True)

        # ================= CAMPAIGN FLOW =================
        if order_id:
            cur.callproc(
                "Usp_get_campaign_leads",
                (order_id, page, page_size)
            )

        # ================= FILTER FLOW =================
        else:
            cur.callproc(
                "Usp_get_filtered_leads",
                (
                    country_id,
                    industry_id,
                    job_level_id,
                    job_function_id,
                    employee_size_id,
                    revenue_size_id,
                    start_date,
                    end_date,
                    page,
                    page_size
                )
            )

        # -------- First result set (TOTAL) --------
        total = 0
        for result in cur.stored_results():
            row = result.fetchone()
            if row and "total" in row:
                total = row["total"]
                break

        # -------- Second result set (DATA) --------
        leads = []
        for result in cur.stored_results():
            leads = result.fetchall()

        # ================= TOTAL SCORE ATTACH =================
        lead_ids = [l["Lead_id"] for l in leads]

        scores_map = {}
        if lead_ids:
            placeholders = ",".join(["%s"] * len(lead_ids))
            cur.execute(f"""
                SELECT
                    Lead_id,
                    ROUND(SUM(COALESCE(weighted_score, 0)), 2) AS total_score
                FROM vw_lead_score_breakdown
                WHERE Lead_id IN ({placeholders})
                GROUP BY Lead_id
            """, tuple(lead_ids))

            for row in cur.fetchall():
                scores_map[row["Lead_id"]] = row["total_score"]

        # Attach score to each lead
        for lead in leads:
            lead["score"] = scores_map.get(lead["Lead_id"], 0)

        return {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": math.ceil(total / page_size) if page_size else 1,
            "leads": leads
        }

    except Exception as e:
        logging.exception("Lead fetch failed")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
