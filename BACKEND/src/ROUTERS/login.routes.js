import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  googleAuth,
} from "../CONTROLLERS/login.controller.js";
import { verifyJWT } from "../MIDDLEWARES/auth.middlewares.js";

const router = Router();

router.route("/login").post(loginUser);
router.route("/google").post(googleAuth);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
