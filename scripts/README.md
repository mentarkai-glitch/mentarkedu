# Mentark Quantum - Data Ingestion Scripts

This directory contains scripts for downloading, processing, and importing competitive exam questions from Hugging Face into Mentark's database and vector store.

## Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   Create a `.env` file in the project root with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX_NAME=mentark-questions
   ```

## Usage

### Step 1: Download Data from Hugging Face

```bash
python scripts/download_huggingface_data.py
```

This script:
- Downloads JEE/NEET benchmark data
- Downloads MedMCQA (medical questions)
- Downloads SciQ (school science questions)
- Transforms data to Mentark format
- Saves to `data/processed/all_questions.jsonl`

### Step 2: Import to Supabase

```bash
python scripts/import_to_supabase.py
```

This script:
- Loads processed questions from `data/processed/all_questions.jsonl`
- Validates question structure
- Imports into Supabase `pyqs` table
- Handles errors gracefully

### Step 3: Generate Pinecone Embeddings

```bash
python scripts/generate_pinecone_embeddings.py
```

This script:
- Loads questions from processed file
- Generates embeddings using OpenAI
- Uploads to Pinecone vector database
- Creates index if it doesn't exist

## Data Sources

1. **JEE/NEET Benchmark** (`Reja1/jee-neet-benchmark`)
   - JEE Main, JEE Advanced, NEET questions
   - Includes images and explanations

2. **MedMCQA** (`openlifescienceai/medmcqa`)
   - 193,000+ medical MCQs
   - Detailed explanations
   - Topic-wise tagging

3. **SciQ** (`allenai/sciq`)
   - School-level science questions
   - Perfect for CBSE/ICSE

4. **GSM8K** (`openai/gsm8k`)
   - Grade school math problems
   - Step-by-step solutions

## Output Structure

```
data/
├── raw/                    # Raw downloaded data
│   ├── jee_neet_questions.jsonl
│   ├── medmcqa_questions.jsonl
│   └── ...
└── processed/              # Processed and transformed data
    └── all_questions.jsonl
```

## Notes

- The scripts are designed to be run sequentially
- Each script handles errors gracefully and continues processing
- Large datasets are processed in batches to avoid memory issues
- Embeddings are generated using OpenAI's `text-embedding-3-small` model

## Troubleshooting

1. **Hugging Face download fails:**
   - Check internet connection
   - Verify dataset names are correct
   - Some datasets may require authentication

2. **Supabase import fails:**
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
   - Check that `pyqs` table exists in database
   - Review error messages for specific field issues

3. **Pinecone upload fails:**
   - Verify `PINECONE_API_KEY` is correct
   - Check Pinecone account limits
   - Ensure index dimension matches embedding model (1536 for text-embedding-3-small)

