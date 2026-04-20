import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, send_from_directory
from flask_cors import CORS
from backend.config import Config
from backend.routes.auth_routes import auth_bp
from backend.routes.service_routes import services_bp
from backend.routes.booking_routes import bookings_bp
from backend.routes.review_routes import reviews_bp
from backend.routes.admin_routes import admin_bp

app = Flask(__name__, static_folder="../frontend", static_url_path="")
CORS(app)

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(services_bp)
app.register_blueprint(bookings_bp)
app.register_blueprint(reviews_bp)
app.register_blueprint(admin_bp)

# Serve frontend
@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def serve_static(path):
    full_path = os.path.join(app.static_folder, path)
    if os.path.exists(full_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

@app.errorhandler(404)
def not_found(e):
    return {"error": "Not found"}, 404

@app.errorhandler(500)
def server_error(e):
    return {"error": "Internal server error"}, 500

if __name__ == "__main__":
    app.run(debug=Config.DEBUG, port=Config.PORT)
