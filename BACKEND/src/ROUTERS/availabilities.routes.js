import { Router } from "express";

import {
    createAvailability,
    getAvailabilities,
    updateAvailability,
    deleteAvailability  
} from "../CONTROLLERS/availabilities.controller.js";

const router = Router();

// Route to create a new availability

router.route("/create").post(createAvailability);

// Route to get availabilities with optional filters

router.route("/getAvailabilities").get(getAvailabilities);

// Route to update an existing availability

router.route("/update/:availabilityId").put(updateAvailability);

// Route to delete an availability

router.route("/delete/:availabilityId").delete(deleteAvailability);

export default router;