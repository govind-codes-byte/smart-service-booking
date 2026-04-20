from flask import Blueprint, request, jsonify
from backend.models.booking_model import (
    create_booking, get_bookings_by_user, get_bookings_by_provider,
    get_all_bookings, get_booking_by_id, update_booking_status, STATUSES
)
from backend.models.service_model import get_service_by_id
from backend.models.user_model import find_user_by_id
from backend.utils.auth import token_required, role_required
from backend.utils.helpers import validate_required, serialize, serialize_list

bookings_bp = Blueprint("bookings", __name__)

@bookings_bp.route("/api/book", methods=["POST"])
@token_required
def book_service():
    data = request.get_json() or {}
    err = validate_required(data, ["serviceId", "date", "time", "address"])
    if err:
        return jsonify({"error": err}), 400

    service = get_service_by_id(data["serviceId"])
    if not service:
        return jsonify({"error": "Service not found"}), 404

    user = find_user_by_id(request.user_id)
    booking_id = create_booking(
        user_id=request.user_id,
        service_id=data["serviceId"],
        provider_id=service["providerId"],
        date=data["date"],
        time=data["time"],
        address=data["address"],
        service_title=service["title"],
        user_name=user["name"] if user else "Unknown"
    )
    return jsonify({"message": "Booking created", "id": booking_id}), 201

@bookings_bp.route("/api/user/bookings", methods=["GET"])
@token_required
def user_bookings():
    bookings = get_bookings_by_user(request.user_id)
    return jsonify(serialize_list(bookings)), 200

@bookings_bp.route("/api/provider/bookings", methods=["GET"])
@role_required("provider", "admin")
def provider_bookings():
    bookings = get_bookings_by_provider(request.user_id)
    return jsonify(serialize_list(bookings)), 200

@bookings_bp.route("/api/book/<booking_id>/status", methods=["PUT"])
@token_required
def change_status(booking_id):
    data = request.get_json() or {}
    status = data.get("status")
    if status not in STATUSES:
        return jsonify({"error": f"Invalid status. Must be one of: {STATUSES}"}), 400

    booking = get_booking_by_id(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    # Users can only cancel their own bookings
    if request.user_role == "user":
        if booking["userId"] != request.user_id:
            return jsonify({"error": "Not authorized"}), 403
        if status != "cancelled":
            return jsonify({"error": "Users can only cancel bookings"}), 403

    # Providers can accept/complete/reject their own bookings
    if request.user_role == "provider":
        if booking["providerId"] != request.user_id:
            return jsonify({"error": "Not authorized"}), 403

    update_booking_status(booking_id, status)
    return jsonify({"message": f"Booking {status}"}), 200
