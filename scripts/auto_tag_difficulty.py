"""
Auto-tag question difficulty using AI
Analyzes question content and student performance to determine difficulty level
"""

import os
import sys
from pathlib import Path
from typing import Dict, List
from supabase import create_client, Client
from dotenv import load_dotenv
from openai import OpenAI
import json
from tqdm import tqdm

# Load environment variables
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env.local")
load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in environment variables")

if not OPENAI_API_KEY:
    raise ValueError("Missing OPENAI_API_KEY in environment variables")

def get_supabase_client() -> Client:
    """Create and return Supabase client"""
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def get_openai_client() -> OpenAI:
    """Create and return OpenAI client"""
    return OpenAI(api_key=OPENAI_API_KEY)

def analyze_question_difficulty(question_text: str, options: Dict, subject: str, topic: str, openai_client: OpenAI) -> str:
    """
    Use AI to analyze question difficulty
    Returns: 'easy', 'medium', or 'hard'
    """
    # Build prompt for difficulty analysis
    options_text = "\n".join([f"{k}: {v}" for k, v in options.items()])
    
    prompt = f"""Analyze the difficulty level of this competitive exam question (JEE/NEET level).

Subject: {subject}
Topic: {topic}

Question:
{question_text}

Options:
{options_text}

Consider:
1. Conceptual complexity
2. Number of steps required
3. Common mistakes students make
4. Typical performance on similar questions

Return ONLY one word: "easy", "medium", or "hard"

Difficulty:"""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",  # Using mini for cost efficiency
            messages=[
                {"role": "system", "content": "You are an expert at analyzing competitive exam question difficulty. Return only 'easy', 'medium', or 'hard'."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=10,
            temperature=0.3,
        )
        
        difficulty = response.choices[0].message.content.strip().lower()
        
        # Validate response
        if difficulty not in ["easy", "medium", "hard"]:
            # Fallback: analyze based on question length and complexity
            word_count = len(question_text.split())
            if word_count < 30:
                difficulty = "easy"
            elif word_count < 60:
                difficulty = "medium"
            else:
                difficulty = "hard"
        
        return difficulty
    except Exception as e:
        print(f"Error analyzing difficulty: {e}")
        # Fallback to medium
        return "medium"

def batch_tag_difficulty(supabase: Client, openai_client: OpenAI, batch_size: int = 50, limit: int = None):
    """
    Tag difficulty for questions that don't have it set or have 'medium' as default
    """
    print("🔍 Fetching questions for difficulty tagging...")
    
    # Get questions without difficulty or with default 'medium'
    query = supabase.table("pyqs").select("id, question_text, options, subject, topic, difficulty, exam_type")
    
    # Filter for questions that need tagging (no difficulty or medium default)
    # We'll filter in Python since Supabase doesn't support OR easily
    response = query.limit(limit or 1000).execute()
    
    questions = response.data if hasattr(response, 'data') else []
    
    # Filter questions that need tagging
    questions_to_tag = [q for q in questions if not q.get("difficulty") or q.get("difficulty") == "medium"]
    
    print(f"📊 Found {len(questions_to_tag)} questions to tag")
    
    if not questions_to_tag:
        print("✅ All questions already have difficulty tags!")
        return
    
    # Process in batches
    total_batches = (len(questions_to_tag) + batch_size - 1) // batch_size
    
    for batch_num in range(total_batches):
        start_idx = batch_num * batch_size
        end_idx = min(start_idx + batch_size, len(questions_to_tag))
        batch = questions_to_tag[start_idx:end_idx]
        
        print(f"\n📦 Processing batch {batch_num + 1}/{total_batches} ({len(batch)} questions)...")
        
        updates = []
        for question in tqdm(batch, desc=f"Batch {batch_num + 1}"):
            try:
                # Parse options if it's a string
                options = question.get("options", {})
                if isinstance(options, str):
                    try:
                        options = json.loads(options)
                    except:
                        options = {}
                
                # Analyze difficulty
                difficulty = analyze_question_difficulty(
                    question.get("question_text", ""),
                    options,
                    question.get("subject", "General"),
                    question.get("topic", "General"),
                    openai_client
                )
                
                updates.append({
                    "id": question["id"],
                    "difficulty": difficulty
                })
                
            except Exception as e:
                print(f"❌ Error processing question {question.get('id')}: {e}")
                continue
        
        # Bulk update in Supabase
        if updates:
            print(f"💾 Updating {len(updates)} questions in database...")
            for update in updates:
                try:
                    supabase.table("pyqs").update({"difficulty": update["difficulty"]}).eq("id", update["id"]).execute()
                except Exception as e:
                    print(f"❌ Error updating question {update['id']}: {e}")
        
        print(f"✅ Batch {batch_num + 1} complete!")
    
    print("\n🎉 Difficulty tagging complete!")

def main():
    """Main execution function"""
    print("🚀 Starting auto-difficulty tagging...")
    
    supabase = get_supabase_client()
    openai_client = get_openai_client()
    
    # Tag difficulty for questions
    # Limit to 100 questions per run to manage API costs
    # Remove limit for full tagging
    batch_tag_difficulty(supabase, openai_client, batch_size=20, limit=100)
    
    print("\n✅ Auto-difficulty tagging process completed!")

if __name__ == "__main__":
    main()

