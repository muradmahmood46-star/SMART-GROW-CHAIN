from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    password = Column(String(255))
    balance = Column(Float, default=0.0)
    total_earned = Column(Float, default=0.0)
    referral_code = Column(String(20), unique=True)
    referred_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    membership = Column(String(20), default="none")
    plan_expires_at = Column(DateTime, nullable=True)  # paid plan expiry
    free_plan_expires_at = Column(DateTime, nullable=True)  # free plan expiry
    kyc_status = Column(String(20), default="none")  # none, pending, approved, rejected
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    two_fa_enabled = Column(Boolean, default=False)
    two_fa_secret = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=func.now())

    earnings = relationship("Earning", back_populates="user")
    withdrawals = relationship("Withdrawal", back_populates="user")
    click_logs = relationship("ClickLog", back_populates="user")


class Ad(Base):
    __tablename__ = "ads"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100))
    url = Column(String(255))
    description = Column(String(255), nullable=True)
    earning_amount = Column(Float, default=0.001)
    timer_seconds = Column(Integer, default=10)
    daily_limit = Column(Integer, default=100)
    total_clicks = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

    earnings = relationship("Earning", back_populates="ad")
    click_logs = relationship("ClickLog", back_populates="ad")


class Earning(Base):
    __tablename__ = "earnings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    ad_id = Column(Integer, ForeignKey("ads.id"))
    amount = Column(Float)
    type = Column(String(20), default="click")  # click, referral, bonus
    clicked_at = Column(DateTime, default=func.now())

    user = relationship("User", back_populates="earnings")
    ad = relationship("Ad", back_populates="earnings")


class Withdrawal(Base):
    __tablename__ = "withdrawals"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    method = Column(String(50))
    wallet_address = Column(String(255))
    status = Column(String(20), default="pending")
    admin_note = Column(String(255), nullable=True)
    payout_screenshot_path = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=func.now())

    user = relationship("User", back_populates="withdrawals")


class ClickLog(Base):
    __tablename__ = "click_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    ad_id = Column(Integer, ForeignKey("ads.id"))
    ip_address = Column(String(50))
    user_agent = Column(String(255))
    timer_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

    user = relationship("User", back_populates="click_logs")
    ad = relationship("Ad", back_populates="click_logs")


class MembershipPlan(Base):
    __tablename__ = "membership_plans"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50))
    price = Column(Float)
    period_days = Column(Integer, default=30)
    daily_ads = Column(Integer)
    earning_per_click = Column(Float, default=0.001)
    referral_levels = Column(String(50), default="N/A")
    referral_commission = Column(Float, default=0.0)
    # Dynamic per-level commissions stored as JSON string: {"1": 10.0, "2": 5.0, "3": 2.0}
    level_commissions = Column(String(500), default="{}")
    # Dynamic per-level details stored as JSON string: {"1": "Share link to others"}
    level_details = Column(String(1000), default="{}")
    required_referrals_per_level = Column(Integer, default=3)
    min_withdrawal = Column(Float, default=0.0)
    max_withdrawal = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)


class EasypaisaAccount(Base):
    __tablename__ = "easypaisa_accounts"
    id = Column(Integer, primary_key=True, index=True)
    account_title = Column(String(100))
    account_number = Column(String(20))
    phone_number = Column(String(20), nullable=True)
    method_type = Column(String(20), default="easypaisa")  # easypaisa or jazzcash
    deposit_message = Column(String(500), nullable=True)
    bank_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    in_use_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    in_use_since = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())


class Deposit(Base):
    __tablename__ = "deposits"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount_pkr = Column(Float)
    easypaisa_account_id = Column(Integer, ForeignKey("easypaisa_accounts.id"))
    sender_name = Column(String(100), nullable=True)   # user ka apna account name
    transaction_id = Column(String(100))               # user phone number
    screenshot_path = Column(String(255), nullable=True)  # uploaded screenshot
    screenshot_note = Column(String(255), nullable=True)
    status = Column(String(20), default="pending")     # pending, confirmed, rejected
    admin_note = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=func.now())

    user = relationship("User", backref="deposits")
    easypaisa_account = relationship("EasypaisaAccount")


class AdminEmail(Base):
    __tablename__ = "admin_emails"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())


class FundTransfer(Base):
    __tablename__ = "fund_transfers"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    note = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=func.now())
    sender   = relationship("User", foreign_keys=[sender_id],   backref="sent_transfers")
    receiver = relationship("User", foreign_keys=[receiver_id], backref="received_transfers")


class SupportTicket(Base):
    __tablename__ = "support_tickets"
    id = Column(Integer, primary_key=True, index=True)
    user_id  = Column(Integer, ForeignKey("users.id"))
    subject  = Column(String(200))
    message  = Column(Text)
    status   = Column(String(20), default="open")   # open, replied, closed
    reply    = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    user = relationship("User", backref="tickets")
    responses = relationship("TicketResponse", backref="ticket", order_by="TicketResponse.created_at")


class TicketResponse(Base):
    __tablename__ = "ticket_responses"
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("support_tickets.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text)
    created_at = Column(DateTime, default=func.now())


class ReferralSetting(Base):
    __tablename__ = "referral_settings"
    id           = Column(Integer, primary_key=True, index=True)
    bonus_type   = Column(String(50))   # plan_purchase, vip_plan, deposit, ad_view
    is_active    = Column(Boolean, default=True)
    level        = Column(Integer)      # 1,2,3,4...
    percent      = Column(Float, default=0.0)
    details      = Column(String(200), nullable=True)


class SiteSettings(Base):
    __tablename__ = "site_settings"
    id    = Column(Integer, primary_key=True, index=True)
    key   = Column(String(50), unique=True)
    value = Column(String(500), nullable=True)


class AdBudgetRate(Base):
    __tablename__ = "ad_budget_rates"
    id              = Column(Integer, primary_key=True, index=True)
    rate_pkr        = Column(Float, default=1.0)
    welcome_message = Column(String(1000), nullable=True)
    updated_at      = Column(DateTime, default=func.now(), onupdate=func.now())


class UserAdRequest(Base):
    __tablename__ = "user_ad_requests"
    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"))
    title           = Column(String(100))
    url             = Column(String(255))
    members_needed  = Column(Integer)
    members_reached = Column(Integer, default=0)
    rate_pkr        = Column(Float)
    total_cost      = Column(Float)
    payment_method  = Column(String(20), default="wallet")
    sender_name     = Column(String(100), nullable=True)
    transaction_id  = Column(String(100), nullable=True)
    screenshot_path = Column(String(255), nullable=True)
    status          = Column(String(20), default="pending")
    admin_note      = Column(String(255), nullable=True)
    created_at      = Column(DateTime, default=func.now())
    user = relationship("User", backref="ad_requests")


class PlanPurchaseRequest(Base):
    __tablename__ = "plan_purchase_requests"
    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"))
    plan_id         = Column(Integer, ForeignKey("membership_plans.id"))
    plan_name       = Column(String(50))
    plan_price      = Column(Float)
    payment_method  = Column(String(20), default="wallet")  # wallet or easypaisa
    screenshot_path = Column(String(255), nullable=True)
    sender_name     = Column(String(100), nullable=True)
    sender_phone    = Column(String(20), nullable=True)
    status          = Column(String(20), default="pending")  # pending, approved, rejected
    admin_note      = Column(String(255), nullable=True)
    created_at      = Column(DateTime, default=func.now())
    user = relationship("User", backref="plan_purchases")
    plan = relationship("MembershipPlan")


class Notification(Base):
    __tablename__ = "notifications"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=True)  # None = broadcast to all
    title      = Column(String(100))
    message    = Column(Text)
    is_read    = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    user = relationship("User", backref="notifications")


class KYCRequest(Base):
    __tablename__ = "kyc_requests"
    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), unique=True)
    full_name    = Column(String(100))
    phone        = Column(String(20), nullable=True)
    cnic         = Column(String(20))
    front_photo  = Column(String(255), nullable=True)
    selfie_photo = Column(String(255), nullable=True)
    status       = Column(String(20), default="pending")  # pending, approved, rejected
    is_seen      = Column(Boolean, default=False)
    admin_note   = Column(String(255), nullable=True)
    created_at   = Column(DateTime, default=func.now())
    updated_at   = Column(DateTime, default=func.now(), onupdate=func.now())
    user = relationship("User", backref="kyc_request")
