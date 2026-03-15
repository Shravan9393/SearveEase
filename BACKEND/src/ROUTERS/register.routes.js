import { Router } from "express";

import {
  registerCustomer,
  registerProvider,
} from "../CONTROLLERS/register.controller.js";
import { upload } from "../MIDDLEWARES/multer.middleware.js";

const router = Router();

// Route to handle the user registeration


// for the customer registeration

router.route("/customer").post(upload.single("profileImage"), registerCustomer);

// for the provider registeration
router.route("/provider").post(upload.single("profileImage"), registerProvider);

export default router;
