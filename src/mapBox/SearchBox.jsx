import { SearchBox } from '@mapbox/search-js-react';

export default function MapSearchBox({ accessToken, map, mapboxgl, value, onChange, marker, ...props }) {
    return (
        <SearchBox
            accessToken={accessToken || import.meta.env.VITE_MAPBOX_TOKEN}
            map={map}
            mapboxgl={mapboxgl}
            value={value}
            onChange={onChange}
            marker={marker}
            placeholder="Search for a place"
            options={{
                country: ['US'],
                language: ['en'],
            }}
            {...props}
        />
    )
}