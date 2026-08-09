// backend/routes/goalRoutes.js
const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, goalController.getGoals);
router.post('/', authenticateToken, goalController.createGoal);
router.put('/:id', authenticateToken, goalController.updateGoal);
router.delete('/:id', authenticateToken, goalController.deleteGoal);

module.exports = router;
