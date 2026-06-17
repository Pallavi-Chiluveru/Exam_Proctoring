import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Fingerprint, LockKeyhole, Mail, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

import { GoogleLogin } from '@react-oauth/google';
import { Button, Glass, Page } from '../components/ui';

export default function Login() {
  const { login, register, loading, googleLogin } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState(location.pathname === '/register' ? 'register' : 'login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setMode(location.pathname === '/register' ? 'register' : 'login');
  }, [location.pathname]);

  function validate() {
    const newErrors = {};
    if (mode === 'register' && !form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Invalid Email Address';
    if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function submit(event) {
    event.preventDefault();
    if (!validate()) return;
    const fingerprint = `${navigator.userAgent}-${screen.width}x${screen.height}`;
    if (mode === 'login') login({ ...form, fingerprint });
    else register({ ...form, role: 'student', fingerprint });
  }

  return (
    <Page className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-6 sm:p-10">
      {/* Background Lighting Effects */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute h-[500px] w-[500px] rounded-full bg-teal-500/20 blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[150px]" 
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col items-center justify-center text-center"
        >
          <h1 className="text-3xl font-bold tracking-tight text-white">ProctorX</h1>
          <p className="mt-1 text-sm font-medium text-teal-400">Secure AI Assessment</p>
        </motion.div>

        {/* Authentication Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Glass className="relative overflow-hidden p-6 sm:p-8 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            {/* Subtle inner card glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-teal-500/10 blur-[50px]" />
            
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                {mode === 'login' ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {mode === 'login' ? 'Sign in to access your dashboard' : 'Join the next generation of secure exams'}
              </p>
            </div>

            <form onSubmit={submit} className="relative z-10 space-y-5">
              {mode === 'register' && (
                <label className={`field ${errors.name ? 'has-error' : ''}`}>
                  <span className="text-sm font-medium text-slate-300">Name</span>
                  <div className="mt-1.5 flex items-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition-colors focus-within:border-teal-500/50 focus-within:bg-white/10">
                    <Fingerprint className="h-5 w-5 text-slate-400 mr-2" />
                    <input 
                      className="w-full bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
                      value={form.name} 
                      onChange={(event) => { setForm({ ...form, name: event.target.value }); setErrors({ ...errors, name: null }); }} 
                      placeholder="Your full name" 
                    />
                  </div>
                  {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
                </label>
              )}

              <label className={`field ${errors.email ? 'has-error' : ''}`}>
                <span className="text-sm font-medium text-slate-300">Email Address</span>
                <div className="mt-1.5 flex items-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition-colors focus-within:border-teal-500/50 focus-within:bg-white/10">
                  <Mail className="h-5 w-5 text-slate-400 mr-2" />
                  <input 
                    className="w-full bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
                    value={form.email} 
                    onChange={(event) => { setForm({ ...form, email: event.target.value }); setErrors({ ...errors, email: null }); }} 
                    placeholder={mode === 'login' ? 'Email Address' : 'Enter your email address'} 
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
              </label>

              <label className={`field ${errors.password ? 'has-error' : ''}`}>
                <span className="text-sm font-medium text-slate-300">Password</span>
                <div className="mt-1.5 flex items-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition-colors focus-within:border-teal-500/50 focus-within:bg-white/10">
                  <LockKeyhole className="h-5 w-5 text-slate-400 mr-2" />
                  <input 
                    className="w-full bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
                    type={showPassword ? 'text' : 'password'} 
                    value={form.password} 
                    onChange={(event) => { setForm({ ...form, password: event.target.value }); setErrors({ ...errors, password: null }); }} 
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="ml-2 text-slate-400 transition-colors hover:text-white focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
              </label>

              <Button 
                className="mt-6 h-12 w-full rounded-lg bg-teal-500 font-semibold text-slate-950 transition-all hover:bg-teal-400 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]" 
                loading={loading}
              >
                {loading ? (mode === 'login' ? 'Signing In...' : 'Creating Account...') : (mode === 'login' ? 'Sign In' : 'Create Account')}
              </Button>

              {/* Divider */}
              <div className="my-6 flex items-center">
                <div className="flex-1 h-px bg-gradient-to-r from-cyan-500 via-teal-500 to-purple-500 opacity-30" />
                <span className="mx-3 text-sm text-white/70">OR</span>
                <div className="flex-1 h-px bg-gradient-to-r from-purple-500 via-teal-500 to-cyan-500 opacity-30" />
              </div>

              {/* Google Sign-In Card */}
              <div className="flex w-full justify-center">
                <div className="relative inline-flex overflow-hidden rounded-[16px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-transform duration-300 hover:scale-105 hover:shadow-[0_12px_48px_rgba(14,165,233,0.4)]">
                  <div className="pointer-events-none absolute inset-0 rounded-[16px] border border-transparent bg-gradient-to-r from-cyan-500 via-teal-500 to-purple-500 opacity-30" />
                  <GoogleLogin
                    onSuccess={credentialResponse => { googleLogin(credentialResponse); }}
                    onError={() => { toast.error('Google login failed'); }}
                    theme="outline"
                    shape="pill"
                    size="large"
                    width="400"
                    useOneTap={false}
                    auto_select={false}
                  />
                </div>
              </div>

            </form>

            <div className="relative z-10 mt-6 text-center">
              <button 
                className="text-sm font-medium text-slate-400 transition-colors hover:text-white" 
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              >
                {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </Glass>
        </motion.div>
      </div>
    </Page>
  );
}
