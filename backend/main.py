from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import auth, books, loans, fines, ai

app = FastAPI(
    title="Smart Library Management System API",
    description="Enterprise Relational API powered by FastAPI, PostgreSQL, and Local Ollama Vector RAG.",
    version="2.0.0"
)

# CORS setup for React Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(books.router)
app.include_router(loans.router)
app.include_router(fines.router)
app.include_router(ai.router)

@app.get("/api/health")
def healthcheck():
    return {
        "status": "healthy",
        "database": "PostgreSQL 18 (smart_library)",
        "ai_engine": "Ollama (all-minilm + qwen2.5:1.5b)",
        "version": "2.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
