from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    referral_code: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    balance: float
    total_earned: float
    membership: str
    referral_code: str
    two_fa_enabled: bool
    kyc_status: str
    created_at: datetime
    class Config:
        from_attributes = True

class AdOut(BaseModel):
    id: int
    title: str
    url: str
    earning_amount: float
    timer_seconds: int
    is_active: bool
    class Config:
        from_attributes = True

class AdCreate(BaseModel):
    title: str
    url: str
    description: Optional[str] = None
    earning_amount: float
    timer_seconds: int
    daily_limit: int

class DepositCreate(BaseModel):
    amount_pkr: float
    easypaisa_account_id: int
    sender_name: str
    transaction_id: str          # user's own phone number
    screenshot_note: Optional[str] = None

class EasypaisaAccountCreate(BaseModel):
    account_title: str
    account_number: str
    phone_number: Optional[str] = None
    method_type: Optional[str] = "easypaisa"
    deposit_message: Optional[str] = None

class PlanCreate(BaseModel):
    name: str
    price: float
    period_days: int
    daily_ads: int
    earning_per_click: float
    referral_levels: Optional[str] = "N/A"
    referral_commission: float
    sort_order: Optional[int] = 0

class PlanUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    period_days: Optional[int] = None
    daily_ads: Optional[int] = None
    earning_per_click: Optional[float] = None
    referral_levels: Optional[str] = None
    referral_commission: Optional[float] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None

class WithdrawalCreate(BaseModel):
    amount: float
    method: str
    wallet_address: str

class WithdrawalOut(BaseModel):
    id: int
    amount: float
    method: str
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    is_admin: bool
    username: str
