"""
Train ARK Difficulty Prediction Model
Gradient boosting regressor to predict optimal ARK difficulty level
"""

import os
import sys
import argparse
from typing import Optional
import mlflow
import mlflow.xgboost
import pandas as pd
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.preprocessing import StandardScaler

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "src"))

from data_loader import DataLoader
from utils import (
    evaluate_regression_model,
    save_model_metadata,
    ensure_dir,
    extract_regression_target,
)


def train_difficulty_model(
    test_size: float = 0.2,
    random_state: int = 42,
    n_estimators: int = 400,
    max_depth: int = 6,
    learning_rate: float = 0.05,
    use_mlflow: bool = True,
    dataframe: Optional[pd.DataFrame] = None,
):
    """Train ARK difficulty prediction model"""

    if use_mlflow:
        mlflow.set_experiment("ark_difficulty_prediction")
        mlflow.start_run()

    loader = DataLoader()
    df = dataframe if dataframe is not None else loader.load_training_data("ark_difficulty")

    if df.empty:
        print("No difficulty training data available. Label ARK difficulty outcomes first.")
        if use_mlflow:
            mlflow.end_run()
        return

    feature_cols = loader.get_feature_names("ark_difficulty")
    if not feature_cols:
        print("No features found for difficulty dataset.")
        if use_mlflow:
            mlflow.end_run()
        return

    X = df[feature_cols].fillna(0)
    y = df["label"].apply(
        lambda value: extract_regression_target(
            value, key="difficulty_score", default=2.5
        )
    )

    scaler = StandardScaler()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )

    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = XGBRegressor(
        n_estimators=n_estimators,
        max_depth=max_depth,
        learning_rate=learning_rate,
        subsample=0.9,
        colsample_bytree=0.8,
        random_state=random_state,
        objective="reg:squarederror",
    )

    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)

    metrics = evaluate_regression_model(y_test, y_pred)

    print("\nDifficulty Model Performance:")
    for key, value in metrics.items():
        print(f"{key}: {value:.4f}")

    X_scaled = scaler.transform(X)
    cv = KFold(n_splits=5, shuffle=True, random_state=random_state)
    cv_scores = cross_val_score(
        model, X_scaled, y, cv=cv, scoring="neg_mean_squared_error"
    )
    rmse = ((-cv_scores).mean()) ** 0.5
    print(f"Cross-validation RMSE: {rmse:.4f}")

    ensure_dir("../data/models")
    model_path = "../data/models/difficulty_model_v1.pkl"

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
                "test_size": test_size,
            }
        )
        mlflow.log_metrics(metrics)
        mlflow.log_metric("cv_rmse", rmse)
        mlflow.log_artifact(model_path)
        mlflow.xgboost.log_model(model, "model")
        mlflow.end_run()

    metadata = save_model_metadata(
        model_name="ark_difficulty_predictor",
        version="1.0.0",
        model_type="difficulty",
        metrics=metrics,
        hyperparameters={
            "n_estimators": n_estimators,
            "max_depth": max_depth,
            "learning_rate": learning_rate,
        },
        model_path=model_path,
        training_data_count=len(df),
    )

    print("\nTraining complete. Metadata:")
    print(metadata)
    return model, metrics, metadata


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Train ARK difficulty prediction model"
    )
    parser.add_argument("--test-size", type=float, default=0.2)
    parser.add_argument("--random-state", type=int, default=42)
    parser.add_argument("--n-estimators", type=int, default=400)
    parser.add_argument("--max-depth", type=int, default=6)
    parser.add_argument("--learning-rate", type=float, default=0.05)
    parser.add_argument("--no-mlflow", action="store_true")

    args = parser.parse_args()

    train_difficulty_model(
        test_size=args.test_size,
        random_state=args.random_state,
        n_estimators=args.n_estimators,
        max_depth=args.max_depth,
        learning_rate=args.learning_rate,
        use_mlflow=not args.no_mlflow,
    )

