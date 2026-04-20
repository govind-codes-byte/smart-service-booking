from flask import Blueprint, request, jsonify
from backend.models.review_model import create_review, get_reviews_by_service
from backend.models.service_model import update_service_rating
from backend.models.user_model import find_user_by_id
from backend.utils.auth import token_required
from backend.utils.helpers import validate_required, serialize_list

reviews_bp = Blueprint("reviews", __name__)

@reviews_bp.route("/api/review", methods=["POST"])
@token_required
def add_review():
    data = request.get_json() or {}
    err = validate_required(data, ["serviceId", "rating", "comment"])
    if err:
        return jsonify({"error": err}), 400

    rating = int(data["rating"])
    if not 1 <= rating <= 5:
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    user = find_user_by_id(request.user_id)
    review_id = create_review(
        user_id=request.user_id,
        service_id=data["serviceId"],
        rating=rating,
        comment=data["comment"],
        user_name=user["name"] if user else "Anonymous"
    )
    update_service_rating(data["serviceId"])
    return jsonify({"message": "Review submitted", "id": review_id}), 201

@reviews_bp.route("/api/reviews/<service_id>", methods=["GET"])
def get_reviews(service_id):
    reviews = get_reviews_by_service(service_id)
    return jsonify(serialize_list(reviews)), 200
