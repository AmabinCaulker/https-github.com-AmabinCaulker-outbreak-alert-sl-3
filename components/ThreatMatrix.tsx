
import React, { useState, useEffect } from 'react';
import { User, CaseReport, UserRole, AppView } from '../types';

interface ThreatMatrixProps {
  user: User | null;
  notify: (msg: string, type?: any) => void;
  onNavigate: (view: AppView) => void;
}

const REPORT_DB_KEY = 'alert_sl_reports_database';

const districts = [
  "Western Area Urban", "Western Area Rural", "Kenema", "Bo District", 
  "Bombali", "Kailahun", "Kono", "Port Loko", "Tonkolili", "Pujehun", 
  "Bonthe", "Moyamba", "Kambia", "Falaba", "Koinadugu", "Karene"
];

const diseases = ["Ebola", "Lassa Fever", "Cholera", "Malaria", "Yellow Fever"];

const ThreatMatrix: React.FC<ThreatMatrixProps> = ({ user, notify, onNavigate }) => {
  const [reports, setReports] = useState<CaseReport[]>([]);
  const [matrixData, setMatrixData] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    const saved = localStorage.getItem(REPORT_DB_KEY);
    if (saved) {
      const allReports: CaseReport[] = JSON.parse(saved);
      setReports(allReports);
      
      // Calculate threat levels
      const data: Record<string, Record<string, number>> = {};
      districts.forEach(d => {
        data[d] = {};
        diseases.forEach(dis => {
          const count = allReports.filter(r => r.district === d && r.disease === dis).length;
          data[d][dis] = count;
        });
      });
      setMatrixData(data);
    }
  }, []);

  const getThreatColor = (count: number) => {
    if (count === 0) return 'bg-slate-50 dark:bg-slate-800/30 text-slate-300 dark:text-slate-700';
    if (count < 3) return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
    if (count < 6) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
    if (count < 10) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800';
    return 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 animate-pulse';
  };

  const getThreatLabel = (count: number) => {
    if (count === 0) return 'Stable';
    if (count < 3) return 'Low Risk';
    if (count < 6) return 'Moderate';
    if (count < 10) return 'High Risk';
    return 'CRITICAL';
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
             <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">National Threat Matrix</h2>
             <p className="text-slate-500 dark:text-slate-400 font-medium">Strategic heat-map of pathogen signals across all 16 districts.</p>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={() => notify("Strategic advisory generated for all regional leads.", "success")}
               className="px-6 py-3 bg-slate-900 dark:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all"
             >
                <i className="fa-solid fa-satellite-dish mr-2"></i> Broadcast Advisory
             </button>
             <button 
               onClick={() => onNavigate(AppView.TRENDS)}
               className="px-6 py-3 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white dark:hover:bg-slate-800 transition-all"
             >
                Analytics View
             </button>
          </div>
       </div>

       <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden transition-colors">
          <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                      <i className="fa-solid fa-biohazard"></i>
                  </div>
                  <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">Live Pathogen Grid</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Updated: {new Date().toLocaleTimeString()}</p>
                  </div>
              </div>
              <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded"></div>
                      <span className="text-[9px] font-black text-slate-400 uppercase">Stable</span>
                  </div>
                  <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-rose-500 rounded"></div>
                      <span className="text-[9px] font-black text-slate-400 uppercase">Critical</span>
                  </div>
              </div>
          </div>

          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">
                      <th className="px-10 py-8 sticky left-0 bg-white dark:bg-slate-900 z-10">District Unit</th>
                      {diseases.map(d => (
                        <th key={d} className="px-6 py-8 text-center">{d}</th>
                      ))}
                      <th className="px-10 py-8 text-right">Aggregate Risk</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                   {districts.map(district => {
                      const districtReports = reports.filter(r => r.district === district);
                      const totalCount = districtReports.length;
                      
                      return (
                        <tr key={district} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all">
                           <td className="px-10 py-6 sticky left-0 bg-white dark:bg-slate-900 z-10 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/50 transition-all">
                              <p className="text-sm font-black text-slate-900 dark:text-white">{district}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Active Signals: {totalCount}</p>
                           </td>
                           {diseases.map(disease => {
                              const count = matrixData[district]?.[disease] || 0;
                              return (
                                <td key={disease} className="px-4 py-6">
                                   <div className={`w-full h-16 rounded-2xl flex flex-col items-center justify-center transition-all hover:scale-105 cursor-help ${getThreatColor(count)}`}>
                                      <span className="text-lg font-black">{count}</span>
                                      <span className="text-[8px] font-black uppercase tracking-tighter opacity-60">{getThreatLabel(count)}</span>
                                   </div>
                                </td>
                              );
                           })}
                           <td className="px-10 py-6 text-right">
                              <div className="inline-flex flex-col items-end">
                                 <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                   totalCount > 15 ? 'bg-rose-600 text-white' : 
                                   totalCount > 8 ? 'bg-orange-500 text-white' : 
                                   totalCount > 4 ? 'bg-amber-500 text-white' : 
                                   'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                 }`}>
                                    {totalCount > 15 ? 'Level 4 - Emergency' : 
                                     totalCount > 8 ? 'Level 3 - High' : 
                                     totalCount > 4 ? 'Level 2 - Alert' : 
                                     'Level 1 - Baseline'}
                                 </div>
                                 <p className="text-[8px] font-black text-slate-400 uppercase mt-2 tracking-tighter">Confidence: 98.4%</p>
                              </div>
                           </td>
                        </tr>
                      );
                   })}
                </tbody>
             </table>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
             <h4 className="text-lg font-black mb-6 flex items-center">
                <i className="fa-solid fa-triangle-exclamation text-rose-500 mr-3"></i> Priority Clusters
             </h4>
             <div className="space-y-4">
                {districts.map(d => ({ name: d, count: reports.filter(r => r.district === d).length }))
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 3)
                  .map((cluster, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                       <span className="text-xs font-bold">{cluster.name}</span>
                       <span className="px-2 py-1 bg-rose-500/20 text-rose-400 rounded-lg text-[10px] font-black">{cluster.count} Active</span>
                    </div>
                  ))
                }
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
             <h4 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center">
                <i className="fa-solid fa-chart-line text-blue-500 mr-3"></i> Pathogen Velocity
             </h4>
             <div className="space-y-6">
                {diseases.map(dis => {
                  const count = reports.filter(r => r.disease === dis).length;
                  const percentage = Math.min(100, (count / 20) * 100);
                  return (
                    <div key={dis} className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-slate-500">{dis}</span>
                          <span className="text-slate-900 dark:text-white">{count} Cases</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>

          <div className="bg-emerald-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -ml-16 -mb-16"></div>
             <div>
                <h4 className="text-lg font-black mb-4">Strategic Response</h4>
                <p className="text-sm font-medium opacity-80 leading-relaxed">
                   The matrix indicates a significant cluster of <span className="font-black">Lassa Fever</span> in the Eastern region. Deploying additional PPE and diagnostic kits to Kenema and Kailahun hubs.
                </p>
             </div>
             <button className="w-full mt-8 py-4 bg-white text-emerald-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-50 transition-all shadow-xl">
                Authorize Logistics
             </button>
          </div>
       </div>
    </div>
  );
};

export default ThreatMatrix;
