import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('studio_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('studio_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      if (token) {
        try {
          const res = await api.getMe(token);
          setUser(res.user);
          localStorage.setItem('studio_user', JSON.stringify(res.user));
        } catch (err) {
          console.warn('Sessão expirada:', err.message);
          logout();
        }
      }
      setLoading(false);
    }
    verify();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('studio_token', res.token);
    localStorage.setItem('studio_user', JSON.stringify(res.user));
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('studio_token');
    localStorage.removeItem('studio_user');
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
