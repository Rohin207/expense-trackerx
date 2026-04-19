import { Router } from "express";
import {
  addToSavings,
  createVault,
  getVaultData,
  verifyVaultPin,
  withdrawFromSavings
} from "../controllers/vaultController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireVaultAccess } from "../middleware/vaultMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(protect);
router.post("/create", asyncHandler(createVault));
router.post("/verify-pin", asyncHandler(verifyVaultPin));
router.get("/data", requireVaultAccess, asyncHandler(getVaultData));
router.post("/add", requireVaultAccess, asyncHandler(addToSavings));
router.post("/withdraw", requireVaultAccess, asyncHandler(withdrawFromSavings));

export default router;
