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
    ]
    try:
        with engine.connect() as conn:
            for sql in migrations:
                try:
                    conn.execute(text(sql))
                    conn.commit()
                except Exception:
                    pass
    except Exception as e:
        print(f"[STARTUP] Migration error: {e}")
    yield

app = FastAPI(
    title="Smart Grow Chain API",
    lifespan=lifespan, 
    docs_url="/docs", 
    openapi_url="/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(user.router)
app.include_router(admin.router)
app.include_router(deposit.router)
app.include_router(userad.router)

# Always mount uploads (dir created in lifespan)
os.makedirs("uploads/screenshots", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    return {"message": "Smart Grow Chain API Running"}
