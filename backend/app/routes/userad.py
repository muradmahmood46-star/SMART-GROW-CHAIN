from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, UserAdRequest, AdBudgetRate, EasypaisaAccount, Ad
from app.utils import decode_token
from fastapi.security import OAuth2PasswordBearer
import os, shutil, uuid

router = APIRouter(prefix="/user/ad-request", tags=["UserAd"])
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

def get_rate(db: Session) -> float:
    rate = db.query(AdBudgetRate).first()
    return rate.rate_pkr if rate else 1.0

@router.get("/rate")
def get_ad_rate(db: Session = Depends(get_db)):
    rate = db.query(AdBudgetRate).first()
    return {
        "rate_pkr": rate.rate_pkr if rate else 1.0,
        "welcome_message": rate.welcome_message if rate else "Welcome! Create your campaign and reach thousands of members instantly."
    }

@router.post("/submit")
async def submit_ad_request(
    title: str = Form(...),
    url: str = Form(...),
    members_needed: int = Form(...),
    payment_method: str = Form(...),  # "wallet" or "easypaisa"
    screenshot: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rate = get_rate(db)
    total_cost = round(members_needed * rate, 2)

    if payment_method == "wallet":
        if current_user.balance < total_cost:
            raise HTTPException(status_code=400, detail=f"Insufficient balance. Required: Rs. {total_cost}, Available: Rs. {round(current_user.balance, 2)}")
        current_user.balance -= total_cost
        screenshot_path = None
    else:
        if not screenshot:
            raise HTTPException(status_code=400, detail="Screenshot required for Easypaisa payment")
        ext = os.path.splitext(screenshot.filename)[-1].lower()
        if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
            raise HTTPException(status_code=400, detail="Only JPG/PNG images allowed")
        filename = f"{uuid.uuid4().hex}{ext}"
        with open(os.path.join(UPLOAD_DIR, filename), "wb") as f:
            shutil.copyfileobj(screenshot.file, f)
        screenshot_path = filename

    req = UserAdRequest(
        user_id=current_user.id,
        title=title,
        url=url,
        members_needed=members_needed,
        rate_pkr=rate,
        total_cost=total_cost,
        payment_method=payment_method,
        screenshot_path=screenshot_path,
        status="pending"
    )
    db.add(req)
    db.commit()
    return {"message": "Ad request submitted successfully", "total_cost": total_cost}

@router.get("/my-requests")
def my_requests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reqs = db.query(UserAdRequest).filter(UserAdRequest.user_id == current_user.id).order_by(UserAdRequest.created_at.desc()).all()
    return [{
        "id": r.id, "title": r.title, "url": r.url,
        "members_needed": r.members_needed,
        "members_reached": r.members_reached or 0,
        "total_cost": r.total_cost, "payment_method": r.payment_method,
        "status": r.status,
        "can_reactivate": r.status in ["rejected", "completed"],
        "reactivate_message": "Reactivate this same campaign" if r.status in ["rejected", "completed"] else "Campaign is already active or waiting for admin approval",
        "admin_note": r.admin_note, "created_at": r.created_at
    } for r in reqs]

@router.post("/reactivate/{req_id}")
def reactivate_request(req_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    req = db.query(UserAdRequest).filter(UserAdRequest.id == req_id, UserAdRequest.user_id == current_user.id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.status not in ["rejected", "completed"]:
        raise HTTPException(status_code=400, detail="Only rejected or completed requests can be reactivated")
    # Wallet payment: deduct balance again
    if req.payment_method == "wallet":
        if current_user.balance < req.total_cost:
            raise HTTPException(status_code=400, detail=f"Insufficient balance. Required: Rs. {req.total_cost}")
        current_user.balance -= req.total_cost
    # Disable the old published ad so admin approval creates a fresh ad id.
    # This lets users who watched the previous run watch the reactivated run again.
    db.query(Ad).filter(Ad.url == req.url, Ad.is_active == True).update({"is_active": False})
    req.status = "pending"
    req.members_reached = 0
    req.admin_note = None
    db.commit()
    return {"message": "Request reactivated successfully"}

@router.get("/easypaisa-accounts")
def get_accounts(db: Session = Depends(get_db)):
    accounts = db.query(EasypaisaAccount).filter(EasypaisaAccount.is_active == True).all()
    return [{"id": a.id, "account_title": a.account_title, "account_number": a.account_number, "method_type": a.method_type or "easypaisa"} for a in accounts]
