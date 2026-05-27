import os
from dotenv import load_dotenv

load_dotenv()

PORT: int             = int(os.getenv("PORT", "8000"))
AI_SERVICE_SECRET: str = os.getenv("AI_SERVICE_SECRET", "")
CLIENT_URL: str        = os.getenv("CLIENT_URL", "http://localhost:5173")
BACKEND_URL: str       = os.getenv("BACKEND_URL", "http://localhost:5000")
