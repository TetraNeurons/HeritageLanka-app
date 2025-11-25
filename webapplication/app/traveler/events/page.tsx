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
import dynamic from "next/dynamic";

// Dynamically import map to avoid SSR issues
const EventsMap = dynamic(
  () => import("@/components/EventsMap").then((mod) => mod.EventsMap),
  { ssr: false, loading: () => <div className="h-full w-full bg-gray-100 rounded-lg animate-pulse" /> }
);


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
      <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <AppSidebar />

        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-poppins">Upcoming Events</h1>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-semibold font-poppins bg-white px-4 py-3 rounded-xl shadow-md border-2 border-gray-200">
                {events.length} events available
              </span>
              
              {/* View Mode Toggle */}
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
            </div>
          </div>

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
                </div>

                <div className="p-5 space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 line-clamp-2 font-poppins">
                    {event.title}
                  </h2>

                  <div className="space-y-2 text-sm text-gray-700">
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full mt-3 border-2 hover:bg-amber-50 hover:border-amber-300 font-semibold font-poppins shadow-md">
                        View Details
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white/95 backdrop-blur-md border-2 border-gray-200 shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold pr-8 font-poppins text-gray-900">
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
                        <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold font-poppins shadow-xl h-12" size="lg">
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
