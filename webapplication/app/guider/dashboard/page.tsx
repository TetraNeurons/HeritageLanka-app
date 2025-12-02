"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/guider/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Calendar, Users, Star, CheckCircle, XCircle, Phone, Globe, Clock, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TripLocation {
  id: string;
  title: string;
  address: string;
  dayNumber: number;
  visitOrder: number;
}

interface AvailableTrip {
  id: string;
  traveler: {
    userId: string;
    name: string;
    languages: string[];
  };
  fromDate: string;
  toDate: string;
  numberOfPeople: number;
  country: string;
  totalDistance: number | null;
  sharedLanguages: string[];
  locations: TripLocation[];
}

interface MyTrip {
  id: string;
  traveler: {
    userId: string;
    name: string;
    phone?: string;
  };
  fromDate: string;
  toDate: string;
  status: string;
  bookingStatus: string;
  numberOfPeople: number;
  country: string;
  totalDistance: number | null;
  locations: TripLocation[];
}

interface DashboardStats {
  totalCompleted: number;
  currentTrip: MyTrip | null;
  upcomingTrips: number;
  rating: number;
  totalReviews: number;
}

export default function GuiderDashboardPage() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  
  const [availableTrips, setAvailableTrips] = useState<AvailableTrip[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<{
    status: string;
    message: string;
    rejectionReason?: string;
    isLegacy?: boolean;
  } | null>(null);
  const [showVerificationBanner, setShowVerificationBanner] = useState(true);
  const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set());
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedTripToAccept, setSelectedTripToAccept] = useState<AvailableTrip | null>(null);

  // Update time
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setCurrentDate(now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch("/api/guider/verification-status");
      const data = await response.json();
      if (data.success && data.verification) {
        setVerificationStatus({
          status: data.verification.status,
          message: data.verification.message,
          rejectionReason: data.verification.rejectionReason,
          isLegacy: data.verification.isLegacy,
        });
      }
    } catch (error) {
      console.error("Error fetching verification status:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [availableRes, statsRes] = await Promise.all([
        fetch("/api/guider/available-trips"),
        fetch("/api/guider/dashboard-stats"),
      ]);

      const availableData = await availableRes.json();
      const statsData = await statsRes.json();

      if (availableData.success) {
        setAvailableTrips(availableData.trips);
      }

      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTripClick = (trip: AvailableTrip) => {
    setSelectedTripToAccept(trip);
    setConfirmDialogOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (!selectedTripToAccept) return;

    const tripId = selectedTripToAccept.id;
    setActionLoading(tripId);
    setConfirmDialogOpen(false);
    
    try {
      const res = await fetch(`/api/guider/trips/${tripId}/accept`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        // Refresh dashboard data
        await fetchDashboardData();
        toast.success("Trip accepted successfully!");
      } else {
        toast.error(data.error || "Failed to accept trip");
      }
    } catch (error) {
      console.error("Failed to accept trip:", error);
      toast.error("Failed to accept trip");
    } finally {
      setActionLoading(null);
      setSelectedTripToAccept(null);
    }
  };

  const toggleTripExpanded = (tripId: string) => {
    setExpandedTrips(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tripId)) {
        newSet.delete(tripId);
      } else {
        newSet.add(tripId);
      }
      return newSet;
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <AppSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 sm:mb-6 gap-3">
              <div className="w-full sm:w-auto">
                <div className="hidden md:block mb-2"><SidebarTrigger /></div>
                <h1 className="text-xl sm:text-2xl font-bold font-poppins tracking-tight text-gray-900">Guide Dashboard</h1>
                <p className="text-gray-500 text-xs sm:text-sm font-poppins">{currentDate}</p>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <p className="text-2xl sm:text-3xl font-light font-poppins text-gray-800">{currentTime}</p>
              </div>
            </div>

            {/* Verification Status Banner - Only show for PENDING or REJECTED, not for VERIFIED (including legacy) */}
            {verificationStatus && (verificationStatus.status === 'PENDING' || verificationStatus.status === 'REJECTED') && showVerificationBanner && (
              <div className={`mb-4 sm:mb-6 p-4 rounded-lg border-2 flex items-start justify-between ${
                verificationStatus.status === 'PENDING' 
                  ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                  : 'bg-red-50 border-red-300 text-red-800'
              }`}>
                <div className="flex items-start gap-3 flex-1">
                  {verificationStatus.status === 'PENDING' ? (
                    <Clock className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className="font-semibold font-poppins mb-1">
                      {verificationStatus.status === 'PENDING' 
                        ? 'Verification Pending' 
                        : 'Verification Rejected'}
                    </h3>
                    <p className="text-sm font-poppins">
                      {verificationStatus.message}
                    </p>
                    {verificationStatus.rejectionReason && (
                      <p className="text-sm font-poppins mt-2 italic">
                        Reason: {verificationStatus.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowVerificationBanner(false)}
                  className="text-current hover:opacity-70 transition-opacity"
                  aria-label="Dismiss banner"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <Card className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-poppins font-semibold text-gray-500 uppercase tracking-wider">Completed Trips</p>
                      <p className="text-2xl sm:text-3xl font-bold font-poppins text-gray-900 mt-1">{stats?.totalCompleted || 0}</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 sm:p-3 rounded-lg shadow-lg">
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-poppins font-semibold text-gray-500 uppercase tracking-wider">Upcoming Trips</p>
                      <p className="text-2xl sm:text-3xl font-bold font-poppins text-gray-900 mt-1">{stats?.upcomingTrips || 0}</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 sm:p-3 rounded-lg shadow-lg">
                      <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-poppins font-semibold text-gray-500 uppercase tracking-wider">Rating</p>
                      <p className="text-2xl sm:text-3xl font-bold font-poppins text-gray-900 mt-1">
                        {stats?.rating.toFixed(1) || "0.0"}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 sm:p-3 rounded-lg shadow-lg">
                      <Star className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-poppins font-semibold text-gray-500 uppercase tracking-wider">Total Reviews</p>
                      <p className="text-2xl sm:text-3xl font-bold font-poppins text-gray-900 mt-1">{stats?.totalReviews || 0}</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 sm:p-3 rounded-lg shadow-lg">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Trip (if any) */}
            {stats?.currentTrip && (
              <Card className="mb-4 sm:mb-6 bg-white/95 backdrop-blur-md border-2 border-amber-200 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <CardHeader className="pb-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-poppins">
                    <div className="bg-white/20 p-1.5 rounded-md backdrop-blur-sm">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    Current Trip <Badge className="ml-2 bg-white text-amber-600 hover:bg-white font-poppins font-bold">IN PROGRESS</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 font-poppins uppercase tracking-wider">Traveler</p>
                        <button
                          onClick={() => stats.currentTrip && router.push(`/profile/${stats.currentTrip.traveler.userId}`)}
                          className="text-base font-poppins font-semibold text-gray-900 hover:text-amber-600 hover:underline"
                        >
                          {stats.currentTrip.traveler.name}
                        </button>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-poppins uppercase tracking-wider">Contact</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a href={`tel:${stats.currentTrip.traveler.phone}`} className="text-sm font-poppins font-medium text-amber-600 hover:underline">
                            {stats.currentTrip.traveler.phone}
                          </a>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-poppins uppercase tracking-wider">Duration</p>
                        <p className="text-sm font-poppins text-gray-700">
                          {formatDate(stats.currentTrip.fromDate)} - {formatDate(stats.currentTrip.toDate)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 font-poppins uppercase tracking-wider">Destination</p>
                        <p className="text-sm font-poppins text-gray-700">{stats.currentTrip.country}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-poppins uppercase tracking-wider">Group Size</p>
                        <p className="text-sm font-poppins text-gray-700">{stats.currentTrip.numberOfPeople} people</p>
                      </div>
                      {stats.currentTrip.totalDistance && (
                        <div>
                          <p className="text-xs text-gray-500 font-poppins uppercase tracking-wider">Total Distance</p>
                          <p className="text-sm font-poppins text-gray-700">{stats.currentTrip.totalDistance.toFixed(1)} km</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Available Trip Requests */}
            <Card className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-poppins">
                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-1.5 rounded-md shadow-md">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  Available Trip Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availableTrips.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-poppins text-sm">No matching trip requests available</p>
                    <p className="text-gray-400 font-poppins text-xs mt-1">Check back later for new opportunities</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableTrips.map((trip) => (
                      <div
                        key={trip.id}
                        className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-amber-200 transition-all bg-white"
                      >
                        <div className="space-y-3">
                          {/* Trip Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <button
                                onClick={() => router.push(`/profile/${trip.traveler.userId}`)}
                                className="font-semibold font-poppins text-gray-900 text-base hover:text-amber-600 hover:underline text-left"
                              >
                                {trip.traveler.name}
                              </button>
                              <p className="text-sm font-poppins text-gray-500 mt-1">{trip.country}</p>
                            </div>
                            <Badge variant="outline" className="text-xs font-poppins border-2">
                              {trip.numberOfPeople} {trip.numberOfPeople === 1 ? "person" : "people"}
                            </Badge>
                          </div>

                          {/* Trip Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span className="font-poppins">{formatDate(trip.fromDate)} - {formatDate(trip.toDate)}</span>
                            </div>
                            {trip.totalDistance && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span className="font-poppins">{trip.totalDistance.toFixed(1)} km</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <span className="text-xs font-poppins text-gray-500">Shared languages:</span>
                            {trip.sharedLanguages.map((lang) => (
                              <Badge key={lang} variant="secondary" className="text-xs font-poppins border-2">
                                {lang}
                              </Badge>
                            ))}
                          </div>

                          {/* Expandable Locations */}
                          {trip.locations.length > 0 && (
                            <div className="pt-2 border-t">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleTripExpanded(trip.id)}
                                className="w-full justify-between hover:bg-amber-50 transition-colors duration-200 font-poppins"
                              >
                                <span className="text-sm font-medium">
                                  {trip.locations.length} location{trip.locations.length !== 1 ? "s" : ""} planned
                                </span>
                                {expandedTrips.has(trip.id) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>

                              {expandedTrips.has(trip.id) && (
                                <div className="mt-3 space-y-2 animate-fadeIn">
                                  {trip.locations.map((location, idx) => (
                                    <div
                                      key={location.id}
                                      className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm"
                                    >
                                      <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                          <p className="font-poppins font-medium text-gray-900">{location.title}</p>
                                          <p className="font-poppins text-gray-600 text-xs mt-1">{location.address}</p>
                                          <div className="flex items-center gap-3 mt-2 text-xs font-poppins text-gray-500">
                                            <span>Day {location.dayNumber}</span>
                                            <span>•</span>
                                            <span>Stop {location.visitOrder}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              onClick={() => handleAcceptTripClick(trip)}
                              disabled={actionLoading === trip.id}
                              className="flex-1 h-12 font-poppins font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 hover:scale-105 active:scale-98 text-white shadow-xl transition-all duration-200"
                            >
                              {actionLoading === trip.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Accept
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-md border-2 border-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-poppins text-xl">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Accept Trip Request
            </DialogTitle>
            <DialogDescription className="font-poppins">
              Are you sure you want to accept this trip?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedTripToAccept && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 p-4 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold font-poppins text-gray-700">Traveler:</span>
                    <span className="ml-2 font-poppins text-gray-900">{selectedTripToAccept.traveler.name}</span>
                  </div>
                  <div>
                    <span className="font-semibold font-poppins text-gray-700">Duration:</span>
                    <span className="ml-2 font-poppins text-gray-900">
                      {formatDate(selectedTripToAccept.fromDate)} - {formatDate(selectedTripToAccept.toDate)}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold font-poppins text-gray-700">Group Size:</span>
                    <span className="ml-2 font-poppins text-gray-900">
                      {selectedTripToAccept.numberOfPeople} {selectedTripToAccept.numberOfPeople === 1 ? "person" : "people"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold font-poppins text-gray-700">Locations:</span>
                    <span className="ml-2 font-poppins text-gray-900">
                      {selectedTripToAccept.locations.length} stop{selectedTripToAccept.locations.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-semibold font-poppins mb-2">Important Notice:</p>
                  <p className="font-poppins">
                    You can only work on <strong>one trip at a time</strong>. Accepting this trip means you won't be able to accept other trip requests until you complete this one.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDialogOpen(false);
                setSelectedTripToAccept(null);
              }}
              className="font-poppins font-semibold border-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAccept}
              className="font-poppins font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Yes, Accept Trip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
