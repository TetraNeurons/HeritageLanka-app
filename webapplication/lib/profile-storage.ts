import { getStorageBucket } from './firebase-admin';
import { generateUniqueFilename } from './file-validation';
import { deleteImageFromStorage, extractFilenameFromUrl } from './storage-utils';

/**
 * Profile image storage utilities
 * Handles uploading, deleting, and managing profile images in Firebase Storage
 */

/**
 * Upload a profile image to Firebase Storage
 * @param file - File object to upload
 * @param userId - User ID to organize storage
 * @returns Public download URL of the uploaded file
 */
export async function uploadProfileImage(
  file: File,
  userId: string
): Promise<string> {
  try {
    const bucket = getStorageBucket();
    const uniqueFilename = generateUniqueFilename(file.name);
    const storagePath = `profile-images/${userId}/${uniqueFilename}`;
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create file reference
    const fileRef = bucket.bucket().file(storagePath);
    
    // Upload file
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        customMetadata: {
          userId: userId,
          uploadedAt: new Date().toISOString(),
        },
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
      `Failed to upload profile image: ${(error as Error).message}`
    );
  }
}

/**
 * Delete a profile image from Firebase Storage
 * @param imageUrl - Public URL of the image to delete
 */
export async function deleteProfileImage(imageUrl: string): Promise<void> {
  try {
    await deleteImageFromStorage(imageUrl);
  } catch (error) {
    // Log error but don't throw - we want to continue even if deletion fails
    console.error(`Failed to delete profile image: ${imageUrl}`, error);
  }
}

/**
 * Replace an existing profile image with a new one
 * Uploads the new image and deletes the old one
 * @param file - New file to upload
 * @param userId - User ID
 * @param oldImageUrl - URL of the old image to delete (optional)
 * @returns Public download URL of the new uploaded file
 */
export async function replaceProfileImage(
  file: File,
  userId: string,
  oldImageUrl?: string | null
): Promise<string> {
  // Upload new image first
  const newImageUrl = await uploadProfileImage(file, userId);
  
  // Delete old image if it exists
  if (oldImageUrl) {
    // Don't await - delete in background
    deleteProfileImage(oldImageUrl).catch(err => {
      console.error('Failed to delete old profile image:', err);
    });
  }
  
  return newImageUrl;
}

/**
 * Get all profile images for a user (for cleanup purposes)
 * @param userId - User ID
 * @returns Array of file paths in storage
 */
export async function getUserProfileImages(userId: string): Promise<string[]> {
  try {
    const bucket = getStorageBucket();
    const prefix = `profile-images/${userId}/`;
    
    const [files] = await bucket.bucket().getFiles({ prefix });
    
    return files.map(file => file.name);
  } catch (error) {
    console.error(`Failed to list profile images for user ${userId}:`, error);
    return [];
  }
}

/**
 * Delete all profile images for a user (for account deletion)
 * @param userId - User ID
 */
export async function deleteAllUserProfileImages(userId: string): Promise<void> {
  try {
    const filePaths = await getUserProfileImages(userId);
    const bucket = getStorageBucket();
    
    const deletePromises = filePaths.map(path => 
      bucket.bucket().file(path).delete().catch(err => {
        console.error(`Failed to delete ${path}:`, err);
      })
    );
    
    await Promise.allSettled(deletePromises);
  } catch (error) {
    console.error(`Failed to delete all profile images for user ${userId}:`, error);
  }
}
