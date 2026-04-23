const express = require('express');
const protect = require('../middleware/auth');
const { signup, login, profile } = require('../controller/authcontroller');

const router = express.Router();

router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.get('/auth/profile', protect, profile);

module.exports = router;
