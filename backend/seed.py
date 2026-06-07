from app.database import SessionLocal, engine
from app.models.models import Base, User, MembershipPlan
from app.utils import hash_password, generate_referral_code
from sqlalchemy import text

Base.metadata.create_all(bind=engine)

# Add new columns to deposits if they don't exist (safe migration)
with engine.connect() as conn:
    for col, definition in [
        ("sender_name", "VARCHAR(100) NULL"),
        ("screenshot_path", "VARCHAR(255) NULL"),
    ]:
        try:
            conn.execute(text(f"ALTER TABLE deposits ADD COLUMN {col} {definition}"))
            conn.commit()
            print(f"Added column: {col}")
        except Exception:
            pass
    try:
        conn.execute(text("ALTER TABLE easypaisa_accounts ADD COLUMN method_type VARCHAR(20) DEFAULT 'easypaisa'"))
        conn.commit()
        print("Added column: method_type")
    except Exception:
        pass

db = SessionLocal()

# Create admin user
if not db.query(User).filter(User.username == "admin").first():
    admin = User(
        username="admin",
        email="admin@ptcpro.com",
        password=hash_password("admin123"),
        referral_code=generate_referral_code(),
        is_admin=True,
        membership="premium"
    )
    db.add(admin)

# Create demo user
if not db.query(User).filter(User.username == "demouser").first():
    demo = User(
        username="demouser",
        email="demo@ptcpro.com",
        password=hash_password("demouser"),
        referral_code=generate_referral_code(),
        is_admin=False,
        membership="free"
    )
    db.add(demo)

# Create membership plans
if db.query(MembershipPlan).count() == 0:
    plans = [
        MembershipPlan(name="free", price=0, daily_ads=5, earning_per_click=0.001, referral_commission=0.05),
        MembershipPlan(name="basic", price=5, daily_ads=15, earning_per_click=0.003, referral_commission=0.08),
        MembershipPlan(name="premium", price=20, daily_ads=50, earning_per_click=0.01, referral_commission=0.10),
    ]
    db.add_all(plans)

db.commit()
db.close()
print("Seed completed! Admin: admin/admin123 | Demo: demouser/demouser")
