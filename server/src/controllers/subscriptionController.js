import mongoose from "mongoose";
import { Subscription } from "../models/Subscription.js";
import { Transaction } from "../models/Transaction.js";

const addOneMonth = (dateValue) => {
  const date = new Date(dateValue);
  const day = date.getDate();
  date.setMonth(date.getMonth() + 1);

  if (date.getDate() < day) {
    date.setDate(0);
  }

  return date;
};

const validateSubscriptionInput = ({ name, logo, monthlyAmount, startDate }) => {
  if (!name?.trim()) {
    return "Subscription name is required.";
  }

  if (!logo?.trim()) {
    return "Subscription logo is required.";
  }

  const amount = Number(monthlyAmount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "Monthly amount must be greater than zero.";
  }

  if (!startDate || Number.isNaN(new Date(startDate).getTime())) {
    return "A valid start date is required.";
  }

  return null;
};

const processDueSubscriptions = async (userId) => {
  const now = new Date();
  const dueSubscriptions = await Subscription.find({
    userId,
    isActive: true,
    nextBillingDate: { $lte: now }
  });

  for (const subscription of dueSubscriptions) {
    let nextBillingDate = new Date(subscription.nextBillingDate);

    while (nextBillingDate <= now) {
      await Transaction.create({
        userId,
        amount: subscription.monthlyAmount,
        type: "expense",
        category: "Subscription",
        date: nextBillingDate,
        description: subscription.name
      });

      nextBillingDate = addOneMonth(nextBillingDate);
    }

    subscription.nextBillingDate = nextBillingDate;
    await subscription.save();
  }
};

export const getSubscriptions = async (req, res) => {
  await processDueSubscriptions(req.user._id);

  const subscriptions = await Subscription.find({ userId: req.user._id }).sort({
    createdAt: -1
  });

  const totals = subscriptions.reduce(
    (accumulator, subscription) => {
      if (subscription.isActive) {
        accumulator.activeMonthlyCost += subscription.monthlyAmount;
      }

      return accumulator;
    },
    { activeMonthlyCost: 0 }
  );

  return res.status(200).json({
    subscriptions,
    summary: totals
  });
};

export const createSubscription = async (req, res) => {
  const validationError = validateSubscriptionInput(req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const startDate = new Date(req.body.startDate);
  const subscription = await Subscription.create({
    userId: req.user._id,
    name: req.body.name.trim(),
    logo: req.body.logo.trim(),
    monthlyAmount: Number(req.body.monthlyAmount),
    startDate,
    nextBillingDate: addOneMonth(startDate),
    isActive: req.body.isActive ?? true
  });

  return res.status(201).json({
    message: "Subscription added successfully.",
    subscription
  });
};

export const updateSubscription = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid subscription id." });
  }

  const validationError = validateSubscriptionInput(req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const startDate = new Date(req.body.startDate);
  const subscription = await Subscription.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    {
      name: req.body.name.trim(),
      logo: req.body.logo.trim(),
      monthlyAmount: Number(req.body.monthlyAmount),
      startDate,
      nextBillingDate: req.body.nextBillingDate
        ? new Date(req.body.nextBillingDate)
        : addOneMonth(startDate),
      isActive: req.body.isActive ?? true
    },
    { new: true }
  );

  if (!subscription) {
    return res.status(404).json({ message: "Subscription not found." });
  }

  return res.status(200).json({
    message: "Subscription updated successfully.",
    subscription
  });
};

export const deleteSubscription = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid subscription id." });
  }

  const subscription = await Subscription.findOneAndDelete({
    _id: id,
    userId: req.user._id
  });

  if (!subscription) {
    return res.status(404).json({ message: "Subscription not found." });
  }

  return res.status(200).json({
    message: "Subscription deleted successfully."
  });
};
