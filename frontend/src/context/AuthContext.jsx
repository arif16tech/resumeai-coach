import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);
  const hasAttemptedFetchRef = useRef(false);

  useEffect(() => {
    // Ensure isMountedRef is true on mount (handles StrictMode double-invoke)
    isMountedRef.current = true;

    // Only attempt to fetch once per mount
    if (!hasAttemptedFetchRef.current) {
      hasAttemptedFetchRef.current = true;
      fetchMe();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchMe = async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (isMountedRef.current) {
        setUser(data.user);
      }
    } catch (error) {
      // 401 is expected when not logged in - suppress console error
      if (!error.isExpectedAuthError) {
        console.error('Auth error:', error);
      }
      if (isMountedRef.current) {
        setUser(null);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (isMountedRef.current) {
      setUser(data.user);
    }
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    if (isMountedRef.current) {
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    if (isMountedRef.current) {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
