import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/jwt';
import axios from 'axios';
import { rateLimiter } from '@/lib/rate-limiter';
import { db } from '@/db/drizzle';
import { apiUsageLogs } from '@/db/schema';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let logData: any = {
    userId: '',
    query: '',
    category: '',
    locationName: '',
    resultCount: 0,
    creditsUsed: 0,
    success: false,
    errorMessage: null,
    responseTime: 0,
  };

  try {
    // Implement authentication middleware check
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logData.userId = session.userId;

    // Check rate limit
    const rateLimitResult = rateLimiter.check(session.userId);
    if (!rateLimitResult.allowed) {
      const resetDate = new Date(rateLimitResult.resetTime);
      return NextResponse.json(
        {
          success: false,
          error: `Rate limit exceeded. Try again after ${resetDate.toLocaleTimeString()}`,
          retryable: true,
          resetTime: rateLimitResult.resetTime,
        },
        { status: 429 }
      );
    }

    // Validate request body
    const body = await request.json();
    const { query, location } = body;

    logData.query = query;
    logData.locationName = location?.name || 'Unknown';

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Validate location coordinates if provided
    if (location) {
      const { lat, lng } = location;
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
    const serperApiKey = process.env.SERPER_API_KEY;
    if (!serperApiKey) {
      console.error('SERPER_API_KEY not configured');
      return NextResponse.json(
        { success: false, error: 'Service configuration error' },
        { status: 500 }
      );
    }

    // Extract category from query
    if (query.includes('hotel')) logData.category = 'hotels';
    else if (query.includes('restaurant')) logData.category = 'food';
    else if (query.includes('entertainment') || query.includes('film')) logData.category = 'entertainment';
    else if (query.includes('hospital')) logData.category = 'hospitals';
    else logData.category = 'other';

    // Log request for monitoring
    console.log('Serper API request:', {
      timestamp: new Date().toISOString(),
      query,
      userId: session.userId,
    });

    // Make request to Serper API
    const serperResponse = await axios.post(
      'https://google.serper.dev/places',
      { q: query },
      {
        headers: {
          'X-API-KEY': serperApiKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    // Extract places from response
    const places = serperResponse.data.places || [];
    const credits = serperResponse.data.credits || 0;

    // Update log data
    logData.resultCount = places.length;
    logData.creditsUsed = credits;
    logData.success = true;
    logData.responseTime = Date.now() - startTime;

    // Log response for monitoring
    console.log('Serper API response:', {
      timestamp: new Date().toISOString(),
      resultCount: places.length,
      creditsUsed: credits,
      userId: session.userId,
    });

    // Save to database
    try {
      await db.insert(apiUsageLogs).values({
        userId: logData.userId,
        query: logData.query,
        category: logData.category,
        locationName: logData.locationName,
        resultCount: logData.resultCount,
        creditsUsed: logData.creditsUsed,
        success: logData.success,
        errorMessage: logData.errorMessage,
        responseTime: logData.responseTime,
      });
    } catch (dbError) {
      console.error('Failed to log API usage:', dbError);
      // Don't fail the request if logging fails
    }

    // Limit results to 3 places
    const limitedPlaces = places.slice(0, 3);

    // Transform Serper response to match PlaceResult interface
    const transformedPlaces = limitedPlaces.map((place: any, index: number) => ({
      id: place.cid || `place-${index}`,
      position: place.position || index + 1,
      title: place.title || '',
      address: place.address || '',
      latitude: place.latitude || 0,
      longitude: place.longitude || 0,
      rating: place.rating,
      ratingCount: place.ratingCount,
      category: place.category || place.type || '',
      phoneNumber: place.phoneNumber,
      website: place.website,
      priceLevel: place.priceLevel,
    }));

    return NextResponse.json(
      {
        success: true,
        places: transformedPlaces,
        credits,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Nearby places API error:', error);

    // Update log data for error
    logData.success = false;
    logData.responseTime = Date.now() - startTime;
    logData.errorMessage = error.message || 'Unknown error';

    // Save error to database
    if (logData.userId) {
      try {
        await db.insert(apiUsageLogs).values({
          userId: logData.userId,
          query: logData.query || 'N/A',
          category: logData.category || 'unknown',
          locationName: logData.locationName || 'Unknown',
          resultCount: 0,
          creditsUsed: 0,
          success: false,
          errorMessage: logData.errorMessage,
          responseTime: logData.responseTime,
        });
      } catch (dbError) {
        console.error('Failed to log API error:', dbError);
      }
    }

    // Handle specific Serper API errors
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      if (status === 401) {
        return NextResponse.json(
          { success: false, error: 'API authentication failed', retryable: false },
          { status: 500 }
        );
      }

      if (status === 429) {
        return NextResponse.json(
          {
            success: false,
            error: 'Search limit reached. Please try again later.',
            retryable: true,
          },
          { status: 429 }
        );
      }

      if (status === 503) {
        return NextResponse.json(
          {
            success: false,
            error: 'Search service temporarily unavailable. Please try again.',
            retryable: true,
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Unable to fetch nearby places. Please try again.',
          retryable: true,
        },
        { status: 500 }
      );
    }

    // Handle network errors
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return NextResponse.json(
        {
          success: false,
          error: 'Request timeout. Please check your connection and try again.',
          retryable: true,
        },
        { status: 504 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
        retryable: true,
      },
      { status: 500 }
    );
  }
}
