
import React, { useState, useEffect } from 'react';
import { User, UserRole, AppView, Permission, AuditEntry, SystemNotification } from './types';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SurveillanceRegistry from './components/SurveillanceRegistry';
import ReportForm from './components/ReportForm';
import OutbreakMap from './components/OutbreakMap';
import Trends from './components/Trends';
import Tasks from './components/Tasks';
import LandingPage from './components/LandingPage';
import AdminPanel from './components/AdminPanel';
import SupportCenter from './components/SupportCenter';
import SignOutConfirm from './components/SignOutConfirm';
import AIHealthBuddy from './components/AIHealthBuddy';
import NewsPage from './components/NewsPage';
import NewsMaker from './components/NewsMaker';
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import ThreatMatrix from './components/ThreatMatrix';

export const recordAuditAction = (user: User, action: string, details?: string) => {
  const newLog: AuditEntry = {
    id: `AUD-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action,
    details,
    timestamp: new Date().toISOString(),
    category: 'Reporting'
  };
  const savedLogs = localStorage.getItem('system_audit_logs');
  const logs = savedLogs ? JSON.parse(savedLogs) : [];
  logs.unshift(newLog);
  localStorage.setItem('system_audit_logs', JSON.stringify(logs.slice(0, 100)));
};

const getPermissionsForRole = (role: UserRole): Permission[] => {
  switch (role) {
    case UserRole.ADMIN:
      return Object.values(Permission);
    case UserRole.HEALTH_WORKER:
      return [
        Permission.VIEW_REPORTS,
        Permission.CREATE_REPORTS,
        Permission.VERIFY_REPORTS,
        Permission.ASSIGN_REPORTS,
        Permission.VIEW_MAP,
        Permission.VIEW_TRENDS,
        Permission.MANAGE_TASKS,
        Permission.EXPORT_DATA
      ];
    case UserRole.PUBLIC:
    default:
      return [Permission.CREATE_REPORTS];
  }
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [mapInitialLayer, setMapInitialLayer] = useState<'Cases' | 'Hospitals'>('Cases');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; msg: string; type: 'success' | 'info' | 'warning' }[]>([]);
  const [navHistory, setNavHistory] = useState<AppView[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [systemVitals, setSystemVitals] = useState<any>(null);

  // WebSocket Connection for Real-time Updates
  useEffect(() => {
    if (!currentUser) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'DISEASE_UPDATE') {
        setNotifications(prev => [data, ...prev].slice(0, 50));
        addToast(`New Alert: ${data.title}`, 'info');
      } else if (data.type === 'SYSTEM_VITALS') {
        setSystemVitals(data);
      }
    };

    return () => socket.close();
  }, [currentUser]);

  useEffect(() => {
    const savedUser = localStorage.getItem('outbreak_session_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      user.permissions = getPermissionsForRole(user.role);
      setCurrentUser(user);
      setCurrentView(AppView.DASHBOARD);
    }
  }, []);

  // Update Body Theme based on Role
  useEffect(() => {
    if (!currentUser) {
      document.body.className = 'theme-public';
      return;
    }
    const roleClass = currentUser.role === UserRole.ADMIN ? 'theme-admin' : 
                    currentUser.role === UserRole.HEALTH_WORKER ? 'theme-health-worker' : 
                    'theme-public';
    document.body.className = roleClass;
  }, [currentUser]);

  useEffect(() => {
    if (currentView !== AppView.HOME && currentView !== AppView.AUTH) {
      setNavHistory(prev => {
        const filtered = prev.filter(v => v !== currentView);
        return [currentView, ...filtered].slice(0, 5);
      });
    }
  }, [currentView]);

  const addToast = (msg: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const handleLogin = (user: User) => {
    user.permissions = getPermissionsForRole(user.role);
    setCurrentUser(user);
    localStorage.setItem('outbreak_session_user', JSON.stringify(user));
    setCurrentView(AppView.DASHBOARD);
    addToast(`Authenticated as ${user.name}`, 'success');
    recordAuditAction(user, 'User Login', `Role: ${user.role}`);
  };

  const handleLogout = () => {
    if (currentUser) {
      recordAuditAction(currentUser, 'User Logout');
    }
    setCurrentUser(null);
    setCurrentView(AppView.HOME);
    setNavHistory([]);
    localStorage.removeItem('outbreak_session_user');
    setShowSignOutModal(false);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('outbreak_session_user', JSON.stringify(updatedUser));
    recordAuditAction(updatedUser, 'Profile Update');
  };

  const renderContent = () => {
    const handleNavigate = (view: AppView, data?: any) => {
      if (view === AppView.MAP && data?.layer) {
        setMapInitialLayer(data.layer);
      } else if (view === AppView.MAP) {
        setMapInitialLayer('Cases');
      }
      setCurrentView(view);
    };

    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard user={currentUser} onNavigate={handleNavigate} notify={addToast} systemVitals={systemVitals} notifications={notifications} />;
      case AppView.SURVEILLANCE_REGISTRY:
        return <SurveillanceRegistry user={currentUser} notify={addToast} />;
      case AppView.REPORT_SUBMISSION:
        return <ReportForm user={currentUser} onNavigate={handleNavigate} notify={addToast} />;
      case AppView.MAP:
        return <OutbreakMap notify={addToast} initialLayer={mapInitialLayer} />;
      case AppView.TRENDS:
        return <Trends notify={addToast} />;
      case AppView.TASKS:
        return <Tasks user={currentUser} notify={addToast} />;
      case AppView.ADMIN_PANEL:
        return <AdminPanel user={currentUser} notify={addToast} />;
      case AppView.AI_BUDDY:
        return <AIHealthBuddy user={currentUser} notify={addToast} onNavigate={handleNavigate} />;
      case AppView.NEWS:
        return <NewsPage user={currentUser} notify={addToast} />;
      case AppView.NEWS_MANAGEMENT:
        return <NewsMaker user={currentUser} notify={addToast} />;
      case AppView.ALERTS:
        return (
          <Notifications 
            notifications={notifications} 
            onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, readBy: [...n.readBy, currentUser?.id || ''] } : n))} 
          />
        );
      case AppView.PROFILE:
        return (
          <Profile 
            user={currentUser} 
            notifications={notifications} 
            onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, readBy: [...n.readBy, currentUser?.id || ''] } : n))} 
            onUpdateUser={handleUpdateUser}
            notify={addToast}
          />
        );
      case AppView.SUPPORT:
        return <SupportCenter user={currentUser} />;
      case AppView.THREAT_MATRIX:
        return <ThreatMatrix user={currentUser} notify={addToast} onNavigate={handleNavigate} />;
      default:
        return <Dashboard user={currentUser} onNavigate={handleNavigate} notify={addToast} />;
    }
  };

  return (
    <div className="min-h-screen">
      {currentView === AppView.HOME && !currentUser ? (
        <LandingPage onNavigate={setCurrentView} />
      ) : currentView === AppView.AUTH && !currentUser ? (
        <Auth onLogin={handleLogin} onBack={() => setCurrentView(AppView.HOME)} notify={addToast} />
      ) : (
        <div className="flex min-h-screen">
          <Sidebar 
            currentView={currentView} 
            onNavigate={setCurrentView} 
            onLogout={() => setShowSignOutModal(true)} 
            isOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            user={currentUser}
            navHistory={navHistory}
          />
          <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} flex flex-col min-h-screen`}>
            <Header 
              user={currentUser} 
              onNavigate={setCurrentView} 
              notify={addToast} 
              unreadCount={notifications.filter(n => !n.readBy.includes(currentUser?.id || '')).length}
            />
            <main className="p-8 max-w-7xl mx-auto flex-1">{renderContent()}</main>
            <footer className="p-6 bg-emerald-950 text-center border-t border-white/5">
               <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.4em]">
                  National Health Security Asset • Ministry of Health • Sierra Leone
               </p>
            </footer>
          </div>
          {showSignOutModal && <SignOutConfirm onConfirm={handleLogout} onCancel={() => setShowSignOutModal(false)} />}
        </div>
      )}

      {/* Floating Support Actions */}
      {currentUser && currentUser.role !== UserRole.ADMIN && currentView !== AppView.SUPPORT && (
        <div className="fixed bottom-8 right-8 flex flex-col items-end space-y-4 z-[100]">
          {/* WhatsApp Quick Link */}
          <a 
            href="https://wa.me/23274699225"
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[#128C7E] hover:scale-110 transition-all group animate-in slide-in-from-bottom-4 duration-500 delay-100"
            title="Message on WhatsApp"
          >
            <i className="fa-brands fa-whatsapp text-2xl"></i>
            <span className="absolute right-full mr-4 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-white/10">
              WhatsApp Support
            </span>
          </a>

          {/* Support Center Link */}
          <button 
            onClick={() => setCurrentView(AppView.SUPPORT)}
            className="w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 hover:scale-110 transition-all group animate-in zoom-in-50 duration-500"
            title="Support Center"
          >
            <i className="fa-solid fa-headset text-2xl"></i>
            <span className="absolute right-full mr-4 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-white/10">
              Help Center
            </span>
          </button>
        </div>
      )}

      {/* Global Toasts - Rendered on all views */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[500] space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto flex items-center space-x-4 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 border bg-slate-900 text-white border-slate-700 min-w-[300px]">
             <i className={`fa-solid ${t.type === 'success' ? 'fa-circle-check text-emerald-400' : t.type === 'warning' ? 'fa-triangle-exclamation text-amber-400' : 'fa-circle-info text-sky-400'}`}></i>
             <span className="text-sm font-bold">{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
