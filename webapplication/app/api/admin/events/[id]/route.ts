import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { events } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { validateFiles } from '@/lib/file-validation';
import { uploadMultipleImages, deleteMultipleImages } from '@/lib/storage-utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const event = await db.select().from(events).where(eq(events.id, id)).limit(1);
    
    if (!event.length) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
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
    const existingImagesStr = formData.get('existingImages') as string;
    
    // Parse existing images JSON
    let existingImages: string[] = [];
    try {
      if (existingImagesStr) {
        existingImages = JSON.parse(existingImagesStr);
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid existing images format' },
        { status: 400 }
      );
    }
    
    // Extract new image files from FormData
    const newImageFiles: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('newImage') && value instanceof File) {
        newImageFiles.push(value);
      }
    }
    
    // Validate total images (existing + new) <= 3
    const totalImageCount = existingImages.length + newImageFiles.length;
    if (totalImageCount > 3) {
      return NextResponse.json(
        { error: `Total images exceed maximum of 3 (${existingImages.length} existing + ${newImageFiles.length} new)` },
        { status: 400 }
      );
    }
    
    // Validate new image files if any
    if (newImageFiles.length > 0) {
      const validation = validateFiles(newImageFiles, 3);
      if (!validation.isValid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }
    }
    
    // Fetch current event from database
    const currentEvent = await db.select().from(events).where(eq(events.id, id)).limit(1);
    if (!currentEvent.length) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    const currentImages = currentEvent[0].images || [];
    
    // Identify removed images (in DB but not in existingImages)
    const removedImages = currentImages.filter(url => !existingImages.includes(url));
    
    // Delete removed images from Firebase Storage
    if (removedImages.length > 0) {
      await deleteMultipleImages(removedImages);
    }
    
    // Upload new images
    let uploadResponse;
    if (newImageFiles.length > 0) {
      try {
        uploadResponse = await uploadMultipleImages(newImageFiles);
      } catch (error) {
        console.error('Failed to upload new images:', error);
        return NextResponse.json(
          { error: 'Failed to upload new images' },
          { status: 500 }
        );
      }
    }
    
    // Combine existing and new image URLs
    const finalImageUrls = uploadResponse 
      ? [...existingImages, ...uploadResponse.urls]
      : existingImages;
    
    // Update database
    try {
      const updated = await db.update(events)
        .set({
          title,
          images: finalImageUrls,
          date,
          price,
          place,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          phone,
          organizer,
          description,
          ticketCount: parseInt(ticketCount) || 0,
          updatedAt: new Date(),
        })
        .where(eq(events.id, id))
        .returning();

      if (!updated.length) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      return NextResponse.json(updated[0]);
    } catch (error) {
      // Rollback: delete newly uploaded images if database update fails
      if (uploadResponse && uploadResponse.urls.length > 0) {
        await deleteMultipleImages(uploadResponse.urls);
      }
      console.error('Database update failed:', error);
      return NextResponse.json(
        { error: 'Failed to update event' },
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Fetch event to get image URLs
    const event = await db.select().from(events).where(eq(events.id, id)).limit(1);
    
    if (!event.length) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    const imageUrls = event[0].images || [];
    
    // Delete images from Firebase Storage if they exist
    if (imageUrls.length > 0) {
      await deleteMultipleImages(imageUrls);
    }
    
    // Delete event from database
    const deleted = await db.delete(events).where(eq(events.id, id)).returning();

    if (!deleted.length) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}