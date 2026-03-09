import { Router } from "express";

import {
    logAdminAction,
    getAdminActions,
    getAllUsers
} from "../CONTROLLERS/admin_actions.controller.js";

const router = Router();

// Route to log an admin action
router.route("/logAdmin").post(logAdminAction);

// Route to get admin actions with optional filtering by target user

router.route("/adminActions").get(getAdminActions);

// Route to get all users (for admin purposes)
router.route("/getAllUsers").get(getAllUsers);

export default router;