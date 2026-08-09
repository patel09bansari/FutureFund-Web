const pool = require('../config/db');

/**
 * Get all expenses for a user
 */
const getExpenses = async (req, res) => {
    try {
        const userId = req.user.id;
        const [expenses] = await pool.execute(
            'SELECT * FROM expenses WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.json({ expenses });
    } catch (error) {
        console.error('Get Expenses Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Create a new expense
 */
const createExpense = async (req, res) => {
    try {
        const userId = req.user.id;
        const { category, amount, description, is_recurring } = req.body;

        if (!category || !amount) {
            return res.status(400).json({ error: 'Missing required expense fields' });
        }

        const [result] = await pool.execute(
            `INSERT INTO expenses 
             (user_id, category, amount, description, is_recurring) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, category, amount, description || '', is_recurring || false]
        );

        res.status(201).json({ 
            message: 'Expense created successfully',
            expenseId: result.insertId 
        });
    } catch (error) {
        console.error('Create Expense Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Update an expense
 */
const updateExpense = async (req, res) => {
    try {
        const userId = req.user.id;
        const expenseId = req.params.id;
        const { category, amount, description, is_recurring } = req.body;

        const [result] = await pool.execute(
            `UPDATE expenses 
             SET category = ?, amount = ?, description = ?, is_recurring = ?
             WHERE id = ? AND user_id = ?`,
            [category, amount, description, is_recurring, expenseId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Expense not found or unauthorized' });
        }

        res.json({ message: 'Expense updated successfully' });
    } catch (error) {
        console.error('Update Expense Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Delete an expense
 */
const deleteExpense = async (req, res) => {
    try {
        const userId = req.user.id;
        const expenseId = req.params.id;

        const [result] = await pool.execute(
            'DELETE FROM expenses WHERE id = ? AND user_id = ?',
            [expenseId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Expense not found or unauthorized' });
        }

        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Delete Expense Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense
};
