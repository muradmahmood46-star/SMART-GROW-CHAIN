from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os
from sqlalchemy import func, Date, cast
from app.database import get_db
from app.models.models import User, Ad, Earning, Withdrawal, ClickLog, EasypaisaAccount, Deposit, AdminEmail, SupportTicket, TicketResponse, MembershipPlan, ReferralSetting, AdBudgetRate, UserAdRequest, SiteSettings, PlanPurchaseRequest, Notification
from app.schemas.schemas import AdCreate, EasypaisaAccountCreate, PlanCreate, PlanUpdate
from app.utils import decode_token
from fastapi.security import OAuth2PasswordBearer
from datetime import date, timedelta
from pydantic import BaseModel
from typing import Optional, List
import shutil, uuid

router = APIRouter(prefix="/admin", tags=["Admin"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_admin_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = decode_token(token)
        if not payload.get("is_admin"):
            raise HTTPException(status_code=403, detail="Admin access required")
        return payload  # return payload, no DB lookup needed for hardcoded admin
    except HTTPException:
        raise
    except:
        raise HTTPException(status_code=403, detail="Admin access required")

class BalanceAdjust(BaseModel):
    amount: float
    note: Optional[str] = ""

class AdUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    earning_amount: Optional[float] = None
    timer_seconds: Optional[int] = None
    daily_limit: Optional[int] = None

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    today = date.today()
    week_ago = today - timedelta(days=7)

    total_earnings = db.query(func.sum(Earning.amount)).filter(Earning.type == "click").scalar() or 0
    today_clicks = db.query(Earning).filter(
        cast(Earning.clicked_at, Date) == today, Earning.type == "click"
    ).count()
    today_earnings = db.query(func.sum(Earning.amount)).filter(
        cast(Earning.clicked_at, Date) == today, Earning.type == "click"
    ).scalar() or 0

    # Daily clicks for last 7 days
    daily_data = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        clicks = db.query(Earning).filter(
            cast(Earning.clicked_at, Date) == d, Earning.type == "click"
        ).count()
        daily_data.append({"date": str(d), "clicks": clicks})

    return {
        "total_users": db.query(User).filter(User.is_admin == False).count(),
        "active_users": db.query(User).filter(User.is_active == True, User.is_admin == False).count(),
        "total_ads": db.query(Ad).count(),
        "active_ads": db.query(Ad).filter(Ad.is_active == True).count(),
        "total_clicks": db.query(Earning).filter(Earning.type == "click").count(),
        "today_clicks": today_clicks,
        "today_earnings": round(today_earnings, 4),
        "total_earnings": round(total_earnings, 4),
        "pending_withdrawals": db.query(Withdrawal).filter(Withdrawal.status == "pending").count(),
        "total_withdrawal_amount": round(db.query(func.sum(Withdrawal.amount)).filter(Withdrawal.status == "approved").scalar() or 0, 2),
        "daily_data": daily_data
    }

@router.get("/users")
def get_all_users(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    users = db.query(User).filter(User.is_admin == False).order_by(User.created_at.desc()).all()
    return [{
        "id": u.id, "username": u.username, "email": u.email,
        "balance": u.balance, "total_earned": u.total_earned,
        "membership": u.membership, "is_active": u.is_active,
        "referral_code": u.referral_code, "created_at": u.created_at
    } for u in users]

@router.put("/users/{user_id}/toggle")
def toggle_user(user_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User {'activated' if user.is_active else 'deactivated'}"}

@router.put("/users/{user_id}/balance")
def adjust_balance(user_id: int, data: BalanceAdjust, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    amount = abs(data.amount)
    user.balance -= amount
    db.commit()
    return {"message": f"Balance deducted by Rs. {amount}", "new_balance": user.balance}

@router.get("/ads")
def get_all_ads(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    ads = db.query(Ad).order_by(Ad.created_at.desc()).all()
    result = []
    for ad in ads:
        sponsored = db.query(UserAdRequest).filter(
            UserAdRequest.url == ad.url,
            UserAdRequest.title == ad.title,
            UserAdRequest.status == "approved"
        ).first()
        username = "Admin"
        if sponsored and sponsored.user:
            username = sponsored.user.username
            
        result.append({
            "id": ad.id,
            "title": ad.title,
            "url": ad.url,
            "description": ad.description,
            "earning_amount": ad.earning_amount,
            "timer_seconds": ad.timer_seconds,
            "daily_limit": ad.daily_limit,
            "total_clicks": ad.total_clicks,
            "is_active": ad.is_active,
            "created_at": ad.created_at,
            "username": username,
            "is_sponsored": sponsored is not None
        })
    return result

@router.post("/ads")
def create_ad(data: AdCreate, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    ad = Ad(**data.dict())
    db.add(ad)
    db.commit()
    db.refresh(ad)
    return ad

@router.put("/ads/{ad_id}")
def update_ad(ad_id: int, data: AdUpdate, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    ad = db.query(Ad).filter(Ad.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    for k, v in data.dict(exclude_none=True).items():
        setattr(ad, k, v)
    db.commit()
    return ad

@router.put("/ads/{ad_id}/toggle")
def toggle_ad(ad_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    ad = db.query(Ad).filter(Ad.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    ad.is_active = not ad.is_active
    db.commit()
    return {"message": f"Ad {'activated' if ad.is_active else 'deactivated'}"}

@router.delete("/ads/{ad_id}")
def delete_ad(ad_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    ad = db.query(Ad).filter(Ad.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    db.delete(ad)
    db.commit()
    return {"message": "Ad deleted"}

@router.get("/withdrawals")
def get_withdrawals(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    ws = db.query(Withdrawal).order_by(Withdrawal.created_at.desc()).all()
    result = []
    for w in ws:
        user = db.query(User).filter(User.id == w.user_id).first()
        result.append({
            "id": w.id, "user_id": w.user_id,
            "username": user.username if user else "unknown",
            "user_balance": user.balance if user else 0,
            "user_membership": user.membership if user else "free",
            "amount": w.amount, "method": w.method,
            "wallet_address": w.wallet_address, "status": w.status,
            "admin_note": w.admin_note,
            "payout_screenshot_url": f"{os.getenv('BACKEND_URL', 'https://muradmahmood-smart-grow-chain.hf.space')}/uploads/screenshots/{w.payout_screenshot_path}" if w.payout_screenshot_path else None,
            "created_at": w.created_at
        })
    return result

@router.put("/withdrawals/{w_id}/approve")
def approve_withdrawal(w_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    w = db.query(Withdrawal).filter(Withdrawal.id == w_id).first()
    if not w:
        raise HTTPException(status_code=404, detail="Not found")
    w.status = "approved"
    db.commit()
    return {"message": "Withdrawal approved"}

@router.put("/withdrawals/{w_id}/sent")
async def mark_withdrawal_sent(w_id: int, screenshot: UploadFile = File(...), db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    w = db.query(Withdrawal).filter(Withdrawal.id == w_id).first()
    if not w:
        raise HTTPException(status_code=404, detail="Not found")
    ext = os.path.splitext(screenshot.filename or "")[-1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(status_code=400, detail="Only JPG/PNG images allowed")
    os.makedirs("uploads/screenshots", exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    with open(os.path.join("uploads/screenshots", filename), "wb") as f:
        shutil.copyfileobj(screenshot.file, f)
    w.payout_screenshot_path = filename
    w.status = "sent"
    db.commit()
    return {"message": "Withdrawal marked as sent"}

@router.put("/withdrawals/{w_id}/reject")
def reject_withdrawal(w_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    w = db.query(Withdrawal).filter(Withdrawal.id == w_id).first()
    if not w:
        raise HTTPException(status_code=404, detail="Not found")
    user = db.query(User).filter(User.id == w.user_id).first()
    if user:
        user.balance += w.amount
    w.status = "rejected"
    db.commit()
    return {"message": "Withdrawal rejected and balance refunded"}

@router.get("/click-logs")
def get_click_logs(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    logs = db.query(ClickLog).order_by(ClickLog.created_at.desc()).limit(200).all()
    return [{
        "id": l.id, "user_id": l.user_id, "ad_id": l.ad_id,
        "ip_address": l.ip_address, "timer_completed": l.timer_completed,
        "created_at": l.created_at
    } for l in logs]


# ── EASYPAISA ACCOUNTS ──────────────────────────────────────────
@router.get("/easypaisa")
def get_easypaisa(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    accs = db.query(EasypaisaAccount).order_by(EasypaisaAccount.created_at.desc()).all()
    return [{
        "id": a.id, "account_title": a.account_title,
        "account_number": a.account_number,
        "phone_number": a.phone_number or a.account_number,
        "method_type": a.method_type or "easypaisa",
        "deposit_message": a.deposit_message or "",
        "bank_name": a.bank_name or "",
        "is_active": a.is_active,
        "in_use": a.in_use_by is not None,
        "created_at": a.created_at
    } for a in accs]

@router.post("/easypaisa")
def add_easypaisa(data: EasypaisaAccountCreate, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    count = db.query(EasypaisaAccount).count()
    if count >= 5:
        raise HTTPException(status_code=400, detail="Maximum 5 accounts allowed")
    acc = EasypaisaAccount(
        account_title=data.account_title,
        account_number=data.account_number,
        phone_number=data.phone_number or data.account_number,
        method_type=data.method_type or "easypaisa",
        deposit_message=data.deposit_message or None,
        bank_name=data.bank_name or None
    )
    db.add(acc)
    db.commit()
    db.refresh(acc)
    return acc

@router.put("/easypaisa/{acc_id}")
def update_easypaisa(acc_id: int, data: EasypaisaAccountCreate, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    acc = db.query(EasypaisaAccount).filter(EasypaisaAccount.id == acc_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    acc.account_title = data.account_title
    acc.account_number = data.account_number
    acc.phone_number = data.phone_number or data.account_number
    acc.method_type = data.method_type or "easypaisa"
    acc.deposit_message = data.deposit_message or None
    acc.bank_name = data.bank_name or None
    db.commit()
    return acc

@router.put("/easypaisa/{acc_id}/toggle")
def toggle_easypaisa(acc_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    acc = db.query(EasypaisaAccount).filter(EasypaisaAccount.id == acc_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    acc.is_active = not acc.is_active
    db.commit()
    return {"message": "Updated"}

@router.delete("/easypaisa/{acc_id}")
def delete_easypaisa(acc_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    acc = db.query(EasypaisaAccount).filter(EasypaisaAccount.id == acc_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    
    try:
        from sqlalchemy import text
        # Make sure the column is nullable just in case it was created as NOT NULL
        try:
            db.execute(text("ALTER TABLE deposits ALTER COLUMN easypaisa_account_id DROP NOT NULL"))
            db.commit()
        except Exception:
            db.rollback()
            pass

        # Update using raw SQL to avoid any ORM dictionary key issues
        db.execute(
            text("UPDATE deposits SET easypaisa_account_id = NULL WHERE easypaisa_account_id = :acc_id"),
            {"acc_id": acc_id}
        )
        db.delete(acc)
        db.commit()
        return {"message": "Deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ── DEPOSITS ────────────────────────────────────────────────────
@router.get("/deposits")
def get_deposits(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    deposits = db.query(Deposit).order_by(Deposit.created_at.desc()).all()
    result = []
    for d in deposits:
        user = db.query(User).filter(User.id == d.user_id).first()
        acc = db.query(EasypaisaAccount).filter(EasypaisaAccount.id == d.easypaisa_account_id).first()
        result.append({
            "id": d.id,
            "username": user.username if user else "unknown",
            "amount_pkr": d.amount_pkr,
            "sender_name": d.sender_name or "-",
            "transaction_id": d.transaction_id,
            "easypaisa_number": acc.account_number if acc else "-",
            "screenshot_url": f"{os.getenv('BACKEND_URL', 'https://muradmahmood-smart-grow-chain.hf.space')}/uploads/screenshots/{d.screenshot_path}" if d.screenshot_path else None,
            "status": d.status,
            "admin_note": d.admin_note,
            "created_at": d.created_at
        })
    return result

@router.put("/deposits/{dep_id}/confirm")
def confirm_deposit(dep_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    dep = db.query(Deposit).filter(Deposit.id == dep_id).first()
    if not dep:
        raise HTTPException(status_code=404, detail="Not found")
    if dep.status != "pending":
        raise HTTPException(status_code=400, detail="Already processed")
    user = db.query(User).filter(User.id == dep.user_id).first()
    if user:
        user.balance += dep.amount_pkr
    dep.status = "confirmed"
    db.commit()
    return {"message": f"Deposit confirmed. Rs. {dep.amount_pkr} added to user balance"}

@router.put("/deposits/{dep_id}/reject")
def reject_deposit(dep_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    dep = db.query(Deposit).filter(Deposit.id == dep_id).first()
    if not dep:
        raise HTTPException(status_code=404, detail="Not found")
    dep.status = "rejected"
    db.commit()
    return {"message": "Deposit rejected"}


# ── ADMIN EMAILS ──────────────────────────────────────────────────
@router.get("/emails")
def get_admin_emails(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    return db.query(AdminEmail).all()

@router.post("/emails")
def add_admin_email(email: str, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    count = db.query(AdminEmail).count()
    if count >= 5:
        raise HTTPException(status_code=400, detail="Maximum 5 admin emails allowed")
    existing = db.query(AdminEmail).filter(AdminEmail.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    e = AdminEmail(email=email, is_primary=(count == 0))
    db.add(e)
    db.commit()
    return e

@router.delete("/emails/{email_id}")
def delete_admin_email(email_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    e = db.query(AdminEmail).filter(AdminEmail.id == email_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Not found")
    if e.is_primary:
        raise HTTPException(status_code=400, detail="Cannot delete primary email")
    db.delete(e)
    db.commit()
    return {"message": "Email deleted"}


# ── SUPPORT TICKETS ───────────────────────────────────────────────────
@router.get("/tickets")
def get_all_tickets(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    from app.models.models import SupportTicket
    tickets = db.query(SupportTicket).order_by(SupportTicket.created_at.desc()).all()
    result = []
    for t in tickets:
        user = db.query(User).filter(User.id == t.user_id).first()
        from app.models.models import KYCRequest
        kyc = db.query(KYCRequest).filter(KYCRequest.user_id == t.user_id).first()
        kyc_status = kyc.status if kyc else "unverified"
        responses = db.query(TicketResponse).filter(TicketResponse.ticket_id == t.id).order_by(TicketResponse.created_at).all()
        result.append({"id": t.id, "username": user.username if user else "?", "kyc_status": kyc_status, "subject": t.subject, "message": t.message, "status": t.status, "reply": t.reply, "created_at": t.created_at, "user_responses": [{"message": r.message, "created_at": r.created_at} for r in responses]})
    return result

class TicketReply(BaseModel):
    reply: str

@router.put("/tickets/{tid}/reply")
def reply_ticket(tid: int, data: TicketReply, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    from app.models.models import SupportTicket
    t = db.query(SupportTicket).filter(SupportTicket.id == tid).first()
    if not t:
        raise HTTPException(status_code=404, detail="Not found")
    t.reply = data.reply
    t.status = "replied"
    from app.models.models import Notification
    new_notif = Notification(user_id=t.user_id, title="Support Ticket Replied", message=f"Admin Response on '{t.subject}': {data.reply}")
    db.add(new_notif)
    db.commit()
    return {"message": "Reply sent"}

@router.put("/tickets/{tid}/close")
def close_ticket(tid: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    from app.models.models import SupportTicket
    t = db.query(SupportTicket).filter(SupportTicket.id == tid).first()
    if not t:
        raise HTTPException(status_code=404, detail="Not found")
    t.status = "closed"
    db.commit()
    return {"message": "Ticket closed"}

@router.put("/tickets/{tid}/read")
def admin_read_ticket(tid: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    from app.models.models import SupportTicket
    t = db.query(SupportTicket).filter(SupportTicket.id == tid).first()
    if not t:
        raise HTTPException(status_code=404, detail="Not found")
    if t.status == "open":
        t.status = "viewed"
        db.commit()
    return {"message": "Ticket marked as viewed"}


# ── MEMBERSHIP PLANS ────────────────────────────────────────────────
@router.get("/plans")
def get_plans(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    return db.query(MembershipPlan).order_by(MembershipPlan.sort_order, MembershipPlan.price).all()

@router.post("/plans")
def create_plan(data: PlanCreate, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    plan = MembershipPlan(**data.dict())
    db.add(plan); db.commit(); db.refresh(plan)
    return plan

@router.put("/plans/{plan_id}")
def update_plan(plan_id: int, data: PlanUpdate, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    plan = db.query(MembershipPlan).filter(MembershipPlan.id == plan_id).first()
    if not plan: raise HTTPException(status_code=404, detail="Plan not found")
    for k, v in data.dict(exclude_none=True).items():
        setattr(plan, k, v)
    db.commit(); return plan

@router.delete("/plans/{plan_id}")
def delete_plan(plan_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    plan = db.query(MembershipPlan).filter(MembershipPlan.id == plan_id).first()
    if not plan: raise HTTPException(status_code=404, detail="Plan not found")
    # Disconnect any purchase requests to prevent foreign key IntegrityError
    db.query(PlanPurchaseRequest).filter(PlanPurchaseRequest.plan_id == plan_id).update({"plan_id": None})
    db.delete(plan); db.commit()
    return {"message": "Plan deleted"}

@router.put("/plans/{plan_id}/toggle-active")
def toggle_plan_active(plan_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    plan = db.query(MembershipPlan).filter(MembershipPlan.id == plan_id).first()
    if not plan: raise HTTPException(status_code=404, detail="Plan not found")
    plan.is_active = not plan.is_active
    db.commit()
    return {"message": "Status updated", "is_active": plan.is_active}


# ── FUND TRANSFERS (view all) ──────────────────────────────────────────
@router.get("/fund-transfers")
def get_fund_transfers(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    from app.models.models import FundTransfer
    transfers = db.query(FundTransfer).order_by(FundTransfer.created_at.desc()).all()
    result = []
    for t in transfers:
        sender = db.query(User).filter(User.id == t.sender_id).first()
        receiver = db.query(User).filter(User.id == t.receiver_id).first()
        result.append({
            "id": t.id, 
            "sender": sender.username if sender else "?", 
            "sender_email": sender.email if sender else "?",
            "receiver": receiver.username if receiver else "?", 
            "receiver_email": receiver.email if receiver else "?",
            "amount": t.amount, 
            "note": t.note, 
            "created_at": t.created_at
        })
    return result


# ── ADMIN EMAIL EDIT ────────────────────────────────────────────────
class EmailUpdate(BaseModel):
    email: str

@router.put("/emails/{email_id}")
def update_admin_email(email_id: int, data: EmailUpdate, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    e = db.query(AdminEmail).filter(AdminEmail.id == email_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Not found")
    existing = db.query(AdminEmail).filter(AdminEmail.email == data.email, AdminEmail.id != email_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    e.email = data.email
    db.commit()
    return e

@router.delete("/emails/{email_id}")
def delete_admin_email(email_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    e = db.query(AdminEmail).filter(AdminEmail.id == email_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Not found")
    if e.is_primary:
        # promote next one to primary
        nxt = db.query(AdminEmail).filter(AdminEmail.id != email_id).first()
        if nxt:
            nxt.is_primary = True
        else:
            raise HTTPException(status_code=400, detail="Cannot delete the only email")
    db.delete(e)
    db.commit()
    return {"message": "Email deleted"}


# ── REFERRAL SETTINGS ───────────────────────────────────────────────
BONUS_TYPES = ["plan_purchase", "vip_plan", "deposit", "ad_view"]
DEFAULT_LEVELS = {
    "plan_purchase": [(1,1),(2,2),(3,3),(4,4)],
    "vip_plan":      [(1,15),(2,10),(3,5)],
    "deposit":       [(1,1),(2,2),(3,3),(4,4)],
    "ad_view":       [(1,1),(2,2),(3,3),(4,4)],
}

def ensure_defaults(db: Session):
    for bt, levels in DEFAULT_LEVELS.items():
        for lvl, pct in levels:
            exists = db.query(ReferralSetting).filter(
                ReferralSetting.bonus_type == bt, ReferralSetting.level == lvl
            ).first()
            if not exists:
                db.add(ReferralSetting(bonus_type=bt, level=lvl, percent=pct, is_active=True))
    db.commit()

@router.get("/referral-settings")
def get_referral_settings(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    ensure_defaults(db)
    rows = db.query(ReferralSetting).order_by(ReferralSetting.bonus_type, ReferralSetting.level).all()
    result = {}
    for bt in BONUS_TYPES:
        type_rows = [r for r in rows if r.bonus_type == bt]
        # is_active for the whole type = any row active
        result[bt] = {
            "is_active": any(r.is_active for r in type_rows),
            "levels": [{"id": r.id, "level": r.level, "percent": r.percent, "details": r.details or "", "is_active": r.is_active} for r in type_rows]
        }
    return result

class RefSettingToggle(BaseModel):
    is_active: bool

class RefSettingUpdate(BaseModel):
    percent: Optional[float] = None
    details: Optional[str] = ""

def limit_words(text: Optional[str], max_words: int = 20) -> str:
    words = (text or "").strip().split()
    return " ".join(words[:max_words])

@router.put("/referral-settings/toggle/{bonus_type}")
def toggle_bonus_type(bonus_type: str, data: RefSettingToggle, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    rows = db.query(ReferralSetting).filter(ReferralSetting.bonus_type == bonus_type).all()
    for r in rows:
        r.is_active = data.is_active
    db.commit()
    return {"message": "Updated"}

@router.put("/referral-settings/{setting_id}")
def update_referral_level(setting_id: int, data: RefSettingUpdate, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    r = db.query(ReferralSetting).filter(ReferralSetting.id == setting_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Not found")
    if data.percent is not None:
        r.percent = data.percent
    if data.details is not None:
        r.details = limit_words(data.details)
    db.commit()
    return r

@router.post("/referral-settings/{bonus_type}/add-level")
def add_referral_level(bonus_type: str, data: RefSettingUpdate, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    max_lvl = db.query(func.max(ReferralSetting.level)).filter(ReferralSetting.bonus_type == bonus_type).scalar() or 0
    r = ReferralSetting(
        bonus_type=bonus_type,
        level=max_lvl+1,
        percent=data.percent or 0,
        details=limit_words(data.details),
        is_active=True
    )
    db.add(r); db.commit(); db.refresh(r)
    return r

@router.delete("/referral-settings/{setting_id}")
def delete_referral_level(setting_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    r = db.query(ReferralSetting).filter(ReferralSetting.id == setting_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(r); db.commit()
    return {"message": "Deleted"}


# ── SITE SETTINGS ─────────────────────────────────────────────────────
class SettingUpdate(BaseModel):
    value: str

@router.get("/settings")
def get_settings(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    rows = db.query(SiteSettings).all()
    return {r.key: r.value for r in rows}

@router.put("/settings/{key}")
def update_setting(key: str, data: SettingUpdate, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    s = db.query(SiteSettings).filter(SiteSettings.key == key).first()
    if s:
        s.value = data.value
    else:
        db.add(SiteSettings(key=key, value=data.value))
    db.commit()
    return {"message": "Updated", "key": key, "value": data.value}


# ── AD BUDGET RATE ──────────────────────────────────────────────────
class BudgetRateUpdate(BaseModel):
    rate_pkr: float
    welcome_message: Optional[str] = ""

@router.get("/ad-budget-rate")
def get_ad_budget_rate(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    rate = db.query(AdBudgetRate).first()
    return {"rate_pkr": rate.rate_pkr if rate else 1.0, "welcome_message": rate.welcome_message if rate else ""}

@router.put("/ad-budget-rate")
def update_ad_budget_rate(data: BudgetRateUpdate, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    rate = db.query(AdBudgetRate).first()
    if rate:
        rate.rate_pkr = data.rate_pkr
        rate.welcome_message = data.welcome_message
    else:
        db.add(AdBudgetRate(rate_pkr=data.rate_pkr, welcome_message=data.welcome_message))
    db.commit()
    return {"message": "Updated", "rate_pkr": data.rate_pkr}


# ── USER AD REQUESTS ────────────────────────────────────────────────
@router.get("/ad-requests")
@router.get("/user-ad-requests")
def get_user_ad_requests(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    reqs = db.query(UserAdRequest).order_by(UserAdRequest.created_at.desc()).all()
    import os
    result = []
    for r in reqs:
        user = db.query(User).filter(User.id == r.user_id).first()
        result.append({
            "id": r.id,
            "username": user.username if user else "?",
            "email": user.email if user else "-",
            "title": r.title, "url": r.url,
            "members_needed": r.members_needed,
            "rate_pkr": r.rate_pkr,
            "total_cost": r.total_cost,
            "payment_method": r.payment_method,
            "sender_name": r.sender_name or "-",
            "transaction_id": r.transaction_id or "-",
            "screenshot_url": f"{os.getenv('BACKEND_URL', 'https://muradmahmood-smart-grow-chain.hf.space')}/uploads/screenshots/{r.screenshot_path}" if r.screenshot_path else None,
            "status": r.status,
            "admin_note": r.admin_note,
            "created_at": r.created_at
        })
    return result

class AdRequestAction(BaseModel):
    admin_note: Optional[str] = ""

@router.put("/ad-requests/{req_id}/approve")
@router.put("/user-ad-requests/{req_id}/approve")
def approve_ad_request(req_id: int, data: AdRequestAction, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    req = db.query(UserAdRequest).filter(UserAdRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Not found")
    req.status = "approved"
    req.admin_note = data.admin_note
    # Auto-create Ad so all users can see it
    existing = db.query(Ad).filter(Ad.url == req.url, Ad.is_active == True).first()
    if not existing:
        db.add(Ad(
            title=req.title,
            url=req.url,
            description=f"Sponsored campaign",
            earning_amount=0.5,
            timer_seconds=15,
            daily_limit=req.members_needed,
            is_active=True
        ))
    db.commit()
    return {"message": "Ad request approved and ad published"}

@router.put("/ad-requests/{req_id}/reject")
@router.put("/user-ad-requests/{req_id}/reject")
def reject_ad_request(req_id: int, data: AdRequestAction, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    req = db.query(UserAdRequest).filter(UserAdRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Not found")
    if req.payment_method == "wallet" and req.status == "pending":
        user = db.query(User).filter(User.id == req.user_id).first()
        if user:
            user.balance += req.total_cost
    # Blocking an already-live wallet campaign must also remove it from users' ad list.
    db.query(Ad).filter(Ad.url == req.url, Ad.is_active == True).update(
        {Ad.is_active: False}, synchronize_session=False
    )
    req.status = "rejected"
    req.admin_note = data.admin_note
    db.commit()
    return {"message": "Ad request rejected and balance refunded"}


# ── CAMPAIGN VIEWERS ────────────────────────────────────────────────
@router.get("/campaign-viewers/{req_id}")
def get_campaign_viewers(req_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    req = db.query(UserAdRequest).filter(UserAdRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Not found")
    earnings = db.query(Earning).filter(Earning.type == "click").join(
        Ad, Earning.ad_id == Ad.id
    ).filter(Ad.url == req.url).order_by(Earning.clicked_at.desc()).all()
    result = []
    for e in earnings:
        user = db.query(User).filter(User.id == e.user_id).first()
        if not user:
            continue
        from app.models.models import KYCRequest
        kyc = db.query(KYCRequest).filter(KYCRequest.user_id == user.id).order_by(KYCRequest.created_at.desc()).first()
        result.append({
            "username": user.username,
            "email": user.email,
            "membership": user.membership,
            "balance": round(user.balance, 2),
            "total_earned": round(user.total_earned, 2),
            "kyc_status": user.kyc_status or "none",
            "kyc_name": kyc.full_name if kyc else "-",
            "kyc_phone": kyc.phone if kyc else "-",
            "plan_expires_at": user.plan_expires_at,
            "is_active": user.is_active,
            "joined": user.created_at,
            "viewed_at": e.clicked_at,
            "earned_amount": round(e.amount, 2),
        })
    return result


# ── AD VIEW LOG ─────────────────────────────────────────────────────
@router.get("/ad-view-log")
def get_ad_view_log(search: Optional[str] = None, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    q = db.query(Earning).filter(Earning.type == "click").order_by(Earning.clicked_at.desc())
    earnings = q.limit(500).all()
    result = []
    for i, e in enumerate(earnings):
        user = db.query(User).filter(User.id == e.user_id).first()
        ad   = db.query(Ad).filter(Ad.id == e.ad_id).first()
        if search and user and search.lower() not in user.username.lower():
            continue
        result.append({
            "sl": i + 1,
            "username": user.username if user else "?",
            "ad_title": ad.title if ad else "?",
            "ad_url": ad.url if ad else "?",
            "amount": e.amount,
            "clicked_at": e.clicked_at
        })
    return result


# ── REFERRAL USERS (admin view) ──────────────────────────────────────
@router.get("/referrals")
def get_all_referrals(search: Optional[str] = None, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    q = db.query(User).filter(User.is_admin == False)
    if search:
        q = q.filter(User.username.ilike(f"%{search}%"))
    users = q.order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        refs = db.query(User).filter(User.referred_by == u.id).all()
        commission = db.query(func.sum(Earning.amount)).filter(
            Earning.user_id == u.id, Earning.type == "referral"
        ).scalar() or 0
        result.append({
            "id": u.id, "username": u.username, "email": u.email,
            "membership": u.membership, "balance": u.balance,
            "referral_code": u.referral_code,
            "total_referrals": len(refs),
            "referral_commission_earned": round(commission, 2),
            "referred_by": db.query(User.username).filter(User.id == u.referred_by).scalar() if u.referred_by else None,
            "created_at": u.created_at,
            "referrals": [{"username": r.username, "membership": r.membership, "joined": r.created_at} for r in refs]
        })
    return result


# ── PLAN PURCHASE REQUESTS ──────────────────────────────────────────
@router.get("/plan-purchases")
def get_plan_purchases(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    reqs = db.query(PlanPurchaseRequest).order_by(PlanPurchaseRequest.created_at.desc()).all()
    result = []
    for r in reqs:
        user = db.query(User).filter(User.id == r.user_id).first()
        result.append({
            "id": r.id,
            "username": user.username if user else "?",
            "plan_name": r.plan_name,
            "plan_price": r.plan_price,
            "payment_method": r.payment_method,
            "sender_name": r.sender_name,
            "sender_phone": r.sender_phone,
            "screenshot_url": f"{os.getenv('BACKEND_URL', 'https://muradmahmood-smart-grow-chain.hf.space')}/uploads/screenshots/{r.screenshot_path}" if r.screenshot_path else None,
            "status": r.status,
            "admin_note": r.admin_note,
            "created_at": r.created_at
        })
    return result

class PlanPurchaseAction(BaseModel):
    admin_note: Optional[str] = ""

@router.put("/plan-purchases/{req_id}/approve")
def approve_plan_purchase(req_id: int, data: PlanPurchaseAction, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    req = db.query(PlanPurchaseRequest).filter(PlanPurchaseRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Not found")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail="Already processed")
    user = db.query(User).filter(User.id == req.user_id).first()
    if user:
        user.membership = req.plan_name
        from datetime import datetime
        plan = db.query(MembershipPlan).filter(MembershipPlan.name == req.plan_name).first()
        days = plan.period_days if plan else 30
        user.plan_expires_at = datetime.utcnow() + __import__('datetime').timedelta(days=days)
        # notify user
        db.add(Notification(user_id=user.id, title="Plan Activated ✅", message=f"Your {req.plan_name} plan has been activated successfully."))
    req.status = "approved"
    req.admin_note = data.admin_note
    db.commit()
    return {"message": "Plan activated for user"}

@router.put("/plan-purchases/{req_id}/reject")
def reject_plan_purchase(req_id: int, data: PlanPurchaseAction, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    req = db.query(PlanPurchaseRequest).filter(PlanPurchaseRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Not found")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail="Already processed")
    # Refund wallet payment
    if req.payment_method == "wallet":
        user = db.query(User).filter(User.id == req.user_id).first()
        if user:
            user.balance += req.plan_price
    req.status = "rejected"
    req.admin_note = data.admin_note
    db.commit()
    return {"message": "Plan purchase rejected and balance refunded"}


# ── KYC MANAGEMENT ─────────────────────────────────────────────────────────────
@router.get("/kyc")
def get_all_kyc(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    from app.models.models import KYCRequest
    kycs = db.query(KYCRequest).order_by(KYCRequest.created_at.desc()).all()
    result = []
    for k in kycs:
        user = db.query(User).filter(User.id == k.user_id).first()
        result.append({
            "id": k.id, "user_id": k.user_id,
            "username": user.username if user else "?",
            "full_name": k.full_name, "phone": k.phone or k.cnic, "cnic": k.cnic,
            "front_photo_url": f"{os.getenv('BACKEND_URL','https://muradmahmood-smart-grow-chain.hf.space')}/uploads/screenshots/{k.front_photo}" if k.front_photo else None,
            "selfie_photo_url": f"{os.getenv('BACKEND_URL','https://muradmahmood-smart-grow-chain.hf.space')}/uploads/screenshots/{k.selfie_photo}" if k.selfie_photo else None,
            "status": k.status, "admin_note": k.admin_note, "created_at": k.created_at, "is_seen": getattr(k, 'is_seen', False)
        })
    return result

@router.post("/kyc/mark-seen")
def mark_kyc_as_seen(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    from app.models.models import KYCRequest
    db.query(KYCRequest).filter(KYCRequest.status == "pending", KYCRequest.is_seen == False).update({"is_seen": True})
    db.commit()
    return {"message": "Marked as seen"}

class KYCAction(BaseModel):
    admin_note: Optional[str] = ""

@router.put("/kyc/{kyc_id}/approve")
def approve_kyc(kyc_id: int, data: KYCAction, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    from app.models.models import KYCRequest
    k = db.query(KYCRequest).filter(KYCRequest.id == kyc_id).first()
    if not k: raise HTTPException(status_code=404, detail="Not found")
    k.status = "approved"
    k.admin_note = data.admin_note
    user = db.query(User).filter(User.id == k.user_id).first()
    if user: user.kyc_status = "approved"
    db.commit()
    return {"message": "KYC approved"}

@router.put("/kyc/{kyc_id}/reject")
def reject_kyc(kyc_id: int, data: KYCAction, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    from app.models.models import KYCRequest
    k = db.query(KYCRequest).filter(KYCRequest.id == kyc_id).first()
    if not k: raise HTTPException(status_code=404, detail="Not found")
    k.status = "rejected"
    k.admin_note = data.admin_note
    user = db.query(User).filter(User.id == k.user_id).first()
    if user: user.kyc_status = "rejected"
    db.commit()
    return {"message": "KYC rejected"}

# ── FREE PLAN DAYS SETTING (in ad-requests tab) ────────────────────────────────
class FreePlanDays(BaseModel):
    days: int

@router.get("/free-plan-days")
def get_free_plan_days(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    s = db.query(SiteSettings).filter(SiteSettings.key == "free_plan_days").first()
    return {"days": int(s.value) if s and s.value else 7}

@router.put("/free-plan-days")
def set_free_plan_days(data: FreePlanDays, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    s = db.query(SiteSettings).filter(SiteSettings.key == "free_plan_days").first()
    if s: s.value = str(data.days)
    else: db.add(SiteSettings(key="free_plan_days", value=str(data.days)))
    db.commit()
    return {"message": "Updated", "days": data.days}


# ── WITHDRAW TOGGLE SETTINGS ──────────────────────────────────────────
from datetime import datetime

class WithdrawToggle(BaseModel):
    enabled: bool

class WithdrawDuration(BaseModel):
    hours: int  # 1, 2, or 3

class WithdrawSchedule(BaseModel):
    time_pkt: str  # e.g. "19:00", "20:00", "21:00"

def _set_setting(db: Session, key: str, value: str):
    s = db.query(SiteSettings).filter(SiteSettings.key == key).first()
    if s: s.value = value
    else: db.add(SiteSettings(key=key, value=value))
    db.commit()

@router.get("/withdraw-settings")
def get_withdraw_settings(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    rows = {r.key: r.value for r in db.query(SiteSettings).filter(
        SiteSettings.key.in_(["withdraw_enabled", "withdraw_until", "withdraw_schedule_time", "withdraw_closed_message"])
    ).all()}
    enabled = rows.get("withdraw_enabled", "true") == "true"
    until_str = rows.get("withdraw_until", "")
    # auto-expire duration
    if until_str:
        try:
            until_dt = datetime.fromisoformat(until_str)
            if datetime.utcnow() > until_dt:
                enabled = False
                _set_setting(db, "withdraw_enabled", "false")
                _set_setting(db, "withdraw_until", "")
                until_str = ""
        except: pass
    return {
        "withdraw_enabled": enabled,
        "withdraw_until": until_str,
        "withdraw_schedule_time": rows.get("withdraw_schedule_time", ""),
        "withdraw_closed_message": rows.get("withdraw_closed_message", "")
    }

@router.put("/withdraw-settings/toggle")
def toggle_withdraw(data: WithdrawToggle, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    _set_setting(db, "withdraw_enabled", "true" if data.enabled else "false")
    _set_setting(db, "withdraw_until", "")  # clear duration when manually toggled
    return {"message": "Updated", "withdraw_enabled": data.enabled}

@router.put("/withdraw-settings/duration")
def set_withdraw_duration(data: WithdrawDuration, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    until = datetime.utcnow() + timedelta(hours=data.hours)
    _set_setting(db, "withdraw_enabled", "true")
    _set_setting(db, "withdraw_until", until.isoformat())
    return {"message": f"Withdraw enabled for {data.hours} hour(s)", "withdraw_until": until.isoformat()}

@router.put("/withdraw-settings/schedule")
def set_withdraw_schedule(data: WithdrawSchedule, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    _set_setting(db, "withdraw_schedule_time", data.time_pkt)
    return {"message": f"Withdraw scheduled at {data.time_pkt} PKT daily"}


# ── ADVERTISER MANAGEMENT (NEW ISOLATED MODULE) ───────────────────────────
@router.get("/advertiser-management")
def get_advertiser_management(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    """Return all users who have submitted at least one ad request, with per-ad tracking."""
    advertisers = db.query(User).join(
        UserAdRequest, UserAdRequest.user_id == User.id
    ).filter(User.is_admin == False).distinct().all()

    result = []
    for u in advertisers:
        reqs = db.query(UserAdRequest).filter(UserAdRequest.user_id == u.id).order_by(UserAdRequest.created_at.desc()).all()
        ads_data = []
        for r in reqs:
            completed = r.members_reached or 0
            remaining = max((r.members_needed or 0) - completed, 0)
            pct = round((completed / r.members_needed * 100), 1) if r.members_needed > 0 else 0
            ads_data.append({
                "id": r.id,
                "title": r.title,
                "url": r.url,
                "total_budget": r.total_cost,
                "members_needed": r.members_needed,
                "members_reached": completed,
                "remaining_clicks": remaining,
                "progress_pct": pct,
                "status": r.status,
                "payment_method": r.payment_method,
                "created_at": r.created_at
            })
        total_clicks   = sum(a["members_reached"] for a in ads_data)
        total_budget   = sum(a["total_budget"] for a in ads_data)
        active_count   = sum(1 for a in ads_data if a["status"] == "approved")
        completed_count = sum(1 for a in ads_data if a["status"] == "completed")
        result.append({
            "user_id": u.id,
            "username": u.username,
            "email": u.email,
            "membership": u.membership,
            "total_ads": len(ads_data),
            "total_clicks_received": total_clicks,
            "total_budget_spent": round(total_budget, 2),
            "active_ads": active_count,
            "completed_ads": completed_count,
            "ads": ads_data
        })
    return result


@router.get("/advertiser-management/{user_id}")
def get_advertiser_detail(user_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    """Detailed view for a single advertiser."""
    user = db.query(User).filter(User.id == user_id, User.is_admin == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="Advertiser not found")
    reqs = db.query(UserAdRequest).filter(UserAdRequest.user_id == user_id).order_by(UserAdRequest.created_at.desc()).all()
    ads_data = []
    for r in reqs:
        completed = r.members_reached or 0
        remaining = max((r.members_needed or 0) - completed, 0)
        pct = round((completed / r.members_needed * 100), 1) if r.members_needed > 0 else 0
        # fetch actual viewers from earnings for this campaign url
        viewers_count = db.query(Earning).join(Ad, Earning.ad_id == Ad.id).filter(
            Ad.url == r.url, Earning.type == "click"
        ).count()
        ads_data.append({
            "id": r.id,
            "title": r.title,
            "url": r.url,
            "total_budget": r.total_cost,
            "members_needed": r.members_needed,
            "members_reached": completed,
            "actual_viewers": viewers_count,
            "remaining_clicks": remaining,
            "progress_pct": pct,
            "status": r.status,
            "payment_method": r.payment_method,
            "admin_note": r.admin_note,
            "created_at": r.created_at
        })
    return {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "membership": user.membership,
        "joined": user.created_at,
        "total_ads": len(ads_data),
        "total_clicks_received": sum(a["members_reached"] for a in ads_data),
        "total_actual_viewers": sum(a["actual_viewers"] for a in ads_data),
        "total_budget_spent": round(sum(a["total_budget"] for a in ads_data), 2),
        "active_ads": sum(1 for a in ads_data if a["status"] == "approved"),
        "completed_ads": sum(1 for a in ads_data if a["status"] == "completed"),
        "pending_ads": sum(1 for a in ads_data if a["status"] == "pending"),
        "ads": ads_data
    }


# ── NOTIFICATIONS ─────────────────────────────────────────────────────────
class NotificationCreate(BaseModel):
    title: str
    message: str
    user_id: Optional[int] = None
    send_email: Optional[bool] = False

@router.post("/notifications/send")
def send_notification(data: NotificationCreate, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    import smtplib
    from email.mime.text import MIMEText

    def _send_email(to_email: str, username: str):
        gmail_user = os.getenv("GMAIL_USER", "")
        gmail_pass = os.getenv("GMAIL_PASS", "")
        if not gmail_user or not gmail_pass:
            return
        msg = MIMEText(f"Hello {username},\n\n{data.message}\n\n— Smart Grow Chain Team", "plain")
        msg["Subject"] = data.title
        msg["From"] = gmail_user
        msg["To"] = to_email
        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(gmail_user, gmail_pass)
                server.sendmail(gmail_user, to_email, msg.as_string())
        except Exception:
            pass

    if data.user_id:
        user = db.query(User).filter(User.id == data.user_id).first()
        db.add(Notification(user_id=data.user_id, title=data.title, message=data.message))
        if data.send_email and user:
            _send_email(user.email, user.username)
    else:
        users = db.query(User).filter(User.is_admin == False, User.is_active == True).all()
        for u in users:
            db.add(Notification(user_id=u.id, title=data.title, message=data.message))
            if data.send_email:
                _send_email(u.email, u.username)
    db.commit()
    return {"message": "Notification sent"}

@router.get("/notifications")
def get_notifications(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    notifs = db.query(Notification).filter(Notification.user_id == None).order_by(Notification.created_at.desc()).limit(50).all()
    return notifs
