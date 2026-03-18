import { Router} from "express";
import { verifyJWT } from "../MIDDLEWARES/auth.middlewares.js";

import{
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
} from "../CONTROLLERS/notifications.controller.js";

const router = Router();

// Route to get all notifications for the logged-in user
router.route("/getTheNotifications").get(verifyJWT, getNotifications);

// Route to mark a specific notification as read

router.route("/markAsRead/:notificationId").put(verifyJWT, markAsRead);

// Route to mark all notifications as read
router.route("/markAllAsRead").put(verifyJWT, markAllAsRead);

// Route to delete a specific notification

router.route("/deleteNotification/:notificationId").delete(verifyJWT, deleteNotification);

// Route to get the count of unread notifications
router.route("/getUnreadCount").get(verifyJWT, getUnreadCount);

export default router;
