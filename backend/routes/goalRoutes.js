// backend/routes/goalRoutes.js
const express = require('express');
const router = express.Router();
router.get('/',      (req, res) => res.json({ goals: [] }));
router.post('/',     (req, res) => res.json({ message: 'Goal created — coming in Phase 2' }));
router.put('/:id',   (req, res) => res.json({ message: 'Goal updated — coming in Phase 2' }));
router.delete('/:id',(req, res) => res.json({ message: 'Goal deleted — coming in Phase 2' }));
module.exports = router;
