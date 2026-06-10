from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func, Date, cast, or_
import os, shutil, uuid
from app.database import get_db
from app.models.models import User, Ad, Earning, Withdrawal, ClickLog, FundTransfer, SupportTicket, MembershipPlan, UserAdRequest, SiteSettings, PlanPurchaseRequest, EasypaisaAccount, KYCRequest
from app.schemas.schemas import WithdrawalCreate, UserOut
from app.utils import decode_token, hash_password, verify_password
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime, timedelta
import pyotp, qrcode, io, base64

router = APIRouter(prefix="/user", tags=["User"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = decode_token(token)
        user = db.query(User).filter(User.id == int(payload["sub"])).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# ── PROFILE ─────────────────────────────────────────────────────────────────
@router.get("/profile", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

# ── ADS ──────────────────────────────────────────────────────────────────────
@router.get("/ads")
def get_ads(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ads = db.query(Ad).filter(Ad.is_active == True).all()
    result = []
    for ad in ads:
        # Permanent — agar kabhi bhi click kiya ho toh dubara nahi
        already_clicked = db.query(Earning).filter(
            Earning.user_id == current_user.id,
            Earning.ad_id == ad.id,
            Earning.type == "click"
        ).first()
        if already_clicked:
            continue  # clicked ads list mein show hi mat karo
        result.append({
            "id": ad.id, "title": ad.title, "url": ad.url,
            "description": ad.description,
            "earning_amount": ad.earning_amount,
            "timer_seconds": ad.timer_seconds,
            "total_clicks": ad.total_clicks,
            "already_clicked": False
        })
    return result

@router.post("/click/start/{ad_id}")
def start_click(ad_id: int, request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ad = db.query(Ad).filter(Ad.id == ad_id, Ad.is_active == True).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    # Permanent check
    already_clicked = db.query(Earning).filter(
        Earning.user_id == current_user.id, Earning.ad_id == ad_id,
        Earning.type == "click"
    ).first()
    if already_clicked:
        raise HTTPException(status_code=400, detail="Already clicked this ad")
    ip = request.client.host
    ua = request.headers.get("user-agent", "")
    today = date.today()
    ip_clicks = db.query(ClickLog).filter(
        ClickLog.ip_address == ip, cast(ClickLog.created_at, Date) == today
    ).count()
    if ip_clicks > 50:
        raise HTTPException(status_code=429, detail="Suspicious activity detected")
    log = ClickLog(user_id=current_user.id, ad_id=ad_id, ip_address=ip, user_agent=ua)
    db.add(log); db.commit(); db.refresh(log)
    return {"log_id": log.id, "timer_seconds": ad.timer_seconds}

@router.post("/click/complete/{ad_id}")
def complete_click(ad_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ad = db.query(Ad).filter(Ad.id == ad_id, Ad.is_active == True).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    # Permanent check
    already_clicked = db.query(Earning).filter(
        Earning.user_id == current_user.id, Earning.ad_id == ad_id,
        Earning.type == "click"
    ).first()
    if already_clicked:
        raise HTTPException(status_code=400, detail="Already clicked this ad")
    today = date.today()
    log = db.query(ClickLog).filter(
        ClickLog.user_id == current_user.id, ClickLog.ad_id == ad_id,
        cast(ClickLog.created_at, Date) == today
    ).order_by(ClickLog.id.desc()).first()
    if log:
        log.timer_completed = True
    earning = Earning(user_id=current_user.id, ad_id=ad_id, amount=ad.earning_amount, type="click")
    db.add(earning)
    current_user.balance += ad.earning_amount
    current_user.total_earned += ad.earning_amount
    ad.total_clicks += 1
    # ── members_reached increment for approved UserAdRequest ──
    active_req = db.query(UserAdRequest).filter(
        UserAdRequest.url == ad.url,
        UserAdRequest.status == "approved"
    ).first()
    if active_req:
        active_req.members_reached = (active_req.members_reached or 0) + 1
        if active_req.members_reached >= active_req.members_needed:
            active_req.status = "completed"
    if current_user.referred_by:
        referrer = db.query(User).filter(User.id == current_user.referred_by).first()
        if referrer:
            plan = db.query(MembershipPlan).filter(MembershipPlan.name == referrer.membership).first()
            rate = plan.referral_commission if plan else 0.10
            commission = round(ad.earning_amount * rate, 6)
            referrer.balance += commission
            referrer.total_earned += commission
            db.add(Earning(user_id=referrer.id, ad_id=ad_id, amount=commission, type="referral"))
    db.commit()
    return {"message": "Earning credited", "amount": ad.earning_amount, "new_balance": current_user.balance}

# ── WITHDRAW ─────────────────────────────────────────────────────────────────
@router.post("/withdraw")
def request_withdrawal(data: WithdrawalCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.kyc_status != "approved":
        raise HTTPException(status_code=400, detail="Please complete your KYC verification first before withdrawing.")
    if data.amount < 500:
        raise HTTPException(status_code=400, detail="Minimum withdrawal is Rs. 500")
    if current_user.balance < data.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    current_user.balance -= data.amount
    db.add(Withdrawal(user_id=current_user.id, amount=data.amount, method=data.method, wallet_address=data.wallet_address))
    db.commit()
    return {"message": "Withdrawal request submitted"}

@router.get("/withdrawals")
def get_withdrawals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ws = db.query(Withdrawal).filter(Withdrawal.user_id == current_user.id).order_by(Withdrawal.created_at.desc()).all()
    return [{"id": w.id, "amount": w.amount, "method": w.method, "wallet_address": w.wallet_address, "status": w.status, "created_at": w.created_at} for w in ws]

# ── EARNINGS ──────────────────────────────────────────────────────────────────
@router.get("/earnings")
def get_earnings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    earnings = db.query(Earning).filter(Earning.user_id == current_user.id).order_by(Earning.clicked_at.desc()).limit(200).all()
    return [{"ad_id": e.ad_id, "amount": e.amount, "type": e.type, "clicked_at": e.clicked_at} for e in earnings]

# ── ALL TRANSACTIONS ──────────────────────────────────────────────────────────
@router.get("/transactions")
def get_all_transactions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models.models import Deposit
    txns = []
    # Earnings
    for e in db.query(Earning).filter(Earning.user_id == current_user.id).order_by(Earning.clicked_at.desc()).limit(100).all():
        txns.append({"type": e.type, "amount": e.amount, "direction": "credit", "date": e.clicked_at, "note": f"Ad #{e.ad_id}"})
    # Withdrawals
    for w in db.query(Withdrawal).filter(Withdrawal.user_id == current_user.id).order_by(Withdrawal.created_at.desc()).all():
        txns.append({"type": "withdrawal", "amount": w.amount, "direction": "debit", "date": w.created_at, "note": w.method, "status": w.status})
    # Deposits
    for d in db.query(Deposit).filter(Deposit.user_id == current_user.id).order_by(Deposit.created_at.desc()).all():
        txns.append({"type": "deposit", "amount": d.amount_pkr, "direction": "credit", "date": d.created_at, "note": f"TID: {d.transaction_id}", "status": d.status})
    # Fund transfers sent
    for t in db.query(FundTransfer).filter(FundTransfer.sender_id == current_user.id).order_by(FundTransfer.created_at.desc()).all():
        recv = db.query(User).filter(User.id == t.receiver_id).first()
        txns.append({"type": "transfer_out", "amount": t.amount, "direction": "debit", "date": t.created_at, "note": f"To: {recv.username if recv else '?'}"})
    # Fund transfers received
    for t in db.query(FundTransfer).filter(FundTransfer.receiver_id == current_user.id).order_by(FundTransfer.created_at.desc()).all():
        sndr = db.query(User).filter(User.id == t.sender_id).first()
        txns.append({"type": "transfer_in", "amount": t.amount, "direction": "credit", "date": t.created_at, "note": f"From: {sndr.username if sndr else '?'}"})
    txns.sort(key=lambda x: x["date"], reverse=True)
    return txns[:200]

# ── REFERRALS ─────────────────────────────────────────────────────────────────
@router.get("/referrals")
def get_referrals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    refs = db.query(User).filter(User.referred_by == current_user.id).all()
    total_commission = db.query(func.sum(Earning.amount)).filter(
        Earning.user_id == current_user.id, Earning.type == "referral"
    ).scalar() or 0
    return {
        "referral_code": current_user.referral_code,
        "referral_link": f"{os.getenv('FRONTEND_URL', 'https://ptc-pro-fullstack.vercel.app')}/register?ref={current_user.referral_code}",
        "total_referrals": len(refs),
        "total_commission": round(total_commission, 2),
        "referrals": [{"username": r.username, "joined": r.created_at} for r in refs]
    }

@router.get("/referral-bonus")
def get_referral_bonus(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    bonuses = db.query(Earning).filter(Earning.user_id == current_user.id, Earning.type == "referral").order_by(Earning.clicked_at.desc()).all()
    total = sum(b.amount for b in bonuses)
    return {
        "total_bonus": round(total, 2),
        "count": len(bonuses),
        "bonuses": [{"amount": b.amount, "ad_id": b.ad_id, "date": b.clicked_at} for b in bonuses]
    }

# ── FUND TRANSFER ─────────────────────────────────────────────────────────────
class TransferData(BaseModel):
    receiver_username: str
    amount: float
    note: Optional[str] = ""

@router.post("/transfer")
def fund_transfer(data: TransferData, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if data.amount < 50:
        raise HTTPException(status_code=400, detail="Minimum transfer is Rs. 50")
    if current_user.balance < data.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    if data.receiver_username == current_user.username:
        raise HTTPException(status_code=400, detail="Cannot transfer to yourself")
    receiver = db.query(User).filter(User.username == data.receiver_username).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="User not found")
    current_user.balance -= data.amount
    receiver.balance += data.amount
    db.add(FundTransfer(sender_id=current_user.id, receiver_id=receiver.id, amount=data.amount, note=data.note))
    db.commit()
    return {"message": f"Rs. {data.amount} transferred to {receiver.username}"}

@router.get("/transfers")
def get_transfers(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sent = db.query(FundTransfer).filter(FundTransfer.sender_id == current_user.id).order_by(FundTransfer.created_at.desc()).all()
    received = db.query(FundTransfer).filter(FundTransfer.receiver_id == current_user.id).order_by(FundTransfer.created_at.desc()).all()
    result = []
    for t in sent:
        recv = db.query(User).filter(User.id == t.receiver_id).first()
        result.append({"direction": "sent", "to": recv.username if recv else "?", "amount": t.amount, "note": t.note, "date": t.created_at})
    for t in received:
        sndr = db.query(User).filter(User.id == t.sender_id).first()
        result.append({"direction": "received", "from": sndr.username if sndr else "?", "amount": t.amount, "note": t.note, "date": t.created_at})
    result.sort(key=lambda x: x["date"], reverse=True)
    return result

# ── SUPPORT TICKET ────────────────────────────────────────────────────────────
class TicketCreate(BaseModel):
    subject: str
    message: str

@router.post("/tickets")
def create_ticket(data: TicketCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ticket = SupportTicket(user_id=current_user.id, subject=data.subject, message=data.message)
    db.add(ticket); db.commit()
    return {"message": "Ticket submitted successfully"}

@router.get("/tickets")
def get_tickets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tickets = db.query(SupportTicket).filter(SupportTicket.user_id == current_user.id).order_by(SupportTicket.created_at.desc()).all()
    return [{"id": t.id, "subject": t.subject, "message": t.message, "status": t.status, "reply": t.reply, "created_at": t.created_at} for t in tickets]

# ── PUBLIC SETTINGS ──────────────────────────────────────────────────────────
@router.get("/settings")
def get_public_settings(db: Session = Depends(get_db)):
    rows = db.query(SiteSettings).all()
    return {r.key: r.value for r in rows}

# ── MEMBERSHIP PLANS ──────────────────────────────────────────────────────────
@router.get("/plans")
def get_plans(db: Session = Depends(get_db)):
    return db.query(MembershipPlan).all()

# ── 2FA ───────────────────────────────────────────────────────────────────────
@router.get("/2fa/setup")
def setup_2fa(current_user: User = Depends(get_current_user)):
    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=current_user.email, issuer_name="Smart Grow Chain")
    img = qrcode.make(uri)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    qr_b64 = base64.b64encode(buf.getvalue()).decode()
    return {"secret": secret, "qr_code": f"data:image/png;base64,{qr_b64}"}

class Verify2FA(BaseModel):
    secret: str
    code: str

@router.post("/2fa/enable")
def enable_2fa(data: Verify2FA, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    totp = pyotp.TOTP(data.secret)
    if not totp.verify(data.code):
        raise HTTPException(status_code=400, detail="Invalid 2FA code")
    current_user.two_fa_secret = data.secret
    current_user.two_fa_enabled = True
    db.commit()
    return {"message": "2FA enabled successfully"}

@router.post("/2fa/disable")
def disable_2fa(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.two_fa_secret = None
    current_user.two_fa_enabled = False
    db.commit()
    return {"message": "2FA disabled"}


# ── PLAN PURCHASE ─────────────────────────────────────────────────────────────
UPLOAD_DIR = "uploads/screenshots"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/plan/purchase")
async def purchase_plan(
    plan_id: int = Form(...),
    payment_method: str = Form(...),   # wallet or easypaisa
    sender_name: str = Form(""),
    sender_phone: str = Form(""),
    screenshot: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.query(MembershipPlan).filter(MembershipPlan.id == plan_id, MembershipPlan.is_active == True).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    if plan.price <= 0:
        raise HTTPException(status_code=400, detail="This plan is free")
    if current_user.membership == plan.name:
        raise HTTPException(status_code=400, detail="You already have this plan")

    screenshot_path = None
    if payment_method == "wallet":
        if current_user.balance < plan.price:
            raise HTTPException(status_code=400, detail=f"Insufficient balance. Required: Rs. {plan.price}, Available: Rs. {round(current_user.balance, 2)}")
        current_user.balance -= plan.price
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

    req = PlanPurchaseRequest(
        user_id=current_user.id,
        plan_id=plan.id,
        plan_name=plan.name,
        plan_price=plan.price,
        payment_method=payment_method,
        screenshot_path=screenshot_path,
        sender_name=sender_name or None,
        sender_phone=sender_phone or None,
        status="pending" if payment_method == "easypaisa" else "pending"
    )
    db.add(req)
    db.commit()
    return {"message": "Plan purchase request submitted. Admin will activate your plan shortly."}

@router.get("/plan/my-purchases")
def my_plan_purchases(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reqs = db.query(PlanPurchaseRequest).filter(PlanPurchaseRequest.user_id == current_user.id).order_by(PlanPurchaseRequest.created_at.desc()).all()
    return [{
        "id": r.id, "plan_name": r.plan_name, "plan_price": r.plan_price,
        "payment_method": r.payment_method, "status": r.status,
        "admin_note": r.admin_note, "created_at": r.created_at
    } for r in reqs]


# ── KYC ───────────────────────────────────────────────────────────────────────
@router.get("/kyc/status")
def kyc_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    kyc = db.query(KYCRequest).filter(KYCRequest.user_id == current_user.id).first()
    # free plan expiry check
    settings_row = db.query(SiteSettings).filter(SiteSettings.key == "free_plan_days").first()
    free_days = int(settings_row.value) if settings_row and settings_row.value else 7
    expired = False
    days_left = None
    if current_user.membership == "free":
        if current_user.free_plan_expires_at:
            expired = datetime.utcnow() > current_user.free_plan_expires_at
            delta = current_user.free_plan_expires_at - datetime.utcnow()
            days_left = max(0, delta.days)
        else:
            # set expiry if not set
            expires = datetime.utcnow() + timedelta(days=free_days)
            current_user.free_plan_expires_at = expires
            db.commit()
            days_left = free_days
    return {
        "kyc_status": current_user.kyc_status,
        "kyc": {"full_name": kyc.full_name, "cnic": kyc.cnic, "status": kyc.status, "admin_note": kyc.admin_note, "created_at": kyc.created_at} if kyc else None,
        "free_plan_expired": expired,
        "free_plan_days_left": days_left,
    }

@router.post("/kyc/submit")
async def submit_kyc(
    full_name: str = Form(...),
    cnic: str = Form(...),
    front_photo: UploadFile = File(...),
    selfie_photo: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(KYCRequest).filter(KYCRequest.user_id == current_user.id).first()
    if existing and existing.status == "approved":
        raise HTTPException(status_code=400, detail="KYC already approved")

    def save_file(f: UploadFile):
        ext = os.path.splitext(f.filename)[-1].lower()
        if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
            raise HTTPException(status_code=400, detail="Only JPG/PNG allowed")
        fname = f"{uuid.uuid4().hex}{ext}"
        with open(os.path.join(UPLOAD_DIR, fname), "wb") as out:
            shutil.copyfileobj(f.file, out)
        return fname

    fp = save_file(front_photo)
    sp = save_file(selfie_photo)

    if existing:
        existing.full_name = full_name
        existing.cnic = cnic
        existing.front_photo = fp
        existing.selfie_photo = sp
        existing.status = "pending"
        existing.admin_note = None
    else:
        db.add(KYCRequest(user_id=current_user.id, full_name=full_name, cnic=cnic, front_photo=fp, selfie_photo=sp))

    current_user.kyc_status = "pending"
    db.commit()
    return {"message": "KYC submitted successfully. Admin will verify shortly."}
