// Authentication Context for managing user state across the application
import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContextInstance";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../firebase";

// Create the authentication context
// AuthProvider component to wrap the app and provide auth state
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Create a user profile in Firestore
   * @param {string} userId - The user's Firebase Auth UID
   * @param {Object} userData - User profile data
   */
  async function createUserProfile(userId, userData) {
    try {
      await setDoc(doc(db, "users", userId), {
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user profile from Firestore
   * @param {string} userId - The user's Firebase Auth UID
   * @returns {Promise<Object>} - User profile data
   */
  async function getUserProfile(userId) {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Register a new user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {string} displayName - User's display name (optional)
   */
  async function signup(email, password, displayName = "") {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Create user profile in Firestore
      await createUserProfile(userCredential.user.uid, {
        email: email,
        displayName: displayName || email.split("@")[0],
        authProvider: "email",
      });

      // Initialize credits for new user
      const { initializeCredits } = await import("../services/creditService");
      await initializeCredits(userCredential.user.uid, 50); // 50 free credits

      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  /**
   * Sign in with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   */
  async function login(email, password) {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  /**
   * Sign in with Google using popup (better for debugging)
   */
  async function loginWithGoogle() {
    try {
      setError(null);

      await setPersistence(auth, browserLocalPersistence);

      const { signInWithPopup } = await import("firebase/auth");
      const result = await signInWithPopup(auth, googleProvider);

      // Create profile if doesn't exist
      const profile = await getUserProfile(result.user.uid);
      if (!profile) {
        await createUserProfile(result.user.uid, {
          email: result.user.email,
          displayName:
            result.user.displayName || result.user.email.split("@")[0],
          authProvider: "google",
          photoURL: result.user.photoURL,
        });
        // Initialize credits for new user
        const { initializeCredits } = await import("../services/creditService");
        await initializeCredits(result.user.uid, 50); // 50 free credits
      }

      return result.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  /**
   * Sign out the current user
   */
  async function logout() {
    try {
      setError(null);
      await signOut(auth);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  // Subscribe to auth state changes and handle redirect result
  useEffect(() => {
    let isMounted = true;

    // Set persistence
    setPersistence(auth, browserLocalPersistence).catch(
      (persistenceError) => {},
    );

    // Handle redirect result first
    async function handleRedirectResult() {
      try {
        const result = await getRedirectResult(auth);

        if (!isMounted) {
          return;
        }

        if (result?.user) {
          const profile = await getUserProfile(result.user.uid);
          if (!profile) {
            await createUserProfile(result.user.uid, {
              email: result.user.email,
              displayName:
                result.user.displayName || result.user.email.split("@")[0],
              authProvider: "google",
              photoURL: result.user.photoURL,
            });
          }
        } else {
        }
      } catch (redirectError) {
        setError(redirectError.message);
      }
    }

    handleRedirectResult();

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (isMounted) {
        setCurrentUser(user);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Context value that will be provided to consuming components
  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    error,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
