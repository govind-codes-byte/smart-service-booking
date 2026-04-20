from datetime import datetime
from bson import ObjectId
from backend.utils.db import get_collection

def services_col():
    return get_collection("services")

CATEGORIES = ["Electrician", "Plumber", "Tutor", "Cleaner", "Carpenter", "Painter", "Mechanic", "Cook", "Gardener", "Other"]

def create_service(title, category, description, price, provider_id, provider_name):
    service = {
        "title": title,
        "category": category,
        "description": description,
        "price": float(price),
        "providerId": provider_id,
        "providerName": provider_name,
        "rating": 0.0,
        "reviewCount": 0,
        "createdAt": datetime.utcnow()
    }
    result = services_col().insert_one(service)
    return str(result.inserted_id)

def get_all_services(category=None, search=None):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}}
        ]
    return list(services_col().find(query))

def get_service_by_id(service_id):
    oid = ObjectId(service_id) if ObjectId.is_valid(service_id) else None
    if not oid:
        return None
    return services_col().find_one({"_id": oid})

def get_services_by_provider(provider_id):
    return list(services_col().find({"providerId": provider_id}))

def update_service(service_id, data):
    oid = ObjectId(service_id)
    allowed = ["title", "category", "description", "price"]
    update_data = {k: v for k, v in data.items() if k in allowed}
    if "price" in update_data:
        update_data["price"] = float(update_data["price"])
    return services_col().update_one({"_id": oid}, {"$set": update_data})

def delete_service(service_id):
    oid = ObjectId(service_id)
    return services_col().delete_one({"_id": oid})

def update_service_rating(service_id):
    from backend.utils.db import get_collection
    reviews = list(get_collection("reviews").find({"serviceId": service_id}))
    if not reviews:
        return
    avg = sum(r["rating"] for r in reviews) / len(reviews)
    services_col().update_one(
        {"_id": ObjectId(service_id)},
        {"$set": {"rating": round(avg, 1), "reviewCount": len(reviews)}}
    )
