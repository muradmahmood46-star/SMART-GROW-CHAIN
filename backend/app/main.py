from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.database import engine
from app.models.models import Base
from app.routes import auth, user, admin, deposit
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    os.makedirs("uploads/screenshots", exist_ok=True)
    yield

app = FastAPI(title="PTC Pro API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "https://smart-grow-chain-z98j.vercel.app"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Mount uploads only if directory exists
if os.path.exists("uploads"):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(user.router)
app.include_router(admin.router)
app.include_router(deposit.router)

@app.get("/")
def root():
    return {"message": "PTC Pro API Running"}
