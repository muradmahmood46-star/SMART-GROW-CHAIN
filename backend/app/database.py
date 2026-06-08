from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

# Neon Postgres Cloud Database URL uthane ke liye
DATABASE_URL = os.getenv("DATABASE_URL")

# Agar URL mil jaye toh badal do, warna backup ke liye purana sqlite chalega
if not DATABASE_URL:
    db_path = "/tmp/sql_app.db" if os.getenv("VERCEL") else "./sql_app.db"
    DATABASE_URL = f"sqlite:///{db_path}"

# Postgres ke liye simple engine configuration
if "sqlite" in DATABASE_URL:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()