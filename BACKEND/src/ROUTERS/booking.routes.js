import { Router } from "express";
import { verifyJWT } from "../MIDDLEWARES/auth.middlewares.js";
import {
  CreateBooking,
  getBooking,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
} from "../CONTROLLERS/booking.controller.js";

const router = Router();

router.route("/").post(verifyJWT, CreateBooking).get(verifyJWT, getBooking);
router.route("/:bookingId").get(verifyJWT, getBookingById).put(verifyJWT, updateBookingStatus).delete(verifyJWT, cancelBooking);

export default router;
