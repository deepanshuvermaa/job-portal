import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAJkQB9oT5bRAzLh3EktcqXSjgtQSGqYKk",
  authDomain: "local-job-portal-2369c.firebaseapp.com",
  projectId: "local-job-portal-2369c",
  storageBucket: "local-job-portal-2369c.firebasestorage.app",
  messagingSenderId: "802779299342",
  appId: "1:802779299342:web:9ffb98cc4af3bcd086465f",
  measurementId: "G-37QX25KN7P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
