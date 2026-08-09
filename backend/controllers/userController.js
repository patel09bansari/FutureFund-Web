const pool = require('../config/db');

/**
 * Get user profile data
 */
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch basic user info
        const [users] = await pool.execute(
            'SELECT id, email, full_name, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch financial profile info if it exists
        const [profiles] = await pool.execute(
            'SELECT * FROM financial_profiles WHERE user_id = ?',
            [userId]
        );

        res.json({
            user: users[0],
            profile: profiles.length > 0 ? profiles[0] : null
        });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Update user profile data
 * This controller handles TWO types of updates:
 * 1. Basic user info (full_name) -> updates the 'users' table
 * 2. Financial profile fields (age, income, etc.) -> updates the 'financial_profiles' table
 */
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            full_name,
            age, 
            monthly_income, 
            monthly_savings, 
            risk_tolerance, 
            occupation_type 
        } = req.body;

        // Update basic user info if full_name is provided
        if (full_name) {
            await pool.execute(
                'UPDATE users SET full_name = ? WHERE id = ?',
                [full_name, userId]
            );
        }

        // Update financial profile fields only if any are provided
        if (age || monthly_income || monthly_savings || risk_tolerance || occupation_type) {
            // Check if profile exists
            const [profiles] = await pool.execute(
                'SELECT id FROM financial_profiles WHERE user_id = ?',
                [userId]
            );

            if (profiles.length > 0) {
                // Update existing
                await pool.execute(
                    `UPDATE financial_profiles 
                     SET age = ?, monthly_income = ?, monthly_savings = ?, risk_tolerance = ?, occupation_type = ? 
                     WHERE user_id = ?`,
                    [age, monthly_income, monthly_savings, risk_tolerance, occupation_type, userId]
                );
            } else {
                // Insert new
                await pool.execute(
                    `INSERT INTO financial_profiles 
                     (user_id, age, monthly_income, monthly_savings, risk_tolerance, occupation_type) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [userId, age, monthly_income, monthly_savings, risk_tolerance, occupation_type]
                );
            }
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getProfile,
    updateProfile
};
