from __future__ import annotations

import os
from datetime import datetime
from typing import Any, Dict, Optional

import numpy as np
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from .models import (
    DifficultyPrediction,
    DifficultyRequest,
    HealthResponse,
    PredictionMetadata,
    RiskPrediction,
    RiskRequest,
    RiskResponse,
)
from .registry import (
    MODEL_CACHE,
    ModelFileMissingError,
    ModelNotDeployedError,
    clear_model_cache,
    flatten_features,
    load_model_artifact,
    vectorise_features,
    get_supabase,
)
from .rule_based import (
    determine_risk_level,
    rule_based_burnout,
    rule_based_difficulty,
    rule_based_dropout,
)


FEATURE_VERSION = os.getenv("FEATURE_VERSION", "1.0.0")
RELOAD_TOKEN = os.getenv("MODEL_RELOAD_TOKEN")

app = FastAPI(title="Mentark ML Serving API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/admin/reload")
def reload_models(request: Request):
    provided_token = (
        request.headers.get("x-reload-token")
        or request.query_params.get("token")
    )

    if RELOAD_TOKEN and provided_token != RELOAD_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid reload token")

    clear_model_cache()
    return {"success": True, "message": "Model cache cleared"}


def _fetch_feature_vector(student_id: str, feature_version: Optional[str]) -> Optional[Dict[str, Any]]:
    supabase = get_supabase()
    version = feature_version or FEATURE_VERSION

    response = (
        supabase.table("ml_feature_store")
        .select("*")
        .eq("student_id", student_id)
        .eq("feature_version", version)
        .order("extraction_timestamp", desc=True)
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    record = response.data[0]
    return {
        "feature_version": record.get("feature_version", version),
        "feature_timestamp": record.get("extraction_timestamp"),
        "features": record.get("features", {}),
    }


def _build_metadata(
    metadata: Dict[str, Any],
    feature_version: str,
    feature_timestamp: Optional[str],
    used_fallback: bool,
    fallback_reason: Optional[str],
) -> PredictionMetadata:
    return PredictionMetadata(
        model_name=metadata.get("model_name"),
        model_version=metadata.get("version"),
        feature_version=feature_version,
        feature_timestamp=datetime.fromisoformat(feature_timestamp) if feature_timestamp else None,
        used_fallback=used_fallback,
        fallback_reason=fallback_reason,
    )


def _predict_with_model(
    model_type: str,
    raw_features: Dict[str, Any],
    feature_names_key: str = "feature_names",
    proba_index: int = 1,
) -> Dict[str, Any]:
    artifact_bundle = load_model_artifact(model_type)
    artifact = artifact_bundle["artifact"]
    flat = flatten_features(raw_features)
    feature_names = artifact.get(feature_names_key)
    if not feature_names:
        raise RuntimeError(f"Missing feature names for model '{model_type}'")

    vector = vectorise_features(flat, feature_names)
    scaler = artifact.get("scaler")
    if scaler is not None:
        vector = scaler.transform(vector)

    model = artifact.get("model")
    if model is None:
        raise RuntimeError(f"Model object missing for '{model_type}'")

    metadata = artifact_bundle.get("metadata", {})

    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(vector)
        probability = float(probabilities[0][proba_index])
        score = probability * 100
        return {
            "score": score,
            "probability": probability,
            "metadata": metadata,
        }

    predictions = model.predict(vector)
    value = float(predictions[0])
    return {
        "value": value,
        "metadata": metadata,
    }


def _compose_risk_prediction(
    primary_score: float,
    fallback_payload: Dict[str, Any],
    metadata: PredictionMetadata,
) -> RiskPrediction:
    level = determine_risk_level(primary_score)
    probability = primary_score / 100

    # Use heuristic factors for interpretability
    factors = fallback_payload.get("factors", [])
    recommendations = fallback_payload.get("recommendations", [])

    return RiskPrediction(
        score=round(primary_score, 2),
        level=level,
        probability=round(probability, 3),
        factors=factors,
        recommendations=recommendations,
        metadata=metadata,
    )


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    deployed = {}
    for model_type in ["dropout", "burnout", "difficulty", "sentiment"]:
        if model_type in MODEL_CACHE:
            deployed[model_type] = MODEL_CACHE[model_type]["version"]
        else:
            deployed[model_type] = None

    return HealthResponse(
        status="ok",
        timestamp=datetime.utcnow(),
        cache={k: v.get("loaded_at") for k, v in MODEL_CACHE.items()},
        deployed_models=deployed,
        feature_version=FEATURE_VERSION,
    )


@app.post("/predict/risk", response_model=RiskResponse)
def predict_risk(request: RiskRequest) -> RiskResponse:
    feature_record = _fetch_feature_vector(request.student_id, request.feature_version)
    if not feature_record:
        raise HTTPException(status_code=404, detail="Feature vector not found for student")

    features = feature_record["features"]
    feature_version = feature_record["feature_version"]
    feature_timestamp = feature_record.get("feature_timestamp")

    dropout_payload = rule_based_dropout(features)
    burnout_payload = rule_based_burnout(features)

    dropout_score = dropout_payload["score"]
    dropout_metadata = PredictionMetadata(
        model_name="rule_based_dropout",
        model_version="fallback",
        feature_version=feature_version,
        feature_timestamp=datetime.fromisoformat(feature_timestamp) if feature_timestamp else None,
        used_fallback=True,
        fallback_reason="Rule-based baseline",
    )

    burnout_score = burnout_payload["score"]
    burnout_metadata = PredictionMetadata(
        model_name="rule_based_burnout",
        model_version="fallback",
        feature_version=feature_version,
        feature_timestamp=datetime.fromisoformat(feature_timestamp) if feature_timestamp else None,
        used_fallback=True,
        fallback_reason="Rule-based baseline",
    )

    if not request.force_fallback:
        try:
            dropout_model_output = _predict_with_model("dropout", features)
            dropout_score = dropout_model_output["score"]
            dropout_metadata = _build_metadata(
                dropout_model_output["metadata"],
                feature_version,
                feature_timestamp,
                used_fallback=False,
                fallback_reason=None,
            )
        except (ModelNotDeployedError, ModelFileMissingError) as exc:
            dropout_metadata.fallback_reason = str(exc)
        except Exception as exc:  # noqa: BLE001
            dropout_metadata.fallback_reason = f"Model inference failed: {exc}"  # keep fallback

        try:
            burnout_model_output = _predict_with_model("burnout", features)
            burnout_score = burnout_model_output["score"]
            burnout_metadata = _build_metadata(
                burnout_model_output["metadata"],
                feature_version,
                feature_timestamp,
                used_fallback=False,
                fallback_reason=None,
            )
        except (ModelNotDeployedError, ModelFileMissingError) as exc:
            burnout_metadata.fallback_reason = str(exc)
        except Exception as exc:  # noqa: BLE001
            burnout_metadata.fallback_reason = f"Model inference failed: {exc}"

    dropout_prediction = _compose_risk_prediction(dropout_score, dropout_payload, dropout_metadata)
    burnout_prediction = _compose_risk_prediction(burnout_score, burnout_payload, burnout_metadata)

    disengagement = round((dropout_prediction.score + burnout_prediction.score) / 2, 2)

    return RiskResponse(
        dropout=dropout_prediction,
        burnout=burnout_prediction,
        disengagement_score=disengagement,
        generated_at=datetime.utcnow(),
    )


@app.post("/predict/difficulty", response_model=DifficultyPrediction)
def predict_difficulty(request: DifficultyRequest) -> DifficultyPrediction:
    feature_record = _fetch_feature_vector(request.student_id, request.feature_version)
    if not feature_record:
        raise HTTPException(status_code=404, detail="Feature vector not found for student")

    features = feature_record["features"]
    feature_version = feature_record["feature_version"]
    feature_timestamp = feature_record.get("feature_timestamp")

    fallback_payload = rule_based_difficulty(features)
    difficulty_score = fallback_payload["difficulty_score"]
    metadata = PredictionMetadata(
        model_name="rule_based_difficulty",
        model_version="fallback",
        feature_version=feature_version,
        feature_timestamp=datetime.fromisoformat(feature_timestamp) if feature_timestamp else None,
        used_fallback=True,
        fallback_reason="Rule-based baseline",
    )

    if not request.force_fallback:
        try:
            output = _predict_with_model("difficulty", features, proba_index=0)
            difficulty_score = output["value"]
            metadata = _build_metadata(
                output["metadata"],
                feature_version,
                feature_timestamp,
                used_fallback=False,
                fallback_reason=None,
            )
        except (ModelNotDeployedError, ModelFileMissingError) as exc:
            metadata.fallback_reason = str(exc)
        except Exception as exc:  # noqa: BLE001
            metadata.fallback_reason = f"Model inference failed: {exc}"

    recommended_level = fallback_payload["recommended_level"]
    confidence = fallback_payload["confidence"]

    if not metadata.used_fallback:
        # Align recommended level heuristically with model score
        if difficulty_score >= 4.0:
            recommended_level = "ambitious"
        elif difficulty_score >= 2.5:
            recommended_level = "standard"
        else:
            recommended_level = "foundational"
        confidence = min(0.95, max(0.4, np.interp(difficulty_score, [0.5, 5.0], [0.45, 0.9])))

    return DifficultyPrediction(
        difficulty_score=round(difficulty_score, 2),
        recommended_level=recommended_level,
        confidence=round(float(confidence), 3),
        recommendations=fallback_payload.get("recommendations", []),
        metadata=metadata,
    )
