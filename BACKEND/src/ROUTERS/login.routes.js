import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  googleAuth,
  completeProviderProfile,
} from "../CONTROLLERS/login.controller.js";
import { verifyJWT } from "../MIDDLEWARES/auth.middlewares.js";

const router = Router();

router.route("/login").post(loginUser);
router.route("/google").post(googleAuth);
router.route("/logout").post(logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/provider-profile/complete").post(verifyJWT, completeProviderProfile);

export default router;
