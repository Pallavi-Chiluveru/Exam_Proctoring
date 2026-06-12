import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Bell, BookOpenCheck, Code2, LogOut, Radar, Shield, UsersRound, Video, LayoutDashboard, LineChart, ShieldAlert, User as UserIcon, Award, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui';

const adminNav = [
  { to: '/admin/exams', label: 'Exams', icon: BookOpenCheck },
  { to: '/admin/students', label: 'Students', icon: UsersRound },
  { to: '/admin/integrity', label: 'Integrity Reports', icon: ShieldAlert },
  { to: '/admin', label: 'Command Center', icon: BarChart3 },
  { to: '/admin/results', label: 'Results', icon: LineChart },
  { to: '/admin/monitoring', label: 'Live Monitoring', icon: Video },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const studentNav = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/exams', label: 'Exams', icon: BookOpenCheck },
  { to: '/student/results', label: 'Results', icon: LineChart },
  { to: '/student/integrity', label: 'Integrity Reports', icon: ShieldAlert },
  { to: '/student/profile', label: 'Profile', icon: UserIcon },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = user?.role === 'admin' ? adminNav : studentNav;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-mesh text-slate-100">
      <div className="fixed inset-0 pointer-events-none noise" />
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 border-r border-white/10 bg-slate-950/50 p-5 backdrop-blur-2xl lg:block">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-950 shadow-glow">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold tracking-tight">ProctorX</p>
            <p className="text-xs text-slate-400">Proctor Cloud</p>
          </div>
        </div>
        <nav className="mt-10 space-y-2">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive ? 'bg-white text-slate-950' : 'text-slate-400 hover:bg-white/8 hover:text-white'}`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-5 left-5 right-5">
          <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-teal-300/15 text-sm font-bold text-teal-100 overflow-hidden">
                {user?.avatar?.startsWith('data:') || user?.avatar?.startsWith('http') ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.avatar || user?.name?.slice(0, 2)
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
            <Button variant="ghost" className="mt-4 w-full" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </aside>
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/55 px-4 py-3 backdrop-blur-2xl lg:ml-72">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radar className="h-5 w-5 text-teal-200" />
            <span className="text-sm font-semibold">Integrity signal live</span>
          </div>
          <div className="flex items-center gap-2">


          </div>
        </div>
      </header>
      <div className="px-4 py-6 lg:ml-72 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
