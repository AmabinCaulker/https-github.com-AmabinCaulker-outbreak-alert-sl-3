
import React from 'react';

interface SignOutConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const SignOutConfirm: React.FC<SignOutConfirmProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      {/* Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onCancel}
      ></div>

      {/* Modal */}
      <div className="relative bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        <div className="p-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center mb-6 border border-red-100 shadow-sm">
             <i className="fa-solid fa-door-open text-4xl text-red-600"></i>
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Sign Out?</h2>
          <p className="text-slate-500 font-medium text-sm leading-relaxed mb-10">
            Are you sure you want to end your active surveillance session? Any unsynced reports might be stored locally until your next login.
          </p>

          <div className="w-full space-y-3">
             <button 
               onClick={onConfirm}
               className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-xl shadow-red-500/20 transition-all active:scale-[0.98]"
             >
                Leave Session
             </button>
             <button 
               onClick={onCancel}
               className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl transition-all"
             >
                Stay Logged In
             </button>
          </div>
        </div>
        
        {/* Decorative Status Bar */}
        <div className="h-2 bg-slate-100 flex">
           <div className="flex-1 bg-blue-500"></div>
           <div className="flex-1 bg-emerald-500"></div>
           <div className="flex-1 bg-red-500"></div>
        </div>
      </div>
    </div>
  );
};

export default SignOutConfirm;
