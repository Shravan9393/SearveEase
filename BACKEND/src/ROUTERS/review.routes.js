import { Router } from "express";
import { verifyJWT } from "../MIDDLEWARES/auth.middlewares.js";
import {
  createReview,
  getReviews,
  getProviderReviews,
  getServiceReviews,
  updateReview,
  deleteReview,
} from "../CONTROLLERS/reviews.controllers.js";

const router = Router();

router.route("/").get(getReviews);
router.route("/service/:serviceId").get(getServiceReviews);
router.route("/provider/me").get(verifyJWT, getProviderReviews);
router.route("/createReview").post(verifyJWT, createReview);
router.route("/updateReview/:reviewId").put(verifyJWT, updateReview);
router.route("/deleteReview/:reviewId").delete(verifyJWT, deleteReview);

export default router;
