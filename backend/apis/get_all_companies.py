from fastapi import APIRouter, Query, HTTPException, Body
from typing import Optional
from db import get_conn  # import your DB function
from utils.crypto_utils import decrypt_value, encrypt_value  # import your decryption function
from collections import defaultdict
router = APIRouter()

# Working First Code - Kiran

@router.get("/get_company_by_campaign_id")
def get_company_by_campaign_id(
    Campaign_id: int = Query(..., description="The ID of the campaign" ),
    ):
    try:
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT tod.Price, tod.Order_key_id, tod.Order_id, tod.Order_name as Campaign_name, cli.Client_name as Client_name, tel.Order_key_id, tlm.Lead_id, tlm.Company_name,stdi.Standard_industry_desc as Industry,mleCountry.Location_desc AS Country,tlm.Mail_domain,tlm.Country_id,tlm.Standard_industry_id,
            COUNT(*) AS Total_Leads_Scored,COUNT(CASE WHEN tlsat.IsSMTPqualified = 1 THEN 1 END) AS SMTP_Qualified_Count,
            COUNT(CASE WHEN tlsat.IsSMTPqualified = 0 THEN 1 END) AS SMTP_Disqualified_Count,
            COUNT(CASE WHEN tlsat.IsSMTPqualified = 9 THEN 1 END) AS SMTP_Pending_Count
            FROM tblengaged_leads tel
            JOIN tblleads_status_activity_tracker tlsat ON tlsat.Engage_id = tel.Engage_id
            JOIN tblleads_masterlist_cleaned tlm ON tlm.Lead_id = tel.Lead_id
            JOIN mst_tblstandardindustry stdi ON tlm.Standard_industry_id = stdi.Standard_industry_id 
            JOIN mst_tbllocationelements mleCountry ON mleCountry.Location_id = tlm.Country_id
            JOIN tblorder_details tod ON tod.Order_key_id = tel.Order_key_id
            JOIN mst_tblclient_campaigns cam ON cam.Campaign_key_id = tod.Campaign_key_id
            JOIN mst_tblclients cli ON cli.Client_id= cam.Client_id
            where tel.Order_key_id = %s AND tlsat.Outcome_id = 18  AND tlsat.QAstatus_id = 0 
            group by tlm.Company_name,tlm.Country_id,tlm.Standard_industry_id,tlm.Mail_domain
            """,
            (Campaign_id,)
        )
        
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
    
        if not rows:
        #instead of raising 500, return a 404 with message
            return {"companies": [], "message": "No companies found"}
        
        totalQualified = 0
        totalDisqualified = 0
        totalPending = 0
        totalRevenue = 0.0
        cpl_value = None

        for row in rows:
            # Price handling
            if "Company_name" in row and row["Company_name"]:
                row["Company_name_dec"] = decrypt_value(row["Company_name"])
            
            if "Price" in row and row["Price"]:
                decrypted_price = decrypt_value(row["Price"])
                try:
                    price_float = float(decrypted_price.replace("$", "").replace(",", ""))
                    row["Price"] = f"${price_float:,.2f}"
                    totalRevenue += price_float * (row.get("SMTP_Qualified_Count") or 0)

                    if cpl_value is None:
                        cpl_value = price_float
                except ValueError:
                    row["Price"] = decrypted_price  # Keep original if parsing fails

            # Tally totals
            totalQualified += row.get("SMTP_Qualified_Count") or 0
            totalDisqualified += row.get("SMTP_Disqualified_Count") or 0
            totalPending += row.get("SMTP_Pending_Count") or 0
        
        card_data = [
            {"value": totalQualified, "label": "Qualified", "color": "text-success"},
            {"value": totalDisqualified, "label": "Disqualified", "color": "text-danger"},
            {"value": totalPending, "label": "Pending", "color": "text-orange"},
            {
                "value": f"${cpl_value:,.2f}" if cpl_value is not None else "$0.00",
                "label": "CPL",
                "color": "text-success"
            },
            {
                "value": encrypt_value(f"{totalRevenue:.2f}"),  # raw number, no $
                "label": "Projected Revenue",
                "color": "text-purple",
                "is_encrypted": True
            }
        ]

        return {"companies": rows ,"card_data": card_data}
    
    except HTTPException as he:
        #If you deliberately raised HTTPException somewhere
        raise he
    
    except Exception as e:
        #Catch all other errors and respond gracefully
        return {"companies": [], "error": "Internal server error: " + str(e)}

# @router.get("/get_company_by_campaign_id")
# def get_company_by_campaign_id(
#     Campaign_id: int = Query(..., description="The ID of the campaign"),
# ):
#     try:
#         conn = get_conn()
#         cursor = conn.cursor(dictionary=True)
#         cursor.execute(
#             """
#             SELECT tod.Price, tod.Order_key_id, tod.Order_id, tod.Order_name as Campaign_name, cli.Client_name as Client_name, 
#                    tel.Order_key_id, tlm.Lead_id, tlm.Company_name, stdi.Standard_industry_desc as Industry,
#                    mleCountry.Location_desc AS Country, tlm.Mail_domain, tlm.Country_id, tlm.Standard_industry_id,
#                    COUNT(*) AS Total_Leads_Scored,
#                    COUNT(CASE WHEN tlsat.IsSMTPqualified = 1 THEN 1 END) AS SMTP_Qualified_Count,
#                    COUNT(CASE WHEN tlsat.IsSMTPqualified = 0 THEN 1 END) AS SMTP_Disqualified_Count,
#                    COUNT(CASE WHEN tlsat.IsSMTPqualified = 9 THEN 1 END) AS SMTP_Pending_Count
#             FROM tblengaged_leads tel
#             JOIN tblleads_status_activity_tracker tlsat ON tlsat.Engage_id = tel.Engage_id
#             JOIN tblleads_masterlist_cleaned tlm ON tlm.Lead_id = tel.Lead_id
#             JOIN mst_tblstandardindustry stdi ON tlm.Standard_industry_id = stdi.Standard_industry_id
#             JOIN mst_tbllocationelements mleCountry ON mleCountry.Location_id = tlm.Country_id
#             JOIN tblorder_details tod ON tod.Order_key_id = tel.Order_key_id
#             JOIN mst_tblclient_campaigns cam ON cam.Campaign_key_id = tod.Campaign_key_id
#             JOIN mst_tblclients cli ON cli.Client_id= cam.Client_id
#             WHERE tel.Order_key_id = %s AND tlsat.Outcome_id = 18 AND tlsat.QAstatus_id = 0 
#             GROUP BY tlm.Company_name, tlm.Country_id, tlm.Standard_industry_id, tlm.Mail_domain
#             """,
#             (Campaign_id,)
#         )
        
#         rows = cursor.fetchall()
#         cursor.close()
#         conn.close()
    
#         if not rows:
#             return {"companies": [], "message": "No companies found"}
        
#         totalQualified = 0
#         totalDisqualified = 0
#         totalPending = 0
#         totalRevenue = 0.0
#         cpl_value = None
        
#         # Step 1: Create a map for decrypted company names (because SQL cannot decrypt the value)
#         decrypted_company_names = {}

#         # Step 2: Decrypt the company names
#         for row in rows:
#             if "Company_name" in row and row["Company_name"]:
#                 row["Company_name_dec"] = decrypt_value(row["Company_name"])
#                 decrypted_company_names[row["Company_name"]] = row["Company_name_dec"]

#         # Step 3: Group the rows based on the decrypted company name
#         grouped_rows = {}
#         for row in rows:
#             decrypted_name = row["Company_name_dec"]
#             if decrypted_name not in grouped_rows:
#                 grouped_rows[decrypted_name] = {
#                     "Company_name_dec": decrypted_name,
#                     "Company_name": [row["Company_name"]],
#                     "Campaign_name" : row["Campaign_name"],
#                     "Client_name": row["Client_name"],
#                     "Lead_id": row["Lead_id"],
#                     "Industry": row["Industry"],
#                     "Country": row["Country"],
#                     "Country_id": row["Country_id"],
#                     "Order_key_id" : row["Order_key_id"],
#                     "Order_id" : row["Order_id"],
#                     "Standard_industry_id": row["Standard_industry_id"],
#                     "Mail_domain": row["Mail_domain"],
#                     "SMTP_Qualified_Count": 0,
#                     "SMTP_Disqualified_Count": 0,
#                     "SMTP_Pending_Count": 0,
#                     "Total_Leads_Scored": 0,
#                     "Price": row.get("Price", ""),
#                     "Revenue": 0.0
#                 }
#             else:
#                  if row["Company_name"] not in grouped_rows[decrypted_name]["Company_name"]:
#                     grouped_rows[decrypted_name]["Company_name"].append(row["Company_name"])
                    
#             # Accumulate the counts
#             grouped_rows[decrypted_name]["SMTP_Qualified_Count"] += row.get("SMTP_Qualified_Count", 0)
#             grouped_rows[decrypted_name]["SMTP_Disqualified_Count"] += row.get("SMTP_Disqualified_Count", 0)
#             grouped_rows[decrypted_name]["SMTP_Pending_Count"] += row.get("SMTP_Pending_Count", 0)
#             grouped_rows[decrypted_name]["Total_Leads_Scored"] += row.get("Total_Leads_Scored", 0)
            
#             # Calculate revenue
#             if row.get("Price"):
#                 decrypted_price = decrypt_value(row["Price"])
#                 try:
#                     price_float = float(decrypted_price.replace("$", "").replace(",", ""))
#                     grouped_rows[decrypted_name]["Revenue"] += price_float * (row.get("SMTP_Qualified_Count") or 0)
#                 except ValueError:
#                     pass  # If parsing fails, do nothing.

#         # Step 4: Prepare final result set
#         grouped_data = list(grouped_rows.values())

#         totalQualified = sum(item["SMTP_Qualified_Count"] for item in grouped_data)
#         totalDisqualified = sum(item["SMTP_Disqualified_Count"] for item in grouped_data)
#         totalPending = sum(item["SMTP_Pending_Count"] for item in grouped_data)
#         totalRevenue = sum(item["Revenue"] for item in grouped_data)

#         cpl_value = totalRevenue / totalQualified if totalQualified else 0.0
        
#         # Step 5: Prepare the final card data
#         card_data = [
#             {"value": totalQualified, "label": "Qualified", "color": "text-success"},
#             {"value": totalDisqualified, "label": "Disqualified", "color": "text-danger"},
#             {"value": totalPending, "label": "Pending", "color": "text-orange"},
#             {
#                 "value": f"${cpl_value:.2f}",
#                 "label": "CPL",
#                 "color": "text-success"
#             },
#             {
#                 "value": encrypt_value(f"{totalRevenue:.2f}"),  # raw number, no $
#                 "label": "Projected Revenue",
#                 "color": "text-purple",
#                 "is_encrypted": True
#             }
#         ]

#         return {"companies": grouped_data, "card_data": card_data}
    
#     except HTTPException as he:
#         raise he
    
#     except Exception as e:
#         return {"companies": [], "error": "Internal server error: " + str(e)}

# new code but not working.

# @router.get("/get_company_by_campaign_id")
# def get_company_by_campaign_id(
#     Campaign_id: int = Query(..., description="The ID of the campaign"),
# ):
#     try:
#         conn = get_conn()
#         cursor = conn.cursor(dictionary=True)
#         cursor.execute(
#             """
#             SELECT 
#                 tod.Price, 
#                 tod.Order_key_id, 
#                 tod.Order_id, 
#                 tod.Order_name as Campaign_name, 
#                 cli.Client_name as Client_name, 
#                 tel.Order_key_id, 
#                 tlm.Lead_id, 
#                 tlm.Company_name, 
#                 stdi.Standard_industry_desc as Industry,
#                 mleCountry.Location_desc AS Country,
#                 tlm.Mail_domain,
#                 tlm.Country_id,
#                 tlm.Standard_industry_id,
#                 COUNT(*) AS Total_Leads_Scored,
#                 COUNT(CASE WHEN tlsat.IsSMTPqualified = 1 THEN 1 END) AS SMTP_Qualified_Count,
#                 COUNT(CASE WHEN tlsat.IsSMTPqualified = 0 THEN 1 END) AS SMTP_Disqualified_Count,
#                 COUNT(CASE WHEN tlsat.IsSMTPqualified = 9 THEN 1 END) AS SMTP_Pending_Count
#             FROM tblengaged_leads tel
#             JOIN tblleads_status_activity_tracker tlsat ON tlsat.Engage_id = tel.Engage_id
#             JOIN tblleads_masterlist tlm ON tlm.Lead_id = tel.Lead_id
#             JOIN mst_tblstandardindustry stdi ON tlm.Standard_industry_id = stdi.Standard_industry_id 
#             JOIN mst_tbllocationelements mleCountry ON mleCountry.Location_id = tlm.Country_id
#             JOIN tblorder_details tod ON tod.Order_key_id = tel.Order_key_id
#             JOIN mst_tblclient_campaigns cam ON cam.Campaign_key_id = tod.Campaign_key_id
#             JOIN mst_tblclients cli ON cli.Client_id = cam.Client_id
#             WHERE tel.Order_key_id = %s 
#               AND tlsat.Outcome_id = 18  
#               AND tlsat.QAstatus_id = 0 
#             GROUP BY 
#                 tlm.Company_name,
#                 tlm.Country_id,
#                 tlm.Standard_industry_id,
#                 tlm.Mail_domain
#             """,
#             (Campaign_id,)
#         )

#         rows = cursor.fetchall()
#         cursor.close()
#         conn.close()

#         if not rows:
#             return {"companies": [], "message": "No companies found"}

#         # Step 1: Decrypt and regroup by decrypted company name + other keys
#         grouped = defaultdict(lambda: {
#             "Price": None,
#             "Order_key_id": None,
#             "Order_id": None,
#             "Campaign_name": None,
#             "Client_name": None,
#             "Lead_id": None,
#             "Industry": None,
#             "Country": None,
#             "Mail_domain": None,
#             "Country_id": None,
#             "Standard_industry_id": None,
#             "Total_Leads_Scored": 0,
#             "SMTP_Qualified_Count": 0,
#             "SMTP_Disqualified_Count": 0,
#             "SMTP_Pending_Count": 0,
#         })

#         for row in rows:
#             decrypted_company = decrypt_value(row["Company_name"]) if row["Company_name"] else None

#             # Use tuple key for grouping: (decrypted company, country, industry, mail_domain)
#             key = (
#                 decrypted_company,
#                 row["Country_id"],
#                 row["Standard_industry_id"],
#                 row["Mail_domain"]
#             )

#             group = grouped[key]

#             # Set static values if not already set
#             if group["Price"] is None:
#                 group["Price"] = row["Price"]
#                 group["Order_key_id"] = row["Order_key_id"]
#                 group["Order_id"] = row["Order_id"]
#                 group["Campaign_name"] = row["Campaign_name"]
#                 group["Client_name"] = row["Client_name"]
#                 group["Lead_id"] = row["Lead_id"]
#                 group["Industry"] = row["Industry"]
#                 group["Country"] = row["Country"]
#                 group["Mail_domain"] = row["Mail_domain"]
#                 group["Country_id"] = row["Country_id"]
#                 group["Standard_industry_id"] = row["Standard_industry_id"]

#             # Aggregate counts
#             group["Total_Leads_Scored"] += row.get("Total_Leads_Scored", 0) or 0
#             group["SMTP_Qualified_Count"] += row.get("SMTP_Qualified_Count", 0) or 0
#             group["SMTP_Disqualified_Count"] += row.get("SMTP_Disqualified_Count", 0) or 0
#             group["SMTP_Pending_Count"] += row.get("SMTP_Pending_Count", 0) or 0

#         # Step 2: Build final list and calculate totals
#         final_rows = []
#         totalQualified = 0
#         totalDisqualified = 0
#         totalPending = 0
#         totalRevenue = 0.0
#         cpl_value = None

#         for (company_name, country_id, std_industry_id, mail_domain), data in grouped.items():
#             # Decrypt and format price
#             decrypted_price = decrypt_value(data["Price"]) if data["Price"] else None
#             price_float = 0.0
#             if decrypted_price:
#                 try:
#                     price_float = float(decrypted_price.replace("$", "").replace(",", ""))
#                 except ValueError:
#                     price_float = 0.0
            
#             price_formatted = f"${price_float:,.2f}" if price_float else None

#             # Calculate total revenue contribution for this group
#             totalRevenue += price_float * data["SMTP_Qualified_Count"]

#             if cpl_value is None and price_float:
#                 cpl_value = price_float

#             # Accumulate totals
#             totalQualified += data["SMTP_Qualified_Count"]
#             totalDisqualified += data["SMTP_Disqualified_Count"]
#             totalPending += data["SMTP_Pending_Count"]

#             final_rows.append({
#                 "Price": price_formatted,
#                 "Order_key_id": data["Order_key_id"],
#                 "Order_id": data["Order_id"],
#                 "Campaign_name": data["Campaign_name"],
#                 "Client_name": data["Client_name"],
#                 "Lead_id": data["Lead_id"],
#                 "Company_name": data["Company_name"],
#                 "Company_name_dec": company_name,
#                 "Industry": data["Industry"],
#                 "Country": data["Country"],
#                 "Mail_domain": data["Mail_domain"],
#                 "Country_id": data["Country_id"],
#                 "Standard_industry_id": data["Standard_industry_id"],
#                 "Total_Leads_Scored": data["Total_Leads_Scored"],
#                 "SMTP_Qualified_Count": data["SMTP_Qualified_Count"],
#                 "SMTP_Disqualified_Count": data["SMTP_Disqualified_Count"],
#                 "SMTP_Pending_Count": data["SMTP_Pending_Count"],
#             })

#         card_data = [
#             {"value": totalQualified, "label": "Qualified", "color": "text-success"},
#             {"value": totalDisqualified, "label": "Disqualified", "color": "text-danger"},
#             {"value": totalPending, "label": "Pending", "color": "text-orange"},
#             {
#                 "value": f"${cpl_value:,.2f}" if cpl_value is not None else "$0.00",
#                 "label": "CPL",
#                 "color": "text-success"
#             },
#             {
#                 "value": encrypt_value(f"{totalRevenue:.2f}"),  # raw number encrypted, no $ sign
#                 "label": "Projected Revenue",
#                 "color": "text-purple",
#                 "is_encrypted": True
#             }
#         ]

#         return {"companies": final_rows, "card_data": card_data}

#     except HTTPException as he:
#         raise he

#     except Exception as e:
#         return {"companies": [], "error": "Internal server error: " + str(e)}
    

@router.post("/decrypt_revenue")
def decrypt_revenue(
    encrypted_value: str = Body(..., embed=True)
):
    try:
        decrypted = decrypt_value(encrypted_value)
        return {"value": f"${float(decrypted):,.2f}"}
    except Exception as e:
        return {"error": f"Decryption failed: {str(e)}"}