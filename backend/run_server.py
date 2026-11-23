"""
Standalone Runner for CA Bharat AI Backend
Runs FastAPI server on port 8000 using uvicorn
"""

import uvicorn
import os
import sys

# Ensure backend root is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

if __name__ == "__main__":
    print("=" * 70)
    print("Starting CA Bharat AI Enterprise Direct Tax Backend (Python 3.13)")
    print("Architecture: Zero-LLM Deterministic Engine + ICAI Workpaper Service")
    print("Server URL: http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    print("=" * 70)
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
