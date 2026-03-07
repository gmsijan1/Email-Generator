/**
 * User routes - protected
 */

import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/:id", requireAuth, userController.getUser);
router.patch("/:id", requireAuth, userController.updateUserProfile);

export default router;
