import { useState } from "react";

const initialCreateForm = {
  pin: "",
  confirmPin: "",
  savingsGoal: ""
};

const initialAccessForm = {
  pin: ""
};

const initialActionForm = {
  amount: "",
  savingsGoal: ""
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(value || 0);

export const VaultPage = ({
  vaultState,
  vaultLoading,
  vaultActionLoading,
  vaultMessage,
  vaultError,
  onBack,
  onCreateVault,
  onVerifyVault,
  onAddSavings,
  onWithdrawSavings
}) => {
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [accessForm, setAccessForm] = useState(initialAccessForm);
  const [actionForm, setActionForm] = useState(initialActionForm);

  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((current) => ({ ...current, [name]: value }));
  };

  const handleAccessChange = (event) => {
    const { name, value } = event.target;
    setAccessForm((current) => ({ ...current, [name]: value }));
  };

  const handleActionChange = (event) => {
    const { name, value } = event.target;
    setActionForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    const result = await onCreateVault(createForm);

    if (result) {
      setCreateForm(initialCreateForm);
      setActionForm({
        amount: "",
        savingsGoal: result.savingsGoal ? String(result.savingsGoal) : ""
      });
    }
  };

  const handleVerifySubmit = async (event) => {
    event.preventDefault();
    const result = await onVerifyVault(accessForm.pin);

    if (result) {
      setAccessForm(initialAccessForm);
      setActionForm({
        amount: "",
        savingsGoal: result.savingsGoal ? String(result.savingsGoal) : ""
      });
    }
  };

  const handleAddSubmit = async (event) => {
    event.preventDefault();
    const result = await onAddSavings(actionForm);

    if (result) {
      setActionForm((current) => ({
        ...current,
        amount: "",
        savingsGoal: result.savingsGoal ? String(result.savingsGoal) : ""
      }));
    }
  };

  const handleWithdrawSubmit = async (event) => {
    event.preventDefault();
    const result = await onWithdrawSavings(actionForm);

    if (result) {
      setActionForm((current) => ({
        ...current,
        amount: "",
        savingsGoal: result.savingsGoal ? String(result.savingsGoal) : ""
      }));
    }
  };

  const progressWidth = `${vaultState.progressPercentage || 0}%`;

  return (
    <section className="vault-page">
      <div className="vault-page-header">
        <button className="ghost-button" type="button" onClick={onBack}>
          Back to Dashboard
        </button>
        <span className="eyebrow">Secure Vault</span>
      </div>

      {(vaultMessage || vaultError) && (
        <div className={`auth-popup ${vaultError ? "auth-popup-error" : "auth-popup-success"}`}>
          <div>
            <strong>{vaultError ? "Vault Alert" : "Vault Updated"}</strong>
            <p>{vaultError || vaultMessage}</p>
          </div>
        </div>
      )}

      {!vaultState.hasVault ? (
        <div className="vault-layout">
          <section className="vault-card">
            <span className="eyebrow">Create Vault</span>
            <h1>Set up your private savings vault</h1>
            <p>Protect your savings with a 4-digit PIN and optionally set a savings goal.</p>

            <form className="vault-form" onSubmit={handleCreateSubmit}>
              <label>
                4-Digit PIN
                <input
                  name="pin"
                  type="password"
                  inputMode="numeric"
                  maxLength="4"
                  placeholder="1234"
                  value={createForm.pin}
                  onChange={handleCreateChange}
                  required
                />
              </label>

              <label>
                Confirm PIN
                <input
                  name="confirmPin"
                  type="password"
                  inputMode="numeric"
                  maxLength="4"
                  placeholder="1234"
                  value={createForm.confirmPin}
                  onChange={handleCreateChange}
                  required
                />
              </label>

              <label>
                Savings Goal
                <input
                  name="savingsGoal"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="50000"
                  value={createForm.savingsGoal}
                  onChange={handleCreateChange}
                />
              </label>

              <button className="primary-button" type="submit" disabled={vaultLoading}>
                {vaultLoading ? "Creating..." : "Create Vault"}
              </button>
            </form>
          </section>
        </div>
      ) : !vaultState.isUnlocked ? (
        <div className="vault-layout">
          <section className="vault-card">
            <span className="eyebrow">Open Vault</span>
            <h1>Enter your vault PIN</h1>
            <p>Your vault is protected separately from the main app session.</p>

            <form className="vault-form" onSubmit={handleVerifySubmit}>
              <label>
                Vault PIN
                <input
                  name="pin"
                  type="password"
                  inputMode="numeric"
                  maxLength="4"
                  placeholder="1234"
                  value={accessForm.pin}
                  onChange={handleAccessChange}
                  required
                />
              </label>

              <button className="primary-button" type="submit" disabled={vaultLoading}>
                {vaultLoading ? "Verifying..." : "Unlock Vault"}
              </button>
            </form>
          </section>
        </div>
      ) : (
        <div className="vault-layout vault-layout-wide">
          <section className="vault-card">
            <span className="eyebrow">Vault Dashboard</span>
            <h1>{formatCurrency(vaultState.savingsBalance)}</h1>
            <p>Your protected savings balance.</p>

            <div className="vault-progress-card">
              <div className="vault-progress-row">
                <span>Goal</span>
                <strong>{formatCurrency(vaultState.savingsGoal)}</strong>
              </div>
              <div className="vault-progress-track">
                <div className="vault-progress-fill" style={{ width: progressWidth }} />
              </div>
              <small>{vaultState.progressPercentage || 0}% of your goal reached</small>
            </div>
          </section>

          <section className="vault-card">
            <span className="eyebrow">Manage Savings</span>
            <h2>Move funds in or out</h2>

            <form className="vault-form" onSubmit={handleAddSubmit}>
              <label>
                Amount to Add
                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="2500"
                  value={actionForm.amount}
                  onChange={handleActionChange}
                  required
                />
              </label>

              <label>
                Savings Goal
                <input
                  name="savingsGoal"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="50000"
                  value={actionForm.savingsGoal}
                  onChange={handleActionChange}
                />
              </label>

              <div className="vault-button-row">
                <button className="primary-button" type="submit" disabled={vaultActionLoading}>
                  {vaultActionLoading ? "Working..." : "Add to Savings"}
                </button>
                <button
                  className="ghost-button"
                  type="button"
                  disabled={vaultActionLoading}
                  onClick={handleWithdrawSubmit}
                >
                  Withdraw from Savings
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
};
