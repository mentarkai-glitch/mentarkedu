import os
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
import sys

def test_pinecone():
    try:
        print("🔍 Testing Pinecone connection...")
        
        # Load environment variables
        load_dotenv('.env.local')
        
        # Check if API key exists
        api_key = os.getenv('PINECONE_API_KEY')
        environment = os.getenv('PINECONE_ENVIRONMENT')
        
        if not api_key:
            print("❌ PINECONE_API_KEY not found in environment")
            return False
            
        if not environment:
            print("❌ PINECONE_ENVIRONMENT not found in environment")
            return False
            
        print(f"API Key: ✅ Found")
        print(f"Environment: ✅ Found ({environment})")
        
        # Initialize Pinecone
        pc = Pinecone(api_key=api_key)
        
        # Get index
        index = pc.Index("mentark-memory")
        
        # Get stats
        stats = index.describe_index_stats()
        
        print("✅ Pinecone connection successful!")
        print("📊 Index stats:", stats)
        print("🎯 Ready to store AI memories!")
        
        return True
        
    except Exception as error:
        print(f"❌ Pinecone connection failed: {error}")
        return False

if __name__ == "__main__":
    success = test_pinecone()
    sys.exit(0 if success else 1)