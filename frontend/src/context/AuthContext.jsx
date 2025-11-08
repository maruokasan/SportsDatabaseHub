import { createContext, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../api/auth';
import api from '../api/client';

const AuthContext = createContext(null);

const tokenKey = 'sdh_token';
const userKey = 'sdh_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem(tokenKey);
    if (stored) {
      api.defaults.headers.common.Authorization = `Bearer ${stored}`;
    }
    return stored;
  });
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(userKey);
    return raw ? JSON.parse(raw) : null;
  });

  const navigate = useNavigate();

  const login = async (credentials) => {
    const { email, password } = credentials;
    const res = await loginRequest(email, password);
    localStorage.setItem(tokenKey, res.token);
    localStorage.setItem(userKey, JSON.stringify(res.user));
    api.defaults.headers.common.Authorization = `Bearer ${res.token}`;
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    // clear client-side auth state
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    delete api.defaults.headers.common.Authorization;
    setToken(null);
    setUser(null);
    // redirect to public homepage
    try {
      navigate('/');
    } catch (e) {
      // no-op if navigation isn't available
    }
  };

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(token),
    login,
    logout
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
