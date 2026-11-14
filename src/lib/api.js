const DEFAULT_API_BASE_URL = 'https://thehillston.com/Ayuveera/Backend/api';

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, '');

export function resolveProductImage(image) {
  if (typeof image !== 'string' || image.trim() === '') return '';

  const path = image.trim();
  if (/^(?:https?:\/\/|data:|blob:)/i.test(path)) return path;
  if (!/^\/?uploads\/products\//i.test(path)) return path;

  const backendBaseUrl = API_BASE_URL.replace(/\/api\/?$/i, '');
  return new URL(path.replace(/^\/+/, ''), `${backendBaseUrl}/`).href;
}

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
    const error = new Error(result?.error || `Request failed with status ${response.status}.`);
    error.status = response.status;
    throw error;
  }

  return result?.data;
}
