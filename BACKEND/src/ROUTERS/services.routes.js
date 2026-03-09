import { Router } from "express";
import { verifyJWT } from "../MIDDLEWARES/auth.middlewares.js";
import { upload } from "../MIDDLEWARES/multer.middleware.js";
import {
  createService,
  getAllServices,
  getServicesById,
  updateService,
  deleteService,
} from "../CONTROLLERS/services.controller.js";

const router = Router();

router.get("/", getAllServices);
router.get("/:serviceId", getServicesById);
router.post("/", verifyJWT, upload.single("images"), createService);
router.put("/:serviceId", verifyJWT, upload.single("images"), updateService);
router.delete("/:serviceId", verifyJWT, deleteService);

export default router;
