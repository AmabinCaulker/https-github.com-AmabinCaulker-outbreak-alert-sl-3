
import React, { useEffect, useState } from 'react';
import { User, Permission, AuditEntry, UserRole, UserStatus, SMSAlertLog, NewsArticle } from '../types';
import { getSMSLogs } from '../services/smsService';
import AdminAnalytics from './AdminAnalytics';

interface AdminPanelProps {
  user?: User | null;
  notify: (msg: string, type?: any) => void;
}

type AdminTab = 'users' | 'news' | 'access' | 'system' | 'audit' | 'analytics' | 'emails';

const AdminPanel: React.FC<AdminPanelProps> = ({ user, notify }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [auditFilter, setAuditFilter] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [trackedEmails, setTrackedEmails] = useState<any[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  
  // News State
  const [newsList, setNewsList] = useState<NewsArticle[]>([
    { id: 'N1', title: 'Cholera Advisory: Bo District', disease: 'Cholera', content: 'Citizens are advised to boil water due to seasonal flooding.', priority: 'Medium', author: 'Dr. Bah', date: '2024-10-15', district: 'Bo', published: true }
  ]);
  
  // Explicitly type newArticle to match NewsArticle's priority union type
  const [newArticle, setNewArticle] = useState<{
    title: string;
    disease: string;
    content: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    district: string;
  }>({
    title: '',
    disease: 'Cholera',
    content: '',
    priority: 'Medium',
    district: 'All Districts'
  });

  const [mockUsers, setMockUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    if (activeTab === 'users') {
      setIsLoadingUsers(true);
      fetch('/api/admin/users')
        .then(res => res.json())
        .then(data => setMockUsers(data))
        .catch(err => notify("Failed to load user registry", "warning"))
        .finally(() => setIsLoadingUsers(false));
    }
  }, [activeTab]);

  const [sysConfig, setSysConfig] = useState({
    aiAutoTriage: true,
    smsThreshold: 'Critical',
    publicReporting: true,
    maintenanceMode: false
  });

  const hasPermission = (p: Permission) => user?.permissions?.includes(p);

  useEffect(() => {
    if (hasPermission(Permission.VIEW_AUDIT_LOGS)) {
      const savedLogs = localStorage.getItem('system_audit_logs');
      if (savedLogs) setLogs(JSON.parse(savedLogs));
    }
    // Load local news if any
    const savedNews = localStorage.getItem('public_news_alerts');
    if (savedNews) setNewsList(JSON.parse(savedNews));
  }, [user]);

  useEffect(() => {
    if (activeTab === 'emails') {
      setIsLoadingEmails(true);
      fetch('/api/admin/emails')
        .then(res => res.json())
        .then(data => setTrackedEmails(data))
        .catch(err => notify("Failed to load email logs", "warning"))
        .finally(() => setIsLoadingEmails(false));
    }
  }, [activeTab]);

  const handleStatusChange = (userId: string, newStatus: UserStatus) => {
    setMockUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    notify(`User account status updated to ${newStatus}`, "success");
  };

  const toggleConfig = (key: keyof typeof sysConfig) => {
    // Toggling the logic based on key. 
    // Note: Implicitly assumes the values are boolean, which is true for the toggle controls in the UI.
    setSysConfig(prev => ({ ...prev, [key]: !prev[key] }));
    // Fix: Explicitly wrap 'key' in String() to prevent implicit symbol to string conversion error.
    notify(`System protocol updated: ${String(key)}`, "info");
  };

  const handlePublishNews = () => {
    if (!newArticle.title || !newArticle.content) {
      notify("Please provide a heading and content for the advisory.", "warning");
      return;
    }
    
    // Ensure the article object strictly conforms to the NewsArticle type
    const article: NewsArticle = {
      id: `NW-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      ...newArticle,
      author: user?.name || 'Administrator',
      date: new Date().toLocaleDateString(),
      published: true
    };
    const updatedNews = [article, ...newsList];
    setNewsList(updatedNews);
    localStorage.setItem('public_news_alerts', JSON.stringify(updatedNews));
    setNewArticle({ title: '', disease: 'Cholera', content: '', priority: 'Medium', district: 'All Districts' });
    notify("Public Advisory Published to National Dashboard", "success");
  };

  const filteredLogs = logs.filter(l => 
    l.userName.toLowerCase().includes(auditFilter.toLowerCase()) ||
    l.action.toLowerCase().includes(auditFilter.toLowerCase()) ||
    l.id.toLowerCase().includes(auditFilter.toLowerCase())
  );

  if (!hasPermission(Permission.MANAGE_SETTINGS)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-[3rem] border border-slate-100">
        <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">
           <i className="fa-solid fa-shield-slash"></i>
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Access Restricted</h2>
        <p className="text-slate-500 max-w-sm font-medium">This command layer requires National Security clearance.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Tab Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tight">System Control</h2>
           <p className="text-slate-500 font-medium">National Health Surveillance Administration</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm self-start lg:self-center overflow-x-auto no-scrollbar max-w-full">
           {(['analytics', 'users', 'news', 'access', 'system', 'audit', 'emails'] as AdminTab[]).map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${
                 activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
               }`}
             >
               {tab === 'news' ? 'Advisories' : tab === 'emails' ? 'Email Logs' : tab}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* News & Public Alerts Section */}
        {activeTab === 'news' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in slide-in-from-right-4">
             <div className="xl:col-span-5 space-y-6">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                   <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center">
                      <i className="fa-solid fa-bullhorn text-blue-500 mr-3"></i> Draft Public Alert
                   </h3>
                   <div className="space-y-4">
                      <div>
                         <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Alert Heading</label>
                         <input 
                           type="text" 
                           className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white focus:border-blue-400 transition-all outline-none" 
                           placeholder="e.g., Lassa Fever Warning..." 
                           value={newArticle.title}
                           onChange={e => setNewArticle({...newArticle, title: e.target.value})}
                         />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Pathogen Focus</label>
                            <select 
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black outline-none"
                              value={newArticle.disease}
                              onChange={e => setNewArticle({...newArticle, disease: e.target.value})}
                            >
                               {['Cholera', 'Lassa Fever', 'Ebola', 'Malaria', 'Covid-19'].map(d => <option key={d}>{d}</option>)}
                            </select>
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Priority</label>
                            <select 
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black outline-none"
                              value={newArticle.priority}
                              onChange={e => setNewArticle({...newArticle, priority: e.target.value as any})}
                            >
                               {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p}>{p}</option>)}
                            </select>
                         </div>
                      </div>
                      <div>
                         <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Message Content (Citizens)</label>
                         <textarea 
                           rows={6} 
                           className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-blue-400 transition-all outline-none" 
                           placeholder="Write detailed instructions for the public..."
                           value={newArticle.content}
                           onChange={e => setNewArticle({...newArticle, content: e.target.value})}
                         />
                      </div>
                      <button onClick={handlePublishNews} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                         Publish National Advisory
                      </button>
                   </div>
                </div>
             </div>
             <div className="xl:col-span-7 space-y-6">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 h-full">
                   <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center justify-between">
                      Active Advisories
                      <span className="text-xs font-bold text-slate-400">{newsList.length} total</span>
                   </h3>
                   <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {newsList.map(news => (
                        <div key={news.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] relative group hover:bg-white hover:border-blue-100 transition-all cursor-pointer">
                           <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                 <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                    news.priority === 'Critical' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                                 }`}>{news.priority}</span>
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{news.date} • {news.disease}</span>
                              </div>
                              <div className="flex space-x-2">
                                 <button className="p-2 text-slate-300 hover:text-blue-500 transition-colors"><i className="fa-solid fa-pen-to-square"></i></button>
                                 <button className="p-2 text-slate-300 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash-can"></i></button>
                              </div>
                           </div>
                           <h4 className="text-lg font-black text-slate-900 mb-2">{news.title}</h4>
                           <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{news.content}</p>
                           <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                              <span className="text-[9px] font-bold text-slate-400">Published by {news.author}</span>
                              <div className="flex items-center text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                 <i className="fa-solid fa-circle-check mr-1.5"></i> Live on Portal
                              </div>
                           </div>
                        </div>
                      ))}
                      {newsList.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                           <i className="fa-solid fa-newspaper text-5xl mb-4"></i>
                           <p className="font-black uppercase tracking-widest">No Active Public Alerts</p>
                        </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Identity Management with expandable details */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-right-4">
             <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <h3 className="text-xl font-black text-slate-900">Identity Management</h3>
                   <p className="text-sm text-slate-500 font-medium">Coordinate clearance for the Health workforce.</p>
                </div>
                <div className="flex gap-2">
                   <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none"><i className="fa-solid fa-magnifying-glass text-xs"></i></span>
                      <input type="text" className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:bg-white" placeholder="Search officers..." />
                   </div>
                   <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-95">Invite Hub Lead</button>
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                         <th className="px-10 py-5">Identified Participant</th>
                         <th className="px-10 py-5">Organizational Role</th>
                         <th className="px-10 py-5">District Hub</th>
                         <th className="px-10 py-5">Account Status</th>
                         <th className="px-10 py-5 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {mockUsers.map(u => (
                        <React.Fragment key={u.id}>
                          <tr 
                            onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                            className={`group hover:bg-slate-50/30 transition-colors cursor-pointer ${expandedUser === u.id ? 'bg-slate-50/50' : ''}`}
                          >
                             <td className="px-10 py-6">
                                <div className="flex items-center space-x-4">
                                   <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs relative overflow-hidden group-hover:scale-105 transition-all">
                                      {u.name.split(' ').map(n => n[0]).join('')}
                                   </div>
                                   <div>
                                      <p className="font-black text-slate-900 text-sm">{u.name}</p>
                                      <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-10 py-6">
                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                  u.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                  u.role === UserRole.HEALTH_WORKER ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                  'bg-slate-50 text-slate-600 border-slate-100'
                                }`}>
                                   {u.role.split(' ')[0]}
                                </span>
                                {u.staffId && <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">REG: {u.staffId}</p>}
                             </td>
                             <td className="px-10 py-6 font-bold text-slate-600 text-sm">{u.district}</td>
                             <td className="px-10 py-6">
                                <div className="flex items-center space-x-2">
                                   <div className={`w-1.5 h-1.5 rounded-full ${u.status === UserStatus.ACTIVE ? 'bg-emerald-500' : u.status === UserStatus.PENDING_VERIFICATION ? 'bg-amber-500' : 'bg-red-500'} animate-pulse`}></div>
                                   <span className="text-xs font-bold text-slate-700">{u.status}</span>
                                </div>
                             </td>
                             <td className="px-10 py-6 text-right space-x-2">
                                <i className={`fa-solid ${expandedUser === u.id ? 'fa-chevron-up' : 'fa-chevron-down'} text-slate-300 text-xs`}></i>
                             </td>
                          </tr>
                          {expandedUser === u.id && (
                            <tr className="bg-slate-50/50 animate-in slide-in-from-top-2 duration-300">
                               <td colSpan={5} className="px-10 py-8">
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                     <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assigned Facility</p>
                                        <p className="text-sm font-bold text-slate-900">{u.facilityName || 'N/A'}</p>
                                     </div>
                                     <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Activity</p>
                                        <p className="text-sm font-bold text-slate-900">{u.lastLogin}</p>
                                     </div>
                                     <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">System Privileges</p>
                                        <div className="flex gap-1 flex-wrap">
                                           {u.role === UserRole.ADMIN ? <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 text-[8px] font-black rounded uppercase">Superuser</span> : <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[8px] font-black rounded uppercase">Clinical Access</span>}
                                        </div>
                                     </div>
                                     <div className="flex items-center justify-end space-x-3">
                                        {u.status === UserStatus.PENDING_VERIFICATION && (
                                          <button onClick={(e) => { e.stopPropagation(); handleStatusChange(u.id, UserStatus.ACTIVE); }} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-700 transition-all">Verify Credentials</button>
                                        )}
                                        <button onClick={(e) => e.stopPropagation()} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-slate-800 transition-all">Security Audit</button>
                                        <button onClick={(e) => { e.stopPropagation(); handleStatusChange(u.id, UserStatus.SUSPENDED); }} className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Revoke</button>
                                     </div>
                                  </div>
                               </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {/* Audit Logs with filtering */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 animate-in slide-in-from-right-4">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                   <h3 className="text-xl font-black text-slate-900">National Event Audit</h3>
                   <p className="text-sm text-slate-500 font-medium">Sequential record of authorized system interactions.</p>
                </div>
                <div className="flex gap-2">
                   <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none"><i className="fa-solid fa-filter text-xs"></i></span>
                      <input 
                        type="text" 
                        className="pl-9 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:bg-white transition-all" 
                        placeholder="Filter by Officer or Action..." 
                        value={auditFilter}
                        onChange={e => setAuditFilter(e.target.value)}
                      />
                   </div>
                   <button onClick={() => { localStorage.removeItem('system_audit_logs'); setLogs([]); notify("Audit trail purged", "info"); }} className="px-4 py-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Wipe History</button>
                </div>
             </div>
             <div className="overflow-hidden rounded-3xl border border-slate-100">
                <table className="w-full text-left text-xs">
                   <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <th className="px-6 py-4">Event Sequence</th>
                         <th className="px-6 py-4">Authorized User</th>
                         <th className="px-6 py-4">Action Summary</th>
                         <th className="px-6 py-4 text-right">Time Matrix</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {filteredLogs.length > 0 ? filteredLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-6 py-4 font-black text-slate-400">{log.id}</td>
                           <td className="px-6 py-4">
                              <p className="font-bold text-slate-900">{log.userName}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{log.userRole.split(' ')[0]}</p>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                 <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                 <span className="font-medium text-slate-600">{log.action}</span>
                              </div>
                              {log.details && <p className="text-[9px] text-slate-400 mt-1 italic">{log.details}</p>}
                           </td>
                           <td className="px-6 py-4 text-right">
                              <p className="font-black text-slate-900 uppercase">{new Date(log.timestamp).toLocaleTimeString()}</p>
                              <p className="text-[8px] font-bold text-slate-300">{new Date(log.timestamp).toLocaleDateString()}</p>
                           </td>
                        </tr>
                      )) : (
                        <tr>
                           <td colSpan={4} className="px-6 py-20 text-center text-slate-300 font-black italic uppercase tracking-widest">
                              {auditFilter ? 'No Records Match Filter Criteria' : 'System Ready • Waiting for Event Sequential Data'}
                           </td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {/* Access Matrix */}
        {activeTab === 'access' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 animate-in slide-in-from-right-4">
             <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center">
                <i className="fa-solid fa-key text-blue-500 mr-3"></i> Unified Access Matrix
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[UserRole.PUBLIC, UserRole.HEALTH_WORKER, UserRole.ADMIN].map(role => (
                   <div key={role} className="p-8 rounded-[2rem] border border-slate-100 bg-slate-50/50 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                         <i className={`fa-solid ${role === UserRole.ADMIN ? 'fa-crown' : role === UserRole.HEALTH_WORKER ? 'fa-user-md' : 'fa-users'} text-6xl`}></i>
                      </div>
                      <h4 className="font-black text-slate-900 mb-6 flex items-center justify-between relative z-10">
                         {role.split(' ')[0]} 
                         <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Role Tier</span>
                      </h4>
                      <div className="space-y-3 relative z-10">
                         {Object.values(Permission).map(perm => {
                           const has = role === UserRole.ADMIN || 
                                       (role === UserRole.HEALTH_WORKER && ![Permission.MANAGE_SETTINGS, Permission.MANAGE_USERS, Permission.VIEW_AUDIT_LOGS].includes(perm)) ||
                                       (role === UserRole.PUBLIC && perm === Permission.CREATE_REPORTS);
                           return (
                             <div key={perm} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${has ? 'bg-white border-slate-100 shadow-sm' : 'opacity-20 grayscale border-transparent'}`}>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{perm.replace(/_/g, ' ')}</span>
                                <i className={`fa-solid ${has ? 'fa-circle-check text-emerald-500' : 'fa-circle-xmark text-slate-300'} text-xs`}></i>
                             </div>
                           );
                         })}
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* Protocols / System Settings */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-4">
             <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
                <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center">
                   <i className="fa-solid fa-microchip text-blue-500 mr-3"></i> AI Intelligence Core
                </h3>
                <div className="space-y-6">
                   <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-blue-200 transition-all cursor-pointer" onClick={() => toggleConfig('aiAutoTriage')}>
                      <div>
                         <p className="font-black text-slate-900 text-sm">Automated Triage Engine</p>
                         <p className="text-xs text-slate-400 font-medium">Use Gemini Vision/Text for case priority assessment.</p>
                      </div>
                      <div className={`w-12 h-7 rounded-full relative transition-all ${sysConfig.aiAutoTriage ? 'bg-blue-600' : 'bg-slate-300'}`}>
                         <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${sysConfig.aiAutoTriage ? 'left-6' : 'left-1'}`}></div>
                      </div>
                   </div>
                   <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-blue-200 transition-all cursor-pointer" onClick={() => toggleConfig('publicReporting')}>
                      <div>
                         <p className="font-black text-slate-900 text-sm">Public Intake Gateway</p>
                         <p className="text-xs text-slate-400 font-medium">Accept report submissions from non-verified IDs.</p>
                      </div>
                      <div className={`w-12 h-7 rounded-full relative transition-all ${sysConfig.publicReporting ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                         <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${sysConfig.publicReporting ? 'left-6' : 'left-1'}`}></div>
                      </div>
                   </div>
                </div>
                <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-3xl">
                   <div className="flex items-center space-x-3 mb-2">
                      <i className="fa-solid fa-circle-info text-blue-500 text-xs"></i>
                      <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Protocol Status</p>
                   </div>
                   <p className="text-xs text-blue-800 font-medium leading-relaxed">System is currently operating under Standard Vigilance Level. AI-assisted triage is responding within 400ms.</p>
                </div>
             </div>
             <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10">
                   <h3 className="text-xl font-black mb-8 flex items-center">
                      <i className="fa-solid fa-tower-broadcast text-blue-400 mr-3"></i> Emergency Dispatch
                   </h3>
                   <div className="space-y-6">
                      <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                         <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Regional SMS Broadcast Trigger</p>
                         <div className="flex flex-wrap gap-2">
                            {['Medium', 'High', 'Critical'].map(level => (
                               <button 
                                 key={level} 
                                 onClick={() => { setSysConfig({...sysConfig, smsThreshold: level}); notify(`Threshold updated to ${level}`, "success"); }}
                                 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sysConfig.smsThreshold === level ? 'bg-blue-600 text-white ring-4 ring-blue-500/20' : 'bg-white/10 text-slate-400 hover:text-white hover:bg-white/20'}`}
                               >
                                  {level}
                               </button>
                            ))}
                         </div>
                      </div>
                      <div className="flex items-center space-x-4 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl">
                         <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
                            <i className="fa-solid fa-satellite-dish text-sm"></i>
                         </div>
                         <p className="text-[10px] font-medium text-red-100 leading-relaxed">
                            Protocols will trigger automated SMS dispatches to all health workers in affected districts for <span className="font-black text-white">{sysConfig.smsThreshold}</span> priority detections.
                         </p>
                      </div>
                      <div className="pt-4 border-t border-white/10">
                         <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-400">Gateway Heartbeat</span>
                            <span className="text-[10px] font-black text-emerald-400">99.2% Stable</span>
                         </div>
                         <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 w-[99%]"></div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
        {/* Email Logs */}
        {activeTab === 'emails' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 animate-in slide-in-from-right-4">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-xl font-black text-slate-900">Email Dispatch Logs</h3>
                   <p className="text-sm text-slate-500 font-medium">Real-time tracking of system-generated communications.</p>
                </div>
                <button 
                  onClick={() => {
                    setIsLoadingEmails(true);
                    fetch('/api/admin/emails')
                      .then(res => res.json())
                      .then(data => setTrackedEmails(data))
                      .finally(() => setIsLoadingEmails(false));
                  }}
                  className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all"
                >
                  <i className={`fa-solid fa-rotate ${isLoadingEmails ? 'animate-spin' : ''}`}></i>
                </button>
             </div>
             <div className="overflow-hidden rounded-3xl border border-slate-100">
                <table className="w-full text-left text-xs">
                   <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <th className="px-6 py-4">Recipient</th>
                         <th className="px-6 py-4">Subject</th>
                         <th className="px-6 py-4">Message Body</th>
                         <th className="px-6 py-4 text-right">Timestamp</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {trackedEmails.length > 0 ? trackedEmails.map((email, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-6 py-4">
                              <p className="font-bold text-slate-900">{email.to}</p>
                           </td>
                           <td className="px-6 py-4">
                              <p className="font-medium text-slate-600">{email.subject}</p>
                           </td>
                           <td className="px-6 py-4">
                              <p className="text-[10px] text-slate-500 max-w-xs truncate">{email.body}</p>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <p className="font-black text-slate-900 uppercase">{new Date(email.timestamp).toLocaleTimeString()}</p>
                              <p className="text-[8px] font-bold text-slate-300">{new Date(email.timestamp).toLocaleDateString()}</p>
                           </td>
                        </tr>
                      )) : (
                        <tr>
                           <td colSpan={4} className="px-6 py-20 text-center text-slate-300 font-black italic uppercase tracking-widest">
                              No email dispatches recorded in this session.
                           </td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        {activeTab === 'analytics' && <AdminAnalytics />}
      </div>
    </div>
  );
};

export default AdminPanel;
