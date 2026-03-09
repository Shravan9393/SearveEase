import { Router } from "express";

import {
    createComplaint,
    getComplaints,
    updateComplaintStatus
} from "../CONTROLLERS/complaints.controller.js";

const router = Router();

// Route to create a new complaint

router.route("/createComplaint").post(createComplaint);

// Route to get complaints for the logged-in user
router.route("/getComplaints").get(getComplaints);

// Route to update complaint status (admin only)

router.route("/updateComplaintStatus/:complaintId").put(updateComplaintStatus);

export default router;