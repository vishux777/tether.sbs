const MAPBOX_ACCESS_TOKEN = process.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZGFya2V4cGxvaXRlciIsImEiOiJjbWhjeTJ4aGgwNGVqMmpzbDQ2bmN6ZnRyIn0.atnW1s3zftkqRX7mK3ycJA';
const DIRECTIONS_API_URL = 'https://api.mapbox.com/directions/v5/mapbox/driving';

async function getDirections(req, res) {
  try {
    const { start, end, profile = 'driving' } = req.query;

    if (!start || !end) {
      return res.status(400).json({ 
        error: 'Missing required parameters: start and end coordinates || incomplete route details' 
      });
    }

    // Parse coordinates - can be either arrays or comma-separated strings
    const parseCoordinates = (coord) => {
      if (Array.isArray(coord)) {
        return coord;
      }
      if (typeof coord === 'string') {
        const parsed = coord.split(',').map(Number);
        if (parsed.length === 2 && !isNaN(parsed[0]) && !isNaN(parsed[1])) {
          return parsed;
        }
      }
      throw new Error('Invalid coordinate format');
    };

    const startCoord = parseCoordinates(start);
    const endCoord = parseCoordinates(end);

    // Validate coordinate ranges (longitude: -180 to 180, latitude: -90 to 90)
    if (Math.abs(startCoord[0]) > 180 || Math.abs(startCoord[1]) > 90 ||
        Math.abs(endCoord[0]) > 180 || Math.abs(endCoord[1]) > 90) {
      return res.status(422).json({
        error: 'Invalid coordinates',
        message: 'Coordinates out of valid range. Longitude must be -180 to 180, latitude must be -90 to 90'
      });
    }

    // Check if coordinates are too close to zero (likely invalid)
    if ((Math.abs(startCoord[0]) < 0.1 && Math.abs(startCoord[1]) < 0.1) ||
        (Math.abs(endCoord[0]) < 0.1 && Math.abs(endCoord[1]) < 0.1)) {
      return res.status(422).json({
        error: 'Invalid coordinates',
        message: 'Coordinates appear to be invalid (too close to 0,0). Please provide valid geographic coordinates.'
      });
    }

    // Mapbox Directions API expects coordinates in format: [lng, lat]
    const coordinates = `${startCoord[0]},${startCoord[1]};${endCoord[0]},${endCoord[1]}`;

    // Build query parameters
    const params = new URLSearchParams({
      access_token: MAPBOX_ACCESS_TOKEN,
      geometries: 'geojson',
      overview: 'full',
      steps: 'true',
      alternatives: 'false',
    });

    const url = `${DIRECTIONS_API_URL}/${coordinates}?${params.toString()}`; //meat

    const response = await fetch(url); //apiCALL

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: 'Failed to fetch directions',
        message: errorData.message || response.statusText,
      });
    }

    const data = await response.json();

    if (data && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      
      res.json({
        success: true,
        distance: route.distance, // in meters
        duration: route.duration, // in seconds
        geometry: route.geometry,
        legs: route.legs,
        waypoints: data.waypoints,
      });
    } else {
      res.status(404).json({ 
        error: 'No route found' 
      });
    }
  } catch (error) {
    console.error('Directions API Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch directions',
      message: error.message,
    });
  }
}

module.exports = {
  getDirections,
};

