import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Bell, BookOpenCheck, Code2, LogOut, Radar, Shield, UsersRound, Video, LayoutDashboard, LineChart, ShieldAlert, User as UserIcon, Award, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    const [menuOpen, setMenuOpen] = useState(false);

    function handleLogout() {
      closeMenu();
      logout();
      navigate('/login');
    }

    function handleProfileClick() {
      setMenuOpen(!menuOpen);
    }

    function closeMenu() {
      setMenuOpen(false);
    }

    // Helper to navigate to route and close menu
    function navigateTo(path) {
      navigate(path);
      closeMenu();
    }

  return (
    <div className="min-h-screen bg-mesh text-slate-100">
      <div className="fixed inset-0 pointer-events-none noise" />
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 border-r border-white/10 bg-slate-950/50 p-5 backdrop-blur-2xl lg:flex flex-col">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-950 shadow-glow">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold tracking-tight">ProctorX</p>
            <p className="text-xs text-slate-400">Proctor Cloud</p>
          </div>
        </div>
        <nav className="mt-10 space-y-2 flex-1">
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
                    <div className="relative mt-auto pt-4 border-t border-white/10">
  <button className="relative w-full text-left flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors bg-white/5 border border-white/10 backdrop-blur-xl" onClick={handleProfileClick}>
    {/* Avatar */}
    {user?.picture ? (
      <img src={user.picture} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
    ) : (
      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm text-white">
        {user?.name?.[0] ?? ''}
      </div>
    )}
    {/* Name & Email */}
    <div className="flex flex-col flex-1 min-w-0">
      <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
      <p className="truncate text-xs text-slate-400">{user?.email}</p>
    </div>
    {/* Chevron */}

    {/* Dropdown */}
    {menuOpen && (
      <div className="absolute bottom-full mb-2 left-0 w-full z-[9999] rounded-xl border border-white/10 bg-slate-900 shadow-2xl backdrop-blur-md">
        <ul className="py-1">
          <li>
            <button onClick={() => navigateTo(user?.role === 'admin' ? '/admin' : '/student/dashboard')} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-white/5">Dashboard</button>
          </li>

          <li>
            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-white/5">Logout</button>
          </li>
        </ul>
      </div>
    )}
  </button>
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
