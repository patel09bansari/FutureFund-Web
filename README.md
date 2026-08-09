# FutureFund: Financial Planning Platform

FutureFund is an interactive, full-stack personal finance application. It bridges the gap between complex financial planning and beginner-friendly education, empowering users to take control of their financial health through a beautiful, offline-first interface backed by a secure REST API.

## 🚀 Features

- **Thick Client Architecture**: The core "Financial Intelligence Engine" runs entirely in the browser (offline-first), providing instant feedback and dynamic recalculations without waiting for network requests.
- **RESTful API Backend**: A Node.js/Express backend handles secure JWT authentication, data persistence, and synchronization with a MySQL database.
- **Scenario Simulator**: A dynamic modal that lets users tweak their income, expenses, and investments to instantly see how it affects their overall Financial Health Score.
- **Smart Calculators**: Five interactive calculators (SIP, EMI, Compound Interest, Goal Planning, Retirement) complete with Chart.js visualizations and contextual educational warnings (e.g., warning users if their loan interest constitutes over 40% of their total payments).
- **Learning Hub**: A curated repository of beginner-friendly articles, tracking the user's learning progress directly on their dashboard.
- **Responsive UI/UX**: Built with Bootstrap 5 and vanilla CSS for a clean, modern, and mobile-responsive "Fintech" aesthetic.

## 🛠 Tech Stack

- **Frontend**: HTML5, CSS3, Bootstrap 5, Vanilla JavaScript (ES6+).
- **Visualization**: Chart.js (Doughnut, Bar, Radar, and Pie charts).
- **Backend**: Node.js, Express.js (v5).
- **Database**: MySQL.
- **Authentication**: JWT (JSON Web Tokens), bcrypt.

## 📁 Project Structure

```text
FutureFund/
├── backend/                  # Node.js + Express Backend
│   ├── controllers/          # Business logic for APIs (auth, user, goals)
│   ├── middleware/           # auth.js (JWT verification)
│   ├── routes/               # API route definitions
│   ├── db.js                 # MySQL connection pool
│   └── server.js             # Express entry point
├── css/                      # Stylesheets
│   ├── main.css              # Core global styles
│   ├── theme.css             # Light/Dark mode CSS variables
│   └── components.css        # Specific component styling
├── js/                       # Thick Client Frontend Logic
│   ├── app.js                # Core init (Theme, AOS)
│   ├── engine.js             # Core Financial Intelligence rules engine
│   ├── api.js                # Centralized Fetch wrapper for API calls
│   ├── storage.js            # LocalStorage fallback & API Sync logic
│   └── calculators/          # Specific JS for calculators
├── pages/                    # HTML Views
│   ├── dashboard.html        # Main Financial Command Center
│   ├── calculators.html      # Calculator Hub
│   ├── resources.html        # Learning Hub
│   ├── profile.html          # User Settings
│   ├── planner/              # Multi-step financial data intake form
│   └── calculators/          # Individual calculator pages
└── index.html                # Landing Page
```

## ⚙️ Setup and Installation

### Prerequisites
- Node.js (v18+)
- MySQL Server

### 1. Database Setup
1. Open MySQL and run the commands in `schema.sql` to generate the database structure.
2. The schema creates tables for `users`, `financial_profiles`, `goals`, and `expenses`.

### 2. Backend Setup
1. Open a terminal in the project root.
2. Run `npm install` to install backend dependencies (express, mysql2, bcrypt, jsonwebtoken, dotenv, cors).
3. Create a `.env` file in the root directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=futurefund_db
JWT_SECRET=super_secret_key_change_me
PORT=5000
```
4. Start the server: `node backend/server.js` (or use `nodemon`).

### 3. Frontend Setup
Because FutureFund is configured to serve static files from the backend during development, simply opening `http://localhost:5000/` in your browser will launch the fully connected Full-Stack application.

## 🧠 Architectural Decisions (Interview Reference)

- **Why a Thick Client?** Financial planning requires heavy user interaction (sliders, toggles, instant chart updates). By keeping the rules engine on the frontend, we guarantee zero latency and provide an app-like experience. The server is strictly for storage and identity.
- **Why LocalStorage Fallback?** If the backend goes down or the user loses internet connection, the application still works perfectly. The `storage.js` wrapper attempts an API call, and if it fails, falls back to `localStorage` and alerts the user with an "Offline Mode" toast.
- **Why Vanilla JS instead of React/Vue?** To demonstrate a deep, fundamental understanding of the DOM, Event Listeners, State Management, and browser APIs without hiding behind framework abstractions.

## 📄 Documentation

- [Database Schema (SCHEMA.md)](SCHEMA.md)
- [REST API Endpoints (API.md)](API.md)
