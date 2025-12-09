from fastapi import FastAPI, Query, HTTPException, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from db import get_conn
from utils.crypto_utils import decrypt_value, encrypt_value
import hashlib
import logging

from apis.get_all_campaigns import router as campaigns_router
from apis.get_all_companies import router as companies_router
from apis.get_single_company_details import router as company_details_router


app = FastAPI()

origins = ["http://172.16.60.17:3000/"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace * with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include routers from each file
app.include_router(campaigns_router)
app.include_router(companies_router)
app.include_router(company_details_router)

@app.get("/")
def root():
    return {"message": "API running"}

# ---------------- Pydantic model ----------------
class LoginRequest(BaseModel):
    user_email: str
    user_password: str

@app.get("/get_role")
def get_role(prole_id: int = Query(..., description="Role ID to fetch")):
    try:
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT Prole_id, Prole_desc
            FROM mst_tbluser_processroles 
            WHERE Prole_id = %s
            """,
            (prole_id,)   # ✅ SINGLE-ELEMENT TUPLE
        )
        role = cursor.fetchone()

        cursor.close()
        conn.close()

        if not role:
            raise HTTPException(status_code=404, detail="No role found")

        return {"role_id": role["Prole_id"], "role_name": role["Prole_desc"]}

    except Exception as e:
        logging.error(f"Error fetching role: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

# ---------------- TEAM LEADS API ----------------

@app.get("/get_agent_leads")
def get_agent_leads(user_id: int = Query(..., description="ID of the user"),
                    decrypt: bool = Query(False, description="Decrypt price and revenue")):
    try:
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT u.User_firstname, u.User_lastname,
                   tel.Engaged_by, u.Puser_id, tel.Order_key_id, 
                   tod.Initial_start_delivery_dt, tod.Effective_end_delivery_dt, tod.price,
                   tod.Order_id as campaign_name,
                   CONCAT(LTRIM(mtc.Client_code),' | ',mtc.Client_abbreviation,' | ',mtc.Client_name) AS clientCode,
                   COUNT(1) AS Total_Leads_Scored, 
                   SUM(CASE WHEN tlsat.IsSMTPqualified=1 THEN 1 ELSE 0 END) AS SMTP_Qualified_Count,
                   SUM(CASE WHEN tlsat.IsSMTPqualified=0 THEN 1 ELSE 0 END) AS SMTP_Disqualified_Count,
                   SUM(CASE WHEN tlsat.IsSMTPqualified=9 THEN 1 ELSE 0 END) AS SMTP_Pending_Count
            FROM tblleads_status_activity_tracker tlsat
            JOIN tblengaged_leads tel ON tel.Engage_id = tlsat.Engage_id
            JOIN tblleads_masterlist tlm ON tlm.Lead_id = tlsat.Lead_id
            JOIN mst_tblusers uu ON uu.User_id = tel.Engaged_by
            JOIN tblorder_details tod ON tod.Order_key_id = tel.Order_key_id
            JOIN mst_tblclient_campaigns mtcc ON mtcc.Campaign_key_id = tel.Campaign_key_id
            JOIN mst_tblclients mtc ON mtc.Client_id = mtcc.Client_id
            JOIN mst_tblusers u ON u.User_id = tel.Engaged_by 
            WHERE tlsat.Outcome_id = 18
              AND tlsat.QAstatus_id = 0
              AND tel.Engaged_by IN (
                  SELECT sub.User_id FROM mst_tblusers sub
                  WHERE sub.Prole_id = 9 AND sub.User_id=%s
              )
            GROUP BY tel.Engaged_by;
            """,
            (user_id,)
        )
        user_list = cursor.fetchall()
        cursor.close()
        conn.close()

        if not user_list:
            raise HTTPException(status_code=404, detail="No user list found")

        # Encrypt/decrypt price and calculate revenue
        for user in user_list:
            # Price handling
            if "User_firstname" in user and user["User_firstname"]:
                user["User_firstname"] = decrypt_value(user["User_firstname"])

            if "User_lastname" in user and user["User_lastname"]:
                user["User_lastname"] = decrypt_value(user["User_lastname"])

            user["username"] = f"{user.get('User_firstname', '')} {user.get('User_lastname', '')}".strip()

        return {"user_list": user_list}

    except Exception as e:
        logging.error(f"Error fetching user list: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

@app.get("/get_teamlead_data")
def get_teamlead_data(
    user_id: int = Query(..., description="ID of the user"),
    decrypt: bool = Query(False, description="Return decrypted values")
):
    try:
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT u.User_firstname, u.User_lastname,tel.Engaged_by,u.Puser_id, tel.Order_key_id,
                   tod.Initial_start_delivery_dt, tod.Effective_end_delivery_dt,tod.price,
                   tod.Order_id as campaign_name,
                   CONCAT(LTRIM(mtc.Client_code),' | ',mtc.Client_abbreviation,' | ',mtc.Client_name) AS clientCode,
                   COUNT(1) AS Total_Leads_Scored, 
                   SUM(CASE WHEN tlsat.IsSMTPqualified= 1 THEN 1 ELSE 0 END) AS SMTP_Qualified_Count,
                   SUM(CASE WHEN tlsat.IsSMTPqualified= 0 THEN 1 ELSE 0 END) AS SMTP_Disqualified_Count,
                   SUM(CASE WHEN tlsat.IsSMTPqualified = 9 THEN  1 ELSE 0 END) AS SMTP_Pending_Count
            FROM tblleads_status_activity_tracker tlsat
            JOIN tblengaged_leads tel ON tel.Engage_id = tlsat.Engage_id
            JOIN tblleads_masterlist tlm ON tlm.Lead_id = tlsat.Lead_id
            JOIN mst_tblusers uu ON uu.User_id = tel.Engaged_by
            JOIN tblorder_details tod ON tod.Order_key_id = tel.Order_key_id
            JOIN mst_tblclient_campaigns mtcc ON mtcc.Campaign_key_id = tel.Campaign_key_id
            JOIN mst_tblclients mtc ON mtc.Client_id = mtcc.Client_id
            JOIN mst_tblusers u ON u.User_id = tel.Engaged_by  
            WHERE tlsat.Outcome_id = 18
              AND tlsat.QAstatus_id = 0  
              AND tel.Engaged_by IN (
                  SELECT sub.User_id 
                  FROM mst_tblusers sub
                  JOIN mst_tblusers subtl ON subtl.User_id = sub.Puser_id
                  WHERE subtl.Prole_id = 8 AND subtl.User_id = %s
              )  
            GROUP BY tel.Engaged_by ;
            """,
            (user_id,)
        )
        user_list = cursor.fetchall()

        cursor.close()
        conn.close()

        if not user_list:
            raise HTTPException(status_code=404, detail="No user list found")

        for user in user_list:
            # Always decrypt names for readability
            if "User_firstname" in user and user["User_firstname"]:
                user["User_firstname"] = decrypt_value(user["User_firstname"])

            if "User_lastname" in user and user["User_lastname"]:
                user["User_lastname"] = decrypt_value(user["User_lastname"])

            user["username"] = f"{user.get('User_firstname', '')} {user.get('User_lastname', '')}".strip()

            # Handle price encryption/decryption
            if "price" in user and user["price"]:
                if decrypt:
                    try:
                        user["price"] = decrypt_value(user["price"])
                    except Exception:
                        user["price"] = 0
                else:
                    # Keep price encrypted
                    user["price"] = user["price"]
            else:
                # Price missing
                if decrypt:
                    user["price"] = 0
                else:
                    user["price"] = encrypt_value(0)

            # Always calculate and encrypt revenue
            try:
                decrypted_price = decrypt_value(user["price"]) if user["price"] else 0
                price_value = float(decrypted_price)
                leads = user.get("Total_Leads_Scored", 0) or 0
                revenue_value = round(price_value * int(leads), 2)
                
                # Convert to string before encrypting
                user["revenue"] = encrypt_value(str(revenue_value))
            except Exception:
                user["revenue"] = encrypt_value(str(0))

        return {"user_list": user_list}

    except Exception as e:
        logging.error(f"Error fetching user list: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

@app.get("/get_manager_data")
def get_manager_data(user_id: int = Query(..., description="ID of the user"),
                     decrypt: bool = Query(False, description="Decrypt price and revenue")):
    try:
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT 
                CONCAT(tl.User_firstname,' ', tl.User_lastname) AS tlName,tl.User_firstname, tl.User_lastname,
                tel.Order_key_id,
                tod.Initial_start_delivery_dt,
                tod.Effective_end_delivery_dt,
                tod.price,
                tod.Order_id AS campaign_name,
                CONCAT(LTRIM(mtc.Client_code),' | ',mtc.Client_abbreviation,' | ',mtc.Client_name) AS clientCode,
                COUNT(*) AS Total_Leads_Scored, 
                SUM(tlsat.IsSMTPqualified = 1) AS SMTP_Qualified_Count,
                SUM(tlsat.IsSMTPqualified = 0) AS SMTP_Disqualified_Count,
                SUM(tlsat.IsSMTPqualified = 9) AS SMTP_Pending_Count
            FROM tblengaged_leads tel
            JOIN tblleads_status_activity_tracker tlsat 
                ON tel.Engage_id = tlsat.Engage_id
            JOIN tblleads_masterlist tlm 
                ON tlm.Lead_id = tlsat.Lead_id
            JOIN tblorder_details tod 
                ON tod.Order_key_id = tel.Order_key_id
            JOIN mst_tblclient_campaigns mtcc 
                ON mtcc.Campaign_key_id = tel.Campaign_key_id
            JOIN mst_tblclients mtc 
                ON mtc.Client_id = mtcc.Client_id
            JOIN mst_tblusers u 
                ON u.User_id = tel.Engaged_by
            JOIN mst_tblusers tl 
                ON tl.User_id = u.Puser_id
            JOIN mst_tblusers ms 
                ON ms.User_id = tl.Puser_id
            WHERE tlsat.Outcome_id = 18
            AND tlsat.QAstatus_id = 0  
            AND ms.User_id = 4
            AND u.Prole_id = 9
            GROUP BY 
                tl.User_id;
            """
        )

        user_list = cursor.fetchall()
        cursor.close()
        conn.close()

        if not user_list:
            raise HTTPException(status_code=404, detail="No user list found")

        # Encrypt/decrypt price and calculate revenue
        for user in user_list:
            
            if "User_firstname" in user and user["User_firstname"]:
                user["User_firstname"] = decrypt_value(user["User_firstname"])

            if "User_lastname" in user and user["User_lastname"]:
                user["User_lastname"] = decrypt_value(user["User_lastname"])

            user["username"] = f"{user.get('User_firstname', '')} {user.get('User_lastname', '')}".strip()
            
            # Decrypt username is already concatenated, keep as is
            # Handle price
            if "price" in user and user["price"]:
                if decrypt:
                    try:
                        decrypted_price = decrypt_value(user["price"])
                        user["price"] = decrypted_price
                        try:
                            price_value = float(decrypted_price)
                        except Exception:
                            price_value = 0
                        leads = user.get("Total_Leads_Scored", 0) or 0
                        user["revenue"] = round(price_value * int(leads), 2)
                    except Exception:
                        user["revenue"] = encrypt_value(str(0))
                else:
                    # Keep price encrypted
                    user["price"] = user["price"]
                    # Calculate revenue dynamically and encrypt
                    try:
                        decrypted_price = decrypt_value(user["price"])
                        try:
                            price_value = float(decrypted_price)
                        except Exception:
                            price_value = 0
                        leads = user.get("Total_Leads_Scored", 0) or 0
                        revenue_value = round(price_value * int(leads), 2)
                        user["revenue"] = encrypt_value(str(revenue_value))
                    except Exception:
                        user["revenue"] = encrypt_value(str(0))
            else:
                # Missing price
                if decrypt:
                    user["price"] = 0
                    user["revenue"] = 0
                else:
                    user["price"] = encrypt_value(str(0))
                    user["revenue"] = encrypt_value(str(0))

        return {"user_list": user_list}

    except Exception as e:
        logging.error(f"Error fetching user list: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

# ---------------- LOGIN API ----------------
@app.post("/login")
def login(user_email: str = Form(...), user_password: str = Form(...)):
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)

    # Hash password with MD5
    hashed_password = hashlib.md5(user_password.encode()).hexdigest()

    # Fetch user dynamically
    cursor.execute(
        """
        SELECT User_id, User_firstname, User_middlename, User_lastname, User_email, Prole_id
        FROM mst_tblusers
        WHERE User_email = %s
          AND User_password = %s
        """,
        (user_email, hashed_password),
    )
    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if "User_firstname" in user and user["User_firstname"]:
        user["User_firstname"] = decrypt_value(user["User_firstname"])
    
    if "User_middlename" in user and user["User_middlename"]:
        user["User_middlename"] = decrypt_value(user["User_middlename"])

    if "User_lastname" in user and user["User_lastname"]:
        user["User_lastname"] = decrypt_value(user["User_lastname"])

    # Combine full name
    full_name = " ".join(filter(None, [user["User_firstname"], user["User_middlename"], user["User_lastname"]]))

    return {
        "message": "Login successful",
        "user": {
            "id": user["User_id"],
            "firstname": user["User_firstname"],
            "middlename": user["User_middlename"],
            "lastname": user["User_lastname"],
            "fullname": full_name,  # ✅ full name added
            "email": user["User_email"],
            "role": user["Prole_id"],
        },
    }
