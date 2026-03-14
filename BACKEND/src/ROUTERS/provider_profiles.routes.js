
import { Router } from "express";
import { Router } from 'express';

import {
  getProviderProfile,
  updateProviderProfile,
  deleteProviderProfile,
} from "../CONTROLLERS/provider_profiles.controllers.js";
import { verifyJWT } from "../MIDDLEWARES/auth.middlewares.js";

const router = Router();


router.route("/").get(verifyJWT, getProviderProfile).patch(verifyJWT, updateProviderProfile).delete(verifyJWT, deleteProviderProfile);

router.route("/").get(verifyJWT, getProviderProfile);
router.route("/").patch(verifyJWT, updateProviderProfile);
router.route("/").delete(verifyJWT, deleteProviderProfile);


export default router;
