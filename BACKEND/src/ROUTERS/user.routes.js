import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserRole,
  deleteUser,
} from "../CONTROLLERS/user.controller.js";
import { verifyJWT } from "../MIDDLEWARES/auth.middlewares.js";
import { upload } from "../MIDDLEWARES/multer.middleware.js";

const router = Router();

router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/me").put(verifyJWT, updateAccountDetails);
router.route("/change-password").put(verifyJWT, changeCurrentPassword);
router.route("/me/avatar").put(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/:userId/role").put(verifyJWT, updateUserRole);
router.route("/:userId").delete(verifyJWT, deleteUser);

export default router;
