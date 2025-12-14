const express = require('express');
const router = express.Router();
const sweetController = require('../controllers/sweetController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
//auth
router.get('/', authenticateToken, sweetController.getAllSweets);
router.post('/', authenticateToken, requireAdmin, upload.single('image'), sweetController.createSweet);

//sweets
router.get('/search', authenticateToken, sweetController.searchSweets);
router.put('/:id', authenticateToken, requireAdmin, sweetController.updateSweet);
router.delete('/:id', authenticateToken, requireAdmin, sweetController.deleteSweet);

//inventory
router.post('/:id/purchase', authenticateToken, sweetController.purchaseSweet);
router.post('/:id/restock', authenticateToken, requireAdmin, sweetController.restockSweet);

module.exports = router;