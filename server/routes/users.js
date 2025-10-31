const express = require('express');
const { getProfile, updateLocation } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.post('/location', protect, updateLocation);

module.exports = router;


