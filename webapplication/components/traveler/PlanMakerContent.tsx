"use client";

import { AppSidebar } from "@/components/traveler/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Trash2, Sparkles, MapPin, Calendar, Loader2, X } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import L from "leaflet";
import { toast } from "sonner";
import Fuse from "fuse.js";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

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

export default function PlanMakerContent() {
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
  const [touristData, setTouristData] = useState<any[]>([]);
  const [locationImages, setLocationImages] = useState<{ [key: string]: string }>({});
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
        
        // Extract only essential fields for AI
        const simplified = data.flatMap((district: any) => 
          district.attractions.map((attr: any) => ({
            title: attr.title,
            latitude: attr.latitude,
            longitude: attr.longitude,
            rating: attr.rating,
          }))
        );
        setAttractionsData(simplified);
        
        // Flatten the data structure for fuzzy search
        const allAttractions: any[] = [];
        data.forEach((district: any) => {
          district.attractions.forEach((attraction: any) => {
            allAttractions.push({
              ...attraction,
              district: district.district,
            });
          });
        });
        setTouristData(allAttractions);
      } catch (error) {
        console.error('Failed to load attractions data:', error);
      }
    };
    loadAttractionsData();
  }, []);

  const findMatchingImage = (locationName: string) => {
    if (!touristData.length) return null;
    
    // Use fuzzy search to find matching attraction
    const fuse = new Fuse(touristData, {
      keys: ["title", "address"],
      threshold: 0.4,
      includeScore: true,
    });
    
    const results = fuse.search(locationName);
    
    if (results.length > 0 && results[0].item.images && results[0].item.images.length > 0) {
      return results[0].item.images[0].thumbnailUrl || results[0].item.images[0].imageUrl;
    }
    
    return null;
  };

  // Update images when locations change
  useEffect(() => {
    const images: { [key: string]: string } = {};
    locations.forEach((loc) => {
      const image = findMatchingImage(loc.name);
      if (image) {
        images[loc.id] = image;
      }
    });
    setLocationImages(images);
  }, [locations, touristData]);

  // Routing component using Leaflet Routing Machine
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
        createMarker: () => null, // Don't create default markers
      }).addTo(map);
      
      return () => {
        if (map && routingControl) {
          map.removeControl(routingControl);
        }
      };
    }, [map, waypoints]);
    
    return null;
  }

  function LocationPicker() {
    useMapEvents({
      click(e) {
        if (!useAI) {
          const latlng = e.latlng;
          
          if (latlng.lat < 5.9 || latlng.lat > 9.9 || latlng.lng < 79.4 || latlng.lng > 82.0) {
            toast.error('Please select a location within Sri Lanka');
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

  // Component to fix map rendering in dialog
  function MapResizer() {
    const map = useMap();
    useEffect(() => {
      // Multiple attempts to ensure map renders correctly
      const timers = [
        setTimeout(() => map.invalidateSize(), 100),
        setTimeout(() => map.invalidateSize(), 300),
        setTimeout(() => map.invalidateSize(), 500),
      ];
      return () => timers.forEach(timer => clearTimeout(timer));
    }, [map]);
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
        toast.error('Location not found in Sri Lanka. Please try another search term.');
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
      toast.error('Please fill in dates and select at least one preference for AI planning');
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
        toast.error('Failed to generate plan: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      toast.error('Failed to generate AI plan. Please try again.');
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
        toast.success('Travel plan accepted and saved successfully!');
        setShowPlanPreview(false);
        resetForm();
      } else {
        toast.error('Failed to save plan: ' + data.error);
      }
    } catch (error) {
      console.error('Accept plan failed:', error);
      toast.error('Failed to save plan. Please try again.');
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
      toast.error('Please add at least one location to visit');
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
        toast.success('Travel plan created successfully!');
        resetForm();
      } else {
        toast.error('Failed to create plan: ' + data.error);
      }
    } catch (error) {
      console.error('Manual plan creation failed:', error);
      toast.error('Failed to create plan. Please try again.');
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
          <div className={`${useAI ? 'w-full lg:w-[600px]' : 'w-full lg:w-[480px]'} bg-white shadow-sm overflow-y-auto p-5 lg:p-6 border-b lg:border-r lg:border-b-0 border-gray-200 transition-all`}>
            <h1 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-gray-900">Create Travel Plan</h1>
            
            <form onSubmit={handleManualSubmit} className="space-y-4 lg:space-y-6">
              {/* AI Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  {useAI ? <Sparkles className="h-5 w-5 text-gray-900" /> : <MapPin className="h-5 w-5 text-gray-900" />}
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
                <div className="bg-gray-900 text-white p-3 rounded-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">
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
                        <span key={p} className="bg-gray-900 text-white text-xs px-3 py-1 rounded-full">
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
                              <span className="bg-gray-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
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
                <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800" size="lg" disabled={isSubmitting}>
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
                  className="w-full bg-gray-900 hover:bg-gray-800" 
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
                      <div className="min-w-[250px] max-w-[300px]">
                        {locationImages[loc.id] && (
                          <img 
                            src={locationImages[loc.id]} 
                            alt={loc.name}
                            className="w-full h-32 object-cover rounded mb-2"
                          />
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="default" className="bg-gray-900">
                            Stop {idx + 1}
                          </Badge>
                        </div>
                        <p className="font-semibold text-sm">{loc.name}</p>
                        {loc.address && <p className="text-xs text-gray-600 mt-1">{loc.address}</p>}
                        {loc.category && (
                          <Badge variant="outline" className="text-xs mt-2">
                            {loc.category}
                          </Badge>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {validLocations.length > 1 && (
                  <RoutingMachine waypoints={validLocations.map(loc => [loc.lat, loc.lng])} />
                )}
              </MapContainer>
            </div>
          )}
        </div>

        {/* AI Plan Preview Modal with Map */}
        {showPlanPreview && generatedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" style={{ zIndex: 10000 }}>
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
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
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
                <div className="w-full lg:w-1/2 h-[400px] lg:h-full relative" style={{ zIndex: 1 }}>
                  {validLocations.length > 0 ? (
                    <MapContainer
                      key={`dialog-map-${showPlanPreview}`}
                      center={[validLocations[0].lat, validLocations[0].lng]}
                      zoom={7}
                      className="h-full w-full"
                      style={{ zIndex: 1 }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                      />
                      <MapResizer />
                      <FlyToLocation location={flyToLoc} />

                      {validLocations.map((loc, idx) => (
                        <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={customIcon}>
                          <Popup>
                            <div className="min-w-[250px] max-w-[300px]">
                              {locationImages[loc.id] && (
                                <img 
                                  src={locationImages[loc.id]} 
                                  alt={loc.name}
                                  className="w-full h-32 object-cover rounded mb-2"
                                />
                              )}
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="default" className="bg-gray-900">
                                  Stop {idx + 1}
                                </Badge>
                              </div>
                              <p className="font-semibold text-sm">{loc.name}</p>
                              {loc.district && <p className="text-xs text-gray-600 mt-1">{loc.district}</p>}
                              {loc.rating && (
                                <div className="text-xs text-yellow-600 mt-1">★ {loc.rating}</div>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      ))}

                      {validLocations.length > 1 && (
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

              <div className="p-4 lg:p-6 border-t flex gap-3">
                <Button 
                  onClick={handleAcceptPlan} 
                  className="flex-1 bg-gray-900 hover:bg-gray-800" 
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
                  className="flex-1 hover:bg-gray-100" 
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
