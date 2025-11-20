"use client";

import { AppSidebar } from "@/components/traveler/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Trash2,
  CreditCard,
  Play,
  AlertCircle,
  CheckCircle,
  Clock,
  Route,
  Eye,
  Star,
  Phone,
  Globe,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Trip {
  id: string;
  fromDate: string;
  toDate: string;
  numberOfPeople: number;
  country: string;
  status: string;
  bookingStatus: string;
  totalDistance: number | null;
  needsGuide: boolean;
  planDescription: string | null;
  aiSummary: string | null;
  createdAt: string;
  locations: any[];
  payment: {
    id: string;
    amount: number;
    status: string;
    paidAt: string | null;
  } | null;
}

export default function TravelerPlansPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [hasActiveTrip, setHasActiveTrip] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [touristData, setTouristData] = useState<any[]>([]);
  const [fuseInstance, setFuseInstance] = useState<Fuse<any> | null>(null);

  useEffect(() => {
    fetchTrips();
    loadTouristData();
  }, []);

  const loadTouristData = async () => {
    try {
      const response = await fetch("/sl_tourist_data.json");
      const data = await response.json();
      
      // Flatten all attractions from all districts
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
      
      // Initialize Fuse for fuzzy search
      const fuse = new Fuse(allAttractions, {
        keys: ["title", "address"],
        threshold: 0.4,
        includeScore: true,
      });
      setFuseInstance(fuse);
    } catch (error) {
      console.error("Failed to load tourist data:", error);
    }
  };

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/traveler/trips");
      const data = await response.json();

      if (data.success) {
        setTrips(data.trips);
        // Check if there's an active trip
        const activeTrip = data.trips.find((t: Trip) => t.status === "IN_PROGRESS");
        setHasActiveTrip(!!activeTrip);
      } else {
        console.error("Failed to fetch trips:", data.error);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (trip: Trip) => {
    setSelectedTrip(trip);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTrip) return;

    try {
      setActionLoading(selectedTrip.id);
      const response = await fetch(`/api/traveler/trips/${selectedTrip.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        // Show success message
        alert("Trip deleted successfully!");
        // Refresh trip list
        await fetchTrips();
      } else {
        alert(`Failed to delete trip: ${data.error}`);
      }
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Failed to delete trip. Please try again.");
    } finally {
      setActionLoading(null);
      setDeleteDialogOpen(false);
      setSelectedTrip(null);
    }
  };

  const handlePaymentClick = async (trip: Trip) => {
    try {
      setActionLoading(trip.id);
      const response = await fetch(`/api/traveler/trips/${trip.id}/payment`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success && data.sessionUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.sessionUrl;
      } else {
        alert(`Failed to initiate payment: ${data.error}`);
        setActionLoading(null);
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Failed to initiate payment. Please try again.");
      setActionLoading(null);
    }
  };

  const handleStartClick = (trip: Trip) => {
    setSelectedTrip(trip);
    setStartDialogOpen(true);
  };

  const handleStartConfirm = async () => {
    if (!selectedTrip) return;

    try {
      setActionLoading(selectedTrip.id);
      const response = await fetch(`/api/traveler/trips/${selectedTrip.id}/start`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        alert("Trip started successfully! Enjoy your journey!");
        await fetchTrips();
      } else {
        alert(`Failed to start trip: ${data.error}`);
      }
    } catch (error) {
      console.error("Error starting trip:", error);
      alert("Failed to start trip. Please try again.");
    } finally {
      setActionLoading(null);
      setStartDialogOpen(false);
      setSelectedTrip(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
      PLANNING: { label: "Planning", variant: "secondary", icon: Clock },
      CONFIRMED: { label: "Confirmed", variant: "default", icon: CheckCircle },
      IN_PROGRESS: { label: "In Progress", variant: "default", icon: Play },
      COMPLETED: { label: "Completed", variant: "outline", icon: CheckCircle },
      CANCELLED: { label: "Cancelled", variant: "destructive", icon: AlertCircle },
    };

    const config = statusConfig[status] || statusConfig.PLANNING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const canDelete = (trip: Trip) => {
    return trip.status === "PLANNING" || trip.status === "CONFIRMED";
  };

  const canPay = (trip: Trip) => {
    return trip.status === "CONFIRMED" && !trip.payment;
  };

  const canStart = (trip: Trip) => {
    return (
      trip.status === "CONFIRMED" &&
      trip.payment?.status === "PAID" &&
      !hasActiveTrip
    );
  };

  const isReadOnly = (trip: Trip) => {
    return ["IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(trip.status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const matchLocationWithTouristData = (location: any) => {
    if (!fuseInstance) return null;
    
    const searchQuery = location.title || location.name || location.address;
    const results = fuseInstance.search(searchQuery);
    
    if (results.length > 0 && results[0].score && results[0].score < 0.3) {
      return results[0].item;
    }
    return null;
  };

  const handleViewDetails = (trip: Trip) => {
    setSelectedTrip(trip);
    setDetailsDialogOpen(true);
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

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50">
        <AppSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="lg:hidden mb-4">
                <SidebarTrigger />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Your Travel Plans</h1>
              <p className="text-gray-600 mt-1">Manage and track your trips</p>
            </div>

            {/* Empty State */}
            {trips.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MapPin className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No travel plans yet</h3>
                  <p className="text-gray-600 text-center mb-6">
                    Start planning your next adventure in Sri Lanka
                  </p>
                  <Button onClick={() => router.push("/traveler/plan")}>
                    Create Your First Plan
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {trips.map((trip) => (
                  <Card key={trip.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-600" />
                            {trip.country}
                          </CardTitle>
                        </div>
                        {getStatusBadge(trip.status)}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Trip Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(trip.fromDate)} - {formatDate(trip.toDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{trip.numberOfPeople} {trip.numberOfPeople === 1 ? "person" : "people"}</span>
                        </div>
                        {trip.totalDistance && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Route className="h-4 w-4" />
                            <span>{Math.round(trip.totalDistance)} km</span>
                          </div>
                        )}
                        {trip.needsGuide && (
                          <Badge variant="outline" className="text-xs">
                            With Guide
                          </Badge>
                        )}
                      </div>

                      {/* Description */}
                      {(trip.aiSummary || trip.planDescription) && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {trip.aiSummary || trip.planDescription}
                        </p>
                      )}

                      {/* Locations Count */}
                      {trip.locations.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {trip.locations.length} {trip.locations.length === 1 ? "location" : "locations"} to visit
                        </div>
                      )}

                      {/* Payment Status */}
                      {trip.payment && (
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Payment:</span>
                            <Badge
                              variant={trip.payment.status === "PAID" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {trip.payment.status === "PAID" ? "Paid" : "Pending"}
                            </Badge>
                          </div>
                          {trip.payment.status === "PAID" && trip.payment.paidAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Paid on {formatDate(trip.payment.paidAt)}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {/* View Details Button - Always visible */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(trip)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>

                        {/* Delete Button */}
                        {canDelete(trip) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(trip)}
                            disabled={actionLoading === trip.id}
                            className="flex-1"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        )}

                        {/* Payment Button */}
                        {canPay(trip) && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handlePaymentClick(trip)}
                            disabled={actionLoading === trip.id}
                            className="flex-1"
                          >
                            {actionLoading === trip.id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <CreditCard className="h-4 w-4 mr-1" />
                            )}
                            Pay Now
                          </Button>
                        )}

                        {/* Start Button */}
                        {canStart(trip) && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleStartClick(trip)}
                            disabled={actionLoading === trip.id}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start Trip
                          </Button>
                        )}

                        {/* Disabled Start Button (Another trip in progress) */}
                        {trip.status === "CONFIRMED" &&
                          trip.payment?.status === "PAID" &&
                          hasActiveTrip && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="flex-1"
                            title="You have another trip in progress"
                          >
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Cannot Start
                          </Button>
                        )}

                        {/* Read-only indicator */}
                        {isReadOnly(trip) && !canStart(trip) && (
                          <div className="w-full text-center text-xs text-gray-500 py-2">
                            {trip.status === "IN_PROGRESS" && "Trip is currently in progress"}
                            {trip.status === "COMPLETED" && "Trip completed"}
                            {trip.status === "CANCELLED" && "Trip cancelled"}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Travel Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this trip to {selectedTrip?.country}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={actionLoading !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={actionLoading !== null}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Start Trip Confirmation Dialog */}
      <Dialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Your Trip</DialogTitle>
            <DialogDescription>
              Are you ready to start your trip to {selectedTrip?.country}? This will mark your trip as in progress.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStartDialogOpen(false)}
              disabled={actionLoading !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartConfirm}
              disabled={actionLoading !== null}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                "Start Trip"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trip Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Trip to {selectedTrip?.country}
            </DialogTitle>
            <DialogDescription>
              {selectedTrip && formatDate(selectedTrip.fromDate)} - {selectedTrip && formatDate(selectedTrip.toDate)}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
            {selectedTrip && (
              <div className="space-y-6">
                {/* Trip Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">People</div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-600" />
                      <span className="font-semibold">{selectedTrip.numberOfPeople}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Distance</div>
                    <div className="flex items-center gap-1">
                      <Route className="h-4 w-4 text-gray-600" />
                      <span className="font-semibold">
                        {selectedTrip.totalDistance ? `${Math.round(selectedTrip.totalDistance)} km` : "TBD"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Status</div>
                    <div>{getStatusBadge(selectedTrip.status)}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Guide</div>
                    <div className="font-semibold text-sm">
                      {selectedTrip.needsGuide ? "Required" : "Not needed"}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {(selectedTrip.aiSummary || selectedTrip.planDescription) && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-sm mb-2">Trip Description</h3>
                    <p className="text-sm text-gray-700">
                      {selectedTrip.aiSummary || selectedTrip.planDescription}
                    </p>
                  </div>
                )}

                {/* Locations */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">
                    Places to Visit ({selectedTrip.locations.length})
                  </h3>
                  <div className="space-y-4">
                    {selectedTrip.locations.map((location, index) => {
                      const touristInfo = matchLocationWithTouristData(location);
                      const mainImage = touristInfo?.images?.[0];

                      return (
                        <Card key={location.id || index} className="overflow-hidden">
                          <div className="flex flex-col md:flex-row">
                            {/* Image */}
                            {mainImage ? (
                              <div className="md:w-48 h-48 md:h-auto relative flex-shrink-0">
                                <img
                                  src={mainImage.imageUrl}
                                  alt={location.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "https://via.placeholder.com/300x200?text=No+Image";
                                  }}
                                />
                                <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                                  Day {location.dayNumber}
                                </div>
                              </div>
                            ) : (
                              <div className="md:w-48 h-48 md:h-auto bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                                <div className="text-center">
                                  <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                                  <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                                    Day {location.dayNumber}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Details */}
                            <CardContent className="flex-1 p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-lg">{location.title}</h4>
                                  <p className="text-sm text-gray-600">{location.address || location.district}</p>
                                </div>
                                {touristInfo?.rating && (
                                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    <span className="font-semibold text-sm">{touristInfo.rating}</span>
                                    {touristInfo.ratingCount && (
                                      <span className="text-xs text-gray-500">({touristInfo.ratingCount})</span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {location.reasonForSelection && (
                                <p className="text-sm text-gray-600 mb-3 italic">
                                  "{location.reasonForSelection}"
                                </p>
                              )}

                              <div className="flex flex-wrap gap-2 text-xs">
                                {location.category && (
                                  <Badge variant="outline">{location.category}</Badge>
                                )}
                                {location.estimatedDuration && (
                                  <Badge variant="secondary">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {location.estimatedDuration}
                                  </Badge>
                                )}
                                {touristInfo?.category && (
                                  <Badge variant="outline">{touristInfo.category}</Badge>
                                )}
                              </div>

                              {/* Contact Info */}
                              {(touristInfo?.phoneNumber || touristInfo?.website) && (
                                <div className="mt-3 pt-3 border-t flex flex-wrap gap-3 text-xs">
                                  {touristInfo.phoneNumber && (
                                    <a
                                      href={`tel:${touristInfo.phoneNumber}`}
                                      className="flex items-center gap-1 text-blue-600 hover:underline"
                                    >
                                      <Phone className="h-3 w-3" />
                                      {touristInfo.phoneNumber}
                                    </a>
                                  )}
                                  {touristInfo.website && (
                                    <a
                                      href={touristInfo.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-blue-600 hover:underline"
                                    >
                                      <Globe className="h-3 w-3" />
                                      Website
                                    </a>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
