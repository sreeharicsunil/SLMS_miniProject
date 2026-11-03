from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import numpy as np
import ollama
from typing import List, Dict, Any
from backend.database import get_db
from backend.models import Book, BookEmbedding
from backend.schemas import ChatQuery, ChatResponse
from backend.config import EMBEDDING_MODEL, CHAT_MODEL

router = APIRouter(prefix="/api/ai", tags=["Local AI & Vector RAG"])

def compute_cosine_similarity(vec_a: np.ndarray, matrix_b: np.ndarray) -> np.ndarray:
    """Computes cosine similarity between a vector and an (N, D) matrix."""
    dot_product = np.dot(matrix_b, vec_a)
    norm_a = np.linalg.norm(vec_a)
    norm_b = np.linalg.norm(matrix_b, axis=1)
    # Avoid zero division
    norm_product = np.maximum(norm_a * norm_b, 1e-9)
    return dot_product / norm_product

@router.post("/chat", response_model=ChatResponse)
def rag_chat(query: ChatQuery, db: Session = Depends(get_db)):
    user_text = query.message.strip()
    if not user_text:
        raise HTTPException(status_code=400, detail="Empty query")

    # 1. Generate query embedding via Ollama
    try:
        embed_resp = ollama.embeddings(model=EMBEDDING_MODEL, prompt=user_text)
        query_vec = np.array(embed_resp["embedding"], dtype=np.float32)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate embedding from local Ollama: {str(e)}"
        )

    # 2. Retrieve all book embeddings from PostgreSQL
    records = db.query(BookEmbedding.book_id, BookEmbedding.embedding).all()
    if not records:
        return ChatResponse(
            reply="Our library catalog is currently empty. Please add books to search.",
            recommended_books=[]
        )

    book_ids = [r[0] for r in records]
    embeddings_matrix = np.array([r[1] for r in records], dtype=np.float32)

    # 3. Calculate Vector Similarity (Cosine distance)
    similarities = compute_cosine_similarity(query_vec, embeddings_matrix)
    top_indices = np.argsort(similarities)[::-1][:4]  # Top 4 most relevant books

    top_book_ids = [book_ids[i] for i in top_indices]
    top_books = db.query(Book).filter(Book.book_id.in_(top_book_ids)).all()

    # Preserve similarity ranking order
    book_map = {b.book_id: b for b in top_books}
    ranked_books = [book_map[b_id] for b_id in top_book_ids if b_id in book_map]

    # 4. Construct RAG Context
    catalog_context = ""
    recommended_cards = []
    for idx, b in enumerate(ranked_books, 1):
        catalog_context += (
            f"{idx}. Title: {b.title}\n"
            f"   Author: {b.author}\n"
            f"   Category: {b.category}\n"
            f"   Description: {b.description}\n\n"
        )
        recommended_cards.append({
            "book_id": b.book_id,
            "title": b.title,
            "author": b.author,
            "category": b.category,
            "image_url": b.image_url,
            "rating": float(b.rating) if b.rating else 4.5,
            "available_copies": len([c for c in b.copies if c.status == "Available"])
        })

    rag_system_prompt = (
        "You are the Smart Library AI Assistant. "
        "Recommend books from the library catalog based on the user's inquiry. "
        "Be friendly, polite, informative, and concisely summarize why each book matches their interest. "
        "Reference the provided books when answering.\n\n"
        f"Available Library Books Context:\n{catalog_context}"
    )

    messages = [{"role": "system", "content": rag_system_prompt}]
    
    # Append recent conversation history if provided
    if query.history:
        for h in query.history[-4:]:
            messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
            
    messages.append({"role": "user", "content": user_text})

    # 5. Query local Ollama Chat Model
    try:
        chat_resp = ollama.chat(
            model=CHAT_MODEL,
            messages=messages,
            options={"temperature": 0.3}
        )
        reply_content = chat_resp["message"]["content"]
    except Exception as e:
        reply_content = (
            f"I found {len(ranked_books)} relevant books in our library catalog for your search! "
            f"Here are the top matches:\n" + 
            "\n".join([f"• **{b.title}** by {b.author} ({b.category})" for b in ranked_books])
        )

    return ChatResponse(
        reply=reply_content,
        recommended_books=recommended_cards
    )
