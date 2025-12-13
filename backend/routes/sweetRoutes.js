const express = require('express');
const router = express.Router();
const sweetController = require('../controllers/sweetController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');


router.get('/', authenticateToken, sweetController.getAllSweets);
router.post('/', authenticateToken, requireAdmin, sweetController.createSweet);

router.get('/search', authenticateToken, sweetController.searchSweets);

router.put('/:id', authenticateToken, requireAdmin, sweetController.updateSweet);
router.delete('/:id', authenticateToken, requireAdmin, sweetController.deleteSweet);

module.exports = router;