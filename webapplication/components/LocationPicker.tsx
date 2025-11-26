"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number, placeName?: string) => void;
}

function LocationMarker({ lat, lng, onLocationChange }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([lat, lng]);

  useMapEvents({
    click(e) {
      const newLat = e.latlng.lat;
      const newLng = e.latlng.lng;
      setPosition([newLat, newLng]);
      
      // Reverse geocoding to get place name
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}`)
        .then(res => res.json())
        .then(data => {
          const placeName = data.display_name || "";
          onLocationChange(newLat, newLng, placeName);
        })
        .catch(() => {
          onLocationChange(newLat, newLng);
        });
    },
  });

  useEffect(() => {
    setPosition([lat, lng]);
  }, [lat, lng]);

  return position ? <Marker position={position} /> : null;
}

export default function LocationPicker({ lat, lng, onLocationChange }: LocationPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleUseCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLat = position.coords.latitude;
          const newLng = position.coords.longitude;
          
          // Reverse geocoding
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}`)
            .then(res => res.json())
            .then(data => {
              const placeName = data.display_name || "";
              onLocationChange(newLat, newLng, placeName);
              setLoading(false);
            })
            .catch(() => {
              onLocationChange(newLat, newLng);
              setLoading(false);
            });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
        }
      );
    }
  };

  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">Click on the map to select location</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUseCurrentLocation}
          disabled={loading}
        >
          <MapPin className="w-4 h-4 mr-2" />
          {loading ? "Getting location..." : "Use Current Location"}
        </Button>
      </div>
      
      <div className="w-full h-[400px] rounded-lg overflow-hidden border">
        <MapContainer
          center={[lat || 7.8731, lng || 80.7718]} // Default to Sri Lanka center
          zoom={lat && lng ? 13 : 8}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker lat={lat || 7.8731} lng={lng || 80.7718} onLocationChange={onLocationChange} />
        </MapContainer>
      </div>
      
      <p className="text-xs text-gray-500">
        Selected: {lat.toFixed(6)}, {lng.toFixed(6)}
      </p>
    </div>
  );
}
