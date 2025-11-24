"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/guider/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Calendar, Users, Star, CheckCircle, XCircle, Phone, Globe } from "lucide-react";
import { toast } from "sonner";

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
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  
  const [availableTrips, setAvailableTrips] = useState<AvailableTrip[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
  }, []);

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

  const handleAcceptTrip = async (tripId: string) => {
    setActionLoading(tripId);
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
    }
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
                <div className="lg:hidden mb-2"><SidebarTrigger /></div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Guide Dashboard</h1>
                <p className="text-gray-500 text-xs sm:text-sm">{currentDate}</p>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <p className="text-2xl sm:text-3xl font-light text-gray-800">{currentTime}</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <Card className="shadow-sm border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Completed Trips</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats?.totalCompleted || 0}</p>
                    </div>
                    <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Upcoming Trips</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats?.upcomingTrips || 0}</p>
                    </div>
                    <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                      <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Rating</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                        {stats?.rating.toFixed(1) || "0.0"}
                      </p>
                    </div>
                    <div className="bg-yellow-100 p-2 sm:p-3 rounded-lg">
                      <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Reviews</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats?.totalReviews || 0}</p>
                    </div>
                    <div className="bg-purple-100 p-2 sm:p-3 rounded-lg">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Trip (if any) */}
            {stats?.currentTrip && (
              <Card className="mb-4 sm:mb-6 shadow-md border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <div className="bg-blue-600 p-1.5 rounded-md">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    Current Trip <Badge className="ml-2 bg-blue-600">IN PROGRESS</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Traveler</p>
                        <p className="text-base font-semibold text-gray-900">{stats.currentTrip.traveler.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Contact</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a href={`tel:${stats.currentTrip.traveler.phone}`} className="text-sm font-medium text-blue-600 hover:underline">
                            {stats.currentTrip.traveler.phone}
                          </a>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Duration</p>
                        <p className="text-sm text-gray-700">
                          {formatDate(stats.currentTrip.fromDate)} - {formatDate(stats.currentTrip.toDate)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Destination</p>
                        <p className="text-sm text-gray-700">{stats.currentTrip.country}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Group Size</p>
                        <p className="text-sm text-gray-700">{stats.currentTrip.numberOfPeople} people</p>
                      </div>
                      {stats.currentTrip.totalDistance && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Distance</p>
                          <p className="text-sm text-gray-700">{stats.currentTrip.totalDistance.toFixed(1)} km</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Available Trip Requests */}
            <Card className="shadow-sm border-gray-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <div className="bg-orange-100 p-1.5 rounded-md">
                    <Users className="h-4 w-4 text-orange-600" />
                  </div>
                  Available Trip Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availableTrips.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No matching trip requests available</p>
                    <p className="text-gray-400 text-xs mt-1">Check back later for new opportunities</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableTrips.map((trip) => (
                      <div
                        key={trip.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all bg-white"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Trip Info */}
                          <div className="md:col-span-2 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900 text-base">{trip.traveler.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">{trip.country}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {trip.numberOfPeople} {trip.numberOfPeople === 1 ? "person" : "people"}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(trip.fromDate)} - {formatDate(trip.toDate)}</span>
                              </div>
                              {trip.totalDistance && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPin className="h-4 w-4" />
                                  <span>{trip.totalDistance.toFixed(1)} km</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              <Globe className="h-4 w-4 text-gray-400" />
                              <span className="text-xs text-gray-500">Shared languages:</span>
                              {trip.sharedLanguages.map((lang) => (
                                <Badge key={lang} variant="secondary" className="text-xs">
                                  {lang}
                                </Badge>
                              ))}
                            </div>

                            {trip.locations.length > 0 && (
                              <div className="text-xs text-gray-500">
                                {trip.locations.length} location{trip.locations.length !== 1 ? "s" : ""} planned
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex md:flex-col gap-2 md:justify-center">
                            <Button
                              onClick={() => handleAcceptTrip(trip.id)}
                              disabled={actionLoading === trip.id}
                              className="flex-1 bg-green-600 hover:bg-green-700 hover:scale-105 active:scale-98 text-white transition-all duration-200"
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
    </SidebarProvider>
  );
}
