import { useCallback } from 'react';
import { supabase } from '../config/supabase';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function useApi() {
  const request = useCallback(
    async (path, options = {}) => {
      // Always get the freshest token from Supabase
      const { data: { session } } = await supabase.auth.getSession();

      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

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
