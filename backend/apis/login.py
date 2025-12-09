# from fastapi import APIRouter, Query, HTTPException, Body, Form, Depends
# from fastapi.middleware.cors import CORSMiddleware
# from typing import Optional
# from db import get_conn  # import your DB function
# from utils.crypto_utils import decrypt_value, encrypt_value  # import your decryption function

# router = APIRouter()

# from fastapi.middleware.cors import CORSMiddleware

# router.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],  # or ["*"] for all (not recommended in prod)
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# @router.post("/login")
# def login(user_email: str = Form(...), user_password: str = Form(...)):
#     conn = get_conn()
#     cursor = conn.cursor(dictionary=True)

#     # Hash password with MD5
#     hashed_password = hashlib.md5(user_password.encode()).hexdigest()

#     # Fetch user dynamically
#     cursor.execute(
#         """
#         SELECT User_id, User_firstname, User_middlename, User_lastname, User_email, Prole_id
#         FROM mst_tblusers
#         WHERE User_email = %s
#           AND User_password = %s
#         """,
#         (user_email, hashed_password),
#     )
#     user = cursor.fetchone()

#     cursor.close()
#     conn.close()

#     if not user:
#         raise HTTPException(status_code=401, detail="Invalid email or password")

#     if "User_firstname" in user and user["User_firstname"]:
#         user["User_firstname"] = decrypt_value(user["User_firstname"])
    
#     if "User_middlename" in user and user["User_middlename"]:
#         user["User_middlename"] = decrypt_value(user["User_middlename"])

#     if "User_lastname" in user and user["User_lastname"]:
#         user["User_lastname"] = decrypt_value(user["User_lastname"])

#     # Combine full name
#     full_name = " ".join(filter(None, [user["User_firstname"], user["User_middlename"], user["User_lastname"]]))

#     return {
#         "message": "Login successful",
#         "user": {
#             "id": user["User_id"],
#             "firstname": user["User_firstname"],
#             "middlename": user["User_middlename"],
#             "lastname": user["User_lastname"],
#             "fullname": full_name,  # ✅ full name added
#             "email": user["User_email"],
#             "role": user["Prole_id"],
#         },
#     }
