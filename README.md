# Smart Library Management System

A React/Vite library-management prototype with a FastAPI/PostgreSQL backend and an optional local Ollama-powered book-recommendation API.

> **Project status: prototype, not production-ready.** The polished frontend is primarily a client-side demo backed by bundled sample data and browser storage. Its authentication and role checks run in the browser and can be bypassed; they do not protect real accounts or data. The backend has separate authentication and authorization, but most frontend screens are not connected to those backend endpoints. Do not deploy this as-is or use it for real user records, credentials, payments, or library operations.

## What is included

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, and Motion.
- **Demo experience:** member and admin screens, catalog browsing, borrow/return and reservation flows, fines, recommendations, a reader view, and profile screens. These use the frontend's sample data and browser-side service; they are not a complete database-backed product.
- **Backend:** FastAPI endpoints for authentication, books, loans, fines, and AI chat.
- **Storage:** PostgreSQL for the backend. The frontend demo stores its state in the browser and does not use PostgreSQL as its general data store.
- **AI:** The backend recommendation endpoint uses local Ollama models and book embeddings. The chat UI calls `http://127.0.0.1:8000/api/ai/chat`; if that backend is unavailable, the UI falls back to its local demo engine.

## Requirements

- Node.js **20.19 or newer**, with npm.
- Python **3.10 or newer** for the backend.
- PostgreSQL for the backend.
- Ollama and the configured models (`all-minilm` and `qwen2.5:1.5b`) for backend AI chat. The frontend can be run without these; the AI chat then uses its demo fallback.

## Run the frontend demo

From the repository root:

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). This starts the Vite frontend only; it does not start PostgreSQL, the FastAPI backend, or Ollama.

Useful frontend commands:

```powershell
npm run build
npm run lint
npm run preview
```

`npm run lint` runs the TypeScript compiler without emitting files.

## Configure and run the backend

1. Create a PostgreSQL database for development. Do not point this prototype at a database containing data you need to keep.
2. Copy the example environment file and edit the local copy:

   ```powershell
   Copy-Item .env.example .env
   ```

   Set `DATABASE_URL` to your PostgreSQL connection URL and set `JWT_SECRET` to a random value of at least 32 bytes. For example, generate a value with:

   ```powershell
   py -c "import secrets; print(secrets.token_urlsafe(48))"
   ```

   Keep the generated value private. `.env` is ignored by Git; never commit populated secrets. `GEMINI_API_KEY` and `APP_URL` in the example are placeholders, not working credentials or a configured deployment.

3. Install Python dependencies in a virtual environment:

   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   py -m pip install -r requirements.txt
   ```

4. Create the schema and seed the development database:

   ```powershell
   psql "$env:DATABASE_URL" -f scripts/create_schema.sql
   npm run migrate
   ```

   **Warning:** `scripts/migrate_and_seed.py` truncates library tables and resets their identity counters before inserting sample data. It is destructive. Run it only against a disposable development database after reviewing the script; do not run it against production or a database with data to preserve.

5. For backend AI chat, install/start Ollama and download the configured models:

   ```powershell
   ollama pull all-minilm
   ollama pull qwen2.5:1.5b
   ```

6. In another terminal, start the API:

   ```powershell
   npm run server
   ```

   The API listens at [http://127.0.0.1:8000](http://127.0.0.1:8000). Interactive API documentation is at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs), and the health route is [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health). The health route reports configured service labels; it is not a full database or Ollama readiness check.

The Vite frontend and API are separate processes. The chat UI uses a fixed local API URL, so this setup is for local development and is not sufficient for a deployed frontend.

## Security and deployment limitations

- **Frontend authentication is not security.** Demo credentials, password checks, role checks, and token signing logic are present in client-delivered code. A user can inspect or modify browser code and storage. Do not treat the admin screen, local roles, or frontend token as access control.
- **The backend is a separate API, not an integrated production app.** Its login and protected loan/fine routes do not automatically secure the frontend's local demo data or UI actions.
- **The migration is destructive.** It truncates application tables. Use only a throwaway database and make a backup before any migration work.
- **AI requests need local services.** Backend chat requires a reachable Ollama instance and available models, as well as seeded book embeddings. The frontend's fallback is demo behavior, not equivalent to backend retrieval.
- **No production deployment configuration is supplied.** Before deployment, the app needs a real integration between UI and API, server-enforced authorization on every data operation, production-grade secret management, HTTPS, database backup/migration procedures, operational monitoring, and end-to-end testing.
- **Do not place real API keys in frontend code or Vite-exposed variables.** Anything delivered to a browser can be read by users.

## Tests

Run the frontend checks:

```powershell
npm run lint
npm run build
```

Run the backend security unit tests:

```powershell
py -m unittest backend.tests.test_security
```

These checks do not constitute a full integration, deployment, or security assessment.

## Repository layout

```text
backend/                  FastAPI app, database models, routers, security, tests
scripts/create_schema.sql PostgreSQL schema
scripts/migrate_and_seed.py
                          Destructive sample-data migration/seed script
src/                      React application and bundled demo data
requirements.txt          Python backend dependencies
package.json              Frontend dependencies and development scripts
```
