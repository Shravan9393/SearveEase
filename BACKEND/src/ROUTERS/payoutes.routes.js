import { Router } from "express";

import {
    requestPayout,
    getPayouts,
    processPayout
} from "../CONTROLLERS/payouts.controller.js";

const router = Router();

// Route to request a payout (provider only)
router.route("/requestPayout").post(requestPayout);

// Route to get payouts (provider gets own, admin gets all) 

router.route("/getPayouts").get(getPayouts);

// Route to process a payout (admin only)
router.route("/processPayout/:payoutId").post(processPayout);

export default router;