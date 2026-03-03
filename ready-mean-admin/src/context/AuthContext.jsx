import { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext(null);

const GATE_PASSWORD = import.meta.env.VITE_GATE_PASSWORD || 'admin123';
const API_URL = import.meta.env.VITE_API_URL || '/api';

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [gateUnlocked, setGateUnlocked] = useState(
    () => sessionStorage.getItem('admin_gate') === 'unlocked'
  );

  const unlockGate = async (password) => {
    if (password !== GATE_PASSWORD) {
      throw new Error('Incorrect password');
    }
    sessionStorage.setItem('admin_gate', 'unlocked');
    setGateUnlocked(true);
  };

  const signOut = () => {
    sessionStorage.removeItem('admin_gate');
    setGateUnlocked(false);
  };

  // Helper for admin API calls (no auth token needed — admin routes will need updating)
  const apiRequest = useCallback(async (path, options = {}) => {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }, []);

  const value = {
    loading,
    isAuthenticated: gateUnlocked,
    gateUnlocked,
    unlockGate,
    signOut,
    apiRequest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
