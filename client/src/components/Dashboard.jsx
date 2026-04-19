import { AnalyticsSection } from "./AnalyticsSection.jsx";
import { SummaryCards } from "./SummaryCards.jsx";
import { TransactionForm } from "./TransactionForm.jsx";
import { TransactionList } from "./TransactionList.jsx";
import { SubscriptionSection } from "./DashboardSubscriptions.jsx";
import { VaultTeaser } from "./VaultTeaser.jsx";

export const Dashboard = ({
  user,
  summary,
  transactions,
  allTransactions,
  transactionForm,
  transactionFilters,
  onTransactionChange,
  onTransactionFilterChange,
  onClearTransactionFilters,
  onTransactionSubmit,
  onEditTransaction,
  onDeleteTransaction,
  onCancelEdit,
  transactionLoading,
  deletingId,
  editingId,
  onLogout,
  onOpenVault,
  subscriptions,
  subscriptionSummary,
  subscriptionLoading,
  subscriptionFormLoading,
  subscriptionMessage,
  subscriptionError,
  onDismissSubscriptionFeedback,
  onCreateSubscription,
  onUpdateSubscription,
  onDeleteSubscription,
  analyticsRange,
  onAnalyticsRangeChange,
  analyticsLoading,
  analyticsError,
  analyticsSummary,
  analyticsMonthly,
  analyticsCategories
}) => (
  <div className="dashboard-shell">
    <header className="dashboard-header">
      <div>
        <span className="eyebrow">Secure Dashboard</span>
        <h1>Welcome back, {user.name}</h1>
        <p>
          Track income, control spending, and review your monthly performance in
          one place.
        </p>
      </div>

      <div className="header-actions">
        <div className="user-badge">
          <span>{user.email}</span>
          <small>Encoded: {user.emailBase64}</small>
        </div>
        <button className="ghost-button" type="button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>

    <SummaryCards summary={summary} />

    <section className="content-grid">
      <TransactionForm
        form={transactionForm}
        onChange={onTransactionChange}
        onSubmit={onTransactionSubmit}
        onCancelEdit={onCancelEdit}
        loading={transactionLoading}
        editingId={editingId}
      />

      <TransactionList
        transactions={transactions}
        allTransactions={allTransactions}
        filters={transactionFilters}
        onFilterChange={onTransactionFilterChange}
        onClearFilters={onClearTransactionFilters}
        onEdit={onEditTransaction}
        onDelete={onDeleteTransaction}
        deletingId={deletingId}
      />
    </section>

    <VaultTeaser hasVault={user.hasVault} onOpen={onOpenVault} />

    <SubscriptionSection
      subscriptions={subscriptions}
      summary={subscriptionSummary}
      loading={subscriptionLoading}
      formLoading={subscriptionFormLoading}
      message={subscriptionMessage}
      error={subscriptionError}
      onDismissFeedback={onDismissSubscriptionFeedback}
      onCreate={onCreateSubscription}
      onUpdate={onUpdateSubscription}
      onDelete={onDeleteSubscription}
    />

    <AnalyticsSection
      range={analyticsRange}
      onRangeChange={onAnalyticsRangeChange}
      loading={analyticsLoading}
      error={analyticsError}
      summary={analyticsSummary}
      monthly={analyticsMonthly}
      categories={analyticsCategories}
    />
  </div>
);
