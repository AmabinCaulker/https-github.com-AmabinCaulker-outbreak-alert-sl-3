
import React from 'react';
import { User } from '../types';

interface SupportCenterProps {
  user: User | null;
}

const SupportCenter: React.FC<SupportCenterProps> = ({ user }) => {
  const supportPhoneNumber = "+23276000000"; // Placeholder for Sierra Leone Support Line
  
  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-5">
        <div className="inline-flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
           <i className="fa-solid fa-headset text-indigo-600"></i>
           <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Sierra Leone Health Helpline</span>
        </div>
        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">How can we help you?</h2>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
          Contact the National Health Support team for advice, reporting assistance, or help using the Outbreak Alert SL portal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Urgent Help - Priority 1 */}
        <div className="bg-rose-50 border border-rose-100 p-10 rounded-[3.5rem] space-y-8 shadow-sm group hover:shadow-xl transition-all border-b-8 border-b-rose-200">
          <div className="w-20 h-20 bg-rose-600 text-white rounded-3xl flex items-center justify-center text-3xl shadow-2xl shadow-rose-500/30 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-phone-volume"></i>
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-black text-rose-900">Emergency (117)</h3>
            <p className="text-base text-rose-700 font-medium opacity-90 leading-relaxed">
              If you suspect Ebola, Lassa Fever, or Cholera, stop everything and dial 117 immediately. This is the fastest way to get help.
            </p>
            <a 
              href="tel:117" 
              className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black text-xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-500/20 flex items-center justify-center space-x-4 active:scale-95"
            >
               <i className="fa-solid fa-phone-flip"></i>
               <span>Dial 117 Now</span>
            </a>
          </div>
        </div>

        {/* Support & Voice Assistance - Priority 2 */}
        <div className="bg-emerald-50 border border-emerald-100 p-10 rounded-[3.5rem] space-y-8 shadow-sm group hover:shadow-xl transition-all border-b-8 border-b-emerald-200">
          <div className="w-20 h-20 bg-emerald-600 text-white rounded-3xl flex items-center justify-center text-3xl shadow-2xl shadow-emerald-500/30 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-headset"></i>
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-black text-emerald-900">Community Support</h3>
            <p className="text-base text-emerald-700 font-medium opacity-90 leading-relaxed">
              For general health questions or help with the app, call our dedicated help desk or message us on WhatsApp.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a 
                href={`tel:${supportPhoneNumber}`} 
                className="py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-3 active:scale-95"
              >
                 <i className="fa-solid fa-phone text-sm"></i>
                 <span>Call Desk</span>
              </a>
              <a 
                href="https://wa.me/23274699225" 
                target="_blank"
                rel="noopener noreferrer"
                className="py-5 bg-[#25D366] text-white rounded-2xl font-black text-lg hover:bg-[#128C7E] transition-all shadow-xl shadow-green-500/20 flex items-center justify-center space-x-3 active:scale-95"
              >
                 <i className="fa-brands fa-whatsapp text-xl"></i>
                 <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-10">
        {/* FAQs */}
        <div className="space-y-8">
          <h3 className="text-2xl font-black text-slate-900 flex items-center">
            <span className="w-2 h-8 bg-indigo-600 rounded-full mr-4"></span>
            Common Questions
          </h3>
          <div className="space-y-4">
            {[
              { q: "How do I report offline?", a: "The app saves your report automatically. As soon as you get a mobile signal, click the 'Sync' button to send it to the Ministry." },
              { q: "Is it free to use the app?", a: "Yes, using the Outbreak Alert SL portal and calling 117 is completely free for all citizens in Sierra Leone." },
              { q: "Can I report for a neighbor?", a: "Yes. You can report on behalf of family members, neighbors, or anyone in your community who is showing symptoms." },
              { q: "What happens after I report?", a: "Local health workers in your district will be notified. They may visit to provide advice or medical assistance." }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all">
                <p className="font-black text-slate-900 mb-2 flex items-center justify-between text-base">
                  {faq.q}
                  <i className="fa-solid fa-chevron-down text-[10px] text-slate-300 group-hover:text-indigo-500 transition-colors"></i>
                </p>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Resources & System Status */}
        <div className="space-y-8">
           <h3 className="text-2xl font-black text-slate-900 flex items-center">
            <span className="w-2 h-8 bg-indigo-600 rounded-full mr-4"></span>
            Health Resources
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col p-6 bg-white rounded-[2rem] border border-slate-100 text-left hover:bg-indigo-50 transition-all shadow-sm group">
               <i className="fa-solid fa-file-pdf text-rose-500 text-3xl mb-4 group-hover:scale-110 transition-transform"></i>
               <span className="font-black text-slate-900 text-sm">Health Guide</span>
               <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Symptom PDF</span>
            </button>
            <button className="flex flex-col p-6 bg-white rounded-[2rem] border border-slate-100 text-left hover:bg-indigo-50 transition-all shadow-sm group">
               <i className="fa-solid fa-video text-indigo-500 text-3xl mb-4 group-hover:scale-110 transition-transform"></i>
               <span className="font-black text-slate-900 text-sm">Advice Videos</span>
               <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">12 Lessons</span>
            </button>
            <button className="flex flex-col p-6 bg-white rounded-[2rem] border border-slate-100 text-left hover:bg-indigo-50 transition-all shadow-sm group">
               <i className="fa-solid fa-map-location text-emerald-500 text-3xl mb-4 group-hover:scale-110 transition-transform"></i>
               <span className="font-black text-slate-900 text-sm">Facility Finder</span>
               <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">District Map</span>
            </button>
            <button className="flex flex-col p-6 bg-white rounded-[2rem] border border-slate-100 text-left hover:bg-indigo-50 transition-all shadow-sm group">
               <i className="fa-solid fa-radio text-orange-500 text-3xl mb-4 group-hover:scale-110 transition-transform"></i>
               <span className="font-black text-slate-900 text-sm">Radio Alerts</span>
               <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Audio Briefings</span>
            </button>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
             <div className="flex items-center justify-between mb-6 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Infrastructure Health</span>
                <span className="flex items-center text-[10px] font-black text-emerald-400">
                   <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
                   Online & Ready
                </span>
             </div>
             <div className="space-y-4 relative z-10">
                <div className="flex justify-between text-xs font-bold border-b border-white/5 pb-3">
                   <span className="opacity-60 font-medium">Report Sync Server</span>
                   <span className="text-emerald-400">Active</span>
                </div>
                <div className="flex justify-between text-xs font-bold pt-1">
                   <span className="opacity-60 font-medium">SMS Dispatch Center</span>
                   <span className="text-emerald-400">Stable</span>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      <div className="text-center pt-8 opacity-30 grayscale">
         <i className="fa-solid fa-shield-virus text-3xl mb-4"></i>
         <p className="text-[10px] font-black uppercase tracking-[0.3em]">Official Ministry of Health Support Portal</p>
      </div>
    </div>
  );
};

export default SupportCenter;
