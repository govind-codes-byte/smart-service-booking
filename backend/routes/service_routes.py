from flask import Blueprint, request, jsonify
from backend.models.service_model import (
    create_service, get_all_services, get_service_by_id,
    get_services_by_provider, update_service, delete_service, CATEGORIES
)
from backend.models.user_model import find_user_by_id
from backend.utils.auth import token_required, role_required
from backend.utils.helpers import validate_required, serialize, serialize_list

services_bp = Blueprint("services", __name__)

@services_bp.route("/api/services", methods=["GET"])
def list_services():
    category = request.args.get("category")
    search = request.args.get("search")
    services = get_all_services(category=category, search=search)
    return jsonify(serialize_list(services)), 200

@services_bp.route("/api/services/categories", methods=["GET"])
def list_categories():
    return jsonify({"categories": CATEGORIES}), 200

@services_bp.route("/api/services/<service_id>", methods=["GET"])
def get_service(service_id):
    service = get_service_by_id(service_id)
    if not service:
        return jsonify({"error": "Service not found"}), 404
    return jsonify(serialize(service)), 200

@services_bp.route("/api/services", methods=["POST"])
@role_required("provider", "admin")
def add_service():
    data = request.get_json() or {}
    err = validate_required(data, ["title", "category", "description", "price"])
    if err:
        return jsonify({"error": err}), 400

    user = find_user_by_id(request.user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    service_id = create_service(
        title=data["title"],
        category=data["category"],
        description=data["description"],
        price=data["price"],
        provider_id=request.user_id,
        provider_name=user["name"]
    )
    return jsonify({"message": "Service created", "id": service_id}), 201

@services_bp.route("/api/services/<service_id>", methods=["PUT"])
@role_required("provider", "admin")
def edit_service(service_id):
    service = get_service_by_id(service_id)
    if not service:
        return jsonify({"error": "Service not found"}), 404
    if service["providerId"] != request.user_id and request.user_role != "admin":
        return jsonify({"error": "Not authorized"}), 403
    data = request.get_json() or {}
    update_service(service_id, data)
    return jsonify({"message": "Service updated"}), 200

@services_bp.route("/api/services/<service_id>", methods=["DELETE"])
@role_required("provider", "admin")
def remove_service(service_id):
    service = get_service_by_id(service_id)
    if not service:
        return jsonify({"error": "Service not found"}), 404
    if service["providerId"] != request.user_id and request.user_role != "admin":
        return jsonify({"error": "Not authorized"}), 403
    delete_service(service_id)
    return jsonify({"message": "Service deleted"}), 200

@services_bp.route("/api/provider/services", methods=["GET"])
@role_required("provider", "admin")
def my_services():
    services = get_services_by_provider(request.user_id)
    return jsonify(serialize_list(services)), 200
