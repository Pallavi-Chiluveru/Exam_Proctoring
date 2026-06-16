import { createContext, useContext, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

// Added Google OAuth login handling

const AuthContext = createContext(null);

const fallbackUsers = {
  admin: { id: 'demo-admin', candidateId: 'PXADMIN01', name: 'Ava Sterling', email: 'admin@proctorx.com', role: 'admin', avatar: 'AS' },
  student: { id: 'demo-student', candidateId: '26PX999', name: 'Arjun Rao', email: 'student@proctorx.com', role: 'student', avatar: 'AR' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('proctorx_user') || 'null'));
  const [loading, setLoading] = useState(false);

  async function login(payload) {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', payload);
      localStorage.setItem('proctorx_token', data.token);
      localStorage.setItem('proctorx_user', JSON.stringify(data.user));
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}`);
    } catch (error) {
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        toast.error(error.response.data?.message || 'Login failed. Please check your credentials.');
      } else {
        const role = payload.email?.includes('admin') ? 'admin' : 'student';
        const demoUser = fallbackUsers[role];
        localStorage.setItem('proctorx_token', 'demo-token');
        localStorage.setItem('proctorx_user', JSON.stringify(demoUser));
        setUser(demoUser);
        toast('Demo mode active. Start MongoDB for persistent data.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function register(payload) {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', payload);
      localStorage.setItem('proctorx_token', data.token);
      localStorage.setItem('proctorx_user', JSON.stringify(data.user));
      setUser(data.user);
      toast.success('Account created');
    } catch (error) {
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        toast.error(error.response.data?.message || 'Registration failed.');
      } else {
        toast.error('Registration needs the backend running with MongoDB.');
      }
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('proctorx_token');
    localStorage.removeItem('proctorx_user');
    sessionStorage.removeItem('examsCache');
    setUser(null);
  }

  function updateUser(userData) {
    const updated = { ...user, ...userData };
    localStorage.setItem('proctorx_user', JSON.stringify(updated));
    setUser(updated);
  }

  async function googleLogin(credentialResponse) {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google', { credential: credentialResponse?.credential });
      localStorage.setItem('proctorx_token', data.token);
      localStorage.setItem('proctorx_user', JSON.stringify(data.user));
      setUser(data.user);
      toast.success(`Welcome, ${data.user.name}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  }

  const value = useMemo(() => ({ user, loading, login, register, logout, updateUser, googleLogin }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
