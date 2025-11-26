"use client";

import { AppSidebar } from "@/components/admin/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Calendar,
  Users,
  MapPin,
  Route,
  Search,
  Filter,
  Plane,
  CheckCircle,
  Clock,
  Play,
  AlertCircle,
  UserCheck,
  Eye,
  Star,
  Phone,
  Globe,
} from "lucide-react";
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
  createdAt: string;
  traveler: {
    id: string;
    name: string;
    email: string;
  };
  guide: {
    id: string;
    name: string;
  } | null;
  locations: any[];
}

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [touristData, setTouristData] = useState<any[]>([]);
  const [fuseInstance, setFuseInstance] = useState<Fuse<any> | null>(null);

  useEffect(() => {
    fetchTrips();
    loadTouristData();
  }, [statusFilter]);

  const loadTouristData = async () => {
    try {
      const response = await fetch("/sl_tourist_data.json");
      const data = await response.json();
      
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

  useEffect(() => {
    // Apply search filter
    if (searchTerm.trim() === "") {
      setFilteredTrips(trips);
    } else {
      const filtered = trips.filter((trip) =>
        trip.traveler.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.traveler.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTrips(filtered);
    }
  }, [searchTerm, trips]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const url = statusFilter === "all"
        ? "/api/admin/trips"
        : `/api/admin/trips?status=${statusFilter}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setTrips(data.trips);
        setFilteredTrips(data.trips);
      } else {
        console.error("Failed to fetch trips:", data.error);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; icon: any; className?: string }> = {
      PLANNING: { label: "Planning", variant: "secondary", icon: Clock },
      CONFIRMED: { label: "Confirmed", variant: "default", icon: CheckCircle },
      IN_PROGRESS: { label: "In Progress", variant: "default", icon: Play, className: "bg-green-600" },
      COMPLETED: { label: "Completed", variant: "outline", icon: CheckCircle },
      CANCELLED: { label: "Cancelled", variant: "destructive", icon: AlertCircle },
    };

    const config = statusConfig[status] || statusConfig.PLANNING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className || ""}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getInProgressCount = () => {
    return trips.filter((t) => t.status === "IN_PROGRESS").length;
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
        <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
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
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="hidden md:block mb-4">
                <SidebarTrigger />
              </div>
              <div className="mb-6">
                <h1 className="text-3xl lg:text-4xl font-bold font-poppins bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Trips Overview</h1>
                <p className="text-gray-600 mt-2 font-poppins">Monitor all travel activities</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl">
                        <Route className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    <div className="text-sm font-poppins font-medium text-gray-600 mb-2">Total Trips</div>
                    <div className="text-3xl font-bold font-poppins text-gray-900">{trips.length}</div>
                  </div>
                </div>
                <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl">
                        <Play className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    <div className="text-sm font-poppins font-medium text-gray-600 mb-2">In Progress</div>
                    <div className="text-3xl font-bold font-poppins text-green-600">{getInProgressCount()}</div>
                  </div>
                </div>
                <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl">
                        <CheckCircle className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    <div className="text-sm font-poppins font-medium text-gray-600 mb-2">Confirmed</div>
                    <div className="text-3xl font-bold font-poppins text-blue-600">
                      {trips.filter((t) => t.status === "CONFIRMED").length}
                    </div>
                  </div>
                </div>
                <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl">
                        <CheckCircle className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    <div className="text-sm font-poppins font-medium text-gray-600 mb-2">Completed</div>
                    <div className="text-3xl font-bold font-poppins text-gray-600">
                      {trips.filter((t) => t.status === "COMPLETED").length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by traveler name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PLANNING">Planning</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Trips Table */}
            {filteredTrips.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Plane className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips found</h3>
                  <p className="text-gray-600 text-center">
                    {searchTerm ? "Try adjusting your search" : "No trips match the selected filters"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Desktop Table */}
                <Card className="hidden lg:block">
                  <CardHeader>
                    <CardTitle className="text-lg">All Trips ({filteredTrips.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Traveler</TableHead>
                          <TableHead>Destination</TableHead>
                          <TableHead>Dates</TableHead>
                          <TableHead>People</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Guide</TableHead>
                          <TableHead>Locations</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTrips.map((trip) => (
                          <TableRow
                            key={trip.id}
                            className={trip.status === "IN_PROGRESS" ? "bg-green-50" : ""}
                          >
                            <TableCell>
                              <div>
                                <div className="font-medium">{trip.traveler.name}</div>
                                <div className="text-xs text-gray-500">{trip.traveler.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">{trip.country}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span>
                                  {formatDate(trip.fromDate)} - {formatDate(trip.toDate)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Users className="h-3 w-3 text-gray-400" />
                                <span>{trip.numberOfPeople}</span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(trip.status)}</TableCell>
                            <TableCell>
                              {trip.guide ? (
                                <div className="flex items-center gap-1 text-sm">
                                  <UserCheck className="h-3 w-3 text-green-600" />
                                  <span>{trip.guide.name}</span>
                                </div>
                              ) : trip.needsGuide ? (
                                <Badge variant="outline" className="text-xs">
                                  Requested
                                </Badge>
                              ) : (
                                <span className="text-xs text-gray-400">No guide</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-600">
                                {trip.locations.length} {trip.locations.length === 1 ? "place" : "places"}
                              </div>
                              {trip.totalDistance && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Route className="h-3 w-3" />
                                  {Math.round(trip.totalDistance)} km
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(trip)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {filteredTrips.map((trip) => (
                    <Card
                      key={trip.id}
                      className={trip.status === "IN_PROGRESS" ? "border-green-500 border-2" : ""}
                    >
                      <CardContent className="p-4 space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">{trip.traveler.name}</div>
                            <div className="text-xs text-gray-500">{trip.traveler.email}</div>
                          </div>
                          {getStatusBadge(trip.status)}
                        </div>

                        {/* Trip Details */}
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{trip.country}</span>
                          </div>
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
                          {trip.guide && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <UserCheck className="h-4 w-4 text-green-600" />
                              <span>Guide: {trip.guide.name}</span>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="pt-2 border-t flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            {trip.locations.length} locations • {trip.totalDistance ? `${Math.round(trip.totalDistance)} km` : "Distance TBD"}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(trip)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Trip Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Trip to {selectedTrip?.country}
            </DialogTitle>
            <DialogDescription>
              Traveler: {selectedTrip?.traveler.name} ({selectedTrip?.traveler.email})
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
            {selectedTrip && (
              <div className="space-y-6">
                {/* Trip Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Dates</div>
                    <div className="text-sm font-semibold">
                      {formatDate(selectedTrip.fromDate)} - {formatDate(selectedTrip.toDate)}
                    </div>
                  </div>
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
                </div>

                {/* Guide Info */}
                {selectedTrip.guide && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-semibold">Guide Assigned</div>
                        <div className="text-sm text-gray-600">{selectedTrip.guide.name}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedTrip.planDescription && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-sm mb-2">Trip Description</h3>
                    <p className="text-sm text-gray-700">{selectedTrip.planDescription}</p>
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
