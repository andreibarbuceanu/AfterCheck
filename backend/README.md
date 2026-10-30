# AfterCheck Backend

FastAPI backend responsible for importing tickets, running Playwright checks and calculating the combined post-release impact.

## Stack

- Python and FastAPI
- SQLite
- Playwright
- Gemini with deterministic fallbacks

## Start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Swagger is available at `http://localhost:8000/docs`.

## Verification model

Verification is manual. Import endpoints only save data; the Playwright pipeline starts exclusively through `POST /api/verify/run`.

Post-release results remain hidden until that manual verification finishes.

## Tests

```bash
.venv/bin/python -m unittest discover -s tests -v
```

