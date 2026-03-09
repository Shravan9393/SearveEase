import { Router } from "express";

import {
  registerCustomer,
  registerProvider,
} from "../CONTROLLERS/register.controller.js";


const router = Router();

// Route to handle the user registeration


// for the customer registeration

router.route("/customer").post(registerCustomer);

// for the provider registeration
router.route("/provider").post(registerProvider);

export default router;