import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserRole,
    deleteUser

} from "../CONTROLLERS/user.controller.js";
import { verifyJWT } from "../MIDDLEWARES/auth.middlewares.js";

const router = Router();

// Route to get current user details (protected)

router.route("/me").get(verifyJWT, getCurrentUser);

// Route to update account details

router.route("/meUpdate").put(verifyJWT, updateAccountDetails);

// Route to change current password
router.route("/change-password").put(verifyJWT, changeCurrentPassword);

// Route to update user avatar

router.route("/me/avatar").put(verifyJWT, updateUserAvatar);

// Admin routes

router.route("/:userId/role").put(updateUserRole);

router.route("/:userId/deleteUser").delete(deleteUser);

export default router;
