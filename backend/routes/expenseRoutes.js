// backend/routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
router.get('/',       (req, res) => res.json({ expenses: [] }));
router.post('/',      (req, res) => res.json({ message: 'Expense added — coming in Phase 2' }));
router.delete('/:id', (req, res) => res.json({ message: 'Expense deleted — coming in Phase 2' }));
module.exports = router;
