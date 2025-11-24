"use client";

import { AppSidebar } from "@/components/traveler/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Calendar,
  Users,
  MapPin,
  Phone,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  Route,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import Fuse from "fuse.js";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

// Component to fix map size - dynamically imported
const MapResizer = dynamic(
  () => import("react-leaflet").then((mod) => {
    const { useMap } = mod;
    return function MapResizerComponent() {
      const map = useMap();
      useEffect(() => {
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      }, [map]);
      return null;
    };
  }),
  { ssr: false }
);

// Routing component
const RoutingMachine = dynamic(
  () => import("react-leaflet").then((mod) => {
    const { useMap } = mod;
    return function RoutingComponent({ waypoints }: { waypoints: [number, number][] }) {
      const map = useMap();
      
      useEffect(() => {
        if (!map || waypoints.length < 2) return;
        
        const L = require("leaflet");
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
    };
  }),
  { ssr: false }
);

interface Location {
  id: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  dayNumber: number;
  visitOrder: number;
  estimatedDuration: string | null;
  category: string;
}

interface TripData {
  id: string;
  fromDate: string;
  toDate: string;
  numberOfPeople: number;
  country: string;
  status: string;
  totalDistance: number | null;
  planDescription: string | null;
  aiSummary: string | null;
  currentDay: number;
  guide: {
    name: string;
    phone: string;
    languages: string[];
  } | null;
  locations: Location[];
}

export default function TripTrackerPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [touristData, setTouristData] = useState<any[]>([]);
  const [locationImages, setLocationImages] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchTripData();
    getUserLocation();
    loadTouristData();

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [tripId]);

  // Force map to invalidate size after mount
  useEffect(() => {
    if (typeof window !== "undefined" && !loading && trip) {
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 100);
    }
  }, [loading, trip]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to Colombo if location unavailable
          setUserLocation([6.9271, 79.8612]);
        }
      );
    } else {
      setUserLocation([6.9271, 79.8612]);
    }
  };

  const loadTouristData = async () => {
    try {
      const response = await fetch("/sl_tourist_data.json");
      const data = await response.json();
      
      // Flatten the data structure
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
      console.error("Error loading tourist data:", error);
    }
  };

  const findMatchingImage = (locationTitle: string) => {
    if (!touristData.length) return null;
    
    // Use fuzzy search to find matching attraction
    const fuse = new Fuse(touristData, {
      keys: ["title", "address"],
      threshold: 0.4,
      includeScore: true,
    });
    
    const results = fuse.search(locationTitle);
    
    if (results.length > 0 && results[0].item.images && results[0].item.images.length > 0) {
      return results[0].item.images[0].thumbnailUrl || results[0].item.images[0].imageUrl;
    }
    
    return null;
  };

  const fetchTripData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/traveler/trips/${tripId}/tracking`);
      const data = await response.json();

      if (data.success) {
        setTrip(data.trip);
        
        // Match images for each location
        const images: { [key: string]: string } = {};
        data.trip.locations.forEach((loc: Location) => {
          const image = findMatchingImage(loc.title);
          if (image) {
            images[loc.id] = image;
          }
        });
        setLocationImages(images);
      } else {
        toast.error(data.error || "Failed to load trip data");
        router.push("/traveler/plans");
      }
    } catch (error) {
      console.error("Error fetching trip data:", error);
      toast.error("Failed to load trip data");
      router.push("/traveler/plans");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTrip = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/traveler/trips/${tripId}/complete`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Trip completed successfully!");
        router.push("/traveler/plans");
      } else {
        toast.error(data.error || "Failed to complete trip");
      }
    } catch (error) {
      console.error("Error completing trip:", error);
      toast.error("Failed to complete trip");
    } finally {
      setActionLoading(false);
      setCompleteDialogOpen(false);
    }
  };

  const handleCancelTrip = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/traveler/trips/${tripId}/cancel`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Trip cancelled");
        router.push("/traveler/plans");
      } else {
        toast.error(data.error || "Failed to cancel trip");
      }
    } catch (error) {
      console.error("Error cancelling trip:", error);
      toast.error("Failed to cancel trip");
    } finally {
      setActionLoading(false);
      setCancelDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLocationsByDay = () => {
    if (!trip) return {};
    const grouped: { [key: number]: Location[] } = {};
    trip.locations.forEach((loc) => {
      if (!grouped[loc.dayNumber]) {
        grouped[loc.dayNumber] = [];
      }
      grouped[loc.dayNumber].push(loc);
    });
    // Sort locations within each day by visitOrder
    Object.keys(grouped).forEach((day) => {
      grouped[Number(day)].sort((a, b) => a.visitOrder - b.visitOrder);
    });
    return grouped;
  };

  const getIcon = (location: Location, isToday: boolean) => {
    if (typeof window === "undefined") return null;
    
    const L = require("leaflet");
    const iconUrl = isToday
      ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png"
      : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png";

    return new L.Icon({
      iconUrl,
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  const getUserIcon = () => {
    if (typeof window === "undefined") return null;
    
    const L = require("leaflet");
    return new L.Icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full bg-gray-50">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!trip) {
    return null;
  }

  const locationsByDay = getLocationsByDay();
  const routeCoordinates = trip.locations.map((loc) => [loc.latitude, loc.longitude] as [number, number]);
  const center = trip.locations.length > 0
    ? [trip.locations[0].latitude, trip.locations[0].longitude] as [number, number]
    : [6.9271, 79.8612] as [number, number];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50">
        <AppSidebar />

        <div className="flex-1 flex overflow-hidden">
          {/* Left Info Panel */}
          <div className="w-[480px] bg-white border-r border-gray-200 flex flex-col overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-5 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gray-900 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-lg font-bold text-gray-900">Trip to {trip.country}</h1>
                  <Badge variant="default" className="bg-gray-900 mt-1">
                    Day {trip.currentDay}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(new Date().toISOString())}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(currentTime)}</span>
                </div>
              </div>
            </div>

            {/* Guide Info */}
            {trip.guide && (
              <div className="p-5 border-b border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Your Guide</p>
                <div className="space-y-2">
                  <p className="font-semibold text-sm">{trip.guide.name}</p>
                  <div className="flex items-center gap-1 flex-wrap">
                    <Globe className="h-3 w-3 text-gray-400" />
                    {trip.guide.languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                  <a href={`tel:${trip.guide.phone}`}>
                    <Button variant="outline" size="sm" className="w-full hover:bg-gray-900 hover:text-white transition-colors">
                      <Phone className="h-3 w-3 mr-2" />
                      {trip.guide.phone}
                    </Button>
                  </a>
                </div>
              </div>
            )}

            {/* All Destinations by Day */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gray-900 p-1.5 rounded">
                  <Route className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-base">Trip Itinerary</h3>
              </div>
              
              {Object.keys(locationsByDay).length > 0 ? (
                <div className="space-y-4">
                  {Object.keys(locationsByDay)
                    .sort((a, b) => Number(a) - Number(b))
                    .map((day) => {
                      const dayNum = Number(day);
                      const isToday = dayNum === trip.currentDay;
                      return (
                        <div key={day} className="space-y-2">
                          <div className={`flex items-center gap-2 ${isToday ? 'text-gray-900' : 'text-gray-600'}`}>
                            <div className={`h-px flex-1 ${isToday ? 'bg-gray-900' : 'bg-gray-300'}`} />
                            <span className={`text-xs font-semibold uppercase tracking-wider ${isToday ? 'bg-gray-900 text-white px-2 py-1 rounded' : ''}`}>
                              Day {dayNum} {isToday && '(Today)'}
                            </span>
                            <div className={`h-px flex-1 ${isToday ? 'bg-gray-900' : 'bg-gray-300'}`} />
                          </div>
                          <div className="space-y-2">
                            {locationsByDay[dayNum].map((location) => (
                              <Card key={location.id} className={`${isToday ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200'} hover:shadow-md transition-shadow`}>
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-2">
                                    <div className={`${isToday ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'} rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                                      {location.visitOrder}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-sm">{location.title}</p>
                                      <p className={`text-xs mt-1 ${isToday ? 'text-gray-300' : 'text-gray-600'}`}>{location.address}</p>
                                      {location.estimatedDuration && (
                                        <p className={`text-xs mt-1 flex items-center gap-1 ${isToday ? 'text-gray-400' : 'text-gray-500'}`}>
                                          <Clock className="h-3 w-3" />
                                          {location.estimatedDuration}
                                        </p>
                                      )}
                                      <Badge variant={isToday ? "secondary" : "outline"} className="text-xs mt-2">
                                        {location.category}
                                      </Badge>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8 text-sm">No locations scheduled</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-5 border-t border-gray-200 bg-gray-50 space-y-2">
              <Button
                size="sm"
                onClick={() => setCompleteDialogOpen(true)}
                disabled={actionLoading}
                className="w-full bg-gray-900 hover:bg-gray-800 transition-colors"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Trip
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelDialogOpen(true)}
                disabled={actionLoading}
                className="w-full hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Trip
              </Button>
            </div>
          </div>

          {/* Right Map Panel */}
          <div className="flex-1 relative" style={{ minHeight: 0 }}>
            {userLocation && (
              <MapContainer
                center={center}
                zoom={10}
                style={{ height: "100%", width: "100%", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                scrollWheelZoom={true}
              >
                <MapResizer />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User Location */}
                <Marker position={userLocation} icon={getUserIcon()}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-semibold">Your Location</p>
                      <p className="text-xs text-gray-600">Current Position</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Trip Locations */}
                {trip.locations.map((location) => {
                  const isToday = location.dayNumber === trip.currentDay;
                  return (
                    <Marker
                      key={location.id}
                      position={[location.latitude, location.longitude]}
                      icon={getIcon(location, isToday)}
                    >
                      <Popup>
                        <div className="min-w-[250px] max-w-[300px]">
                          {locationImages[location.id] && (
                            <img 
                              src={locationImages[location.id]} 
                              alt={location.title}
                              className="w-full h-32 object-cover rounded mb-2"
                            />
                          )}
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={isToday ? "default" : "secondary"} className={isToday ? "bg-gray-900" : ""}>
                              Day {location.dayNumber} - Stop {location.visitOrder}
                            </Badge>
                          </div>
                          <p className="font-semibold">{location.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{location.address}</p>
                          {location.estimatedDuration && (
                            <p className="text-xs text-gray-500 mt-1">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {location.estimatedDuration}
                            </p>
                          )}
                          <Badge variant="outline" className="text-xs mt-2">
                            {location.category}
                          </Badge>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* Real Road Routing */}
                {routeCoordinates.length > 1 && (
                  <RoutingMachine waypoints={routeCoordinates} />
                )}
              </MapContainer>
            )}
          </div>
        </div>
      </div>

      {/* Complete Trip Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Trip</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this trip as completed? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCompleteDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteTrip}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                "Complete Trip"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Trip Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Trip</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this trip? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={actionLoading}
            >
              No, Keep Trip
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelTrip}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Trip"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
