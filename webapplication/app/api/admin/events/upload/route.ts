import { NextRequest, NextResponse } from 'next/server';
import { validateFiles } from '@/lib/file-validation';
import { uploadMultipleImages, deleteMultipleImages } from '@/lib/storage-utils';
import { FileUploadRequest, FileUploadResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    
    // Extract files from FormData
    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files.push(value);
      }
    }
    
    // Create typed request
    const uploadRequest: FileUploadRequest = { files };
    
    // Validate files
    const validation = validateFiles(uploadRequest.files, 3);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    // Upload files to Firebase Storage
    let uploadResponse: FileUploadResponse | null = null;
    try {
      uploadResponse = await uploadMultipleImages(uploadRequest.files);
      
      return NextResponse.json(
        uploadResponse,
        { status: 200 }
      );
    } catch (error) {
      // Clean up any uploaded files on failure
      if (uploadResponse && uploadResponse.urls.length > 0) {
        await deleteMultipleImages(uploadResponse.urls);
      }
      
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload images. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Request processing error:', error);
    
    // Check if it's a Firebase unavailability issue
    if ((error as Error).message.includes('Firebase') || 
        (error as Error).message.includes('storage')) {
      return NextResponse.json(
        { error: 'Storage service unavailable. Please try again.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process upload request' },
      { status: 500 }
    );
  }
}
