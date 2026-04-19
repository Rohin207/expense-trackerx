const categories = [
  "Food",
  "Travel",
  "Bills",
  "Shopping",
  "Salary",
  "Health",
  "Education",
  "Entertainment",
  "Other"
];

export const TransactionForm = ({
  form,
  onChange,
  onSubmit,
  onCancelEdit,
  loading,
  editingId
}) => (
  <section className="panel">
    <div className="panel-heading">
      <div>
        <span className="eyebrow">Transactions</span>
        <h3>{editingId ? "Edit transaction" : "Add a new transaction"}</h3>
      </div>
      {editingId ? (
        <button className="ghost-button" type="button" onClick={onCancelEdit}>
          Cancel edit
        </button>
      ) : null}
    </div>

    <form className="transaction-form" onSubmit={onSubmit}>
      <label>
        Amount
        <input
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="2500"
          value={form.amount}
          onChange={onChange}
          required
        />
      </label>

      <label>
        Type
        <select name="type" value={form.type} onChange={onChange}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </label>

      <label>
        Category
        <select name="category" value={form.category} onChange={onChange}>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label>
        Date
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={onChange}
          required
        />
      </label>

      <label className="full-width">
        Description
        <textarea
          name="description"
          rows="4"
          placeholder="Dinner with clients, monthly rent, flight tickets..."
          value={form.description}
          onChange={onChange}
        />
      </label>

      <button className="primary-button" type="submit" disabled={loading}>
        {loading
          ? "Saving..."
          : editingId
            ? "Update Transaction"
            : "Add Transaction"}
      </button>
    </form>
  </section>
);
