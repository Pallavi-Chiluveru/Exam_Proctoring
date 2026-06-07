import { createContext, useContext, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const AuthContext = createContext(null);

const fallbackUsers = {
  admin: { id: 'demo-admin', name: 'Ava Sterling', email: 'admin@aegis.ai', role: 'admin', avatar: 'AS' },
  student: { id: 'demo-student', name: 'Arjun Rao', email: 'student@aegis.ai', role: 'student', avatar: 'AR' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('aegis_user') || 'null'));
  const [loading, setLoading] = useState(false);

  async function login(payload) {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', payload);
      localStorage.setItem('aegis_token', data.token);
      localStorage.setItem('aegis_user', JSON.stringify(data.user));
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}`);
    } catch {
      const role = payload.email?.includes('admin') ? 'admin' : 'student';
      const demoUser = fallbackUsers[role];
      localStorage.setItem('aegis_token', 'demo-token');
      localStorage.setItem('aegis_user', JSON.stringify(demoUser));
      setUser(demoUser);
      toast('Demo mode active. Start MongoDB for persistent data.');
    } finally {
      setLoading(false);
    }
  }

  async function register(payload) {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', payload);
      localStorage.setItem('aegis_token', data.token);
      localStorage.setItem('aegis_user', JSON.stringify(data.user));
      setUser(data.user);
      toast.success('Account created');
    } catch {
      toast.error('Registration needs the backend running with MongoDB.');
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('aegis_token');
    localStorage.removeItem('aegis_user');
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
