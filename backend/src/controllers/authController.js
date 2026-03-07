/**
 * Auth controller - uses AuthService and DAL only (no Firebase imports)
 */

import * as authService from "../auth/AuthService.js";
import { createUser, userExists } from "../db/index.js";

/**
 * POST /auth/register
 * Body: { email, password, displayName? }
 */
export async function register(req, res) {
  try {
    const { email, password, displayName = "" } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }

    const authUser = await authService.register(email, password, displayName);

    if (!(await userExists(authUser.uid))) {
      await createUser(authUser.uid, {
        email: authUser.email,
        displayName: authUser.displayName,
        authProvider: "email",
      });
    }

    res.status(201).json({
      uid: authUser.uid,
      email: authUser.email,
      displayName: authUser.displayName,
    });
  } catch (err) {
    const code = err.code === "auth/email-already-in-use" ? 409 : 500;
    res.status(code).json({ error: err.message || "Registration failed" });
  }
}

/**
 * POST /auth/verify
 * Body: { idToken } or Header: Authorization: Bearer <idToken>
 * Verifies token and returns user info (client logs in via Firebase, sends token here)
 */
export async function verify(req, res) {
  try {
    const idToken =
      req.body?.idToken ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null);

    if (!idToken) {
      return res.status(401).json({ error: "idToken or Authorization header required" });
    }

    const decoded = await authService.verifyToken(idToken);
    res.json({ uid: decoded.uid, email: decoded.email });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
