import { useState, useCallback } from 'react';
import {
    APIProvider,
    Map,
    AdvancedMarker,
    Pin,
} from '@vis.gl/react-google-maps';

const API_KEY = 'AIzaSyCjTZvc3EYpn1R4DvTPluu4d_JTi1Q4g9o';
const MAP_ID = 'engxchange_map_id';

interface LocationPickerProps {
    initialLat?: number;
    initialLng?: number;
    onLocationChange: (lat: number, lng: number, name: string) => void;
    readOnly?: boolean;
}

/**
 * LocationPicker provides an interactive map for selecting meetup coordinates.
 * It uses Advanced Markers and the modern @vis.gl wrapper.
 */
export function LocationPicker({ initialLat, initialLng, onLocationChange, readOnly = false }: LocationPickerProps) {
    const [markerLocation, setMarkerLocation] = useState({
        lat: initialLat || 55.9442, // Default to Edinburgh University
        lng: initialLng || -3.1883,
    });


    const handleMapClick = useCallback((ev: any) => {
        if (readOnly) return;
        const newLat = ev.detail.latLng.lat;
        const newLng = ev.detail.latLng.lng;
        setMarkerLocation({ lat: newLat, lng: newLng });
        onLocationChange(newLat, newLng, `Lat: ${newLat.toFixed(4)}, Lng: ${newLng.toFixed(4)}`);
    }, [onLocationChange, readOnly]);

    return (
        <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <APIProvider apiKey={API_KEY}>
                <Map
                    defaultCenter={markerLocation}
                    defaultZoom={15}
                    mapId={MAP_ID}
                    onClick={handleMapClick}
                    disableDefaultUI={readOnly}
                    gestureHandling={readOnly ? 'none' : 'auto'}
                >
                    <AdvancedMarker position={markerLocation}>
                        <Pin background={'#ef4444'} glyphColor={'#fff'} borderColor={'#000'} />
                    </AdvancedMarker>
                </Map>
            </APIProvider>
            {!readOnly && (
                <div style={{ padding: '0.75rem', background: '#f8fafc', fontSize: '0.85rem', color: '#64748b', borderTop: '1px solid #e2e8f0' }}>
                    📍 Click anywhere on the map to pin your exact meetup spot.
                </div>
            )}
        </div>
    );
}
