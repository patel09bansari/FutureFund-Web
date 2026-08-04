// backend/routes/plannerRoutes.js
const express = require('express');
const router = express.Router();
router.post('/save',   (req, res) => res.json({ message: 'Planner saved — coming in Phase 2' }));
router.get('/result',  (req, res) => res.json({ result: null }));
module.exports = router;
