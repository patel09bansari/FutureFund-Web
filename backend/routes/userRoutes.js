// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
router.get('/', (req, res) => res.json({ message: 'GET /api/profile — coming in Phase 2' }));
router.put('/', (req, res) => res.json({ message: 'PUT /api/profile — coming in Phase 2' }));
module.exports = router;
