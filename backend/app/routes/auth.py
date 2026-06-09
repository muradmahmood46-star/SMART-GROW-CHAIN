from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User
from app.schemas.schemas import UserRegister, UserLogin, Token
from app.utils import hash_password, verify_password, create_access_token, generate_referral_code
from pydantic import BaseModel
import pyotp

router = APIRouter(prefix="/auth", tags=["Auth"])

class Verify2FALogin(BaseModel):
    temp_token: str
    code: str

@router.post("/register")
def register(data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    referred_by = None
    if data.referral_code:
        referrer = db.query(User).filter(User.referral_code == data.referral_code).first()
        if referrer:
            referred_by = referrer.id

    user = User(
        username=data.username,
        email=data.email,
        password=hash_password(data.password),
        referral_code=generate_referral_code(),
        referred_by=referred_by
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "Registration successful"}

@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    # 🔥 1. Admin Hardcoded Bypass Logic
    if data.username == "admin" and data.password == "admin123":
        token = create_access_token({"sub": "0", "is_admin": True})
        return {
            "access_token": token,
            "token_type": "bearer",
            "is_admin": True,
            "username": "admin"
        }

    # 2. Baki normal users ke liye database query
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    if user.two_fa_enabled and user.two_fa_secret:
        # Issue a short-lived temp token that carries user_id but is_admin=False scope
        temp_token = create_access_token({"sub": str(user.id), "is_admin": user.is_admin, "2fa_pending": True})
        return {"requires_2fa": True, "temp_token": temp_token}

    token = create_access_token({"sub": str(user.id), "is_admin": user.is_admin})
    return {"access_token": token, "token_type": "bearer", "is_admin": user.is_admin, "username": user.username}

@router.post("/verify-2fa", response_model=Token)
def verify_2fa_login(data: Verify2FALogin, db: Session = Depends(get_db)):
    from app.utils import decode_token
    try:
        payload = decode_token(data.temp_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if not payload.get("2fa_pending"):
        raise HTTPException(status_code=400, detail="Not a 2FA pending token")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    totp = pyotp.TOTP(user.two_fa_secret)
    if not totp.verify(data.code):
        raise HTTPException(status_code=400, detail="Invalid 2FA code")
    token = create_access_token({"sub": str(user.id), "is_admin": user.is_admin})
    return {"access_token": token, "token_type": "bearer", "is_admin": user.is_admin, "username": user.username}
