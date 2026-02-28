
import React, { useState, useEffect } from 'react';
import { User, SystemNotification } from '../types';
import Notifications from './Notifications';

interface ProfileProps {
  user: User | null;
  notifications: SystemNotification[];
  onMarkRead: (id: string) => void;
  onUpdateUser: (updatedUser: User) => void;
  notify: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

const Profile: React.FC<ProfileProps> = ({ user, notifications, onMarkRead, onUpdateUser, notify }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'notifications' | 'settings'>('notifications');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('app-theme') as 'light' | 'dark') || 'light';
  });
  
  const [settingsData, setSettingsData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const updatedUser = { ...user, name: settingsData.name, email: settingsData.email };
    onUpdateUser(updatedUser);
    notify("Profile updated successfully", "success");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (settingsData.newPassword !== settingsData.confirmPassword) {
      notify("Passwords do not match", "warning");
      return;
    }
    notify("Password updated successfully", "success");
    setSettingsData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        notify("Profile photo updated", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="bg-slate-900 dark:bg-slate-950 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl transition-colors">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
            <div className="w-32 h-32 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-4xl font-black shadow-2xl shadow-blue-500/40 overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user.name.split(' ').map(n => n[0]).join('')
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[2.5rem]">
              <i className="fa-solid fa-camera text-white text-xl"></i>
              <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
            </label>
          </div>
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-4xl font-black tracking-tight">{user.name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                {user.role}
              </span>
              <span className="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                {user.district} District
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full max-w-lg mx-auto transition-colors">
        <button 
          onClick={() => setActiveTab('info')} 
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'info' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
        >
          Info
        </button>
        <button 
          onClick={() => setActiveTab('notifications')} 
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'notifications' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
        >
          Alerts ({notifications.filter(n => !n.readBy.includes(user.id)).length})
        </button>
        <button 
          onClick={() => setActiveTab('settings')} 
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'settings' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
        >
          Settings
        </button>
      </div>

      <div className="pt-6">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Personal Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{user.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{user.phoneNumber || 'Not provided'}</p>
                </div>
                {user.staffId && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Staff ID</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{user.staffId}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">System Access</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Permissions</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {user.permissions.map(p => (
                      <span key={p} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[8px] font-black uppercase rounded border border-slate-100 dark:border-slate-700">
                        {p.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <Notifications notifications={notifications} onMarkRead={onMarkRead} />
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
            <div className="space-y-8">
              {/* Theme & Profile */}
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8 transition-colors">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Appearance</h3>
                  <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                    <div>
                      <p className="font-black text-slate-900 dark:text-white text-sm">Theme Mode</p>
                      <p className="text-xs text-slate-400 font-medium">Switch between light and dark interface.</p>
                    </div>
                    <button 
                      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                      className={`w-14 h-8 rounded-full relative transition-all ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${theme === 'dark' ? 'left-7' : 'left-1'} flex items-center justify-center`}>
                        <i className={`fa-solid ${theme === 'dark' ? 'fa-moon text-blue-600' : 'fa-sun text-amber-500'} text-[10px]`}></i>
                      </div>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Profile Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Display Name</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold focus:bg-white dark:focus:bg-slate-700 focus:border-blue-400 transition-all outline-none dark:text-white" 
                        value={settingsData.name}
                        onChange={e => setSettingsData({...settingsData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                      <input 
                        type="email" 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold focus:bg-white dark:focus:bg-slate-700 focus:border-blue-400 transition-all outline-none dark:text-white" 
                        value={settingsData.email}
                        onChange={e => setSettingsData({...settingsData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                    Save Profile Changes
                  </button>
                </form>
              </div>
            </div>

            <div className="space-y-8">
              {/* Password Update */}
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8 transition-colors">
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Security</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Current Password</label>
                      <input 
                        type="password" 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold focus:bg-white dark:focus:bg-slate-700 focus:border-blue-400 transition-all outline-none dark:text-white" 
                        value={settingsData.currentPassword}
                        onChange={e => setSettingsData({...settingsData, currentPassword: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
                      <input 
                        type="password" 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold focus:bg-white dark:focus:bg-slate-700 focus:border-blue-400 transition-all outline-none dark:text-white" 
                        value={settingsData.newPassword}
                        onChange={e => setSettingsData({...settingsData, newPassword: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold focus:bg-white dark:focus:bg-slate-700 focus:border-blue-400 transition-all outline-none dark:text-white" 
                        value={settingsData.confirmPassword}
                        onChange={e => setSettingsData({...settingsData, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-slate-900 dark:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all">
                    Update Password
                  </button>
                </form>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-3xl">
                    <div className="flex items-center space-x-3 mb-2">
                      <i className="fa-solid fa-triangle-exclamation text-amber-600 dark:text-amber-500"></i>
                      <p className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">Account Deletion</p>
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed mb-4">Deleting your account is permanent and will remove all your surveillance data.</p>
                    <button className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest hover:underline">Request Account Deletion</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
