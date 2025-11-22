"""
Mentark Quantum - Supabase Data Importer
Imports processed question data into Supabase database
"""

import os
import sys
import json
from pathlib import Path
from typing import List, Dict, Optional
from supabase import create_client, Client
from dotenv import load_dotenv
import pandas as pd
import datetime

# Load environment variables (try .env.local first, then .env)
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env.local")
load_dotenv()  # Fallback to .env if .env.local doesn't exist

# Supabase configuration
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # Use service role key for admin operations

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in environment variables")

def get_supabase_client() -> Client:
    """Create and return Supabase client"""
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def load_questions(file_path: Path) -> List[Dict]:
    """Load questions from JSONL file"""
    print(f"📂 Loading questions from {file_path}...")
    questions = []
    
    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                questions.append(json.loads(line))
    
    print(f"   ✅ Loaded {len(questions)} questions")
    return questions

def validate_question(question: Dict) -> bool:
    """Validate question structure"""
    required_fields = ["question_text", "options", "correct_answer", "exam_type", "subject"]
    
    for field in required_fields:
        if field not in question or not question[field]:
            return False
    
    # Validate options
    if not isinstance(question["options"], dict):
        return False
    
    if len(question["options"]) < 2:
        return False
    
    return True

def transform_for_supabase(question: Dict) -> Dict:
    """Transform question to Supabase schema format"""
    # Extract year from question_id or metadata if available, default to current year
    year = question.get("year")
    if not year:
        # Try to extract from metadata or question_id
        metadata = question.get("metadata", {})
        if isinstance(metadata, str):
            try:
                metadata = json.loads(metadata)
            except:
                metadata = {}
        year = metadata.get("year") or question.get("source_year")
    if not year:
        year = datetime.datetime.now().year
    
    # Map exam_type to match schema constraints
    exam_type = question.get("exam_type", "JEE_MAIN").upper()
    if exam_type not in ["JEE_MAIN", "JEE_ADVANCED", "NEET", "AIIMS", "BITSAT", "WBJEE"]:
        # Try to map common variations
        exam_type_map = {
            "JEE": "JEE_MAIN",
            "NEET": "NEET",
            "AIIMS": "AIIMS",
        }
        exam_type = exam_type_map.get(exam_type.split("_")[0], "JEE_MAIN")
    
    # Handle options - should be dict for JSONB
    options = question.get("options", {})
    if isinstance(options, str):
        try:
            options = json.loads(options)
        except:
            options = {}
    elif not isinstance(options, dict):
        options = {}
    
    # Ensure correct_answer is uppercase and valid
    correct_answer = str(question.get("correct_answer", "A")).upper()
    if correct_answer not in ["A", "B", "C", "D"]:
        correct_answer = "A"
    
    return {
        "exam_type": exam_type,
        "year": int(year),
        "subject": question.get("subject"),
        "question_number": question.get("question_number"),
        "question_text": question["question_text"],
        "question_image_url": question.get("question_image_url"),
        "options": options,  # JSONB - should be dict
        "correct_answer": correct_answer,
        "explanation": question.get("explanation", ""),
        "topic": question.get("topic"),
        "chapter": question.get("chapter"),
        "difficulty": question.get("difficulty", "medium"),
        "marks": question.get("marks", 4),
        "negative_marks": float(question.get("negative_marks", 1.0)),
        "metadata": {
            "question_id": question.get("question_id"),
            "source_dataset": question.get("source", "huggingface"),
        },
    }

def import_questions(supabase: Client, questions: List[Dict], batch_size: int = 100):
    """Import questions into Supabase in batches"""
    print(f"\n📤 Importing {len(questions)} questions to Supabase...")
    
    validated = []
    for q in questions:
        if validate_question(q):
            validated.append(transform_for_supabase(q))
        else:
            print(f"   ⚠️  Skipping invalid question: {q.get('question_id', 'unknown')}")
    
    print(f"   ✅ Validated {len(validated)} questions")
    
    # Import in batches
    success_count = 0
    error_count = 0
    
    for i in range(0, len(validated), batch_size):
        batch = validated[i:i + batch_size]
        
        try:
            result = supabase.table("pyqs").insert(batch).execute()
            success_count += len(batch)
            print(f"   ✅ Imported batch {i//batch_size + 1}: {len(batch)} questions")
        except Exception as e:
            error_count += len(batch)
            print(f"   ❌ Error importing batch {i//batch_size + 1}: {str(e)}")
            # Try inserting one by one to identify problematic records
            for item in batch:
                try:
                    supabase.table("pyqs").insert(item).execute()
                    success_count += 1
                    error_count -= 1
                except Exception as e2:
                    print(f"      ⚠️  Failed to import question: {str(e2)[:100]}")
    
    print(f"\n✅ Import complete: {success_count} successful, {error_count} failed")
    return success_count, error_count

def main():
    """Main execution function"""
    print("=" * 60)
    print("MENTARK QUANTUM - Supabase Data Importer")
    print("=" * 60)
    
    # Check if processed data exists
    data_file = Path("data/processed/all_questions.jsonl")
    if not data_file.exists():
        print(f"❌ Error: {data_file} not found")
        print("   Please run download_huggingface_data.py first")
        sys.exit(1)
    
    # Load questions
    questions = load_questions(data_file)
    
    if not questions:
        print("❌ No questions to import")
        sys.exit(1)
    
    # Create Supabase client
    try:
        supabase = get_supabase_client()
        print("✅ Connected to Supabase")
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {str(e)}")
        sys.exit(1)
    
    # Import questions
    success, errors = import_questions(supabase, questions)
    
    print("\n" + "=" * 60)
    print(f"✅ Import Summary: {success} successful, {errors} failed")
    print("=" * 60)

if __name__ == "__main__":
    main()

