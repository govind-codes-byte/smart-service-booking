import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app import app
from backend.config import Config

if __name__ == "__main__":
    port = int(os.environ.get("PORT", Config.PORT))
    app.run(host="0.0.0.0", port=port, debug=Config.DEBUG)