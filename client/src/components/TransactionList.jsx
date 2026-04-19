const categories = [
  "all",
  "Food",
  "Travel",
  "Bills",
  "Shopping",
  "Salary",
  "Health",
  "Education",
  "Entertainment",
  "Other",
  "Vault Transfer",
  "Vault Withdrawal",
  "Subscription"
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(value || 0);

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));

export const TransactionList = ({
  transactions,
  allTransactions,
  filters,
  onFilterChange,
  onClearFilters,
  onEdit,
  onDelete,
  deletingId
}) => (
  <section className="panel">
    <div className="panel-heading">
      <div>
        <span className="eyebrow">History</span>
        <h3>Transaction history</h3>
      </div>
      <span className="muted-text">
        {transactions.length} of {allTransactions.length} records
      </span>
    </div>

    <div className="transaction-filter-grid">
      <label className="transaction-filter-field full-width">
        Search Description
        <input
          name="query"
          type="text"
          placeholder="Search any word..."
          value={filters.query}
          onChange={onFilterChange}
        />
      </label>

      <label className="transaction-filter-field">
        Category
        <select name="category" value={filters.category} onChange={onFilterChange}>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "all" ? "All Categories" : category}
            </option>
          ))}
        </select>
      </label>

      <label className="transaction-filter-field">
        Type
        <select name="type" value={filters.type} onChange={onFilterChange}>
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </label>

      <label className="transaction-filter-field">
        Date
        <input name="date" type="date" value={filters.date} onChange={onFilterChange} />
      </label>

      <button className="ghost-button transaction-filter-reset" type="button" onClick={onClearFilters}>
        Clear Filters
      </button>
    </div>

    {transactions.length === 0 ? (
      <div className="empty-state">
        <p>
          {allTransactions.length === 0
            ? "No transactions yet. Add your first income or expense to begin."
            : "No transactions match the current filters."}
        </p>
      </div>
    ) : (
      <div className="transaction-list">
        {transactions.map((transaction) => (
          <article className="transaction-item" key={transaction._id}>
            <div>
              <div className="transaction-title-row">
                <strong>{transaction.category}</strong>
                <span className={`pill ${transaction.type}`}>
                  {transaction.type}
                </span>
              </div>
              <p>{transaction.description || "No description provided."}</p>
              <small>{formatDate(transaction.date)}</small>
            </div>

            <div className="transaction-actions">
              <strong
                className={
                  transaction.type === "income" ? "income-text" : "expense-text"
                }
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </strong>
              <div>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => onEdit(transaction)}
                >
                  Edit
                </button>
                <button
                  className="danger-button"
                  type="button"
                  onClick={() => onDelete(transaction._id)}
                  disabled={deletingId === transaction._id}
                >
                  {deletingId === transaction._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    )}
  </section>
);
