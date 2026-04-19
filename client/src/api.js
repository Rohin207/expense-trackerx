const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const request = async (path, options = {}) => {
  const { token, headers, ...restOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    ...restOptions
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
};

export const authApi = {
  signup: (payload) =>
    request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    })
};

export const transactionsApi = {
  getAll: (token) =>
    request("/transactions/get", {
      method: "GET",
      token
    }),
  add: (payload, token) =>
    request("/transactions/add", {
      method: "POST",
      body: JSON.stringify(payload),
      token
    }),
  update: (id, payload, token) =>
    request(`/transactions/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      token
    }),
  delete: (id, token) =>
    request(`/transactions/delete/${id}`, {
      method: "DELETE",
      token
    })
};

export const vaultApi = {
  create: (payload, token) =>
    request("/vault/create", {
      method: "POST",
      body: JSON.stringify(payload),
      token
    }),
  verifyPin: (payload, token) =>
    request("/vault/verify-pin", {
      method: "POST",
      body: JSON.stringify(payload),
      token
    }),
  getData: (token, vaultToken) =>
    request("/vault/data", {
      method: "GET",
      token,
      headers: {
        "x-vault-token": vaultToken
      }
    }),
  add: (payload, token, vaultToken) =>
    request("/vault/add", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
      headers: {
        "x-vault-token": vaultToken
      }
    }),
  withdraw: (payload, token, vaultToken) =>
    request("/vault/withdraw", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
      headers: {
        "x-vault-token": vaultToken
      }
    })
};

export const subscriptionsApi = {
  getAll: (token) =>
    request("/subscriptions", {
      method: "GET",
      token
    }),
  create: (payload, token) =>
    request("/subscriptions", {
      method: "POST",
      body: JSON.stringify(payload),
      token
    }),
  update: (id, payload, token) =>
    request(`/subscriptions/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      token
    }),
  delete: (id, token) =>
    request(`/subscriptions/${id}`, {
      method: "DELETE",
      token
    })
};

export const analyticsApi = {
  getSummary: (range, token) =>
    request(`/analytics/summary?range=${range}`, {
      method: "GET",
      token
    }),
  getMonthly: (range, token) =>
    request(`/analytics/monthly?range=${range}`, {
      method: "GET",
      token
    }),
  getCategories: (range, token) =>
    request(`/analytics/categories?range=${range}`, {
      method: "GET",
      token
    })
};
