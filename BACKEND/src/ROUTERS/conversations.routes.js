import { Router } from "express";

import {
    createConversationForBooking,
    getConversation,
    getConversationByBookingId,
    lockConversation
} from "../CONTROLLERS/conversations.controller.js";

const router = Router();

// router to create conversation for a booking

router.route("/createChatForBooking/:bookingId").post(createConversationForBooking);


// router to get conversation for a user

router.route("/").get(getConversation);

// router to get conversation by booking id

router.route("/booking/:bookingId").get(getConversationByBookingId);

// router to lock conversation

router.route("/:conversationId/lock").post(lockConversation);


export default router;