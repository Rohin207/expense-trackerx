import { Router } from "express";
import {
  addTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction
} from "../controllers/transactionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(protect);
router.post("/add", asyncHandler(addTransaction));
router.get("/get", asyncHandler(getTransactions));
router.put("/update/:id", asyncHandler(updateTransaction));
router.delete("/delete/:id", asyncHandler(deleteTransaction));

export default router;
