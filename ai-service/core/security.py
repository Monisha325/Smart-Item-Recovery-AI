import secrets
import logging
from fastapi import Header, HTTPException
from core.config import AI_SERVICE_SECRET

logger = logging.getLogger(__name__)


async def verify_api_key(x_ai_service_secret: str = Header(default="")) -> None:
    if not AI_SERVICE_SECRET:
        logger.warning("AI_SERVICE_SECRET is not set — running in dev mode with no auth")
        return
    if not secrets.compare_digest(x_ai_service_secret, AI_SERVICE_SECRET):
        raise HTTPException(status_code=401, detail="Unauthorized")
