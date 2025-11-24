'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppSidebar } from '@/components/traveler/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { NearbyPlacesState } from '@/lib/types';
import { Hotel, Utensils, Film, Hospital, Loader2, Search, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import axios from 'axios';
import { PlaceResultCard } from '@/components/PlaceResultCard';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

// Dynamically import map to avoid SSR issues
const NearbyPlacesMap = dynamic(
  () => import('@/components/NearbyPlacesMap').then((mod) => mod.NearbyPlacesMap),
  { ssr: false, loading: () => <div className="h-[500px] w-full bg-gray-100 rounded-lg animate-pulse" /> }
);

const CATEGORY_QUERIES = {
  hotels: (placeName: string) => `hotels near ${placeName}`,
  food: (placeName: string) => `restaurants near ${placeName}`,
  entertainment: (placeName: string) => `film halls or entertainment areas near ${placeName}`,
  hospitals: (placeName: string) => `hospitals near ${placeName}`,
};

function NearbyPlacesContent() {
  const searchParams = useSearchParams();
  
  const [state, setState] = useState<NearbyPlacesState>({
    queryLocation: {
      name: searchParams.get('name') || '',
      lat: parseFloat(searchParams.get('lat') || '0'),
      lng: parseFloat(searchParams.get('lng') || '0'),
    },
    selectedCategory: null,
    results: [],
    loading: false,
    error: null,
    sortBy: 'default',
  });

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [locationSearch, setLocationSearch] = useState(searchParams.get('name') || '');

  const handleSortChange = (sortBy: 'default' | 'rating' | 'reviews') => {
    setState(prev => ({ ...prev, sortBy }));
  };

  // Get sorted results
  const getSortedResults = () => {
    const results = [...state.results];
    
    if (state.sortBy === 'rating') {
      return results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (state.sortBy === 'reviews') {
      return results.sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0));
    }
    
    // Default: maintain Serper order
    return results;
  };

  const sortedResults = getSortedResults();

  const handleLocationChange = async () => {
    if (!locationSearch.trim()) return;

    try {
      // Use Nominatim to geocode the location
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch + ', Sri Lanka')}&limit=1&countrycodes=lk`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const result = data[0];
        const newLocation = {
          name: result.display_name.split(',')[0].trim() || locationSearch,
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
        };

        setState(prev => ({
          ...prev,
          queryLocation: newLocation,
          results: [], // Clear previous results
          selectedCategory: null,
        }));
      } else {
        toast.error('Location not found. Please try another search term.');
      }
    } catch (error) {
      console.error('Location search failed:', error);
      toast.error('Failed to search location. Please try again.');
    }
  };

  const generateDirectionsUrl = (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): string => {
    const baseUrl = 'https://www.google.com/maps/dir/';
    return `${baseUrl}${origin.lat},${origin.lng}/${destination.lat},${destination.lng}`;
  };

  const handleGetDirections = (place: any) => {
    const url = generateDirectionsUrl(
      { lat: state.queryLocation.lat, lng: state.queryLocation.lng },
      { lat: place.latitude, lng: place.longitude }
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleMapFocus = (placeId: string) => {
    setSelectedPlaceId(placeId);
    // Map centering will be implemented in task 13
  };

  const handleCategoryClick = async (category: 'hotels' | 'food' | 'entertainment' | 'hospitals') => {
    setState(prev => ({ ...prev, loading: true, error: null, selectedCategory: category }));

    try {
      const query = CATEGORY_QUERIES[category](state.queryLocation.name);
      
      const response = await axios.post('/api/traveler/nearby-places', {
        query,
        location: {
          lat: state.queryLocation.lat,
          lng: state.queryLocation.lng,
        },
      });

      if (response.data.success) {
        setState(prev => ({
          ...prev,
          results: response.data.places,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.data.error || 'Failed to fetch nearby places',
          loading: false,
        }));
      }
    } catch (error: any) {
      console.error('Error fetching nearby places:', error);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.response) {
        errorMessage = error.response.data?.error || errorMessage;
      } else if (error.request) {
        errorMessage = 'Network connection failed. Please check your internet.';
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-white">
        <AppSidebar />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-4">
              Nearby Places
            </h1>
            
            {/* Location Search */}
            <div className="flex gap-2 mb-4 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for a location..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLocationChange()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleLocationChange} variant="default">
                Update Location
              </Button>
            </div>

            <p className="text-gray-600">
              Discover amenities near{' '}
              <span className="font-semibold text-black">
                {state.queryLocation.name}
              </span>
            </p>
          </div>

          {/* Category Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Button
              variant={state.selectedCategory === 'hotels' ? 'default' : 'outline'}
              size="lg"
              onClick={() => handleCategoryClick('hotels')}
              disabled={state.loading}
              className="h-24 flex flex-col gap-2"
            >
              <Hotel className="w-8 h-8" />
              <span>Hotels</span>
            </Button>

            <Button
              variant={state.selectedCategory === 'food' ? 'default' : 'outline'}
              size="lg"
              onClick={() => handleCategoryClick('food')}
              disabled={state.loading}
              className="h-24 flex flex-col gap-2"
            >
              <Utensils className="w-8 h-8" />
              <span>Food</span>
            </Button>

            <Button
              variant={state.selectedCategory === 'entertainment' ? 'default' : 'outline'}
              size="lg"
              onClick={() => handleCategoryClick('entertainment')}
              disabled={state.loading}
              className="h-24 flex flex-col gap-2"
            >
              <Film className="w-8 h-8" />
              <span>Entertainment</span>
            </Button>

            <Button
              variant={state.selectedCategory === 'hospitals' ? 'default' : 'outline'}
              size="lg"
              onClick={() => handleCategoryClick('hospitals')}
              disabled={state.loading}
              className="h-24 flex flex-col gap-2"
            >
              <Hospital className="w-8 h-8" />
              <span>Hospitals</span>
            </Button>
          </div>

          {/* Loading State with Skeleton Cards */}
          {state.loading && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Searching...</h2>
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-6">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {state.error && !state.loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 mb-4">{state.error}</p>
              <Button
                variant="outline"
                onClick={() => state.selectedCategory && handleCategoryClick(state.selectedCategory)}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Results with Map */}
          {!state.loading && !state.error && state.results.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  Found {state.results.length} {state.results.length === 3 ? 'top' : ''} places
                </h2>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-600" />
                  <Select value={state.sortBy} onValueChange={(value: any) => handleSortChange(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Order</SelectItem>
                      <SelectItem value="rating">Highest Rating</SelectItem>
                      <SelectItem value="reviews">Most Reviewed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Map */}
              <div className="mb-6">
                <NearbyPlacesMap
                  origin={state.queryLocation}
                  places={state.results}
                  selectedPlaceId={selectedPlaceId}
                  onMarkerClick={handleMapFocus}
                />
              </div>

              {/* Results List */}
              <div className="grid gap-4">
                {sortedResults.slice(0, 3).map((place, index) => (
                  <PlaceResultCard
                    key={place.id}
                    place={place}
                    index={index}
                    onGetDirections={() => handleGetDirections(place)}
                    onMapFocus={() => handleMapFocus(place.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!state.loading && !state.error && state.results.length === 0 && !state.selectedCategory && (
            <div className="text-center py-20">
              <p className="text-gray-500">
                Select a category to discover nearby places
              </p>
            </div>
          )}

          {/* No Results */}
          {!state.loading && !state.error && state.results.length === 0 && state.selectedCategory && (
            <div className="text-center py-20">
              <p className="text-gray-500">
                No places found in this category. Try a different category.
              </p>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function NearbyPlacesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <NearbyPlacesContent />
    </Suspense>
  );
}
