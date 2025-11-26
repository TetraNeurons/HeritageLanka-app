"use client";

import { useEffect, useState } from "react";
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
  MapPin,
  Star,
  Phone,
  ExternalLink,
  Globe,
  Map,
  Filter,
  Search,
  LayoutGrid,
  MapIcon
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { NearbyPlacesButton } from "@/components/NearbyPlacesButton";
import dynamic from "next/dynamic";

// Dynamically import map to avoid SSR issues
const PlacesMap = dynamic(
  () => import("@/components/PlacesMap").then((mod) => mod.PlacesMap),
  { ssr: false, loading: () => <div className="h-full w-full bg-gray-100 rounded-lg animate-pulse" /> }
);

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Image {
  title: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  thumbnailUrl: string;
  source: string;
  domain: string;
  link: string;
}

interface Attraction {
  position: number;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  ratingCount: number;
  category: string;
  phoneNumber?: string;
  website?: string;
  cid: string;
  images: Image[];
}

interface District {
  district: string;
  attractions: Attraction[];
}

export default function PlacesPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("default");
  const [displayCount, setDisplayCount] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageCache] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [selectedPlace, setSelectedPlace] = useState<(Attraction & { district: string }) | null>(null);

  useEffect(() => {
    loadPlacesData();
  }, []);

  useEffect(() => {
    setDisplayCount(100);
  }, [selectedDistrict, searchQuery, sortBy]);

  const loadPlacesData = async () => {
    try {
      // Check if data exists in localStorage
      const cachedData = localStorage.getItem('sl_tourist_data');
      
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setDistricts(parsedData);
        setLoading(false);
        return;
      }

      // If not in localStorage, fetch from public folder
      const response = await fetch('/sl_tourist_data.json');
      
      if (!response.ok) {
        throw new Error('Failed to load tourist data');
      }

      const data = await response.json();
      
      // Store in localStorage for future use
      localStorage.setItem('sl_tourist_data', JSON.stringify(data));
      
      setDistricts(data);
    } catch (err) {
      console.error("Failed to load places:", err);
      setError("Failed to load tourist attractions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const openGoogleMaps = (lat: number, lng: number, place: string) => {
    const query = encodeURIComponent(place);
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place=${query}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const getOptimizedImageUrl = (imageUrl: string, thumbnailUrl?: string) => {
    // Use thumbnail if available
    if (thumbnailUrl) return thumbnailUrl;
    
    // Check cache
    if (imageCache[imageUrl]) {
      return imageCache[imageUrl];
    }
    
    // For Google images, add size parameter
    if (imageUrl.includes('googleusercontent.com')) {
      const optimized = imageUrl.split('=')[0] + '=w400-h300-c';
      imageCache[imageUrl] = optimized;
      return optimized;
    }
    
    return imageUrl;
  };

  const allAttractions = selectedDistrict === "all"
    ? districts.flatMap(d => d.attractions.map(a => ({ ...a, district: d.district })))
    : districts
        .find(d => d.district === selectedDistrict)
        ?.attractions.map(a => ({ ...a, district: selectedDistrict })) || [];

  // Apply search filter
  const filteredAttractions = allAttractions.filter(place => {
    const query = searchQuery.toLowerCase();
    const title = (place.title || "").toLowerCase();
    const address = (place.address || "").toLowerCase();
    const district = (place.district || "").toLowerCase();
    
    return title.includes(query) || address.includes(query) || district.includes(query);
  });

  // Apply sorting
  const sortedAttractions = [...filteredAttractions].sort((a, b) => {
    if (sortBy === "rating-high") {
      return b.rating - a.rating;
    } else if (sortBy === "rating-low") {
      return a.rating - b.rating;
    } else if (sortBy === "top-rated") {
      // Show 4.5+ rated first, then sort by rating
      if (a.rating >= 4.5 && b.rating < 4.5) return -1;
      if (a.rating < 4.5 && b.rating >= 4.5) return 1;
      return b.rating - a.rating;
    }
    return 0; // default order
  });

  // Limit display count
  const displayedAttractions = sortedAttractions.slice(0, displayCount);

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Loading tourist attractions...</p>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={loadPlacesData}>Retry</Button>
            </div>
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
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Tourist Attractions in Sri Lanka
            </h1>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md min-w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search attractions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-2 focus:border-amber-500 font-poppins shadow-md"
                />
              </div>
              
              {/* District Filter */}
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-amber-600" />
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger className="w-52 h-12 border-2 focus:border-amber-500 font-poppins font-semibold shadow-md">
                    <SelectValue placeholder="Filter by district" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    {districts.map(d => (
                      <SelectItem key={d.district} value={d.district}>
                        {d.district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-amber-600" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-52 h-12 border-2 focus:border-amber-500 font-poppins font-semibold shadow-md">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Order</SelectItem>
                    <SelectItem value="top-rated">Top Rated First</SelectItem>
                    <SelectItem value="rating-high">Rating: High to Low</SelectItem>
                    <SelectItem value="rating-low">Rating: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
              
              <span className="text-sm text-gray-700 font-semibold font-poppins bg-white px-4 py-3 rounded-xl shadow-md border-2 border-gray-200">
                {filteredAttractions.length} places found
              </span>
            </div>
          </div>

          {/* Map View */}
          {viewMode === "map" && (
            <div className="w-full h-[calc(100vh-280px)]">
              <PlacesMap places={displayedAttractions} />
            </div>
          )}

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5 gap-4 justify-items-center">
            {displayedAttractions.length === 0 && (
              <div className="col-span-full flex items-center justify-center py-20">
                <p className="text-gray-500 text-lg">No attractions found</p>
              </div>
            )}

            {displayedAttractions.map(place => (
              <div
                key={place.cid}
                className="border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-2xl transition-all bg-white/95 backdrop-blur-md w-full max-w-[280px] shadow-lg"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={getOptimizedImageUrl(
                      place.images?.[0]?.imageUrl || "/placeholder-image.jpg",
                      place.images?.[0]?.thumbnailUrl
                    )}
                    alt={place.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />

                  {place.rating >= 4.5 && (
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
                      <Star className="w-4 h-4 fill-white" />
                      TOP RATED
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <h2 className="text-base lg:text-lg font-bold text-gray-900 line-clamp-2 font-poppins">
                    {place.title}
                  </h2>

                  <div className="space-y-2 text-xs lg:text-sm text-gray-700">
                    <p className="flex items-center gap-2 font-medium">
                      <Map className="w-4 h-4 text-amber-600" /> 
                      <span className="font-poppins">{place.district}</span>
                    </p>
                    <p className="flex items-center gap-2 font-medium">
                      <MapPin className="w-4 h-4 text-amber-600" /> 
                      <span className="line-clamp-1 font-poppins">{place.address}</span>
                    </p>
                    <p className="flex items-center gap-2 font-bold text-gray-900">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      <span className="text-sm lg:text-base font-poppins">{place.rating}</span>
                    </p>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full mt-3 border-2 hover:bg-amber-50 hover:border-amber-300 font-semibold font-poppins shadow-md" size="sm">
                        View Details
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white/95 backdrop-blur-md border-2 border-gray-200 shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl lg:text-2xl font-bold pr-8 font-poppins text-gray-900">
                          {place.title}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                          Place details including images, description, location, and contact information
                        </DialogDescription>
                      </DialogHeader>

                      {/* Image Carousel */}
                      <Carousel className="w-full my-5">
                        <CarouselContent>
                          {place.images?.map((img, idx) => (
                            <CarouselItem key={idx}>
                              <img
                                src={img.imageUrl}
                                alt={img.title}
                                className="w-full h-72 object-cover rounded-lg"
                              />
                            </CarouselItem>
                          ))}
                        </CarouselContent>

                        {place.images?.length > 1 && (
                          <>
                            <CarouselPrevious className="left-4" />
                            <CarouselNext className="right-4" />
                          </>
                        )}
                      </Carousel>

                      {/* Info */}
                      <div className="my-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold text-base lg:text-lg">{place.rating}</span>
                          </div>
                          <span className="text-sm text-gray-600">
                            ({place.ratingCount} reviews)
                          </span>
                          <span className="px-3 py-1 bg-gray-100 rounded text-xs lg:text-sm">
                            {place.category}
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 bg-gray-50 rounded-lg p-5">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm lg:text-base">Address</p>
                              <p className="text-xs lg:text-sm text-gray-600">
                                {place.address}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Map className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm lg:text-base">District</p>
                              <p className="text-xs lg:text-sm text-gray-600">
                                {place.district}
                              </p>
                            </div>
                          </div>

                          {place.phoneNumber && (
                            <div className="flex items-start gap-3">
                              <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm lg:text-base">Contact</p>
                                <p className="text-xs lg:text-sm text-black font-medium">
                                  {place.phoneNumber}
                                </p>
                              </div>
                            </div>
                          )}

                          {place.website && (
                            <div className="flex items-start gap-3">
                              <Globe className="w-5 h-5 text-gray-500 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm lg:text-base">Website</p>
                                <a
                                  href={place.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs lg:text-sm text-blue-600 hover:underline break-all"
                                >
                                  Visit website
                                </a>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Button
                            variant="outline"
                            className="w-full justify-between"
                            onClick={() =>
                              openGoogleMaps(
                                place.latitude,
                                place.longitude,
                                place.title
                              )
                            }
                          >
                            <span className="flex items-center gap-2">
                              <ExternalLink className="w-4 h-4" />
                              View on Google Maps
                            </span>
                          </Button>

                          {place.phoneNumber && (
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() =>
                                (window.location.href = `tel:${place.phoneNumber}`)
                              }
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              Call
                            </Button>
                          )}

                          {place.website && (
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() =>
                                window.open(place.website, "_blank", "noopener,noreferrer")
                              }
                            >
                              <Globe className="w-4 h-4 mr-2" />
                              Visit Website
                            </Button>
                          )}

                          <NearbyPlacesButton
                            locationName={place.title}
                            latitude={place.latitude}
                            longitude={place.longitude}
                            variant="outline"
                            size="default"
                          />
                        </div>
                      </div>

                      <DialogFooter className="mt-6">
                        <Button
                          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold font-poppins shadow-xl h-12"
                          size="lg"
                          onClick={() =>
                            openGoogleMaps(
                              place.latitude,
                              place.longitude,
                              place.title
                            )
                          }
                        >
                          Get Directions
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
            </div>
          )}

          {/* Load More Button */}
          {displayCount < sortedAttractions.length && (
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setDisplayCount(prev => prev + 100)}
                className="min-w-[200px] border-2 border-amber-300 hover:bg-amber-50 font-bold font-poppins text-base shadow-lg"
              >
                Load More ({sortedAttractions.length - displayCount} remaining)
              </Button>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}