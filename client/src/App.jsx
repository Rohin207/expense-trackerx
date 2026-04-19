import { useEffect, useMemo, useRef, useState } from "react";
import {
  analyticsApi,
  authApi,
  subscriptionsApi,
  transactionsApi,
  vaultApi
} from "./api";
import { AuthForm } from "./components/AuthForm";
import { Dashboard } from "./components/Dashboard";
import { LandingPage } from "./components/LandingPage";
import { VaultPage } from "./components/VaultPage";

const defaultAuthMode = "login";

const defaultTransactionForm = () => ({
  amount: "",
  type: "expense",
  category: "Food",
  date: new Date().toISOString().split("T")[0],
  description: ""
});

const demoSummary = {
  totalBalance: 15420,
  totalIncome: 42000,
  totalExpense: 26580,
  monthlySummary: {
    label: "Demo Preview",
    income: 20000,
    expense: 11190,
    balance: 8810
  }
};

const demoTransactions = [
  {
    _id: "demo-1",
    amount: 4200,
    type: "expense",
    category: "Bills",
    date: new Date().toISOString(),
    description: "Electricity and internet payment"
  },
  {
    _id: "demo-2",
    amount: 18000,
    type: "income",
    category: "Salary",
    date: new Date().toISOString(),
    description: "Monthly salary credit"
  }
];

function App() {
  const authSectionRef = useRef(null);
  const [routePath, setRoutePath] = useState(window.location.pathname);
  const [authMode, setAuthMode] = useState(defaultAuthMode);
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    age: "",
    password: ""
  });
  const [transactionForm, setTransactionForm] = useState(defaultTransactionForm);
  const [token, setToken] = useState(localStorage.getItem("etx_token") || "");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("etx_user") || "null")
  );
  const [summary, setSummary] = useState(demoSummary);
  const [transactions, setTransactions] = useState([]);
  const [authLoading, setAuthLoading] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [transactionFilters, setTransactionFilters] = useState({
    query: "",
    category: "all",
    type: "all",
    date: ""
  });
  const [vaultState, setVaultState] = useState({
    hasVault: false,
    isUnlocked: false,
    savingsBalance: 0,
    savingsGoal: 0,
    progressPercentage: 0
  });
  const [vaultMessage, setVaultMessage] = useState("");
  const [vaultError, setVaultError] = useState("");
  const [vaultLoading, setVaultLoading] = useState(false);
  const [vaultActionLoading, setVaultActionLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionSummary, setSubscriptionSummary] = useState({
    activeMonthlyCost: 0
  });
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionFormLoading, setSubscriptionFormLoading] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState("");
  const [subscriptionError, setSubscriptionError] = useState("");
  const [analyticsRange, setAnalyticsRange] = useState("6m");
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");
  const [analyticsSummary, setAnalyticsSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalSavings: 0,
    netBalance: 0,
    subscriptionExpense: 0,
    topSpendingCategory: "N/A",
    highestExpenseMonth: "N/A",
    averageMonthlySpending: 0
  });
  const [analyticsMonthly, setAnalyticsMonthly] = useState([]);
  const [analyticsCategories, setAnalyticsCategories] = useState([]);

  const isAuthenticated = Boolean(token && user);
  const isVaultPage = routePath === "/vault";
  const vaultTokenKey = user ? `etx_vault_token_${user.id}` : "";

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesQuery = transaction.description
        .toLowerCase()
        .includes(transactionFilters.query.toLowerCase().trim());
      const matchesCategory =
        transactionFilters.category === "all" ||
        transaction.category === transactionFilters.category;
      const matchesType =
        transactionFilters.type === "all" || transaction.type === transactionFilters.type;
      const matchesDate =
        !transactionFilters.date ||
        new Date(transaction.date).toISOString().split("T")[0] === transactionFilters.date;

      return matchesQuery && matchesCategory && matchesType && matchesDate;
    });
  }, [transactions, transactionFilters]);

  const loadTransactions = async (sessionToken = token) => {
    if (!sessionToken) {
      setTransactions([]);
      setSummary(demoSummary);
      return;
    }

    try {
      const data = await transactionsApi.getAll(sessionToken);
      setTransactions(data.transactions);
      setSummary(data.summary);
    } catch (requestError) {
      handleSessionExpiry(requestError.message);
    }
  };

  const loadSubscriptions = async (sessionToken = token) => {
    if (!sessionToken) {
      setSubscriptions([]);
      setSubscriptionSummary({ activeMonthlyCost: 0 });
      return;
    }

    setSubscriptionLoading(true);

    try {
      const data = await subscriptionsApi.getAll(sessionToken);
      setSubscriptions(data.subscriptions);
      setSubscriptionSummary(data.summary);
      await loadTransactions(sessionToken);
    } catch (requestError) {
      setSubscriptionError(requestError.message);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const loadAnalytics = async (range = analyticsRange, sessionToken = token) => {
    if (!sessionToken) {
      setAnalyticsSummary({
        totalIncome: 0,
        totalExpense: 0,
        totalSavings: 0,
        netBalance: 0,
        subscriptionExpense: 0,
        topSpendingCategory: "N/A",
        highestExpenseMonth: "N/A",
        averageMonthlySpending: 0
      });
      setAnalyticsMonthly([]);
      setAnalyticsCategories([]);
      return;
    }

    setAnalyticsLoading(true);
    setAnalyticsError("");

    try {
      const [summaryData, monthlyData, categoriesData] = await Promise.all([
        analyticsApi.getSummary(range, sessionToken),
        analyticsApi.getMonthly(range, sessionToken),
        analyticsApi.getCategories(range, sessionToken)
      ]);

      setAnalyticsSummary(summaryData.summary);
      setAnalyticsMonthly(monthlyData.monthly);
      setAnalyticsCategories(categoriesData.categories);
    } catch (requestError) {
      setAnalyticsError(requestError.message);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    const handlePopState = () => setRoutePath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);

    if (isAuthenticated) {
      loadTransactions();
      loadSubscriptions();
      loadAnalytics();
    } else {
      setTransactions(demoTransactions);
      setSummary(demoSummary);
    }

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!user) {
      setVaultState({
        hasVault: false,
        isUnlocked: false,
        savingsBalance: 0,
        savingsGoal: 0,
        progressPercentage: 0
      });
      return;
    }

    setVaultState((current) => ({
      ...current,
      hasVault: Boolean(user.hasVault),
      savingsBalance: user.savingsBalance || 0,
      savingsGoal: user.savingsGoal || 0,
      isUnlocked: false
    }));
  }, [user]);

  useEffect(() => {
    const restoreVaultSession = async () => {
      if (!isAuthenticated || !isVaultPage || !vaultTokenKey) {
        return;
      }

      const storedVaultToken = sessionStorage.getItem(vaultTokenKey);

      if (!storedVaultToken) {
        return;
      }

      try {
        const data = await vaultApi.getData(token, storedVaultToken);
        setVaultState({
          hasVault: data.vault.hasVault,
          isUnlocked: true,
          savingsBalance: data.vault.savingsBalance,
          savingsGoal: data.vault.savingsGoal,
          progressPercentage: data.vault.progressPercentage
        });
      } catch (requestError) {
        sessionStorage.removeItem(vaultTokenKey);
        setVaultState((current) => ({ ...current, isUnlocked: false }));
      }
    };

    restoreVaultSession();
  }, [isAuthenticated, isVaultPage, token, vaultTokenKey]);

  const handleSessionExpiry = (errorMessage) => {
    localStorage.removeItem("etx_token");
    localStorage.removeItem("etx_user");
    setToken("");
    setUser(null);
    setTransactions(demoTransactions);
    setSummary(demoSummary);
    setEditingId("");
    setTransactionForm(defaultTransactionForm());
    setError(errorMessage || "Your session expired. Please log in again.");
  };

  const handleAuthChange = (event) => {
    const { name, value } = event.target;
    setAuthForm((current) => ({ ...current, [name]: value }));
  };

  const handleTransactionChange = (event) => {
    const { name, value } = event.target;
    setTransactionForm((current) => ({ ...current, [name]: value }));
  };

  const handleTransactionFilterChange = (event) => {
    const { name, value } = event.target;
    setTransactionFilters((current) => ({ ...current, [name]: value }));
  };

  const clearTransactionFilters = () => {
    setTransactionFilters({
      query: "",
      category: "all",
      type: "all",
      date: ""
    });
  };

  const handleAnalyticsRangeChange = async (nextRange) => {
    setAnalyticsRange(nextRange);
    await loadAnalytics(nextRange);
  };

  const resetFeedback = () => {
    setError("");
    setMessage("");
  };

  const resetVaultFeedback = () => {
    setVaultError("");
    setVaultMessage("");
  };

  const resetSubscriptionFeedback = () => {
    setSubscriptionError("");
    setSubscriptionMessage("");
  };

  const navigateTo = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
      setRoutePath(path);
    }
  };

  const persistSession = (session) => {
    localStorage.setItem("etx_token", session.token);
    localStorage.setItem("etx_user", JSON.stringify(session.user));
    setToken(session.token);
    setUser(session.user);
    setVaultState((current) => ({
      ...current,
      hasVault: Boolean(session.user.hasVault)
    }));
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    resetFeedback();
    setAuthLoading(true);

    try {
      const endpoint = authMode === "signup" ? authApi.signup : authApi.login;
      const payload =
        authMode === "signup"
          ? authForm
          : {
              email: authForm.email,
              password: authForm.password
            };

      const data = await endpoint(payload);
      setAuthForm({ name: "", email: "", age: "", password: "" });

      if (authMode === "signup") {
        setMessage(data.message);
        setAuthMode("login");
      } else {
        persistSession(data);
        setMessage(data.message);
        await loadTransactions(data.token);
        await loadSubscriptions(data.token);
        await loadAnalytics(analyticsRange, data.token);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleTransactionSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setError("Please log in to add or update transactions.");
      return;
    }

    resetFeedback();
    setTransactionLoading(true);

    try {
      if (editingId) {
        await transactionsApi.update(editingId, transactionForm, token);
        setMessage("Transaction updated successfully.");
      } else {
        await transactionsApi.add(transactionForm, token);
        setMessage("Transaction added successfully.");
      }

      setTransactionForm(defaultTransactionForm());
      setEditingId("");
      await loadTransactions();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleEditTransaction = (transaction) => {
    resetFeedback();
    setEditingId(transaction._id);
    setTransactionForm({
      amount: String(transaction.amount),
      type: transaction.type,
      category: transaction.category,
      date: new Date(transaction.date).toISOString().split("T")[0],
      description: transaction.description || ""
    });
  };

  const handleDeleteTransaction = async (id) => {
    if (!isAuthenticated) {
      setError("Please log in to delete transactions.");
      return;
    }

    resetFeedback();
    setDeletingId(id);

    try {
      await transactionsApi.delete(id, token);
      setMessage("Transaction deleted successfully.");
      await loadTransactions();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeletingId("");
    }
  };

  const handleCancelEdit = () => {
    setEditingId("");
    setTransactionForm(defaultTransactionForm());
  };

  const handleLogout = () => {
    resetFeedback();
    resetVaultFeedback();
    if (vaultTokenKey) {
      sessionStorage.removeItem(vaultTokenKey);
    }
    localStorage.removeItem("etx_token");
    localStorage.removeItem("etx_user");
    setToken("");
    setUser(null);
    setTransactions(demoTransactions);
    setSummary(demoSummary);
    setEditingId("");
    setTransactionForm(defaultTransactionForm());
    setMessage("You have been logged out.");
    navigateTo("/");
  };

  const runSubscriptionMutation = async (action) => {
    resetSubscriptionFeedback();
    setSubscriptionFormLoading(true);

    try {
      const data = await action();
      setSubscriptionMessage(data.message);
      await loadSubscriptions();
      await loadAnalytics();
      return true;
    } catch (requestError) {
      setSubscriptionError(requestError.message);
      return false;
    } finally {
      setSubscriptionFormLoading(false);
    }
  };

  const handleCreateSubscription = async (payload) =>
    runSubscriptionMutation(() => subscriptionsApi.create(payload, token));

  const handleUpdateSubscription = async (id, payload) =>
    runSubscriptionMutation(() => subscriptionsApi.update(id, payload, token));

  const handleDeleteSubscription = async (id) =>
    runSubscriptionMutation(() => subscriptionsApi.delete(id, token));

  const updateVaultFromResponse = (vault, nextMessage = "") => {
    setVaultState({
      hasVault: vault.hasVault,
      isUnlocked: true,
      savingsBalance: vault.savingsBalance,
      savingsGoal: vault.savingsGoal,
      progressPercentage: vault.progressPercentage
    });
    setVaultMessage(nextMessage);
    setVaultError("");
  };

  const handleCreateVault = async (payload) => {
    resetVaultFeedback();
    setVaultLoading(true);

    try {
      const data = await vaultApi.create(payload, token);
      sessionStorage.setItem(vaultTokenKey, data.vaultToken);
      const updatedUser = { ...user, hasVault: true };
      localStorage.setItem("etx_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      updateVaultFromResponse(data.vault, data.message);
      return data.vault;
    } catch (requestError) {
      setVaultError(requestError.message);
      return null;
    } finally {
      setVaultLoading(false);
    }
  };

  const handleVerifyVault = async (pin) => {
    resetVaultFeedback();
    setVaultLoading(true);

    try {
      const data = await vaultApi.verifyPin({ pin }, token);
      sessionStorage.setItem(vaultTokenKey, data.vaultToken);
      updateVaultFromResponse(data.vault, data.message);
      return data.vault;
    } catch (requestError) {
      setVaultError(requestError.message);
      return null;
    } finally {
      setVaultLoading(false);
    }
  };

  const withVaultAction = async (action) => {
    resetVaultFeedback();
    setVaultActionLoading(true);

    try {
      const storedVaultToken = sessionStorage.getItem(vaultTokenKey);

      if (!storedVaultToken) {
        throw new Error("Vault session expired. Enter your PIN again.");
      }

      const data = await action(storedVaultToken);
      updateVaultFromResponse(data.vault, data.message);
      return data.vault;
    } catch (requestError) {
      setVaultError(requestError.message);
      sessionStorage.removeItem(vaultTokenKey);
      setVaultState((current) => ({ ...current, isUnlocked: false }));
      return null;
    } finally {
      setVaultActionLoading(false);
    }
  };

  const handleAddSavings = async (payload) =>
    withVaultAction((storedVaultToken) => vaultApi.add(payload, token, storedVaultToken));

  const handleWithdrawSavings = async (payload) =>
    withVaultAction((storedVaultToken) =>
      vaultApi.withdraw(payload, token, storedVaultToken)
    );

  const openVaultPage = () => {
    resetVaultFeedback();
    navigateTo("/vault");
  };

  const returnToDashboard = () => {
    navigateTo("/");
  };

  const openAuthSection = (mode) => {
    setAuthMode(mode);
    window.requestAnimationFrame(() => {
      authSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  };

  return (
    <main className="app-shell">
      <div className="background-orb background-orb-one" />
      <div className="background-orb background-orb-two" />

      {isAuthenticated && message ? <div className="feedback success">{message}</div> : null}
      {isAuthenticated && error ? <div className="feedback error">{error}</div> : null}
      {isAuthenticated && isVaultPage ? (
        <VaultPage
          vaultState={vaultState}
          vaultLoading={vaultLoading}
          vaultActionLoading={vaultActionLoading}
          vaultMessage={vaultMessage}
          vaultError={vaultError}
          onBack={returnToDashboard}
          onCreateVault={handleCreateVault}
          onVerifyVault={handleVerifyVault}
          onAddSavings={handleAddSavings}
          onWithdrawSavings={handleWithdrawSavings}
        />
      ) : isAuthenticated ? (
        <Dashboard
          user={user}
          summary={summary}
          transactions={filteredTransactions}
          allTransactions={transactions}
          transactionForm={transactionForm}
          transactionFilters={transactionFilters}
          onTransactionChange={handleTransactionChange}
          onTransactionFilterChange={handleTransactionFilterChange}
          onClearTransactionFilters={clearTransactionFilters}
          onTransactionSubmit={handleTransactionSubmit}
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onCancelEdit={handleCancelEdit}
          transactionLoading={transactionLoading}
          deletingId={deletingId}
          editingId={editingId}
          onLogout={handleLogout}
          onOpenVault={openVaultPage}
          subscriptions={subscriptions}
          subscriptionSummary={subscriptionSummary}
          subscriptionLoading={subscriptionLoading}
          subscriptionFormLoading={subscriptionFormLoading}
          subscriptionMessage={subscriptionMessage}
          subscriptionError={subscriptionError}
          onDismissSubscriptionFeedback={resetSubscriptionFeedback}
          onCreateSubscription={handleCreateSubscription}
          onUpdateSubscription={handleUpdateSubscription}
          onDeleteSubscription={handleDeleteSubscription}
          analyticsRange={analyticsRange}
          onAnalyticsRangeChange={handleAnalyticsRangeChange}
          analyticsLoading={analyticsLoading}
          analyticsError={analyticsError}
          analyticsSummary={analyticsSummary}
          analyticsMonthly={analyticsMonthly}
          analyticsCategories={analyticsCategories}
        />
      ) : (
        <>
          <LandingPage
            onLoginClick={() => openAuthSection("login")}
            onSignupClick={() => openAuthSection("signup")}
          />

          <div className="auth-layout auth-layout-compact" ref={authSectionRef}>
            <AuthForm
              mode={authMode}
              form={authForm}
              onChange={handleAuthChange}
              onSubmit={handleAuthSubmit}
              loading={authLoading}
              message={message}
              error={error}
              onDismissFeedback={resetFeedback}
              onToggleMode={() =>
                setAuthMode((current) =>
                  current === "signup" ? "login" : "signup"
                )
              }
            />

            <section className="panel demo-panel">
              <span className="eyebrow">Demo Mode</span>
              <h3>Preview the dashboard before logging in.</h3>
              <p>
                Non-logged users can explore the UI, but transaction management is
                protected until authentication succeeds.
              </p>
              <div className="demo-list">
                {demoTransactions.map((transaction) => (
                  <article className="demo-item" key={transaction._id}>
                    <strong>{transaction.category}</strong>
                    <span>{transaction.description}</span>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </main>
  );
}

export default App;
