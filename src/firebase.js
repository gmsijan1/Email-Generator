// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Firebase configuration object
// Replace these values with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyCMCyiop09cCLTHRyWHfgWozEXlFHNRIv0",
  authDomain: "email-generator-d6ff0.firebaseapp.com",
  projectId: "email-generator-d6ff0",
  storageBucket: "email-generator-d6ff0.firebasestorage.app",
  messagingSenderId: "324347790092",
  appId: "1:324347790092:web:248b27f361242e0913ff29",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider for Google Sign-In
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Functions
export const functions = getFunctions(app, "us-central1");

// Connect to local emulator during development (optional)
// Uncomment the next line if running functions emulator locally
// if (window.location.hostname === "localhost") {
//   connectFunctionsEmulator(functions, "localhost", 5001);
// }

export default app;
