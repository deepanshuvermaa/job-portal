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
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
      'size': 'invisible',
      'callback': () => {
        console.log('reCAPTCHA verified');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      }
    });
  }
  return recaptchaVerifier;
};

// Send OTP via Firebase
export const sendFirebaseOTP = async (phoneNumber: string): Promise<void> => {
  try {
    // Ensure phone number has country code
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    
    // Initialize reCAPTCHA if not already done
    if (!recaptchaVerifier) {
      initializeRecaptcha('recaptcha-container');
    }

    // Send OTP
    confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier!);
    console.log('OTP sent successfully');
  } catch (error: any) {
    console.error('Error sending OTP:', error);
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

// Clean up
export const cleanupRecaptcha = () => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
  confirmationResult = null;
};
