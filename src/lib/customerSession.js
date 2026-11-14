import { apiRequest } from "./api.js";

const TOKEN_KEY = "ayu-customer-token";

export function getCustomerToken() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function hasCustomerSession() {
  return Boolean(getCustomerToken());
}

export function saveCustomerToken(token) {
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
    throw new Error("The sign-in response did not contain a valid customer session.");
  }
  window.sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearCustomerToken() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(TOKEN_KEY);
  }
}

export async function customerApiRequest(path, options = {}) {
  const token = getCustomerToken();
  if (!token) throw new Error("Sign in to continue.");

  try {
    return await apiRequest(path, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    if (error.status === 401) clearCustomerToken();
    throw error;
  }
}
