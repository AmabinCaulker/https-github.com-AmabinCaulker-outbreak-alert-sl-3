
import React from 'react';
import { User, AppView, UserRole } from '../types';

interface HeaderProps {
  user: User | null;
  onNavigate: (view: AppView) => void;
  notify: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  unreadCount?: number;
}

const Header: React.FC<HeaderProps> = ({ user, onNavigate, notify, unreadCount = 0 }) => {
  const isProfessional = user?.role !== UserRole.PUBLIC;
  const isAdmin = user?.role === UserRole.ADMIN;
  const isHealthWorker = user?.role === UserRole.HEALTH_WORKER;
  
  const themeClass = isAdmin ? 'text-slate-800' : isHealthWorker ? 'text-sky-700' : 'text-emerald-700';
  const accentBg = isAdmin ? 'bg-slate-900' : isHealthWorker ? 'bg-sky-600' : 'bg-emerald-600';

  return (
    <header className="h-20 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 px-8 flex items-center justify-between sticky top-0 z-40 transition-all">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <i className="fa-solid fa-magnifying-glass text-slate-500 group-focus-within:text-blue-400 transition-colors"></i>
          </span>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 border border-white/10 rounded-2xl bg-white/5 text-sm font-medium text-white placeholder:text-slate-500 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all outline-none"
            placeholder="Search reports, advice, locations..."
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <button 
          onClick={() => onNavigate(AppView.REPORT_SUBMISSION)}
          className={`${accentBg} hover:opacity-90 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all flex items-center shadow-lg shadow-brand-glow`}
        >
          <i className="fa-solid fa-plus mr-2"></i>
          {isAdmin || isHealthWorker ? 'New Official Entry' : 'Report Symptoms'}
        </button>

        <div className="relative">
          <button 
            onClick={() => onNavigate(AppView.ALERTS)}
            className="p-3 text-slate-400 hover:bg-white/5 rounded-2xl transition-colors relative group"
          >
            <i className="fa-solid fa-bell text-xl text-slate-300"></i>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 bg-rose-500 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-black border-2 border-slate-900 group-hover:scale-110 transition-transform">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center space-x-4 pl-6 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-white leading-none mb-1">{user?.name || 'User'}</p>
            <p className={`text-[9px] font-black uppercase tracking-widest opacity-80 ${isAdmin ? 'text-slate-400' : isHealthWorker ? 'text-sky-400' : 'text-emerald-400'}`}>{user?.district || 'Salone'}</p>
          </div>
          <div 
            onClick={() => onNavigate(AppView.PROFILE)}
            className={`w-11 h-11 ${accentBg} rounded-2xl flex items-center justify-center text-white font-black text-sm cursor-pointer shadow-lg shadow-brand-glow hover:scale-105 transition-all`}
          >
            {user?.name.split(' ').map(n => n[0]).join('') || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
