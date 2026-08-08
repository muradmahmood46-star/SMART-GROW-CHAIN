from sqlalchemy.orm import Session
from app.models.models import User, SiteSettings
from datetime import datetime

def distribute_multi_level_commission(db: Session, base_user: User, base_amount: float, bonus_type: str, detail_prefix: str = "Commission"):
    """
    Distributes commission to L1, L2, L3 referrers based on Global Settings.
    bonus_type: 'reg', 'plan', 'deposit', 'ad'
    base_amount: For fixed (reg), this is usually 1. For %, this is the transaction amount.
    """
    # 1. Check if referral system is enabled
    sys_enabled = db.query(SiteSettings).filter(SiteSettings.key == "ref_system_enabled").first()
    if not sys_enabled or sys_enabled.value != "true":
        return

    # 2. Check if this specific bonus is enabled
    bonus_enabled = db.query(SiteSettings).filter(SiteSettings.key == f"ref_{bonus_type}_bonus_enabled").first()
    if not bonus_enabled or bonus_enabled.value != "true":
        return

    # 3. Get rates/amounts for L1, L2, L3
    rates = {1: 0.0, 2: 0.0, 3: 0.0}
    for level in [1, 2, 3]:
        r = db.query(SiteSettings).filter(SiteSettings.key == f"ref_{bonus_type}_bonus_l{level}").first()
        if r:
            try:
                rates[level] = float(r.value)
            except:
                pass

    # 4. Traverse the referral tree
    current_referrer_id = base_user.referred_by
    for level in [1, 2, 3]:
        if not current_referrer_id:
            break # Reached the top of the tree
        
        referrer = db.query(User).filter(User.id == current_referrer_id).first()
        if not referrer:
            break
            
        rate = rates[level]
        if rate > 0:
            if bonus_type == 'reg':
                comm_amount = rate # Fixed amount
            else:
                comm_amount = (rate / 100.0) * base_amount # Percentage
                
            if comm_amount > 0:
                referrer.balance += comm_amount
                referrer.total_earned += comm_amount
                

                
                from app.models.models import Earning, Notification
                # Find appropriate type
                e_type = f"referral_{bonus_type}"
                db.add(Earning(user_id=referrer.id, ad_id=0, amount=comm_amount, type=e_type))
                db.add(Notification(user_id=referrer.id, title=f"Referral {detail_prefix}! 💸", message=f"You earned Rs. {comm_amount:.2f} from Level {level} network ({base_user.username})."))
                
        # Move up the tree
        current_referrer_id = referrer.referred_by

    db.commit()
