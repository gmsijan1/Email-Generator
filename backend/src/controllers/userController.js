/**
 * User controller - uses DAL only (no Firebase imports)
 */

import { getUserById, updateUser } from "../db/index.js";

/**
 * GET /users/:id
 * Returns user profile. Requires auth (req.user.uid from middleware).
 */
export async function getUser(req, res) {
  try {
    const { id } = req.params;
    const requesterUid = req.user?.uid;

    if (requesterUid !== id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to get user" });
  }
}

/**
 * PATCH /users/:id
 * Body: { displayName?, companyName?, senderNameTitle?, ... }
 * Updates user profile. Requires auth.
 */
export async function updateUserProfile(req, res) {
  try {
    const { id } = req.params;
    const requesterUid = req.user?.uid;

    if (requesterUid !== id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const allowed = [
      "displayName",
      "companyName",
      "senderNameTitle",
      "productService",
      "keyDifferentiator",
      "socialProofClient",
      "socialProofResult",
      "line3Input",
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    await updateUser(id, updates);
    const user = await getUserById(id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update user" });
  }
}
