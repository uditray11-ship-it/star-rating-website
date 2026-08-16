# Store Rating App

Simple React + Express + MySQL project for the Full Stack Intern Coding Challenge.

## Important

Do not open `frontend/index.html` directly in the browser. This is a Vite/React application and must be started with Vite.

## 1. Database

Open MySQL Workbench and run `backend/seed.sql`.

## 2. Backend

Create `backend/.env` from `backend/.env.example`, then set your MySQL password.

```bash
cd backend
npm install
npm run seed
npm run dev
```

The API runs on http://localhost:5000.

## 3. Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, normally http://localhost:5173.

## Demo accounts

Admin:
- Email: admin@example.com
- Password: Admin@123

Owner:
- Email: owner@example.com
- Password: Owner@123

A normal user can be created from the Sign Up page.
