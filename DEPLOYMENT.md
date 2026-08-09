# FutureFund Deployment Guide

This guide explains how to deploy FutureFund as a Full-Stack application using Vercel (Frontend) and Render (Backend).

## Architecture
FutureFund uses a **Thick Client + Thin Server** architecture.
- The **Frontend** contains all business logic (Financial Intelligence Engine) and UI. It is deployed as static files.
- The **Backend** is a Node.js/Express API that handles Authentication and Database storage.
- The **Database** is a MySQL instance.

## 1. Database (MySQL)

You can host MySQL for free on providers like **Aiven**, **PlanetScale** (if still available for free tier), or **Railway**.

1. Create a MySQL database instance.
2. Get the connection credentials (Host, User, Password, Port, Database Name).
3. Run the SQL commands found in `SCHEMA.md` to create the tables.

## 2. Backend (Render)

Render is an excellent free tier host for Node.js apps.

1. Push your code to a GitHub repository.
2. Sign in to [Render](https://render.com/).
3. Create a new **Web Service** and connect your GitHub repo.
4. Set the **Root Directory** to `backend`.
5. Set the **Build Command** to `npm install`.
6. Set the **Start Command** to `node server.js`.
7. Add the following **Environment Variables**:
   - `DB_HOST`: Your MySQL host
   - `DB_USER`: Your MySQL user
   - `DB_PASSWORD`: Your MySQL password
   - `DB_NAME`: Your MySQL database name
   - `JWT_SECRET`: A long random string (e.g., `my_super_secret_jwt_key_123`)
   - `PORT`: `5000` (Render will override this, but good practice)
   - `ALLOWED_ORIGINS`: `https://your-frontend-domain.vercel.app`
8. Click **Deploy**. Note your new backend URL (e.g., `https://futurefund-api.onrender.com`).

## 3. Frontend (Vercel or Netlify)

1. Open `js/api.js`.
2. Locate the `API_BASE` variable at the top of the file.
3. Update it to point to your new Render backend URL when in production:
   ```javascript
   const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
       ? 'http://localhost:5000/api'
       : 'https://futurefund-api.onrender.com/api'; // Replace with your Render URL
   ```
4. Push these changes to GitHub.
5. Sign in to [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).
6. Import your GitHub repository.
7. Leave the build command empty (since it's Vanilla JS/HTML/CSS).
8. Click **Deploy**.

## 4. Verification

1. Go to your new Frontend URL.
2. Click **Register** and create an account.
3. If successful, you should be redirected to Login.
4. Log in and verify you are taken to the Dashboard.
5. Go through the Planner and verify it saves. 
6. Open your MySQL database viewer and confirm the data was inserted into `users` and `financial_profiles`.

Your Full-Stack application is now live!
