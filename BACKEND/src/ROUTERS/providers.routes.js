import { Router } from "express";
import { verifyJWT } from "../MIDDLEWARES/auth.middlewares.js";
import { getProviderDashboard } from "../CONTROLLERS/provider_profiles.controllers.js";

const router = Router();

router.route("/dashboard").get(verifyJWT, getProviderDashboard);

export default router;
