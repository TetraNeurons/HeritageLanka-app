import { FileValidationResult } from './types';

/**
 * File validation utilities for image uploads
 */

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

/**
 * Validate if file type is an allowed image format
 * @param mimeType - MIME type of the file
 * @returns true if valid, false otherwise
 */
export function isValidImageType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase());
}

/**
 * Validate if file size is within allowed limit
 * @param size - File size in bytes
 * @returns true if valid, false otherwise
 */
export function isValidFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

/**
 * Sanitize filename by removing special characters and spaces
 * @param filename - Original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and special characters, keep alphanumeric, dots, hyphens, underscores
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
}

/**
 * Generate unique filename with timestamp prefix
 * @param originalFilename - Original filename
 * @returns Unique filename with format: {timestamp}_{sanitizedFilename}
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const sanitized = sanitizeFilename(originalFilename);
  return `${timestamp}_${sanitized}`;
}

/**
 * Validate file for upload
 * @param file - File object to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validateFile(file: File): FileValidationResult {
  // Check file type
  if (!isValidImageType(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type: ${file.type}. Allowed types: jpeg, jpg, png, webp`
    };
  }

  // Check file size
  if (!isValidFileSize(file.size)) {
    return {
      isValid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum limit of 5MB`
    };
  }

  return { isValid: true };
}

/**
 * Validate multiple files for upload
 * @param files - Array of files to validate
 * @param maxCount - Maximum number of files allowed
 * @returns Object with isValid flag and error message if invalid
 */
export function validateFiles(
  files: File[],
  maxCount: number = 3
): FileValidationResult {
  // Check file count
  if (files.length === 0) {
    return {
      isValid: false,
      error: 'No files provided'
    };
  }

  if (files.length > maxCount) {
    return {
      isValid: false,
      error: `Maximum ${maxCount} files allowed, received ${files.length}`
    };
  }

  // Validate each file
  for (let i = 0; i < files.length; i++) {
    const validation = validateFile(files[i]);
    if (!validation.isValid) {
      return {
        isValid: false,
        error: `File ${i + 1} (${files[i].name}): ${validation.error}`
      };
    }
  }

  return { isValid: true };
}
