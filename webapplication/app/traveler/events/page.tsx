"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/traveler/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

import {
  Dialog,
  DialogContent,
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


export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  useEffect(() => {
    fetchEvents();
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

  const openGoogleMaps = (lat: number, lng: number, place: string) => {
    const query = encodeURIComponent(place);
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place=${query}`;
    window.open(url, "_blank", "noopener,noreferrer");
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
      <div className="flex h-screen w-full bg-white">
        <AppSidebar />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-4">Upcoming Events</h1>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {events.length} events available
              </span>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="gap-2"
                >
                  <LayoutGrid className="w-4 h-4" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("map")}
                  className="gap-2"
                >
                  <MapIcon className="w-4 h-4" />
                  Map
                </Button>
              </div>
            </div>
          </div>

          {/* Map View */}
          {viewMode === "map" && (
            <div className="w-full h-[calc(100vh-280px)] rounded-lg overflow-hidden border border-gray-200 relative">
              {/* Map Container */}
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <div className="text-center p-8">
                  <MapIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold mb-2">Events Map View</h3>
                  <p className="text-gray-600 mb-4">
                    Showing {events.length} event locations
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Click on any event below to view its location on Google Maps
                  </p>
                </div>
              </div>
              
              {/* Overlay with event list */}
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm max-h-[calc(100%-2rem)] overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">
                    {events.length} Events
                  </h3>
                </div>
                <div className="space-y-2">
                  {events.map((event, idx) => (
                    <button
                      key={event.id}
                      onClick={() => {
                        openGoogleMaps(event.lat, event.lng, event.place);
                      }}
                      className="w-full text-left p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-sm text-gray-500 mt-0.5 min-w-[24px]">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1">
                            {event.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {event.date}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.place}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
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
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all bg-white"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={event.images?.[0]}
                    alt={event.title}
                    className="w-full h-52 object-cover"
                  />

                  {event.price === "Free" && (
                    <span className="absolute top-3 left-3 bg-black text-white px-3 py-1 rounded text-xs font-semibold">
                      FREE
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <h2 className="text-xl font-bold text-black line-clamp-2">
                    {event.title}
                  </h2>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> {event.date}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> {event.place}
                    </p>
                    <p className="flex items-center gap-2 font-semibold text-black">
                      <Tag className="w-4 h-4" /> {event.price}
                    </p>
                    <p className="flex items-center gap-2">
                      <Ticket className="w-4 h-4" /> {event.ticketCount} tickets
                      available
                    </p>
                  </div>

                  {/* Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full mt-3">
                        View Details
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold pr-8">
                          {event.title}
                        </DialogTitle>
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
                        <h3 className="font-semibold text-lg mb-2">
                          About this Event
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {event.description}
                        </p>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 bg-gray-50 rounded-lg p-5">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium">Date</p>
                              <p className="text-sm text-gray-600">
                                {event.date}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium">Location</p>
                              <p className="text-sm text-gray-600">
                                {event.place}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium">Contact</p>
                              <p className="text-sm text-black font-medium">
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
                              <p className="font-medium">Availability</p>
                              <p className="text-sm text-gray-800 font-medium">
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
                        <Button className="w-full bg-black hover:bg-gray-800 text-white" size="lg">
                          {event.price.includes("Free")
                            ? "Register Interest"
                            : "Buy Tickets Now"}
                        </Button>
                      </DialogFooter>
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
