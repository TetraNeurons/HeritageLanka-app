export type EventItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  place: string;
  price: string;
  phone: string;
  organizer: string;
  ticketCount: number;
  images: string[];
  lat: number;
  lng: number;
};

export interface TravelerData { country: string; }
export interface GuideData { rating: number; totalReviews: number; }
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'TRAVELER' | 'GUIDE' | 'ADMIN';
  gender?: string;
  travelerData?: TravelerData;
  guideData?: GuideData;
  createdAt: string;
}
export interface Stats {
  totalUsers: number;
  totalTravelers: number;
  totalGuides: number;
  totalAdmins: number;
}
// Event
 Ticketing Types
export interface EventPayment {
  id: string;
  eventId: string;
  travelerId: string;
  ticketQuantity: number;
  amount: number;
  status: 'PENDING' | 'PAID' | 'RELEASED' | 'CANCELLED';
  stripeSessionId?: string;
  paidAt?: string;
  createdAt: string;
}

// Guide Booking Types
export interface GuideDeclination {
  id: string;
  guideId: string;
  tripId: string;
  declinedAt: string;
}

export interface TripLocation {
  id: string;
  tripId: string;
  title: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  category: string;
  rating?: number;
  dayNumber: number;
  visitOrder: number;
  estimatedDuration?: string;
  reasonForSelection?: string;
  createdAt: string;
}

export interface AvailableTrip {
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

export interface GuideDashboardStats {
  totalCompleted: number;
  currentTrip: {
    id: string;
    traveler: {
      name: string;
      phone: string;
    };
    fromDate: string;
    toDate: string;
    numberOfPeople: number;
    country: string;
    totalDistance: number | null;
    locations: TripLocation[];
  } | null;
  upcomingTrips: number;
  rating: number;
  totalReviews: number;
}

// Payment Types (supporting both trip and event payments)
export type PaymentType = 'trip' | 'event';

export interface Payment {
  id: string;
  tripId?: string | null;
  eventId?: string | null;
  travelerId?: string;
  ticketQuantity?: number | null;
  amount: number;
  status: 'PENDING' | 'PAID' | 'RELEASED' | 'CANCELLED';
  stripeSessionId?: string;
  paidAt?: string | null;
  releasedAt?: string | null;
  createdAt: string;
}

export interface TripPaymentDetails extends Payment {
  type: 'trip';
  trip: {
    id: string;
    fromDate: string;
    toDate: string;
    country: string;
    status: string;
    numberOfPeople: number;
    totalDistance: number | null;
  };
  traveler: {
    id: string;
    name: string;
    email: string;
  };
}

export interface EventPaymentDetails extends Payment {
  type: 'event';
  event: {
    id: string;
    title: string;
    date: string;
    place: string;
  };
  traveler: {
    id: string;
    name: string;
    email: string;
  };
  ticketQuantity: number;
}

export type PaymentDetails = TripPaymentDetails | EventPaymentDetails;

// Nearby Places Types
export interface PlaceResult {
  id: string;
  position: number;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  ratingCount?: number;
  category: string;
  phoneNumber?: string;
  website?: string;
  priceLevel?: string;
}

export interface NearbyPlacesState {
  queryLocation: {
    name: string;
    lat: number;
    lng: number;
  };
  selectedCategory: 'hotels' | 'food' | 'entertainment' | 'hospitals' | null;
  results: PlaceResult[];
  loading: boolean;
  error: string | null;
  sortBy: 'default' | 'rating' | 'reviews';
}

export interface APILog {
  id: string;
  timestamp: Date;
  query: string;
  category: string;
  locationName: string;
  resultCount: number;
  creditsUsed: number;
  userId: string;
  success: boolean;
  errorMessage?: string;
}
