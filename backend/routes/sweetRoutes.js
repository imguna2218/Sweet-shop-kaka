const express = require('express');
const router = express.Router();
const sweetController = require('../controllers/sweetController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// GET /api/sweets -> Anyone logged in can view
router.get('/', authenticateToken, sweetController.getAllSweets);

// POST /api/sweets -> Only Admins can add
router.post('/', authenticateToken, requireAdmin, sweetController.createSweet);

module.exports = router;