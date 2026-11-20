import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
SCREENSHOT_DIR = UPLOAD_DIR / "screenshots"

SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = f"sqlite:///{BASE_DIR / 'skyra_creations.db'}"

SECRET_KEY = os.getenv("SECRET_KEY", "skyra-creations-secret-key-2026-fashion-runway-portal")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Official Event Default Configurations from specification
DEFAULT_EVENT_NAME = "SKYRA CREATIONS - RUNWAY SHOW"
DEFAULT_TOTAL_FEE = 5000.0
DEFAULT_UPI_ID = "mr.death4646@oksbi"
DEFAULT_UPI_NAME = "Sanjay Mass"
DEFAULT_WHATSAPP_SUPPORT = "+919876543210"
