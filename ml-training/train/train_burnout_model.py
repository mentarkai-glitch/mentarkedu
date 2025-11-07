"""
Train Burnout Prediction Model
Gradient Boosting classifier for predicting burnout risk
"""

import os
import sys
import argparse
from typing import Optional
import mlflow
import mlflow.xgboost
import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "src"))

from data_loader import DataLoader
from utils import (
    evaluate_classification_model,
    save_model_metadata,
    ensure_dir,
    extract_binary_label,
)


def train_burnout_model(
    test_size: float = 0.2,
    random_state: int = 42,
    n_estimators: int = 200,
    max_depth: int = 5,
    learning_rate: float = 0.05,
    subsample: float = 0.9,
    colsample_bytree: float = 0.8,
    use_mlflow: bool = True,
    dataframe: Optional[pd.DataFrame] = None,
):
    """Train burnout prediction model"""

    if use_mlflow:
        mlflow.set_experiment("burnout_prediction")
        mlflow.start_run()

    loader = DataLoader()
    df = dataframe if dataframe is not None else loader.load_training_data("burnout")

    if df.empty:
        print("No burnout training data available. Label outcomes first.")
        if use_mlflow:
            mlflow.end_run()
        return

    feature_cols = loader.get_feature_names("burnout")

    if not feature_cols:
        print("No numeric features available for burnout model.")
        if use_mlflow:
            mlflow.end_run()
        return

    X = df[feature_cols].fillna(0)
    y = df["label"].apply(
        lambda value: extract_binary_label(
            value, positive_values=["high", "severe", "burnout", True, 1]
        )
    )

    scaler = StandardScaler()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = XGBClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        learning_rate=learning_rate,
        subsample=subsample,
        colsample_bytree=colsample_bytree,
        random_state=random_state,
        eval_metric="logloss",
        scale_pos_weight=1.0,
    )

    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)
    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]

    metrics = evaluate_classification_model(y_test, y_pred, y_pred_proba)

    print("\nBurnout Model Performance:")
    for key, value in metrics.items():
        if key == "confusion_matrix":
            print(f"{key}: {value}")
        else:
            print(f"{key}: {value:.4f}")

    cv_scores = cross_val_score(
        model, scaler.transform(X), y, cv=5, scoring="f1", n_jobs=-1
    )
    print(
        f"Cross-validation F1: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})"
    )

    ensure_dir("../data/models")
    model_path = "../data/models/burnout_model_v1.pkl"

    import joblib

    joblib.dump(
        {
            "model": model,
            "scaler": scaler,
            "feature_names": feature_cols,
        },
        model_path,
    )

    if use_mlflow:
        mlflow.log_params(
            {
                "n_estimators": n_estimators,
                "max_depth": max_depth,
                "learning_rate": learning_rate,
                "subsample": subsample,
                "colsample_bytree": colsample_bytree,
                "test_size": test_size,
            }
        )
        mlflow.log_metrics(metrics)
        mlflow.log_artifact(model_path)
        mlflow.xgboost.log_model(model, "model")
        mlflow.end_run()

    metadata = save_model_metadata(
        model_name="burnout_risk_predictor",
        version="1.0.0",
        model_type="burnout",
        metrics=metrics,
        hyperparameters={
            "n_estimators": n_estimators,
            "max_depth": max_depth,
            "learning_rate": learning_rate,
            "subsample": subsample,
            "colsample_bytree": colsample_bytree,
        },
        model_path=model_path,
        training_data_count=len(df),
    )

    print("\nTraining complete. Metadata:")
    print(metadata)
    return model, metrics, metadata


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train burnout prediction model")
    parser.add_argument("--test-size", type=float, default=0.2)
    parser.add_argument("--random-state", type=int, default=42)
    parser.add_argument("--n-estimators", type=int, default=200)
    parser.add_argument("--max-depth", type=int, default=5)
    parser.add_argument("--learning-rate", type=float, default=0.05)
    parser.add_argument("--subsample", type=float, default=0.9)
    parser.add_argument("--colsample-bytree", type=float, default=0.8)
    parser.add_argument("--no-mlflow", action="store_true")

    args = parser.parse_args()

    train_burnout_model(
        test_size=args.test_size,
        random_state=args.random_state,
        n_estimators=args.n_estimators,
        max_depth=args.max_depth,
        learning_rate=args.learning_rate,
        subsample=args.subsample,
        colsample_bytree=args.colsample_bytree,
        use_mlflow=not args.no_mlflow,
    )

