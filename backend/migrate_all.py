"""
Migration: add all missing columns
Run: python migrate_all.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import engine
from sqlalchemy import text

migrations = [
    # membership_plans missing columns
    ("ALTER TABLE membership_plans ADD COLUMN IF NOT EXISTS level_commissions VARCHAR(500) DEFAULT '{}'", "level_commissions"),
    ("ALTER TABLE membership_plans ADD COLUMN IF NOT EXISTS level_details VARCHAR(1000) DEFAULT '{}'", "level_details"),
    ("ALTER TABLE membership_plans ADD COLUMN IF NOT EXISTS required_referrals_per_level INTEGER DEFAULT 3", "required_referrals_per_level"),
    ("ALTER TABLE membership_plans ADD COLUMN IF NOT EXISTS min_withdrawal FLOAT DEFAULT 0.0", "min_withdrawal"),
    ("ALTER TABLE membership_plans ADD COLUMN IF NOT EXISTS max_withdrawal FLOAT DEFAULT 0.0", "max_withdrawal"),
    ("ALTER TABLE membership_plans ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0", "sort_order"),
    ("ALTER TABLE membership_plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE", "is_active"),
    # easypaisa_accounts missing bank_name
    ("ALTER TABLE easypaisa_accounts ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100)", "bank_name in easypaisa_accounts"),
    ("ALTER TABLE easypaisa_accounts ADD COLUMN IF NOT EXISTS method_type VARCHAR(20) DEFAULT 'easypaisa'", "method_type in easypaisa_accounts"),
    ("ALTER TABLE easypaisa_accounts ADD COLUMN IF NOT EXISTS deposit_message VARCHAR(500)", "deposit_message in easypaisa_accounts"),
    # user_ad_requests actual_viewers
    ("ALTER TABLE user_ad_requests ADD COLUMN IF NOT EXISTS actual_viewers INTEGER DEFAULT 0", "actual_viewers in user_ad_requests"),
    ("ALTER TABLE referral_settings ADD COLUMN IF NOT EXISTS details VARCHAR(200)", "details in referral_settings"),
    ("ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS payout_screenshot_path VARCHAR(255)", "payout_screenshot_path in withdrawals"),
    ("ALTER TABLE kyc_requests ADD COLUMN IF NOT EXISTS phone VARCHAR(20)", "phone in kyc_requests"),
]

with engine.connect() as conn:
    for sql, label in migrations:
        try:
            conn.execute(text(sql))
            print(f"OK: {label}")
        except Exception as e:
            print(f"SKIP {label}: {e}")
    conn.commit()
    print("\nMigration complete.")
