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
    Base.metadata.create_all(bind=engine)
    os.makedirs("uploads/screenshots", exist_ok=True)
    # Safe column migrations
    from sqlalchemy import text
    migrations = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(20) DEFAULT 'none'",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS free_plan_expires_at TIMESTAMP",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP",
        "ALTER TABLE easypaisa_accounts ADD COLUMN IF NOT EXISTS deposit_message VARCHAR(500)",
        "CREATE TABLE IF NOT EXISTS notifications (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), title VARCHAR(100), message TEXT, is_read BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW())",
    ]
    with engine.connect() as conn:
        for sql in migrations:
            try:
                conn.execute(text(sql))
                conn.commit()
            except Exception:
                pass
    yield

app = FastAPI(
    title="PTC Pro API", 
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
    return {"message": "PTC Pro API Running"}