// backend/server.js
// Why this file exists: This is the main entry point for our Express server.
// It configures middleware, registers API routes, and optionally serves frontend
// static files in development mode.
//
// ARCHITECTURE NOTE:
// In DEVELOPMENT: Express serves both the API (/api/*) and the frontend files.
// In PRODUCTION:  Frontend is deployed separately (Vercel/Netlify).
//                 This server ONLY handles API requests.
//                 CORS allows the separate frontend domain to call our APIs.

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ---------------------------------------------------------------------------
// CORS Configuration
// In production, the frontend and backend will be on different domains.
// We configure CORS to allow requests from the frontend's origin.
// ---------------------------------------------------------------------------
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5000', 'http://localhost:3000', 'http://127.0.0.1:5500'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all in development; restrict in production
        }
    },
    credentials: true
}));

app.use(express.json()); // Parses incoming JSON data in request bodies

// ---------------------------------------------------------------------------
// Static File Serving — DEVELOPMENT ONLY
// In production, frontend files are hosted on Vercel/Netlify, not Express.
// ---------------------------------------------------------------------------
const NODE_ENV = process.env.NODE_ENV || 'development';

if (NODE_ENV === 'development') {
    console.log('📁 Development mode: Serving frontend static files via Express.');
    app.use(express.static(path.join(__dirname, '..')));
}

// ---------------------------------------------------------------------------
// API Routes
// Each feature has its own route file for clean, modular code.
// All API endpoints are prefixed with /api/ so they never collide with
// frontend static file paths.
// ---------------------------------------------------------------------------
const authRoutes    = require('./routes/authRoutes');
const userRoutes    = require('./routes/userRoutes');
const goalRoutes    = require('./routes/goalRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const plannerRoutes = require('./routes/plannerRoutes');

app.use('/api/auth',     authRoutes);
app.use('/api/profile',  userRoutes);
app.use('/api/goals',    goalRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/planner',  plannerRoutes);

// Health check endpoint (useful for deployment monitoring)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', environment: NODE_ENV, timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// 404 Handler for API Routes (Express v5 requires named wildcards)
// ---------------------------------------------------------------------------
app.use('/api/{*path}', (req, res) => {
    res.status(404).json({ success: false, message: 'API route not found' });
});

// ---------------------------------------------------------------------------
// Catch-All Route — DEVELOPMENT ONLY
// In development, if no API route or static file matches, serve index.html.
// ---------------------------------------------------------------------------
if (NODE_ENV === 'development') {
    app.get('/{*path}', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'index.html'));
    });
}

// ---------------------------------------------------------------------------
// Centralized Error Handling Middleware
// ---------------------------------------------------------------------------
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    
    // Handle JSON parsing errors
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
    }
    
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
});

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 FutureFund Server running on http://localhost:${PORT}`);
    console.log(`   Environment: ${NODE_ENV}`);
    console.log(`   API Base:    http://localhost:${PORT}/api`);
});
