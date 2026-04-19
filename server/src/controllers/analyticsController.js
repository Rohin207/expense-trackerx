import { Transaction } from "../models/Transaction.js";

const getRangeStart = (range) => {
  const now = new Date();

  if (range === "7d") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  if (range === "30d") {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return new Date(now.getFullYear(), now.getMonth() - 5, 1);
};

const formatMonthLabel = (dateValue) =>
  new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric"
  }).format(new Date(dateValue));

const normalizeCategory = (category) => {
  const value = String(category || "").trim().toLowerCase();

  if (value === "food") return "Food";
  if (value === "travel") return "Travel";
  if (value === "bills") return "Bills";
  if (value === "subscription") return "Subscriptions";
  return "Others";
};

const getFilteredTransactions = async (userId, range) => {
  const startDate = getRangeStart(range);

  return Transaction.find({
    userId,
    date: { $gte: startDate }
  }).sort({ date: 1, createdAt: 1 });
};

const buildMonthlySeries = (transactions) => {
  const bucket = new Map();

  transactions.forEach((transaction) => {
    const key = `${new Date(transaction.date).getFullYear()}-${new Date(transaction.date).getMonth()}`;

    if (!bucket.has(key)) {
      bucket.set(key, {
        label: formatMonthLabel(transaction.date),
        income: 0,
        expense: 0
      });
    }

    const item = bucket.get(key);

    if (transaction.type === "income") {
      item.income += transaction.amount;
    } else {
      item.expense += transaction.amount;
    }
  });

  return Array.from(bucket.values());
};

const buildCategorySeries = (transactions) => {
  const expenseTransactions = transactions.filter(
    (transaction) => transaction.type === "expense"
  );
  const totals = {
    Food: 0,
    Travel: 0,
    Bills: 0,
    Subscriptions: 0,
    Others: 0
  };

  expenseTransactions.forEach((transaction) => {
    const normalized = normalizeCategory(transaction.category);
    totals[normalized] += transaction.amount;
  });

  const totalExpense = expenseTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  return Object.entries(totals).map(([name, value]) => ({
    name,
    value,
    percentage: totalExpense > 0 ? Number(((value / totalExpense) * 100).toFixed(1)) : 0
  }));
};

const buildSummary = (transactions, user) => {
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const monthlySeries = buildMonthlySeries(transactions);
  const categories = buildCategorySeries(transactions).sort((a, b) => b.value - a.value);
  const topSpendingCategory = categories.find((item) => item.value > 0)?.name || "N/A";
  const highestExpenseMonth =
    monthlySeries.reduce(
      (highest, item) => (item.expense > highest.expense ? item : highest),
      { label: "N/A", expense: 0 }
    ).label || "N/A";
  const averageMonthlySpending =
    monthlySeries.length > 0
      ? Number(
          (
            monthlySeries.reduce((sum, item) => sum + item.expense, 0) / monthlySeries.length
          ).toFixed(2)
        )
      : 0;
  const subscriptionExpense = transactions
    .filter(
      (transaction) =>
        transaction.type === "expense" &&
        normalizeCategory(transaction.category) === "Subscriptions"
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return {
    totalIncome: income,
    totalExpense: expense,
    totalSavings: user.savingsBalance || 0,
    netBalance: income - expense,
    subscriptionExpense,
    topSpendingCategory,
    highestExpenseMonth,
    averageMonthlySpending
  };
};

export const getAnalyticsSummary = async (req, res) => {
  const range = req.query.range || "6m";
  const transactions = await getFilteredTransactions(req.user._id, range);

  return res.status(200).json({
    range,
    summary: buildSummary(transactions, req.user)
  });
};

export const getAnalyticsMonthly = async (req, res) => {
  const range = req.query.range || "6m";
  const transactions = await getFilteredTransactions(req.user._id, range);

  return res.status(200).json({
    range,
    monthly: buildMonthlySeries(transactions)
  });
};

export const getAnalyticsCategories = async (req, res) => {
  const range = req.query.range || "6m";
  const transactions = await getFilteredTransactions(req.user._id, range);

  return res.status(200).json({
    range,
    categories: buildCategorySeries(transactions)
  });
};
