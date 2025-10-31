//centralRouter--->mount(allModules)

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const directionsRoutes = require('./directions');

// Mount_all_routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/directions', directionsRoutes);

module.exports = router;