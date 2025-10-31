// Client Request → Express Server → Directions Route → Directions Controller → Mapbox API
const express = require('express');
const { getDirections } = require('../controllers/directionsController');

const router = express.Router();

router.get('/', getDirections); //api/directions

module.exports = router;

