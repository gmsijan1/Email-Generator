/**
 * DAL entry point - wire adapters here
 */

import { setUserAdapter } from "./userRepository.js";
import { firestoreUserAdapter } from "./adapters/firestoreAdapter.js";

// Use Firestore for MVP; swap for postgresAdapter, mongoAdapter, etc. later
setUserAdapter(firestoreUserAdapter);

export {
  getUserById,
  createUser,
  updateUser,
  userExists,
} from "./userRepository.js";
