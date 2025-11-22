"""
Mentark Quantum - Hugging Face Dataset Downloader
Downloads JEE/NEET and other competitive exam questions from Hugging Face
"""

import os
import sys
from pathlib import Path
from datasets import load_dataset
import pandas as pd
import json
from typing import Dict, List, Optional

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

# Configuration
DATASETS_CONFIG = {
    "jee_neet": {
        "name": "Reja1/jee-neet-benchmark",
        "split": "test",
        "output_file": "data/raw/jee_neet_questions.jsonl",
    },
    "medmcqa": {
        "name": "openlifescienceai/medmcqa",
        "split": "train",
        "output_file": "data/raw/medmcqa_questions.jsonl",
    },
    "entrance_exams": {
        "name": "datavorous/entrance-exam-dataset",
        "split": "train",
        "output_file": "data/raw/entrance_exams_questions.jsonl",
    },
    "sciq": {
        "name": "allenai/sciq",
        "split": "train",
        "output_file": "data/raw/sciq_questions.jsonl",
    },
    "gsm8k": {
        "name": "openai/gsm8k",
        "config": "main",
        "split": "train",
        "output_file": "data/raw/gsm8k_math_questions.jsonl",
    },
}

def ensure_data_directory():
    """Create data directories if they don't exist"""
    Path("data/raw").mkdir(parents=True, exist_ok=True)
    Path("data/processed").mkdir(parents=True, exist_ok=True)
    print("✅ Data directories created")

def download_dataset(dataset_key: str, config: Dict) -> Optional[pd.DataFrame]:
    """
    Download a dataset from Hugging Face
    
    Args:
        dataset_key: Key in DATASETS_CONFIG
        config: Dataset configuration
        
    Returns:
        DataFrame with the data or None if error
    """
    print(f"\n📥 Downloading {dataset_key}...")
    print(f"   Dataset: {config['name']}")
    
    try:
        # Load dataset
        if "config" in config:
            dataset = load_dataset(config["name"], config["config"], split=config["split"])
        else:
            dataset = load_dataset(config["name"], split=config["split"])
        
        print(f"   ✅ Loaded {len(dataset)} records")
        
        # Convert to DataFrame
        df = pd.DataFrame(dataset)
        print(f"   ✅ Converted to DataFrame: {df.shape}")
        
        # Save raw JSONL
        output_path = Path(config["output_file"])
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        df.to_json(output_path, orient="records", lines=True)
        print(f"   ✅ Saved to {output_path}")
        
        return df
        
    except Exception as e:
        print(f"   ❌ Error downloading {dataset_key}: {str(e)}")
        return None

def transform_jee_neet_data(df: pd.DataFrame) -> pd.DataFrame:
    """Transform JEE/NEET benchmark data to Mentark format"""
    print("\n🔄 Transforming JEE/NEET data...")
    
    transformed = []
    for _, row in df.iterrows():
        try:
            item = {
                "question_id": str(row.get("question_id", "")),
                "exam_type": row.get("exam_name", "UNKNOWN"),
                "subject": row.get("subject", "UNKNOWN"),
                "question_text": row.get("question", ""),
                "question_image_url": row.get("image", ""),
                "options": {
                    "A": row.get("option_a", ""),
                    "B": row.get("option_b", ""),
                    "C": row.get("option_c", ""),
                    "D": row.get("option_d", ""),
                },
                "correct_answer": row.get("correct_answer", ""),
                "explanation": row.get("explanation", ""),
                "difficulty": row.get("difficulty", "medium"),
                "source": "huggingface_jee_neet_benchmark",
            }
            transformed.append(item)
        except Exception as e:
            print(f"   ⚠️  Error transforming row: {str(e)}")
            continue
    
    result_df = pd.DataFrame(transformed)
    print(f"   ✅ Transformed {len(result_df)} questions")
    return result_df

def transform_medmcqa_data(df: pd.DataFrame) -> pd.DataFrame:
    """Transform MedMCQA data to Mentark format"""
    print("\n🔄 Transforming MedMCQA data...")
    
    transformed = []
    for _, row in df.iterrows():
        try:
            item = {
                "question_id": str(row.get("id", "")),
                "exam_type": "NEET",
                "subject": row.get("subject_name", "Biology"),
                "question_text": row.get("question", ""),
                "options": {
                    "A": row.get("opa", ""),
                    "B": row.get("opb", ""),
                    "C": row.get("opc", ""),
                    "D": row.get("opd", ""),
                },
                "correct_answer": row.get("cop", ""),  # cop = correct option
                "explanation": row.get("exp", ""),
                "difficulty": "medium",
                "source": "huggingface_medmcqa",
            }
            transformed.append(item)
        except Exception as e:
            print(f"   ⚠️  Error transforming row: {str(e)}")
            continue
    
    result_df = pd.DataFrame(transformed)
    print(f"   ✅ Transformed {len(result_df)} questions")
    return result_df

def transform_sciq_data(df: pd.DataFrame) -> pd.DataFrame:
    """Transform SciQ data to Mentark format"""
    print("\n🔄 Transforming SciQ data...")
    
    transformed = []
    for _, row in df.iterrows():
        try:
            item = {
                "question_id": f"sciq_{row.get('id', '')}",
                "exam_type": "CBSE",
                "subject": row.get("subject", "Science"),
                "question_text": row.get("question", ""),
                "options": {
                    "A": row.get("distractor1", ""),
                    "B": row.get("distractor2", ""),
                    "C": row.get("distractor3", ""),
                    "D": row.get("correct_answer", ""),
                },
                "correct_answer": "D",
                "explanation": row.get("support", ""),
                "difficulty": "easy",
                "source": "huggingface_sciq",
            }
            transformed.append(item)
        except Exception as e:
            print(f"   ⚠️  Error transforming row: {str(e)}")
            continue
    
    result_df = pd.DataFrame(transformed)
    print(f"   ✅ Transformed {len(result_df)} questions")
    return result_df

def main():
    """Main execution function"""
    print("=" * 60)
    print("MENTARK QUANTUM - Hugging Face Data Downloader")
    print("=" * 60)
    
    ensure_data_directory()
    
    # Download and transform datasets
    all_questions = []
    
    # 1. JEE/NEET Benchmark
    jee_neet_df = download_dataset("jee_neet", DATASETS_CONFIG["jee_neet"])
    if jee_neet_df is not None:
        transformed = transform_jee_neet_data(jee_neet_df)
        all_questions.append(transformed)
    
    # 2. MedMCQA (Medical)
    medmcqa_df = download_dataset("medmcqa", DATASETS_CONFIG["medmcqa"])
    if medmcqa_df is not None:
        # Limit to first 10k for testing
        medmcqa_df = medmcqa_df.head(10000)
        transformed = transform_medmcqa_data(medmcqa_df)
        all_questions.append(transformed)
    
    # 3. SciQ (School Science)
    sciq_df = download_dataset("sciq", DATASETS_CONFIG["sciq"])
    if sciq_df is not None:
        transformed = transform_sciq_data(sciq_df)
        all_questions.append(transformed)
    
    # Combine all questions
    if all_questions:
        combined_df = pd.concat(all_questions, ignore_index=True)
        output_path = Path("data/processed/all_questions.jsonl")
        combined_df.to_json(output_path, orient="records", lines=True)
        
        print("\n" + "=" * 60)
        print(f"✅ SUCCESS! Combined {len(combined_df)} questions")
        print(f"   Saved to: {output_path}")
        print("=" * 60)
        
        # Print summary
        print("\n📊 Summary by Exam Type:")
        print(combined_df["exam_type"].value_counts())
        print("\n📊 Summary by Subject:")
        print(combined_df["subject"].value_counts().head(10))
    else:
        print("\n❌ No data was successfully downloaded")

if __name__ == "__main__":
    main()

