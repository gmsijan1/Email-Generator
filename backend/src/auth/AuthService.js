/**
 * AuthService - Wraps Firebase Auth for easy future replacement
 * Controllers use this; no direct Firebase Auth imports elsewhere.
 * Uses firebase-admin for server-side operations.
 */

import admin from "firebase-admin";

let adminAuth = null;

function getAdminAuth() {
  if (!adminAuth) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
    adminAuth = admin.auth();
  }
  return adminAuth;
}

/**
 * Register with email/password (creates user in Firebase Auth)
 * @returns {{ uid: string, email: string, displayName: string }}
 */
export async function register(email, password, displayName = "") {
  const a = getAdminAuth();
  const userRecord = await a.createUser({
    email,
    password,
    displayName: displayName || email.split("@")[0],
  });
  return {
    uid: userRecord.uid,
    email: userRecord.email,
    displayName: userRecord.displayName || email.split("@")[0],
  };
}

/**
 * Verify Firebase ID token (from Authorization: Bearer <token>)
 * Client logs in via Firebase Auth, sends idToken to backend.
 * @param {string} idToken - Firebase ID token
 * @returns {{ uid: string, email?: string }}
 */
export async function verifyToken(idToken) {
  const a = getAdminAuth();
  const decoded = await a.verifyIdToken(idToken);
  return {
    uid: decoded.uid,
    email: decoded.email,
  };
}
