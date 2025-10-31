import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';
import './coreMap.css'
import MapSearchBox from './SearchBox';


mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function App() {

    // Default fallback location (Portland, OR) - will be updated with user's location
    const [center, setCenter] = useState([-122.6765, 45.5231])
    const [zoom, setZoom] = useState(10)
    const [mapLoaded, setMapLoaded] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [userLocation, setUserLocation] = useState(null)

  const mapRef = useRef()
  const mapContainerRef = useRef()
  const userLocationRef = useRef(null)

  // Get user's current location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = [position.coords.longitude, position.coords.latitude];
          setCenter(userCoords);
          setUserLocation(userCoords);
          userLocationRef.current = userCoords; // Store in ref for immediate access
          
          // Update map center if map is already initialized
          if (mapRef.current) {
            mapRef.current.setCenter(userCoords);
            mapRef.current.setZoom(14); // Zoom in closer for user location
            
            // Update origin circle to user's location
            const originSource = mapRef.current.getSource('origin-circle');
            if (originSource) {
              const originGeoJSON = {
                'type': 'FeatureCollection',
                'features': [
                  {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                      'type': 'Point',
                      'coordinates': userCoords
                    }
                  }
                ]
              };
              originSource.setData(originGeoJSON);
            }
            
          }
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          let errorMessage = 'Please enable location permission to use route planning.';
          
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = 'Location permission denied. Please enable location access in your browser settings to use this feature.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = 'Location information unavailable. Please check your device settings.';
          } else if (error.code === error.TIMEOUT) {
            errorMessage = 'Location request timed out. Please try again.';
          }
          
          alert(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert('Geolocation is not supported by this browser. Please use a modern browser with location support.');
    }
  }, []);

  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom,
      config: {
        show3dObjects: true,
        showPlaceLabels: true,
        showPedestrianRoads: true,
        showRoadLabels: true,
        showPointOfInterestLabels: true,
        showTransitLabels: true,
        showAdminBoundaries: true
      }
    });

    // Function to get route from backend API
    const getRoute = async (end) => {
      const map = mapRef.current;
      if (!map) return;

      // Get start coordinates from user's current location
      const start = userLocationRef.current;
      
      // Check if user location is available
      if (!start) {
        alert('Location permission is required to calculate routes. Please allow location access and refresh the page.');
        return;
      }
      
      // Validate coordinates
      if (!start || start.length !== 2 || isNaN(start[0]) || isNaN(start[1]) || 
          !end || end.length !== 2 || isNaN(end[0]) || isNaN(end[1])) {
        console.error('Invalid coordinates:', { start, end });
        alert('Invalid coordinates. Please try clicking on the map again.');
        return;
      }
      
      // Check if coordinates are too close to zero (invalid location)
      if (Math.abs(start[0]) < 0.1 && Math.abs(start[1]) < 0.1) {
        console.error('Start coordinates are invalid (too close to 0,0)');
        alert('Invalid start location. Please ensure location permission is granted.');
        return;
      }
      
      try {
        // Call backend API
        const response = await fetch(
          `http://localhost:3000/api/directions?start=${start[0]},${start[1]}&end=${end[0]},${end[1]}`
        );
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || 'Failed to fetch route';
          throw new Error(errorMessage);
        }

        const data = await response.json();
        
        if (data.geometry) {
          // Format geometry as GeoJSON Feature
          const routeGeoJSON = {
            type: 'Feature',
            properties: {},
            geometry: data.geometry
          };
          
          // Add route to map
          const routeSource = map.getSource('route');
          if (routeSource) {
            routeSource.setData(routeGeoJSON);
          } else {
            map.addSource('route', {
              type: 'geojson',
              data: routeGeoJSON
            });

            map.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#3887be',
                'line-width': 5,
                'line-opacity': 0.75
              }
            });
          }
        }

        // Get the sidebar and add the instructions
        const instructions = document.getElementById('instructions');
        if (instructions && data.legs && data.legs[0] && data.legs[0].steps) {
          const steps = data.legs[0].steps;
          const durationMin = Math.floor(data.duration / 60);
          const distanceKm = (data.distance / 1000).toFixed(2);
          const distanceMiles = (data.distance / 1609.34).toFixed(2);

          let tripInstructions = '';
          // Display all steps from the response
          for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            if (step.maneuver && step.maneuver.instruction) {
              tripInstructions += `<li>${step.maneuver.instruction}</li>`;
            }
          }

          // Show all content including all steps
          instructions.innerHTML = `
            <p id="prompt">📍 Click the map to get directions to another destination</p>
            <p><strong>⏱️ Duration: ${durationMin} min | 📍 Distance: ${distanceKm} km (${distanceMiles} mi)</strong></p>
            <h3 style="margin: 20px 0 12px 0; font-size: 16px; font-weight: 600; color: #333;">Route Instructions (${steps.length} steps):</h3>
            <ol style="margin: 0; padding-left: 24px;">${tripInstructions}</ol>
          `;
        } else if (instructions) {
          // Fallback if no steps
          instructions.innerHTML = `
            <p id="prompt">📍 Click the map to get directions to another destination</p>
            <p style="color: #666;">No route instructions available.</p>
          `;
        }
      } catch (error) {
        console.error('Error fetching route:', error);
        // Display error in instructions panel
        const instructions = document.getElementById('instructions');
        if (instructions) {
          instructions.innerHTML = `
            <p id="prompt">⚠️ Route Error</p>
            <p style="color: #dc2626; font-weight: 500; padding: 12px; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #dc2626;">
              ${error.message || 'Failed to fetch route'}
            </p>
            <p style="margin-top: 16px; color: #666;">📍 Click the map to try again with a different destination</p>
          `;
        }
      }
    };

    mapRef.current.on('load', () => {
      const map = mapRef.current;
      setMapLoaded(true);

      // Default destination coordinates (Portland, OR)
      const defaultEnd = [-122.61306001669664, 45.52776064404637];
      
      // Get start from user's current location
      // Wait for user location or show message
      const start = userLocationRef.current;
      
      if (!start) {
        // User location not available yet - create empty origin circle that will be updated
        // when location is received, or alert user
        alert('Waiting for your location... Please allow location permission to continue.');
      }

      // green_origin_circle - use user location if available
      const originCoords = start || [map.getCenter().lng, map.getCenter().lat]; // Temporary fallback for display
      map.addLayer({
        'id': 'origin-circle',
        'type': 'circle',
        'source': {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': [
              {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                  'type': 'Point',
                  'coordinates': originCoords
                }
              }
            ]
          }
        },
        'paint': {
          'circle-radius': 10,
          'circle-color': '#4ce05b'
        }
      });

      //red_destination_circle
      map.addLayer({
        'id': 'destination-circle',
        'type': 'circle',
        'source': {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': [
              {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                  'type': 'Point',
                  'coordinates': defaultEnd
                }
              }
            ]
          }
        },
        'paint': {
          'circle-radius': 10,
          'circle-color': '#f30'
        }
      });

      // Make an initial directions request on load only if user location is available
      if (userLocationRef.current) {
        getRoute(defaultEnd);
      } else {
        // Show instructions in sidebar while waiting for location
        const instructions = document.getElementById('instructions');
        if (instructions) {
          instructions.innerHTML = `
            <p id="prompt">📍 Location Required</p>
            <p style="color: #dc2626; font-weight: 500; padding: 12px; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #dc2626;">
              Please allow location permission to calculate routes. Refresh the page after granting permission.
            </p>
          `;
        }
      }

      // Add click handler to update destination and generate new route
      map.on('click', (event) => {
        const coords = Object.keys(event.lngLat).map(
          (key) => event.lngLat[key]
        );
        const end = {
          'type': 'FeatureCollection',
          'features': [
            {
              'type': 'Feature',
              'properties': {},
              'geometry': {
                'type': 'Point',
                'coordinates': coords
              }
            }
          ]
        };

        map.getSource('destination-circle').setData(end);

        getRoute(coords);
      });
    });

    mapRef.current.on('move', () => {
        const mapCenter = mapRef.current.getCenter()
        const mapZoom = mapRef.current.getZoom()

        setCenter([mapCenter.lng, mapCenter.lat])
        setZoom(mapZoom);
    });
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
      }
    }
  }, [])

  return (
    <>
          <div className="sidebar">
        Longitude: {center[0].toFixed(4)} | Latitude: {center[1].toFixed(4)} | Zoom: {zoom.toFixed(2)}
      </div>
      <div id='map-container' ref={mapContainerRef}/>
      {mapLoaded && mapRef.current && (
        <div className='search-box-container'>
          <MapSearchBox
            accessToken={import.meta.env.VITE_MAPBOX_TOKEN}
            map={mapRef.current}
            mapboxgl={mapboxgl}
            value={inputValue}
            onChange={(d) => {
              setInputValue(d);
            }}
            marker
          />
        </div>
      )}
      <div id='instructions'></div>
      
    </>
  )
}

export default App