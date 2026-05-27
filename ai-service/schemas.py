from pydantic import BaseModel
from typing import List


class EmbedRequest(BaseModel):
    text: str


class EmbedResponse(BaseModel):
    embedding: List[float]


class SimilarityRequest(BaseModel):
    embedding_a: List[float]
    embedding_b: List[float]


class SimilarityResponse(BaseModel):
    score: float


class ImageLabelsResponse(BaseModel):
    labels: List[str]


class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    uptime_seconds: float
