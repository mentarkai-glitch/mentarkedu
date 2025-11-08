"""
Data Loader for ML Training
Loads training data from Supabase
"""

import os
import requests
import pandas as pd
from typing import List, Dict, Tuple, Optional, Any
from dotenv import load_dotenv

load_dotenv()


class SupabaseRestClient:
    """Minimal Supabase REST helper using the PostgREST endpoint."""

    def __init__(self, url: str, key: str):
        self.base_url = url.rstrip("/")
        self.rest_url = f"{self.base_url}/rest/v1"
        self.session = requests.Session()
        self.session.headers.update(
            {
                "apikey": key,
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Prefer": "return=representation",
            }
        )

    def get(self, table: str, params: Optional[Dict[str, str]] = None) -> List[Dict[str, Any]]:
        response = self.session.get(f"{self.rest_url}/{table}", params=params or {})
        response.raise_for_status()
        return response.json()  # type: ignore[return-value]


class DataLoader:
    """Load training data from Supabase"""

    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = (
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            or os.getenv("SUPABASE_KEY")
            or os.getenv("SUPABASE_ANON_KEY")
        )

        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY) must be set in .env")

        self.supabase = SupabaseRestClient(supabase_url, supabase_key)

    def load_training_data(
        self,
        label_type: str,
        limit: Optional[int] = None
    ) -> pd.DataFrame:
        """
        Load labeled training data for a specific label type
        """
        params = {
            "select": "*,ml_feature_store!inner(features,student_id,extraction_timestamp)",
            "label_type": f"eq.{label_type}",
            "label_confidence": "eq.1",
        }
        if limit:
            params["limit"] = str(limit)

        rows = self.supabase.get("ml_training_data", params=params)

        if not rows:
            return pd.DataFrame()

        records = []
        for row in rows:
            feature_vector = row.get("ml_feature_store", {}).get("features", {})
            label = row.get("label_value")
            record = self._flatten_features(feature_vector)
            record["label"] = label
            record["student_id"] = row.get("student_id")
            record["feature_vector_id"] = row.get("feature_vector_id")
            records.append(record)

        return pd.DataFrame(records)

    def load_feature_vectors(
        self,
        student_ids: Optional[List[str]] = None,
        limit: Optional[int] = None
    ) -> pd.DataFrame:
        """Load feature vectors from feature store"""
        params: Dict[str, str] = {"order": "extraction_timestamp.desc"}
        if student_ids:
            params["student_id"] = f"in.({','.join(student_ids)})"
        if limit:
            params["limit"] = str(limit)

        rows = self.supabase.get("ml_feature_store", params=params)
        if not rows:
            return pd.DataFrame()

        records = []
        for row in rows:
            feature_vector = row.get("features", {})
            record = self._flatten_features(feature_vector)
            record["student_id"] = row.get("student_id")
            record["feature_version"] = row.get("feature_version")
            record["extraction_timestamp"] = row.get("extraction_timestamp")
            records.append(record)
        return pd.DataFrame(records)

    def load_student_outcomes(
        self,
        outcome_type: Optional[str] = None,
        confirmed_only: bool = True
    ) -> pd.DataFrame:
        """Load student outcomes from Supabase"""
        params: Dict[str, str] = {}
        if outcome_type:
            params["outcome_type"] = f"eq.{outcome_type}"
        if confirmed_only:
            params["confirmed"] = "eq.true"

        rows = self.supabase.get("student_outcomes", params=params)
        if not rows:
            return pd.DataFrame()
        return pd.DataFrame(rows)

    def load_raw_training_records(
        self,
        label_type: str,
        limit: Optional[int] = None,
        confirmed_only: bool = True,
    ) -> List[Dict[str, Any]]:
        """Load raw training rows without feature join"""
        params: Dict[str, str] = {
            "label_type": f"eq.{label_type}",
            "order": "labeled_at.desc",
        }
        if confirmed_only:
            params["label_confidence"] = "eq.1"
        if limit:
            params["limit"] = str(limit)

        return self.supabase.get("ml_training_data", params=params)

    def _flatten_features(self, features: Dict) -> Dict:
        """Flatten nested feature structure into flat dictionary"""
        flattened: Dict[str, Any] = {}
        for category, values in features.items():
            if isinstance(values, dict):
                for key, value in values.items():
                    flattened[f"{category}_{key}"] = value
            else:
                flattened[category] = values
        return flattened

    def get_feature_names(self, label_type: str) -> List[str]:
        df = self.load_training_data(label_type, limit=1)
        if df.empty:
            return []
        exclude_cols = ["label", "student_id", "feature_vector_id"]
        return [col for col in df.columns if col not in exclude_cols]

    def split_train_test(
        self,
        df: pd.DataFrame,
        test_size: float = 0.2,
        random_state: int = 42
    ) -> Tuple[pd.DataFrame, pd.DataFrame]:
        from sklearn.model_selection import train_test_split

        return train_test_split(
            df,
            test_size=test_size,
            random_state=random_state,
            shuffle=True
        )


