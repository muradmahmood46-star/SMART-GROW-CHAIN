"""
Migration: add min_withdrawal, max_withdrawal to membership_plans
Run: py migrate_plans.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    # Check if columns exist first
    try:
        conn.execute(text("ALTER TABLE membership_plans ADD COLUMN min_withdrawal FLOAT DEFAULT 0.0"))
        print("Added min_withdrawal")
    except Exception as e:
        print(f"min_withdrawal: {e}")

    try:
        conn.execute(text("ALTER TABLE membership_plans ADD COLUMN max_withdrawal FLOAT DEFAULT 0.0"))
        print("Added max_withdrawal")
    except Exception as e:
        print(f"max_withdrawal: {e}")

    conn.commit()
    print("Migration complete.")
