from datetime import datetime
from bson import ObjectId
from backend.utils.db import get_collection

def reviews_col():
    return get_collection("reviews")

def create_review(user_id, service_id, rating, comment, user_name):
    # Prevent duplicate reviews from same user for same service
    existing = reviews_col().find_one({"userId": user_id, "serviceId": service_id})
    if existing:
        reviews_col().update_one(
            {"_id": existing["_id"]},
            {"$set": {"rating": rating, "comment": comment, "updatedAt": datetime.utcnow()}}
        )
        return str(existing["_id"])
    review = {
        "userId": user_id,
        "serviceId": service_id,
        "rating": rating,
        "comment": comment,
        "userName": user_name,
        "createdAt": datetime.utcnow()
    }
    result = reviews_col().insert_one(review)
    return str(result.inserted_id)

def get_reviews_by_service(service_id):
    return list(reviews_col().find({"serviceId": service_id}).sort("createdAt", -1))
