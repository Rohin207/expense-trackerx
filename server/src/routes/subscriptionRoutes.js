import { Router } from "express";
import {
  createSubscription,
  deleteSubscription,
  getSubscriptions,
  updateSubscription
} from "../controllers/subscriptionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(protect);
router.get("/", asyncHandler(getSubscriptions));
router.post("/", asyncHandler(createSubscription));
router.put("/:id", asyncHandler(updateSubscription));
router.delete("/:id", asyncHandler(deleteSubscription));

export default router;
