import admin from 'firebase-admin';
import { config } from '../config/env';

// Initialize Firebase Admin
let firebaseApp: admin.app.App;

export const initializeFirebase = () => {
  try {
    if (!firebaseApp) {
      // Check if Firebase is configured
      if (config.FIREBASE_SERVICE_ACCOUNT === 'not-configured' || config.FIREBASE_SERVICE_ACCOUNT === '{}') {
        console.log('⚠️ Firebase not configured. Skipping initialization.');
        return null;
      }

      console.log('🔥 Attempting to initialize Firebase...');
      console.log('📝 FIREBASE_PROJECT_ID:', config.FIREBASE_PROJECT_ID);
      console.log('📝 Service account length:', config.FIREBASE_SERVICE_ACCOUNT.length);
      console.log('📝 First 100 chars:', config.FIREBASE_SERVICE_ACCOUNT.substring(0, 100));

      // Parse the service account from environment variable
      let serviceAccount;
      try {
        serviceAccount = JSON.parse(config.FIREBASE_SERVICE_ACCOUNT);
      } catch (parseError) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', parseError);
        console.log('Raw value:', config.FIREBASE_SERVICE_ACCOUNT);
        throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT JSON format');
      }

      console.log('✅ Service account parsed successfully');
      console.log('📝 Parsed project_id:', serviceAccount.project_id);
      console.log('📝 Parsed client_email:', serviceAccount.client_email);

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
