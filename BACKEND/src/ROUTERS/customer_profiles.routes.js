import { Router } from "express";
import { verifyJWT } from "../MIDDLEWARES/auth.middlewares.js";

import {
    getCustomerProfile,
    updateCustomerProfile,
    deleteCustomerProfile
} from "../CONTROLLERS/customer_profiles.controller.js";

const router = Router();

// Route to get customer profile
router.route("/getCustomerProfile").get(verifyJWT, getCustomerProfile);

// Route to update customer profile
router.route("/updateCustomerProfile").put(verifyJWT, updateCustomerProfile);

// Route to delete customer profile
router.route("/deleteCustomerProfile").delete(verifyJWT, deleteCustomerProfile);

export default router;
