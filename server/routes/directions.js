// Client Request → Express Server → Directions Route → Directions Controller → Mapbox API
const express = require('express');
const { getDirections } = require('../controllers/directionsController');
const { getSafeDirections } = require('../controllers/safeDirectionsController');

const router = express.Router();

router.get('/', getDirections); //api/directions
router.get('/safe', getSafeDirections); //api/directions/safe

module.exports = router;

