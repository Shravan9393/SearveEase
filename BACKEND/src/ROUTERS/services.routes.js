import { Router } from "express";
import { verifyJWT } from "../MIDDLEWARES/auth.middlewares.js";
import {
  createService,
  getAllServices,
  getServicesById,
  updateService,
  deleteService,
} from "../CONTROLLERS/services.controller.js";

const router = Router();

// ✅ PUBLIC ROUTES (NO AUTH)
router.get("/", getAllServices);
router.get("/:serviceId", getServicesById);

// ✅ PROTECTED ROUTES (PROVIDER ONLY)
router.post("/", verifyJWT, createService);
router.put("/:serviceId", verifyJWT, updateService);
router.delete("/:serviceId", verifyJWT, deleteService);

export default router;
