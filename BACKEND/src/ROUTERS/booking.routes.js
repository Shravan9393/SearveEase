import { Router } from "express";

import {
    CreateBooking,
    getBooking,
    updateBookingStatus,
    cancelBooking
} from "../CONTROLLERS/booking.controller.js";

const router = Router();

// router to create a booking

router.route('/CreateBooking').post(CreateBooking);

// router to get all bookings

router.route("/").get(getBooking);


// router to update booking status

router.route("/:bookingId/status").put(updateBookingStatus);


// router to cancel Booking
router.route("/:bookingId/cancel").put(cancelBooking);


export default router;