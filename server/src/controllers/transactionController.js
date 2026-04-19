import mongoose from "mongoose";
import { Transaction } from "../models/Transaction.js";
import { validateTransactionInput } from "../utils/validators.js";

const buildSummary = (transactions) => {
  const totals = transactions.reduce(
    (accumulator, transaction) => {
      if (transaction.type === "income") {
        accumulator.income += transaction.amount;
      } else {
        accumulator.expense += transaction.amount;
      }

      return accumulator;
    },
    { income: 0, expense: 0 }
  );

  const monthKey = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(new Date());

  const monthlyTransactions = transactions.filter((transaction) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const transactionDate = new Date(transaction.date);

    return (
      transactionDate.getMonth() === currentMonth &&
      transactionDate.getFullYear() === currentYear
    );
  });

  const monthly = monthlyTransactions.reduce(
    (accumulator, transaction) => {
      if (transaction.type === "income") {
        accumulator.income += transaction.amount;
      } else {
        accumulator.expense += transaction.amount;
      }

      return accumulator;
    },
    { income: 0, expense: 0 }
  );

  return {
    totalBalance: totals.income - totals.expense,
    totalIncome: totals.income,
    totalExpense: totals.expense,
    monthlySummary: {
      label: monthKey,
      income: monthly.income,
      expense: monthly.expense,
      balance: monthly.income - monthly.expense
    }
  };
};

export const addTransaction = async (req, res) => {
  const validationError = validateTransactionInput(req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const transaction = await Transaction.create({
    userId: req.user._id,
    amount: Number(req.body.amount),
    type: req.body.type,
    category: req.body.category.trim(),
    date: req.body.date,
    description: req.body.description?.trim() || ""
  });

  return res.status(201).json({
    message: "Transaction added successfully.",
    transaction
  });
};

export const getTransactions = async (req, res) => {
  const transactions = await Transaction.find({ userId: req.user._id }).sort({
    date: -1,
    createdAt: -1
  });

  return res.status(200).json({
    transactions,
    summary: buildSummary(transactions)
  });
};

export const updateTransaction = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid transaction id." });
  }

  const validationError = validateTransactionInput(req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const transaction = await Transaction.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    {
      amount: Number(req.body.amount),
      type: req.body.type,
      category: req.body.category.trim(),
      date: req.body.date,
      description: req.body.description?.trim() || ""
    },
    { new: true }
  );

  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found." });
  }

  return res.status(200).json({
    message: "Transaction updated successfully.",
    transaction
  });
};

export const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid transaction id." });
  }

  const transaction = await Transaction.findOneAndDelete({
    _id: id,
    userId: req.user._id
  });

  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found." });
  }

  return res.status(200).json({ message: "Transaction deleted successfully." });
};
