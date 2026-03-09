import { Router } from "express";
import { verifyJWT } from "../MIDDLEWARES/auth.middlewares.js";
import { authorize } from "../MIDDLEWARES/authorize.middleware.js";

import {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
} from "../CONTROLLERS/categories.controller.js";

const router = Router();

// Route to create a new category

router.route("/categories").post(verifyJWT, authorize("admin"), createCategory);

// Route to get all categories
router.route("/").get(getCategories);

// Route to update a category

router.route("/:categoryId").put(verifyJWT, authorize("admin"), updateCategory);      

// Route to delete a category
router.route("/:categoryId").delete(verifyJWT, authorize("admin"), deleteCategory);



export default router;
