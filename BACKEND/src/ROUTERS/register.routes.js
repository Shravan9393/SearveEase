import { Router } from "express";
import {
  registerCustomer,
  registerProvider,
} from "../CONTROLLERS/register.controller.js";
import { upload } from "../MIDDLEWARES/multer.middleware.js";

const router = Router();


const handleUpload = (req, res, next) => {
  upload.single("profileImage")(req, res, (err) => {
    if (err) {
      console.error("[multer] Upload error:", err.message);
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed.",
      });
    }

    // Log outcome so you can confirm in terminal whether file arrived
    if (req.file) {
      console.log(
        "[multer] File received:",
        req.file.originalname,
        "→",
        req.file.path
      );
    } else {
      console.warn(
        "[multer] No file in request (profileImage field was empty or not sent)."
      );
    }

    next();
  });
};

// Customer registration
router.route("/customer").post(handleUpload, registerCustomer);

// Provider registration
router.route("/provider").post(handleUpload, registerProvider);

export default router;
