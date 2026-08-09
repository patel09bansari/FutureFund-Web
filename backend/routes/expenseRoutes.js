// backend/routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, expenseController.getExpenses);
router.post('/', authenticateToken, expenseController.createExpense);
router.put('/:id', authenticateToken, expenseController.updateExpense);
router.delete('/:id', authenticateToken, expenseController.deleteExpense);

module.exports = router;
