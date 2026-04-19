import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const COLORS = {
  income: "#22C55E",
  expense: "#EF4444",
  savings: "#8B5CF6",
  subscriptions: "#22D3EE"
};

const PIE_COLORS = ["#22C55E", "#EF4444", "#8B5CF6", "#22D3EE", "#F59E0B"];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);

const ranges = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "6m", label: "Last 6 months" }
];

export const AnalyticsSection = ({
  range,
  onRangeChange,
  loading,
  error,
  summary,
  monthly,
  categories
}) => {
  const donutData = [
    { name: "Savings", value: summary.totalSavings || 0 },
    { name: "Expenses", value: summary.totalExpense || 0 }
  ];

  return (
    <section className="analytics-shell panel">
      <div className="panel-heading analytics-heading">
        <div>
          <span className="eyebrow">Analytics</span>
          <h3>Financial insights and trends</h3>
        </div>
        <label className="analytics-range-field">
          Range
          <select value={range} onChange={(event) => onRangeChange(event.target.value)}>
            {ranges.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <div className="empty-state">
          <p>Loading analytics...</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <p>{error}</p>
        </div>
      ) : monthly.length === 0 ? (
        <div className="empty-state">
          <p>No analytics data available for the selected range yet.</p>
        </div>
      ) : (
        <>
          <div className="analytics-card-grid">
            <article className="analytics-card">
              <span>Total Balance</span>
              <strong>{formatCurrency(summary.netBalance)}</strong>
            </article>
            <article className="analytics-card income">
              <span>Income</span>
              <strong>{formatCurrency(summary.totalIncome)}</strong>
            </article>
            <article className="analytics-card expense">
              <span>Expense</span>
              <strong>{formatCurrency(summary.totalExpense)}</strong>
            </article>
            <article className="analytics-card savings">
              <span>Savings</span>
              <strong>{formatCurrency(summary.totalSavings)}</strong>
            </article>
          </div>

          <div className="analytics-insight-row">
            <div className="analytics-insight">
              <span>Top spending category</span>
              <strong>{summary.topSpendingCategory}</strong>
            </div>
            <div className="analytics-insight">
              <span>Highest expense month</span>
              <strong>{summary.highestExpenseMonth}</strong>
            </div>
            <div className="analytics-insight">
              <span>Average monthly spending</span>
              <strong>{formatCurrency(summary.averageMonthlySpending)}</strong>
            </div>
            <div className="analytics-insight">
              <span>Subscription expenses</span>
              <strong>{formatCurrency(summary.subscriptionExpense)}</strong>
            </div>
          </div>

          <div className="chart-panel chart-panel-wide">
            <div className="chart-title-row">
              <h4>Monthly trend</h4>
              <small>Income vs expense over time</small>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={monthly}>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke={COLORS.income}
                  strokeWidth={3}
                  dot={false}
                  name="Income"
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke={COLORS.expense}
                  strokeWidth={3}
                  dot={false}
                  name="Expense"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="analytics-chart-grid">
            <div className="chart-panel">
              <div className="chart-title-row">
                <h4>Category breakdown</h4>
                <small>Expense distribution by category</small>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Pie
                    data={categories}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                  >
                    {categories.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-panel">
              <div className="chart-title-row">
                <h4>Monthly comparison</h4>
                <small>Side-by-side income and expense</small>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={monthly}>
                  <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="income" fill={COLORS.income} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expense" fill={COLORS.expense} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-panel">
            <div className="chart-title-row">
              <h4>Savings vs expenses</h4>
              <small>Current protected savings compared with expenses</small>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={75}
                  outerRadius={110}
                  paddingAngle={4}
                >
                  <Cell fill={COLORS.savings} />
                  <Cell fill={COLORS.expense} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  );
};