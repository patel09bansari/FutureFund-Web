const pool = require('../config/db');

/**
 * Get all goals for a user
 */
const getGoals = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const [goals] = await pool.execute(
            'SELECT * FROM financial_goals WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.json({ success: true, goals });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new goal
 */
const createGoal = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { goal_name, target_amount, current_saved, timeline_years, category } = req.body;

        if (!goal_name || goal_name.trim() === '') {
            return res.status(400).json({ success: false, message: 'Goal name is required' });
        }

        const target = parseFloat(target_amount);
        const saved = parseFloat(current_saved || 0);
        const timeline = parseInt(timeline_years, 10);

        if (isNaN(target) || target <= 0) {
            return res.status(400).json({ success: false, message: 'Target amount must be greater than zero' });
        }
        if (isNaN(saved) || saved < 0) {
            return res.status(400).json({ success: false, message: 'Current saved cannot be negative' });
        }
        if (isNaN(timeline) || timeline <= 0) {
            return res.status(400).json({ success: false, message: 'Timeline must be at least 1 year' });
        }

        const [result] = await pool.execute(
            `INSERT INTO financial_goals 
             (user_id, goal_name, target_amount, current_saved, timeline_years, category) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, goal_name.trim(), target, saved, timeline, category || 'Other']
        );

        res.status(201).json({ 
            success: true,
            message: 'Goal created successfully',
            goalId: result.insertId 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing goal
 */
const updateGoal = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const goalId = req.params.id;
        const { goal_name, target_amount, current_saved, timeline_years, category, status } = req.body;

        if (!goal_name || goal_name.trim() === '') {
            return res.status(400).json({ success: false, message: 'Goal name is required' });
        }

        const target = parseFloat(target_amount);
        const saved = parseFloat(current_saved || 0);
        const timeline = parseInt(timeline_years, 10);

        if (isNaN(target) || target <= 0) {
            return res.status(400).json({ success: false, message: 'Target amount must be greater than zero' });
        }
        if (isNaN(saved) || saved < 0) {
            return res.status(400).json({ success: false, message: 'Current saved cannot be negative' });
        }
        if (isNaN(timeline) || timeline <= 0) {
            return res.status(400).json({ success: false, message: 'Timeline must be at least 1 year' });
        }

        // IMPORTANT: user_id is checked to prevent IDOR
        const [result] = await pool.execute(
            `UPDATE financial_goals 
             SET goal_name = ?, target_amount = ?, current_saved = ?, timeline_years = ?, category = ?, status = ?
             WHERE id = ? AND user_id = ?`,
            [goal_name.trim(), target, saved, timeline, category || 'Other', status || 'active', goalId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Goal not found or unauthorized' });
        }

        res.json({ success: true, message: 'Goal updated successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a goal
 */
const deleteGoal = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const goalId = req.params.id;

        // IMPORTANT: user_id is checked to prevent IDOR
        const [result] = await pool.execute(
            'DELETE FROM financial_goals WHERE id = ? AND user_id = ?',
            [goalId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Goal not found or unauthorized' });
        }

        res.json({ success: true, message: 'Goal deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getGoals,
    createGoal,
    updateGoal,
    deleteGoal
};
