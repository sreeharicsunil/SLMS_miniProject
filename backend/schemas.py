from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime

class UserBase(BaseModel):
    name: str
    email: str
    role: str = "Student"
    department: Optional[str] = "General"
    phone: Optional[str] = None
    avatar: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    user_id: int
    member_id: str
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class BookBase(BaseModel):
    title: str
    author: str
    isbn: Optional[str] = None
    publisher: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = "General"
    subject: Optional[str] = None
    level: Optional[str] = "All Levels"
    language: Optional[str] = "English"
    syllabus_relevant: Optional[bool] = False
    image_url: Optional[str] = None
    publication_year: Optional[int] = None
    pages: Optional[int] = 300
    rating: Optional[float] = 4.5
    rating_count: Optional[int] = 0

class BookResponse(BookBase):
    book_id: int
    available_copies: Optional[int] = 0
    total_copies: Optional[int] = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CopyResponse(BaseModel):
    copy_id: int
    book_id: int
    barcode: str
    status: str
    condition: str
    location: str

    class Config:
        from_attributes = True

class LoanCreate(BaseModel):
    user_id: int
    copy_id: int
    due_days: int = Field(default=14, ge=1, le=60)

class LoanResponse(BaseModel):
    loan_id: int
    user_id: int
    copy_id: int
    book_title: Optional[str] = None
    book_image: Optional[str] = None
    barcode: Optional[str] = None
    borrowed_at: date
    due_at: date
    returned_at: Optional[date] = None
    status: str

    class Config:
        from_attributes = True

class FineResponse(BaseModel):
    fine_id: int
    loan_id: int
    amount: float
    reason: str
    status: str
    created_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ChatQuery(BaseModel):
    message: str
    history: Optional[List[dict]] = []

class ChatResponse(BaseModel):
    reply: str
    recommended_books: Optional[List[dict]] = []
