from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, UserAdRequest, AdBudgetRate, EasypaisaAccount, Ad, Earning, Notification
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
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token")
        # Backward compatibility: old admin tokens had sub="0"
        if payload.get("sub") == "0" and payload.get("is_admin"):
            admin_user = db.query(User).filter(User.username == "admin").first()
            if not admin_user:
                from app.utils import hash_password, generate_referral_code
                admin_user = User(
                    username="admin", email="admin@smartgrow.com",
                    password=hash_password("admin123"), is_admin=True,
                    is_active=True, balance=0, total_earned=0,
                    referral_code=generate_referral_code()
                )
                db.add(admin_user); db.commit(); db.refresh(admin_user)
            return admin_user
        user = db.query(User).filter(User.id == int(payload["sub"])).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except HTTPException:
        raise
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

@router.post("")
@router.post("/")
@router.post("/submit")
async def submit_ad_request(
    title: str = Form(...),
    url: str = Form(...),
    members_needed: int = Form(...),
    payment_method: str = Form(...),  # "wallet", "easypaisa", "jazzcash", "bank"
    sender_name: str = Form(""),
    transaction_id: str = Form(""),
    screenshot: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rate = get_rate(db)
    total_cost = round(members_needed * rate, 2)

    if payment_method not in ["wallet", "easypaisa", "jazzcash", "bank"]:
        raise HTTPException(status_code=400, detail="Invalid payment method")
    if members_needed <= 0 or not title.strip() or not url.strip():
        raise HTTPException(status_code=400, detail="Please provide valid ad details")
    if payment_method == "wallet":
        if current_user.balance < total_cost:
            raise HTTPException(status_code=400, detail=f"Insufficient balance. Required: Rs. {total_cost}, Available: Rs. {round(current_user.balance, 2)}")
        current_user.balance -= total_cost
        screenshot_path = None
    else:
        if not screenshot:
            raise HTTPException(status_code=400, detail="Payment screenshot is required")
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
        sender_name=sender_name.strip() or None,
        transaction_id=transaction_id.strip() or None,
        screenshot_path=screenshot_path,
        status="approved" if payment_method == "wallet" else "pending"
    )
    db.add(req)
    # Wallet campaigns are already paid, therefore go live immediately.
    if payment_method == "wallet":
        db.flush()
        db.add(Ad(title=title.strip(), url=url.strip(), description="Sponsored campaign", earning_amount=0.5, timer_seconds=15, daily_limit=members_needed, is_active=True))
        for admin in db.query(User).filter(User.is_admin == True).all():
            db.add(Notification(user_id=admin.id, title="New Wallet Advertisement 📢", message=f"{current_user.username} just advertised an ad. Rs. {total_cost} was deducted from their wallet."))
    db.commit()
    return {"message": "Ad is live now." if payment_method == "wallet" else "Ad request submitted successfully", "total_cost": total_cost, "activated": payment_method == "wallet"}

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

@router.get("/viewers/{req_id}")
def get_campaign_viewers(req_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    req = db.query(UserAdRequest).filter(UserAdRequest.id == req_id, UserAdRequest.user_id == current_user.id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    req_url_clean = (req.url or "").strip()
    req_title_clean = (req.title or "").strip()
    
    ads = db.query(Ad).filter(
        (Ad.url == req.url) | (Ad.url == req_url_clean) | (Ad.title == req.title) | (Ad.title == req_title_clean)
    ).all()
    ad_ids = [a.id for a in ads]

    if not ad_ids:
        return []

    earnings = db.query(Earning).filter(
        Earning.type == "click",
        Earning.ad_id.in_(ad_ids)
    ).order_by(Earning.clicked_at.desc()).all()

    result = []
    for e in earnings:
        user = db.query(User).filter(User.id == e.user_id).first()
        if not user:
            continue
        result.append({
            "username": user.username,
            "email": user.email,
            "membership": user.membership or "none",
            "balance": round(user.balance or 0, 2),
            "total_earned": round(user.total_earned or 0, 2),
            "kyc_status": user.kyc_status or "none",
            "plan_expires_at": user.plan_expires_at,
            "is_active": user.is_active,
            "viewed_at": e.clicked_at,
            "earned_amount": round(e.amount or 0, 2),
        })
    return result

@router.get("/easypaisa-accounts")
def get_accounts(db: Session = Depends(get_db)):
    accounts = db.query(EasypaisaAccount).filter(EasypaisaAccount.is_active == True).all()
    return [{"id": a.id, "account_title": a.account_title, "account_number": a.account_number, "method_type": a.method_type or "easypaisa"} for a in accounts]
