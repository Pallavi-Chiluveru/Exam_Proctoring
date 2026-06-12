import { useState, useRef } from 'react';
import { Shield, User, Key, AlertCircle, Camera } from 'lucide-react';
import { Page, SectionTitle, Glass, Button } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  
  // Profile State
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Security State
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const { data } = await api.put('/admin/profile', { name: profile.name, email: profile.email });
      updateUser(data);
      toast.success('Admin profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.new.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    setIsSavingPassword(true);
    try {
      await api.put('/admin/password', { 
        currentPassword: passwords.current, 
        newPassword: passwords.new 
      });
      setPasswords({ current: '', new: '', confirm: '' });
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Str = event.target.result;
      
      console.log('[FRONTEND] Starting upload for file via Base64 JSON:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      try {
        console.log('[FRONTEND] Sending PUT request to /admin/profile for avatar');
        // We will send it to profile PUT endpoint to avoid multer issues, 
        // OR we can send it to avatar endpoint as JSON. Let's use avatar endpoint but send JSON.
        const { data } = await api.post('/admin/avatar', { avatarBase64: base64Str });
        console.log('[FRONTEND] Upload successful. Response:', data);
        updateUser(data.user);
        toast.success('Profile picture updated!');
      } catch (error) {
        console.error('[FRONTEND] Upload failed with error:', error);
        toast.error(error.response?.data?.message || error.response?.data?.errorDetail || 'Failed to upload image');
      } finally {
        setIsUploadingAvatar(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  // Password Strength indicator
  const getStrength = (pass) => {
    if (!pass) return { score: 0, text: 'None', color: 'bg-slate-700' };
    if (pass.length < 8) return { score: 1, text: 'Weak', color: 'bg-rose-500' };
    if (pass.length < 12) return { score: 2, text: 'Fair', color: 'bg-amber-400' };
    return { score: 3, text: 'Strong', color: 'bg-emerald-400' };
  };

  const strength = getStrength(passwords.new);

  return (
    <Page>
      <SectionTitle eyebrow="System Configuration" title="Admin Settings" />

      <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mt-8 pb-16">
        
        {/* Admin Profile */}
        <Glass className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <User className="h-5 w-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">Admin Profile</h3>
          </div>
          
          <form onSubmit={handleProfileSave} className="space-y-6">
            <div className="flex items-center gap-6 mb-2">
              <div className="relative group">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Admin Profile" className="h-20 w-20 rounded-full object-cover border-2 border-indigo-500/30" />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-indigo-500/20 border-2 border-indigo-500/30 flex items-center justify-center text-2xl font-bold text-indigo-300">
                    {profile.name.substring(0, 1).toUpperCase()}
                  </div>
                )}
                <div 
                  className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  loading={isUploadingAvatar}
                >
                  Change Picture
                </Button>
                <p className="text-xs text-slate-500 mt-2">JPG, GIF or PNG. Max size 5MB.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-2.5 text-sm text-white focus:border-indigo-500/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-2.5 text-sm text-white focus:border-indigo-500/50 focus:outline-none transition-colors"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={isSavingProfile}>Save Changes</Button>
            </div>
          </form>
        </Glass>

        {/* Security Settings */}
        <Glass className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <Key className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Security Settings</h3>
          </div>
          
          <form onSubmit={handlePasswordSave} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Current Password</label>
              <input
                type="password"
                required
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none transition-colors"
              />
            </div>
            
            <div className="pt-2 border-t border-white/5">
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider mt-2">New Password</label>
              <input
                type="password"
                required
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none transition-colors"
              />
              
              {/* Password Strength */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 flex gap-1 h-1.5">
                  {[1, 2, 3].map((level) => (
                    <div 
                      key={level} 
                      className={`flex-1 rounded-full transition-colors duration-300 ${level <= strength.score ? strength.color : 'bg-slate-700/50'}`}
                    />
                  ))}
                </div>
                <span className={`text-[10px] font-medium uppercase tracking-wider w-12 text-right ${strength.score > 0 ? strength.color.replace('bg-', 'text-') : 'text-slate-500'}`}>
                  {strength.text}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className={`w-full rounded-xl border bg-slate-900/50 px-4 py-2.5 text-sm text-white focus:outline-none transition-colors ${passwords.confirm && passwords.new !== passwords.confirm ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-amber-500/50'}`}
              />
              {passwords.confirm && passwords.new !== passwords.confirm && (
                <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Passwords do not match</p>
              )}
            </div>
            
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={isSavingPassword} disabled={passwords.new && passwords.new !== passwords.confirm}>
                Change Password
              </Button>
            </div>
          </form>
        </Glass>

      </div>
    </Page>
  );
}
