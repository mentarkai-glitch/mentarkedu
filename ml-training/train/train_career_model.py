"""
Train Career Recommendation Model
LightGBM classifier for predicting career recommendation buckets
"""

import os
import sys
import argparse
import json
from typing import Optional
import mlflow
import mlflow.lightgbm
import pandas as pd
from lightgbm import LGBMClassifier
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "src"))

from data_loader import DataLoader
from utils import (
    evaluate_classification_model,
    save_model_metadata,
    ensure_dir,
    parse_label_value,
)


def train_career_model(
    test_size: float = 0.2,
    random_state: int = 42,
    n_estimators: int = 300,
    learning_rate: float = 0.05,
    num_leaves: int = 31,
    use_mlflow: bool = True,
    dataframe: Optional[pd.DataFrame] = None,
):
    """Train career recommendation model"""

    if use_mlflow:
        mlflow.set_experiment("career_recommendation")
        mlflow.start_run()

    loader = DataLoader()
    df = dataframe if dataframe is not None else loader.load_training_data("career_success")

    if df.empty:
        print("No career training data available. Collect labeled outcomes first.")
        if use_mlflow:
            mlflow.end_run()
        return

    feature_cols = loader.get_feature_names("career_success")
    if not feature_cols:
        print("No features found for career dataset.")
        if use_mlflow:
            mlflow.end_run()
        return

    df["label_value"] = df["label"].apply(parse_label_value)
    df = df.dropna(subset=["label_value"])

    if df.empty:
        print("No valid labels found for career dataset.")
        if use_mlflow:
            mlflow.end_run()
        return

    encoder = LabelEncoder()
    y = encoder.fit_transform(df["label_value"])
    X = df[feature_cols].fillna(0)

    scaler = StandardScaler()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = LGBMClassifier(
        n_estimators=n_estimators,
        learning_rate=learning_rate,
        num_leaves=num_leaves,
        random_state=random_state,
        objective="multiclass",
        class_weight="balanced",
    )

    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)
    y_pred_proba = model.predict_proba(X_test_scaled)

    metrics = evaluate_classification_model(y_test, y_pred)
    metrics["num_classes"] = len(encoder.classes_)

    print("\nCareer Model Performance:")
    for key, value in metrics.items():
        if isinstance(value, float):
            print(f"{key}: {value:.4f}")
        else:
            print(f"{key}: {value}")

    X_scaled = scaler.transform(X)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=random_state)
    cv_scores = cross_val_score(model, X_scaled, y, cv=cv, scoring="f1_weighted")
    print(
        f"Cross-validation F1 (weighted): {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})"
    )

    ensure_dir("../data/models")
    model_path = "../data/models/career_model_v1.pkl"
    encoder_path = "../data/models/career_label_encoder.json"

    import joblib

    joblib.dump(
        {
            "model": model,
            "scaler": scaler,
            "feature_names": feature_cols,
            "classes": encoder.classes_.tolist(),
        },
        model_path,
    )

    with open(encoder_path, "w") as f:
        json.dump({"classes": encoder.classes_.tolist()}, f, indent=2)

    if use_mlflow:
        mlflow.log_params(
            {
                "n_estimators": n_estimators,
                "learning_rate": learning_rate,
                "num_leaves": num_leaves,
                "test_size": test_size,
                "random_state": random_state,
                "num_classes": len(encoder.classes_),
            }
        )
        mlflow.log_metrics(metrics)
        mlflow.log_artifact(model_path)
        mlflow.log_artifact(encoder_path)
        mlflow.lightgbm.log_model(model, "model")
        mlflow.end_run()

    metadata = save_model_metadata(
        model_name="career_recommendation_model",
        version="1.0.0",
        model_type="career",
        metrics=metrics,
        hyperparameters={
            "n_estimators": n_estimators,
            "learning_rate": learning_rate,
            "num_leaves": num_leaves,
        },
        model_path=model_path,
        training_data_count=len(df),
    )

    print("\nTraining complete. Metadata:")
    print(metadata)
    return model, metrics, metadata


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train career recommendation model")
    parser.add_argument("--test-size", type=float, default=0.2)
    parser.add_argument("--random-state", type=int, default=42)
    parser.add_argument("--n-estimators", type=int, default=300)
    parser.add_argument("--learning-rate", type=float, default=0.05)
    parser.add_argument("--num-leaves", type=int, default=31)
    parser.add_argument("--no-mlflow", action="store_true")

    args = parser.parse_args()

    train_career_model(
        test_size=args.test_size,
        random_state=args.random_state,
        n_estimators=args.n_estimators,
        learning_rate=args.learning_rate,
        num_leaves=args.num_leaves,
        use_mlflow=not args.no_mlflow,
    )

