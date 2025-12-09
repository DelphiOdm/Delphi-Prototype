from fastapi import APIRouter, Query, HTTPException, Body
from typing import Optional, List
from db import get_conn  # import your DB function
from utils.crypto_utils import decrypt_value, encrypt_value  # import your decryption function

router = APIRouter()
@router.get("/get_single_company_details")
def get_single_company_details(
    Company_name: str = Query(..., description="The name of the company" ),
    Domain: str = Query(..., description="The domain of the company" ),
    Standard_industry_id: str = Query(..., description="The industry ID of the company" ),
    Country_id: str = Query(..., description="The country ID of the company" ),
    Order_key_id: str = Query(..., description="The ID of the order" ),
    ):
    print(Company_name, Domain, Standard_industry_id, Country_id, Order_key_id)
    try:
        # Split the comma-separated company names into a list
        # Company_name_list = [name.strip() for name in Company_name.split(",") if name.strip()]

        # Generate placeholders for SQL
        # placeholders = ",".join(["%s"] * len(Company_name_list))

        conn = get_conn()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
            tod.Price,
            tel.Lead_id,
            COUNT(*) AS Total_Leads_Scored,
            COUNT(CASE WHEN tlsat.IsSMTPqualified = 1 THEN 1 END) AS SMTP_Qualified_Count,
            COUNT(CASE WHEN tlsat.IsSMTPqualified = 0 THEN 1 END) AS SMTP_Disqualified_Count,
            COUNT(CASE WHEN tlsat.IsSMTPqualified = 9 THEN 1 END) AS SMTP_Pending_Count
            FROM tblleads_status_activity_tracker tlsat
            JOIN tblengaged_leads tel ON tel.Engage_id = tlsat.Engage_id
            JOIN tblorder_details tod ON tod.Order_key_id = tel.Order_key_id
            JOIN tblleads_masterlist_cleaned tl ON tl.Lead_id = tel.Lead_id
            WHERE tlsat.Outcome_id = 18
            AND tlsat.QAstatus_id = 0
            AND tl.Company_name = %s
            AND tl.Mail_domain = %s
            AND tl.Standard_industry_id = %s 
            AND tl.Country_id = %s
            AND tel.Order_key_id = %s 
            """,
            (Company_name, Domain, Standard_industry_id, Country_id, Order_key_id,)
        )

        # Build final parameters list
        # params = Company_name_list + [Domain, Standard_industry_id, Country_id, Order_key_id]

        # cursor.execute(query, params)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        if not rows:
            return {"company": [], "message": "No company found"}

        totalQualified = 0
        totalDisqualified = 0
        totalPending = 0
        totalRevenue = 0.0
        cpl_value = None

        for row in rows:
            if "Price" in row and row["Price"]:
                decrypted_price = decrypt_value(row["Price"])
                try:
                    price_float = float(decrypted_price.replace("$", "").replace(",", ""))
                    row["Price"] = f"${price_float:,.2f}"
                    totalRevenue += price_float * (row.get("SMTP_Qualified_Count") or 0)

                    if cpl_value is None:
                        cpl_value = price_float
                except ValueError:
                    row["Price"] = decrypted_price  # fallback

            totalQualified += row.get("SMTP_Qualified_Count") or 0
            totalDisqualified += row.get("SMTP_Disqualified_Count") or 0
            totalPending += row.get("SMTP_Pending_Count") or 0

        # card_data = [
        #     {"value": totalQualified, "label": "Qualified", "color": "text-success"},
        #     {"value": totalDisqualified, "label": "Disqualified", "color": "text-danger"},
        #     {"value": totalPending, "label": "Pending", "color": "text-orange"},
        #     {
        #         "value": encrypt_value(f"{cpl_value:.2f}"),
        #         "label": "CPL",
        #         "color": "text-success",
        #         "is_encrypted": True
        #     },
        #     {
        #         "value": encrypt_value(f"{totalRevenue:.2f}"),
        #         "label": "Projected Revenue",
        #         "color": "text-purple",
        #         "is_encrypted": True
        #     }
        # ]

        card_data = [
            {"value": totalQualified, "label": "Qualified", "color": "text-success"},
            {"value": totalDisqualified, "label": "Disqualified", "color": "text-danger"},
            {"value": totalPending, "label": "Pending", "color": "text-orange"},
            {
                "value": encrypt_value(f"{(cpl_value or 0):.2f}"),
                "label": "CPL",
                "color": "text-success",
                "is_encrypted": True
            },
            {
                "value": encrypt_value(f"{totalRevenue:.2f}"),
                "label": "Projected Revenue",
                "color": "text-purple",
                "is_encrypted": True
            }
        ]


        return {"company": rows, "card_data": card_data}
    
    except HTTPException as he:
        #If you deliberately raised HTTPException somewhere
        raise he
    
    except Exception as e:
        #Catch all other errors and respond gracefully
        return {"company": [], "error": "Internal server error: " + str(e)}
    

@router.post("/decrypt_price_revenue")
def decrypt_price_revenue(
    encrypted_value: str = Body(..., embed=True)
):
    try:
        decrypted = decrypt_value(encrypted_value)
        return {"value": f"${float(decrypted):,.2f}"}
    except Exception as e:
        return {"error": f"Decryption failed: {str(e)}"}


@router.post("/decrypt_price_cpl")
def decrypt_price_cpl(
    encrypted_value: str = Body(..., embed=True)
):
    try:
        decrypted = decrypt_value(encrypted_value)
        return {"value": f"${float(decrypted):,.2f}"}
    except Exception as e:
        return {"error": f"Decryption failed: {str(e)}"}
