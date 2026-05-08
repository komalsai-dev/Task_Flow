const express = require('express');
const { register, login, resetPasswordDemo } = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/reset-password
router.post('/reset-password', resetPasswordDemo);

module.exports = router;
