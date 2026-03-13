import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  googleAuth,
} from "../CONTROLLERS/login.controller.js";

const router = Router();

router.route("/login").post(loginUser);
router.route("/google").post(googleAuth);
router.route("/logout").post(logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
