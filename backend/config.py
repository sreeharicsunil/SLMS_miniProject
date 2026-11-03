import os

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-minilm")
CHAT_MODEL = os.getenv("CHAT_MODEL", "qwen2.5:1.5b")
JWT_ALGORITHM = "HS256"
