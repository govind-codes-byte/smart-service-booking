from flask import Blueprint, request, jsonify
from backend.models.user_model import get_all_users, delete_user
from backend.models.service_model import get_all_services, delete_service
from backend.models.booking_model import get_all_bookings
from backend.utils.auth import role_required
from backend.utils.helpers import serialize_list

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/api/admin/users", methods=["GET"])
@role_required("admin")
def list_users():
    users = get_all_users()
    return jsonify(serialize_list(users)), 200

@admin_bp.route("/api/admin/users/<user_id>", methods=["DELETE"])
@role_required("admin")
def remove_user(user_id):
    delete_user(user_id)
    return jsonify({"message": "User deleted"}), 200

@admin_bp.route("/api/admin/services", methods=["GET"])
@role_required("admin")
def list_all_services():
    services = get_all_services()
    return jsonify(serialize_list(services)), 200

@admin_bp.route("/api/admin/services/<service_id>", methods=["DELETE"])
@role_required("admin")
def remove_service(service_id):
    delete_service(service_id)
    return jsonify({"message": "Service deleted"}), 200

@admin_bp.route("/api/admin/bookings", methods=["GET"])
@role_required("admin")
def list_all_bookings():
    bookings = get_all_bookings()
    return jsonify(serialize_list(bookings)), 200

@admin_bp.route("/api/admin/stats", methods=["GET"])
@role_required("admin")
def stats():
    from backend.utils.db import get_db
    db = get_db()
    return jsonify({
        "users": db["users"].count_documents({}),
        "services": db["services"].count_documents({}),
        "bookings": db["bookings"].count_documents({}),
        "reviews": db["reviews"].count_documents({})
    }), 200
