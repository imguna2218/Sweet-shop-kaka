const express = require('express');
const router = express.Router();
const sweetController = require('../controllers/sweetController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');


router.get('/', authenticateToken, sweetController.getAllSweets);

// POST /api/sweets -> Only Admins can add
router.post('/', authenticateToken, requireAdmin, sweetController.createSweet);
router.get('/search', authenticateToken, sweetController.searchSweets);
module.exports = router;