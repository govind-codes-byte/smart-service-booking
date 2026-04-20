from bson import ObjectId
from datetime import datetime

def serialize(doc) -> dict:
    """Convert MongoDB document to JSON-serializable dict."""
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, list):
            result[key] = [serialize(v) if isinstance(v, dict) else (str(v) if isinstance(v, ObjectId) else v) for v in value]
        elif isinstance(value, dict):
            result[key] = serialize(value)
        else:
            result[key] = value
    return result

def serialize_list(docs) -> list:
    return [serialize(doc) for doc in docs]

def validate_required(data: dict, fields: list) -> str | None:
    """Returns error string if a required field is missing."""
    for field in fields:
        if not data.get(field):
            return f"'{field}' is required"
    return None

def object_id(id_str: str):
    try:
        return ObjectId(id_str)
    except Exception:
        return None
