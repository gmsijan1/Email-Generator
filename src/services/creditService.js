import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  runTransaction,
} from "firebase/firestore";

// Read current credit balance
export async function getCreditBalance(uid) {
  const docRef = doc(db, "users", uid, "credits", "balance");
  const docSnap = await getDoc(docRef);
  // If document does not exist, initialize with 50 credits
  if (!docSnap || !docSnap.exists()) {
    await setDoc(docRef, { credits: 50 });
    return "50";
  }
  // Safely read credits, fallback to 50 if missing/null/undefined
  const credits = (docSnap.data()?.credits ?? 50).toString();
  return credits;
}

// Deduct credits safely (transaction)
export async function deductCredits(
  uid,
  amount,
  actionType = "email_generation",
) {
  const creditDocRef = doc(db, "users", uid, "credits", "balance");
  const historyColRef = collection(db, "users", uid, "creditHistory");

  // Ensure the credits doc exists before transaction
  const docSnap = await getDoc(creditDocRef);
  if (!docSnap.exists()) {
    await setDoc(creditDocRef, { credits: 50 });
  }

  // Run transaction to update credits
  const newBalance = await runTransaction(db, async (transaction) => {
    const creditDoc = await transaction.get(creditDocRef);
    let current = creditDoc.exists() ? creditDoc.data().credits : 0;
    if (current < amount) throw new Error("Insufficient credits");

    transaction.update(creditDocRef, { credits: current - amount });
    return current - amount;
  });

  // Add credit history entry (outside transaction, with generated doc ID)
  await addDoc(historyColRef, {
    type: actionType,
    change: -amount,
    timestamp: new Date().toISOString(),
    balanceAfter: newBalance,
  });
  return newBalance;
}

// Log transaction (for admin or payment, not frontend)
export async function logCreditTransaction(uid, change, type = "manual") {
  const historyColRef = collection(db, "users", uid, "creditHistory");
  await addDoc(historyColRef, {
    type,
    change,
    timestamp: new Date().toISOString(),
  });
}

// Initialize credits for new user
export async function initializeCredits(uid, initialAmount = 10) {
  const creditDocRef = doc(db, "users", uid, "credits", "balance");
  await setDoc(creditDocRef, { credits: initialAmount });
}
