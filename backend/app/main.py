from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.database import engine
from app.models.models import Base
from app.routes import auth, user, admin, deposit, userad
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[STARTUP] DB create_all error: {e}")
    os.makedirs("uploads/screenshots", exist_ok=True)
    from sqlalchemy import text
    migrations = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(20) DEFAULT 'none'",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS free_plan_expires_at TIMESTAMP",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP",
        "ALTER TABLE easypaisa_accounts ADD COLUMN IF NOT EXISTS deposit_message VARCHAR(500)",
        "ALTER TABLE easypaisa_accounts ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100)",
        "CREATE TABLE IF NOT EXISTS notifications (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), title VARCHAR(100), message TEXT, is_read BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW())",
        "INSERT INTO site_settings (key, value) VALUES ('referral_message', '') ON CONFLICT (key) DO NOTHING",
        "INSERT INTO site_settings (key, value) VALUES ('dashboard_message', '') ON CONFLICT (key) DO NOTHING",
        "INSERT INTO site_settings (key, value) VALUES ('whatsapp_link', '') ON CONFLICT (key) DO NOTHING",
        "INSERT INTO site_settings (key, value) VALUES ('transfer_message', '') ON CONFLICT (key) DO NOTHING",
        "INSERT INTO site_settings (key, value) VALUES ('registration_bonus', '0') ON CONFLICT (key) DO NOTHING",
        "ALTER TABLE membership_plans ADD COLUMN IF NOT EXISTS level_commissions VARCHAR(500) DEFAULT '{}'",
        "ALTER TABLE membership_plans ADD COLUMN IF NOT EXISTS level_details VARCHAR(1000) DEFAULT '{}'",
        "ALTER TABLE membership_plans ADD COLUMN IF NOT EXISTS required_referrals_per_level INTEGER DEFAULT 3",
        "ALTER TABLE referral_settings ADD COLUMN IF NOT EXISTS details VARCHAR(200)",
        "ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS payout_screenshot_path VARCHAR(255)",
        "ALTER TABLE kyc_requests ADD COLUMN IF NOT EXISTS phone VARCHAR(20)",
        "ALTER TABLE user_ad_requests ADD COLUMN IF NOT EXISTS sender_name VARCHAR(100)",
        "ALTER TABLE user_ad_requests ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100)",
        "ALTER TABLE kyc_requests ADD COLUMN IF NOT EXISTS is_seen BOOLEAN DEFAULT FALSE",
        "INSERT INTO site_settings (key, value) VALUES ('withdraw_enabled', 'true') ON CONFLICT (key) DO NOTHING",
        "INSERT INTO site_settings (key, value) VALUES ('withdraw_until', '') ON CONFLICT (key) DO NOTHING",
        "INSERT INTO site_settings (key, value) VALUES ('withdraw_schedule_time', '') ON CONFLICT (key) DO NOTHING",
        "UPDATE users SET membership = 'none', free_plan_expires_at = NULL, plan_expires_at = NULL WHERE id NOT IN (SELECT user_id FROM plan_purchase_requests WHERE status = 'approved')",
        "ALTER TABLE users ADD COLUMN total_session_seconds INTEGER DEFAULT 0",
        "ALTER TABLE users ADD COLUMN current_week_session_seconds INTEGER DEFAULT 0",
        "ALTER TABLE users ADD COLUMN last_session_week_start DATE",
        "ALTER TABLE users ADD COLUMN registration_week_start DATE",
        "UPDATE users SET registration_week_start = DATE(created_at, 'weekday 1', '-7 days') WHERE created_at IS NOT NULL AND registration_week_start IS NULL",
        "ALTER TABLE plan_purchase_requests ALTER COLUMN sender_phone TYPE VARCHAR(100)",
    ]
    try:
        with engine.connect() as conn:
            for sql in migrations:
                try:
                    conn.execute(text(sql))
                    conn.commit()
                except Exception as ex:
                    conn.rollback()
                    pass
    except Exception as e:
        print(f"[STARTUP] Migrations error: {e}")
    yield

app = FastAPI(title="Smart Grow Chain API", lifespan=lifespan)

from fastapi import Request
from fastapi.responses import JSONResponse
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": str(exc), "traceback": traceback.format_exc()})

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://smart-grow-chain.vercel.app",
    "https://smart-grow-chain.store",
    "https://www.smart-grow-chain.store",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(user.router)
app.include_router(admin.router)
app.include_router(deposit.router)
app.include_router(userad.router)

@app.get("/")
def read_root():
    return {"message": "Smart Grow Chain API is running"}
