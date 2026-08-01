import sqlite3
import datetime

def migrate():
    print("Starting session columns migration...")
    conn = sqlite3.connect("sql_app.db")
    cursor = conn.cursor()

    # Get existing columns
    cursor.execute("PRAGMA table_info(users)")
    columns = [info[1] for info in cursor.fetchall()]

    added = False
    try:
        if "total_session_seconds" not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN total_session_seconds INTEGER DEFAULT 0")
            print("Added total_session_seconds")
            added = True
            
        if "current_week_session_seconds" not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN current_week_session_seconds INTEGER DEFAULT 0")
            print("Added current_week_session_seconds")
            added = True
            
        if "last_session_week_start" not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN last_session_week_start DATE")
            print("Added last_session_week_start")
            added = True
            
        if "registration_week_start" not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN registration_week_start DATE")
            print("Added registration_week_start")
            added = True

        if added:
            conn.commit()
            
            # For existing users, backfill registration_week_start based on created_at
            # SQLite datetime functions can extract dates.
            # Using strftime('%Y-%m-%d', datetime(created_at, 'weekday 0', '-6 days')) for Monday week start
            # For simplicity, we just use the date of created_at as a proxy if we want to do it fast,
            # or we can compute in Python. Let's compute in Python to be safe.
            cursor.execute("SELECT id, created_at FROM users WHERE registration_week_start IS NULL")
            users = cursor.fetchall()
            for uid, created_at in users:
                if created_at:
                    try:
                        # Parse datetime
                        dt = datetime.datetime.strptime(created_at, "%Y-%m-%d %H:%M:%S.%f")
                    except ValueError:
                        try:
                            dt = datetime.datetime.strptime(created_at, "%Y-%m-%d %H:%M:%S")
                        except ValueError:
                            dt = datetime.datetime.utcnow()
                    # Calculate Monday of that week
                    monday = dt.date() - datetime.timedelta(days=dt.weekday())
                    cursor.execute("UPDATE users SET registration_week_start = ? WHERE id = ?", (str(monday), uid))
            conn.commit()
            print("Backfilled registration_week_start for existing users.")
            
        print("Migration complete.")
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
