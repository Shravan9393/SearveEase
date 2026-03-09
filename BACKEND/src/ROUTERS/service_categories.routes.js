import { Router } from "express";

import {
    addServiceToCategory,
    getServicesByCategory,
    removeServiceFromCategory
}
    from "../CONTROLLERS/service_categories.controller.js";

const router = Router();


// Route to add a service to a category

router.route("/:serviceId/:categoryId").post(addServiceToCategory);

// Route to get services by category

router.route("/:categoryId/services").get(getServicesByCategory);

// Route to remove a service from a category

router.route("/:serviceId/:categoryId").delete(removeServiceFromCategory);
export default router;