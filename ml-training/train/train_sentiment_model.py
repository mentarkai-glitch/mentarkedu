"""
Train Sentiment Analysis Model
TF-IDF + Logistic Regression for educational sentiment classification
"""

import os
import sys
import argparse
import json
from typing import Optional
import mlflow
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "src"))

from data_loader import DataLoader
from utils import (
    evaluate_classification_model,
    save_model_metadata,
    ensure_dir,
    parse_label_value,
)


def extract_text_and_label(record):
    label_value = record.get("label_value", {})
    if isinstance(label_value, str):
        try:
            label_value = json.loads(label_value)
        except json.JSONDecodeError:
            return label_value, None

    text = None
    label = None

    if isinstance(label_value, dict):
        text = label_value.get("text") or label_value.get("message") or label_value.get("content")
        label = label_value.get("label") or label_value.get("sentiment")

    return text, label


def train_sentiment_model(
    test_size: float = 0.2,
    random_state: int = 42,
    max_features: int = 2000,
    use_mlflow: bool = True,
    dataframe: Optional[pd.DataFrame] = None,
):
    """Train sentiment analysis model"""

    if use_mlflow:
        mlflow.set_experiment("sentiment_analysis")
        mlflow.start_run()

    loader = DataLoader()
    if dataframe is not None:
        records = dataframe.to_dict("records")
    else:
        records = loader.load_raw_training_records("sentiment")

    if not records:
        print("No sentiment training data available.")
        if use_mlflow:
            mlflow.end_run()
        return

    dataset = []
    for record in records:
        text, label = extract_text_and_label(record)
        if text and label:
            dataset.append({"text": text, "label": label})

    if not dataset:
        print("Sentiment records found but no valid text/label pairs.")
        if use_mlflow:
            mlflow.end_run()
        return

    df = pd.DataFrame(dataset)
    df["label"] = df["label"].apply(parse_label_value)

    X_train, X_test, y_train, y_test = train_test_split(
        df["text"], df["label"], test_size=test_size, random_state=random_state, stratify=df["label"]
    )

    pipeline = Pipeline(
        [
            (
                "tfidf",
                TfidfVectorizer(
                    max_features=max_features,
                    ngram_range=(1, 2),
                    stop_words="english",
                ),
            ),
            ("clf", LogisticRegression(max_iter=1000, class_weight="balanced")),
        ]
    )

    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    y_pred_proba = None
    if hasattr(pipeline["clf"], "predict_proba"):
        y_pred_proba = pipeline.predict_proba(X_test)
        # For multi-class we provide probability for positive class? evaluation function uses y_pred_proba only for binary.
        if y_pred_proba.shape[1] == 2:
            y_pred_proba = y_pred_proba[:, 1]
        else:
            y_pred_proba = None

    metrics = evaluate_classification_model(y_test, y_pred, y_pred_proba)
    metrics["num_classes"] = df["label"].nunique()

    print("\nSentiment Model Performance:")
    for key, value in metrics.items():
        if isinstance(value, float):
            print(f"{key}: {value:.4f}")
        else:
            print(f"{key}: {value}")

    cv_scores = cross_val_score(pipeline, df["text"], df["label"], cv=5, scoring="f1_weighted")
    print(
        f"Cross-validation F1 (weighted): {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})"
    )

    ensure_dir("../data/models")
    model_path = "../data/models/sentiment_model_v1.pkl"

    import joblib

    joblib.dump(pipeline, model_path)

    if use_mlflow:
        mlflow.log_params(
            {
                "test_size": test_size,
                "max_features": max_features,
                "num_classes": df["label"].nunique(),
            }
        )
        mlflow.log_metrics(metrics)
        mlflow.log_metric("cv_f1_weighted", cv_scores.mean())
        mlflow.log_artifact(model_path)
        mlflow.end_run()

    metadata = save_model_metadata(
        model_name="sentiment_classifier",
        version="1.0.0",
        model_type="sentiment",
        metrics=metrics,
        hyperparameters={
            "max_features": max_features,
        },
        model_path=model_path,
        training_data_count=len(df),
    )

    print("\nTraining complete. Metadata:")
    print(metadata)
    return pipeline, metrics, metadata


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train sentiment analysis model")
    parser.add_argument("--test-size", type=float, default=0.2)
    parser.add_argument("--random-state", type=int, default=42)
    parser.add_argument("--max-features", type=int, default=2000)
    parser.add_argument("--no-mlflow", action="store_true")

    args = parser.parse_args()

    train_sentiment_model(
        test_size=args.test_size,
        random_state=args.random_state,
        max_features=args.max_features,
        use_mlflow=not args.no_mlflow,
    )

