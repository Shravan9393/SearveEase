import { Router } from "express";
import { verifyJWT } from "../MIDDLEWARES/auth.middlewares.js";
import { authorize } from "../MIDDLEWARES/authorize.middleware.js";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getCategoryById,
} from "../CONTROLLERS/categories.controller.js";

const router = Router();

router.route("/").get(getCategories).post(verifyJWT, authorize("admin"), createCategory);
router.route("/:categoryId").get(getCategoryById).put(verifyJWT, authorize("admin"), updateCategory).delete(verifyJWT, authorize("admin"), deleteCategory);

export default router;
