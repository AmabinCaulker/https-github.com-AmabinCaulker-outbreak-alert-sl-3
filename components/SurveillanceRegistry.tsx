
import React, { useState, useEffect } from 'react';
import { User, CaseReport, UserRole, Permission, LabStatus, IsolationStatus, AppView } from '../types';

interface RegistryProps {
  user: User | null;
  notify: (msg: string, type?: any) => void;
}

const REPORT_DB_KEY = 'alert_sl_reports_database';

const SurveillanceRegistry: React.FC<RegistryProps> = ({ user, notify }) => {
  const [reports, setReports] = useState<CaseReport[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseReport | null>(null);
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Citizen' | 'Professional'>('All');
  const [isVerifying, setIsVerifying] = useState(false);

  // Initial mock data as fall-back
  const defaultMockData: CaseReport[] = [
    {
      id: 'REP-789', 
      disease: 'Lassa Fever', 
      location: 'Kenema', 
      district: 'Kenema',
      status: 'Pending', 
      priority: 'High', 
      date: '2024-10-18', 
      description: 'Patient with high fever, persistent headache, and bleeding gums. Lives near a grain storage area.',
      submitterId: 'u2', 
      submitterName: 'Nurse Fatmata Sesay', 
      submitterRole: UserRole.HEALTH_WORKER,
      labStatus: 'Sample Collected', 
      isolationStatus: 'Facility Isolation', 
      notifiedProfessionals: true,
      contact: '+232 76 555 444',
      age: 28
    },
    {
      id: 'REP-452', 
      disease: 'Cholera', 
      location: 'Aberdeen', 
      district: 'Western Area Urban',
      status: 'Verified', 
      priority: 'Critical', 
      date: '2024-10-17', 
      description: 'Suspected cholera cluster near wharf. 3 children affected with severe watery diarrhea.',
      submitterId: 'u9', 
      submitterName: 'Amadu Koroma', 
      submitterRole: UserRole.PUBLIC,
      labStatus: 'Resulted - Positive', 
      isolationStatus: 'Emergency Quarantine', 
      notifiedProfessionals: true,
      age: 9
    }
  ];

  const loadReports = () => {
    const saved = localStorage.getItem(REPORT_DB_KEY);
    if (saved) {
      setReports(JSON.parse(saved));
    } else {
      setReports(defaultMockData);
      localStorage.setItem(REPORT_DB_KEY, JSON.stringify(defaultMockData));
    }
  };

  useEffect(() => {
    loadReports();
    // Listen for storage events (allows real-time updates if open in multiple tabs)
    const handleStorage = () => loadReports();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleAction = (id: string, newStatus: 'Verified' | 'Dismissed') => {
    setIsVerifying(true);
    setTimeout(() => {
      const updated = reports.map(r => r.id === id ? { ...r, status: newStatus } : r);
      setReports(updated);
      localStorage.setItem(REPORT_DB_KEY, JSON.stringify(updated));
      
      if (selectedCase?.id === id) {
          setSelectedCase(prev => prev ? { ...prev, status: newStatus } : null);
      }
      notify(`Case ${id} marked as ${newStatus}`, newStatus === 'Verified' ? 'success' : 'info');
      setIsVerifying(false);
    }, 800);
  };

  const filtered = reports.filter(r => {
    const matchesSearch = r.id.toLowerCase().includes(filter.toLowerCase()) ||
      r.disease.toLowerCase().includes(filter.toLowerCase()) || 
      r.location.toLowerCase().includes(filter.toLowerCase()) ||
      r.submitterName.toLowerCase().includes(filter.toLowerCase());
    
    const isCitizen = r.submitterRole === UserRole.PUBLIC;
    const matchesRole = roleFilter === 'All' || 
      (roleFilter === 'Citizen' && isCitizen) || 
      (roleFilter === 'Professional' && !isCitizen);
      
    return matchesSearch && matchesRole;
  });

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'Critical': return 'bg-rose-100 text-rose-600 border-rose-200';
      case 'High': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'Medium': return 'bg-blue-100 text-blue-600 border-blue-200';
      default: return 'bg-emerald-100 text-emerald-600 border-emerald-200';
    }
  };

  const canManageCases = user?.role === UserRole.HEALTH_WORKER || user?.role === UserRole.ADMIN;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Surveillance Registry</h2>
           <p className="text-slate-500 dark:text-slate-400 font-medium">National database shared between Citizens and Health Professionals.</p>
        </div>
        <div className="flex gap-3">
           <div className="relative group">
              <i className="fa-solid fa-filter absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"></i>
              <select 
                className="pl-12 pr-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all w-full md:w-48 shadow-sm dark:text-white cursor-pointer"
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value as any)}
              >
                 <option value="All">All Sources</option>
                 <option value="Citizen">Citizen Reports</option>
                 <option value="Professional">Health Professionals</option>
              </select>
           </div>
           <div className="relative group">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"></i>
              <input 
                type="text" 
                className="pl-12 pr-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all w-full md:w-80 shadow-sm dark:text-white" 
                placeholder="Search Database..." 
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Live Intake Feed</h3>
            <div className="flex items-center space-x-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Record Count: {filtered.length}</span>
                <button onClick={loadReports} className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors flex items-center justify-center">
                    <i className="fa-solid fa-rotate-right"></i>
                </button>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-10 py-6">Case ID</th>
                <th className="px-10 py-6">Infection Detail</th>
                <th className="px-10 py-6">District / Locality</th>
                <th className="px-10 py-6">Filing Agent</th>
                <th className="px-10 py-6">Tier</th>
                <th className="px-10 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filtered.map(report => (
                <tr 
                  key={report.id} 
                  onClick={() => setSelectedCase(report)}
                  className={`group cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all ${selectedCase?.id === report.id ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}
                >
                  <td className="px-10 py-6">
                    <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{report.id}</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{report.date.split(',')[0]}</p>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{report.disease}</p>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{report.location}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase">{report.district}</p>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-sm font-black text-slate-700 dark:text-slate-300">{report.submitterName}</p>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                        {report.submitterRole.split(' ')[0]}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${getPriorityStyle(report.priority)}`}>
                        {report.priority}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:border-indigo-200 group-hover:shadow-md transition-all">
                        <i className="fa-solid fa-chevron-right text-xs"></i>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-10 py-20 text-center opacity-30 italic font-black uppercase tracking-[0.2em] text-slate-400">
                        No reports matching your search.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

       {/* Case Intelligence Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar transition-colors">
              <div className="relative">
                 <div className={`h-48 bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/5 opacity-10 flex flex-wrap justify-around">
                        {[...Array(20)].map((_, i) => <i key={i} className={`fa-solid fa-virus-shield text-4xl m-4`}></i>)}
                    </div>
                    <div className="text-center relative z-10">
                        <div className={`px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-widest mb-4 inline-block`}>
                           Secure National Record
                        </div>
                        <h3 className="text-4xl font-black text-white tracking-tight">{selectedCase.id}</h3>
                    </div>
                 </div>
                 <button 
                   onClick={() => setSelectedCase(null)}
                   className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center z-20"
                 >
                    <i className="fa-solid fa-xmark"></i>
                 </button>
              </div>

              <div className="p-10 lg:p-14 space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem]">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Patient Profile</p>
                            <h4 className="text-lg font-black text-slate-900 dark:text-white">{selectedCase.patientName || 'Anonymous Citizen'}</h4>
                            <div className="flex items-center space-x-4 mt-2">
                                <span className="text-xs font-bold text-slate-500">Age: <span className="text-slate-900 dark:text-white">{selectedCase.age || 'N/A'}</span></span>
                                <span className="text-xs font-bold text-slate-500">Status: <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${selectedCase.status === 'Verified' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'}`}>{selectedCase.status}</span></span>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem]">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Symptom Context</p>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">"{selectedCase.description}"</p>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-[2rem]">
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">Filing Agent</p>
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm shadow-sm">
                                    {selectedCase.submitterName.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{selectedCase.submitterName}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{selectedCase.submitterRole}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Lab Tracking</span>
                                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{selectedCase.labStatus || 'Pending'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Containment</span>
                                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">{selectedCase.isolationStatus || 'Evaluating'}</span>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* Professional Controls */}
                 {canManageCases && (
                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h4 className="text-xl font-black text-slate-900 dark:text-white">Health Unit Response</h4>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Coordinate official response actions below.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <button 
                             disabled={isVerifying || selectedCase.status === 'Verified'}
                             onClick={() => handleAction(selectedCase.id, 'Verified')}
                             className={`py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center ${
                               selectedCase.status === 'Verified' 
                               ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' 
                               : 'bg-emerald-600 text-white shadow-emerald-500/20 hover:scale-105 active:scale-95'
                             }`}
                           >
                              {isVerifying ? <i className="fa-solid fa-circle-notch animate-spin mr-2"></i> : <i className="fa-solid fa-check-double mr-2"></i>}
                              {selectedCase.status === 'Verified' ? 'Case Confirmed' : 'Verify Outbreak'}
                           </button>
                           <button 
                             disabled={isVerifying || selectedCase.status === 'Dismissed'}
                             onClick={() => handleAction(selectedCase.id, 'Dismissed')}
                             className="py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center"
                           >
                              <i className="fa-solid fa-xmark mr-2"></i> Dismiss Case
                           </button>
                        </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SurveillanceRegistry;
