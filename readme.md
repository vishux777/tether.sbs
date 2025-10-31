# Tether - AI-Powered Safe Route Navigation

Tether is a navigation app that uses Google's Gemini AI to analyze route safety based on recent news and incident data.

## Features

- 🗺️ Interactive map with route planning
- 🛡️ AI-powered safe route analysis using Gemini
- 📍 Multiple route alternatives comparison
- 🚨 Safety scoring based on recent incidents

## Architecture

The app follows a **reasoning engine** architecture where:

1. **Server gathers all data**:
   - Fetches multiple route alternatives from Mapbox Directions API
   - Collects news/incident data from external APIs (configurable)
   
2. **Gemini analyzes the data**:
   - Receives all route options and incident data in a single prompt
   - Applies a safety scoring formula
   - Returns JSON with the safest route recommendation

3. **Client displays the result**:
   - Shows the safest route highlighted in green
   - Displays safety scores for all route alternatives
   - Provides detailed reasoning from the AI analysis

## Setup

### Prerequisites

- Node.js 18+ and npm
- Mapbox account and access token
- Google Gemini API key (for safe route analysis)

### Installation

1. Install dependencies:
```bash
npm install
cd server && npm install
```

2. Configure environment variables:

Create a `.env` file in the `server` directory with:

```env
PORT=3000
VITE_MAPBOX_TOKEN=your_mapbox_access_token_here
GEMINI_API_KEY=your_gemini_api_key_here
NEWS_API_KEY=your_news_api_key_here  # Optional
```

Or create a `.env` file in the root directory for Vite:

```env
VITE_MAPBOX_TOKEN=your_mapbox_access_token_here
```

### Running the Application

1. Start the server:
```bash
npm run server
```

2. Start the frontend (in a separate terminal):
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port Vite assigns).

## API Endpoints

### Regular Directions
```
GET /api/directions?start=lng,lat&end=lng,lat
```

Returns a single route from start to end coordinates.

### Safe Directions (Gemini Analysis)
```
GET /api/directions/safe?start=lng,lat&end=lng,lat
```

Returns:
- Multiple route alternatives
- Safety scores for each route
- Gemini AI's reasoning for the safest route
- The recommended safest route with full geometry

## How It Works

### Safety Formula

The safety scoring formula (configurable in the controller):
- Starting score: 10
- Subtract 3 points for each "Theft" or "Assault" report near the route
- Subtract 1 point for each "Protest" or "Traffic Accident" report near the route
- Route with highest final score is recommended

### News/Incident Data Integration

The `getNewsIncidents()` function in `server/controllers/safeDirectionsController.js` is a placeholder. You can integrate with:

- **NewsAPI.org**: https://newsapi.org/docs/endpoints/everything
- **CrimeoMeter API**: https://www.crimeometer.com/
- **SACHET API** (India): https://sachet.ndma.gov.in/

Example integration code is commented in the controller file.

## Development

### Project Structure

```
tether/
├── server/              # Express backend
│   ├── controllers/     # Route controllers
│   ├── routes/          # API routes
│   └── server.js        # Server entry point
├── src/                 # React frontend
│   └── mapBox/          # Map components
└── public/              # Static assets
```

### Adding News API Integration

Edit `server/controllers/safeDirectionsController.js` and implement the `getNewsIncidents()` function. The function should return an array of incidents in this format:

```javascript
[
  {
    type: "Theft",
    title: "Theft reported on Main St",
    location: "Main St, Andheri",
    coordinates: { lat: 19.07, lng: 72.87 },
    time: "2025-10-31T22:00:00Z"
  }
]
```

## License

MIT
