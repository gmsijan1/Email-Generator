/**
 * Firestore implementation of User DAL
 * All Firebase/Firestore usage is contained here.
 */

import { doc, getDoc, getDocFromServer, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase.js";

const USERS_COLLECTION = "users";

/**
 * @implements {UserDAL}
 */
export const firestoreUserAdapter = {
  async getById(userId) {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDocFromServer(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() };
  },

  async create(userId, data) {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const payload = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload);
  },

  async update(userId, data) {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const payload = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload, { merge: true });
  },

  async exists(userId) {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  },
};
