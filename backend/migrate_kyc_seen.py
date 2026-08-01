import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'sql_app.db')

def migrate():
    print(f"Connecting to {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE kyc_requests ADD COLUMN is_seen BOOLEAN DEFAULT 0")
        print("Successfully added 'is_seen' column to kyc_requests.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column 'is_seen' already exists.")
        else:
            print(f"Error: {e}")
            
    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()
