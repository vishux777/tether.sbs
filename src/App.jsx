import { useState } from 'react'
import './index.css' 
import CoreMap from './mapBox/coreMap';
import Hero from './landing/Hero';

function App() {
  const [showMap, setShowMap] = useState(false);

  return (
    <>
      {!showMap ? (
        <Hero onEnterMap={() => setShowMap(true)} />
      ) : (
        <CoreMap />
      )}
    </>
  )
}

export default App
