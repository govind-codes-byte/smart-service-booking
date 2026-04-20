from datetime import datetime
from backend.utils.db import get_collection

def users_col():
    return get_collection("users")

def create_user(name, email, password_hash, role, phone=""):
    user = {
        "name": name,
        "email": email,
        "password": password_hash,
        "role": role,  # "user" | "provider" | "admin"
        "phone": phone,
        "createdAt": datetime.utcnow()
    }
    result = users_col().insert_one(user)
    return str(result.inserted_id)

def find_user_by_email(email):
    return users_col().find_one({"email": email})

def find_user_by_id(user_id):
    from bson import ObjectId
    return users_col().find_one({"_id": ObjectId(user_id)})

def get_all_users():
    return list(users_col().find({}, {"password": 0}))

def delete_user(user_id):
    from bson import ObjectId
    return users_col().delete_one({"_id": ObjectId(user_id)})
