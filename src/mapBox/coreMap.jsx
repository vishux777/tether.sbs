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
        // Fetch both routes in parallel
        const [regularResponse, safeResponse] = await Promise.allSettled([
          fetch(`http://localhost:3000/api/directions?start=${start[0]},${start[1]}&end=${end[0]},${end[1]}`),
          fetch(`http://localhost:3000/api/directions/safe?start=${start[0]},${start[1]}&end=${end[0]},${end[1]}`)
        ]);

        // Handle regular route (standard/fastest route)
        let regularData = null;
        if (regularResponse.status === 'fulfilled' && regularResponse.value.ok) {
          regularData = await regularResponse.value.json();
          
          if (regularData.geometry) {
            const routeGeoJSON = {
              type: 'Feature',
              properties: {},
              geometry: regularData.geometry
            };
            
            // Add or update regular route layer
            const regularSource = map.getSource('route-regular');
            if (regularSource) {
              regularSource.setData(routeGeoJSON);
            } else {
              map.addSource('route-regular', {
                type: 'geojson',
                data: routeGeoJSON
              });

              map.addLayer({
                id: 'route-regular',
                type: 'line',
                source: 'route-regular',
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round'
                },
                paint: {
                  'line-color': '#3887be', // Blue for regular route
                  'line-width': 5,
                  'line-opacity': 0.75
                }
              });
            }
            console.log('Regular route (blue) displayed:', regularData.distance / 1000, 'km');
          } else {
            console.warn('Regular route has no geometry');
          }
        } else {
          console.error('Regular route fetch failed:', 
            regularResponse.status === 'rejected' ? regularResponse.reason : 'HTTP error');
        }

        // Handle safe route (safest route - might be longer to avoid incidents)
        let safeData = null;
        if (safeResponse.status === 'fulfilled' && safeResponse.value.ok) {
          safeData = await safeResponse.value.json();
          
          const safestRoute = safeData.safestRoute || safeData;
          const geometry = safestRoute.geometry || safeData.geometry;
          
          if (geometry) {
            const routeGeoJSON = {
              type: 'Feature',
              properties: {},
              geometry: geometry
            };
            
            // Add or update safe route layer
            const safeSource = map.getSource('route-safe');
            if (safeSource) {
              safeSource.setData(routeGeoJSON);
            } else {
              map.addSource('route-safe', {
                type: 'geojson',
                data: routeGeoJSON
              });

              map.addLayer({
                id: 'route-safe',
                type: 'line',
                source: 'route-safe',
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round'
                },
                paint: {
                  'line-color': '#10b981', // Green for safe route
                  'line-width': 6, // Slightly thicker to make it stand out
                  'line-opacity': 0.85
                }
              });
            }
            console.log('Safe route (green) displayed:', safestRoute.distance / 1000, 'km');
          } else {
            console.warn('Safe route has no geometry');
          }
        } else {
          console.error('Safe route fetch failed:', 
            safeResponse.status === 'rejected' ? safeResponse.reason : 'HTTP error');
        }

        // Update instructions panel with both routes
        const instructions = document.getElementById('instructions');
        if (!instructions) return;

        let instructionsHTML = '';
        
        // Regular route info
        if (regularData) {
          const durationMin = Math.floor(regularData.duration / 60);
          const distanceKm = (regularData.distance / 1000).toFixed(2);
          const distanceMiles = (regularData.distance / 1609.34).toFixed(2);
          
          let tripInstructions = '';
          if (regularData.legs && regularData.legs[0] && regularData.legs[0].steps) {
            const steps = regularData.legs[0].steps;
            for (let i = 0; i < steps.length; i++) {
              const step = steps[i];
              if (step.maneuver && step.maneuver.instruction) {
                tripInstructions += `<li>${step.maneuver.instruction}</li>`;
              }
            }
          }

          instructionsHTML += `
            <div style="margin-bottom: 20px; padding: 12px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #3887be;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1e40af;">📍 Standard Route (Blue)</h3>
              <p style="margin: 4px 0;"><strong>⏱️ Duration: ${durationMin} min</strong></p>
              <p style="margin: 4px 0;"><strong>📍 Distance: ${distanceKm} km (${distanceMiles} mi)</strong></p>
              ${tripInstructions ? `<h4 style="margin: 12px 0 8px 0; font-size: 14px; font-weight: 600;">Route Instructions:</h4><ol style="margin: 0; padding-left: 24px; font-size: 13px;">${tripInstructions}</ol>` : ''}
            </div>
          `;
        }

        // Safe route info
        if (safeData && safeData.safestRoute) {
          const safestRoute = safeData.safestRoute;
          
          // Validate route data before displaying
          if (!safestRoute.distance || safestRoute.distance === 0 || !safestRoute.duration) {
            console.error('Invalid safe route data received:', safestRoute);
            console.error('Safe data:', safeData);
            
            // Try to find a valid route from allRoutes
            if (safeData.allRoutes && safeData.allRoutes.length > 0) {
              const validRoute = safeData.allRoutes.find(r => r.distance && r.distance > 0);
              if (validRoute) {
                console.warn('Using valid route from allRoutes:', validRoute.routeName);
                Object.assign(safestRoute, {
                  distance: validRoute.distance,
                  duration: validRoute.duration
                });
              }
            }
          }
          
          const durationMin = Math.floor((safestRoute.duration || 0) / 60);
          const distanceKm = ((safestRoute.distance || 0) / 1000).toFixed(2);
          const distanceMiles = ((safestRoute.distance || 0) / 1609.34).toFixed(2);
          const safetyScore = safeData.analysis?.routeScores?.[safestRoute.routeName] || 10;
          
          let tripInstructions = '';
          if (safestRoute.fullRoute && safestRoute.fullRoute.legs && safestRoute.fullRoute.legs[0] && safestRoute.fullRoute.legs[0].steps) {
            const steps = safestRoute.fullRoute.legs[0].steps;
            for (let i = 0; i < steps.length; i++) {
              const step = steps[i];
              if (step.maneuver && step.maneuver.instruction) {
                tripInstructions += `<li>${step.maneuver.instruction}</li>`;
              }
            }
          }
          
          // Build route comparison table
          let routesTable = '';
          if (safeData.allRoutes && safeData.allRoutes.length > 1) {
            routesTable = '<div style="margin: 12px 0; padding: 10px; background-color: #f9fafb; border-radius: 6px;"><h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600;">Route Comparison:</h4><ul style="margin: 0; padding-left: 20px; font-size: 12px;">';
            safeData.allRoutes.forEach(route => {
              const isSafest = route.routeName === safestRoute.routeName;
              routesTable += `<li style="margin: 4px 0; ${isSafest ? 'font-weight: 600; color: #10b981;' : ''}">${route.routeName}: Safety Score ${route.safetyScore}/10 (${(route.distance / 1000).toFixed(2)} km, ${Math.floor(route.duration / 60)} min)${isSafest ? ' ✓ SAFEST' : ''}</li>`;
            });
            routesTable += '</ul></div>';
          }

          // Display detailed analysis reason
          let analysisReason = '';
          if (safeData.analysis?.reason) {
            analysisReason = `
              <div style="margin: 12px 0; padding: 10px; background-color: #d1fae5; border-radius: 6px; border-left: 3px solid #10b981;">
                <p style="margin: 0; font-size: 13px; color: #065f46; line-height: 1.5;">
                  <strong style="color: #047857;">🛡️ Why This Route is Safest:</strong><br/>
                  ${safeData.analysis.reason}
                </p>
              </div>
            `;
          }
          
          // Display incident information if available
          let incidentInfo = '';
          if (safeData.incidentsFound !== undefined) {
            if (safeData.incidentsFound > 0 && safeData.incidents && safeData.incidents.length > 0) {
              const incidentsList = safeData.incidents.slice(0, 5).map(incident => {
                const timeAgo = new Date(incident.time);
                const daysAgo = Math.floor((Date.now() - timeAgo.getTime()) / (1000 * 60 * 60 * 24));
                return `<li style="margin: 4px 0; font-size: 12px;"><strong>${incident.type}:</strong> ${incident.title.substring(0, 80)}${incident.title.length > 80 ? '...' : ''} (${daysAgo} days ago)</li>`;
              }).join('');
              
              incidentInfo = `
                <div style="margin: 12px 0; padding: 10px; background-color: #fef3c7; border-radius: 6px; border-left: 3px solid #f59e0b;">
                  <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #92400e;">
                    📰 Recent Incidents in Area (${safeData.incidentsFound} found):
                  </p>
                  <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #78350f;">
                    ${incidentsList}
                  </ul>
                </div>
              `;
            } else if (safeData.nearestIncident) {
              // Show nearest incident when no local incidents found
              const nearest = safeData.nearestIncident;
              incidentInfo = `
                <div style="margin: 12px 0; padding: 10px; background-color: #fef3c7; border-radius: 6px; border-left: 3px solid #f59e0b;">
                  <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #92400e;">
                    📍 Nearest Incident Found:
                  </p>
                  <p style="margin: 4px 0; font-size: 12px; color: #78350f;">
                    <strong>${nearest.type}:</strong> ${nearest.title.substring(0, 80)}${nearest.title.length > 80 ? '...' : ''}
                  </p>
                  <p style="margin: 4px 0; font-size: 11px; color: #92400e;">
                    Location: ${nearest.location} (approx. ${nearest.distanceKm}km away)
                  </p>
                </div>
              `;
            } else {
              // No incidents at all
              incidentInfo = `
                <div style="margin: 12px 0; padding: 10px; background-color: #d1fae5; border-radius: 6px; border-left: 3px solid #10b981;">
                  <p style="margin: 0; font-size: 12px; color: #065f46;">
                    ✓ No recent incidents found in the area (last 365 days) - all routes are safe
                  </p>
                </div>
              `;
            }
          }

          instructionsHTML += `
            <div style="padding: 12px; background-color: #ecfdf5; border-radius: 8px; border-left: 4px solid #10b981;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #047857;">🛡️ Safe Route (Green)</h3>
              <p style="margin: 4px 0;"><strong>⏱️ Duration: ${durationMin} min</strong></p>
              <p style="margin: 4px 0;"><strong>📍 Distance: ${distanceKm} km (${distanceMiles} mi)</strong></p>
              ${analysisReason}
              ${incidentInfo}
              ${routesTable}
              ${tripInstructions ? `<h4 style="margin: 12px 0 8px 0; font-size: 14px; font-weight: 600;">Route Instructions:</h4><ol style="margin: 0; padding-left: 24px; font-size: 13px;">${tripInstructions}</ol>` : ''}
            </div>
          `;
        }

        // Show error messages if any route failed
        if (regularResponse.status === 'rejected' || (regularResponse.status === 'fulfilled' && !regularResponse.value.ok)) {
          instructionsHTML += `
            <div style="margin-top: 12px; padding: 10px; background-color: #fef2f2; border-radius: 6px; border-left: 3px solid #dc2626;">
              <p style="margin: 0; color: #dc2626; font-size: 13px;">⚠️ Could not fetch standard route</p>
            </div>
          `;
        }

        if (safeResponse.status === 'rejected' || (safeResponse.status === 'fulfilled' && !safeResponse.value.ok)) {
          instructionsHTML += `
            <div style="margin-top: 12px; padding: 10px; background-color: #fef2f2; border-radius: 6px; border-left: 3px solid #dc2626;">
              <p style="margin: 0; color: #dc2626; font-size: 13px;">⚠️ Could not fetch safe route</p>
            </div>
          `;
        }

        instructionsHTML += `<p style="margin-top: 16px; font-size: 12px; color: #666;">📍 Click the map to get directions to another destination</p>`;
        instructions.innerHTML = instructionsHTML;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Map initialization should only run once

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