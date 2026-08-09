# FutureFund Interview Guide

This document is designed to help you confidently explain the FutureFund project in technical interviews. It covers the architecture, data flow, and common questions.

## 1. Architecture Overview

**"How is FutureFund built?"**

**Your Answer:** 
"FutureFund uses a **Thick Client + Thin Server** architecture. 
- The **Frontend** (HTML/CSS/Vanilla JS) acts as a 'Thick Client'. It contains the Financial Intelligence Engine, which handles all complex math and report generation locally in the browser. 
- The **Backend** (Node.js/Express) is a 'Thin Server'. It only handles Authentication (JWT/bcrypt) and Data Persistence (saving the final JSON report to MySQL).
- **Offline-First:** Because the frontend does all the calculations, the app works completely offline using `localStorage`. It only attempts to sync with the backend when an internet connection and JWT are available."

## 2. End-to-End Data Flow

**"Explain what happens when a user registers, logs in, and creates a financial plan."**

**Your Answer:**
1. **Registration (Browser ?' API ?' DB):** User fills out `register.html`. `api.js` sends a `POST /api/auth/register` request. Express hashes the password using `bcrypt` and stores the user in MySQL.
2. **Login:** User fills out `login.html`. Express compares the password. If valid, it signs a JSON Web Token (JWT) using a secret key and returns it. The frontend stores this in `localStorage` as `ff_jwt`.
3. **Planner Input (Browser Only):** The user answers 6 steps of financial questions. Steps 1-5 save their progress *only* to `localStorage`. No API calls are made to keep the UI lightning fast.
4. **Engine Generation (Browser Only):** On Step 6, the `engine.js` reads `localStorage`, runs deterministic financial algorithms, and creates a massive JSON object called `financial_report`.
5. **Syncing (Browser ?' API ?' DB):** Finally, `engine.js` calls `FutureFundStorage.saveWithSync()`. This function saves the JSON report to `localStorage` AND sends a `POST /api/planner` request with the JWT in the Authorization header. Express saves this JSON blob into the `financial_profiles` table in MySQL.
6. **Dashboard Hydration (DB ?' API ?' Browser):** When the user visits the dashboard later on a new device, `dashboard.js` sees the `ff_jwt`, calls `GET /api/planner`, downloads the JSON blob, updates `localStorage`, and the frontend renders the charts.

## 3. Common Interview Questions & Answers

### Q: Why didn't you use React or Angular?
**A:** "I wanted to prove my fundamental understanding of the DOM, Event Listeners, and modular JavaScript without relying on a framework's magic. Building a complex, multi-step state machine using Vanilla JS taught me exactly what problems tools like React solve."

### Q: How do you secure the API?
**A:** "I implemented JWT (JSON Web Tokens). When a user logs in, the backend signs a token with a secret key. The frontend sends this token in the `Authorization: Bearer <token>` header for all secure requests. The Express middleware verifies this signature before allowing access to the controllers."

### Q: How do you handle passwords?
**A:** "Passwords are never stored in plain text. I use `bcrypt` to hash the passwords with a salt before saving them to MySQL. During login, I use `bcrypt.compare()` to verify the input against the hash."

### Q: Why do you store the whole report as a JSON blob in MySQL instead of highly normalized tables?
**A:** "Because of the Thick Client architecture. The frontend Engine determines the schema of the financial report. By storing it as a JSON blob in the `financial_profiles` table, the backend remains decoupled from the specific financial formulas. If I add a new chart to the frontend, I don't have to write a database migration."

### Q: How does the Offline Fallback work?
**A:** "In `storage.js`, I created a wrapper called `saveWithSync()`. It accepts a `localStorage` key and an API Promise. It always saves to `localStorage` synchronously so the UI never blocks. It then `awaits` the API promise. If the promise fails (due to network error or server down), it catches the error and triggers a UI Toast saying 'Offline Mode'. The user experiences zero interruption."

## 4. Key Files to Know

1. **`js/api.js`:** The frontend `fetch` wrapper. Handles injecting the JWT into headers.
2. **`js/storage.js`:** The offline-first sync layer.
3. **`js/engine.js`:** The brain. Generates the `financial_report`.
4. **`backend/middleware/auth.js`:** The backend security guard that validates JWTs.
5. **`backend/server.js`:** The Express entry point that configures CORS and mounts routes.
