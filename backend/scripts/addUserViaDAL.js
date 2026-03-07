/**
 * Example: Add user to Firestore via DAL
 * Run: node scripts/addUserViaDAL.js
 * Requires: USER_ID, and optionally user data as env or edit below.
 */

import "dotenv/config";
import { createUser, getUserById } from "../src/db/index.js";

const userId = process.env.USER_ID || "example-user-id";

const userData = {
  email: process.env.USER_EMAIL || "example@example.com",
  displayName: process.env.USER_DISPLAY_NAME || "Example User",
  authProvider: "script",
  companyName: process.env.USER_COMPANY || "Acme Inc",
  senderNameTitle: process.env.USER_TITLE || "Sales Rep",
};

async function main() {
  try {
    await createUser(userId, userData);
    console.log("User created:", userId);
    const user = await getUserById(userId);
    console.log("Verified:", user);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

main();
