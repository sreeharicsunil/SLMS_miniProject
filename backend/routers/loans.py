from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import List, Optional
from backend.database import get_db
from backend.models import Loan, BookCopy, Book, User, Fine
from backend.schemas import LoanCreate
from backend.security import get_current_user

router = APIRouter(prefix="/api/loans", tags=["Loans & Circulation"])

@router.get("")
def get_loans(
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Loan)
    if current_user.role.lower() != "admin":
        if user_id is not None and user_id != current_user.user_id:
            raise HTTPException(status_code=403, detail="You can only view your own loans")
        query = query.filter(Loan.user_id == current_user.user_id)
    elif user_id is not None:
        query = query.filter(Loan.user_id == user_id)
    loans = query.order_by(Loan.borrowed_at.desc()).all()
    
    result = []
    for l in loans:
        book = l.copy.book if l.copy else None
        result.append({
            "loan_id": l.loan_id,
            "user_id": l.user_id,
            "userName": l.user.name if l.user else "Member",
            "copy_id": l.copy_id,
            "barcode": l.copy.barcode if l.copy else "",
            "book_id": book.book_id if book else None,
            "bookTitle": book.title if book else "Unknown Book",
            "bookImage": book.image_url if book else "",
            "borrowed_at": l.borrowed_at,
            "due_at": l.due_at,
            "returned_at": l.returned_at,
            "status": l.status
        })
    return result

@router.post("/borrow")
def borrow_copy(
    payload: LoanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role.lower() != "admin" and payload.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You can only borrow books for yourself")

    user = db.query(User).filter(User.user_id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    copy = db.query(BookCopy).filter(BookCopy.copy_id == payload.copy_id).first()
    if not copy:
        raise HTTPException(status_code=404, detail="Book copy not found")
        
    if copy.status != "Available":
        raise HTTPException(status_code=400, detail=f"Copy is currently {copy.status}")

    today = date.today()
    due = today + timedelta(days=payload.due_days)

    loan = Loan(
        user_id=user.user_id,
        copy_id=copy.copy_id,
        borrowed_at=today,
        due_at=due,
        status="Borrowed"
    )
    copy.status = "Borrowed"
    db.add(loan)
    db.commit()
    db.refresh(loan)

    return {
        "success": True,
        "message": f"Successfully borrowed {copy.book.title}",
        "loan_id": loan.loan_id,
        "due_date": due.isoformat()
    }

@router.post("/return/{loan_id}")
def return_copy(
    loan_id: int,
    condition: str = "Good",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    loan = db.query(Loan).filter(Loan.loan_id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    if current_user.role.lower() != "admin" and loan.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You can only return your own loans")

    today = date.today()
    loan.returned_at = today
    loan.status = "Returned"
    
    if loan.copy:
        loan.copy.status = "Available"
        loan.copy.condition = condition

    # Check for overdue fine
    if today > loan.due_at:
        overdue_days = (today - loan.due_at).days
        fine_amount = overdue_days * 5.0  # ₹5/day
        fine = Fine(
            loan_id=loan.loan_id,
            amount=fine_amount,
            reason="Overdue",
            status="Pending"
        )
        db.add(fine)

    db.commit()
    return {"success": True, "message": "Book returned successfully"}
