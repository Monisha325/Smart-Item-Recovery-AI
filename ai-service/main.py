import asyncio
import logging
import os
import time
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from core.config import PORT, CLIENT_URL, BACKEND_URL
from core.security import verify_api_key
from schemas import (
    EmbedRequest, EmbedResponse,
    SimilarityRequest, SimilarityResponse,
    ImageLabelsResponse, HealthResponse,
)
import services.embedding_service as emb_svc
import services.image_service as img_svc
from services.similarity_service import cosine_similarity

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

_start_time: float = 0.0
_models_loaded: bool = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _start_time, _models_loaded
    _start_time = time.perf_counter()

    logger.info("AI service starting without model preload (Render free tier mode)")

    _models_loaded = True
    yield


app = FastAPI(
    title="Smart Campus Lost & Found — AI Service",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────
_is_prod = os.getenv("NODE_ENV") == "production"
_allowed_origins = [CLIENT_URL, BACKEND_URL] if _is_prod else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health ───────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(
        status="ok",
        models_loaded=_models_loaded,
        uptime_seconds=time.perf_counter() - _start_time if _start_time else 0.0,
    )

# ── Embedding ────────────────────────────────────────────────────────

@app.post("/embed", response_model=EmbedResponse, dependencies=[Depends(verify_api_key)])
async def embed(body: EmbedRequest):
    loop = asyncio.get_event_loop()
    vector = await loop.run_in_executor(None, emb_svc.generate_embedding, body.text)
    return EmbedResponse(embedding=vector)

# ── Image labels ─────────────────────────────────────────────────────

@app.post("/image-labels", response_model=ImageLabelsResponse, dependencies=[Depends(verify_api_key)])
async def image_labels(file: UploadFile = File(...)):
    image_bytes = await file.read()
    loop = asyncio.get_event_loop()
    labels = await loop.run_in_executor(None, img_svc.extract_labels, image_bytes)
    return ImageLabelsResponse(labels=labels)

# ── Cosine similarity ────────────────────────────────────────────────

@app.post("/similarity", response_model=SimilarityResponse, dependencies=[Depends(verify_api_key)])
async def similarity(body: SimilarityRequest):
    loop = asyncio.get_event_loop()
    score = await loop.run_in_executor(None, cosine_similarity, body.embedding_a, body.embedding_b)
    return SimilarityResponse(score=score)

# ── Entrypoint ───────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=False)
