import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { systemFeedback } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

// POST - Submit feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      name,
      email,
      phone,
      ageGroup,
      userType,
      satisfactionLevel,
      feeling,
      likedMost,
      improvements,
      hasMajorProblems,
      problemDescription,
      wouldRecommend,
    } = body;

    // Validate required fields
    if (!satisfactionLevel) {
      return NextResponse.json(
        { error: 'Satisfaction level is required' },
        { status: 400 }
      );
    }

    // Auto-approve positive feedback (Very Satisfied or Satisfied)
    const isPositive = ['VERY_SATISFIED', 'SATISFIED'].includes(satisfactionLevel);
    
    const [feedback] = await db.insert(systemFeedback).values({
      name: name || null,
      email: email || null,
      phone: phone || null,
      ageGroup: ageGroup || null,
      userType: userType || null,
      satisfactionLevel,
      feeling: feeling || null,
      likedMost: likedMost || null,
      improvements: improvements || null,
      hasMajorProblems: hasMajorProblems || false,
      problemDescription: problemDescription || null,
      wouldRecommend: wouldRecommend || null,
      isApproved: isPositive,
      isPublic: isPositive,
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback!',
      feedback,
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

// GET - Fetch approved public testimonials
export async function GET() {
  try {
    const testimonials = await db
      .select({
        id: systemFeedback.id,
        name: systemFeedback.name,
        satisfactionLevel: systemFeedback.satisfactionLevel,
        feeling: systemFeedback.feeling,
        likedMost: systemFeedback.likedMost,
        wouldRecommend: systemFeedback.wouldRecommend,
        createdAt: systemFeedback.createdAt,
      })
      .from(systemFeedback)
      .where(eq(systemFeedback.isPublic, true))
      .orderBy(desc(systemFeedback.createdAt))
      .limit(12);

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}
