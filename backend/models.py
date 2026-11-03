from sqlalchemy import Column, Integer, String, Text, Boolean, Date, DateTime, Numeric, ForeignKey, ARRAY, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    member_id = Column(String(50), unique=True, nullable=False)
    name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="Student")
    status = Column(String(50), nullable=False, default="Active")
    department = Column(String(100), default="General")
    phone = Column(String(30))
    avatar = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    loans = relationship("Loan", back_populates="user", cascade="all, delete")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete")
    reservations = relationship("Reservation", back_populates="user", cascade="all, delete")


class Book(Base):
    __tablename__ = "books"

    book_id = Column(Integer, primary_key=True, index=True)
    isbn = Column(String(50), index=True)
    title = Column(String(255), nullable=False, index=True)
    author = Column(String(255), nullable=False, index=True)
    publisher = Column(String(255))
    description = Column(Text)
    category = Column(String(100), index=True)
    subject = Column(String(100))
    level = Column(String(50), default="All Levels")
    language = Column(String(50), default="English")
    syllabus_relevant = Column(Boolean, default=False)
    image_url = Column(Text)
    publication_year = Column(Integer)
    pages = Column(Integer, default=300)
    rating = Column(Numeric(3, 2), default=4.5)
    rating_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

    copies = relationship("BookCopy", back_populates="book", cascade="all, delete")
    embedding_record = relationship("BookEmbedding", back_populates="book", uselist=False, cascade="all, delete")
    reservations = relationship("Reservation", back_populates="book", cascade="all, delete")


class BookEmbedding(Base):
    __tablename__ = "book_embeddings"

    embedding_id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.book_id", ondelete="CASCADE"), unique=True, nullable=False)
    embedding = Column(ARRAY(Float), nullable=False)
    model_name = Column(String(100), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    book = relationship("Book", back_populates="embedding_record")


class BookCopy(Base):
    __tablename__ = "book_copies"

    copy_id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False)
    barcode = Column(String(50), unique=True, nullable=False, index=True)
    status = Column(String(50), default="Available")
    condition = Column(String(50), default="Good")
    location = Column(String(100), default="Main Stacks")
    acquired_at = Column(Date, server_default=func.current_date())

    book = relationship("Book", back_populates="copies")
    loans = relationship("Loan", back_populates="copy")


class Loan(Base):
    __tablename__ = "loans"

    loan_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    copy_id = Column(Integer, ForeignKey("book_copies.copy_id", ondelete="CASCADE"), nullable=False)
    borrowed_at = Column(Date, server_default=func.current_date())
    due_at = Column(Date, nullable=False)
    returned_at = Column(Date)
    status = Column(String(50), default="Borrowed")

    user = relationship("User", back_populates="loans")
    copy = relationship("BookCopy", back_populates="loans")
    fines = relationship("Fine", back_populates="loan", cascade="all, delete")


class Fine(Base):
    __tablename__ = "fines"

    fine_id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(Integer, ForeignKey("loans.loan_id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False, default=0.00)
    reason = Column(String(100), default="Overdue")
    status = Column(String(50), default="Pending")
    created_at = Column(DateTime, server_default=func.now())
    paid_at = Column(DateTime)

    loan = relationship("Loan", back_populates="fines")


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    related_loan_id = Column(Integer, ForeignKey("loans.loan_id", ondelete="SET NULL"))
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="notifications")


class Reservation(Base):
    __tablename__ = "reservations"

    reservation_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False)
    queue_position = Column(Integer, default=1)
    status = Column(String(50), default="Pending")
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="reservations")
    book = relationship("Book", back_populates="reservations")
