import { Router } from "express";

import {
    processPayment,
    getPayments,
    refundPayment,
    updatePaymentStatus
} from "../CONTROLLERS/payments.controller.js";

const router = Router();

// router to process payment

router.route("/processPayment").post(processPayment);

// router to get payments

router.route("/").get(getPayments);

// router to refund payment

router.route("/:paymentId/refundPayment").post(refundPayment);

// router to update payment status
router.route("/:paymentId/status").put(updatePaymentStatus);

export default router;
