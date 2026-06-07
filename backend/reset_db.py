import os
import pymysql
from dotenv import load_dotenv

load_dotenv()

db_host = os.getenv("DB_HOST", "localhost")
db_port = int(os.getenv("DB_PORT", 3306))
db_user = os.getenv("DB_USER", "root")
db_password = os.getenv("DB_PASSWORD", "")
db_name = os.getenv("DB_NAME", "ptcpro")

print(f"Connecting to MySQL at {db_host}:{db_port} as '{db_user}'...")

try:
    conn = pymysql.connect(
        host=db_host,
        port=db_port,
        user=db_user,
        password=db_password
    )
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"DROP DATABASE IF EXISTS {db_name}")
            cursor.execute(f"CREATE DATABASE {db_name}")
            print(f"Database '{db_name}' reset (dropped and recreated) successfully.")
    finally:
        conn.close()
except Exception as e:
    print(f"Error resetting database: {e}")
    exit(1)
