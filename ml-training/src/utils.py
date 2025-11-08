"""
Utility functions for ML training
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Union
import json
from pathlib import Path

def save_model_metadata(
    model_name: str,
    version: str,
    model_type: str,
    metrics: Dict[str, float],
    hyperparameters: Dict[str, Any],
    model_path: str,
    training_data_count: int
) -> Dict[str, Any]:
    """
    Save model metadata to dictionary format
    
    Args:
        model_name: Name of the model
        version: Version string
        model_type: Type of model ('dropout', 'burnout', etc.)
        metrics: Dictionary of evaluation metrics
        hyperparameters: Dictionary of hyperparameters
        model_path: Path to saved model file
        training_data_count: Number of training examples
    
    Returns:
        Dictionary with model metadata
    """
    return {
        "model_name": model_name,
        "version": version,
        "model_type": model_type,
        "training_data_count": training_data_count,
        "accuracy_metrics": metrics,
        "hyperparameters": hyperparameters,
        "model_path": model_path,
        "deployed": False,
    }

def calculate_class_weights(y: np.ndarray) -> Dict[int, float]:
    """
    Calculate class weights for imbalanced datasets
    
    Args:
        y: Target labels
    
    Returns:
        Dictionary mapping class indices to weights
    """
    from sklearn.utils.class_weight import compute_class_weight
    
    classes = np.unique(y)
    weights = compute_class_weight('balanced', classes=classes, y=y)
    
    return dict(zip(classes, weights))

def evaluate_classification_model(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_pred_proba: Optional[np.ndarray] = None
) -> Dict[str, float]:
    """
    Calculate classification metrics
    
    Args:
        y_true: True labels
        y_pred: Predicted labels
        y_pred_proba: Predicted probabilities (optional)
    
    Returns:
        Dictionary of metrics
    """
    from sklearn.metrics import (
        accuracy_score,
        precision_score,
        recall_score,
        f1_score,
        roc_auc_score,
        confusion_matrix
    )
    
    metrics = {
        "accuracy": accuracy_score(y_true, y_pred),
        "precision": precision_score(y_true, y_pred, average='weighted', zero_division=0),
        "recall": recall_score(y_true, y_pred, average='weighted', zero_division=0),
        "f1_score": f1_score(y_true, y_pred, average='weighted', zero_division=0),
    }
    
    if y_pred_proba is not None and len(np.unique(y_true)) == 2:
        try:
            metrics["roc_auc"] = roc_auc_score(y_true, y_pred_proba)
        except:
            metrics["roc_auc"] = 0.0
    
    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    metrics["confusion_matrix"] = cm.tolist()
    
    return metrics

def evaluate_regression_model(
    y_true: np.ndarray,
    y_pred: np.ndarray
) -> Dict[str, float]:
    """
    Calculate regression metrics
    
    Args:
        y_true: True values
        y_pred: Predicted values
    
    Returns:
        Dictionary of metrics
    """
    from sklearn.metrics import (
        mean_squared_error,
        mean_absolute_error,
        r2_score,
        mean_absolute_percentage_error
    )
    
    return {
        "mse": mean_squared_error(y_true, y_pred),
        "rmse": np.sqrt(mean_squared_error(y_true, y_pred)),
        "mae": mean_absolute_error(y_true, y_pred),
        "mape": mean_absolute_percentage_error(y_true, y_pred),
        "r2_score": r2_score(y_true, y_pred),
    }

def save_predictions(
    predictions: np.ndarray,
    student_ids: List[str],
    output_path: str
):
    """
    Save predictions to CSV file
    
    Args:
        predictions: Array of predictions
        student_ids: List of student IDs
        output_path: Path to save CSV file
    """
    df = pd.DataFrame({
        "student_id": student_ids,
        "prediction": predictions
    })
    
    df.to_csv(output_path, index=False)
    print(f"Predictions saved to {output_path}")

def load_config(config_path: str) -> Dict[str, Any]:
    """Load configuration from JSON file"""
    with open(config_path, 'r') as f:
        return json.load(f)

def save_config(config: Dict[str, Any], config_path: str):
    """Save configuration to JSON file"""
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)

def ensure_dir(path: str):
    """Ensure directory exists"""
    Path(path).mkdir(parents=True, exist_ok=True)


def parse_label_value(label: Any) -> Any:
    """Extract primitive value from nested label structures"""
    if isinstance(label, dict):
        for key in (
            "value",
            "label",
            "outcome_value",
            "numerical_value",
            "category",
        ):
            if key in label:
                return parse_label_value(label[key])
        if len(label) == 1:
            return parse_label_value(next(iter(label.values())))
        return json.dumps(label, sort_keys=True)
    if isinstance(label, list):
        if not label:
            return None
        # Prefer first element as representative; recurse for nested structures
        return parse_label_value(label[0])
    return label


def extract_binary_label(
    label: Any,
    positive_values: Optional[List[Union[str, int, float, bool]]] = None,
    default: int = 0,
) -> int:
    """
    Convert label to binary value (0 or 1)

    Args:
        label: Original label structure
        positive_values: Values considered positive (defaults to truthy values)
        default: Value to use when label cannot be parsed
    """
    value = parse_label_value(label)

    if positive_values is None:
        if isinstance(value, bool):
            return int(value)
        if value is None:
            return default
        return 1 if str(value).lower() in {"1", "true", "yes", "positive", "burnout", "dropout"} else 0

    if value is None:
        return default

    return 1 if value in positive_values else 0


def extract_multiclass_label(
    label: Any,
    mapping: Optional[Dict[str, int]] = None,
    default: int = 0,
) -> int:
    """Convert label to a multiclass integer value"""
    value = parse_label_value(label)

    if mapping is None:
        # Default mapping: sort unique values alphabetically
        if value is None:
            return default
        normalized = str(value).lower()
        dynamic_mapping = {
            "career_explorer": 0,
            "career_builder": 1,
            "career_leader": 2,
            "career_champion": 3,
        }
        return dynamic_mapping.get(normalized, default)

    if value is None:
        return default

    key = str(value)
    return mapping.get(key, default)


def extract_regression_target(
    label: Any,
    key: Optional[str] = None,
    default: float = 0.0,
) -> float:
    """Convert label to a floating-point regression target"""
    if isinstance(label, (int, float)):
        return float(label)

    if isinstance(label, dict):
        if key and key in label:
            try:
                return float(label[key])
            except (TypeError, ValueError):
                return default

        for candidate in ("score", "value", "difficulty", "numerical_value"):
            if candidate in label:
                try:
                    return float(label[candidate])
                except (TypeError, ValueError):
                    continue
        return default

    try:
        return float(label)
    except (TypeError, ValueError):
        return default

