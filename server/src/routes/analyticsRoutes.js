import { Router } from "express";
import {
  getAnalyticsCategories,
  getAnalyticsMonthly,
  getAnalyticsSummary
} from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(protect);
router.get("/summary", asyncHandler(getAnalyticsSummary));
router.get("/monthly", asyncHandler(getAnalyticsMonthly));
router.get("/categories", asyncHandler(getAnalyticsCategories));

export default router;
