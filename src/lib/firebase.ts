
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// Your web app's Firebase configuration
// These variables are loaded from the .env.local file
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if all necessary Firebase config keys are provided
export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  // Initialize Firebase for SSR
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  // Initialize Firebase Authentication and get a reference to the service
  auth = getAuth(app);
  console.log("[FIREBASE] Firebase configured and initialized.");
} else {
  console.warn("[FIREBASE] Firebase configuration is missing. Authentication features will be disabled. The app will run in demo mode. Please set up NEXT_PUBLIC_FIREBASE_* variables in your .env.local file.");
}


export { app, auth };
