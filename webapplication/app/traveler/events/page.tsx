"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppSidebar } from "@/components/traveler/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";

import {
  Calendar,
  MapPin,
  Tag,
  Phone,
  ExternalLink,
  Ticket,
  LayoutGrid,
  MapIcon
} from "lucide-react";
import { EventItem } from "@/lib/types";
import { NearbyPlacesButton } from "@/components/NearbyPlacesButton";
import dynamic from "next/dynamic";

// Dynamically import map to avoid SSR issues
const EventsMap = dynamic(
  () => import("@/components/EventsMap").then((mod) => mod.EventsMap),
  { ssr: false, loading: () => <div className="h-full w-full bg-gray-100 rounded-lg animate-pulse" /> }
);


export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [myTickets, setMyTickets] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [activeTab, setActiveTab] = useState<"all" | "my-tickets">("all");
  const [purchasingEventId, setPurchasingEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
    fetchMyTickets();

    // Check for payment result in URL
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");

    if (paymentStatus === "success") {
      toast.success("Payment successful! Your tickets have been confirmed.");
      // Clear the query parameter
      window.history.replaceState({}, "", "/traveler/events");
      // Refresh my tickets
      fetchMyTickets();
    } else if (paymentStatus === "cancelled") {
      toast.info("Payment was cancelled. You can try again anytime.");
      // Clear the query parameter
      window.history.replaceState({}, "", "/traveler/events");
    } else if (paymentStatus === "error") {
      toast.error("Payment processing failed. Please try again or contact support.");
      // Clear the query parameter
      window.history.replaceState({}, "", "/traveler/events");
    }
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/traveler/events");
      const data = await res.json();
      setEvents(data || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTickets = async () => {
    try {
      const res = await fetch("/api/traveler/my-tickets", {
        credentials: "include",
      });
      const data = await res.json();
      setMyTickets(data || []);
    } catch (error) {
      console.error("Failed to fetch my tickets:", error);
    }
  };

  const openGoogleMaps = (lat: number, lng: number, place: string) => {
    const query = encodeURIComponent(place);
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place=${query}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handlePurchase = async (event: EventItem) => {
    // Check if sold out
    if (event.ticketCount <= 0) {
      toast.error("Sorry, this event is sold out");
      return;
    }

    // Set loading state
    setPurchasingEventId(event.id);

    try {
      // Call purchase API (authentication handled by cookies)
      const response = await fetch(`/api/traveler/events/${event.id}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify({ quantity: 1 }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          toast.error("Please sign in to purchase tickets");
          router.push("/auth/signin?redirect=/traveler/events");
          return;
        }
        throw new Error(data.error || "Purchase failed");
      }

      // Handle free events
      if (event.price.toLowerCase().includes("free")) {
        toast.success("Successfully registered for the event!");
        await fetchEvents(); // Refresh list
        await fetchMyTickets(); // Refresh my tickets
        setSelectedEvent(null); // Close dialog
      } else {
        // Handle paid events - redirect to Stripe
        if (data.sessionUrl) {
          window.location.href = data.sessionUrl;
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to process purchase");
    } finally {
      setPurchasingEventId(null);
    }
  };

  const getButtonText = (event: EventItem) => {
    if (event.ticketCount <= 0) return "Sold Out";
    if (purchasingEventId === event.id) return "Processing...";
    return event.price.toLowerCase().includes("free")
      ? "Register Interest"
      : "Buy Tickets Now";
  };

  const isButtonDisabled = (event: EventItem) => {
    return event.ticketCount <= 0 || purchasingEventId === event.id;
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Loading events...</p>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <AppSidebar />

        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-poppins">Events</h1>
            
            {/* Tab Switcher */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 border-2 border-gray-300 rounded-xl p-1 shadow-md bg-white">
                <Button
                  variant={activeTab === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("all")}
                  className={`gap-2 font-semibold font-poppins ${activeTab === "all" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white" : ""}`}
                >
                  <Calendar className="w-4 h-4" />
                  All Events
                </Button>
                <Button
                  variant={activeTab === "my-tickets" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("my-tickets")}
                  className={`gap-2 font-semibold font-poppins ${activeTab === "my-tickets" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white" : ""}`}
                >
                  <Ticket className="w-4 h-4" />
                  My Tickets ({myTickets.length})
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-semibold font-poppins bg-white px-4 py-3 rounded-xl shadow-md border-2 border-gray-200">
                {activeTab === "all" ? `${events.length} events available` : `${myTickets.length} tickets purchased`}
              </span>
              
              {/* View Mode Toggle - Only show for All Events */}
              {activeTab === "all" && (
                <div className="flex items-center gap-2 border-2 border-gray-300 rounded-xl p-1 shadow-md bg-white">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`gap-2 font-semibold font-poppins ${viewMode === "grid" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white" : ""}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === "map" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("map")}
                    className={`gap-2 font-semibold font-poppins ${viewMode === "map" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white" : ""}`}
                  >
                    <MapIcon className="w-4 h-4" />
                    Map
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* All Events Tab */}
          {activeTab === "all" && (
            <>
              {/* Map View */}
              {viewMode === "map" && (
                <div className="w-full h-[calc(100vh-280px)]">
                  <EventsMap events={events} />
                </div>
              )}

              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {events.length === 0 && (
                  <div className="col-span-full flex items-center justify-center py-20">
                    <p className="text-gray-500 text-lg">No events available at the moment</p>
                  </div>
                )}


                {events.length > 0 && events.map(event => (
              <div
                key={event.id}
                className="border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-2xl transition-all bg-white/95 backdrop-blur-md shadow-lg"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={event.images?.[0]}
                    alt={event.title}
                    className="w-full h-52 object-cover"
                  />

                  {event.price === "Free" && (
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg">
                      FREE
                    </span>
                  )}

                  {event.ticketCount <= 0 && (
                    <span className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg">
                      SOLD OUT
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <h2 className="text-base lg:text-lg font-bold text-gray-900 line-clamp-2 font-poppins">
                    {event.title}
                  </h2>

                  <div className="space-y-2 text-xs lg:text-sm text-gray-700">
                    <p className="flex items-center gap-2 font-medium font-poppins">
                      <Calendar className="w-4 h-4 text-amber-600" /> {event.date}
                    </p>
                    <p className="flex items-center gap-2 font-medium font-poppins">
                      <MapPin className="w-4 h-4 text-amber-600" /> {event.place}
                    </p>
                    <p className="flex items-center gap-2 font-bold text-gray-900 font-poppins">
                      <Tag className="w-4 h-4 text-amber-600" /> {event.price}
                    </p>
                    <p className="flex items-center gap-2 font-medium font-poppins">
                      <Ticket className="w-4 h-4 text-amber-600" /> {event.ticketCount} tickets
                      available
                    </p>
                  </div>

                  {/* Dialog */}
                  <Dialog open={selectedEvent?.id === event.id} onOpenChange={(open) => {
                    if (!open) setSelectedEvent(null);
                    else setSelectedEvent(event);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full mt-3 border-2 hover:bg-amber-50 hover:border-amber-300 font-semibold font-poppins shadow-md">
                        View Details
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white/95 backdrop-blur-md border-2 border-gray-200 shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl lg:text-2xl font-bold pr-8 font-poppins text-gray-900">
                          {event.title}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                          Event details including images, description, location, and contact information
                        </DialogDescription>
                      </DialogHeader>

                      {/* Image Carousel */}
                      <Carousel className="w-full my-5">
                        <CarouselContent>
                          {event.images?.map((img, idx) => (
                            <CarouselItem key={idx}>
                              <img
                                src={img}
                                alt={event.title}
                                className="w-full h-72 object-cover rounded-lg"
                              />
                            </CarouselItem>
                          ))}
                        </CarouselContent>

                        {event.images?.length > 1 && (
                          <>
                            <CarouselPrevious className="left-4" />
                            <CarouselNext className="right-4" />
                          </>
                        )}
                      </Carousel>

                      {/* Info */}
                      <div className="my-5">
                        <h3 className="font-semibold text-base lg:text-lg mb-2">
                          About this Event
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {event.description}
                        </p>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 bg-gray-50 rounded-lg p-5">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm lg:text-base">Date</p>
                              <p className="text-xs lg:text-sm text-gray-600">
                                {event.date}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm lg:text-base">Location</p>
                              <p className="text-xs lg:text-sm text-gray-600">
                                {event.place}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm lg:text-base">Contact</p>
                              <p className="text-xs lg:text-sm text-black font-medium">
                                {event.phone}
                              </p>
                              <p className="text-xs text-gray-500">
                                {event.organizer}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Ticket className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm lg:text-base">Availability</p>
                              <p className="text-xs lg:text-sm text-gray-800 font-medium">
                                {event.ticketCount} tickets
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Button
                            variant="outline"
                            className="w-full justify-between"
                            onClick={() =>
                              openGoogleMaps(
                                event.lat,
                                event.lng,
                                event.place
                              )
                            }
                          >
                            <span className="flex items-center gap-2">
                              <ExternalLink className="w-4 h-4" />
                              View on Google Maps
                            </span>
                          </Button>

                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() =>
                              (window.location.href = `tel:${event.phone}`)
                            }
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Call Organizer
                          </Button>

                          {event.lat && event.lng && (
                            <NearbyPlacesButton
                              locationName={event.place}
                              latitude={event.lat}
                              longitude={event.lng}
                              variant="outline"
                              size="default"
                            />
                          )}
                        </div>
                      </div>

                      <DialogFooter className="mt-6">
                        <Button 
                          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold font-poppins shadow-xl h-12 disabled:opacity-50 disabled:cursor-not-allowed" 
                          size="lg"
                          onClick={() => handlePurchase(event)}
                          disabled={isButtonDisabled(event)}
                        >
                          {getButtonText(event)}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
                </div>
              )}
            </>
          )}

          {/* My Tickets Tab */}
          {activeTab === "my-tickets" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myTickets.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20">
                  <Ticket className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg font-semibold">No tickets purchased yet</p>
                  <p className="text-gray-400 text-sm mt-2">Browse events and purchase tickets to see them here</p>
                  <Button
                    onClick={() => setActiveTab("all")}
                    className="mt-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    Browse Events
                  </Button>
                </div>
              )}

              {myTickets.length > 0 && myTickets.map(event => (
                <div
                  key={event.id}
                  className="border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-2xl transition-all bg-white/95 backdrop-blur-md shadow-lg"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={event.images?.[0]}
                      alt={event.title}
                      className="w-full h-52 object-cover"
                    />

                    {/* Purchased Badge */}
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg">
                      PURCHASED
                    </span>

                    {event.price === "Free" && (
                      <span className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg">
                        FREE
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <h2 className="text-base lg:text-lg font-bold text-gray-900 line-clamp-2 font-poppins">
                      {event.title}
                    </h2>

                    <div className="space-y-2 text-xs lg:text-sm text-gray-700">
                      <p className="flex items-center gap-2 font-medium font-poppins">
                        <Calendar className="w-4 h-4 text-amber-600" /> {event.date}
                      </p>
                      <p className="flex items-center gap-2 font-medium font-poppins">
                        <MapPin className="w-4 h-4 text-amber-600" /> {event.place}
                      </p>
                      <p className="flex items-center gap-2 font-bold text-gray-900 font-poppins">
                        <Tag className="w-4 h-4 text-amber-600" /> {event.price}
                      </p>
                      <p className="flex items-center gap-2 font-medium font-poppins">
                        <Ticket className="w-4 h-4 text-amber-600" /> Quantity: {(event as any).purchasedQuantity}
                      </p>
                    </div>

                    {/* Dialog */}
                    <Dialog open={selectedEvent?.id === event.id} onOpenChange={(open) => {
                      if (!open) setSelectedEvent(null);
                      else setSelectedEvent(event);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full mt-3 border-2 hover:bg-amber-50 hover:border-amber-300 font-semibold font-poppins shadow-md">
                          View Details
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white/95 backdrop-blur-md border-2 border-gray-200 shadow-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl lg:text-2xl font-bold pr-8 font-poppins text-gray-900">
                            {event.title}
                          </DialogTitle>
                          <DialogDescription className="sr-only">
                            Event details including images, description, location, and contact information
                          </DialogDescription>
                        </DialogHeader>

                        {/* Image Carousel */}
                        <Carousel className="w-full my-5">
                          <CarouselContent>
                            {event.images?.map((img, idx) => (
                              <CarouselItem key={idx}>
                                <img
                                  src={img}
                                  alt={event.title}
                                  className="w-full h-72 object-cover rounded-lg"
                                />
                              </CarouselItem>
                            ))}
                          </CarouselContent>

                          {event.images?.length > 1 && (
                            <>
                              <CarouselPrevious className="left-4" />
                              <CarouselNext className="right-4" />
                            </>
                          )}
                        </Carousel>

                        {/* Info */}
                        <div className="my-5">
                          <h3 className="font-semibold text-base lg:text-lg mb-2">
                            About this Event
                          </h3>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {event.description}
                          </p>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 bg-gray-50 rounded-lg p-5">
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm lg:text-base">Date</p>
                                <p className="text-xs lg:text-sm text-gray-600">
                                  {event.date}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm lg:text-base">Location</p>
                                <p className="text-xs lg:text-sm text-gray-600">
                                  {event.place}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm lg:text-base">Contact</p>
                                <p className="text-xs lg:text-sm text-black font-medium">
                                  {event.phone}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {event.organizer}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Ticket className="w-5 h-5 text-gray-500 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm lg:text-base">Your Tickets</p>
                                <p className="text-xs lg:text-sm text-gray-800 font-medium">
                                  {(event as any).purchasedQuantity} ticket(s)
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Button
                              variant="outline"
                              className="w-full justify-between"
                              onClick={() =>
                                openGoogleMaps(
                                  event.lat,
                                  event.lng,
                                  event.place
                                )
                              }
                            >
                              <span className="flex items-center gap-2">
                                <ExternalLink className="w-4 h-4" />
                                View on Google Maps
                              </span>
                            </Button>

                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() =>
                                (window.location.href = `tel:${event.phone}`)
                              }
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              Call Organizer
                            </Button>

                            {event.lat && event.lng && (
                              <NearbyPlacesButton
                                locationName={event.place}
                                latitude={event.lat}
                                longitude={event.lng}
                                variant="outline"
                                size="default"
                              />
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}
