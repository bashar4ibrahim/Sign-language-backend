// routes/auth.js
const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/register', auth.registerUser);
router.post('/login', auth.loginUser);
router.get('/me', auth.getCurrentUser);
router.get('/admin', authMiddleware, auth.getProfile);
router.post('/logout', auth.logoutUser); //  this

module.exports = router;
