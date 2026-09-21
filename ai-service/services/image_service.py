import io
import logging
import time
from typing import List

import torch
from PIL import Image
from torchvision.models import resnet50, ResNet50_Weights

logger = logging.getLogger(__name__)

_model: torch.nn.Module | None = None
_preprocess = None
_labels: List[str] = []


def load_model() -> None:
    global _model, _preprocess, _labels
    t0 = time.perf_counter()
    logger.info("Loading ResNet50 image classification model …")
    weights = ResNet50_Weights.DEFAULT
    _model = resnet50(weights=weights)
    _model.eval()
    _preprocess = weights.transforms()
    _labels = weights.meta["categories"]
    logger.info("Image model loaded in %.2fs", time.perf_counter() - t0)


def extract_labels(image_bytes: bytes, top_k: int = 5) -> List[str]:
    if _model is None or _preprocess is None:
        raise RuntimeError("Image model not loaded")

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    batch = _preprocess(image).unsqueeze(0)

    with torch.no_grad():
        logits = _model(batch)
        probs = torch.softmax(logits, dim=1)[0]

    top_indices = probs.topk(top_k).indices.tolist()
    return [_labels[i] for i in top_indices]
