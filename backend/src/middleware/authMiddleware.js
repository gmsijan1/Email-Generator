/**
 * Auth middleware - verifies Firebase ID token, sets req.user
 */

import * as authService from "../auth/AuthService.js";

export async function requireAuth(req, res, next) {
  try {
    const token =
      req.body?.idToken ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null);

    if (!token) {
      return res.status(401).json({ error: "Authorization required" });
    }

    req.user = await authService.verifyToken(token);
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
