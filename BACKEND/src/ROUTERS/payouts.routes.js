import { Router } from "express";
import {
    createPayoutRequest,
    getPayoutRequests,
    updatePayoutStatus,
    getPayoutStats,
    getAllPayoutRequests
} from "../CONTROLLERS/payouts.controller.js";
import { verifyJWT } from "../MIDDLEWARES/auth.middlewares.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Provider routes
// Route to create a payout request
router.route("/request").post(createPayoutRequest);

// Route to get payout requests for provider
router.route("/requests").get(getPayoutRequests);

// Route to get payout statistics for provider
router.route("/stats").get(getPayoutStats);

// Admin routes
// Route to update payout status (admin only)
router.route("/:payoutId/status").put(updatePayoutStatus);

// Route to get all payout requests (admin only)
router.route("/admin/all").get(getAllPayoutRequests);

export default router;
