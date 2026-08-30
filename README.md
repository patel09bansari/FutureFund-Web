# FutureFund — Personal Financial Intelligence Platform

> A full-stack, offline-first financial planning web application for students and young professionals.

---

## What is FutureFund?

FutureFund is a personal finance platform that helps users plan their financial future through a guided step-by-step planner. It generates a **personalized, AI-assisted financial roadmap** based on income, expenses, debts, and goals — all without requiring an internet connection to generate results.

The data is saved locally first (offline-first), then synced to a MySQL database in the background when a connection is available.

---

## Problem It Solves

Most financial planning tools are:
- Too complex for beginners
- Require paid subscriptions
- Lose data when offline
- Don't explain *why* recommendations are made

FutureFund provides a **free, offline-capable, beginner-friendly** alternative that generates explainable financial recommendations.

---

## Main Features

- **6-Step Financial Planner**: Personal info → Income → Expenses → Debt → Goals → Risk
- **Financial Intelligence Engine**: Calculates health score, net worth, SIP requirements, retirement corpus, and more
- **Personalized Roadmap**: 0-3 month, 6-12 month, 1-3 year, and 3-10 year action plans
- **Goal Tracker**: Set financial goals with progress tracking (backed by MySQL)
- **Expense Manager**: Log and categorize monthly expenses (backed by MySQL)
- **Dashboard**: Dynamic financial command center with scenario simulator
- **Dark/Light Theme**: Theme preference persists across sessions
- **Offline First**: Works without internet; syncs to MySQL when available
- **JWT Authentication**: Secure login, registration, and protected routes

---

## Technology Stack

| Layer       | Technology                              |
|-------------|----------------------------------------|
| Frontend    | HTML5, CSS3, Bootstrap 5, Vanilla JS   |
| Charts      | Chart.js                               |
| Backend     | Node.js, Express.js                    |
| Database    | MySQL (via mysql2 driver)              |
| Auth        | JWT (jsonwebtoken) + bcrypt            |
| Storage     | localStorage (offline) + MySQL (sync)  |

---

## Architecture

```
THICK CLIENT + THIN SERVER + OFFLINE FIRST

Browser (Frontend)
  ├── HTML + Bootstrap 5 (UI)
  ├── js/engine.js (Financial Intelligence Engine — all calculations run here)
  ├── js/storage.js (localStorage wrapper + sync trigger)
  ├── js/api.js (Fetch wrapper — attaches JWT automatically)
  └── localStorage (offline source of truth)
          │
          │ (background sync when online)
          ▼
Express Server (Backend — thin storage pipe)
  ├── /api/auth     (register, login)
  ├── /api/profile  (get, update)
  ├── /api/planner  (save, get report_data JSON blob)
  ├── /api/goals    (CRUD)
  └── /api/expenses (CRUD)
          │
          ▼
MySQL Database
  ├── users
  ├── financial_profiles (stores report_data JSON blob)
  ├── financial_goals
  └── expenses
```

---

## Offline-First Strategy

1. **User fills in planner** → all data saved to `localStorage` immediately.
2. **Financial Engine runs** → calculations happen in-browser (no server needed).
3. **Report generated** → saved to `localStorage`.
4. **Background sync** → `FutureFundAPI.savePlanner()` sends the report JSON to MySQL.
5. **If offline** → step 4 is skipped, a notification informs the user.
6. **On next login** → data can be fetched back from MySQL via `GET /api/planner`.

**This means the app works 100% offline after the initial login.**

---

## Authentication Flow

```
Register → bcrypt hashes password → stored in MySQL (never plain text)
Login → compare hash → JWT issued (7-day expiry)
JWT → stored in localStorage as 'ff_jwt'
API requests → Authorization: Bearer <token> header attached automatically
Logout → clears ff_jwt + ff_user + planner data from localStorage
```

---

## Database Structure

### users
| Column        | Type         | Notes                      |
|--------------|--------------|----------------------------|
| id           | INT PK AI    |                            |
| email        | VARCHAR UNIQUE |                          |
| password_hash| VARCHAR      | bcrypt hash                |
| full_name    | VARCHAR      |                            |
| created_at   | TIMESTAMP    |                            |

### financial_profiles
| Column          | Type       | Notes                               |
|----------------|------------|-------------------------------------|
| id             | INT PK AI  |                                     |
| user_id        | INT FK     | → users(id) CASCADE DELETE          |
| age            | INT        |                                     |
| monthly_income | DECIMAL    |                                     |
| monthly_savings| DECIMAL    |                                     |
| risk_tolerance | VARCHAR    |                                     |
| report_data    | LONGTEXT   | Full JSON blob from engine.js       |

### financial_goals
| Column         | Type      | Notes           |
|---------------|-----------|-----------------|
| id            | INT PK AI |                 |
| user_id       | INT FK    |                 |
| goal_name     | VARCHAR   |                 |
| target_amount | DECIMAL   |                 |
| current_saved | DECIMAL   |                 |
| timeline_years| INT       |                 |

### expenses
| Column      | Type     | Notes            |
|------------|----------|------------------|
| id         | INT PK   |                  |
| user_id    | INT FK   |                  |
| category   | VARCHAR  |                  |
| amount     | DECIMAL  |                  |
| description| TEXT     |                  |
| is_recurring| BOOLEAN |                  |

---

## API Overview

| Method | Endpoint             | Auth | Description            |
|--------|---------------------|------|------------------------|
| POST   | /api/auth/register  | No   | Register new user      |
| POST   | /api/auth/login     | No   | Login, get JWT         |
| GET    | /api/profile        | Yes  | Get user + profile     |
| PUT    | /api/profile        | Yes  | Update profile         |
| POST   | /api/planner        | Yes  | Save report JSON       |
| GET    | /api/planner        | Yes  | Fetch saved report     |
| GET    | /api/goals          | Yes  | List goals             |
| POST   | /api/goals          | Yes  | Create goal            |
| PUT    | /api/goals/:id      | Yes  | Update goal            |
| DELETE | /api/goals/:id      | Yes  | Delete goal            |
| GET    | /api/expenses       | Yes  | List expenses          |
| POST   | /api/expenses       | Yes  | Create expense         |
| PUT    | /api/expenses/:id   | Yes  | Update expense         |
| DELETE | /api/expenses/:id   | Yes  | Delete expense         |

---

## Local Setup

### Prerequisites
- Node.js v18+ 
- MySQL (XAMPP or standalone)

### 1. Clone and Install

```bash
git clone https://github.com/your-username/futurefund.git
cd futurefund/backend
npm install
```

### 2. Configure Environment

```bash
copy .env.example .env
```

Edit `.env` with your actual MySQL credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=futurefund
JWT_SECRET=your_secure_random_secret
PORT=5000
```

> **IMPORTANT**: Never commit `.env` to Git. It is already in `.gitignore`.

### 3. Set Up MySQL Database

Start MySQL (e.g., XAMPP), then run:

```bash
# Windows (XAMPP):
C:\xampp\mysql\bin\mysql.exe -u root -p < schema.sql

# Or open MySQL Workbench and run schema.sql manually
```

### 4. Start the Backend

```bash
cd backend
npm start
# OR
node server.js
```

You should see:
```
🚀 FutureFund Server running on http://localhost:5000
Connected to MySQL database successfully.
```

### 5. Open the Frontend

Open a browser and go to:
```
http://localhost:5000
```

Or open `index.html` directly in a browser (offline mode only — API calls will fail but the planner still works).

---

## Running Tests

Make sure the backend is running and MySQL is connected, then:

```bash
cd backend
npm test
# OR
node test_api.js
```

This automatically tests:
- Registration
- Login
- Invalid login rejection
- Protected routes (with/without JWT)
- Planner save and retrieval
- Goals CRUD
- Expenses CRUD

---

## Environment Variables

| Variable         | Description                          | Default              |
|-----------------|--------------------------------------|----------------------|
| DB_HOST         | MySQL host                           | localhost            |
| DB_USER         | MySQL user                           | root                 |
| DB_PASSWORD     | MySQL password                       | (empty)              |
| DB_NAME         | Database name                        | futurefund           |
| JWT_SECRET      | Secret for signing JWTs              | (must be set)        |
| ALLOWED_ORIGINS | Comma-separated CORS origins         | localhost:5000       |
| PORT            | Server port                          | 5000                 |

---

## localStorage Keys Reference

| Key                    | Description                         |
|-----------------------|-------------------------------------|
| `ff_jwt`              | JWT authentication token            |
| `ff_user`             | Logged-in user object               |
| `futurefund_planner_step1` | Step 1 planner data           |
| `futurefund_planner_step2` | Step 2 planner data           |
| `futurefund_planner_step3` | Step 3 planner data           |
| `futurefund_planner_step4` | Step 4 planner data           |
| `futurefund_planner_step5` | Step 5 planner data           |
| `futurefund_planner_step6` | Step 6 planner data           |
| `futurefund_planner`  | Final merged planner data           |
| `futurefund_theme`    | UI theme preference (light/dark)    |

---

## Known Limitations

1. **No email verification** — Users can register with any email format. Production would require email confirmation.
2. **No password reset** — "Forgot password" is not implemented.
3. **JWT stored in localStorage** — More secure production apps use httpOnly cookies.
4. **No rate limiting** — API endpoints are not rate-limited (add `express-rate-limit` for production).
5. **CORS allows all origins in development** — Restrict `ALLOWED_ORIGINS` in production.
6. **No HTTPS enforced** — Use a reverse proxy (nginx) with SSL in production.

---

## Financial Disclaimer

> FutureFund provides **educational financial planning** based on user-provided information and assumptions. Projections are estimates and are **not guaranteed returns or professional financial advice**. Always consult a certified financial advisor before making major financial decisions.

---

## License

ISC
