import { Router } from 'express';
import {
    getProviderProfile,
    updateProviderProfile,
    deleteProviderProfile,
    getProviderDashboard
} from "../CONTROLLERS/provider_profiles.controllers.js";
import { verifyJWT } from "../MIDDLEWARES/auth.middlewares.js";

const router = Router();

router.route("/").get(verifyJWT, getProviderProfile);
router.route("/").patch(verifyJWT, updateProviderProfile);
router.route("/").delete(verifyJWT, deleteProviderProfile);
router.route("/dashboard").get(verifyJWT, getProviderDashboard);

export default router;
