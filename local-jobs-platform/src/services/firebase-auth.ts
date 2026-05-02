import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import type { ConfirmationResult } from 'firebase/auth';
import { auth } from '../config/firebase';

let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

// Initialize reCAPTCHA
export const initializeRecaptcha = (elementId: string) => {
  try {
    // Check if element exists
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id '${elementId}' not found`);
      return null;
    }

    // Clear existing verifier if it exists
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (e) {
        console.warn('Error clearing existing reCAPTCHA:', e);
      }
      recaptchaVerifier = null;
    }

    // Create new verifier
    recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
      'size': 'invisible',
      'callback': () => {
        console.log('reCAPTCHA verified');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      }
    });

    console.log('✅ reCAPTCHA initialized successfully');
    return recaptchaVerifier;
  } catch (error) {
    console.error('❌ Failed to initialize reCAPTCHA:', error);
    return null;
  }
};

// Send OTP via Firebase
export const sendFirebaseOTP = async (phoneNumber: string): Promise<void> => {
  try {
    // Ensure phone number has country code
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

    // Initialize reCAPTCHA if not already done
    if (!recaptchaVerifier) {
      console.log('🔄 Initializing reCAPTCHA before sending OTP...');
      const verifier = initializeRecaptcha('recaptcha-container');
      if (!verifier) {
        throw new Error('Failed to initialize reCAPTCHA. Please refresh the page.');
      }
    }

    console.log('📞 Sending OTP to:', formattedPhone);

    // Send OTP
    confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier!);
    console.log('✅ OTP sent successfully');
  } catch (error: any) {
    console.error('❌ Error sending OTP:', error);

    // If reCAPTCHA error, try to reinitialize
    if (error.code === 'auth/internal-error' || error.message.includes('reCAPTCHA')) {
      console.log('🔄 Attempting to reinitialize reCAPTCHA...');
      recaptchaVerifier = null;
      const verifier = initializeRecaptcha('recaptcha-container');
      if (verifier) {
        throw new Error('Please try again.');
      }
    }

    throw new Error(error.message || 'Failed to send OTP');
  }
};

// Verify OTP
export const verifyFirebaseOTP = async (otp: string): Promise<string> => {
  try {
    if (!confirmationResult) {
      throw new Error('No OTP request found. Please request OTP first.');
    }

    const result = await confirmationResult.confirm(otp);
    const idToken = await result.user.getIdToken();
    
    return idToken; // This token will be sent to backend
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    throw new Error(error.message || 'Invalid OTP');
  }
};

// Get a fresh Firebase ID token (for registration after OTP was verified earlier)
export const getFreshFirebaseToken = async (): Promise<string | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    // Force refresh to get a new token
    const token = await currentUser.getIdToken(true);
    return token;
  } catch (error) {
    console.error('Failed to get fresh Firebase token:', error);
    return null;
  }
};

// Clean up
export const cleanupRecaptcha = () => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
  confirmationResult = null;
};
