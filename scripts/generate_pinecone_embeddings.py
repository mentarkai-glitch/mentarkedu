"""
Mentark Quantum - Pinecone Embedding Generator
Generates embeddings for questions and stores them in Pinecone
"""

import os
import sys
import json
from pathlib import Path
from typing import List, Dict, Optional
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone
from pinecone import ServerlessSpec
import pandas as pd
from tqdm import tqdm

# Fix Windows console encoding for emojis
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Load environment variables (try .env.local first, then .env)
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env.local")
load_dotenv()  # Fallback to .env if .env.local doesn't exist

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "mentark-memory")  # Use existing index
PINECONE_NAMESPACE = os.getenv("PINECONE_NAMESPACE", "questions")  # Use namespace to separate questions from student memories
EMBEDDING_MODEL = "text-embedding-3-small"  # or "text-embedding-3-large"
EMBEDDING_DIMENSION = 1024  # Match the existing index dimension (mentark-memory has 1024)
BATCH_SIZE = 100

if not OPENAI_API_KEY:
    raise ValueError("Missing OPENAI_API_KEY in environment variables")
if not PINECONE_API_KEY:
    raise ValueError("Missing PINECONE_API_KEY in environment variables")

def get_openai_client() -> OpenAI:
    """Create and return OpenAI client"""
    return OpenAI(api_key=OPENAI_API_KEY)

def get_pinecone_client() -> Pinecone:
    """Create and return Pinecone client"""
    return Pinecone(api_key=PINECONE_API_KEY)

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

def create_text_for_embedding(question: Dict) -> str:
    """Create a text representation of the question for embedding"""
    text_parts = [
        f"Question: {question.get('question_text', '')}",
    ]
    
    # Add options
    if "options" in question and isinstance(question["options"], dict):
        for key, value in question["options"].items():
            text_parts.append(f"Option {key}: {value}")
    
    # Add subject and exam type
    text_parts.append(f"Subject: {question.get('subject', '')}")
    text_parts.append(f"Exam Type: {question.get('exam_type', '')}")
    
    return " ".join(text_parts)

def generate_embeddings(openai_client: OpenAI, questions: List[Dict]) -> List[Dict]:
    """Generate embeddings for questions"""
    print(f"\n🧮 Generating embeddings using {EMBEDDING_MODEL}...")
    
    embeddings_data = []
    
    for i in tqdm(range(0, len(questions), BATCH_SIZE), desc="Generating embeddings"):
        batch = questions[i:i + BATCH_SIZE]
        texts = [create_text_for_embedding(q) for q in batch]
        
        try:
            response = openai_client.embeddings.create(
                model=EMBEDDING_MODEL,
                input=texts,
                dimensions=EMBEDDING_DIMENSION,  # Specify dimension to match index
            )
            
            for j, embedding in enumerate(response.data):
                embeddings_data.append({
                    "id": f"q_{batch[j].get('question_id', i + j)}",
                    "values": embedding.embedding,
                    "metadata": {
                        "question_id": batch[j].get("question_id", ""),
                        "exam_type": batch[j].get("exam_type", ""),
                        "subject": batch[j].get("subject", ""),
                        "difficulty": batch[j].get("difficulty", "medium"),
                        "question_text": batch[j].get("question_text", "")[:500],  # Limit length
                    },
                })
        except Exception as e:
            print(f"   ❌ Error generating embeddings for batch {i//BATCH_SIZE + 1}: {str(e)}")
            continue
    
    print(f"   ✅ Generated {len(embeddings_data)} embeddings")
    return embeddings_data

def upsert_to_pinecone(pinecone_client: Pinecone, embeddings: List[Dict]):
    """Upsert embeddings to Pinecone using existing index with namespace"""
    print(f"\n📤 Uploading embeddings to Pinecone index '{PINECONE_INDEX_NAME}' (namespace: '{PINECONE_NAMESPACE}')...")
    
    try:
        # Check if index exists
        indexes = pinecone_client.list_indexes()
        index_names = [idx.name for idx in indexes]
        
        # Use the first available index if the specified one doesn't exist
        actual_index_name = PINECONE_INDEX_NAME
        if PINECONE_INDEX_NAME not in index_names:
            if index_names:
                actual_index_name = index_names[0]
                print(f"   ⚠️  Index '{PINECONE_INDEX_NAME}' does not exist!")
                print(f"   Using existing index '{actual_index_name}' instead")
                print(f"   Available indexes: {index_names}")
            else:
                print(f"   ❌ No indexes found in Pinecone!")
                print(f"   Please create an index manually in Pinecone Dashboard.")
                raise ValueError("No Pinecone indexes available")
        else:
            print(f"   ✅ Using existing index '{actual_index_name}'")
        
        # Get index (use the actual index name we determined)
        index = pinecone_client.Index(actual_index_name)
        
        # Upsert in batches
        # For pinecone-client 3.0.0, try without namespace first, then with namespace parameter
        success_count = 0
        
        print(f"   Using namespace: '{PINECONE_NAMESPACE}'")
        
        for i in tqdm(range(0, len(embeddings), BATCH_SIZE), desc="Uploading to Pinecone"):
            batch = embeddings[i:i + BATCH_SIZE]
            try:
                # Try with namespace parameter (pinecone-client 3.0.0 syntax)
                try:
                    index.upsert(vectors=batch, namespace=PINECONE_NAMESPACE)
                    success_count += len(batch)
                except TypeError:
                    # If namespace parameter doesn't work, try without it
                    print(f"   ⚠️  Namespace parameter not supported, uploading without namespace...")
                    index.upsert(vectors=batch)
                    success_count += len(batch)
            except Exception as e:
                error_msg = str(e)
                # Check if it's an auth error vs other error
                if "401" in error_msg or "Unauthorized" in error_msg or "Malformed domain" in error_msg:
                    print(f"\n   ⚠️  Authentication error on batch {i//BATCH_SIZE + 1}.")
                    print(f"   Error: {error_msg[:150]}")
                    print(f"   This suggests the PINECONE_API_KEY might be incorrect or expired.")
                    print(f"   Please verify your API key in Pinecone Dashboard.")
                    # Don't continue if it's an auth error - it will fail for all batches
                    break
                else:
                    print(f"   ❌ Error uploading batch {i//BATCH_SIZE + 1}: {error_msg[:100]}")
                continue
        
        print(f"   ✅ Successfully uploaded {success_count} embeddings to namespace '{PINECONE_NAMESPACE}'")
        
        # Try to get index stats (may fail with auth, but that's okay)
        try:
            stats = index.describe_index_stats()
            print(f"\n📊 Index Stats:")
            print(f"   Total vectors: {stats.total_vector_count}")
            print(f"   Dimension: {stats.dimension}")
            if hasattr(stats, 'namespaces') and stats.namespaces and PINECONE_NAMESPACE in stats.namespaces:
                ns_stats = stats.namespaces[PINECONE_NAMESPACE]
                print(f"   Vectors in '{PINECONE_NAMESPACE}' namespace: {ns_stats.vector_count}")
        except Exception as e:
            print(f"\n   ⚠️  Could not retrieve index stats (this is okay if uploads succeeded): {str(e)[:100]}")
        
    except Exception as e:
        print(f"   ❌ Error with Pinecone: {str(e)}")
        raise

def main():
    """Main execution function"""
    print("=" * 60)
    print("MENTARK QUANTUM - Pinecone Embedding Generator")
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
        print("❌ No questions to process")
        sys.exit(1)
    
    # Process all questions (removed 1000 limit for production)
    print(f"📊 Processing all {len(questions)} questions")
    
    # Create clients
    try:
        openai_client = get_openai_client()
        print("✅ Connected to OpenAI")
    except Exception as e:
        print(f"❌ Error connecting to OpenAI: {str(e)}")
        sys.exit(1)
    
    try:
        pinecone_client = get_pinecone_client()
        print("✅ Connected to Pinecone")
    except Exception as e:
        print(f"❌ Error connecting to Pinecone: {str(e)}")
        sys.exit(1)
    
    # Generate embeddings
    embeddings = generate_embeddings(openai_client, questions)
    
    # Upload to Pinecone
    upsert_to_pinecone(pinecone_client, embeddings)
    
    print("\n" + "=" * 60)
    print("✅ Embedding generation complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()

