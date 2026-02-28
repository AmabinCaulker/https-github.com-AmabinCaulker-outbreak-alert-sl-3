
import React from 'react';
import { AppView, Permission, User, UserRole } from '../types';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  user: User | null;
  navHistory?: AppView[];
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout, isOpen, toggleSidebar, user }) => {
  const hasPermission = (p: Permission) => user?.permissions?.includes(p);
  const isAdmin = user?.role === UserRole.ADMIN;
  const isHealthWorker = user?.role === UserRole.HEALTH_WORKER;
  const isPublic = user?.role === UserRole.PUBLIC;
  
  const accentColor = isAdmin ? 'bg-slate-700' : isHealthWorker ? 'bg-sky-500' : 'bg-emerald-500';
  const sidebarBg = isAdmin ? 'bg-slate-950' : isHealthWorker ? 'bg-slate-900' : 'bg-emerald-950';

  const menuItems: Array<{ id: AppView; label: string; icon: string; badge?: string; permission?: Permission; publicOnly?: boolean }> = [
    { id: AppView.DASHBOARD, label: 'Home Feed', icon: 'fa-house-chimney' },
    { id: AppView.ALERTS, label: 'Intelligence', icon: 'fa-tower-broadcast' },
    { id: AppView.NEWS, label: 'Bulletins', icon: 'fa-newspaper' },
    { id: AppView.AI_BUDDY, label: 'Health Buddy', icon: 'fa-face-smile-wink', publicOnly: true },
    { id: AppView.REPORT_SUBMISSION, label: 'New Report', icon: 'fa-file-medical', permission: Permission.CREATE_REPORTS },
    { id: AppView.SURVEILLANCE_REGISTRY, label: 'Surveillance', icon: 'fa-database', permission: Permission.VIEW_REPORTS },
    { id: AppView.THREAT_MATRIX, label: 'Threat Matrix', icon: 'fa-biohazard', permission: Permission.VIEW_REPORTS },
    { id: AppView.MAP, label: 'National Map', icon: 'fa-map-location-dot', permission: Permission.VIEW_MAP },
    { id: AppView.TRENDS, label: 'Analytics', icon: 'fa-chart-pie', permission: Permission.VIEW_TRENDS },
    { id: AppView.TASKS, label: 'Operations', icon: 'fa-list-check', badge: '5', permission: Permission.MANAGE_TASKS },
    { id: AppView.SUPPORT, label: 'Support', icon: 'fa-headset' }
  ];

  const adminItems = [
    { id: AppView.NEWS_MANAGEMENT, label: 'Manage Alerts', icon: 'fa-pen-nib', permission: Permission.MANAGE_SETTINGS },
    { id: AppView.ADMIN_PANEL, label: 'System Core', icon: 'fa-shield-halved', permission: Permission.MANAGE_SETTINGS },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.publicOnly) return isPublic;
    return !item.permission || hasPermission(item.permission);
  });
  
  const filteredAdminItems = adminItems.filter(item => !item.permission || hasPermission(item.permission));

  return (
    <aside className={`fixed top-0 left-0 h-full ${sidebarBg}/80 backdrop-blur-2xl text-white transition-all duration-500 z-50 flex flex-col ${isOpen ? 'w-64' : 'w-20'} shadow-2xl border-r border-white/5`}>
      <div className="p-6 flex items-center justify-between border-b border-white/5 bg-black/10 backdrop-blur-sm">
        <div className={`flex items-center space-x-4 ${!isOpen && 'hidden'}`}>
          <div className={`${accentColor} w-10 h-10 rounded-2xl shadow-lg flex items-center justify-center animate-pulse-soft`}>
             <i className="fa-solid fa-heart-pulse text-white text-lg"></i>
          </div>
          <div>
            <h1 className="font-black text-base tracking-tighter leading-none">Outbreak Alert SL</h1>
            <p className="text-[8px] text-white/40 font-black uppercase tracking-[0.3em] mt-1.5">Vigilance Hub</p>
          </div>
        </div>
        <button onClick={toggleSidebar} className="p-2.5 hover:bg-white/10 rounded-xl transition-all">
          <i className={`fa-solid ${isOpen ? 'fa-chevron-left' : 'fa-chevron-right'} text-white/20`}></i>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto mt-8 px-4 space-y-2 no-scrollbar">
        {filteredMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center p-4 rounded-2xl transition-all group relative ${
              currentView === item.id ? `${accentColor} text-white shadow-xl shadow-black/30` : 'text-white/30 hover:bg-white/5 hover:text-white'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-6 text-lg text-center ${currentView === item.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}></i>
            {isOpen && <span className="ml-4 text-[11px] font-black uppercase tracking-[0.15em]">{item.label}</span>}
            {isOpen && item.badge && (
              <span className="ml-auto bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded-lg font-black shadow-lg">
                {item.badge}
              </span>
            )}
          </button>
        ))}

        {filteredAdminItems.length > 0 && (
          <div className="pt-10">
            <div className={`mb-4 px-4 text-[9px] font-black text-white/20 uppercase tracking-[0.4em] ${!isOpen && 'hidden'}`}>
               Institutional 
            </div>
            {filteredAdminItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center p-4 rounded-2xl transition-all group ${
                  currentView === item.id ? 'bg-white/10 text-white ring-1 ring-white/10' : 'text-white/30 hover:bg-white/5 hover:text-white'
                }`}
              >
                <i className={`fa-solid ${item.icon} w-6 text-lg text-center`}></i>
                {isOpen && <span className="ml-4 text-[11px] font-black uppercase tracking-[0.15em]">{item.label}</span>}
              </button>
            ))}
          </div>
        )}
      </nav>

      <div className="p-6 bg-black/20 border-t border-white/5">
        <button onClick={onLogout} className="w-full flex items-center p-4 rounded-2xl text-rose-400/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
          <i className="fa-solid fa-power-off w-6 text-lg text-center"></i>
          {isOpen && <span className="ml-4 text-[11px] font-black uppercase tracking-[0.15em]">Log Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
