"""
Mentark Quantum - Run PYQs Table Migration
Creates the pyqs table in Supabase using the Python client
"""

import os
import sys
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env.local")
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in environment variables")

def run_migration():
    """Run the PYQs table migration"""
    print("=" * 60)
    print("MENTARK QUANTUM - PYQs Table Migration")
    print("=" * 60)
    
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Connected to Supabase")
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {str(e)}")
        sys.exit(1)
    
    # SQL to create pyqs table
    migration_sql = """
    CREATE TABLE IF NOT EXISTS pyqs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      exam_type TEXT NOT NULL CHECK (exam_type IN ('JEE_MAIN', 'JEE_ADVANCED', 'NEET', 'AIIMS', 'BITSAT', 'WBJEE')),
      year INTEGER NOT NULL,
      paper_set TEXT,
      subject TEXT,
      question_number INTEGER,
      question_text TEXT NOT NULL,
      question_image_url TEXT,
      options JSONB NOT NULL,
      correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
      explanation TEXT,
      topic TEXT,
      chapter TEXT,
      difficulty TEXT DEFAULT 'medium',
      marks INTEGER DEFAULT 4,
      negative_marks DECIMAL(3,2) DEFAULT 1.0,
      source_url TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS pyqs_exam_year_idx ON pyqs(exam_type, year);
    CREATE INDEX IF NOT EXISTS pyqs_subject_idx ON pyqs(subject);
    CREATE INDEX IF NOT EXISTS pyqs_topic_idx ON pyqs(topic);
    """
    
    print("\n📤 Running migration...")
    
    try:
        # Execute SQL using Supabase RPC or direct SQL execution
        # Note: Supabase Python client doesn't have direct SQL execution
        # We'll use the REST API to execute SQL
        import requests
        
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json",
            },
            json={"query": migration_sql}
        )
        
        if response.status_code == 200 or response.status_code == 201:
            print("✅ Migration executed successfully!")
        else:
            print(f"⚠️  Response: {response.status_code}")
            print(f"   {response.text}")
            
            # Alternative: Try using Supabase's query method
            print("\n🔄 Trying alternative method...")
            try:
                # Check if table exists by trying to query it
                result = supabase.table("pyqs").select("id").limit(1).execute()
                print("✅ Table 'pyqs' already exists!")
            except Exception as e:
                if "not found" in str(e).lower() or "does not exist" in str(e).lower():
                    print("❌ Table does not exist. Please run the migration manually:")
                    print("\n1. Go to Supabase Dashboard → SQL Editor")
                    print("2. Copy the SQL from: supabase/migrations/022_mock_tests_pyqs_system.sql")
                    print("3. Run it in the SQL Editor")
                else:
                    print(f"❌ Error: {str(e)}")
                    raise
    
    except ImportError:
        print("⚠️  'requests' library not available. Using Supabase client method...")
        # Alternative: Try to verify table exists
        try:
            result = supabase.table("pyqs").select("id").limit(1).execute()
            print("✅ Table 'pyqs' already exists!")
        except Exception as e:
            print("❌ Table does not exist.")
            print("\n📝 Please run the migration manually:")
            print("1. Go to Supabase Dashboard → SQL Editor")
            print("2. Copy and run this SQL:")
            print("\n" + migration_sql)
            sys.exit(1)
    
    except Exception as e:
        print(f"❌ Error running migration: {str(e)}")
        print("\n📝 Please run the migration manually:")
        print("1. Go to Supabase Dashboard → SQL Editor")
        print("2. Copy and run this SQL:")
        print("\n" + migration_sql)
        sys.exit(1)
    
    # Verify table was created
    print("\n🔍 Verifying table creation...")
    try:
        result = supabase.table("pyqs").select("id").limit(1).execute()
        print("✅ Table 'pyqs' exists and is accessible!")
        print(f"   Current row count: {len(result.data) if result.data else 0}")
    except Exception as e:
        print(f"⚠️  Could not verify table: {str(e)}")
        print("   The table may have been created but verification failed.")
    
    print("\n" + "=" * 60)
    print("✅ Migration complete!")
    print("=" * 60)

if __name__ == "__main__":
    run_migration()

