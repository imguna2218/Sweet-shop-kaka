// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// When POST /register is hit, run the register function
router.post('/register', authController.register);

module.exports = router;