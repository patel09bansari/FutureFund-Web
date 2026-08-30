const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

/**
 * Register a new user
 */
const register = async (req, res, next) => {
    try {
        const { email, password, full_name } = req.body;

        // Basic validation
        if (!email || !password || !full_name) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }

        if (full_name.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Full name cannot be empty' });
        }

        // Check if user already exists
        const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ success: false, message: 'User with this email already exists' });
        }

        // Hash the password securely using bcrypt
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert new user into database
        const [result] = await pool.execute(
            'INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)',
            [email, passwordHash, full_name]
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            userId: result.insertId
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login an existing user
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        // Find user by email
        const [users] = await pool.execute(
            'SELECT id, email, password_hash, full_name FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const user = users[0];

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is missing from environment variables');
        }

        // Generate a JWT (JSON Web Token)
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } 
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login
};
