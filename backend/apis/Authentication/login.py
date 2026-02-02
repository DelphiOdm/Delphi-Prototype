from fastapi import APIRouter, Form, HTTPException
from db import get_conn
import hashlib

router = APIRouter()

@router.post("/login")
def login(user_email: str = Form(...), user_password: str = Form(...)):
    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    # If password is stored as plain text (not recommended but simple)
    query = """
        SELECT 
            User_id AS id,
            User_email AS email,
            CONCAT(User_firstname,' ',User_lastname) AS fullname,
            Prole_id AS role
        FROM Mst_tblusers
        WHERE User_email = %s 
          AND User_password = %s
          AND Isactive = 1
    """

    cur.execute(query, (user_email, user_password))
    user = cur.fetchone()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "user": user
    }
