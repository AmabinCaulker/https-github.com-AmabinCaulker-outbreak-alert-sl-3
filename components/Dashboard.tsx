
import React, { useState, useEffect } from 'react';
import { User, AppView, UserRole, NewsArticle, CaseReport } from '../types';
import { analyzeRegionalThreat } from '../services/geminiService';
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  user: User | null;
  onNavigate: (view: AppView, data?: any) => void;
  notify: (msg: string, type?: any) => void;
  systemVitals?: any;
  notifications?: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate, notify, systemVitals, notifications = [] }) => {
  const isAdmin = user?.role === UserRole.ADMIN;
  const isHealthWorker = user?.role === UserRole.HEALTH_WORKER;
  const isPublic = user?.role === UserRole.PUBLIC;

  const [dbReports, setDbReports] = useState<CaseReport[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeDistrict, setActiveDistrict] = useState(user?.district || 'Freetown');
  const [intelligenceReport, setIntelligenceReport] = useState<any>(null);

  useEffect(() => {
    const savedReports = localStorage.getItem('alert_sl_reports_database');
    setDbReports(savedReports ? JSON.parse(savedReports) : []);
  }, []);

  const runStrategicAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const metrics = { reports_count: dbReports.filter(r => r.district === activeDistrict).length };
      const report = await analyzeRegionalThreat(activeDistrict, metrics);
      setIntelligenceReport(report);
      notify("Regional Strategic Scan Complete", "success");
    } catch (error) {
      notify('Strategic analysis failed.', 'warning');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- PUBLIC INTERFACE (Citizen) ---
  if (isPublic) {
    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        <section className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[3rem] p-10 lg:p-16 relative overflow-hidden border border-white/20 dark:border-white/10 shadow-xl transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-6">How are you feeling, {user?.name.split(' ')[0]}?</h2>
              <p className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">Your community and health workers are looking out for you in {user?.district}. Report any symptoms to stay safe.</p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => onNavigate(AppView.REPORT_SUBMISSION)} className="px-10 py-5 bg-brand-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-glow hover:scale-105 transition-all">
                  Report Symptoms
                </button>
                <button onClick={() => onNavigate(AppView.AI_BUDDY)} className="px-10 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-brand-primary rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                  Talk to Health Buddy
                </button>
              </div>
            </div>
            <div className="hidden lg:block animate-float">
               <div className="w-56 h-56 bg-emerald-100 dark:bg-emerald-900/30 rounded-[3rem] flex items-center justify-center text-brand-primary text-7xl shadow-2xl">
                  <i className="fa-solid fa-heart-pulse"></i>
               </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Nearby Help", desc: "Find the nearest medical center in " + user?.district, icon: "fa-hospital", color: "text-emerald-500", action: () => onNavigate(AppView.MAP, { layer: 'Hospitals' }) },
            { title: "Health Alerts", desc: "View verified bulletins for your area", icon: "fa-newspaper", color: "text-sky-500", action: () => onNavigate(AppView.NEWS) },
            { title: "Get Support", desc: "Call 117 or contact our help desk", icon: "fa-phone-volume", color: "text-indigo-500", action: () => onNavigate(AppView.SUPPORT) }
          ].map((card, i) => (
            <div key={i} onClick={card.action} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-lg p-8 flex flex-col items-start rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-sm hover:shadow-xl transition-all cursor-pointer group">
               <div className={`w-14 h-14 rounded-2xl bg-brand-bg dark:bg-slate-800 flex items-center justify-center text-2xl mb-6 ${card.color}`}>
                  <i className={`fa-solid ${card.icon}`}></i>
               </div>
               <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{card.title}</h3>
               <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6 leading-relaxed">{card.desc}</p>
               <button className="text-brand-primary font-black text-[10px] uppercase tracking-widest mt-auto group-hover:translate-x-1 transition-transform">Learn More <i className="fa-solid fa-arrow-right ml-1"></i></button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- HEALTH WORKER INTERFACE ---
  if (isHealthWorker) {
    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
           <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Clinical Surveillance</h2>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Operational Hub: {user?.district}</p>
           </div>
           <div className="flex gap-3">
              <button onClick={() => onNavigate(AppView.THREAT_MATRIX)} className="px-6 py-3 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-700 transition-all">Threat Matrix</button>
              <button onClick={() => onNavigate(AppView.SURVEILLANCE_REGISTRY)} className="px-6 py-3 bg-brand-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-glow hover:bg-brand-secondary transition-all">Registry Queue</button>
              <button onClick={() => onNavigate(AppView.TASKS)} className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all">My Operations</button>
           </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { label: 'Cases Pending', value: dbReports.filter(r => r.status === 'Pending').length, icon: 'fa-folder-open', color: 'text-sky-500' },
             { label: 'Critical Alerts', value: dbReports.filter(r => r.priority === 'Critical').length, icon: 'fa-biohazard', color: 'text-rose-500' },
             { label: 'Verified Cases', value: dbReports.filter(r => r.status === 'Verified').length, icon: 'fa-check-double', color: 'text-emerald-500' },
             { label: 'Team Ready', value: '14 Responders', icon: 'fa-user-nurse', color: 'text-indigo-500' },
           ].map((stat, i) => (
             <div key={i} className="card-friendly p-8 border-l-4 border-l-brand-primary">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-brand-bg ${stat.color}`}>
                    <i className={`fa-solid ${stat.icon}`}></i>
                  </div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Live</span>
                </div>
                <p className="text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                 <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Recent Citizen Reports</h3>
                    <button onClick={() => onNavigate(AppView.SURVEILLANCE_REGISTRY)} className="text-brand-primary font-black text-[10px] uppercase tracking-widest hover:underline">View All Registry <i className="fa-solid fa-arrow-right ml-1"></i></button>
                 </div>
                 <div className="p-0">
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800">
                                <th className="px-10 py-4">ID</th>
                                <th className="px-10 py-4">Disease</th>
                                <th className="px-10 py-4">Location</th>
                                <th className="px-10 py-4">Status</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                             {dbReports.filter(r => r.submitterRole === UserRole.PUBLIC).slice(0, 5).map(report => (
                                <tr key={report.id} onClick={() => onNavigate(AppView.SURVEILLANCE_REGISTRY)} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                   <td className="px-10 py-5 text-xs font-black text-slate-900 dark:text-white">{report.id}</td>
                                   <td className="px-10 py-5 text-xs font-bold text-slate-600 dark:text-slate-400">{report.disease}</td>
                                   <td className="px-10 py-5 text-xs font-medium text-slate-500 dark:text-slate-500">{report.location}</td>
                                   <td className="px-10 py-5">
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${report.status === 'Verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                         {report.status}
                                      </span>
                                   </td>
                                </tr>
                             ))}
                             {dbReports.filter(r => r.submitterRole === UserRole.PUBLIC).length === 0 && (
                                <tr>
                                   <td colSpan={4} className="px-10 py-10 text-center text-slate-400 text-xs font-medium italic">No citizen reports found.</td>
                                </tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                 <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">District Incident Map</h3>
                    <div className="flex items-center space-x-2">
                       <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing with field units...</span>
                    </div>
                 </div>
                 <div className="h-[300px] bg-brand-bg dark:bg-slate-800 relative flex items-center justify-center">
                    <i className="fa-solid fa-map-location-dot text-8xl text-sky-200 dark:text-sky-900/30"></i>
                    <button onClick={() => onNavigate(AppView.MAP)} className="absolute inset-0 w-full h-full flex items-center justify-center bg-brand-primary/5 hover:bg-brand-primary/10 transition-all">
                      <span className="bg-white dark:bg-slate-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-brand-primary shadow-2xl">Enter Full Surveillance Map</span>
                    </button>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl flex flex-col">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black flex items-center">
                    <i className="fa-solid fa-satellite-dish text-emerald-400 mr-3"></i> Live Feed
                 </h3>
                 <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">Real-Time</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar max-h-[350px]">
                 {notifications.length > 0 ? (
                   notifications.map((n, i) => (
                     <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-2xl animate-in slide-in-from-right-4">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{n.title}</span>
                           <span className="text-[8px] text-slate-500">{new Date(n.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-300 leading-relaxed">{n.message}</p>
                     </div>
                   ))
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center opacity-30 text-center py-10">
                      <i className="fa-solid fa-wave-square text-4xl mb-4"></i>
                      <p className="text-[10px] font-black uppercase tracking-widest">Awaiting field signals...</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    );
  }

  // --- ADMINISTRATOR INTERFACE ---
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
         <div className="flex items-center space-x-5">
            <div className="w-14 h-14 bg-slate-900 dark:bg-slate-950 rounded-2xl flex items-center justify-center text-brand-primary border border-slate-800 dark:border-slate-800 shadow-2xl">
               <i className="fa-solid fa-tower-observation text-2xl"></i>
            </div>
            <div>
               <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">National Command</h2>
               <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Strategic Oversight Layer</p>
            </div>
         </div>
         <div className="flex gap-3">
            <button onClick={() => onNavigate(AppView.THREAT_MATRIX)} className="px-6 py-3 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-700 transition-all">Threat Matrix</button>
            <button onClick={() => onNavigate(AppView.ADMIN_PANEL)} className="px-6 py-3 bg-slate-900 dark:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-brand-primary transition-all">Identity Core</button>
            <button onClick={() => {
              notify("Generating Strategic Briefing...", "success");
              setTimeout(() => window.print(), 1000);
            }} className="px-6 py-3 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center">
               <i className="fa-solid fa-file-pdf mr-2"></i> Download Strategic Briefing
            </button>
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[3rem] p-10 border border-white/20 dark:border-white/10 shadow-sm relative overflow-hidden transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                 <div>
                    <h3 className="text-2xl font-black tracking-tight mb-2 dark:text-white">Regional Intelligence Scanner</h3>
                    <p className="text-slate-400 font-medium text-sm">Strategic AI scan based on <span className="text-brand-primary">{dbReports.length}</span> active signals.</p>
                 </div>
                 <div className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <select value={activeDistrict} onChange={(e) => setActiveDistrict(e.target.value)} className="bg-transparent text-[10px] font-black uppercase tracking-widest px-4 py-2 outline-none border-none cursor-pointer dark:text-white">
                       {['Western Area Urban', 'Kenema', 'Bo District', 'Bombali', 'Kailahun'].map(d => <option key={d} className="dark:bg-slate-900">{d}</option>)}
                    </select>
                    <button onClick={runStrategicAnalysis} disabled={isAnalyzing} className="px-6 py-3 bg-brand-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-glow hover:bg-brand-secondary transition-all flex items-center disabled:opacity-50">
                       {isAnalyzing ? <i className="fa-solid fa-circle-notch animate-spin"></i> : 'Deploy Scan'}
                    </button>
                 </div>
              </div>

              {intelligenceReport ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-8">
                   <div className="p-8 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2.5rem]">
                      <h4 className="text-sm font-black uppercase tracking-widest mb-6 dark:text-white">Threat Level: {intelligenceReport.threatLevel}</h4>
                      <div className="space-y-4">
                        {intelligenceReport.riskFactors.map((risk: string, i: number) => (
                          <div key={i} className="flex items-start text-xs font-medium text-slate-600 dark:text-slate-400">
                             <span className="w-1.5 h-1.5 rounded-full bg-brand-primary mr-3 mt-1.5 shrink-0"></span>
                             {risk}
                          </div>
                        ))}
                      </div>
                   </div>
                   <div className="p-8 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2.5rem]">
                      <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-6">Tactical Strategy</h4>
                      <p className="text-sm italic text-slate-800 dark:text-slate-200 leading-relaxed mb-6">"{intelligenceReport.strategicAdvice}"</p>
                      <div className="flex flex-col sm:flex-row gap-4">
                         <button onClick={() => onNavigate(AppView.TRENDS)} className="text-brand-primary font-black text-[10px] uppercase tracking-widest hover:underline">View Trend Analytics <i className="fa-solid fa-chart-line ml-1"></i></button>
                         <button onClick={() => notify("Deployment Authorized for " + activeDistrict, "success")} className="ml-auto px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all">
                            Authorize Deployment
                         </button>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="py-24 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] flex flex-col items-center justify-center opacity-30">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] dark:text-slate-400">Deploy scan to analyze active district signals</p>
                </div>
              )}
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900/80 backdrop-blur-xl rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden h-full flex flex-col border border-white/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <h3 className="text-xl font-black mb-10 flex items-center relative z-10">
                 <i className="fa-solid fa-shield-halved text-brand-primary mr-3"></i> System Vitals
              </h3>
              <div className="space-y-8 relative z-10 flex-1">
                 <div onClick={() => onNavigate(AppView.TRENDS)} className="p-6 bg-white/5 border border-white/10 rounded-3xl cursor-pointer hover:bg-white/10 transition-all group">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest group-hover:text-brand-primary transition-colors">Network Stability</p>
                    <div className="flex items-end justify-between mb-2">
                       <span className="text-3xl font-black">{systemVitals?.stability || '99.8'}%</span>
                       <span className="text-[10px] font-black text-brand-primary">SECURE</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-brand-primary transition-all duration-1000" style={{ width: `${systemVitals?.stability || 99.8}%` }}></div>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div onClick={() => onNavigate(AppView.ADMIN_PANEL)} className="p-5 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all group">
                       <p className="text-[8px] font-black text-slate-500 uppercase mb-1 group-hover:text-brand-primary transition-colors">Active Nodes</p>
                       <p className="text-lg font-black">{systemVitals?.activeUsers || '12'}</p>
                    </div>
                    <div onClick={() => onNavigate(AppView.TRENDS)} className="p-5 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all group">
                       <p className="text-[8px] font-black text-slate-500 uppercase mb-1 group-hover:text-brand-primary transition-colors">IO Latency</p>
                       <p className="text-lg font-black text-emerald-400">{systemVitals?.latency || '42'}ms</p>
                    </div>
                 </div>
              </div>
              <button onClick={() => onNavigate(AppView.TRENDS)} className="w-full mt-10 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-brand-primary hover:text-white transition-all">
                 System Overview
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
