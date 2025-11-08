from __future__ import annotations

import os
from datetime import datetime
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, Optional

import joblib
import numpy as np
from supabase import Client, create_client


MODEL_CACHE: Dict[str, Dict[str, Any]] = {}


class ModelNotDeployedError(RuntimeError):
    pass


class ModelFileMissingError(RuntimeError):
    pass


def get_model_registry_dir() -> Path:
    registry = os.getenv("MODEL_REGISTRY_DIR", "../ml-training/data/models")
    base = Path(__file__).resolve().parents[2]
    candidate = (base / registry).resolve()
    return candidate


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
    return create_client(url, key)


def fetch_deployed_model_metadata(model_type: str) -> Dict[str, Any]:
    supabase = get_supabase()
    response = supabase.table("ml_model_versions").select("*").eq("model_type", model_type).eq("deployed", True).order("deployed_at", desc=True).limit(1).execute()

    if not response.data:
        raise ModelNotDeployedError(f"No deployed model found for type '{model_type}'")

    return response.data[0]


def load_model_artifact(model_type: str) -> Dict[str, Any]:
    metadata = fetch_deployed_model_metadata(model_type)
    version = metadata.get("version")

    cached = MODEL_CACHE.get(model_type)
    if cached and cached.get("version") == version:
        return cached

    model_path = metadata.get("model_path")
    if not model_path:
        raise ModelFileMissingError(f"Model path missing for type '{model_type}'")

    file_path = Path(model_path)
    if not file_path.is_absolute():
        candidate = get_model_registry_dir() / file_path
    else:
        candidate = file_path

    if not candidate.exists():
        # try fallback: maybe stored only filename
        alt_candidate = get_model_registry_dir() / candidate.name
        if alt_candidate.exists():
            candidate = alt_candidate
        else:
            raise ModelFileMissingError(f"Model file not found: {candidate}")

    artifact = joblib.load(candidate)
    MODEL_CACHE[model_type] = {
        "artifact": artifact,
        "version": version,
        "metadata": metadata,
        "path": str(candidate),
        "loaded_at": datetime.utcnow().isoformat(),
    }
    return MODEL_CACHE[model_type]


def clear_model_cache(model_type: Optional[str] = None) -> None:
    if model_type:
        MODEL_CACHE.pop(model_type, None)
    else:
        MODEL_CACHE.clear()


def flatten_features(features: Dict[str, Any], prefix: str = "") -> Dict[str, Any]:
    flat: Dict[str, Any] = {}
    for key, value in features.items():
        path = f"{prefix}{key}" if not prefix else f"{prefix}_{key}"
        if isinstance(value, dict):
            flat.update(flatten_features(value, path))
        else:
            flat[path] = value
    return flat


def vectorise_features(flat_features: Dict[str, Any], feature_names: list[str]) -> np.ndarray:
    return np.array([flat_features.get(name, 0) for name in feature_names]).reshape(1, -1)
