export const VaultTeaser = ({ hasVault, onOpen }) => (
  <section className="vault-teaser">
    <div className="vault-visual" aria-hidden="true">
      <div className="vault-door" />
      <div className="vault-ring" />
      <div className="vault-handle" />
    </div>

    <div className="vault-teaser-copy">
      <span className="eyebrow">Savings Vault</span>
      <h3>{hasVault ? "Your protected savings space is ready." : "Create a secure savings vault."}</h3>
      <p>
        Save money separately from daily transactions, protect access with a PIN,
        and track progress toward your savings goal.
      </p>
      <button className="primary-button" type="button" onClick={onOpen}>
        {hasVault ? "Open Vault" : "Create Vault"}
      </button>
    </div>
  </section>
);
