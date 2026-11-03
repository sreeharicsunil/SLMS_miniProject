from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import User
from backend.schemas import UserLogin, UserResponse
from backend.security import create_access_token, hash_password, require_admin, verify_password

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login")
def login(creds: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email.strip().lower()).first()
    if (
        not user
        or user.status.lower() != "active"
        or not verify_password(creds.password, user.password_hash)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    token = create_access_token(user.user_id)
    if len(user.password_hash) == 64:
        user.password_hash = hash_password(creds.password)
        db.commit()

    return {
        "token": token,
        "user": {
            "id": str(user.user_id),
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email,
            "role": user.role.lower(),
            "membershipId": user.member_id,
            "department": user.department,
            "status": user.status.upper(),
            "avatar": user.avatar or f"https://api.dicebear.com/7.x/avataaars/svg?seed={user.name}",
            "currentlyBorrowedCount": len([l for l in user.loans if l.status == "Borrowed"])
        }
    }

@router.get("/users", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    return db.query(User).all()
