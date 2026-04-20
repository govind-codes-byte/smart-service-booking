from flask import Blueprint, request, jsonify
from backend.models.user_model import create_user, find_user_by_email
from backend.utils.auth import hash_password, check_password, generate_token
from backend.utils.helpers import validate_required, serialize

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/api/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    err = validate_required(data, ["name", "email", "password", "role"])
    if err:
        return jsonify({"error": err}), 400

    if data["role"] not in ["user", "provider"]:
        return jsonify({"error": "Role must be 'user' or 'provider'"}), 400

    if find_user_by_email(data["email"]):
        return jsonify({"error": "Email already registered"}), 409

    if len(data["password"]) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    hashed = hash_password(data["password"])
    user_id = create_user(
        name=data["name"],
        email=data["email"],
        password_hash=hashed,
        role=data["role"],
        phone=data.get("phone", "")
    )
    token = generate_token(user_id, data["role"])
    return jsonify({
        "message": "Registered successfully",
        "token": token,
        "user": {
            "id": user_id,
            "name": data["name"],
            "email": data["email"],
            "role": data["role"]
        }
    }), 201

@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    err = validate_required(data, ["email", "password"])
    if err:
        return jsonify({"error": err}), 400

    user = find_user_by_email(data["email"])
    if not user or not check_password(data["password"], user["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    token = generate_token(str(user["_id"]), user["role"])
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }), 200

@auth_bp.route("/api/me", methods=["GET"])
def me():
    from backend.utils.auth import decode_token
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return jsonify({"error": "Token required"}), 401
    try:
        payload = decode_token(token)
        from backend.models.user_model import find_user_by_id
        user = find_user_by_id(payload["user_id"])
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(serialize({k: v for k, v in user.items() if k != "password"})), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401
