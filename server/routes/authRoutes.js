const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/login    → Login
router.post('/login', login);

// POST /api/auth/register → Register (first-time setup)
router.post('/register', register);

// GET  /api/auth/me       → Get current user
router.get('/me', protect, getMe);

module.exports = router;
