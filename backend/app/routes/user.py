from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func, Date, cast, or_
import os, shutil, uuid
from app.database import get_db
from app.models.models import User, Ad, Earning, Withdrawal, ClickLog, FundTransfer, SupportTicket, TicketResponse, MembershipPlan, UserAdRequest, SiteSettings, PlanPurchaseRequest, EasypaisaAccount, KYCRequest, Notification
from app.schemas.schemas import WithdrawalCreate, UserOut
from app.utils import decode_token, hash_password, verify_password
from app.commission_utils import distribute_multi_level_commission
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime, timedelta
import pyotp, qrcode, io, base64

router = APIRouter(prefix="/user", tags=["User"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_user_active_plans(user: User, db: Session):
    now = datetime.utcnow()
    # Find all approved, non-expired plan purchases for this user
    active_purchases = db.query(PlanPurchaseRequest).filter(
        PlanPurchaseRequest.user_id == user.id,
        PlanPurchaseRequest.status == "approved",
        PlanPurchaseRequest.expires_at > now
    ).all()
    
    total_daily_ads = 0
    total_earning_per_click = 0
    total_referral_commission = 0.0
    active_plan_names = []
    active_plans_details = []

    for req in active_purchases:
        plan = db.query(MembershipPlan).filter(MembershipPlan.id == req.plan_id).first()
        if plan:
            total_daily_ads += (plan.daily_ads or 0)
            total_earning_per_click += (plan.earning_per_click or 0.0)
            total_referral_commission += (plan.referral_commission or 0.0)
            active_plan_names.append(plan.name)
            active_plans_details.append({
                "id": req.id,
                "name": plan.name,
                "expires_at": req.expires_at.isoformat() if req.expires_at else None
            })

    # Backward compatibility fallback if they have an active plan string but no tracked purchases
    has_legacy = False
    if len(active_purchases) == 0 and user.membership and user.membership != "none":
        legacy_expiry = user.free_plan_expires_at if user.membership == "free" else user.plan_expires_at
        if legacy_expiry and legacy_expiry > now:
            has_legacy = True
            plan = db.query(MembershipPlan).filter(MembershipPlan.name == user.membership).first()
            if plan:
                total_daily_ads += (plan.daily_ads or 0)
                total_earning_per_click += (plan.earning_per_click or 0.0)
                total_referral_commission += (plan.referral_commission or 0.0)
                active_plan_names.append(plan.name)
                active_plans_details.append({
                    "id": 0,
                    "name": plan.name,
                    "expires_at": legacy_expiry.isoformat() if legacy_expiry else None
                })

    # Count duplicates to show 'Plan (x2)'
    from collections import Counter
    counts = Counter(active_plan_names)
    formatted_names = [f"{name} (x{counts[name]})" if counts[name] > 1 else name for name in counts.keys()]

    return {
        "active": len(active_purchases) > 0 or has_legacy,
        "daily_ads": total_daily_ads,
        "earning_per_click": total_earning_per_click,
        "referral_commission": total_referral_commission,
        "plan_names": formatted_names,
        "active_plans": active_plans_details
    }

def has_active_plan(user: User, db: Session = None) -> bool:
    """A plan is usable only until its actual expiry time."""
    if not db:
        # Fallback for old code
        now = datetime.utcnow()
        if not user.membership or user.membership == "none": return False
        if user.membership == "free": return bool(user.free_plan_expires_at and user.free_plan_expires_at > now)
        return bool(user.plan_expires_at and user.plan_expires_at > now)
        
    return get_user_active_plans(user, db)["active"]

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

# ── SESSION PING ─────────────────────────────────────────────────────────────
@router.post("/ping")
def session_ping(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    now = datetime.utcnow()
    current_week_start = (now - timedelta(days=now.weekday())).date()
    
    if hasattr(current_user, 'last_session_week_start') and current_user.last_session_week_start != current_week_start:
        current_user.current_week_session_seconds = 0
        current_user.last_session_week_start = current_week_start
        
    # Increment session time (assumes ping every 60s)
    if not hasattr(current_user, 'total_session_seconds') or current_user.total_session_seconds is None: current_user.total_session_seconds = 0
    if not hasattr(current_user, 'current_week_session_seconds') or current_user.current_week_session_seconds is None: current_user.current_week_session_seconds = 0
    
    current_user.total_session_seconds += 60
    current_user.current_week_session_seconds += 60
    db.commit()
    return {"status": "ok"}

# ── PROFILE ─────────────────────────────────────────────────────────────────
@router.get("/profile", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.balance is None:
        current_user.balance = 0.0
        db.commit()
    if current_user.total_earned is None:
        current_user.total_earned = 0.0
        db.commit()
    active_data = get_user_active_plans(current_user, db)
    current_user.plan_active = active_data["active"]
    current_user.active_plans = active_data["active_plans"]
    current_user.daily_ads = active_data.get("daily_ads", 0)

    # Count how many ads watched today
    from datetime import date
    today = date.today()
    ads_watched = db.query(Earning).filter(
        Earning.user_id == current_user.id,
        Earning.type == "click",
        cast(Earning.clicked_at, Date) == today
    ).count()
    current_user.ads_watched_today = ads_watched
    current_user.earning_per_click = active_data.get("earning_per_click", 0.0)
    current_user.referral_commission = active_data.get("referral_commission", 0.0)
    if active_data["plan_names"]:
        current_user.membership = " + ".join(active_data["plan_names"])
    elif current_user.plan_active:
        pass # fallback to string
    else:
        # Not active
        pass

    return current_user

# ── ADS ──────────────────────────────────────────────────────────────────────
@router.get("/ads")
def get_ads(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not get_user_active_plans(current_user, db)["active"]:
        return {"plan_required": True, "ads": []}

    now = datetime.utcnow()
    ads = db.query(Ad).filter(Ad.is_active == True).all()
    
    sponsored_list = []
    admin_list = []
    
    for ad in ads:
        # Check validity for Admin ads
        if ad.valid_until and ad.valid_until < now:
            continue

        # Check if this ad originates from a UserAdRequest (User Advertise section)
        sponsored = db.query(UserAdRequest).filter(
            UserAdRequest.url == ad.url,
            UserAdRequest.title == ad.title,
            UserAdRequest.status == "approved"
        ).first()
        is_sponsored = sponsored is not None

        if is_sponsored:
            # SPONSORED AD: Strict "View Once" rule
            already_clicked = db.query(Earning).filter(
                Earning.user_id == current_user.id,
                Earning.ad_id == ad.id,
                Earning.type == "click"
            ).first()
            if already_clicked:
                continue
        else:
            # ADMIN AD: 24-hour respawn rule
            twenty_four_hours_ago = now - timedelta(hours=24)
            already_clicked_recent = db.query(Earning).filter(
                Earning.user_id == current_user.id,
                Earning.ad_id == ad.id,
                Earning.type == "click",
                Earning.clicked_at >= twenty_four_hours_ago
            ).first()
            if already_clicked_recent:
                continue

        is_own = is_sponsored and sponsored.user_id == current_user.id

        ad_data = {
            "id": ad.id,
            "title": ad.title,
            "url": ad.url,
            "description": ad.description,
            "earning_amount": ad.earning_amount + get_user_active_plans(current_user, db)["earning_per_click"],
            "timer_seconds": ad.timer_seconds,
            "total_clicks": ad.total_clicks,
            "already_clicked": False,
            "is_sponsored": is_sponsored,
            "is_own_ad": is_own,
            "members_needed": sponsored.members_needed if sponsored else 0
        }
        
        if is_sponsored:
            sponsored_list.append(ad_data)
        else:
            admin_list.append(ad_data)

    # Sort Sponsored by members_needed descending
    sponsored_list.sort(key=lambda x: -x["members_needed"])
    # Sort Admin by newest first
    admin_list.sort(key=lambda x: -x["id"])
    
    # Priority Distribution Logic
    # Sponsored ads first, followed by Admin ads. The frontend handles slicing to show only 10 on screen.
    final_ads = sponsored_list + admin_list

    return {"plan_required": False, "ads": final_ads}

@router.post("/click/start/{ad_id}")
def start_click(ad_id: int, request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not has_active_plan(current_user, db):
        raise HTTPException(status_code=403, detail="Please activate a plan first.")
        
    active_data = get_user_active_plans(current_user, db)
    daily_limit = active_data.get("daily_ads", 0)
    
    today = date.today()
    ads_watched_today = db.query(Earning).filter(
        Earning.user_id == current_user.id,
        Earning.type == "click",
        cast(Earning.clicked_at, Date) == today
    ).count()

    if daily_limit > 0 and ads_watched_today >= daily_limit:
        raise HTTPException(status_code=400, detail="You have reached your daily ad limit. Please wait until tomorrow or upgrade your plan.")

    ad = db.query(Ad).filter(Ad.id == ad_id, Ad.is_active == True).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    sponsored = db.query(UserAdRequest).filter(
        UserAdRequest.url == ad.url, UserAdRequest.title == ad.title, UserAdRequest.status == "approved"
    ).first()
    is_sponsored = sponsored is not None

    if is_sponsored:
        already_clicked = db.query(Earning).filter(
            Earning.user_id == current_user.id, Earning.ad_id == ad_id, Earning.type == "click"
        ).first()
        if already_clicked:
            raise HTTPException(status_code=400, detail="Already clicked this sponsored ad")
    else:
        twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
        already_clicked_recent = db.query(Earning).filter(
            Earning.user_id == current_user.id, Earning.ad_id == ad_id,
            Earning.type == "click", Earning.clicked_at >= twenty_four_hours_ago
        ).first()
        if already_clicked_recent:
            raise HTTPException(status_code=400, detail="You can click this ad again after 24 hours")
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
    if not has_active_plan(current_user, db):
        raise HTTPException(status_code=403, detail="Please activate a plan first.")
    ad = db.query(Ad).filter(Ad.id == ad_id, Ad.is_active == True).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    sponsored = db.query(UserAdRequest).filter(
        UserAdRequest.url == ad.url, UserAdRequest.title == ad.title, UserAdRequest.status == "approved"
    ).first()
    is_sponsored = sponsored is not None

    if is_sponsored:
        already_clicked = db.query(Earning).filter(
            Earning.user_id == current_user.id, Earning.ad_id == ad_id, Earning.type == "click"
        ).first()
        if already_clicked:
            raise HTTPException(status_code=400, detail="Already clicked this sponsored ad")
    else:
        twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
        already_clicked_recent = db.query(Earning).filter(
            Earning.user_id == current_user.id, Earning.ad_id == ad_id,
            Earning.type == "click", Earning.clicked_at >= twenty_four_hours_ago
        ).first()
        if already_clicked_recent:
            raise HTTPException(status_code=400, detail="You can click this ad again after 24 hours")
    today = date.today()
    log = db.query(ClickLog).filter(
        ClickLog.user_id == current_user.id, ClickLog.ad_id == ad_id,
        cast(ClickLog.created_at, Date) == today
    ).order_by(ClickLog.id.desc()).first()
    if log:
        if (datetime.utcnow() - log.created_at).total_seconds() < ad.timer_seconds:
            raise HTTPException(status_code=400, detail="Please watch the ad for the full required time")
        log.timer_completed = True
    active_data = get_user_active_plans(current_user, db)
    # The ad has its own earning amount. If we want to strictly use the ad's base + the user's dynamic limits:
    # Actually, the user says the rate doubles. We will use the ad's base earning_amount + user's dynamic earning_per_click
    total_earning = ad.earning_amount + active_data["earning_per_click"]
    
    earning = Earning(user_id=current_user.id, ad_id=ad_id, amount=total_earning, type="click")
    db.add(earning)
    current_user.balance += total_earning
    current_user.total_earned += total_earning
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
    # Handle Ad View Bonus
    distribute_multi_level_commission(db, current_user, total_earning, 'ad', "Ad View Bonus")
    
    db.commit()
    return {"message": "Earning credited", "amount": total_earning, "new_balance": current_user.balance}

# ── WITHDRAW ─────────────────────────────────────────────────────────────────
@router.post("/withdraw")
def request_withdrawal(data: WithdrawalCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check withdraw toggle
    w_enabled = db.query(SiteSettings).filter(SiteSettings.key == "withdraw_enabled").first()
    w_until   = db.query(SiteSettings).filter(SiteSettings.key == "withdraw_until").first()
    enabled = True if (not w_enabled or w_enabled.value == "true") else False
    if w_until and w_until.value:
        try:
            if datetime.utcnow() > datetime.fromisoformat(w_until.value):
                enabled = False
                if w_enabled: w_enabled.value = "false"
                w_until.value = ""
                db.commit()
        except: pass
    if not enabled:
        w_msg = db.query(SiteSettings).filter(SiteSettings.key == "withdraw_closed_message").first()
        msg = w_msg.value if w_msg and w_msg.value else "Withdrawals are currently disabled."
        raise HTTPException(status_code=400, detail=msg)
    if current_user.kyc_status != "approved":
        raise HTTPException(status_code=400, detail="Please complete your KYC verification first before withdrawing.")
    # Get plan-based min/max withdrawal
    plan = db.query(MembershipPlan).filter(MembershipPlan.name == current_user.membership).first()
    min_w = plan.min_withdrawal if plan and plan.min_withdrawal else 500
    max_w = plan.max_withdrawal if plan and plan.max_withdrawal else 0
    if data.amount < min_w:
        raise HTTPException(status_code=400, detail=f"Minimum withdrawal for your plan is Rs. {min_w}")
    if max_w > 0 and data.amount > max_w:
        raise HTTPException(status_code=400, detail=f"Maximum withdrawal for your plan is Rs. {max_w}")
    if current_user.balance < data.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    current_user.balance -= data.amount
    db.add(Withdrawal(user_id=current_user.id, amount=data.amount, method=data.method, wallet_address=data.wallet_address))
    db.commit()
    return {"message": "Withdrawal request submitted"}

@router.get("/withdrawals")
def get_withdrawals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ws = db.query(Withdrawal).filter(Withdrawal.user_id == current_user.id).order_by(Withdrawal.created_at.desc()).all()
    return [{
        "id": w.id,
        "amount": w.amount,
        "method": w.method,
        "wallet_address": w.wallet_address,
        "status": w.status,
        "payout_screenshot_url": f"{os.getenv('BACKEND_URL', 'https://muradmahmood-smart-grow-chain.hf.space')}/uploads/screenshots/{w.payout_screenshot_path}" if w.payout_screenshot_path else None,
        "created_at": w.created_at
    } for w in ws]

# ── EARNINGS ──────────────────────────────────────────────────────────────────
@router.get("/earnings")
def get_earnings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models.models import Ad
    earnings = db.query(Earning).filter(Earning.user_id == current_user.id).order_by(Earning.clicked_at.desc()).limit(200).all()
    res = []
    for e in earnings:
        title = None
        if e.type == 'click' and e.ad_id:
            ad = db.query(Ad).filter(Ad.id == e.ad_id).first()
            if ad:
                title = ad.title
        res.append({"ad_id": e.ad_id, "amount": e.amount, "type": e.type, "clicked_at": e.clicked_at, "ad_title": title})
    return res

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
    refs = db.query(User).filter(User.referred_by == current_user.id).order_by(User.created_at.desc()).all()
    total_commission = db.query(func.sum(Earning.amount)).filter(
        Earning.user_id == current_user.id, Earning.type == "referral"
    ).scalar() or 0
    referral_msg_row = db.query(SiteSettings).filter(SiteSettings.key == "referral_message").first()
    now = datetime.utcnow()
    ref_list = []
    for r in refs:
        # plan active check
        plan_active = False
        plan_name = r.membership or "none"
        if r.membership and r.membership != "free":
            plan_active = bool(r.plan_expires_at and r.plan_expires_at > now)
        else:
            plan_active = bool(r.free_plan_expires_at and r.free_plan_expires_at > now)
        ref_list.append({
            "username": r.username,
            "joined": r.created_at,
            "kyc_status": r.kyc_status,
            "membership": plan_name,
            "plan_active": plan_active,
            "is_active": r.is_active,
            "plan_expires_at": r.plan_expires_at or r.free_plan_expires_at
        })
    active_count = sum(1 for r in ref_list if r["plan_active"] and r["is_active"])
    l1_req = 3
    l2_req = 5
    l3_req = 15
    s1 = db.query(SiteSettings).filter(SiteSettings.key == 'level_1_refs_needed').first()
    s2 = db.query(SiteSettings).filter(SiteSettings.key == 'level_2_refs_needed').first()
    s3 = db.query(SiteSettings).filter(SiteSettings.key == 'level_3_refs_needed').first()
    if s1 and s1.value.isdigit(): l1_req = int(s1.value)
    if s2 and s2.value.isdigit(): l2_req = int(s2.value)
    if s3 and s3.value.isdigit(): l3_req = int(s3.value)

    total_refs = len(refs)
    if total_refs < l1_req:
        current_level = 1
        refs_to_next = l1_req - total_refs
        req_for_current = l1_req
    elif total_refs < l2_req:
        current_level = 2
        refs_to_next = l2_req - total_refs
        req_for_current = l2_req
    elif total_refs < l3_req:
        current_level = 3
        refs_to_next = l3_req - total_refs
        req_for_current = l3_req
    else:
        current_level = 4
        refs_to_next = 0
        req_for_current = l3_req

    return {
        "referral_code": current_user.referral_code,
        "referral_link": f"{os.getenv('FRONTEND_URL', 'https://smart-grow-chain.vercel.app')}/register?ref={current_user.referral_code}",
        "total_referrals": len(refs),
        "active_referrals": active_count,
        "total_commission": round(total_commission, 2),
        "current_level": current_level,
        "required_referrals_per_level": req_for_current,
        "referrals_to_next_level": refs_to_next,
        "next_level_message": f"Send link to {refs_to_next} users to gain next level" if current_level < 4 else "Maximum level reached! 🎉",
        "referral_message": referral_msg_row.value if referral_msg_row and referral_msg_row.value else "",
        "referrals": ref_list
    }

@router.get("/referrals/level/{level}")
def get_referrals_by_level(level: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    now = datetime.utcnow()

    def build_list(user_ids):
        result = []
        for uid in user_ids:
            u = db.query(User).filter(User.id == uid).first()
            if not u: continue
            plan_active = False
            if u.membership and u.membership != "free":
                plan_active = bool(u.plan_expires_at and u.plan_expires_at > now)
            else:
                plan_active = bool(u.free_plan_expires_at and u.free_plan_expires_at > now)
            expiry = u.plan_expires_at or u.free_plan_expires_at
            result.append({
                "username": u.username,
                "kyc_status": u.kyc_status,
                "membership": u.membership or "none",
                "plan_active": plan_active,
                "joined": u.created_at,
                "plan_expires_at": expiry
            })
        return result

    if level == 1:
        ids = [r.id for r in db.query(User).filter(User.referred_by == current_user.id).all()]
        return {"level": 1, "members": build_list(ids), "total": len(ids)}

    # Build level chain
    prev_ids = {current_user.id}
    for _ in range(level - 1):
        next_ids = set()
        for uid in prev_ids:
            children = db.query(User.id).filter(User.referred_by == uid).all()
            next_ids.update(c[0] for c in children)
        # Remove already-counted upline ids to avoid overlap
        next_ids -= prev_ids
        prev_ids = next_ids
        if not prev_ids:
            break

    members = build_list(list(prev_ids))
    return {"level": level, "members": members, "total": len(members)}


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
    # Exact username match (case-sensitive)
    receiver = db.query(User).filter(User.username == data.receiver_username).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="User not found. Please enter the exact username.")
    current_user.balance -= data.amount
    receiver.balance += data.amount
    db.add(FundTransfer(sender_id=current_user.id, receiver_id=receiver.id, amount=data.amount, note=data.note))
    # Notification to sender
    db.add(Notification(
        user_id=current_user.id,
        title="Fund Sent 📤",
        message=f"Rs. {data.amount:.2f} has been deducted from your account and sent to @{receiver.username}."
    ))
    # Notification to receiver
    db.add(Notification(
        user_id=receiver.id,
        title="Fund Received 📥",
        message=f"Rs. {data.amount:.2f} has been received in your account from @{current_user.username}."
    ))
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
    result = []
    for t in tickets:
        responses = db.query(TicketResponse).filter(TicketResponse.ticket_id == t.id).order_by(TicketResponse.created_at).all()
        result.append({
            "id": t.id, "subject": t.subject, "message": t.message, "status": t.status, "reply": t.reply, "created_at": t.created_at,
            "user_responses": [{"message": r.message, "created_at": r.created_at} for r in responses]
        })
    return result

# ── PUBLIC SETTINGS ──────────────────────────────────────────────────────────
@router.get("/settings")
def get_public_settings(db: Session = Depends(get_db)):
    rows = db.query(SiteSettings).all()
    settings = {r.key: r.value for r in rows}
    # auto-expire duration-based withdraw
    until_str = settings.get("withdraw_until", "")
    if until_str:
        try:
            if datetime.utcnow() > datetime.fromisoformat(until_str):
                settings["withdraw_enabled"] = "false"
                settings["withdraw_until"] = ""
                for k, v in [("withdraw_enabled", "false"), ("withdraw_until", "")]:
                    s = db.query(SiteSettings).filter(SiteSettings.key == k).first()
                    if s: s.value = v
                db.commit()
        except: pass
    # schedule-based auto-enable (PKT = UTC+5)
    sched = settings.get("withdraw_schedule_time", "")
    if sched and settings.get("withdraw_enabled", "true") != "true":
        try:
            now_pkt_hour = (datetime.utcnow().hour + 5) % 24
            now_pkt_min  = datetime.utcnow().minute
            # format: "HH:MM AM|HH:MM PM" or legacy "HH:MM"
            on_part = sched.split('|')[0].strip() if '|' in sched else sched.strip()
            # parse 12h AM/PM format
            from datetime import datetime as dt
            on_dt = dt.strptime(on_part, "%I:%M %p") if 'AM' in on_part or 'PM' in on_part else dt.strptime(on_part, "%H:%M")
            if now_pkt_hour == on_dt.hour and now_pkt_min < 60:
                settings["withdraw_enabled"] = "true"
        except: pass
    # schedule-based auto-disable
    sched = settings.get("withdraw_schedule_time", "")
    if sched and settings.get("withdraw_enabled", "true") == "true" and '|' in sched:
        try:
            now_pkt_hour = (datetime.utcnow().hour + 5) % 24
            now_pkt_min  = datetime.utcnow().minute
            off_part = sched.split('|')[1].strip()
            from datetime import datetime as dt
            off_dt = dt.strptime(off_part, "%I:%M %p") if 'AM' in off_part or 'PM' in off_part else dt.strptime(off_part, "%H:%M")
            if now_pkt_hour == off_dt.hour and now_pkt_min < 60:
                settings["withdraw_enabled"] = "false"
        except: pass
    return settings

# ── MEMBERSHIP PLANS ──────────────────────────────────────────────────────────
@router.get("/plans")
def get_plans(db: Session = Depends(get_db)):
    plans = db.query(MembershipPlan).filter(MembershipPlan.is_active == True).all()
    result = []
    for p in plans:
        result.append({
            "id": p.id, "name": p.name, "price": p.price,
            "period_days": p.period_days, "daily_ads": p.daily_ads,
            "earning_per_click": p.earning_per_click,
            "referral_levels": p.referral_levels,
            "referral_commission": p.referral_commission,
            "level_commissions": p.level_commissions,
            "level_details": p.level_details,
            "required_referrals_per_level": p.required_referrals_per_level or 3,
            "min_withdrawal": p.min_withdrawal or 0,
            "max_withdrawal": p.max_withdrawal or 0,
            "is_active": p.is_active, "sort_order": p.sort_order
        })
    return result

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

    if payment_method not in ["wallet", "easypaisa", "jazzcash", "bank"]:
        raise HTTPException(status_code=400, detail="Invalid payment method")

    # Double-submission guard: reject if an identical wallet purchase was created in the last 30 seconds
    if payment_method == "wallet" and plan.price > 0:
        cutoff = datetime.utcnow() - timedelta(seconds=30)
        recent = db.query(PlanPurchaseRequest).filter(
            PlanPurchaseRequest.user_id == current_user.id,
            PlanPurchaseRequest.plan_id == plan_id,
            PlanPurchaseRequest.payment_method == "wallet",
            PlanPurchaseRequest.created_at >= cutoff
        ).first()
        if recent:
            raise HTTPException(status_code=429, detail="Duplicate request detected. Please wait a moment.")

    screenshot_path = None
    if plan.price <= 0:
        # Free plan — activate instantly
        current_user.membership = plan.name
        current_user.free_plan_expires_at = datetime.utcnow() + timedelta(days=plan.period_days or 7)
        req = PlanPurchaseRequest(
            user_id=current_user.id, plan_id=plan.id, plan_name=plan.name, plan_price=0,
            payment_method="free", status="approved",
            expires_at=datetime.utcnow() + timedelta(days=plan.period_days or 7)
        )
        db.add(req)
        db.add(Notification(user_id=current_user.id, title="Free Plan Activated ✅", message=f"Your {plan.name} plan has been activated."))
        db.commit()
        return {"message": "Free plan activated successfully."}
    elif payment_method == "wallet":
        # Verify wallet balance
        user_balance = current_user.balance or 0.0
        if user_balance < plan.price:
            raise HTTPException(status_code=400, detail="Insufficient balance. Please deposit first.")
        
        # Deduct exact plan price and activate plan atomically
        current_user.balance = user_balance - plan.price
        current_user.membership = plan.name
        current_user.plan_expires_at = datetime.utcnow() + timedelta(days=plan.period_days or 30)
        
        req = PlanPurchaseRequest(
            user_id=current_user.id,
            plan_id=plan.id,
            plan_name=plan.name,
            plan_price=plan.price,
            payment_method="wallet",
            status="approved",
            expires_at=datetime.utcnow() + timedelta(days=plan.period_days or 30)
        )
        db.add(req)
        
        # User notification
        db.add(Notification(
            user_id=current_user.id,
            title="Plan Activated ✅",
            message=f"Your {plan.name} plan has been activated. Rs. {plan.price} deducted from wallet."
        ))
        
        # Admin notification: "[User Name] activated [Plan Name]."
        admins = db.query(User).filter(User.is_admin == True).all()
        for admin in admins:
            db.add(Notification(
                user_id=admin.id,
                title="Plan Activated 🏆",
                message=f"{current_user.username} activated {plan.name}."
            ))
            
        # Handle Plan Purchase Bonus
        distribute_multi_level_commission(db, current_user, plan.price, 'plan', "Plan Purchase Bonus")
        
        db.commit()
        db.refresh(current_user)
        return {"message": f"{plan.name} plan activated successfully!", "activated": True}
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
        status="pending"
    )
    db.add(req)
    # Admin notification for manual payment
    admins = db.query(User).filter(User.is_admin == True).all()
    for admin in admins:
        db.add(Notification(user_id=admin.id, title="Plan Purchase Request 📋", message=f"{current_user.username} submitted {plan.name} plan purchase via {payment_method}. Please review."))
    db.commit()
    return {"message": "Plan purchase request submitted. Admin will activate your plan shortly."}

@router.get("/plan/my-purchases")
def my_plan_purchases(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reqs = db.query(PlanPurchaseRequest).filter(PlanPurchaseRequest.user_id == current_user.id).order_by(PlanPurchaseRequest.created_at.desc()).all()
    result = []
    for r in reqs:
        user = db.query(User).filter(User.id == r.user_id).first()
        expiry = None
        if r.status == "approved" and user:
            expiry = user.free_plan_expires_at if user.membership == "free" else user.plan_expires_at
        result.append({
            "id": r.id, "plan_name": r.plan_name, "plan_price": r.plan_price,
            "payment_method": r.payment_method, "status": r.status,
            "admin_note": r.admin_note, "created_at": r.created_at,
            "expires_at": expiry
        })
    return result


@router.post("/tickets/{tid}/read")
def read_support_ticket(tid: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    t = db.query(SupportTicket).filter(SupportTicket.id == tid, SupportTicket.user_id == current_user.id).first()
    if t and t.status == "replied":
        t.status = "read"
        db.commit()
    return {"message": "Ticket marked as read"}

class TicketResponseCreate(BaseModel):
    message: str

@router.post("/tickets/{tid}/respond")
def respond_to_ticket(tid: int, data: TicketResponseCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    t = db.query(SupportTicket).filter(SupportTicket.id == tid, SupportTicket.user_id == current_user.id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Ticket not found")
    response = TicketResponse(ticket_id=t.id, user_id=current_user.id, message=data.message)
    db.add(response)
    t.status = "open"
    # Notify admin (create notification for admin users)
    admins = db.query(User).filter(User.is_admin == True).all()
    for admin in admins:
        notif = Notification(user_id=admin.id, title="Ticket Response", message=f"User @{current_user.username} responded to ticket '{t.subject}': {data.message[:100]}")
        db.add(notif)
    db.commit()
    return {"message": "Response sent"}

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
    return {
        "kyc_status": current_user.kyc_status,
        "kyc": {"full_name": kyc.full_name, "phone": kyc.phone or kyc.cnic, "cnic": kyc.cnic, "status": kyc.status, "admin_note": kyc.admin_note, "created_at": kyc.created_at} if kyc else None,
        "free_plan_expired": expired,
        "free_plan_days_left": days_left,
    }

@router.post("/kyc/submit")
async def submit_kyc(
    full_name: str = Form(""),
    phone: str = Form(""),
    cnic: str = Form(""),
    front_photo: UploadFile = File(None),
    selfie_photo: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    phone_value = (phone or cnic or "").strip()
    cnic_value = (cnic or "").strip()
    if not full_name or not phone_value:
        raise HTTPException(status_code=400, detail="Full name and phone number are required")
    if not front_photo or not front_photo.filename:
        raise HTTPException(status_code=400, detail="CNIC front photo is required")
    if not selfie_photo or not selfie_photo.filename:
        raise HTTPException(status_code=400, detail="Selfie with CNIC is required")
    existing = db.query(KYCRequest).filter(KYCRequest.user_id == current_user.id).first()
    if existing and existing.status == "approved":
        raise HTTPException(status_code=400, detail="KYC already approved")

    def save_file(f: UploadFile):
        ext = os.path.splitext(f.filename)[-1].lower()
        fname = f"{uuid.uuid4().hex}{ext}"
        with open(os.path.join(UPLOAD_DIR, fname), "wb") as out:
            shutil.copyfileobj(f.file, out)
        return fname

    fp = save_file(front_photo)
    sp = save_file(selfie_photo)

    if existing:
        existing.full_name = full_name or existing.full_name
        existing.phone = phone_value or existing.phone
        existing.cnic = cnic_value or phone_value or existing.cnic
        if fp: existing.front_photo = fp
        if sp: existing.selfie_photo = sp
        existing.status = "pending"
        existing.admin_note = None
    else:
        db.add(KYCRequest(user_id=current_user.id, full_name=full_name, phone=phone_value, cnic=cnic_value or phone_value, front_photo=fp, selfie_photo=sp))

    current_user.kyc_status = "pending"
    db.commit()
    return {"message": "KYC submitted successfully. Admin will verify shortly."}

# ── MY CAMPAIGN VIEWERS ──────────────────────────────────────────────────────
@router.get("/ad-request/viewers/{req_id}")
def get_my_campaign_viewers(req_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
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
        kyc = db.query(KYCRequest).filter(KYCRequest.user_id == user.id).order_by(KYCRequest.created_at.desc()).first()
        result.append({
            "username": user.username,
            "email": user.email,
            "membership": user.membership or "none",
            "balance": round(user.balance or 0, 2),
            "total_earned": round(user.total_earned or 0, 2),
            "kyc_status": user.kyc_status or "none",
            "kyc_name": kyc.full_name if kyc else "-",
            "plan_expires_at": user.plan_expires_at,
            "is_active": user.is_active,
            "joined": user.created_at,
            "viewed_at": e.clicked_at,
            "earned_amount": round(e.amount or 0, 2),
        })
    return result

# ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
@router.get("/notifications")
def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notifs = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).limit(50).all()
    return [{"id": n.id, "title": n.title, "message": n.message, "is_read": n.is_read, "created_at": n.created_at} for n in notifs]

@router.post("/notifications/{notif_id}/read")
def mark_read(notif_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == current_user.id).first()
    if n:
        n.is_read = True
        db.commit()
    return {"message": "Marked as read"}

@router.post("/notifications/read-all")
def mark_all_read(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"message": "All marked as read"}
