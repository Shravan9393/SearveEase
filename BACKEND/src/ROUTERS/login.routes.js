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

// protected route
// Route to handle user logout
router.route("/logout").post(verifyJWT , logoutUser);

// Route to handle refresh access token

router.route("/refresh-token").post(refreshAccessToken);

export default router;
