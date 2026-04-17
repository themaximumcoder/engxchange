/// <reference types="@types/google.maps" />
import { useState, useCallback, useEffect, useRef } from 'react';
import {
    Map,
    Marker,
    useMap,
    useMapsLibrary,
    type MapMouseEvent,
} from '@vis.gl/react-google-maps';



interface LocationPickerProps {
    initialLat?: number;
    initialLng?: number;
    onLocationChange: (lat: number, lng: number, name: string) => void;
    readOnly?: boolean;
}

/**
 * AutocompleteCustom handles the search box logic using Google Places API.
 */
function AutocompleteCustom({ onPlaceSelect }: { onPlaceSelect: (place: google.maps.places.PlaceResult) => void }) {
    const map = useMap();
    const places = useMapsLibrary('places');
    const inputRef = useRef<HTMLInputElement>(null);
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

    useEffect(() => {
        if (!places || !inputRef.current) return;

        const options = {
            componentRestrictions: { country: 'gb' },
            fields: ['geometry', 'name', 'formatted_address'],
        };

        const ac = new places.Autocomplete(inputRef.current, options);
        setAutocomplete(ac);
    }, [places]);

    useEffect(() => {
        if (!autocomplete) return;

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry?.location) {
                onPlaceSelect(place);
                map?.panTo(place.geometry.location);
                map?.setZoom(17);
            }
        });
    }, [autocomplete, map, onPlaceSelect]);

    return (
        <div className="autocomplete-container" style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', zIndex: 1000 }}>
            <input
                ref={inputRef}
                type="text"
                placeholder="🔍 Search for a meetup spot or address..."
                style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '8px',
                    border: '1px solid transparent',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    fontSize: '0.95rem',
                    outline: 'none',
                    background: '#fff'
                }}
            />
        </div>
    );
}

/**
 * LocationPicker provides an interactive map for selecting meetup coordinates.
 */
export function LocationPicker({ initialLat, initialLng, onLocationChange, readOnly = false }: LocationPickerProps) {
    const [markerLocation, setMarkerLocation] = useState({
        lat: initialLat || 55.9442,
        lng: initialLng || -3.1883,
    });

    // Update internal state if external props change (e.g. from preset selection)
    useEffect(() => {
        if (initialLat !== undefined && initialLng !== undefined) {
             setMarkerLocation({ lat: initialLat, lng: initialLng });
        }
    }, [initialLat, initialLng]);

    const handleMapClick = useCallback((ev: MapMouseEvent) => {
        if (readOnly) return;
        if (!ev.detail.latLng) return;
        const { lat, lng } = ev.detail.latLng;
        setMarkerLocation({ lat, lng });
        onLocationChange(lat, lng, `Custom Marker Position`);
    }, [onLocationChange, readOnly]);

    const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult) => {
        if (!place.geometry?.location) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarkerLocation({ lat, lng });
        onLocationChange(lat, lng, place.formatted_address || place.name || 'Selected Place');
    }, [onLocationChange]);

    return (
        <div style={{ height: '350px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
            {!readOnly && <AutocompleteCustom onPlaceSelect={handlePlaceSelect} />}
            <Map
                center={markerLocation}
                defaultZoom={15}
                onClick={handleMapClick}
                disableDefaultUI={readOnly}
                gestureHandling={readOnly ? 'none' : 'auto'}
            >
                <Marker position={markerLocation} />
            </Map>
            {!readOnly && (
                <div style={{ padding: '0.6rem 0.75rem', background: '#f8fafc', fontSize: '0.8rem', color: '#64748b', borderTop: '1px solid #e2e8f0' }}>
                    📍 Search above or click the map to refine your pin.
                </div>
            )}
        </div>
    );
}
