from datetime import datetime
from bson import ObjectId
from backend.utils.db import get_collection

def bookings_col():
    return get_collection("bookings")

STATUSES = ["pending", "accepted", "completed", "cancelled"]

def create_booking(user_id, service_id, provider_id, date, time, address, service_title, user_name):
    booking = {
        "userId": user_id,
        "serviceId": service_id,
        "providerId": provider_id,
        "date": date,
        "time": time,
        "address": address,
        "status": "pending",
        "serviceTitle": service_title,
        "userName": user_name,
        "createdAt": datetime.utcnow()
    }
    result = bookings_col().insert_one(booking)
    return str(result.inserted_id)

def get_bookings_by_user(user_id):
    return list(bookings_col().find({"userId": user_id}).sort("createdAt", -1))

def get_bookings_by_provider(provider_id):
    return list(bookings_col().find({"providerId": provider_id}).sort("createdAt", -1))

def get_all_bookings():
    return list(bookings_col().find({}).sort("createdAt", -1))

def get_booking_by_id(booking_id):
    oid = ObjectId(booking_id) if ObjectId.is_valid(booking_id) else None
    if not oid:
        return None
    return bookings_col().find_one({"_id": oid})

def update_booking_status(booking_id, status):
    oid = ObjectId(booking_id)
    return bookings_col().update_one({"_id": oid}, {"$set": {"status": status}})
