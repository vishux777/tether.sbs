import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';
import './coreMap.css'
import MapSearchBox from './SearchBox';


mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function App() {

    const [center, setCenter] = useState([0,0])
    const [zoom, setZoom] = useState(0)
    const [mapLoaded, setMapLoaded] = useState(false)
    const [inputValue, setInputValue] = useState('')

  const mapRef = useRef()
  const mapContainerRef = useRef()

  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
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

    mapRef.current.on('load', () => {
      setMapLoaded(true)
    })

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
      
    </>
  )
}

export default App