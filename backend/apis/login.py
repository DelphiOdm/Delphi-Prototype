# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# from db import get_conn

# router = APIRouter()

# class LoginRequest(BaseModel):
#     email: str
#     password: str

# @router.post("/login")
# def login(data: LoginRequest):
#     conn = get_conn()
#     cursor = conn.cursor(dictionary=True)

#     cursor.execute("""
#         SELECT User_id, User_firstname, User_lastname, User_email
#         FROM Mst_tblusers
#         WHERE User_email = %s
#           AND User_password = %s
#           AND Isactive = 1
#     """, (data.email, data.password))

#     user = cursor.fetchone()
#     cursor.close()
#     conn.close()

#     if not user:
#         raise HTTPException(status_code=401, detail="Invalid email or password")

#     return {
#         "user": {
#             "id": user["User_id"],
#             "email": user["User_email"],
#             "fullname": f'{user["User_firstname"]} {user["User_lastname"]}'
#         }
#     }
