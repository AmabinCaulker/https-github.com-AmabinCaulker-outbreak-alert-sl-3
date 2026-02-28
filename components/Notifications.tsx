
import React from 'react';
import { SystemNotification } from '../types';

interface NotificationsProps {
  notifications: SystemNotification[];
  onMarkRead: (id: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, onMarkRead }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Intelligence Feed</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Real-time Disease Surveillance Updates</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Connection Active</span>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="py-20 border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center opacity-30">
            <i className="fa-solid fa-bell-slash text-4xl mb-4"></i>
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">No active signals in your feed</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-8 rounded-[2.5rem] border transition-all hover:shadow-xl group relative overflow-hidden ${
                notif.readBy.length === 0 ? 'bg-white border-blue-100 shadow-lg shadow-blue-500/5' : 'bg-slate-50 border-slate-100 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-start space-x-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${
                    notif.type === 'DISEASE_UPDATE' ? 'bg-rose-500 text-white' : 'bg-blue-600 text-white'
                  }`}>
                    <i className={`fa-solid ${notif.type === 'DISEASE_UPDATE' ? 'fa-biohazard' : 'fa-circle-info'}`}></i>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-xl font-black text-slate-900">{notif.title}</h4>
                      {notif.readBy.length === 0 && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[8px] font-black uppercase rounded tracking-widest">New Signal</span>
                      )}
                    </div>
                    <p className="text-slate-600 font-medium leading-relaxed max-w-2xl">{notif.message}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">
                      <i className="fa-regular fa-clock mr-1"></i> {new Date(notif.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                {notif.readBy.length === 0 && (
                  <button 
                    onClick={() => onMarkRead(notif.id)}
                    className="p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title="Mark as read"
                  >
                    <i className="fa-solid fa-check-double"></i>
                  </button>
                )}
              </div>
              {notif.readBy.length === 0 && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
