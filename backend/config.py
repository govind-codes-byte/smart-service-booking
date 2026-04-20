import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/smart_booking")
    JWT_SECRET = os.getenv("JWT_SECRET", "fallback_secret_change_me")
    DEBUG = os.getenv("FLASK_DEBUG", "False") == "True"
    PORT = int(os.getenv("PORT", 5000))
