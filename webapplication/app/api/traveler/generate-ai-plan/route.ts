// app/api/travel/generate-ai-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getSession } from '@/lib/jwt';

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ''
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      fromDate,
      toDate,
      numberOfPeople,
      needsGuide,
      preferences,
      description,
      attractionsData
    } = body;

    // Validate required fields
    if (!fromDate || !toDate || !attractionsData) {
      return NextResponse.json(
        { success: false, error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Calculate days
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const totalDays =
      Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Filter only good attractions
    const filteredAttractions = attractionsData.filter(
      (attr: any) => attr.rating >= 4
    );

const prompt = `
You are a professional Sri Lanka travel planner. Generate a complete ${totalDays}-day itinerary based on the input.

**MOST IMPORTANT**: Always create a full itinerary for ALL ${totalDays} days, even if the trip is tight or ambitious.

Trip Details:
- Dates: ${fromDate} to ${toDate} (${totalDays} days)
- Travelers: ${numberOfPeople}
- Need guide: ${needsGuide ? 'Yes' : 'No'}
- Preferences: ${preferences.join(', ')}
${description ? `- Notes: ${description}` : ''}

Available attractions (only high-rated ones):
${JSON.stringify(filteredAttractions.slice(0, 100), null, 2)}

Rules:
- Pick max ${Math.min(totalDays * 2, 15)} attractions
- Group by proximity, avoid backtracking
- Max 2–3 main activities per day
- Realistic driving times in Sri Lanka (roads are slow)
- Max ~150 km travel per day
- Include time for meals, rest, traffic

**OUTPUT ONLY VALID JSON** in this exact structure (no markdown, no extra text):

{
  "summary": "2-3 sentence trip overview",
  "selectedAttractions": [
    {
      "id": "attr_123",
      "name": "Temple of the Sacred Tooth Relic",
      "location": "Kandy",
      "lat": 7.2936,
      "lng": 80.6413,
      "estimatedDuration": "2-3 hours"
    }
  ],
  "dailyItinerary": [
    {
      "day": 1,
      "date": "${fromDate}",
      "title": "Day 1: Kandy & Surroundings",
      "activities": [
        {
          "time": "09:00 AM",
          "activity": "Visit Temple of the Sacred Tooth Relic",
          "attractionId": "attr_123",
          "duration": "2-3 hours",
          "lat": 7.2936,
          "lng": 80.6413,
          "notes": "Dress modestly, no shoes inside"
        },
        {
          "time": "02:00 PM",
          "activity": "Explore Peradeniya Botanical Gardens",
          "attractionId": "attr_456",
          "duration": "2 hours",
          "lat": 7.2650,
          "lng": 80.5950,
          "notes": "Wear comfortable shoes"
        }
      ],
      "accommodation": "Kandy city or lakeside hotel",
      "meals": "Lunch at a local rice & curry place, dinner at hotel",
      "totalDistance": "25 km",
      "notes": "Light traffic expected"
    }
  ],
  "recommendations": [
    "Carry cash for temple donations",
    "Book train tickets from Kandy to Ella in advance",
    "Use sunscreen and stay hydrated"
  ],
  "feasibilityScore": 88,
  "feasibilityNotes": "Well-paced with reasonable driving distances"
}

**CRITICAL**:
- Every attraction in selectedAttractions and every activity MUST include accurate lat/lng coordinates (decimal degrees)
- Use real coordinates from the provided attractionsData when possible
- If coordinates are missing in input, use correct real-world coordinates for that place
- Never omit lat/lng fields
`;
    // Gemini request with retry logic
    let response;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        response = await genAI.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text;

        if (!text) {
          attempts++;
          continue;
        }

        // Parse JSON
        const cleanText = text
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

        const planData = JSON.parse(cleanText);

        // Validate structure
        if (!planData.dailyItinerary || !Array.isArray(planData.dailyItinerary)) {
          throw new Error('Invalid plan structure');
        }

        // Check if we have enough days
        if (planData.dailyItinerary.length < totalDays) {
          console.warn(`Plan only has ${planData.dailyItinerary.length} days, expected ${totalDays}`);
          // Still allow it if we have at least some days
          if (planData.dailyItinerary.length === 0) {
            throw new Error('No days in itinerary');
          }
        }

        // Set default feasibility score if not provided
        if (!planData.feasibilityScore) {
          planData.feasibilityScore = 75;
        }

        // Add metadata
        planData.totalDays = totalDays;
        planData.generatedAt = new Date().toISOString();

        return NextResponse.json({
          success: true,
          plan: planData
        });

      } catch (parseError) {
        console.error(`Attempt ${attempts + 1} failed:`, parseError);
        attempts++;

        if (attempts >= maxAttempts) {
          console.error('All attempts failed. Last response:', response?.text);
          return NextResponse.json(
            {
              success: false,
              error: 'Failed to generate a valid travel plan after multiple attempts. Please try again.',
              details: process.env.NODE_ENV === 'development' ? (parseError as any)?.message : undefined
            },
            { status: 500 }
          );
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }

    // Fallback (shouldn't reach here)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate travel plan'
      },
      { status: 500 }
    );

  } catch (error) {
    console.error('Generate plan error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate travel plan',
       details:
          process.env.NODE_ENV === 'development'
            ? (error as any)?.message
            : undefined
      },
      { status: 500 }
    );
  }
}