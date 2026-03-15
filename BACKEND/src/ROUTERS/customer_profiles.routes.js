import { Router } from "express";

import {
    getCustomerProfile,
    updateCustomerProfile,
    deleteCustomerProfile
} from "../CONTROLLERS/customer_profiles.controller.js";

const router = Router();

// Route to get customer profile
router.route("/getCustomerProfile").get(getCustomerProfile);

// Route to update customer profile
router.route("/updateCustomerProfile").put(updateCustomerProfile);

// Route to delete customer profile
router.route("/deleteCustomerProfile").delete(deleteCustomerProfile);

export default router;