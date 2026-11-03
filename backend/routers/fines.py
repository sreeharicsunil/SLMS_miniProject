from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from backend.database import get_db
from backend.models import Fine, Loan, User
from backend.security import get_current_user, require_admin

router = APIRouter(prefix="/api/fines", tags=["Fines Management"])

@router.get("")
def get_fines(
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Fine).join(Loan)
    if current_user.role.lower() != "admin":
        if user_id is not None and user_id != current_user.user_id:
            raise HTTPException(status_code=403, detail="You can only view your own fines")
        query = query.filter(Loan.user_id == current_user.user_id)
    elif user_id is not None:
        query = query.filter(Loan.user_id == user_id)
    fines = query.order_by(Fine.created_at.desc()).all()

    result = []
    for f in fines:
        book = f.loan.copy.book if f.loan and f.loan.copy else None
        result.append({
            "fine_id": f.fine_id,
            "loan_id": f.loan_id,
            "user_id": f.loan.user_id if f.loan else None,
            "userName": f.loan.user.name if f.loan and f.loan.user else "Member",
            "bookTitle": book.title if book else "Library Item",
            "amount": float(f.amount),
            "reason": f.reason,
            "status": f.status,
            "created_at": f.created_at,
            "paid_at": f.paid_at
        })
    return result

@router.post("/pay/{fine_id}")
def pay_fine(
    fine_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    fine = db.query(Fine).filter(Fine.fine_id == fine_id).first()
    if not fine:
        raise HTTPException(status_code=404, detail="Fine not found")

    fine.status = "Paid"
    fine.paid_at = datetime.now()
    db.commit()
    return {"success": True, "message": f"Fine of ₹{fine.amount:.2f} marked as Paid."}
