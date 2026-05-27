import logging
import time
from typing import List
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

_model: SentenceTransformer | None = None


def load_model() -> None:
    global _model
    t0 = time.perf_counter()
    logger.info("Loading embedding model %s …", MODEL_NAME)
    _model = SentenceTransformer(MODEL_NAME)
    logger.info("Embedding model loaded in %.2fs", time.perf_counter() - t0)


def generate_embedding(text: str) -> List[float]:
    if _model is None:
        raise RuntimeError("Embedding model not loaded")
    vector = _model.encode(text, convert_to_numpy=True)
    return vector.tolist()
