from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import os
from sqlalchemy import func, Date, cast
from app.database import get_db
from app.models.models import User, Ad, Earning, Withdrawal, ClickLog, EasypaisaAccount, Deposit, AdminEmail, SupportTicket, MembershipPlan, ReferralSetting
from app.schemas.schemas import AdCreate, EasypaisaAccountCreate, PlanCreate, PlanUpdate
from app.utils import decode_token
from fastapi.security import OAuth2PasswordBearer
from datetime import date, timedelta
from pydantic import BaseModel
from typing import Optional, List

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
    user.balance += data.amount
    if data.amount > 0:
        user.total_earned += data.amount
    db.commit()
    return {"message": f"Balance adjusted by ${data.amount}", "new_balance": user.balance}

@router.get("/ads")
def get_all_ads(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    return db.query(Ad).order_by(Ad.created_at.desc()).all()

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
            "admin_note": w.admin_note, "created_at": w.created_at
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
def mark_withdrawal_sent(w_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    w = db.query(Withdrawal).filter(Withdrawal.id == w_id).first()
    if not w:
        raise HTTPException(status_code=404, detail="Not found")
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
        method_type=data.method_type or "easypaisa"
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
    db.delete(acc)
    db.commit()
    return {"message": "Deleted"}


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
        user.total_earned += dep.amount_pkr
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
        result.append({"id": t.id, "username": user.username if user else "?", "subject": t.subject, "message": t.message, "status": t.status, "reply": t.reply, "created_at": t.created_at})
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
    db.delete(plan); db.commit()
    return {"message": "Plan deleted"}


# ── FUND TRANSFERS (view all) ──────────────────────────────────────────
@router.get("/fund-transfers")
def get_fund_transfers(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    from app.models.models import FundTransfer
    transfers = db.query(FundTransfer).order_by(FundTransfer.created_at.desc()).all()
    result = []
    for t in transfers:
        sender = db.query(User).filter(User.id == t.sender_id).first()
        receiver = db.query(User).filter(User.id == t.receiver_id).first()
        result.append({"id": t.id, "sender": sender.username if sender else "?", "receiver": receiver.username if receiver else "?", "amount": t.amount, "note": t.note, "created_at": t.created_at})
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
            "levels": [{"id": r.id, "level": r.level, "percent": r.percent, "is_active": r.is_active} for r in type_rows]
        }
    return result

class RefSettingToggle(BaseModel):
    is_active: bool

class RefSettingUpdate(BaseModel):
    percent: float

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
    r.percent = data.percent
    db.commit()
    return r

@router.post("/referral-settings/{bonus_type}/add-level")
def add_referral_level(bonus_type: str, data: RefSettingUpdate, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    max_lvl = db.query(func.max(ReferralSetting.level)).filter(ReferralSetting.bonus_type == bonus_type).scalar() or 0
    r = ReferralSetting(bonus_type=bonus_type, level=max_lvl+1, percent=data.percent, is_active=True)
    db.add(r); db.commit(); db.refresh(r)
    return r

@router.delete("/referral-settings/{setting_id}")
def delete_referral_level(setting_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    r = db.query(ReferralSetting).filter(ReferralSetting.id == setting_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(r); db.commit()
    return {"message": "Deleted"}


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
