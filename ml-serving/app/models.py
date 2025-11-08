from __future__ import annotations

from datetime import datetime
from typing import List, Optional, Dict

from pydantic import BaseModel, Field


class PredictionMetadata(BaseModel):
    model_name: Optional[str] = None
    model_version: Optional[str] = None
    feature_version: Optional[str] = None
    feature_timestamp: Optional[datetime] = None
    used_fallback: bool = False
    fallback_reason: Optional[str] = None


class RiskPrediction(BaseModel):
    score: float = Field(..., ge=0, le=100)
    level: str
    probability: float = Field(..., ge=0.0, le=1.0)
    factors: List[str] = []
    recommendations: List[str] = []
    metadata: PredictionMetadata


class RiskRequest(BaseModel):
    student_id: str
    feature_version: Optional[str] = None
    force_fallback: bool = False


class RiskResponse(BaseModel):
    dropout: RiskPrediction
    burnout: RiskPrediction
    disengagement_score: float
    generated_at: datetime


class DifficultyRequest(BaseModel):
    student_id: str
    ark_id: Optional[str] = None
    feature_version: Optional[str] = None
    force_fallback: bool = False


class DifficultyPrediction(BaseModel):
    difficulty_score: float
    recommended_level: str
    confidence: float
    recommendations: List[str] = []
    metadata: PredictionMetadata


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    cache: Dict[str, str]
    deployed_models: Dict[str, Optional[str]]
    feature_version: Optional[str]
