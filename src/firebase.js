// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKfFzFBtCAami0gwUDnyHF_FYV-1N82yQ",
  authDomain: "email-generator-1f634.firebaseapp.com",
  projectId: "email-generator-1f634",
  storageBucket: "email-generator-1f634.firebasestorage.app",
  messagingSenderId: "601443571394",
  appId: "1:601443571394:web:153f324829c4622e9fcd5b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
