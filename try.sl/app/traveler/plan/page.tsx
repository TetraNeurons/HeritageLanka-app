"use client";

import { AppSidebar } from "@/components/traveler/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect, useRef } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const customIcon = L.icon({
  iconUrl: "https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  shadowSize: [41, 41],
});

interface Location {
  lat: number;
  lng: number;
  name: string;
  id: string;
}

const preferenceOptions = [
  { value: "RELIGIOUS", label: "Religious" },
  { value: "CASUAL", label: "Casual / Relaxed" },
  { value: "ADVENTURE", label: "Adventure" },
  { value: "NATURE", label: "Nature & Wildlife" },
  { value: "CULTURAL", label: "Cultural" },
  { value: "FOOD", label: "Food & Cuisine" },
];

export default function PlanMakerPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [people, setPeople] = useState("");
  const [budget, setBudget] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [search, setSearch] = useState("");
  const [flyToLoc, setFlyToLoc] = useState<Location | null>(null);
  const isSearching = useRef(false); // Prevent double search

  // Click anywhere on map → add marker with label in bottom-right
  function LocationPicker() {
    useMapEvents({
      click(e) {
        const latlng = e.latlng;
        const newLoc: Location = {
          lat: latlng.lat,
          lng: latlng.lng,
          name: `Custom Location ${locations.length + 1}`,
          id: Date.now().toString() + Math.random(),
        };
        setLocations((prev) => [...prev, newLoc]);
        setFlyToLoc(newLoc);
      },
    });
    return null;
  }

  function FlyToLocation({ location }: { location: Location | null }) {
    const map = useMap();
    useEffect(() => {
      if (location) {
        map.flyTo([location.lat, location.lng], 13, { duration: 1.5 });
      }
    }, [location, map]);
    return null;
  }

  async function handleSearch() {
    if (!search.trim() || isSearching.current) return;
    isSearching.current = true;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&limit=1`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const result = data[0];
        const newLoc: Location = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          name: result.display_name.split(",")[0].trim() || "Searched Place",
          id: Date.now().toString() + Math.random(),
        };

        // Avoid duplicates
        const exists = locations.some(
          (loc) => Math.abs(loc.lat - newLoc.lat) < 0.001 && Math.abs(loc.lng - newLoc.lng) < 0.001
        );
        if (!exists) {
          setLocations((prev) => [...prev, newLoc]);
          setFlyToLoc(newLoc);
        }
        setSearch("");
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      isSearching.current = false;
    }
  }

  const removeLocation = (id: string) => {
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
  };

  const togglePreference = (value: string) => {
    setPreferences((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    );
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Your API call here
    alert("Travel plan created successfully!");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-100">
        <AppSidebar />

        <div className="flex-1 flex overflow-hidden">
          {/* Form Panel */}
          <div className="w-96 bg-white shadow-lg overflow-y-auto p-6 border-r border-gray-200">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Create Travel Plan</h1>
            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>From Date</Label>
                  <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label>To Date</Label>
                  <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>People</Label>
                  <Input type="number" min="1" value={people} onChange={(e) => setPeople(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label>Budget (USD)</Label>
                  <Input type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} required />
                </div>
              </div>

              {/* Travel Preferences - 2 Column Checkboxes */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Travel Preferences</Label>
                <div className="grid grid-cols-2 gap-3">
                  {preferenceOptions.map((opt) => (
                    <label key={opt.value} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={preferences.includes(opt.value)}
                        onCheckedChange={() => togglePreference(opt.value)}
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
                {preferences.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {preferences.map((p) => (
                      <span key={p} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                        {preferenceOptions.find(o => o.value === p)?.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Any special requests or notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Places to Visit */}
              <div className="space-y-3 border-t pt-4">
                <Label className="text-lg font-semibold">Places to Visit ({locations.length})</Label>
                {locations.length === 0 ? (
                  <p className="text-sm text-gray-500">Click map or search to add places</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {locations.map((loc) => (
                      <div key={loc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg text-sm">
                        <div className="flex-1 truncate pr-2">
                          <strong>{loc.name}</strong>
                          <p className="text-xs text-gray-500">
                            {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeLocation(loc.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg">
                Create Travel Plan
              </Button>
            </form>
          </div>

          {/* Map */}
          <div className="flex-1 relative">
            {/* Search Bar */}
            <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-3 flex gap-2 items-center w-96">
              <Input
                placeholder="Search places (e.g. Kandy, Ella, Galle)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} size="sm" disabled={isSearching.current}>
                Search
              </Button>
            </div>

            {/* Map Label - Bottom Right */}
            <div className="absolute bottom-4 right-4 z-10 bg-black bg-opacity-70 text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium backdrop-blur-sm">
              Click anywhere on map to add a place
            </div>

            <MapContainer
              center={[7.8731, 80.7718]}
              zoom={7}
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              <LocationPicker />
              <FlyToLocation location={flyToLoc} />

              {locations.map((loc) => (
                <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={customIcon}>
                  <Popup>
                    <div className="text-sm">
                      <strong>{loc.name}</strong>
                      <br />
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}