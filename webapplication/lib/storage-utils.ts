import { getStorageBucket } from './firebase-admin';
import { generateUniqueFilename } from './file-validation';
import { FileUploadResponse, StorageFileMetadata } from './types';

/**
 * Upload an image file to Firebase Storage
 * @param file - File object to upload
 * @param filename - Filename to use in storage (should be unique)
 * @returns Public download URL of the uploaded file
 */
export async function uploadImageToStorage(
  file: File,
  filename: string
): Promise<string> {
  try {
    const bucket = getStorageBucket();
    const storagePath = `events/${filename}`;
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create file reference
    const fileRef = bucket.bucket().file(storagePath);
    
    // Upload file
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
      public: true, // Make file publicly accessible
    });
    
    // Make file public and get URL
    await fileRef.makePublic();
    
    // Return public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.bucket().name}/${storagePath}`;
    return publicUrl;
  } catch (error) {
    throw new Error(
      `Failed to upload file ${filename}: ${(error as Error).message}`
    );
  }
}

/**
 * Delete an image from Firebase Storage using its URL
 * @param url - Public URL of the image to delete
 */
export async function deleteImageFromStorage(url: string): Promise<void> {
  try {
    const filename = extractFilenameFromUrl(url);
    if (!filename) {
      throw new Error('Invalid URL: could not extract filename');
    }
    
    const bucket = getStorageBucket();
    const fileRef = bucket.bucket().file(filename);
    
    // Check if file exists before attempting to delete
    const [exists] = await fileRef.exists();
    if (exists) {
      await fileRef.delete();
    }
  } catch (error) {
    // Log error but don't throw - we want to continue even if deletion fails
    console.error(`Failed to delete file from storage: ${url}`, error);
  }
}

/**
 * Extract the storage path from a Firebase Storage URL
 * @param url - Public URL of the file
 * @returns Storage path (e.g., "events/123456_image.jpg") or null if invalid
 */
export function extractFilenameFromUrl(url: string): string | null {
  try {
    // Handle both formats:
    // https://storage.googleapis.com/bucket-name/events/filename.jpg
    // https://firebasestorage.googleapis.com/v0/b/bucket-name/o/events%2Ffilename.jpg?...
    
    if (url.includes('storage.googleapis.com')) {
      // Format: https://storage.googleapis.com/bucket-name/path/to/file.jpg
      const parts = url.split('/');
      const bucketIndex = parts.indexOf(parts.find(p => p.includes('.')) || '');
      if (bucketIndex >= 0 && parts.length > bucketIndex + 1) {
        return parts.slice(bucketIndex + 1).join('/');
      }
    } else if (url.includes('firebasestorage.googleapis.com')) {
      // Format: https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Fto%2Ffile.jpg
      const match = url.match(/\/o\/([^?]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting filename from URL:', error);
    return null;
  }
}

/**
 * Upload multiple images to Firebase Storage
 * @param files - Array of File objects to upload
 * @returns FileUploadResponse with array of public download URLs
 */
export async function uploadMultipleImages(files: File[]): Promise<FileUploadResponse> {
  const uploadPromises = files.map(file => {
    const uniqueFilename = generateUniqueFilename(file.name);
    return uploadImageToStorage(file, uniqueFilename);
  });
  
  try {
    const urls = await Promise.all(uploadPromises);
    return { urls };
  } catch (error) {
    throw new Error(`Failed to upload images: ${(error as Error).message}`);
  }
}

/**
 * Delete multiple images from Firebase Storage
 * @param urls - Array of public URLs to delete
 */
export async function deleteMultipleImages(urls: string[]): Promise<void> {
  const deletePromises = urls.map(url => deleteImageFromStorage(url));
  await Promise.allSettled(deletePromises); // Continue even if some deletions fail
}

/**
 * Get metadata for a file in Firebase Storage
 * @param url - Public URL of the file
 * @returns StorageFileMetadata object with file information
 */
export async function getFileMetadata(url: string): Promise<StorageFileMetadata | null> {
  try {
    const filename = extractFilenameFromUrl(url);
    if (!filename) {
      return null;
    }
    
    const bucket = getStorageBucket();
    const fileRef = bucket.bucket().file(filename);
    
    const [exists] = await fileRef.exists();
    if (!exists) {
      return null;
    }
    
    const [metadata] = await fileRef.getMetadata();
    
    return {
      name: metadata.name || '',
      bucket: metadata.bucket || '',
      contentType: metadata.contentType || 'unknown',
      size: metadata.size ? parseInt(String(metadata.size)) : 0,
      timeCreated: metadata.timeCreated,
      updated: metadata.updated,
    };
  } catch (error) {
    console.error(`Failed to get metadata for file: ${url}`, error);
    return null;
  }
}
