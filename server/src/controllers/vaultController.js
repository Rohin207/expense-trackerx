import bcrypt from "bcryptjs";
import { generateVaultToken } from "../utils/vaultToken.js";
import { Transaction } from "../models/Transaction.js";

const buildVaultPayload = (user) => ({
  savingsBalance: user.savingsBalance || 0,
  savingsGoal: user.savingsGoal || 0,
  hasVault: user.hasVault,
  progressPercentage:
    user.savingsGoal > 0
      ? Math.min(100, Math.round(((user.savingsBalance || 0) / user.savingsGoal) * 100))
      : 0
});

export const createVault = async (req, res) => {
  const { pin, confirmPin, savingsGoal } = req.body;

  if (req.user.hasVault) {
    return res.status(400).json({ message: "Vault already exists for this account." });
  }

  if (!/^\d{4}$/.test(pin || "")) {
    return res.status(400).json({ message: "PIN must be exactly 4 digits." });
  }

  if (pin !== confirmPin) {
    return res.status(400).json({ message: "PIN and confirm PIN must match." });
  }

  const parsedGoal = Number(savingsGoal || 0);

  if (!Number.isFinite(parsedGoal) || parsedGoal < 0) {
    return res.status(400).json({ message: "Savings goal must be zero or more." });
  }

  const salt = await bcrypt.genSalt(10);
  req.user.vaultPin = await bcrypt.hash(pin, salt);
  req.user.hasVault = true;
  req.user.savingsGoal = parsedGoal;
  await req.user.save();

  return res.status(201).json({
    message: "Vault created successfully.",
    vaultToken: generateVaultToken(req.user._id),
    vault: buildVaultPayload(req.user)
  });
};

export const verifyVaultPin = async (req, res) => {
  const { pin } = req.body;

  if (!req.user.hasVault || !req.user.vaultPin) {
    return res.status(404).json({ message: "Vault has not been created yet." });
  }

  if (!/^\d{4}$/.test(pin || "")) {
    return res.status(400).json({ message: "PIN must be exactly 4 digits." });
  }

  const pinMatches = await bcrypt.compare(pin, req.user.vaultPin);

  if (!pinMatches) {
    return res.status(401).json({ message: "Incorrect vault PIN." });
  }

  return res.status(200).json({
    message: "Vault unlocked successfully.",
    vaultToken: generateVaultToken(req.user._id),
    vault: buildVaultPayload(req.user)
  });
};

export const getVaultData = async (req, res) => {
  return res.status(200).json({
    vault: buildVaultPayload(req.user)
  });
};

const parseAmount = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const getAvailableBalance = async (userId) => {
  const transactions = await Transaction.find({ userId }).select("amount type");

  return transactions.reduce((balance, transaction) => {
    if (transaction.type === "income") {
      return balance + transaction.amount;
    }

    return balance - transaction.amount;
  }, 0);
};

export const addToSavings = async (req, res) => {
  const amount = parseAmount(req.body.amount);
  const savingsGoal =
    req.body.savingsGoal === undefined ? req.user.savingsGoal : Number(req.body.savingsGoal);

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: "Amount must be greater than zero." });
  }

  if (!Number.isFinite(savingsGoal) || savingsGoal < 0) {
    return res.status(400).json({ message: "Savings goal must be zero or more." });
  }

  const availableBalance = await getAvailableBalance(req.user._id);

  if (amount > availableBalance) {
    return res.status(400).json({
      message: "You can only move money that is currently available in your balance."
    });
  }

  req.user.savingsBalance += amount;
  req.user.savingsGoal = savingsGoal;
  await req.user.save();
  await Transaction.create({
    userId: req.user._id,
    amount,
    type: "expense",
    category: "Vault Transfer",
    date: new Date(),
    description: `Saved ${amount} to vault`
  });

  return res.status(200).json({
    message: "Savings updated successfully.",
    vault: buildVaultPayload(req.user)
  });
};

export const withdrawFromSavings = async (req, res) => {
  const amount = parseAmount(req.body.amount);
  const savingsGoal =
    req.body.savingsGoal === undefined ? req.user.savingsGoal : Number(req.body.savingsGoal);

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: "Amount must be greater than zero." });
  }

  if (amount > req.user.savingsBalance) {
    return res.status(400).json({ message: "Withdrawal cannot exceed savings balance." });
  }

  if (!Number.isFinite(savingsGoal) || savingsGoal < 0) {
    return res.status(400).json({ message: "Savings goal must be zero or more." });
  }

  req.user.savingsBalance -= amount;
  req.user.savingsGoal = savingsGoal;
  await req.user.save();
  await Transaction.create({
    userId: req.user._id,
    amount,
    type: "income",
    category: "Vault Withdrawal",
    date: new Date(),
    description: `Withdrawn ${amount} from vault`
  });

  return res.status(200).json({
    message: "Withdrawal completed successfully.",
    vault: buildVaultPayload(req.user)
  });
};
