import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/jwt';
import axios from 'axios';

interface NearbyPlacesRequest {
  query: string;
  location?: {
    lat: number;
    lng: number;
  };
}

interface SerperPlace {
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
  cid: string;
}

interface SerperResponse {
  places: SerperPlace[];
  credits: number;
}

export async function POST(request: NextRequest) {
  try {
    // Implement authentication middleware check
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate request body
    const body: NearbyPlacesRequest = await request.json();
    
    if (!body.query || typeof body.query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Validate location coordinates if provided
    if (body.location) {
      const { lat, lng } = body.location;
      if (
        typeof lat !== 'number' ||
        typeof lng !== 'number' ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        return NextResponse.json(
          { success: false, error: 'Invalid location coordinates' },
          { status: 400 }
        );
      }
    }

    // Get Serper API key from environment
    const serpe