// app/(traveler)/plan-maker/page.tsx
"use client";

import { AppSidebar } from "@/components/traveler/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect, useRef } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Trash2, Sparkles, MapPin, Calendar, Loader2, X } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from "react-leaflet";
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
  address?: string;
  district?: string;
  category?: string;
  rating?: number;
}

interface AttractionData {
  title: string;
  latitude: number;
  longitude: number;
  rating: number;
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
  const [useAI, setUseAI] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [people, setPeople] = useState("1");
  const [needsGuide, setNeedsGuide] = useState(false);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [search, setSearch] = useState("");
  const [flyToLoc, setFlyToLoc] = useState<Location | null>(null);
  const [attractionsData, setAttractionsData] = useState<AttractionData[]>([]);
  const [routes, setRoutes] = useState<[number, number][][]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [showPlanPreview, setShowPlanPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSearching = useRef(false);

  // Load attractions data - only essential fields
  useEffect(() => {
    const loadAttractionsData = async () => {
      try {
        const response = await fetch('/sl_tourist_data.json');
        const data = await response.json();
        
        // Extract only essential fields
        const simplified = data.flatMap((district: any) => 
          district.attractions.map((attr: any) => ({
            title: attr.title,
            latitude: attr.latitude,
            longitude: attr.longitude,
            rating: attr.rating,
          }))
        );
        setAttractionsData(simplified);
      } catch (error) {
        console.error('Failed to load attractions data:', error);
      }
    };
    loadAttractionsData();
  }, []);

  // Calculate routes
  useEffect(() => {
    if (locations.length > 1) {
      calculateRoutes();
    } else {
      setRoutes([]);
    }
  }, [locations]);

  const calculateRoutes = async () => {
    if (locations.length < 2) return;

    const newRoutes: [number, number][][] = [];
    for (let i = 0; i < locations.length - 1; i++) {
      const start = locations[i];
      const end = locations[i + 1];
      
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
        );
        const data = await response.json();
        
        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
          );
          newRoutes.push(coords);
        }
      } catch (error) {
        console.error('Route calculation failed:', error);
        newRoutes.push([[start.lat, start.lng], [end.lat, end.lng]]);
      }
    }
    setRoutes(newRoutes);
  };

  function LocationPicker() {
    useMapEvents({
      click(e) {
        if (!useAI) {
          const latlng = e.latlng;
          
          if (latlng.lat < 5.9 || latlng.lat > 9.9 || latlng.lng < 79.4 || latlng.lng > 82.0) {
            alert('Please select a location within Sri Lanka');
            return;
          }

          const newLoc: Location = {
            lat: latlng.lat,
            lng: latlng.lng,
            name: `Custom Location ${locations.length + 1}`,
            id: Date.now().toString() + Math.random(),
          };
          setLocations((prev) => [...prev, newLoc]);
          setFlyToLoc(newLoc);
        }
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
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search + ', Sri Lanka')}&limit=1&countrycodes=lk`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const result = data[0];
        const newLoc: Location = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          name: result.display_name.split(",")[0].trim() || "Searched Place",
          id: Date.now().toString() + Math.random(),
          address: result.display_name,
        };

        const exists = locations.some(
          (loc) => Math.abs(loc.lat - newLoc.lat) < 0.001 && Math.abs(loc.lng - newLoc.lng) < 0.001
        );
        if (!exists) {
          setLocations((prev) => [...prev, newLoc]);
          setFlyToLoc(newLoc);
        }
        setSearch("");
      } else {
        alert('Location not found in Sri Lanka. Please try another search term.');
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

  const handleAIGeneration = async () => {
    if (!fromDate || !toDate || preferences.length === 0) {
      alert('Please fill in dates and select at least one preference for AI planning');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/traveler/generate-ai-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromDate,
          toDate,
          numberOfPeople: parseInt(people),
          needsGuide,
          preferences,
          description,
          attractionsData,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.plan) {
        setGeneratedPlan(data.plan);
        setShowPlanPreview(true);
        
        // FIXED: Properly validate and map AI locations
        const aiLocations: Location[] = [];
        
        if (data.plan.selectedAttractions && Array.isArray(data.plan.selectedAttractions)) {
          data.plan.selectedAttractions.forEach((attr: any, idx: number) => {
            // Validate that we have valid coordinates
            const lat = attr.latitude || attr.lat;
            const lng = attr.longitude || attr.lng;
            
            if (typeof lat === 'number' && typeof lng === 'number' && 
                !isNaN(lat) && !isNaN(lng) &&
                lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
              aiLocations.push({
                lat,
                lng,
                name: attr.name || attr.title || `Location ${idx + 1}`,
                id: `ai-${idx}-${Date.now()}`,
                address: attr.address || attr.location,
                district: attr.district,
                category: attr.category,
                rating: attr.rating,
              });
            } else {
              console.warn(`Skipping invalid location at index ${idx}:`, attr);
            }
          });
        }
        
        console.log(`Generated ${aiLocations.length} valid locations from AI plan`);
        setLocations(aiLocations);
        
        // Fly to first valid location
        if (aiLocations.length > 0) {
          setFlyToLoc(aiLocations[0]);
        }
      } else {
        alert('Failed to generate plan: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      alert('Failed to generate AI plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptPlan = async () => {
    if (!generatedPlan) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/traveler/accept-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromDate,
          toDate,
          numberOfPeople: parseInt(people),
          needsGuide,
          preferences,
          description,
          planningMode: 'AI_GENERATED',
          aiPlan: generatedPlan,
          locations, // Include the validated locations
          userId: "",
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Travel plan accepted and saved successfully!');
        setShowPlanPreview(false);
        resetForm();
      } else {
        alert('Failed to save plan: ' + data.error);
      }
    } catch (error) {
      console.error('Accept plan failed:', error);
      alert('Failed to save plan. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectPlan = () => {
    setGeneratedPlan(null);
    setShowPlanPreview(false);
    setLocations([]);
  };

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (locations.length === 0) {
      alert('Please add at least one location to visit');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/traveler/create-manual-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromDate,
          toDate,
          numberOfPeople: parseInt(people),
          needsGuide,
          preferences,
          description,
          locations,
          userId: "",
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Travel plan created successfully!');
        resetForm();
      } else {
        alert('Failed to create plan: ' + data.error);
      }
    } catch (error) {
      console.error('Manual plan creation failed:', error);
      alert('Failed to create plan. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const resetForm = () => {
    setFromDate("");
    setToDate("");
    setPeople("1");
    setNeedsGuide(false);
    setPreferences([]);
    setDescription("");
    setLocations([]);
    setGeneratedPlan(null);
  };

  const calculateDays = () => {
    if (!fromDate || !toDate) return 0;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : 0;
  };

  const totalDays = calculateDays();

  // Helper function to validate locations before rendering markers
  const validLocations = locations.filter(loc => 
    loc.lat && loc.lng && 
    typeof loc.lat === 'number' && typeof loc.lng === 'number' &&
    !isNaN(loc.lat) && !isNaN(loc.lng) &&
    loc.lat >= -90 && loc.lat <= 90 && loc.lng >= -180 && loc.lng <= 180
  );

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-100">
        <AppSidebar />

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Form Panel */}
          <div className={`${useAI ? 'w-full lg:w-[500px]' : 'w-full lg:w-96'} bg-white shadow-lg overflow-y-auto p-4 lg:p-6 border-b lg:border-r lg:border-b-0 border-gray-200 transition-all`}>
            <h1 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-gray-800">Create Travel Plan</h1>
            
            <form onSubmit={handleManualSubmit} className="space-y-4 lg:space-y-6">
              {/* AI Toggle */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  {useAI ? <Sparkles className="h-5 w-5 text-purple-600" /> : <MapPin className="h-5 w-5 text-blue-600" />}
                  <div>
                    <Label className="text-base font-semibold">{useAI ? "AI-Powered Planning" : "Manual Selection"}</Label>
                    <p className="text-xs text-gray-600">{useAI ? "Let AI create your itinerary" : "Choose places yourself"}</p>
                  </div>
                </div>
                <Switch checked={useAI} onCheckedChange={setUseAI} />
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <div className="space-y-1">
                  <Label className="text-sm">From Date</Label>
                  <Input 
                    type="date" 
                    value={fromDate} 
                    onChange={(e) => setFromDate(e.target.value)} 
                    required 
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">To Date</Label>
                  <Input 
                    type="date" 
                    value={toDate} 
                    onChange={(e) => setToDate(e.target.value)} 
                    required 
                    className="text-sm"
                  />
                </div>
              </div>

              {totalDays > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800 font-medium">
                    Trip Duration: {totalDays} {totalDays === 1 ? 'day' : 'days'}
                  </span>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-sm">Number of People</Label>
                <Input 
                  type="number" 
                  min="1" 
                  value={people} 
                  onChange={(e) => setPeople(e.target.value)} 
                  required 
                  className="text-sm"
                  placeholder="1"
                />
              </div>

              {/* Need Guide Switch */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label htmlFor="needs-guide" className="text-sm font-medium cursor-pointer">Need a Tour Guide?</Label>
                <Switch id="needs-guide" checked={needsGuide} onCheckedChange={setNeedsGuide} />
              </div>

              {/* Travel Preferences */}
              {useAI && (
                <div className="space-y-3 border-t pt-4">
                  <Label className="text-base font-medium">Travel Preferences *</Label>
                  <div className="grid grid-cols-2 gap-2 lg:gap-3">
                    {preferenceOptions.map((opt) => (
                      <label key={opt.value} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                        <Checkbox
                          checked={preferences.includes(opt.value)}
                          onCheckedChange={() => togglePreference(opt.value)}
                        />
                        <span className="text-xs lg:text-sm text-gray-700">{opt.label}</span>
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
              )}

              <div className="space-y-1">
                <Label className="text-sm">Notes (Optional)</Label>
                <Textarea
                  placeholder="Any special requests or notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>

              {/* Manual Mode: Show locations list */}
              {!useAI && (
                <div className="space-y-3 border-t pt-4">
                  <Label className="text-base lg:text-lg font-semibold">
                    Places to Visit ({locations.length})
                  </Label>
                  {locations.length === 0 ? (
                    <p className="text-xs lg:text-sm text-gray-500">
                      Click map or search to add places
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 lg:max-h-64 overflow-y-auto">
                      {locations.map((loc, idx) => (
                        <div key={loc.id} className="flex items-start justify-between bg-gray-50 p-2 lg:p-3 rounded-lg text-xs lg:text-sm">
                          <div className="flex-1 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                              </span>
                              <strong className="text-sm">{loc.name}</strong>
                            </div>
                            {loc.address && (
                              <p className="text-xs text-gray-600 mt-1 ml-7">{loc.address}</p>
                            )}
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeLocation(loc.id)}
                            className="text-red-600 hover:bg-red-50 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {!useAI ? (
                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Plan...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      Create Travel Plan
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={handleAIGeneration} 
                  className="w-full" 
                  size="lg"
                  disabled={isGenerating || preferences.length === 0}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Plan
                    </>
                  )}
                </Button>
              )}
            </form>
          </div>

          {/* Map - Only show in manual mode */}
          {(!useAI) && (
            <div className="flex-1 relative h-[400px] lg:h-full">
              {/* Search Bar */}
              <div className="absolute top-2 lg:top-4 right-2 lg:right-4 z-10 bg-white rounded-lg shadow-lg p-2 lg:p-3 flex gap-2 items-center w-[calc(100%-1rem)] lg:w-96">
                <Input
                  placeholder="Search in Sri Lanka..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="text-sm"
                />
                <Button 
                  onClick={handleSearch} 
                  size="sm" 
                  disabled={isSearching.current}
                  className="text-xs lg:text-sm"
                >
                  Search
                </Button>
              </div>

              {/* Map Label */}
              <div className="absolute bottom-2 lg:bottom-4 right-2 lg:right-4 z-10 bg-black bg-opacity-70 text-white px-3 lg:px-5 py-2 lg:py-3 rounded-lg shadow-lg text-xs lg:text-sm font-medium backdrop-blur-sm">
                Click map to add places
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

                {validLocations.map((loc, idx) => (
                  <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={customIcon}>
                    <Popup>
                      <div className="text-sm">
                        <strong>#{idx + 1} - {loc.name}</strong>
                        <br />
                        {loc.address && <span className="text-xs text-gray-600">{loc.address}</span>}
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {routes.map((route, idx) => (
                  <Polyline
                    key={`route-${idx}`}
                    positions={route}
                    color="#3b82f6"
                    weight={3}
                    opacity={0.7}
                  />
                ))}
              </MapContainer>
            </div>
          )}
        </div>

        {/* AI Plan Preview Modal with Map */}
        {showPlanPreview && generatedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 lg:p-6 border-b flex justify-between items-center">
                <h2 className="text-xl lg:text-2xl font-bold">Your AI-Generated Travel Plan</h2>
                <Button variant="ghost" size="sm" onClick={handleRejectPlan}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* Plan Details */}
                <div className="w-full lg:w-1/2 p-4 lg:p-6 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Trip Summary</h3>
                      <p className="text-sm text-gray-700">{generatedPlan.summary}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Daily Itinerary</h3>
                      <div className="space-y-3">
                        {generatedPlan.dailyItinerary?.map((day: any, idx: number) => (
                          <div key={idx} className="border rounded-lg p-3">
                            <div className="font-medium text-blue-600 mb-2">
                              Day {day.day} - {day.date}
                            </div>
                            <ul className="space-y-1 text-sm">
                              {day.places?.map((place: string, pIdx: number) => (
                                <li key={pIdx} className="flex items-start gap-2">
                                  <span className="text-gray-400">•</span>
                                  <span>{place}</span>
                                </li>
                              ))}
                            </ul>
                            {day.estimatedDistance && (
                              <p className="text-xs text-gray-500 mt-2">📍 {day.estimatedDistance}</p>
                            )}
                            {day.notes && (
                              <p className="text-xs text-gray-500 mt-1 italic">{day.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Travel Tips & Recommendations</h3>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {generatedPlan.recommendations?.map((rec: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {generatedPlan.feasibilityScore && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">Feasibility Score:</span>
                          <span className="text-green-700 font-bold">{generatedPlan.feasibilityScore}/100</span>
                        </div>
                        {generatedPlan.feasibilityNotes && (
                          <p className="text-xs text-gray-600">{generatedPlan.feasibilityNotes}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Map */}
                <div className="w-full lg:w-1/2 h-[400px] lg:h-full relative">
                  {validLocations.length > 0 ? (
                    <MapContainer
                      center={[validLocations[0].lat, validLocations[0].lng]}
                      zoom={7}
                      className="h-full w-full"
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                      />
                      <FlyToLocation location={flyToLoc} />

                      {validLocations.map((loc, idx) => (
                        <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={customIcon}>
                          <Popup>
                            <div className="text-sm">
                              <strong>#{idx + 1} - {loc.name}</strong>
                              <br />
                              {loc.district && <span className="text-xs text-gray-600">{loc.district}</span>}
                              {loc.rating && (
                                <div className="text-xs text-yellow-600 mt-1">★ {loc.rating}</div>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      ))}

                      {routes.map((route, idx) => (
                        <Polyline
                          key={`route-${idx}`}
                          positions={route}
                          color="#3b82f6"
                          weight={3}
                          opacity={0.7}
                        />
                      ))}
                    </MapContainer>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100">
                      <p className="text-gray-500">No valid locations to display</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 lg:p-6 border-t flex gap-3">
                <Button 
                  onClick={handleAcceptPlan} 
                  className="flex-1" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving Plan...
                    </>
                  ) : (
                    'Accept & Save Plan'
                  )}
                </Button>
                <Button 
                  onClick={handleRejectPlan} 
                  variant="outline" 
                  className="flex-1" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  Reject & Regenerate
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
}