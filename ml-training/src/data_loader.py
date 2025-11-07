"""
Data Loader for ML Training
Loads training data from Supabase
"""

import os
import pandas as pd
import numpy as np
from typing import List, Dict, Tuple, Optional, Any
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class DataLoader:
    """Load training data from Supabase"""
    
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env")
        
        self.supabase: Client = create_client(supabase_url, supabase_key)
    
    def load_training_data(
        self,
        label_type: str,
        limit: Optional[int] = None
    ) -> pd.DataFrame:
        """
        Load labeled training data for a specific label type
        
        Args:
            label_type: Type of label ('dropout', 'burnout', 'career_success', etc.)
            limit: Maximum number of records to load
        
        Returns:
            DataFrame with features and labels
        """
        query = self.supabase.table("ml_training_data").select(
            """
            *,
            ml_feature_store!inner(features, student_id, extraction_timestamp)
            """
        ).eq("label_type", label_type).eq("label_confidence", 1.0)
        
        if limit:
            query = query.limit(limit)
        
        response = query.execute()
        
        if not response.data:
            return pd.DataFrame()
        
        # Flatten features and labels
        records = []
        for row in response.data:
            feature_vector = row.get("ml_feature_store", {}).get("features", {})
            label = row["label_value"]
            
            # Extract features into flat structure
            record = self._flatten_features(feature_vector)
            record["label"] = label
            record["student_id"] = row["student_id"]
            record["feature_vector_id"] = row.get("feature_vector_id")
            
            records.append(record)
        
        return pd.DataFrame(records)
    
    def load_feature_vectors(
        self,
        student_ids: Optional[List[str]] = None,
        limit: Optional[int] = None
    ) -> pd.DataFrame:
        """
        Load feature vectors from feature store
        
        Args:
            student_ids: Optional list of student IDs to filter
            limit: Maximum number of records to load
        
        Returns:
            DataFrame with feature vectors
        """
        query = self.supabase.table("ml_feature_store").select("*")
        
        if student_ids:
            query = query.in_("student_id", student_ids)
        
        query = query.order("extraction_timestamp", desc=True)
        
        if limit:
            query = query.limit(limit)
        
        response = query.execute()
        
        if not response.data:
            return pd.DataFrame()
        
        # Flatten features
        records = []
        for row in response.data:
            feature_vector = row["features"]
            record = self._flatten_features(feature_vector)
            record["student_id"] = row["student_id"]
            record["feature_version"] = row["feature_version"]
            record["extraction_timestamp"] = row["extraction_timestamp"]
            
            records.append(record)
        
        return pd.DataFrame(records)
    
    def load_student_outcomes(
        self,
        outcome_type: Optional[str] = None,
        confirmed_only: bool = True
    ) -> pd.DataFrame:
        """
        Load student outcomes
        
        Args:
            outcome_type: Optional outcome type filter
            confirmed_only: Only load confirmed outcomes
        
        Returns:
            DataFrame with outcomes
        """
        query = self.supabase.table("student_outcomes").select("*")
        
        if outcome_type:
            query = query.eq("outcome_type", outcome_type)
        
        if confirmed_only:
            query = query.eq("confirmed", True)
        
        response = query.execute()
        
        if not response.data:
            return pd.DataFrame()
        
        return pd.DataFrame(response.data)

    def load_raw_training_records(
        self,
        label_type: str,
        limit: Optional[int] = None,
        confirmed_only: bool = True,
    ) -> List[Dict[str, Any]]:
        """Load raw training data rows without feature join"""

        query = self.supabase.table("ml_training_data").select("*").eq(
            "label_type", label_type
        )

        if confirmed_only:
            query = query.eq("label_confidence", 1.0)

        query = query.order("labeled_at", desc=True)

        if limit:
            query = query.limit(limit)

        response = query.execute()

        return response.data or []
    
    def _flatten_features(self, features: Dict) -> Dict:
        """Flatten nested feature structure into flat dictionary"""
        flattened = {}
        
        for category, values in features.items():
            if isinstance(values, dict):
                for key, value in values.items():
                    flattened[f"{category}_{key}"] = value
            else:
                flattened[category] = values
        
        return flattened
    
    def get_feature_names(self, label_type: str) -> List[str]:
        """Get feature names for a specific label type"""
        df = self.load_training_data(label_type, limit=1)
        
        if df.empty:
            return []
        
        # Exclude non-feature columns
        exclude_cols = ["label", "student_id", "feature_vector_id"]
        feature_cols = [col for col in df.columns if col not in exclude_cols]
        
        return feature_cols
    
    def split_train_test(
        self,
        df: pd.DataFrame,
        test_size: float = 0.2,
        random_state: int = 42
    ) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Split dataframe into train and test sets
        
        Args:
            df: DataFrame to split
            test_size: Proportion of data for test set
            random_state: Random seed
        
        Returns:
            Tuple of (train_df, test_df)
        """
        from sklearn.model_selection import train_test_split
        
        return train_test_split(
            df,
            test_size=test_size,
            random_state=random_state,
            shuffle=True
        )


