# PTC Pro - Setup Guide

## Prerequisites
- Python 3.9+
- Node.js 16+
- MySQL Server

---

## 1. Database Setup
Create a MySQL database:
```sql
CREATE DATABASE ptcpro;
```

---

## 2. Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Edit .env file with your MySQL credentials
# DB_USER=root
# DB_PASSWORD=yourpassword

# Run seed (creates tables + admin user)
python seed.py

# Start backend server
python run.py
```
Backend runs at: http://localhost:8000

---

## 3. Frontend Setup
```bash
cd frontend

# Install dependencies (already done)
npm install

# Start frontend
npm start
```
Frontend runs at: http://localhost:3000

---

## Default Login Credentials

| Role  | Username  | Password  |
|-------|-----------|-----------|
| Admin | admin     | admin123  |
| User  | demouser  | demouser  |

---

## API Endpoints
- POST /auth/register
- POST /auth/login
- GET  /user/profile
- GET  /user/ads
- POST /user/click/{ad_id}
- POST /user/withdraw
- GET  /admin/stats
- GET  /admin/users
- POST /admin/ads
- GET  /admin/withdrawals
- PUT  /admin/withdrawals/{id}/approve
