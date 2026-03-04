import { useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY || 'admin-secret-key';

export function useApi() {
  const request = useCallback(
    async (path, options = {}) => {
      const headers = {
        'Content-Type': 'application/json',
        'X-Admin-Key': ADMIN_API_KEY,
        ...options.headers,
      };

      const res = await fetch(`${API_URL}${path}`, { ...options, headers });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      return res.json();
    },
    []
  );

  const get = useCallback((path) => request(path), [request]);
  const post = useCallback(
    (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
    [request]
  );
  const put = useCallback(
    (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
    [request]
  );
  const del = useCallback(
    (path) => request(path, { method: 'DELETE' }),
    [request]
  );

  return { get, post, put, del, request };
}
