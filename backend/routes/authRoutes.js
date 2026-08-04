// backend/routes/authRoutes.js
// Handles user registration and login API routes.
const express = require('express');
const router = express.Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
    res.json({ message: 'Register endpoint — coming in Phase 2' });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
    res.json({ message: 'Login endpoint — coming in Phase 2' });
});

module.exports = router;
