// app/api/travel/accept-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { trips, tripLocations, travelers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const {
      fromDate,
      toDate,
      numberOfPeople,
      needsGuide = false,
      preferences = [],
      description = '',
      planningMode = 'AI_GENERATED',
      aiPlan,
      locations: topLevelLocations, // <-- Accept locations from outside aiPlan
      userId: _discard,
    } = body;

    // === Critical Fix: Support both structures ===
    const selectedAttractions = aiPlan?.selectedAttractions;
    const dailyItinerary = aiPlan?.dailyItinerary;
    const locations = topLevelLocations || aiPlan?.locations; // ← This is the key fix

    if (
      !aiPlan ||
      !Array.isArray(selectedAttractions) ||
      !Array.isArray(locations) ||
      !Array.isArray(dailyItinerary)
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing AI plan data' },
        { status: 400 }
      );
    }

    // 1. Get traveler
    const [traveler] = await db
      .select()
      .from(travelers)
      .where(eq(travelers.userId, session.userId))
      .limit(1);

    if (!traveler) {
      return NextResponse.json(
        { success: false, error: 'Traveler profile not found' },
        { status: 404 }
      );
    }

    // 2. Calculate total distance
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    let totalDistance = 0;
    for (let i = 0; i < selectedAttractions.length - 1; i++) {
      totalDistance += calculateDistance(
        selectedAttractions[i].lat,
        selectedAttractions[i].lng,
        selectedAttractions[i + 1].lat,
        selectedAttractions[i + 1].lng
      );
    }

    // 3. Create trip
    const [newTrip] = await db
      .insert(trips)
      .values({
        travelerId: traveler.id,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        numberOfPeople,
        country: traveler.country,
        preferences,
        planDescription: description,
        planningMode,
        aiSummary: aiPlan.summary || '',
        aiRecommendations: aiPlan.recommendations || [],
        feasibilityScore: aiPlan.feasibilityScore || 80,
        totalDistance: Math.round(totalDistance),
        needsGuide,
        dailyItinerary,
        status: 'PLANNING',
        bookingStatus: 'PENDING',
      })
      .returning();

    // 4. Build lookup maps
    const attractionById = new Map<string, any>();
    const attractionByCoords = new Map<string, any>();
    selectedAttractions.forEach((attr: any) => {
      if (attr.id) attractionById.set(attr.id, attr);
      const key = `${Number(attr.lat).toFixed(6)},${Number(attr.lng).toFixed(6)}`;
      attractionByCoords.set(key, attr);
    });

    const locationByCoords = new Map<string, any>();
    locations.forEach((loc: any) => {
      const key = `${Number(loc.lat).toFixed(6)},${Number(loc.lng).toFixed(6)}`;
      locationByCoords.set(key, loc);
    });

    // 5. Insert trip locations from dailyItinerary
    const tripLocationInserts: any[] = [];

    dailyItinerary.forEach((day: any) => {
      const dayNumber = day.day;
      day.activities.forEach((act: any, idx: number) => {
        if (!act.attractionId) return;

        let attraction = attractionById.get(act.attractionId);
        if (!attraction && act.lat && act.lng) {
          const key = `${Number(act.lat).toFixed(6)},${Number(act.lng).toFixed(6)}`;
          attraction = attractionByCoords.get(key);
        }
        if (!attraction) return;

        const coordKey = `${Number(attraction.lat).toFixed(6)},${Number(attraction.lng).toFixed(6)}`;
        const locationEntry = locationByCoords.get(coordKey);

        tripLocationInserts.push({
          id: crypto.randomUUID(),
          tripId: newTrip.id,
          title: attraction.name,
          address: locationEntry?.address || attraction.location || attraction.name,
          district:
            locationEntry?.address?.includes(',')
              ? locationEntry.address.split(',').pop()?.trim() || 'Unknown'
              : locationEntry?.address || 'Western Province',
          latitude: Number(attraction.lat),
          longitude: Number(attraction.lng),
          category: 'ATTRACTION',
          rating: null,
          dayNumber,
          visitOrder: idx + 1,
          estimatedDuration: attraction.estimatedDuration || '2 hours',
          reasonForSelection: act.notes || null,
        });
      });
    });

    if (tripLocationInserts.length > 0) {
      await db.insert(tripLocations).values(tripLocationInserts);
    }

    // 6. Update traveler
    if (needsGuide) {
      await db.update(travelers).set({ tripInProgress: true }).where(eq(travelers.id, traveler.id));
    }

    // 7. Success
    return NextResponse.json(
      {
        success: true,
        message: 'Travel plan accepted successfully!',
        tripId: newTrip.id,
        totalDistance: Math.round(totalDistance),
        locationsInserted: tripLocationInserts.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Accept plan error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}