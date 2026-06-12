import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Fingerprint, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Glass, Page } from '../components/ui';

export default function Login() {
  const { login, register, loading } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

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
    <Page className="relative grid overflow-hidden lg:grid-cols-[1.1fr_.9fr]">
      <section className="relative flex min-h-[48vh] flex-col justify-between p-6 sm:p-10 lg:min-h-screen">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-950 shadow-glow">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold">ProctorX</p>
            <p className="text-sm text-slate-400">Secure AI Assessment</p>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl py-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-200/10 px-3 py-1 text-sm text-teal-100">
            <Sparkles className="h-4 w-4" /> AI proctoring, live coding, and enterprise analytics
          </div>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Secure exams that feel impossibly calm.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            A premium proctoring command center with real-time webcam signals, violation timelines, Monaco coding rounds, and AI risk scoring.
          </p>
        </motion.div>
        <div className="grid gap-3 text-sm text-slate-400 sm:grid-cols-3">
          {['Face intelligence', 'WebRTC monitoring', 'JWT secured APIs'].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-xl">{item}</div>
          ))}
        </div>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-10">
        <Glass className="w-full max-w-md p-6 sm:p-8">
          <div className="mb-6">
            <p className="text-sm text-slate-400">{mode === 'login' ? 'Welcome back' : 'Create secure identity'}</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">{mode === 'login' ? 'Sign in to ProctorX' : 'Join ProctorX'}</h2>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' ? (
              <label className={`field ${errors.name ? 'has-error' : ''}`}>
                <span>Name</span>
                <div>
                  <Fingerprint className="h-4 w-4 opacity-70" />
                  <input value={form.name} onChange={(event) => { setForm({ ...form, name: event.target.value }); setErrors({ ...errors, name: null }); }} placeholder="Your name" />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
              </label>
            ) : null}
            <label className={`field ${errors.email ? 'has-error' : ''}`}>
              <span>Email Address</span>
              <div>
                <Mail className="h-4 w-4 opacity-70" />
                <input value={form.email} onChange={(event) => { setForm({ ...form, email: event.target.value }); setErrors({ ...errors, email: null }); }} placeholder={mode === 'login' ? 'Email Address' : 'Enter your email address'} />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </label>
            <label className={`field ${errors.password ? 'has-error' : ''}`}>
              <span>Password</span>
              <div>
                <LockKeyhole className="h-4 w-4 opacity-70" />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => { setForm({ ...form, password: event.target.value }); setErrors({ ...errors, password: null }); }} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-auto text-slate-400 hover:text-white transition-colors focus:outline-none">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
            </label>
            <Button className="w-full h-[46px] transition-all hover:shadow-[0_0_15px_rgba(94,234,212,0.4)]" loading={loading}>
              {loading ? (mode === 'login' ? 'Signing In...' : 'Creating Account...') : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </Button>
          </form>
          <button className="mt-5 w-full text-sm text-slate-400 hover:text-white" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign in'}
          </button>
        </Glass>
      </section>
    </Page>
  );
}
