"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const customIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Location {
  lat: number;
  lng: number;
  name: string;
  id: string;
  address?: string;
  district?: string;
  category?: string;
  rating?: number;
}

interface ResultsViewProps {
  plan: any;
  locations: Location[];
  locationImages: { [key: string]: string };
  onAccept: () => Promise<void>;
  onReject: () => void;
  isSubmitting: boolean;
}

// MapResizer component for proper map initialization
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timers = [
      setTimeout(() => map.invalidateSize(), 100),
      setTimeout(() => map.invalidateSize(), 300),
      setTimeout(() => map.invalidateSize(), 500),
    ];
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [map]);
  return null;
}

// Routing component
function RoutingMachine({ waypoints }: { waypoints: [number, number][] }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map || waypoints.length < 2) return;
    
    require("leaflet-routing-machine");
    
    const routingControl = (L as any).Routing.control({
      waypoints: waypoints.map((wp) => L.latLng(wp[0], wp[1])),
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: false,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: "#000000", opacity: 0.6, weight: 4 }],
      },
      createMarker: () => null,
    }).addTo(map);
    
    return () => {
      if (map && routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [map, waypoints]);
  
  return null;
}

export default function ResultsView({
  plan,
  locations,
  locationImages,
  onAccept,
  onReject,
  isSubmitting
}: ResultsViewProps) {
  // Validate locations
  const validLocations = locations.filter(loc => 
    loc.lat && loc.lng && 
    typeof loc.lat === 'number' && typeof loc.lng === 'number' &&
    !isNaN(loc.lat) && !isNaN(loc.lng) &&
    loc.lat >= -90 && loc.lat <= 90 && loc.lng >= -180 && loc.lng <= 180
  );

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="p-5 lg:p-6 border-b-2 border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 font-poppins">
          Your AI-Generated Travel Plan
        </h2>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Plan Details Panel */}
        <div className="w-full lg:w-1/2 p-4 lg:p-6 overflow-y-auto bg-gray-50">
          <div className="space-y-4">
            {/* Trip Summary */}
            <div className="bg-white p-5 rounded-xl border-2 border-amber-200 shadow-md">
              <h3 className="font-bold text-lg mb-3 font-poppins text-gray-900">Trip Summary</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{plan.summary}</p>
            </div>

            {/* Daily Itinerary */}
            <div>
              <h3 className="font-bold text-lg mb-3 font-poppins text-gray-900">Daily Itinerary</h3>
              <div className="space-y-3">
                {plan.dailyItinerary?.map((day: any, idx: number) => (
                  <div key={idx} className="border-2 border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all">
                    <div className="font-bold text-amber-600 mb-3 font-poppins text-base">
                      Day {day.day} - {day.date}
                    </div>
                    <ul className="space-y-2 text-sm">
                      {day.places?.map((place: string, pIdx: number) => (
                        <li key={pIdx} className="flex items-start gap-2">
                          <span className="text-amber-500 font-bold">•</span>
                          <span className="text-gray-700">{place}</span>
                        </li>
                      ))}
                    </ul>
                    {day.estimatedDistance && (
                      <p className="text-xs text-gray-500 mt-3 font-medium bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
                        📍 {day.estimatedDistance}
                      </p>
                    )}
                    {day.notes && (
                      <p className="text-xs text-gray-500 mt-2 italic bg-amber-50 px-3 py-1.5 rounded-lg">
                        {day.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Travel Tips */}
            <div className="bg-white p-5 rounded-xl border-2 border-gray-200 shadow-md">
              <h3 className="font-bold text-lg mb-3 font-poppins text-gray-900">
                Travel Tips & Recommendations
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                {plan.recommendations?.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Feasibility Score */}
            {plan.feasibilityScore && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-sm font-poppins text-gray-900">
                    Feasibility Score:
                  </span>
                  <span className="text-green-700 font-bold text-lg">
                    {plan.feasibilityScore}/100
                  </span>
                </div>
                {plan.feasibilityNotes && (
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {plan.feasibilityNotes}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Map Panel */}
        <div className="w-full lg:w-1/2 h-[400px] lg:h-full relative">
          {validLocations.length > 0 ? (
            <MapContainer
              key={`results-map-${plan.id || 'generated'}`}
              center={[validLocations[0].lat, validLocations[0].lng]}
              zoom={8}
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              <MapResizer />

              {validLocations.map((loc, idx) => (
                <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={customIcon}>
                  <Popup>
                    <div className="min-w-[250px] max-w-[300px]">
                      {locationImages[loc.id] && (
                        <img 
                          src={locationImages[loc.id]} 
                          alt={loc.name}
                          className="w-full h-32 object-cover rounded-lg mb-2 border-2 border-gray-200"
                        />
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-md">
                          Stop {idx + 1}
                        </Badge>
                      </div>
                      <p className="font-bold text-sm font-poppins text-gray-900">{loc.name}</p>
                      {loc.district && <p className="text-xs text-gray-600 mt-1">{loc.district}</p>}
                      {loc.rating && (
                        <div className="text-xs text-amber-600 mt-1 font-semibold">
                          ★ {loc.rating}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {validLocations.length >= 2 && (
                <RoutingMachine waypoints={validLocations.map(loc => [loc.lat, loc.lng])} />
              )}
            </MapContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
              <p className="text-gray-500">No valid locations to display</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-5 lg:p-6 border-t-2 border-gray-200 flex flex-col sm:flex-row gap-3 bg-gradient-to-r from-gray-50 to-gray-100">
        <Button 
          onClick={onAccept} 
          className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold font-poppins shadow-xl h-12" 
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Saving Plan...
            </>
          ) : (
            'Accept & Save Plan'
          )}
        </Button>
        <Button 
          onClick={onReject} 
          variant="outline" 
          className="flex-1 hover:bg-white border-2 border-gray-300 font-semibold font-poppins h-12" 
          size="lg"
          disabled={isSubmitting}
        >
          Reject & Regenerate
        </Button>
      </div>
    </div>
  );
}
