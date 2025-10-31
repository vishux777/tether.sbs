# Safe Route Calculation Flow - Explained

## 🎯 The Big Picture

When you call `/api/directions/safe`, here's what happens:

```
User Request → Get Multiple Routes → Get News Data → Send to Gemini → Return Safest Route
```

---

## 📍 Step 1: Getting Multiple Route Alternatives

**Function**: `getRouteAlternatives(start, end)`
**Location**: Lines 26-82 in `safeDirectionsController.js`

### What it does:
1. Calls Mapbox Directions API with `alternatives: true`
2. Mapbox returns **2-3 different route options** (Route A, Route B, Route C)
3. Each route has:
   - `geometry` - **This is your path array!** (GeoJSON format)
   - `distance` - Route distance in meters
   - `duration` - Route time in seconds
   - `legs[0].steps[]` - Turn-by-turn instructions

### The Path Array Structure:

```javascript
// Each route's geometry looks like this (GeoJSON):
{
  type: "LineString",
  coordinates: [
    [lng1, lat1],  // Start point
    [lng2, lat2],  // Point on the path
    [lng3, lat3],  // Another point
    ...
    [lngN, latN]   // End point
  ]
}
```

**This coordinate array is what gets drawn on the map!**

### Code Breakdown:

```javascript
// Line 33: Request alternatives from Mapbox
alternatives: 'true',  // <-- This tells Mapbox to give us multiple routes

// Lines 51-75: Process each route
const routes = data.routes.map((route, index) => {
  return {
    routeName: `Route ${index + 1}`,
    geometry: route.geometry,  // <-- THE PATH ARRAY IS HERE
    distance: route.distance,
    duration: route.duration,
    waypoints: waypoints,      // Major points along the route
    fullRoute: route           // Keep everything for later
  };
});
```

---

## 📰 Step 2: Getting News/Incident Data (Currently Placeholder)

**Function**: `getNewsIncidents(centerLat, centerLng, radiusKm)`
**Location**: Lines 88-129

### What it does:
1. Calculates center point between start and end
2. Determines search radius (2-10 km)
3. **Currently returns empty array** - you need to integrate with a News API

### Expected Format (when you integrate):

```javascript
[
  {
    type: "Theft",           // Incident type
    location: "Main St",     // Location name
    coordinates: { lat: 19.07, lng: 72.87 },  // Where it happened
    time: "2025-10-31T22:00:00Z"
  },
  {
    type: "Protest",
    location: "Link Rd",
    coordinates: { lat: 19.08, lng: 72.88 },
    time: "2025-10-31T20:00:00Z"
  }
]
```

---

## 🤖 Step 3: Sending Everything to Gemini

**Function**: `analyzeRoutesWithGemini(routes, incidents)`
**Location**: Lines 134-199

### The Prompt Structure:

```javascript
const prompt = `
You are a safety analyst...

My Safety Formula:
- Starting score: 10
- Subtract 3 points for "Theft" or "Assault"
- Subtract 1 point for "Protest" or "Traffic Accident"

Recent News Reports:
${JSON.stringify(incidents)}

Route Options:
${routes.map(r => `- ${r.routeName}: [${r.waypoints}]`).join('\n')}

Return JSON:
{
  "safestRouteName": "Route 2",
  "reason": "Route 2 scored highest...",
  "routeScores": {
    "Route 1": 7,
    "Route 2": 9,
    "Route 3": 8
  }
}
`;
```

### What Gemini Does:
1. Takes all route data + incidents
2. Applies your safety formula to each route
3. Returns JSON with:
   - Which route is safest
   - Safety scores for all routes
   - Reasoning

---

## 📤 Step 4: Returning the Safest Route

**Function**: `getSafeDirections(req, res)` (Main function)
**Location**: Lines 204-310

### Response Structure:

```javascript
{
  success: true,
  safestRoute: {
    routeName: "Route 2",
    distance: 5234,        // meters
    duration: 720,         // seconds
    geometry: {            // <-- THIS IS THE PATH ARRAY TO DRAW ON MAP
      type: "LineString",
      coordinates: [[lng, lat], [lng, lat], ...]
    },
    fullRoute: { ... }    // Complete route data for turn-by-turn
  },
  allRoutes: [
    { routeName: "Route 1", distance: 5000, duration: 700, safetyScore: 7 },
    { routeName: "Route 2", distance: 5234, duration: 720, safetyScore: 9 },
    { routeName: "Route 3", distance: 5100, duration: 710, safetyScore: 8 }
  ],
  analysis: {
    reason: "Route 2 has the highest score...",
    routeScores: { "Route 1": 7, "Route 2": 9, "Route 3": 8 }
  }
}
```

---

## 🗺️ How the Client Uses It

**Location**: `src/mapBox/coreMap.jsx` (Lines 131-265)

### What happens on the frontend:

```javascript
// 1. Call the safe route API
const response = await fetch(`/api/directions/safe?start=${start}&end=${end}`);
const data = await response.json();

// 2. Extract the geometry (path array)
const geometry = data.safestRoute.geometry;

// 3. Draw it on the map
const routeGeoJSON = {
  type: 'Feature',
  properties: {},
  geometry: geometry  // <-- The path array from the server
};

map.addSource('route', {
  type: 'geojson',
  data: routeGeoJSON
});

// 4. Create a line layer to visualize it
map.addLayer({
  id: 'route',
  type: 'line',
  source: 'route',
  paint: {
    'line-color': '#10b981',  // Green for safe route
    'line-width': 5
  }
});
```

---

## 🔍 Key Points About the Path Array

1. **Format**: GeoJSON `LineString` with `coordinates` array
2. **Structure**: `[[lng, lat], [lng, lat], ...]` - Array of [longitude, latitude] pairs
3. **Source**: Comes directly from Mapbox Directions API
4. **Usage**: This is what gets drawn as the blue/green line on your map
5. **Each route has its own geometry**: Route 1, Route 2, Route 3 all have different path arrays

---

## 📊 Complete Flow Diagram

```
┌─────────────────┐
│  User clicks    │
│  on map         │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ GET /api/directions/safe│
│ ?start=lng,lat          │
│ &end=lng,lat            │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ getSafeDirections()     │
│                         │
│ 1. Parse coordinates    │
│ 2. Call getRouteAlts()  │───► Mapbox API (alternatives: true)
│    Returns: 3 routes    │
│                         │
│ 3. Call getNews()       │───► News API (currently empty)
│    Returns: []          │
│                         │
│ 4. Call analyzeRoutes() │───► Gemini AI
│    Returns: {           │
│      safestRouteName,   │
│      routeScores        │
│    }                    │
│                         │
│ 5. Find safest route    │
│    from routes array    │
│                         │
│ 6. Return JSON with:    │
│    - safestRoute.geometry◄── THE PATH ARRAY
│    - allRoutes scores    │
│    - analysis reason     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Client receives data    │
│                         │
│ - Extract geometry      │
│ - Draw on map           │
│ - Show safety scores    │
└─────────────────────────┘
```

---

## 🛠️ What You Need to Do Next

1. **Add Gemini API Key** to `.env`:
   ```
   GEMINI_API_KEY=your_key_here
   ```

2. **Integrate News API** (optional but recommended):
   - Edit `getNewsIncidents()` function
   - Uncomment the example code or add your own API call
   - Make sure to return incidents in the expected format

3. **Test it**:
   - Start server: `npm run server`
   - Start client: `npm run dev`
   - Toggle "Use Safe Route Analysis" checkbox
   - Click on the map to get a route

---

## 💡 Quick Reference

- **Path Array Location**: `route.geometry.coordinates` (GeoJSON format)
- **Multiple Routes**: Set `alternatives: true` in Mapbox API call
- **Safety Calculation**: Done by Gemini AI based on your formula
- **Response Format**: JSON with `safestRoute.geometry` containing the path

