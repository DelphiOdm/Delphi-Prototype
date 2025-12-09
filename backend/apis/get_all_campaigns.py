from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from db import get_conn  # import your DB function

router = APIRouter()

# @router.get("/get_all_campaigns")
# def get_all_campaigns(
#     start_date: Optional[str] = Query(None, description="YYYY-MM-DD"),
#     end_date: Optional[str] = Query(None, description="YYYY-MM-DD")
# ):
#     try:
#         conn = get_conn()
#         cursor = conn.cursor(dictionary=True)
        
#         query = """
#         SELECT tod.Order_key_id, tod.Order_id, cli.Client_name as Client_name, tod.Order_name as Campaign_name, tod.Initial_start_delivery_dt as Campaign_start_date, tod.Effective_end_delivery_dt as Campaign_end_date, 'Live' as Status
#         FROM tblorder_details as tod
#         JOIN tblorder_status_activity_tracker as tsat
#         ON tsat.Order_key_id= tod.Order_key_id
#         JOIN mst_tblclient_campaigns cam
#         ON cam.Campaign_key_id = tod.Campaign_key_id
#         JOIN mst_tblclients cli
#         ON cli.Client_id= cam.Client_id
#         WHERE tsat.Orderstatus_id IN (4,5,12)
#         AND tsat.Iscurrent = 'true'
#         """
#         params = []
        
#         if start_date:
#             query += " AND date(tod.Initial_start_delivery_dt) >= %s"
#             params.append(start_date)
#         if end_date:
#             query += " AND date(tod.Effective_end_delivery_dt) <= %s"
#             params.append(end_date)
            
#         query += " ORDER BY tod.Order_key_id DESC"
        
#         cursor.execute(query, params)
#         rows = cursor.fetchall()
        
#         cursor.close()
#         conn.close()
        
#         if not rows:
#             # instead of raising 500, return a 404 with message
#             return {"campaigns": [], "message": "No campaigns found"}
        
#         return {"campaigns": rows}
    
#     except HTTPException as he:
#         # If you deliberately raised HTTPException somewhere
#         raise he
    
#     except Exception as e:
#         # Catch all other errors and respond gracefully
#         return {"campaigns": [], "error": "Internal server error: " + str(e)}

@router.get("/get_all_campaigns")
def get_all_campaigns(
    start_date: Optional[str] = Query(None, description="YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="YYYY-MM-DD")
):
    try:
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)
        
        query = """
        SELECT tod.Order_key_id, cli.Client_name as Client_name, tod.Order_id, tod.Order_name as Campaign_name, tod.Initial_start_delivery_dt as Campaign_start_date, tod.Effective_end_delivery_dt as Campaign_end_date,
        CASE 
            WHEN tsat.Orderstatus_id = 4 THEN 'Live'
            WHEN tsat.Orderstatus_id = 5 THEN 'Rectified'
            WHEN tsat.Orderstatus_id = 8 THEN 'Completed'
            WHEN tsat.Orderstatus_id = 12 THEN 'Relive'
        END AS Status,
        COUNT(*) AS Total_Leads_Scored,
            COUNT(CASE WHEN tlsat.IsSMTPqualified = 1 THEN 1 END) AS SMTP_Qualified_Count,
            COUNT(CASE WHEN tlsat.IsSMTPqualified = 0 THEN 1 END) AS SMTP_Disqualified_Count,
            COUNT(CASE WHEN tlsat.IsSMTPqualified = 9 THEN 1 END) AS SMTP_Pending_Count
        FROM tblorder_details tod  
        JOIN tblorder_status_activity_tracker as tsat ON tsat.Order_key_id= tod.Order_key_id  
        join mst_tblclient_campaigns cam on  cam.Campaign_key_id = tod.Campaign_key_id
        join mst_tblclients cli on cli.Client_id= cam.Client_id
        LEFT JOIN tblengaged_leads tel ON tel.Order_key_id = tod.Order_key_id
        LEFT JOIN tblleads_status_activity_tracker tlsat ON tlsat.Engage_id = tel.Engage_id
        LEFT JOIN tblleads_masterlist tlm ON tlm.Lead_id = tel.Lead_id
        WHERE tsat.Orderstatus_id IN(4,5,8,12) AND tsat.Iscurrent = 'true' 
        """
        params = []
        
        if start_date:
            query += " AND date(tod.Initial_start_delivery_dt) >= %s"
            params.append(start_date)
        if end_date:
            query += " AND date(tod.Effective_end_delivery_dt) <= %s"
            params.append(end_date)
            
        query += " AND tlsat.Outcome_id = 18 AND tlsat.QAstatus_id = 0 GROUP by tel.Order_key_id order by tod.Order_key_id DESC"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        if not rows:
            # instead of raising 500, return a 404 with message
            return {"campaigns": [], "message": "No campaigns found"}
        
        # Calculate success ratio and add it to each row
        for row in rows:
            total = row.get("Total_Leads_Scored", 0)
            qualified = row.get("SMTP_Qualified_Count", 0)
            if total and total != 0:
                row["success_ratio"] = round((qualified / total) * 100, 2)
            else:
                row["success_ratio"] = 0.0
        
        return {"campaigns": rows}
    
    except HTTPException as he:
        # If you deliberately raised HTTPException somewhere
        raise he
    
    except Exception as e:
        # Catch all other errors and respond gracefully
        return {"campaigns": [], "error": "Internal server error: " + str(e)}
    
@router.get("/get_campaign_by_id")
def get_campaign_by_id(
    Campaign_id: int = Query(..., description="The ID of the campaign" ),
):
    try:
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT tod.Order_key_id, tod.Order_id, cli.Client_name as Client_name, tod.Order_name as Campaign_name
            FROM tblorder_details as tod
            JOIN mst_tblclient_campaigns cam ON cam.Campaign_key_id = tod.Campaign_key_id
            JOIN mst_tblclients cli ON cli.Client_id= cam.Client_id
            WHERE tod.Order_key_id = %s
            """,
            (Campaign_id,)
        )
        
        rows = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not rows:
            # instead of raising 500, return a 404 with message
            return {"campaign": [], "message": "No campaigns found"}
        
        return {"campaigns": rows}
    
    except HTTPException as he:
        # If you deliberately raised HTTPException somewhere
        raise he
    
    except Exception as e:
        # Catch all other errors and respond gracefully
        return {"campaigns": [], "error": "Internal server error: " + str(e)}