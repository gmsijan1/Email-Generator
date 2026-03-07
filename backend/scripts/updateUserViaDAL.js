/**
 * Example: Update user in Firestore via DAL
 * Run: node scripts/updateUserViaDAL.js
 * Requires: USER_ID
 */

import "dotenv/config";
import { updateUser, getUserById } from "../src/db/index.js";

const userId = process.env.USER_ID || "example-user-id";

const updates = {
  companyName: process.env.UPDATE_COMPANY || "Updated Company",
  senderNameTitle: process.env.UPDATE_TITLE || "Updated Title",
};

async function main() {
  try {
    await updateUser(userId, updates);
    console.log("User updated:", userId);
    const user = await getUserById(userId);
    console.log("Result:", user);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

main();
