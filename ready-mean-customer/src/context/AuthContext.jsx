import { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (accessToken) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
    return null;
  }, []);

  const autoSaveProfile = useCallback(async (accessToken, metadata) => {
    try {
      const profileData = {
        name: metadata.name || metadata.full_name,
        mobile: metadata.mobile || null,
        role: 'customer',
      };

      // Check for pending vendor code
      const pendingCode = localStorage.getItem('pending_vendor_code');
      if (pendingCode) {
        profileData.vendor_code = pendingCode;
        localStorage.removeItem('pending_vendor_code');
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(profileData),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.profile);
        return data.profile;
      }
    } catch (err) {
      console.error('Auto profile save error:', err);
    }
    return null;
  }, []);

  const handleSession = useCallback(async (s) => {
    if (s) {
      const profile = await fetchProfile(s.access_token);
      const meta = s.user?.user_metadata || {};
      const hasName = meta.name || meta.full_name;
      if ((!profile || !profile.db_id) && hasName) {
        await autoSaveProfile(s.access_token, meta);
      }
    } else {
      setUser(null);
    }
  }, [fetchProfile, autoSaveProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      handleSession(s).then(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      handleSession(s);
    });

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const signUp = async (mobile, password, metadata = {}) => {
    // Server-side signup (mobile-based)
    const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...metadata, mobile, password, role: 'customer' }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Registration failed');

    // Sign in using synthetic email
    const syntheticEmail = result.syntheticEmail || `${mobile.trim()}@readymean.app`;
    const { data, error } = await supabase.auth.signInWithPassword({ email: syntheticEmail, password });
    if (error) throw error;
    if (data.session) {
      setSession(data.session);
      await handleSession(data.session);
    }
    return data;
  };

  const signIn = async (mobile, password) => {
    const syntheticEmail = `${mobile.trim()}@readymean.app`;
    const { data, error } = await supabase.auth.signInWithPassword({ email: syntheticEmail, password });
    if (error) throw error;

    // Check if user is actually a customer
    if (data?.session) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/me`, {
          headers: { Authorization: `Bearer ${data.session.access_token}` },
        });

        if (res.ok) {
          const profileData = await res.json();
          // The backend returns { user: { role: '...' } }
          if (profileData.user?.role === 'vendor') {
            await supabase.auth.signOut();
            throw new Error('This account is registered as a Vendor.');
          }
        }
      } catch (err) {
        if (err.message.includes('Vendor')) throw err;
        console.error('Role validation check failed:', err);
      }
    }

    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  const saveProfile = async (profileData) => {
    if (!session?.access_token) throw new Error('Not authenticated');
    const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(profileData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to save profile' }));
      throw new Error(err.error || 'Failed to save profile');
    }
    const data = await res.json();
    setUser(data.profile);
    return data.profile;
  };

  const value = {
    session,
    user,
    loading,
    isAuthenticated: !!session,
    hasProfile: !!user?.name,
    signUp,
    signIn,
    signOut,
    saveProfile,
    refreshProfile: () => session && fetchProfile(session.access_token),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
