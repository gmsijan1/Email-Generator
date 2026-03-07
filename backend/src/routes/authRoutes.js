/**
 * Auth routes
 */

import { Router } from "express";
import * as authController from "../controllers/authController.js";

const router = Router();

router.post("/register", authController.register);
router.post("/verify", authController.verify);

export default router;
