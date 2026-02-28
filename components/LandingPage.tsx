
import React from 'react';
import { AppView } from '../types';

interface LandingPageProps {
  onNavigate: (view: AppView) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const stats = [
    { label: 'Districts Syncing', value: '16' },
    { label: 'Responders Active', value: '2.4K' },
    { label: 'Infrastructure', value: '850+' },
    { label: 'Pulse Frequency', value: 'Live' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden relative">
      {/* Background Glassmorphism Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-400/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-indigo-400/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Brand Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-2xl border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-4 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <div className="bg-[#0066FF] w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="font-black text-xl text-white tracking-tighter leading-none">Outbreak Alert SL</h1>
            <p className="text-[9px] text-blue-400 font-black uppercase tracking-[0.3em] mt-1">National Health Security</p>
          </div>
        </div>
        <div className="flex items-center space-x-8">
          <button 
            onClick={() => onNavigate(AppView.AUTH)} 
            className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors"
          >
            Access Gateway
          </button>
          <button 
            onClick={() => onNavigate(AppView.AUTH)}
            className="bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95"
          >
            Enter Portal
          </button>
        </div>
      </nav>

      {/* Hero: Resilience & Security */}
      <section className="relative min-h-screen flex items-center px-8 pt-20">
        <div className="absolute inset-0 z-0 opacity-20 vigilance-pattern pointer-events-none"></div>
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <div className="space-y-10">
             <div className="inline-flex items-center space-x-3 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">Live Surveillance Network</span>
             </div>
             <h1 className="text-6xl lg:text-8xl font-black text-slate-900 leading-[0.9] tracking-tight">
               Built for <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Resilience.</span>
             </h1>
             <p className="text-xl text-slate-500 font-medium max-w-lg leading-relaxed">
               Securing the health of our nation through integrated detection, rapid response, and community-led vigilance.
             </p>
             <div className="flex flex-col sm:flex-row gap-5 pt-4">
                <button 
                  onClick={() => onNavigate(AppView.AUTH)}
                  className="px-10 py-6 bg-[#0066FF] text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95"
                >
                  Join the Network
                </button>
                <div className="flex items-center space-x-4 px-6 py-4 bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 shadow-sm">
                   <div className="flex -space-x-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                           <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                        </div>
                      ))}
                   </div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                     <span className="text-slate-900">2,400+</span> <br /> Verified Personnel
                   </p>
                </div>
             </div>
          </div>
          <div className="relative">
             <div className="bg-slate-900 rounded-[4rem] aspect-square shadow-3xl overflow-hidden relative group">
                <img 
                  src="https://tse3.mm.bing.net/th/id/OIP.5jYeSGZo9aGwNluNcQlntgHaER?rs=1&pid=ImgDetMain&o=7&rm=3" 
                  alt="Clinical Surveillance" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                <div className="absolute bottom-12 left-12 right-12">
                   <div className="p-8 bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2.5rem] space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Real-time Data Stream</span>
                         <span className="text-[10px] font-black text-emerald-400">ACTIVE</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500 w-[72%] animate-pulse"></div>
                      </div>
                      <p className="text-sm text-white/80 font-medium">Monitoring regional symptom clusters in real-time across the Freetown corridor.</p>
                   </div>
                </div>
             </div>
             {/* Decorative Elements */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Brand Stats Section */}
      <section className="py-24 px-8 bg-slate-900/90 backdrop-blur-lg relative overflow-hidden">
        <div className="absolute inset-0 vigilance-pattern-dark opacity-10"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
          {stats.map((stat, i) => (
            <div key={i} className="text-center group">
               <p className="text-5xl lg:text-7xl font-black text-white mb-2 tracking-tighter group-hover:text-blue-500 transition-colors">{stat.value}</p>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The Brand Values: Security, Speed, Community */}
      <section className="py-32 px-8">
         <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {[
                  { title: "National Security", icon: "fa-shield-halved", color: "blue", desc: "Hardened infrastructure protecting citizen data and national health interests." },
                  { title: "Rapid Response", icon: "fa-bolt-lightning", color: "amber", desc: "Automated alert pipelines ensuring a sub-24hr field verification cycle." },
                  { title: "Localized Trust", icon: "fa-hand-holding-heart", color: "emerald", desc: "Bilingual AI interfaces bridging the gap between clinical data and the people." }
               ].map((v, i) => (
                  <div key={i} className="bg-white/40 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white/20 hover:border-blue-200 transition-all shadow-sm group">
                     <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-10 transition-transform group-hover:scale-110 shadow-lg ${
                        v.color === 'blue' ? 'bg-blue-600 text-white' : 
                        v.color === 'amber' ? 'bg-amber-500 text-white' : 
                        'bg-emerald-600 text-white'
                     }`}>
                        <i className={`fa-solid ${v.icon}`}></i>
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 mb-4">{v.title}</h3>
                     <p className="text-slate-500 font-medium leading-relaxed">{v.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Brand Footer */}
      <footer className="py-20 px-8 bg-emerald-950 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
           <div className="flex items-center justify-center space-x-3 text-emerald-400/50 mb-10">
              <i className="fa-solid fa-virus-shield text-2xl"></i>
              <span className="font-black text-sm uppercase tracking-widest text-emerald-100">Outbreak Alert SL Foundation</span>
           </div>
           <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.4em] leading-loose">
             Official National Health Security Asset <br />
             <span className="text-emerald-200/80">Ministry of Health • Sierra Leone • 2024</span>
           </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
