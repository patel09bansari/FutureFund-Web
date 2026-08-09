// backend/routes/plannerRoutes.js
const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/plannerController');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, plannerController.savePlanner);
router.get('/', authenticateToken, plannerController.getPlanner);

module.exports = router;
