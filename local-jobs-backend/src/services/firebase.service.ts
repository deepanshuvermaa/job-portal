import admin from 'firebase-admin';
import { config } from '../config/env';

// Initialize Firebase Admin
let firebaseApp: admin.app.App;

export const initializeFirebase = () => {
  try {
    if (!firebaseApp) {
      // Parse the service account from environment variable
      const serviceAccount = JSON.parse(config.FIREBASE_SERVICE_ACCOUNT);
      
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: config.FIREBASE_PROJECT_ID,
      });
      
      console.log('✅ Firebase Admin initialized successfully');
    }
    return firebaseApp;
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error;
  }
};

export const verifyFirebaseToken = async (idToken: string) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid Firebase token');
  }
};

export const getFirebaseAuth = () => {
  return admin.auth();
};
