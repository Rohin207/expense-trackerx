const defaultSignup = {
  name: "",
  email: "",
  age: "",
  password: ""
};

const defaultLogin = {
  email: "",
  password: ""
};

export const AuthForm = ({
  mode,
  form,
  onChange,
  onSubmit,
  loading,
  onToggleMode,
  message,
  error,
  onDismissFeedback
}) => {
  const isSignup = mode === "signup";

  return (
    <section className="auth-card">
      <div className="auth-copy">
        <span className="eyebrow">Expense Tracker X</span>
        <h1>Track every rupee with confidence.</h1>
        <p>
          A clean finance dashboard for secure personal expense tracking, monthly
          summaries, and transaction history.
        </p>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        {(message || error) && (
          <div className={`auth-popup ${error ? "auth-popup-error" : "auth-popup-success"}`}>
            <div>
              <strong>{error ? "Please check this" : "Success"}</strong>
              <p>{error || message}</p>
            </div>
            <button
              className="auth-popup-close"
              type="button"
              onClick={onDismissFeedback}
              aria-label="Dismiss message"
            >
              x
            </button>
          </div>
        )}

        <div>
          <h2>{isSignup ? "Create your account" : "Welcome back"}</h2>
          <p>
            {isSignup
              ? "Set up your account to start tracking income and expenses."
              : "Log in to view your dashboard and manage transactions."}
          </p>
        </div>

        {isSignup && (
          <>
            <label>
              Full Name
              <input
                name="name"
                type="text"
                placeholder="Akhil"
                value={form.name ?? defaultSignup.name}
                onChange={onChange}
                required
              />
            </label>

            <label>
              Age
              <input
                name="age"
                type="number"
                min="13"
                max="120"
                placeholder="22"
                value={form.age ?? defaultSignup.age}
                onChange={onChange}
                required
              />
            </label>
          </>
        )}

        <label>
          Email
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email ?? defaultLogin.email}
            onChange={onChange}
            required
          />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            placeholder="Minimum 8 characters"
            value={form.password ?? defaultLogin.password}
            onChange={onChange}
            minLength={8}
            required
          />
        </label>

        <button className="primary-button" type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : isSignup
              ? "Create Account"
              : "Log In"}
        </button>

        <p className="auth-switch">
          {isSignup ? "Already have an account?" : "Need a new account?"}
          <button type="button" onClick={onToggleMode}>
            {isSignup ? "Log in" : "Sign up"}
          </button>
        </p>
      </form>
    </section>
  );
};
