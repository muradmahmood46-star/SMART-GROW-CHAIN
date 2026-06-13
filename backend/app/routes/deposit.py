from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Deposit, EasypaisaAccount
from app.utils import decode_token
from fastapi.security import OAuth2PasswordBearer
import os, shutil, uuid

router = APIRouter(prefix="/deposit", tags=["Deposit"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

UPLOAD_DIR = "uploads/screenshots"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = decode_token(token)
        user = db.query(User).filter(User.id == int(payload["sub"])).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# ── Get active accounts (show number + title to user) ────────────
@router.get("/easypaisa-accounts")
def get_accounts(db: Session = Depends(get_db)):
    accounts = db.query(EasypaisaAccount).filter(EasypaisaAccount.is_active == True).all()
    return [{
        "id": a.id,
        "account_title": a.account_title,
        "account_number": a.account_number,
        "phone_number": a.phone_number or a.account_number,
        "method_type": a.method_type or "easypaisa",
        "deposit_message": a.deposit_message or "",
        "bank_name": a.bank_name or "",
    } for a in accounts]

# ── Submit deposit with screenshot ───────────────────────────────
@router.post("/request")
async def request_deposit(
    amount_pkr: float = Form(...),
    easypaisa_account_id: int = Form(...),
    sender_name: str = Form(...),
    transaction_id: str = Form(...),
    screenshot_note: str = Form(""),
    screenshot: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if amount_pkr < 100:
        raise HTTPException(status_code=400, detail="Minimum deposit is Rs. 100")

    acc = db.query(EasypaisaAccount).filter(
        EasypaisaAccount.id == easypaisa_account_id,
        EasypaisaAccount.is_active == True
    ).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")

    # Save screenshot
    ext = os.path.splitext(screenshot.filename)[-1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(status_code=400, detail="Only JPG/PNG images allowed")
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        shutil.copyfileobj(screenshot.file, f)

    deposit = Deposit(
        user_id=current_user.id,
        amount_pkr=amount_pkr,
        easypaisa_account_id=easypaisa_account_id,
        sender_name=sender_name,
        transaction_id=transaction_id,
        screenshot_path=filename,
        screenshot_note=screenshot_note,
        status="pending"
    )
    db.add(deposit)
    db.commit()
    return {"message": "Deposit request submitted. Admin will verify and credit your account."}

# ── My deposit history ────────────────────────────────────────────
@router.get("/my-deposits")
def my_deposits(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    deposits = db.query(Deposit).filter(Deposit.user_id == current_user.id).order_by(Deposit.created_at.desc()).all()
    return [{
        "id": d.id, "amount_pkr": d.amount_pkr,
        "sender_name": d.sender_name,
        "transaction_id": d.transaction_id,
        "status": d.status, "admin_note": d.admin_note,
        "created_at": d.created_at
    } for d in deposits]
