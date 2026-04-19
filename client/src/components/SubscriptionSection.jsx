import React from "react";
import appleMusicLogo from "../assests/logos/apple-music.png";
import disneyHotstarLogo from "../assests/logos/disney-hotstar.png";
import sonyLivLogo from "../assests/logos/sony-LIV.png";
import zeeTvLogo from "../assests/logos/zee-tv.png";

const expenseTrackerLogo =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#8B5CF6"/>
          <stop offset="100%" stop-color="#22D3EE"/>
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="24" fill="#0B0F19"/>
      <rect x="10" y="10" width="76" height="76" rx="18" fill="url(#g)" opacity="0.18"/>
      <path d="M28 34h40v8H28zm0 20h28v8H28z" fill="#F1F5F9"/>
      <circle cx="64" cy="58" r="10" fill="url(#g)"/>
    </svg>
  `);

const predefinedSubscriptions = [
  {
    name: "Netflix",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    category: "Subscription"
  },
  {
    name: "Amazon Prime Video",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png",
    category: "Subscription"
  },
  {
    name: "Disney+ Hotstar",
    logo: disneyHotstarLogo,
    category: "Subscription"
  },
  {
    name: "Spotify",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
    category: "Subscription"
  },
  {
    name: "YouTube Premium",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png",
    category: "Subscription"
  },
  {
    name: "YouTube Music",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Youtube_Music_icon.svg",
    category: "Subscription"
  },
  {
    name: "ChatGPT",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    category: "Subscription"
  },
  {
    name: "Apple Music",
    logo: appleMusicLogo,
    category: "Subscription"
  },
  {
    name: "Zee5",
    logo: zeeTvLogo,
    category: "Subscription"
  },
  {
    name: "SonyLIV",
    logo: sonyLivLogo,
    category: "Subscription"
  }
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

const defaultForm = {
  name: "",
  logo: "",
  monthlyAmount: "",
  startDate: new Date().toISOString().split("T")[0],
  isActive: true,
  customName: "",
  customLogo: ""
};

export const SubscriptionSection = ({
  subscriptions,
  summary,
  loading,
  formLoading,
  message,
  error,
  onDismissFeedback,
  onCreate,
  onUpdate,
  onDelete
}) => {
  const [selectedService, setSelectedService] = React.useState(null);
  const [showForm, setShowForm] = React.useState(false);
  const [editingSubscription, setEditingSubscription] = React.useState(null);
  const [form, setForm] = React.useState(defaultForm);

  const openCreateForm = () => {
    setEditingSubscription(null);
    setSelectedService(null);
    setForm(defaultForm);
    setShowForm(true);
  };

  const openEditForm = (subscription) => {
    setEditingSubscription(subscription);
    setSelectedService({
      name: subscription.name,
      logo: subscription.logo
    });
    setForm({
      ...defaultForm,
      name: subscription.name,
      logo: subscription.logo,
      monthlyAmount: String(subscription.monthlyAmount),
      startDate: new Date(subscription.startDate).toISOString().split("T")[0],
      isActive: subscription.isActive
    });
    setShowForm(true);
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setForm((current) => ({
      ...current,
      name: service.name,
      logo: service.logo
    }));
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload =
      selectedService?.name === "Custom"
        ? {
            name: form.customName,
            logo: form.customLogo || expenseTrackerLogo,
            monthlyAmount: form.monthlyAmount,
            startDate: form.startDate,
            isActive: form.isActive
          }
        : {
            name: form.name,
            logo: form.logo,
            monthlyAmount: form.monthlyAmount,
            startDate: form.startDate,
            isActive: form.isActive
          };

    const result = editingSubscription
      ? await onUpdate(editingSubscription._id, payload)
      : await onCreate(payload);

    if (result) {
      setShowForm(false);
      setEditingSubscription(null);
      setSelectedService(null);
      setForm(defaultForm);
    }
  };

  return (
    <section className="subscription-panel panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Subscription Manager</span>
          <h3>Your recurring services</h3>
        </div>
        <div className="subscription-header-actions">
          <span className="muted-text">
            Total monthly cost: {formatCurrency(summary.activeMonthlyCost)}
          </span>
          <button className="primary-button" type="button" onClick={openCreateForm}>
            + Add Subscription
          </button>
        </div>
      </div>

      {(message || error) && (
        <div className={`auth-popup ${error ? "auth-popup-error" : "auth-popup-success"}`}>
          <div>
            <strong>{error ? "Subscription Issue" : "Subscription Updated"}</strong>
            <p>{error || message}</p>
          </div>
          <button className="auth-popup-close" type="button" onClick={onDismissFeedback}>
            x
          </button>
        </div>
      )}

      {showForm && (
        <div className="subscription-form-shell">
          <div className="subscription-grid">
            {predefinedSubscriptions.map((service) => (
              <button
                key={service.name}
                type="button"
                className={`subscription-option ${
                  selectedService?.name === service.name ? "selected" : ""
                }`}
                onClick={() => handleServiceSelect(service)}
              >
                <img src={service.logo} alt={service.name} />
                <span>{service.name}</span>
              </button>
            ))}

            <button
              type="button"
              className={`subscription-option ${
                selectedService?.name === "Custom" ? "selected" : ""
              }`}
              onClick={() => handleServiceSelect({ name: "Custom", logo: "" })}
            >
              <span className="subscription-custom-plus">+</span>
              <span>Custom</span>
            </button>
          </div>

          <form className="subscription-form" onSubmit={handleSubmit}>
            {selectedService?.name === "Custom" ? (
              <>
                <label>
                  Custom Name
                  <input
                    name="customName"
                    value={form.customName}
                    onChange={handleInputChange}
                    placeholder="Figma Pro"
                    required
                  />
                </label>

                <label>
                  Logo URL
                  <input
                    name="customLogo"
                    value={form.customLogo}
                    onChange={handleInputChange}
                    placeholder="Optional: https://..."
                  />
                </label>
              </>
            ) : null}

            <label>
              Monthly Amount
              <input
                name="monthlyAmount"
                type="number"
                min="0.01"
                step="0.01"
                value={form.monthlyAmount}
                onChange={handleInputChange}
                placeholder="199"
                required
              />
            </label>

            <label>
              Start Date
              <input
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleInputChange}
                required
              />
            </label>

            <label className="subscription-checkbox">
              <input
                name="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={handleInputChange}
              />
              Active subscription
            </label>

            <div className="subscription-form-actions">
              <button className="primary-button" type="submit" disabled={formLoading}>
                {formLoading
                  ? "Saving..."
                  : editingSubscription
                    ? "Update Subscription"
                    : "Save Subscription"}
              </button>
              <button
                className="ghost-button"
                type="button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          <p>Loading subscriptions...</p>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="empty-state">
          <p>No subscriptions added yet. Start by adding your first recurring service.</p>
        </div>
      ) : (
        <div className="subscription-card-grid">
          {subscriptions.map((subscription) => (
            <article className="subscription-card" key={subscription._id}>
              <div className="subscription-card-top">
                <img src={subscription.logo} alt={subscription.name} />
                <details className="subscription-menu">
                  <summary>...</summary>
                  <div className="subscription-menu-list">
                    <button type="button" onClick={() => openEditForm(subscription)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => onDelete(subscription._id)}>
                      Delete
                    </button>
                  </div>
                </details>
              </div>
              <h4>{subscription.name}</h4>
              <strong>{formatCurrency(subscription.monthlyAmount)}</strong>
              <small>Start date: {formatDate(subscription.startDate)}</small>
              <small>Next billing: {formatDate(subscription.nextBillingDate)}</small>
              <p>This amount will be added to your monthly expenses.</p>
              {!subscription.isActive ? <span className="pill expense">Inactive</span> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
