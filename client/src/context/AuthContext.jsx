import { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ams_token');
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .getProfile()
      .then(setUser)
      .catch(() => localStorage.removeItem('ams_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(loginId, password) {
    const { token, user: loggedInUser } = await authApi.login(loginId, password);
    localStorage.setItem('ams_token', token);
    setUser(loggedInUser);
  }

  function logout() {
    localStorage.removeItem('ams_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
