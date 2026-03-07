import { doc, getDocFromServer, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const PROFILE_FIELDS = [
  "companyName",
  "keyDifferentiator",
  "senderNameTitle",
  "productService",
  "socialProofClient",
  "socialProofResult",
  "line3Input",
];

/**
 * Get user profile data
 * @param {string} uid - User ID
 * @returns {Promise<Object>} - Profile fields or empty strings
 */
export async function getProfile(uid) {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDocFromServer(docRef);
    if (!docSnap.exists()) return defaultProfile();
    const data = docSnap.data();
    return {
      companyName: data.companyName ?? "",
      keyDifferentiator: data.keyDifferentiator ?? "",
      senderNameTitle: data.senderNameTitle ?? "",
      productService: data.productService ?? "",
      socialProofClient: data.socialProofClient ?? "",
      socialProofResult: data.socialProofResult ?? "",
      line3Input: data.line3Input ?? "",
    };
  } catch (error) {
    console.error("getProfile error:", error);
    return defaultProfile();
  }
}

/**
 * Update user profile data (merges with existing)
 * @param {string} uid - User ID
 * @param {Object} updates - { companyName?, keyDifferentiator?, senderNameTitle? }
 */
export async function updateProfile(uid, updates) {
  try {
    const docRef = doc(db, "users", uid);
    const toSet = { updatedAt: new Date().toISOString() };
    PROFILE_FIELDS.forEach((field) => {
      if (updates[field] !== undefined) toSet[field] = updates[field];
    });
    await setDoc(docRef, toSet, { merge: true });
  } catch (error) {
    console.error("updateProfile error:", error);
    throw error;
  }
}

function defaultProfile() {
  return {
    companyName: "",
    keyDifferentiator: "",
    senderNameTitle: "",
    productService: "",
    socialProofClient: "",
    socialProofResult: "",
    line3Input: "",
  };
}
