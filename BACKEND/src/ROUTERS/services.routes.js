// import { Router } from "express";
// import { verifyJWT } from "../MIDDLEWARES/auth.middlewares.js";
// import { upload } from "../MIDDLEWARES/multer.middleware.js";
// import {
//   createService,
//   getAllServices,
//   getServicesById,
//   updateService,
//   deleteService,
// } from "../CONTROLLERS/services.controller.js";

// const router = Router();

// router.get("/", getAllServices);
// router.get("/:serviceId", getServicesById);

// router.post("/", verifyJWT, upload.single("images"), createService);
// router.put("/:serviceId", verifyJWT, upload.single("images"), updateService);
// router.delete("/:serviceId", verifyJWT, deleteService);

// export default router;



import { Router } from "express";
import { verifyJWT } from "../MIDDLEWARES/auth.middlewares.js";
import { upload } from "../MIDDLEWARES/multer.middleware.js";
import {
  createService,
  getAllServices,
  getServicesById,
  getMyServices,        // ← was missing from imports
  updateService,
  deleteService,
} from "../CONTROLLERS/services.controller.js";

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// CRITICAL FIX: GET /me MUST be declared BEFORE GET /:serviceId
//
// Without this line, Express routes GET /services/me to getServicesById
// with serviceId = "me" (plain string).
// mongoose.Types.ObjectId.isValid("me") → false → 400 Bad Request
// ─────────────────────────────────────────────────────────────────────────────
router.get("/me", verifyJWT, getMyServices);   // ← THIS WAS THE MISSING LINE

router.get("/", getAllServices);
router.get("/:serviceId", getServicesById);

router.post("/", verifyJWT, upload.single("images"), createService);
router.put("/:serviceId", verifyJWT, upload.single("images"), updateService);
router.delete("/:serviceId", verifyJWT, deleteService);

export default router;