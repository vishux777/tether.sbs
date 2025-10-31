import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';
import './coreMap.css'


mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function App() {

    const [center, setCenter] = useState([0,0])
    const [zoom, setZoom] = useState(0)

  const mapRef = useRef()
  const mapContainerRef = useRef()

  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom,
    });

    mapRef.current.on('move', () => {
        const mapCenter = mapRef.current.getCenter()
        const mapZoom = mapRef.current.getZoom()

        setCenter([mapCenter.lng, mapCenter.lat])
        setZoom(mapZoom);
    });
    return () => {
      mapRef.current.remove()
    }
  }, [])

  return (
    <>
          <div className="sidebar">
        Longitude: {center[0].toFixed(4)} | Latitude: {center[1].toFixed(4)} | Zoom: {zoom.toFixed(2)}
      </div>
      <div id='map-container' ref={mapContainerRef}/>
    </>
  )
}

export default App