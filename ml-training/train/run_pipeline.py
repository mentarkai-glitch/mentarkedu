"""
Run the full ML training pipeline sequentially for all models.

This script loads labeled datasets from Supabase, trains the Dropout,
Burnout, Career, Difficulty, and Sentiment models (skipping any that
lack data), writes per-model reports, and registers successful runs to
`ml_model_versions` when Supabase credentials are provided.
"""

from __future__ import annotations

import os
import sys
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List

import pandas as pd

# Add src directory to path for shared utilities
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "src"))

from data_loader import DataLoader
from train_dropout_model import train_dropout_model
from train_burnout_model import train_burnout_model
from train_career_model import train_career_model
from train_difficulty_model import train_difficulty_model
from train_sentiment_model import train_sentiment_model

try:
    from supabase import create_client
except ImportError:
    create_client = None  # Supabase optional; handled later

try:
    from postgrest.exceptions import APIError  # type: ignore
except ImportError:  # pragma: no cover - best effort optional dependency
    APIError = Exception


MODELS = [
    {
        "key": "dropout",
        "label_type": "dropout",
        "train_fn": train_dropout_model,
        "min_samples": 50,
    },
    {
        "key": "burnout",
        "label_type": "burnout",
        "train_fn": train_burnout_model,
        "min_samples": 50,
    },
    {
        "key": "career",
        "label_type": "career_success",
        "train_fn": train_career_model,
        "min_samples": 50,
    },
    {
        "key": "difficulty",
        "label_type": "ark_difficulty",
        "train_fn": train_difficulty_model,
        "min_samples": 50,
    },
    {
        "key": "sentiment",
        "label_type": "sentiment",
        "train_fn": train_sentiment_model,
        "min_samples": 200,
        "uses_raw_records": True,
    },
]


def build_reports_dir() -> Path:
    reports_dir = Path(__file__).resolve().parent.parent / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)
    return reports_dir


def save_summary(reports_dir: Path, model_key: str, summary: Dict[str, Any]) -> None:
    path = reports_dir / f"{model_key}_summary.json"
    with path.open("w", encoding="utf-8") as fp:
        json.dump(summary, fp, indent=2, default=str)


def register_model_version(metadata: Dict[str, Any]) -> Optional[str]:
    """Upsert model metadata into Supabase if credentials are provided."""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key or create_client is None:
        return "Supabase credentials not configured"

    client = create_client(url, key)
    payload = metadata.copy()
    payload.setdefault("deployed", False)

    try:
        response = client.table("ml_model_versions").upsert(payload).execute()
    except APIError as exc:
        detail = getattr(exc, "details", None) or getattr(exc, "message", str(exc))
        code = getattr(exc, "code", None)
        if code == "23505":
            return "Supabase registry: duplicate version (already registered)"
        return f"Supabase error: {detail}"
    except Exception as exc:  # noqa: BLE001
        return f"Supabase error: {exc}"

    error = getattr(response, "error", None)
    status_code = getattr(response, "status_code", None)

    if error:
        # Some versions expose `error` as string or object
        if isinstance(error, Exception):
            return f"Supabase error: {error}"
        if isinstance(error, dict) and "message" in error:
            return f"Supabase error: {error['message']}"
        return f"Supabase error: {error}"

    if status_code and status_code >= 400:
        data = getattr(response, "data", None)
        return f"Supabase error: status {status_code} - {data}"

    return None


def load_dataset(config: Dict[str, Any], loader: DataLoader):
    label_type = config["label_type"]
    if config.get("uses_raw_records"):
        records = loader.load_raw_training_records(label_type)
        if not records:
            return pd.DataFrame()
        return pd.DataFrame(records)
    return loader.load_training_data(label_type)


def run_pipeline(use_mlflow: bool = False) -> List[Dict[str, Any]]:
    loader = DataLoader()
    reports_dir = build_reports_dir()
    results: List[Dict[str, Any]] = []

    for cfg in MODELS:
        key = cfg["key"]
        print(f"\n=== Training {key.upper()} model ===")

        df = load_dataset(cfg, loader)
        sample_count = len(df)

        summary: Dict[str, Any] = {
            "model_type": key,
            "label_type": cfg["label_type"],
            "timestamp": datetime.utcnow().isoformat(),
            "samples": sample_count,
        }

        if sample_count < cfg.get("min_samples", 1):
            reason = (
                f"Insufficient data: need at least {cfg['min_samples']} samples, found {sample_count}."
            )
            print(reason)
            summary["status"] = "skipped"
            summary["reason"] = reason
            save_summary(reports_dir, key, summary)
            results.append(summary)
            continue

        try:
            train_fn = cfg["train_fn"]
            if cfg.get("uses_raw_records"):
                outcome = train_fn(use_mlflow=use_mlflow, dataframe=df)
            else:
                outcome = train_fn(use_mlflow=use_mlflow, dataframe=df)
        except Exception as exc:  # noqa: BLE001
            message = f"Training failed: {exc}"
            print(message)
            summary["status"] = "error"
            summary["reason"] = message
            save_summary(reports_dir, key, summary)
            results.append(summary)
            continue

        if not outcome:
            summary["status"] = "skipped"
            summary["reason"] = "Training function returned no result"
            save_summary(reports_dir, key, summary)
            results.append(summary)
            continue

        model, metrics, metadata = outcome
        summary["status"] = "trained"
        summary["metrics"] = metrics
        summary["metadata"] = metadata

        registration_error = register_model_version(metadata)
        if registration_error:
            summary["registration_status"] = registration_error
            print(registration_error)
        else:
            summary["registration_status"] = "registered"
            print("Model metadata registered in Supabase.")

        save_summary(reports_dir, key, summary)
        results.append(summary)

    return results


if __name__ == "__main__":
    final_results = run_pipeline()
    print("\nPipeline complete. Summary:")
    for result in final_results:
        print(
            f"- {result['model_type']}: {result['status']} "
            f"({result.get('samples', 0)} samples)"
        )

