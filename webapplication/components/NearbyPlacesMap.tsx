'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PlaceResult } from '@/lib/types';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Origin marker icon (distinct style)
const originIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Place marker icon
const placeIcon = L.icon({
  iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  shadowSize: [41, 41],
});

interface NearbyPlacesMapProps {
  origin: { lat: number; lng: number; name: string };
  places: PlaceResult[];
  selectedPlaceId: string | null;
  onMarkerClick: (placeId: string) => void;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  
  return null;
}

export function NearbyPlacesMap({
  origin,
  places,
  selectedPlaceId,
  onMarkerClick,
}: NearbyPlacesMapProps) {
  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={[origin.lat, origin.lng]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        
        <MapController center={[origin.lat, origin.lng]} />

        {/* Origin Marker */}
        <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
          <Popup>
            <div className="text-sm">
              <strong className="text-blue-600">📍 Origin</strong>
              <br />
              <span>{origin.name}</span>
            </div>
          </Popup>
        </Marker>

        {/* Place Markers */}
        {places.map((place, index) => (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            icon={placeIcon}
            eventHandlers={{
              click: () => onMarkerClick(place.id),
            }}
          >
            <Popup>
              <div className="text-sm">
                <strong>#{index + 1} - {place.title}</strong>
                <br />
                <span className="text-xs text-gray-600">{place.category}</span>
                <br />
                {place.rating && (
                  <span className="text-xs">⭐ {place.rating}</span>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
