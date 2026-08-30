const pool = require('../config/db');

/**
 * Get all expenses for a user
 */
const getExpenses = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const [expenses] = await pool.execute(
            'SELECT * FROM expenses WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.json({ success: true, expenses });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new expense
 */
const createExpense = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { category, amount, description, is_recurring } = req.body;

        if (!category || category.trim() === '') {
            return res.status(400).json({ success: false, message: 'Category is required' });
        }

        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
        }

        const [result] = await pool.execute(
            `INSERT INTO expenses (user_id, category, amount, description, is_recurring) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, category.trim(), amt, description || '', is_recurring ? 1 : 0]
        );

        res.status(201).json({ 
            success: true,
            message: 'Expense created successfully',
            expenseId: result.insertId 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing expense
 */
const updateExpense = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const expenseId = req.params.id;
        const { category, amount, description, is_recurring } = req.body;

        if (!category || category.trim() === '') {
            return res.status(400).json({ success: false, message: 'Category is required' });
        }

        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
        }

        // IMPORTANT: Verify ownership
        const [result] = await pool.execute(
            `UPDATE expenses 
             SET category = ?, amount = ?, description = ?, is_recurring = ?
             WHERE id = ? AND user_id = ?`,
            [category.trim(), amt, description || '', is_recurring ? 1 : 0, expenseId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Expense not found or unauthorized' });
        }

        res.json({ success: true, message: 'Expense updated successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete an expense
 */
const deleteExpense = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const expenseId = req.params.id;

        // IMPORTANT: Verify ownership
        const [result] = await pool.execute(
            'DELETE FROM expenses WHERE id = ? AND user_id = ?',
            [expenseId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Expense not found or unauthorized' });
        }

        res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense
};
