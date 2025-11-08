"""
Train Dropout Risk Prediction Model
XGBoost classifier for predicting student dropout risk
"""

import os
import sys
import argparse
from typing import Optional
import mlflow
import mlflow.xgboost
import pandas as pd
import numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from data_loader import DataLoader
from utils import evaluate_classification_model, save_model_metadata, ensure_dir

def train_dropout_model(
    test_size: float = 0.2,
    random_state: int = 42,
    n_estimators: int = 100,
    max_depth: int = 6,
    learning_rate: float = 0.1,
    use_mlflow: bool = True,
    dataframe: Optional[pd.DataFrame] = None,
):
    """
    Train dropout risk prediction model
    
    Args:
        test_size: Proportion of data for test set
        random_state: Random seed
        n_estimators: Number of boosting rounds
        max_depth: Maximum tree depth
        learning_rate: Learning rate
        use_mlflow: Whether to log to MLflow
    """
    
    # Initialize MLflow
    if use_mlflow:
        mlflow.set_experiment("dropout_prediction")
        mlflow.start_run()
    
    # Load data
    print("Loading training data...")
    loader = DataLoader()
    df = dataframe if dataframe is not None else loader.load_training_data("dropout")
    
    if df.empty:
        print("No training data available. Please label some student outcomes first.")
        return
    
    print(f"Loaded {len(df)} training examples")
    
    # Prepare features and labels
    feature_cols = loader.get_feature_names("dropout")
    X = df[feature_cols].fillna(0)
    y = df["label"].apply(lambda x: 1 if x.get("outcome_type") == "dropout" else 0)

    if y.nunique() < 2:
        print("Training skipped: dropout labels contain only one class.")
        if use_mlflow:
            mlflow.end_run()
        return
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    print("Training model...")
    positive_rate = float(y.mean())
    base_score = min(max(positive_rate if 0 < positive_rate < 1 else 0.5, 1e-6), 1 - 1e-6)

    model = XGBClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        learning_rate=learning_rate,
        random_state=random_state,
        eval_metric="logloss",
        objective="binary:logistic",
        base_score=base_score,
        use_label_encoder=False,
    )
    
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test_scaled)
    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
    
    metrics = evaluate_classification_model(y_test, y_pred, y_pred_proba)
    
    print("\nModel Performance:")
    print(f"Accuracy: {metrics['accuracy']:.4f}")
    print(f"Precision: {metrics['precision']:.4f}")
    print(f"Recall: {metrics['recall']:.4f}")
    print(f"F1 Score: {metrics['f1_score']:.4f}")
    if 'roc_auc' in metrics:
        print(f"ROC AUC: {metrics['roc_auc']:.4f}")
    
    # Cross-validation
    print("\nPerforming cross-validation...")
    cv_scores = cross_val_score(
        model, X_train_scaled, y_train, cv=5, scoring='f1'
    )
    print(f"CV F1 Score: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
    
    # Save model
    ensure_dir("../data/models")
    model_path = f"../data/models/dropout_model_v1.pkl"
    
    import joblib
    joblib.dump({
        'model': model,
        'scaler': scaler,
        'feature_names': feature_cols
    }, model_path)
    
    print(f"\nModel saved to {model_path}")
    
    # Log to MLflow
    if use_mlflow:
        mlflow.log_params({
            'n_estimators': n_estimators,
            'max_depth': max_depth,
            'learning_rate': learning_rate,
            'test_size': test_size,
            'random_state': random_state
        })
        
        mlflow.log_metrics(metrics)
        mlflow.log_artifact(model_path)
        mlflow.xgboost.log_model(model, "model")
        
        mlflow.end_run()
    
    # Save metadata
    metadata = save_model_metadata(
        model_name="dropout_risk_predictor",
        version="1.0.0",
        model_type="dropout",
        metrics=metrics,
        hyperparameters={
            'n_estimators': n_estimators,
            'max_depth': max_depth,
            'learning_rate': learning_rate
        },
        model_path=model_path,
        training_data_count=len(df)
    )
    
    print("\nTraining completed successfully!")
    return model, metrics, metadata

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train dropout risk prediction model")
    parser.add_argument("--test-size", type=float, default=0.2)
    parser.add_argument("--random-state", type=int, default=42)
    parser.add_argument("--n-estimators", type=int, default=100)
    parser.add_argument("--max-depth", type=int, default=6)
    parser.add_argument("--learning-rate", type=float, default=0.1)
    parser.add_argument("--no-mlflow", action="store_true")
    
    args = parser.parse_args()
    
    train_dropout_model(
        test_size=args.test_size,
        random_state=args.random_state,
        n_estimators=args.n_estimators,
        max_depth=args.max_depth,
        learning_rate=args.learning_rate,
        use_mlflow=not args.no_mlflow
    )


