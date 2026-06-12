import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Camera, Edit3, Lock, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';
import { Button, Glass, SectionTitle } from '../../components/ui';
import { api } from '../../services/api';
import { useApiResource } from '../../hooks/useApiResource';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function StudentProfile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: user?.name || '', password: '', confirmPassword: '' });

  const { data, loading } = useApiResource(async () => {
    const res = await api.get('/student/profile');
    return res.data;
  }, null, []);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Str = event.target.result;
      try {
        const { data: resData } = await api.put('/student/profile', { avatar: base64Str });
        updateUser({ avatar: resData.user.avatar });
        toast.success('Profile picture updated');
      } catch (err) {
        toast.error('Failed to update picture');
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const payload = {};
      if (formData.name !== user?.name) payload.name = formData.name;
      if (formData.password) payload.password = formData.password;

      if (Object.keys(payload).length === 0) {
        toast('No changes to save');
        setSaving(false);
        return;
      }

      const { data: resData } = await api.put('/student/profile', payload);
      updateUser({ name: resData.user.name });
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (loading) return <div className="animate-pulse text-slate-400">Loading profile...</div>;
  if (!data) return <div className="text-rose-400">Failed to load profile.</div>;

  return (
    <div className="space-y-8">
      <SectionTitle eyebrow="Account" title="Profile & Settings" action={<div className="text-sm text-slate-400">Joined {new Date(data.user.createdAt).toLocaleDateString()}</div>} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          {/* PROFILE HEADER CARD */}
          <Glass className="p-6 flex flex-col items-center text-center">
            <div className="relative mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full bg-teal-500/20 text-teal-100 flex items-center justify-center text-3xl font-bold overflow-hidden border-4 border-slate-900 ring-2 ring-teal-500/30">
                {user?.avatar?.startsWith('data:') || user?.avatar?.startsWith('http') ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.avatar || user?.name?.slice(0, 2)
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarChange} />
            </div>
            <h2 className="text-xl font-bold">{data.user.name}</h2>
            <p className="text-slate-400 mb-2">{data.user.email}</p>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold bg-white/5 px-3 py-1 rounded-full">
              <UserIcon className="w-3 h-3 text-teal-400" /> {data.user.candidateId}
            </div>
            <div className="mt-6 w-full space-y-3">
              <Button variant="ghost" className="w-full text-rose-400 hover:bg-rose-500/10 hover:text-rose-300" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </div>
          </Glass>

          {/* SECURITY INFO */}
          <Glass className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" /> Security
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-white/5 py-2">
                <span className="text-slate-400">Account Created</span>
                <span>{new Date(data.user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-2">
                <span className="text-slate-400">Role</span>
                <span className="capitalize">{data.user.role}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Active Sessions</span>
                <span className="text-teal-400">1 Online</span>
              </div>
            </div>
          </Glass>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* STATISTICS GRID */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Glass className="p-4">
              <p className="text-xs text-slate-400 mb-1">Total Exams</p>
              <p className="text-2xl font-bold">{data.stats.totalExams}</p>
            </Glass>
            <Glass className="p-4">
              <p className="text-xs text-slate-400 mb-1">Passed Exams</p>
              <p className="text-2xl font-bold text-teal-400">{data.stats.passedExams}</p>
            </Glass>
            <Glass className="p-4 border-rose-500/20">
              <p className="text-xs text-slate-400 mb-1 text-rose-200">Disqualified</p>
              <p className="text-2xl font-bold text-rose-400">{data.stats.disqualifiedExams}</p>
            </Glass>
            <Glass className="p-4">
              <p className="text-xs text-slate-400 mb-1">Avg Score</p>
              <p className="text-2xl font-bold">{data.stats.averageScore}%</p>
            </Glass>
          </div>

          {/* ACCOUNT SETTINGS FORM */}
          <Glass className="p-6">
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-slate-400" /> Account Settings
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-sm outline-none transition focus:border-teal-500/50 focus:bg-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email (Read Only)</label>
                  <input
                    type="email"
                    disabled
                    value={data.user.email}
                    className="w-full rounded-lg border border-white/5 bg-slate-900/20 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="border-t border-white/5 pt-6">
                <h4 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Change Password
                </h4>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">New Password</label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep unchanged"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-sm outline-none transition focus:border-teal-500/50 focus:bg-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-sm outline-none transition focus:border-teal-500/50 focus:bg-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Glass>
        </div>
      </div>
    </div>
  );
}
