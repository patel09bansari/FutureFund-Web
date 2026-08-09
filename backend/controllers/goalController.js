const pool = require('../config/db');

/**
 * Get all goals for a user
 */
const getGoals = async (req, res) => {
    try {
        const userId = req.user.id;
        const [goals] = await pool.execute(
            'SELECT * FROM financial_goals WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.json({ goals });
    } catch (error) {
        console.error('Get Goals Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Create a new goal
 */
const createGoal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { goal_name, target_amount, current_saved, timeline_years, category } = req.body;

        if (!goal_name || !target_amount || !timeline_years) {
            return res.status(400).json({ error: 'Missing required goal fields' });
        }

        const [result] = await pool.execute(
            `INSERT INTO financial_goals 
             (user_id, goal_name, target_amount, current_saved, timeline_years, category) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, goal_name, target_amount, current_saved || 0, timeline_years, category || 'Other']
        );

        res.status(201).json({ 
            message: 'Goal created successfully',
            goalId: result.insertId 
        });
    } catch (error) {
        console.error('Create Goal Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Update an existing goal
 */
const updateGoal = async (req, res) => {
    try {
        const userId = req.user.id;
        const goalId = req.params.id;
        const { goal_name, target_amount, current_saved, timeline_years, category, status } = req.body;

        const [result] = await pool.execute(
            `UPDATE financial_goals 
             SET goal_name = ?, target_amount = ?, current_saved = ?, timeline_years = ?, category = ?, status = ?
             WHERE id = ? AND user_id = ?`,
            [goal_name, target_amount, current_saved, timeline_years, category, status, goalId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Goal not found or unauthorized' });
        }

        res.json({ message: 'Goal updated successfully' });
    } catch (error) {
        console.error('Update Goal Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Delete a goal
 */
const deleteGoal = async (req, res) => {
    try {
        const userId = req.user.id;
        const goalId = req.params.id;

        const [result] = await pool.execute(
            'DELETE FROM financial_goals WHERE id = ? AND user_id = ?',
            [goalId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Goal not found or unauthorized' });
        }

        res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Delete Goal Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getGoals,
    createGoal,
    updateGoal,
    deleteGoal
};
