import { Router } from "express";
import { verifyJWT } from "../MIDDLEWARES/auth.middlewares.js";
import {
  createQuery,
  getProviderQueries,
  getCustomerQueries,
  replyToQuery,
} from "../CONTROLLERS/queries.controller.js";

const router = Router();

router.use(verifyJWT);
router.route("/").post(createQuery);
router.route("/provider").get(getProviderQueries);
router.route("/customer").get(getCustomerQueries);
router.route("/:queryId/reply").post(replyToQuery);

export default router;
