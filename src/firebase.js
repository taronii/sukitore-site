// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDMyKXYPu-Z8JhzWOWS8j0AljIr8vJ9Q74",
  authDomain: "sukitore-production.firebaseapp.com",
  projectId: "sukitore-production",
  storageBucket: "sukitore-production.appspot.com",
  messagingSenderId: "958033832039",
  appId: "1:958033832039:web:e1b20497e2fe102a32ccc2",
  measurementId: "G-67JNK4YTK1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics should only run in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.error('Analytics initialization error:', error);
  }
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
