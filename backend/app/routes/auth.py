from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, SiteSettings
from app.schemas.schemas import UserRegister, UserLogin, Token
from app.utils import hash_password, verify_password, create_access_token, generate_referral_code
from pydantic import BaseModel
import pyotp, random, string, smtplib, os
from email.mime.text import MIMEText
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["Auth"])

# In-memory OTP store: {username: {otp, expires, temp_token}}
otp_store = {}

def send_otp_email(to_email: str, otp: str, username: str):
    gmail_user = os.getenv("GMAIL_USER", "")
    gmail_pass = os.getenv("GMAIL_PASS", "")
    if not gmail_user or not gmail_pass:
        return  # silently skip if not configured
    msg = MIMEText(f"""Hello {username},

Your Smart Grow Chain login verification code is:

  {otp}

This code expires in 10 minutes. Do not share it with anyone.

— Smart Grow Chain Team""", "plain")
    msg["Subject"] = f"Your Login OTP: {otp}"
    msg["From"] = gmail_user
    msg["To"] = to_email
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(gmail_user, gmail_pass)
            server.sendmail(gmail_user, to_email, msg.as_string())
    except Exception:
        pass  # don't crash if email fails

class Verify2FALogin(BaseModel):
    temp_token: str
    code: str

class OTPVerify(BaseModel):
    temp_token: str
    otp: str

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
    # Admin bypass — no OTP
    if data.username == "admin" and data.password == "admin123":
        token = create_access_token({"sub": "0", "is_admin": True})
        return {"access_token": token, "token_type": "bearer", "is_admin": True, "username": "admin"}

    user = db.query(User).filter(User.username == data.username).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    # 2FA check first
    if user.two_fa_enabled and user.two_fa_secret:
        temp_token = create_access_token({"sub": str(user.id), "is_admin": user.is_admin, "2fa_pending": True})
        return {"requires_2fa": True, "temp_token": temp_token}

    # Direct login — OTP disabled (email not configured)
    token = create_access_token({"sub": str(user.id), "is_admin": user.is_admin})
    return {"access_token": token, "token_type": "bearer", "is_admin": user.is_admin, "username": user.username}

@router.post("/verify-otp")
def verify_otp(data: OTPVerify, db: Session = Depends(get_db)):
    from app.utils import decode_token
    try:
        payload = decode_token(data.temp_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if not payload.get("otp_pending"):
        raise HTTPException(status_code=400, detail="Not an OTP pending token")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    entry = otp_store.get(user.username)
    if not entry:
        raise HTTPException(status_code=400, detail="OTP not found. Please login again.")
    if datetime.utcnow() > entry["expires"]:
        otp_store.pop(user.username, None)
        raise HTTPException(status_code=400, detail="OTP expired. Please login again.")
    if entry["otp"] != data.otp.strip():
        raise HTTPException(status_code=400, detail="Invalid OTP code")
    otp_store.pop(user.username, None)
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
