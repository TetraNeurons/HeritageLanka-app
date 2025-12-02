"use client";

import { AppSidebar } from "@/components/traveler/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect, useRef, useMemo } from "react";
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
import { isValidCoordinate } from "@/lib/coordinate-validation";
import LoadingScreen from "@/components/traveler/LoadingScreen";
import ResultsView from "@/components/traveler/ResultsView";

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
];

enum PlanPhase {
  FORM = 'FORM',
  GENERATING = 'GENERATING',
  RESULTS = 'RESULTS'
}

export default function PlanMakerContent() {
  // Phase management
  const [phase, setPhase] = useState<PlanPhase>(PlanPhase.FORM);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
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
  
  // Data state
  const [attractionsData, setAttractionsData] = useState<AttractionData[]>([]);
  const [touristData, setTouristData] = useState<any[]>([]);
  const [locationImages, setLocationImages] = useState<{ [key: string]: string }>({});
  const [routes, setRoutes] = useState<[number, number][][]>([]);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
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

    setPhase(PlanPhase.GENERATING);
    setError(null);
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
        
        // Validate and map AI locations
        const aiLocations: Location[] = [];
        
        if (data.plan.selectedAttractions && Array.isArray(data.plan.selectedAttractions)) {
          data.plan.selectedAttractions.forEach((attr: any, idx: number) => {
            const lat = attr.latitude || attr.lat;
            const lng = attr.longitude || attr.lng;
            
            if (isValidCoordinate(lat, lng)) {
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
        
        // Transition to results phase
        setPhase(PlanPhase.RESULTS);
      } else {
        const errorMsg = data.error || 'Unknown error';
        setError(errorMsg);
        toast.error('Failed to generate plan: ' + errorMsg);
        setPhase(PlanPhase.FORM);
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to generate AI plan';
      setError(errorMsg);
      toast.error(errorMsg + '. Please try again.');
      setPhase(PlanPhase.FORM);
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
          locations,
          userId: "",
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Travel plan accepted and saved successfully!');
        resetForm();
        setPhase(PlanPhase.FORM);
        // Redirect to plans page
        window.location.href = '/traveler/plans';
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
    setPhase(PlanPhase.FORM);
    // Form inputs are preserved automatically
  };

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (locations.length === 0) {
      toast.error('Please add at least one location to visit');
      return;
    }

    setPhase(PlanPhase.GENERATING);
    setError(null);
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
        setPhase(PlanPhase.FORM);
        // Redirect to plans page
        window.location.href = '/traveler/plans';
      } else {
        const errorMsg = data.error || 'Unknown error';
        setError(errorMsg);
        toast.error('Failed to create plan: ' + errorMsg);
        setPhase(PlanPhase.FORM);
      }
    } catch (error) {
      console.error('Manual plan creation failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to create plan';
      setError(errorMsg);
      toast.error(errorMsg + '. Please try again.');
      setPhase(PlanPhase.FORM);
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

  // Validate locations using memoized computation
  const validLocations = useMemo(() => {
    return locations.filter(loc => {
      const isValid = isValidCoordinate(loc.lat, loc.lng);
      if (!isValid) {
        console.warn(`Invalid location coordinates for ${loc.name}:`, { lat: loc.lat, lng: loc.lng });
      }
      return isValid;
    });
  }, [locations]);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <AppSidebar />

        {/* Phase: GENERATING - Show Loading Screen */}
        {phase === PlanPhase.GENERATING && (
          <LoadingScreen mode={useAI ? 'AI' : 'MANUAL'} />
        )}

        {/* Phase: RESULTS - Show Results View */}
        {phase === PlanPhase.RESULTS && generatedPlan && (
          <div className="flex-1 overflow-hidden">
            <ResultsView
              plan={generatedPlan}
              locations={locations}
              locationImages={locationImages}
              onAccept={handleAcceptPlan}
              onReject={handleRejectPlan}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {/* Phase: FORM - Show Form and Map */}
        {phase === PlanPhase.FORM && (
          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            {/* Form Panel */}
            <div className={`${useAI ? 'w-full lg:w-[600px]' : 'w-full lg:w-[480px]'} bg-white shadow-xl overflow-y-auto p-5 lg:p-8 border-b lg:border-r lg:border-b-0 border-gray-200 transition-all`}>
              <h1 className="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 text-gray-900 font-poppins">Create Travel Plan</h1>
            
            <form onSubmit={handleManualSubmit} className="space-y-5 lg:space-y-6">
              {/* AI Toggle */}
              <div className="flex items-center justify-between p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 shadow-md">
                <div className="flex items-center gap-3">
                  {useAI ? <Sparkles className="h-6 w-6 text-amber-600" /> : <MapPin className="h-6 w-6 text-amber-600" />}
                  <div>
                    <Label className="text-base font-bold font-poppins text-gray-900">{useAI ? "AI-Powered Planning" : "Manual Selection"}</Label>
                    <p className="text-xs text-gray-600 font-medium mt-0.5">{useAI ? "Let AI create your itinerary" : "Choose places yourself"}</p>
                  </div>
                </div>
                <Switch checked={useAI} onCheckedChange={setUseAI} />
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 font-poppins">From Date</Label>
                  <Input 
                    type="date" 
                    value={fromDate} 
                    onChange={(e) => setFromDate(e.target.value)} 
                    required 
                    className="h-12 text-sm border-2 focus:border-amber-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 font-poppins">To Date</Label>
                  <Input 
                    type="date" 
                    value={toDate} 
                    onChange={(e) => setToDate(e.target.value)} 
                    required 
                    className="h-12 text-sm border-2 focus:border-amber-500"
                  />
                </div>
              </div>

              {totalDays > 0 && (
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white p-4 rounded-xl flex items-center gap-3 shadow-lg">
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm font-bold font-poppins">
                    Trip Duration: {totalDays} {totalDays === 1 ? 'day' : 'days'}
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 font-poppins">Number of People</Label>
                <Input 
                  type="number" 
                  min="1" 
                  value={people} 
                  onChange={(e) => setPeople(e.target.value)} 
                  required 
                  className="h-12 text-sm border-2 focus:border-amber-500"
                  placeholder="1"
                />
              </div>

              {/* Need Guide Switch */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                <Label htmlFor="needs-guide" className="text-sm font-semibold cursor-pointer font-poppins text-gray-900">Need a Tour Guide?</Label>
                <Switch id="needs-guide" checked={needsGuide} onCheckedChange={setNeedsGuide} />
              </div>

              {/* Travel Preferences */}
              {useAI && (
                <div className="space-y-3 border-t-2 border-gray-200 pt-5">
                  <Label className="text-base font-bold text-gray-900 font-poppins">Travel Preferences *</Label>
                  <div className="grid grid-cols-2 gap-2 lg:gap-3">
                    {preferenceOptions.map((opt) => (
                      <label key={opt.value} className="flex items-center space-x-2 cursor-pointer p-3 hover:bg-amber-50 rounded-lg border-2 border-transparent hover:border-amber-200 transition-all">
                        <Checkbox
                          checked={preferences.includes(opt.value)}
                          onCheckedChange={() => togglePreference(opt.value)}
                        />
                        <span className="text-xs lg:text-sm text-gray-700 font-medium">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  {preferences.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {preferences.map((p) => (
                        <span key={p} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-4 py-2 rounded-full font-semibold shadow-md">
                          {preferenceOptions.find(o => o.value === p)?.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 font-poppins">Notes (Optional)</Label>
                <Textarea
                  placeholder="Any special requests or notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="text-sm border-2 focus:border-amber-500"
                />
              </div>

              {/* Manual Mode: Show locations list */}
              {!useAI && (
                <div className="space-y-3 border-t-2 border-gray-200 pt-5">
                  <Label className="text-base lg:text-lg font-bold text-gray-900 font-poppins">
                    Places to Visit ({locations.length})
                  </Label>
                  {locations.length === 0 ? (
                    <p className="text-xs lg:text-sm text-gray-500 font-medium">
                      Click map or search to add places
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 lg:max-h-64 overflow-y-auto">
                      {locations.map((loc, idx) => (
                        <div key={loc.id} className="flex items-start justify-between bg-gradient-to-br from-gray-50 to-gray-100 p-3 lg:p-4 rounded-xl text-xs lg:text-sm border-2 border-gray-200 hover:border-amber-300 transition-all shadow-sm">
                          <div className="flex-1 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md">
                                {idx + 1}
                              </span>
                              <strong className="text-sm font-semibold font-poppins">{loc.name}</strong>
                            </div>
                            {loc.address && (
                              <p className="text-xs text-gray-600 mt-1 ml-8">{loc.address}</p>
                            )}
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeLocation(loc.id)}
                            className="text-red-600 hover:bg-red-50 p-1 border-2 border-transparent hover:border-red-200"
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
                <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold font-poppins shadow-xl h-12" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Creating Plan...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-5 w-5 mr-2" />
                      Create Travel Plan
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={handleAIGeneration} 
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold font-poppins shadow-xl h-12" 
                  size="lg"
                  disabled={isGenerating || preferences.length === 0}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
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
              <div className="absolute top-2 lg:top-4 right-2 lg:right-4 z-10 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-3 lg:p-4 flex gap-2 items-center w-[calc(100%-1rem)] lg:w-96 border-2 border-gray-200">
                <Input
                  placeholder="Search in Sri Lanka..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="text-sm h-10 border-2 focus:border-amber-500 font-poppins"
                />
                <Button 
                  onClick={handleSearch} 
                  size="sm" 
                  disabled={isSearching.current}
                  className="text-xs lg:text-sm bg-amber-500 hover:bg-amber-600 text-white font-semibold font-poppins px-4 shadow-lg"
                >
                  Search
                </Button>
              </div>

              {/* Map Label */}
              <div className="absolute bottom-2 lg:bottom-4 right-2 lg:right-4 z-10 bg-gradient-to-br from-amber-500 to-orange-500 text-white px-4 lg:px-6 py-3 lg:py-4 rounded-xl shadow-2xl text-sm lg:text-base font-bold backdrop-blur-sm font-poppins">
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
                            className="w-full h-32 object-cover rounded-lg mb-2 border-2 border-gray-200"
                          />
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-md">
                            Stop {idx + 1}
                          </Badge>
                        </div>
                        <p className="font-bold text-sm font-poppins text-gray-900">{loc.name}</p>
                        {loc.address && <p className="text-xs text-gray-600 mt-1">{loc.address}</p>}
                        {loc.category && (
                          <Badge variant="outline" className="text-xs mt-2 border-amber-300 text-amber-700">
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
        )}
      </div>
    </SidebarProvider>
  );
}
