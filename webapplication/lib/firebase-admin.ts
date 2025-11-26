import * as admin from 'firebase-admin';

/**
 * Initialize Firebase Admin SDK with service account credentials from environment variables
 * Uses singleton pattern to ensure only one instance is created
 * @returns Firebase Admin App instance
 * @throws Error if required environment variables are missing or invalid
 */
export function initializeFirebaseAdmin(): admin.app.App {
  // Check if Firebase Admin is already initialized globally
  const existingApps = admin.apps;
  if (existingApps.length > 0) {
    return existingApps[0] as admin.app.App;
  }

  try {
    // Validate required environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

    if (!projectId || !clientEmail || !privateKey || !storageBucket) {
      throw new Error(
        'Missing required Firebase environment variables. Please ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, and FIREBASE_STORAGE_BUCKET are set in .env file.'
      );
    }

    // Initialize Firebase Admin SDK with environment variables
    const firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        // Replace escaped newlines with actual newlines
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
      storageBucket,
    });

    console.log('Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    throw new Error(
      `Failed to initialize Firebase Admin SDK: ${(error as Error).message}`
    );
  }
}

/**
 * Get Firebase Storage bucket instance
 * Initializes Firebase Admin if not already initialized
 * @returns Firebase Storage bucket instance
 */
export function getStorageBucket(): admin.storage.Storage {
  const app = initializeFirebaseAdmin();
  return app.storage();
}
