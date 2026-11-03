from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
from backend.database import get_db
from backend.models import Book, BookCopy
from backend.schemas import BookResponse, CopyResponse

router = APIRouter(prefix="/api/books", tags=["Books & Catalog"])

@router.get("", response_model=List[BookResponse])
def get_books(
    search: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = Query(default=100, le=500),
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(Book)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Book.title.ilike(search_filter),
                Book.author.ilike(search_filter),
                Book.isbn.ilike(search_filter),
                Book.category.ilike(search_filter)
            )
        )
    if category and category.lower() != "all":
        query = query.filter(Book.category.ilike(f"%{category}%"))

    books = query.offset(offset).limit(limit).all()
    
    # Calculate available & total copies
    result = []
    for b in books:
        total = len(b.copies)
        avail = len([c for c in b.copies if c.status == "Available"])
        b_dict = {
            "book_id": b.book_id,
            "title": b.title,
            "author": b.author,
            "isbn": b.isbn,
            "publisher": b.publisher,
            "description": b.description,
            "category": b.category,
            "subject": b.subject,
            "level": b.level,
            "language": b.language,
            "syllabus_relevant": b.syllabus_relevant,
            "image_url": b.image_url,
            "publication_year": b.publication_year,
            "pages": b.pages,
            "rating": float(b.rating) if b.rating else 4.5,
            "rating_count": b.rating_count or 0,
            "total_copies": total,
            "available_copies": avail,
            "created_at": b.created_at
        }
        result.append(b_dict)
    return result

@router.get("/{book_id}")
def get_book_detail(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.book_id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    copies = [
        {
            "copy_id": c.copy_id,
            "book_id": c.book_id,
            "barcode": c.barcode,
            "status": c.status,
            "condition": c.condition,
            "location": c.location
        }
        for c in book.copies
    ]
    
    return {
        "book_id": book.book_id,
        "title": book.title,
        "author": book.author,
        "isbn": book.isbn,
        "publisher": book.publisher,
        "description": book.description,
        "category": book.category,
        "subject": book.subject,
        "level": book.level,
        "language": book.language,
        "syllabus_relevant": book.syllabus_relevant,
        "image_url": book.image_url,
        "publication_year": book.publication_year,
        "pages": book.pages,
        "rating": float(book.rating) if book.rating else 4.5,
        "rating_count": book.rating_count or 0,
        "copies": copies,
        "available_copies": len([c for c in copies if c["status"] == "Available"]),
        "total_copies": len(copies)
    }

@router.get("/categories/stats")
def get_categories_stats(db: Session = Depends(get_db)):
    cats = db.query(
        Book.category, 
        func.count(Book.book_id).label("count")
    ).group_by(Book.category).all()
    
    return [{"category": c[0] or "General", "bookCount": c[1]} for c in cats]
