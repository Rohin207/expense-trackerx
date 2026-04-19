export const LandingPage = ({ onLoginClick, onSignupClick }) => (
  <section className="landing-shell">
    <div className="landing-glow landing-glow-primary" />
    <div className="landing-glow landing-glow-secondary" />
    <div className="landing-overlay" />

    <div className="landing-content">
      <span className="landing-kicker">Welcome to</span>
      <h1 className="landing-title">Expense Tracker X</h1>
      <p className="landing-subtitle">
        Manage your finances with clarity and control.
      </p>

      <div className="landing-actions">
        <button
          className="landing-button landing-button-login"
          type="button"
          onClick={onLoginClick}
        >
          Login
        </button>
        <button
          className="landing-button landing-button-signup"
          type="button"
          onClick={onSignupClick}
        >
          Sign Up
        </button>
      </div>
    </div>
  </section>
);
