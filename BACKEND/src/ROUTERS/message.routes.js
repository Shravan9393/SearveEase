import { Router } from "express";
import {
    sendMessage,
    getMessages,
    markMessagesAsRead,
    deleteMessage,
    getUnreadCount
} from "../CONTROLLERS/messages.controller.js";
import { verifyJWT } from "../MIDDLEWARES/auth.middlewares.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Route to send a message
router.route("/send").post(sendMessage);

// Route to get messages for a conversation
router.route("/:conversationId").get(getMessages);

// Route to mark messages as read in a conversation
router.route("/:conversationId/read").put(markMessagesAsRead);

// Route to delete a message
router.route("/:messageId").delete(deleteMessage);

// Route to get unread message count
router.route("/unread/count").get(getUnreadCount);

export default router;
