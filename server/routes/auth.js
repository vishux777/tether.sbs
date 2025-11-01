const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

// POST endpoints
router.post('/register', register);
router.post('/login', login);

// GET requests should return helpful error message
router.get('/register', (_req, res) => {
  res.status(405).json({ 
    message: 'Method not allowed. Use POST instead.',
    method: 'POST',
    endpoint: '/api/auth/register'
  });
});

router.get('/login', (_req, res) => {
  res.status(405).json({ 
    message: 'Method not allowed. Use POST instead.',
    method: 'POST',
    endpoint: '/api/auth/login'
  });
});

module.exports = router;


