
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

const trendData = [
  { name: 'Jan', ebola: 4, cholera: 24, malaria: 400 },
  { name: 'Feb', ebola: 3, cholera: 13, malaria: 300 },
  { name: 'Mar', ebola: 2, cholera: 98, malaria: 200 },
  { name: 'Apr', ebola: 27, cholera: 39, malaria: 278 },
  { name: 'May', ebola: 18, cholera: 48, malaria: 189 },
  { name: 'Jun', ebola: 23, cholera: 38, malaria: 239 },
  { name: 'Jul', ebola: 34, cholera: 43, malaria: 349 },
];

const districtData = [
  { name: 'Western Area', cases: 450, color: '#3b82f6' },
  { name: 'Kenema', cases: 300, color: '#10b981' },
  { name: 'Bo', cases: 200, color: '#f59e0b' },
  { name: 'Bombali', cases: 150, color: '#ef4444' },
  { name: 'Kailahun', cases: 100, color: '#8b5cf6' },
];

const demographicData = [
  { name: '0-18', value: 400 },
  { name: '19-35', value: 300 },
  { name: '36-50', value: 300 },
  { name: '50+', value: 200 },
];

const resourceData = [
  { name: 'Western', beds: 85, staff: 92, meds: 78 },
  { name: 'Kenema', beds: 45, staff: 60, meds: 90 },
  { name: 'Bo', beds: 70, staff: 80, meds: 65 },
  { name: 'Bombali', beds: 30, staff: 40, meds: 50 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminAnalytics: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Top Row: Trends and Geography */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Chart */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group transition-colors">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fa-solid fa-chart-line text-6xl dark:text-white"></i>
          </div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Outbreak Trends</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monthly case volume by pathogen</p>
            </div>
            <div className="flex space-x-2">
              <span className="flex items-center text-[10px] font-black text-blue-500 uppercase tracking-widest">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> Ebola
              </span>
              <span className="flex items-center text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span> Cholera
              </span>
            </div>
          </div>
          <div className="h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorEbola" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCholera" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px', backgroundColor: '#1e293b', color: '#fff'}}
                />
                <Area type="monotone" dataKey="ebola" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEbola)" strokeWidth={3} />
                <Area type="monotone" dataKey="cholera" stroke="#10b981" fillOpacity={1} fill="url(#colorCholera)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Geographical Distribution */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group transition-colors">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fa-solid fa-map-location-dot text-6xl dark:text-white"></i>
          </div>
          <div className="mb-8 relative z-10">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Geographical Distribution</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verified cases by district hub</p>
          </div>
          <div className="h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
                  width={100}
                />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px', backgroundColor: '#1e293b', color: '#fff'}}
                />
                <Bar dataKey="cases" radius={[0, 10, 10, 0]} barSize={20}>
                  {districtData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Middle Row: Demographics and Resource Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Demographics */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="mb-8">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Affected Demographics</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Age group distribution</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demographicData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {demographicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px', backgroundColor: '#1e293b', color: '#fff'}}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Readiness */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Resource Readiness Index</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Capacity by regional hub (%)</p>
            </div>
            <div className="flex space-x-4">
               <div className="flex items-center text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span> Beds
               </div>
               <div className="flex items-center text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5"></span> Staff
               </div>
               <div className="flex items-center text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-1.5"></span> Meds
               </div>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px', backgroundColor: '#1e293b', color: '#fff'}}
                />
                <Bar dataKey="beds" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="staff" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="meds" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Summary Stats and Decision Support */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6">National Threat Matrix</p>
            <div className="flex items-center space-x-4 mb-8">
               <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 border border-red-500/20">
                  <i className="fa-solid fa-radiation text-3xl"></i>
               </div>
               <div>
                  <h4 className="text-3xl font-black">MODERATE</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level 3 Vigilance Required</p>
               </div>
            </div>
            <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 hover:text-white transition-all">
               Download Strategic Briefing
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">Decision Support Engine</p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Recommended Action: Resource Reallocation</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
                Based on current trends, we recommend shifting <span className="text-blue-600 font-bold">15% of medical supplies</span> from Western Area to <span className="text-red-600 font-bold">Bombali</span> where resource readiness has dropped below 50%.
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-xl shrink-0">
               <i className="fa-solid fa-brain"></i>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
             <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                   <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">
                      {String.fromCharCode(64 + i)}
                   </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-blue-600 flex items-center justify-center text-[10px] font-black text-white">
                   +12
                </div>
             </div>
             <button className="px-6 py-3 bg-slate-900 dark:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">
                Authorize Deployment
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
