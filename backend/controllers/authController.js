const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

/**
 * Register a new user
 */
const register = async (req, res) => {
    try {
        const { email, password, full_name } = req.body;

        // Basic validation
        if (!email || !password || !full_name) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        // Check if user already exists
        const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'User with this email already exists' });
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
            message: 'User registered successfully',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Internal server error during registration' });
    }
};

/**
 * Login an existing user
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password' });
        }

        // Find user by email
        const [users] = await pool.execute(
            'SELECT id, email, password_hash, full_name FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate a JWT (JSON Web Token)
        // This token will be sent by the frontend in subsequent requests to prove identity
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // Token expires in 7 days
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
};

module.exports = {
    register,
    login
};
