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

app = FastAPI(
    title="PTC Pro API", 
    lifespan=lifespan, 
    docs_url="/docs", 
    openapi_url="/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    # Yahan "https://ptc-pro-fullstack.vercel.app" daal diya hai
    allow_origins=["https://ptc-pro-fullstack.vercel.app"], 
    allow_credentials=True, # Credentials True karna behtar hai agar login use kar rahe ho
    allow_methods=["*"], 
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