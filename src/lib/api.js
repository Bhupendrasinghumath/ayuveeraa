export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export async function apiRequest(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('Backend is not configured. Set VITE_API_BASE_URL and rebuild the app.');
  }

  const response = await fetch(`${API_BASE_URL}/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.error || `Request failed with status ${response.status}.`);
  }

  return result?.data;
}
