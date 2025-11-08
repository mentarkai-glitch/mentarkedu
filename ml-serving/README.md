## Mentark ML Serving API

FastAPI service that hosts the trained dropout, burnout, difficulty, and sentiment models with automatic fallbacks to rule-based heuristics.

### Setup

```bash
cd ml-serving
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file:

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
MODEL_REGISTRY_DIR=../ml-training/data/models
FEATURE_VERSION=1.0.0
MODEL_RELOAD_TOKEN=optional-secret
```

### Run locally

```bash
uvicorn app.main:app --reload --port 8001
```

### Endpoints

- `POST /predict/risk` → dropout & burnout scores
- `POST /predict/difficulty` → optimal ARK difficulty
- `GET /health` → readiness + model cache state
- `POST /admin/reload` → clears in-memory model cache (requires `MODEL_RELOAD_TOKEN` if set)

### Version management

The service queries `ml_model_versions` in Supabase to find the latest deployed version. If the model file is missing or inference fails, we seamlessly fall back to deterministic heuristics backed by the existing rule-based logic.

### Directory structure

```
ml-serving/
├── requirements.txt
├── README.md
├── Dockerfile
├── .dockerignore
└── app/
    ├── main.py
    ├── models.py
    ├── registry.py
    └── rule_based.py
```

Models saved via the training scripts (`ml-training/train/...`) are automatically discovered using `MODEL_REGISTRY_DIR`.

### Docker

Build and run the containerised service:

```bash
docker build -t mentark-ml-serving .
docker run --rm -p 8001:8001 \
  -e SUPABASE_URL=... \
  -e SUPABASE_SERVICE_ROLE_KEY=... \
  -e MODEL_REGISTRY_DIR=/models \
  -e FEATURE_VERSION=1.0.0 \
  -e MODEL_RELOAD_TOKEN=optional-secret \
  -v /absolute/path/to/ml-training/data/models:/models \
  mentark-ml-serving
```

Use the reload endpoint to drop cached models after uploading a new artifact:

```bash
curl -X POST http://localhost:8001/admin/reload \
  -H "X-Reload-Token: optional-secret"
```
