from __future__ import annotations

from typing import Dict, List, Tuple


def _get_nested(data: Dict, *keys, default=None):
    value = data
    for key in keys:
        if not isinstance(value, dict) or key not in value:
            return default
        value = value[key]
    return value


def _clamp(value: float, min_value: float, max_value: float) -> float:
    return max(min_value, min(max_value, value))


def _risk_level(score: float) -> str:
    if score >= 80:
        return "critical"
    if score >= 60:
        return "high"
    if score >= 40:
        return "medium"
    return "low"


def determine_risk_level(score: float) -> str:
    return _risk_level(score)


def rule_based_dropout(features: Dict) -> Dict:
    checkin_rate = _get_nested(features, "engagement", "checkin_completion_rate_7d", default=0.0)
    streak_breaks = _get_nested(features, "engagement", "streak_break_count", default=0)
    chat_sessions = _get_nested(features, "engagement", "chat_session_count_30d", default=0)
    progress_rate = _get_nested(features, "performance", "ark_progress_rate_30d", default=0.0)
    xp_rate = _get_nested(features, "performance", "xp_earning_rate", default=0.0)
    declining_days = _get_nested(features, "performance", "progress_decline_days_30d", default=0)
    interventions = _get_nested(features, "behavioral", "behavioral_change_score", default=0.0)

    score = 0.0
    reasons: List[str] = []

    if checkin_rate < 0.5:
        delta = (0.5 - checkin_rate) * 80
        score += delta
        reasons.append("Low daily check-in completion")

    if streak_breaks >= 3:
        delta = min(streak_breaks * 6, 24)
        score += delta
        reasons.append("Frequent learning streak breaks")

    if chat_sessions < 2:
        score += 8
        reasons.append("Minimal mentor/chat engagement")

    if progress_rate <= 0:
        score += 18
        reasons.append("ARK progress trending downward")

    if xp_rate < 15:
        score += 10
        reasons.append("Low XP accumulation")

    if declining_days > 5:
        score += min((declining_days - 5) * 3, 18)
        reasons.append("Multiple consecutive underperformance days")

    if interventions > 0.4:
        score += 12
        reasons.append("Interventions suggest inconsistent behaviour")

    score = _clamp(score, 5, 100)
    level = _risk_level(score)

    recommendations = []
    if level in {"critical", "high"}:
        recommendations.append("Schedule mentor intervention within 48 hours")
        recommendations.append("Create a simplified two-week recovery plan")
    if checkin_rate < 0.6:
        recommendations.append("Enable check-in reminders and celebrate streak milestones")
    if progress_rate <= 0:
        recommendations.append("Review ARK milestones and adjust scope")

    return {
        "score": round(score, 2),
        "level": level,
        "probability": round(score / 100, 3),
        "factors": reasons or ["Limited telemetry available"],
        "recommendations": recommendations,
    }


def rule_based_burnout(features: Dict) -> Dict:
    emotion_7d = _get_nested(features, "emotional", "avg_emotion_score_7d", default=6.0)
    energy_7d = _get_nested(features, "emotional", "avg_energy_level_7d", default=6.0)
    stress_days = _get_nested(features, "emotional", "stress_days_count_30d", default=0)
    emotion_trend = _get_nested(features, "emotional", "emotion_trend", default=0.0)
    low_energy_days = _get_nested(features, "emotional", "low_energy_days_count_30d", default=0)
    chat_sessions = _get_nested(features, "engagement", "chat_session_count_30d", default=0)

    score = 0.0
    reasons: List[str] = []

    if emotion_7d <= 4:
        score += (4 - emotion_7d) * 10
        reasons.append("Self-reported mood trending low")

    if energy_7d <= 4:
        score += (4 - energy_7d) * 9
        reasons.append("Low energy in recent check-ins")

    if stress_days >= 10:
        score += min((stress_days - 9) * 2.5, 25)
        reasons.append("Frequent high-stress check-ins")

    if emotion_trend < -0.2:
        score += abs(emotion_trend) * 30
        reasons.append("Emotion trend declining week-over-week")

    if low_energy_days >= 7:
        score += min((low_energy_days - 6) * 2, 18)
        reasons.append("Many low-energy days recorded")

    if chat_sessions == 0:
        score += 6
        reasons.append("No supportive conversations logged")

    score = _clamp(score, 5, 100)
    level = _risk_level(score)

    recommendations: List[str] = []
    if level in {"critical", "high"}:
        recommendations.extend([
            "Assign wellbeing mentor check-in",
            "Share guided relaxation or mindfulness session",
        ])
    if stress_days >= 10:
        recommendations.append("Review workload and redistribute ARK milestones")

    return {
        "score": round(score, 2),
        "level": level,
        "probability": round(score / 100, 3),
        "factors": reasons or ["Limited telemetry available"],
        "recommendations": recommendations,
    }


def rule_based_difficulty(features: Dict) -> Dict:
    progress_rate = _get_nested(features, "performance", "ark_progress_rate_30d", default=0.0)
    xp_rate = _get_nested(features, "performance", "xp_earning_rate", default=0.0)
    motivation = _get_nested(features, "profile", "motivation_level", default=7.0)
    confidence = _get_nested(features, "profile", "confidence_level", default=6.0)
    time_commitment = _get_nested(features, "profile", "hours_per_week", default=8.0)

    aptitude = (progress_rate * 2) + (xp_rate / 10) + (motivation * 3) + (confidence * 2)
    workload = time_commitment * 1.5
    raw_score = aptitude + workload
    normalized = _clamp(raw_score / 10, 0.5, 5.0)

    if normalized >= 4.0:
        level = "ambitious"
    elif normalized >= 2.5:
        level = "standard"
    else:
        level = "foundational"

    recommendations: List[str] = []
    if level == "ambitious":
        recommendations.append("Introduce stretch goals and peer challenges")
    elif level == "standard":
        recommendations.append("Maintain current ARK cadence")
    else:
        recommendations.append("Break milestones into smaller weekly targets")

    confidence_score = 0.55 + (min(motivation, 10) / 25)

    return {
        "difficulty_score": round(normalized, 2),
        "recommended_level": level,
        "confidence": round(_clamp(confidence_score, 0.4, 0.95), 3),
        "recommendations": recommendations,
    }
