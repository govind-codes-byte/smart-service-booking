#!/usr/bin/env python3
"""Entry point — run from project root: python run.py"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app import app
from backend.config import Config

if __name__ == "__main__":
    print(f"\n🚀  ServeNow starting on http://localhost:{Config.PORT}")
    print(f"📦  Debug mode: {Config.DEBUG}\n")
    app.run(debug=Config.DEBUG, port=Config.PORT)
