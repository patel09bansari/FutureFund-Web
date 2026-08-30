const pool = require('../config/db');

/**
 * Get user profile data
 */
const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Fetch basic user info
        const [users] = await pool.execute(
            'SELECT id, email, full_name, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Fetch financial profile info if it exists
        const [profiles] = await pool.execute(
            'SELECT * FROM financial_profiles WHERE user_id = ?',
            [userId]
        );

        res.json({
            success: true,
            user: users[0],
            profile: profiles.length > 0 ? profiles[0] : null
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update user profile data
 */
const updateProfile = async (req, res, next) => {
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
        if (full_name && full_name.trim() !== '') {
            await pool.execute(
                'UPDATE users SET full_name = ? WHERE id = ?',
                [full_name.trim(), userId]
            );
        }

        // Validate numbers if provided
        const parsedAge = age ? parseInt(age, 10) : null;
        const parsedIncome = monthly_income ? parseFloat(monthly_income) : null;
        const parsedSavings = monthly_savings ? parseFloat(monthly_savings) : null;

        if (parsedAge !== null && (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 120)) {
            return res.status(400).json({ success: false, message: 'Invalid age' });
        }
        if (parsedIncome !== null && (isNaN(parsedIncome) || parsedIncome < 0)) {
            return res.status(400).json({ success: false, message: 'Invalid monthly income' });
        }
        if (parsedSavings !== null && (isNaN(parsedSavings) || parsedSavings < 0)) {
            return res.status(400).json({ success: false, message: 'Invalid monthly savings' });
        }

        if (parsedAge !== null || parsedIncome !== null || parsedSavings !== null || risk_tolerance || occupation_type) {
            // Check if profile exists
            const [profiles] = await pool.execute(
                'SELECT id FROM financial_profiles WHERE user_id = ?',
                [userId]
            );

            if (profiles.length > 0) {
                // Update existing
                await pool.execute(
                    `UPDATE financial_profiles 
                     SET age = COALESCE(?, age), monthly_income = COALESCE(?, monthly_income), monthly_savings = COALESCE(?, monthly_savings), risk_tolerance = COALESCE(?, risk_tolerance), occupation_type = COALESCE(?, occupation_type) 
                     WHERE user_id = ?`,
                    [parsedAge, parsedIncome, parsedSavings, risk_tolerance, occupation_type, userId]
                );
            } else {
                // Insert new
                await pool.execute(
                    `INSERT INTO financial_profiles 
                     (user_id, age, monthly_income, monthly_savings, risk_tolerance, occupation_type) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [userId, parsedAge, parsedIncome, parsedSavings, risk_tolerance, occupation_type]
                );
            }
        }

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile
};
