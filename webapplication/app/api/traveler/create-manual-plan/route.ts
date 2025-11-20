// app/api/travel/create-manual-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { trips, tripLocations, travelers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/jwt';

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
  try {
    const body = await request.json();
    const { 
      fromDate, 
      toDate, 
      numberOfPeople, 
      needsGuide,
      preferences,
      description,
      locations,
    } = body;

    const userId = session.userId;

    if (!fromDate || !toDate || !locations || locations.length === 0 || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
      }, { status: 400 });
    }

    // Get traveler
    const travelerResult = await db
      .select()
      .from(travelers)
      .where(eq(travelers.userId, userId))
      .limit(1);

    if (travelerResult.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Traveler not found',
      }, { status: 404 });
    }

    const traveler = travelerResult[0];

    // Calculate distances
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    let totalDistance = 0;
    for (let i = 0; i < locations.length - 1; i++) {
      const dist = calculateDistance(
        locations[i].lat,
        locations[i].lng,
        locations[i + 1].lat,
        locations[i + 1].lng
      );
      totalDistance += dist;
    }

    // Calculate trip duration
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const totalDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Feasibility check
    const avgDistancePerDay = totalDistance / totalDays;
    if (avgDistancePerDay > 200) {
      return NextResponse.json({
        success: false,
        error: `This route covers ${totalDistance.toFixed(0)}km, averaging ${avgDistancePerDay.toFixed(0)}km per day. Consider reducing locations or extending your trip duration for a more comfortable journey.`,
      }, { status: 400 });
    }

    // Use AI to organize the itinerary
    const aiOrganizedPlan = await organizeManualPlanWithAI({
      locations,
      fromDate,
      toDate,
      totalDays,
      preferences: preferences || [],
    });

    // Create trip
    const [newTrip] = await db
      .insert(trips)
      .values({
        travelerId: traveler.id,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        numberOfPeople,
        country: traveler.country,
        preferences: preferences || [],
        planDescription: description,
        planningMode: 'MANUAL',
        aiSummary: aiOrganizedPlan.summary,
        aiRecommendations: aiOrganizedPlan.recommendations || [],
        totalDistance: Math.round(totalDistance),
        needsGuide,
        dailyItinerary: aiOrganizedPlan.dailyItinerary,
        status: 'PLANNING',
        bookingStatus: 'PENDING',
      })
      .returning();

    // Insert trip locations with AI-organized day assignments
    const tripLocationData = aiOrganizedPlan.organizedLocations.map((loc: any) => ({
      tripId: newTrip.id,
      title: loc.title,
      address: loc.address || 'Manual location',
      district: loc.district || 'Custom',
      latitude: loc.latitude,
      longitude: loc.longitude,
      category: loc.category || 'Custom',
      rating: loc.rating,
      dayNumber: loc.dayNumber,
      visitOrder: loc.visitOrder,
      estimatedDuration: loc.estimatedDuration || '2-3 hours',
      reasonForSelection: 'Manually selected by traveler',
    }));

    await db.insert(tripLocations).values(tripLocationData);

    // Update traveler status
    if (needsGuide) {
      await db
        .update(travelers)
        .set({ tripInProgress: true })
        .where(eq(travelers.id, traveler.id));
    }

    return NextResponse.json({
      success: true,
      message: 'Manual travel plan created successfully',
      planId: newTrip.id,
      totalDistance: Math.round(totalDistance),
      averageDistancePerDay: Math.round(avgDistancePerDay),
      dailyItinerary: aiOrganizedPlan.dailyItinerary,
    });

  } catch (error) {
    console.error('Create manual plan error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create manual travel plan',
    }, { status: 500 });
  }
}

// Helper function to organize manual plan with AI
async function organizeManualPlanWithAI(params: any) {
  const { locations, fromDate, toDate, totalDays, preferences } = params;

  try {
    const GoogleGenAI = (await import('@google/genai')).GoogleGenAI;
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

    const prompt = `
You are a travel planning expert. A traveler has manually selected ${locations.length} places to visit in Sri Lanka over ${totalDays} days.

**Selected Places:**
${JSON.stringify(locations.map((loc: any) => ({
  name: loc.name,
  lat: loc.lat,
  lng: loc.lng,
  address: loc.address,
})), null, 2)}

**Trip Details:**
- Start Date: ${fromDate}
- End Date: ${toDate}
- Duration: ${totalDays} days
${preferences.length > 0 ? `- Preferences: ${preferences.join(', ')}` : ''}

**Your task:**
1. Organize these places into a logical daily itinerary
2. Consider geographical proximity to minimize travel time
3. Assign appropriate day numbers and visit order
4. Each day should have 2-3 locations maximum
5. Provide travel tips and time estimates
6. Ensure the route is efficient (minimal backtracking)

**Output format (JSON only, no markdown):**
{
  "summary": "Brief overview of the organized trip",
  "organizedLocations": [
    {
      "title": "location name",
      "latitude": number,
      "longitude": number,
      "address": "address if available",
      "district": "district or area",
      "category": "type of place",
      "rating": number or null,
      "dayNumber": number (1 to ${totalDays}),
      "visitOrder": number (order within the day),
      "estimatedDuration": "e.g., 2-3 hours"
    }
  ],
  "dailyItinerary": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "places": ["Place 1", "Place 2"],
      "estimatedDistance": "XX km",
      "notes": "Tips for this day"
    }
  ],
  "recommendations": [
    "Travel tip 1",
    "Best routes to take",
    "Time management suggestions"
  ]
}

Return ONLY the JSON object.
`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;
    
    if (!text) {
      throw new Error('AI did not return any text');
    }

    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const planData = JSON.parse(cleanText);

    return planData;

  } catch (error) {
    console.error('AI organization failed:', error);
    
    // Fallback: simple distribution
    const locationsPerDay = Math.ceil(locations.length / totalDays);
    const organizedLocations = locations.map((loc: any, idx: number) => ({
      title: loc.name,
      latitude: loc.lat,
      longitude: loc.lng,
      address: loc.address || 'Manual location',
      district: loc.district || 'Custom',
      category: loc.category || 'Custom',
      rating: loc.rating || null,
      dayNumber: Math.floor(idx / locationsPerDay) + 1,
      visitOrder: (idx % locationsPerDay) + 1,
      estimatedDuration: '2-3 hours',
    }));

    const dailyItinerary = [];
    for (let day = 0; day < totalDays; day++) {
      const startIdx = day * locationsPerDay;
      const endIdx = Math.min(startIdx + locationsPerDay, locations.length);
      const dayLocations = locations.slice(startIdx, endIdx);
      
      if (dayLocations.length > 0) {
        const dayDate = new Date(fromDate);
        dayDate.setDate(new Date(fromDate).getDate() + day);
        
        dailyItinerary.push({
          day: day + 1,
          date: dayDate.toISOString().split('T')[0],
          places: dayLocations.map((loc: any) => loc.name),
          estimatedDistance: 'Varies',
          notes: 'Visit these places in order',
        });
      }
    }

    return {
      summary: 'Your custom travel plan organized by day',
      organizedLocations,
      dailyItinerary,
      recommendations: [
        'Check traffic conditions before traveling',
        'Start early to make the most of your day',
        'Book accommodations in advance',
      ],
    };
  }
}