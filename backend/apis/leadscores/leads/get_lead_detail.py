# backend/apis/leadscores/leads/get_lead_detail.py
from fastapi import APIRouter, HTTPException
from db import get_conn

router = APIRouter()

@router.get("/lead-detail/{lead_id}")
def get_lead_detail(lead_id: int):
    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    try:
        # ---------- Lead basic info ----------
        cur.execute("""
            SELECT
                lm.Lead_id,
                CONCAT(lm.First_name,' ',lm.Last_name) AS name,
                lm.Email_id,
                lm.Job_title,
                jl.Job_level_desc,
                jf.Jobfunction_desc,
                si.Standard_industry_desc AS industry,
                es.Employee_size_desc,
                rs.Revenue_size_desc,
                loc.Location_desc AS country
            FROM tblleads_masterlist lm
            LEFT JOIN Mst_tbljoblevel jl ON jl.Job_level_id = lm.Job_level_id
            LEFT JOIN Mst_tbljobfunction jf ON jf.Jobfunction_id = lm.Jobfunction_id
            LEFT JOIN Mst_tblstandardindustry si ON si.Standard_industry_id = lm.Standard_industry_id
            LEFT JOIN Mst_tblemployeesize es ON es.Employee_size_id = lm.Employee_size_id
            LEFT JOIN Mst_tblrevenuesize rs ON rs.Revenue_size_id = lm.Revenue_size_id
            LEFT JOIN Mst_tbllocationelements loc ON loc.Location_id = lm.Country_id
            WHERE lm.Lead_id = %s
        """, (lead_id,))

        lead = cur.fetchone()

        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")

        # ---------- Score breakdown ----------
        cur.callproc("Usp_get_lead_score_breakdown", (lead_id,))
        breakdown = []
        for r in cur.stored_results():
            breakdown = r.fetchall()

        return {
            "lead": lead,
            "score_breakdown": breakdown
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        conn.close()
