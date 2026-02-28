
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

interface TrendsProps {
  notify: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

const data = [
  { name: 'Mon', cholera: 4, malaria: 45, lassa: 2, ebola: 0, yellow: 1 },
  { name: 'Tue', cholera: 3, malaria: 52, lassa: 1, ebola: 0, yellow: 0 },
  { name: 'Wed', cholera: 8, malaria: 48, lassa: 4, ebola: 1, yellow: 2 },
  { name: 'Thu', cholera: 12, malaria: 61, lassa: 3, ebola: 0, yellow: 1 },
  { name: 'Fri', cholera: 15, malaria: 55, lassa: 5, ebola: 2, yellow: 3 },
  { name: 'Sat', cholera: 10, malaria: 40, lassa: 2, ebola: 0, yellow: 1 },
  { name: 'Sun', cholera: 7, malaria: 38, lassa: 1, ebola: 0, yellow: 0 },
];

const diseaseMeta = [
  { key: 'malaria', label: 'Malaria', color: '#3b82f6' },
  { key: 'cholera', label: 'Cholera', color: '#10b981' },
  { key: 'lassa', label: 'Lassa Fever', color: '#f59e0b' },
  { key: 'ebola', label: 'Ebola (Suspected)', color: '#ef4444' },
  { key: 'yellow', label: 'Yellow Fever', color: '#8b5cf6' },
];

const Trends: React.FC<TrendsProps> = ({ notify }) => {
  const [activeDiseases, setActiveDiseases] = useState<string[]>(['malaria', 'cholera', 'ebola', 'lassa']);

  const toggleDisease = (key: string) => {
    setActiveDiseases(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">National Epidemiological Trends</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Comparative analysis of regional disease patterns.</p>
         </div>
         <div className="flex space-x-2">
            <select 
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest shadow-sm outline-none cursor-pointer dark:text-white"
              onChange={(e) => notify(`Timeframe updated to ${e.target.value}`, "info")}
            >
               <option className="dark:bg-slate-900">Last 7 Days</option>
               <option className="dark:bg-slate-900">Last 30 Days</option>
               <option className="dark:bg-slate-900">Fiscal Quarter</option>
               <option className="dark:bg-slate-900">Year to Date</option>
            </select>
            <button 
              onClick={() => notify("Initiating high-res CSV export for WHO...", "success")}
              className="bg-slate-900 dark:bg-blue-700 text-white rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-black transition-all"
            >
               <i className="fa-solid fa-download mr-2"></i> Export
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors">
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Pathogen Transmission Intensity</h3>
              <div className="flex flex-wrap items-center gap-3">
                 {diseaseMeta.map(d => (
                   <button 
                    key={d.key} 
                    onClick={() => toggleDisease(d.key)}
                    className={`flex items-center px-3 py-1.5 rounded-full border transition-all ${
                      activeDiseases.includes(d.key) 
                        ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' 
                        : 'opacity-30 grayscale border-transparent'
                    }`}
                   >
                      <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: d.color }}></span>
                      <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{d.label}</span>
                   </button>
                 ))}
              </div>
           </div>
           <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={data}>
                    <defs>
                       {diseaseMeta.map(d => (
                        <linearGradient key={`grad-${d.key}`} id={`color-${d.key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={d.color} stopOpacity={0.1}/>
                          <stop offset="95%" stopColor={d.color} stopOpacity={0}/>
                        </linearGradient>
                       ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '20px'}} 
                      itemStyle={{fontSize: '10px', fontWeight: 800, textTransform: 'uppercase'}}
                    />
                    {diseaseMeta.map(d => activeDiseases.includes(d.key) && (
                      <Area 
                        key={d.key}
                        type="monotone" 
                        dataKey={d.key} 
                        stroke={d.color} 
                        fillOpacity={1} 
                        fill={`url(#color-${d.key})`} 
                        strokeWidth={4} 
                        animationDuration={1500}
                      />
                    ))}
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative group overflow-hidden transition-colors">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Regional Cluster Analysis</h3>
              <i className="fa-solid fa-earth-africa text-slate-100 dark:text-slate-800 text-4xl group-hover:text-blue-50 dark:group-hover:text-blue-900 transition-colors"></i>
           </div>
           <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={[
                   { name: 'Western', cases: 240, active: 180 },
                   { name: 'Eastern', cases: 190, active: 145 },
                   { name: 'Northern', cases: 150, active: 120 },
                   { name: 'Southern', cases: 110, active: 95 },
                   { name: 'North West', cases: 135, active: 110 },
                 ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff'}} />
                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase'}} />
                    <Bar dataKey="cases" name="Historical Baseline" fill="#e2e8f0" radius={[10, 10, 0, 0]} barSize={32} className="dark:opacity-20" />
                    <Bar dataKey="active" name="Current Active" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={32} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-4 bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
           <div className="relative z-10">
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-emerald-600/20">
                 <i className="fa-solid fa-brain text-2xl"></i>
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight leading-tight">Epidemic Intelligence Unit</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                Analysis of rainfall trends in <span className="text-emerald-400 font-bold">Kenema</span> suggests a <span className="text-white font-bold underline decoration-emerald-500 underline-offset-4 decoration-2">22% surge risk</span> for Lassa Fever due to increased rodent displacement.
              </p>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <span className="text-[10px] font-black uppercase text-slate-500">Confidence Factor</span>
                    <span className="text-xs font-black text-emerald-400">94.8%</span>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <span className="text-[10px] font-black uppercase text-slate-500">Alert Status</span>
                    <span className="text-xs font-black text-amber-400 italic">Pre-emptive Alert Required</span>
                 </div>
              </div>
           </div>
           <button onClick={() => notify("Strategic advisory dispatched to regional leads.", "success")} className="w-full mt-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all relative z-10 active:scale-95 shadow-lg shadow-emerald-600/20">
              Deploy Preventive Strategy
           </button>
        </div>
      </div>
    </div>
  );
};

export default Trends;
