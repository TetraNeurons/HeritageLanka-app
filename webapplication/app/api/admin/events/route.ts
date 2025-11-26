import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { events } from '@/db/schema';
import { validateFiles } from '@/lib/file-validation';
import { uploadMultipleImages, deleteMultipleImages } from '@/lib/storage-utils';

export async function GET() {
  try {
    const allEvents = await db.select().from(events).orderBy(events.createdAt);
    return NextResponse.json(allEvents);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    
    // Extract form fields
    const title = formData.get('title') as string;
    const date = formData.get('date') as string;
    const price = formData.get('price') as string;
    const place = formData.get('place') as string;
    const lat = formData.get('lat') as string;
    const lng = formData.get('lng') as string;
    const phone = formData.get('phone') as string;
    const organizer = formData.get('organizer') as string;
    const description = formData.get('description') as string;
    const ticketCount = formData.get('ticketCount') as string;
    
    // Validate required fields
    if (!title || !date || !price || !place || !lat || !lng || !phone || !organizer || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Extract image files from FormData
    const imageFiles: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image') && value instanceof File) {
        imageFiles.push(value);
      }
    }
    
    // Validate at least 1 image is provided
    if (imageFiles.length === 0) {
      return NextResponse.json(
        { error: 'At least 1 image is required' },
        { status: 400 }
      );
    }
    
    // Validate files
    const validation = validateFiles(imageFiles, 3);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    // Upload images to Firebase Storage
    let uploadResponse;
    try {
      uploadResponse = await uploadMultipleImages(imageFiles);
    } catch (error) {
      console.error('Image upload failed:', error);
      return NextResponse.json(
        { error: 'Failed to upload images' },
        { status: 500 }
      );
    }
    
    // Insert event into database
    try {
      const newEvent = await db.insert(events).values({
        title,
        images: uploadResponse.urls,
        date,
        price,
        place,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        phone,
        organizer,
        description,
        ticketCount: parseInt(ticketCount) || 0,
      }).returning();

      return NextResponse.json(newEvent[0], { status: 201 });
    } catch (error) {
      // Clean up uploaded images if database insert fails
      await deleteMultipleImages(uploadResponse.urls);
      console.error('Database insert failed:', error);
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}