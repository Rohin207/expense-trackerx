export const SummaryCards = ({ summary }) => {
  const cards = [
    {
      label: "Total Balance",
      value: summary.totalBalance,
      tone: "balance"
    },
    {
      label: "Total Income",
      value: summary.totalIncome,
      tone: "income"
    },
    {
      label: "Total Expense",
      value: summary.totalExpense,
      tone: "expense"
    },
    {
      label: summary.monthlySummary.label,
      value: summary.monthlySummary.balance,
      tone: "monthly",
      caption: `Income ${formatCurrency(summary.monthlySummary.income)} | Expense ${formatCurrency(summary.monthlySummary.expense)}`
    }
  ];

  return (
    <section className="summary-grid">
      {cards.map((card) => (
        <article className={`summary-card ${card.tone}`} key={card.label}>
          <span>{card.label}</span>
          <strong>{formatCurrency(card.value)}</strong>
          {card.caption ? <small>{card.caption}</small> : null}
        </article>
      ))}
    </section>
  );
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(value || 0);
