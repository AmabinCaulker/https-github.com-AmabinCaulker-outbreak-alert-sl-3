
import React, { useState, useEffect } from 'react';
import { User, UserRole, Permission } from '../types';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Stalled';
  assignedTeam: string;
  district: string;
  progress: number;
  dueDate: string;
  lastUpdate: string;
}

interface TasksProps {
  user: User | null;
  notify: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

const Tasks: React.FC<TasksProps> = ({ user, notify }) => {
  const isAdmin = user?.role === UserRole.ADMIN;
  const [filter, setFilter] = useState<'All' | 'Critical' | 'Active'>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'TSK-102',
      title: 'Water Source Investigation',
      description: 'Analyze main well in Kroo Bay for V. cholerae contamination following cluster reports.',
      priority: 'Critical',
      status: 'In Progress',
      assignedTeam: 'Rapid Response Unit 1',
      district: 'Western Area Urban',
      progress: 65,
      dueDate: 'Today, 6:00 PM',
      lastUpdate: '12 mins ago'
    },
    {
      id: 'TSK-105',
      title: 'PPE Resupply: Kenema Gov Hospital',
      description: 'Deliver 500 units of Grade-A hazmat suits and 2000 N95 masks to regional hub.',
      priority: 'High',
      status: 'Pending',
      assignedTeam: 'Logistics Team A',
      district: 'Kenema',
      progress: 0,
      dueDate: 'Oct 22, 2024',
      lastUpdate: '2 hours ago'
    },
    {
      id: 'TSK-108',
      title: 'Community Sensitization',
      description: 'Radio broadcast and town hall meeting in Bo regarding Lassa fever prevention.',
      priority: 'Medium',
      status: 'Completed',
      assignedTeam: 'District Health Bo',
      district: 'Bo District',
      progress: 100,
      dueDate: 'Yesterday',
      lastUpdate: '4 hours ago'
    }
  ]);

  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Pending',
    district: 'Western Area Urban',
    assignedTeam: 'RRU Alpha'
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const task: Task = {
      id: `TSK-${Math.floor(Math.random() * 900) + 100}`,
      title: newTask.title || 'Untitled Mission',
      description: newTask.description || '',
      priority: (newTask.priority as any) || 'Medium',
      status: 'Pending',
      assignedTeam: newTask.assignedTeam || 'Unassigned',
      district: newTask.district || 'All Districts',
      progress: 0,
      dueDate: 'TBD',
      lastUpdate: 'Just now'
    };
    setTasks([task, ...tasks]);
    setShowCreateModal(false);
    notify(`Mission ${task.id} dispatched to ${task.district}`, 'success');
  };

  const updateTaskStatus = (id: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { 
      ...t, 
      status: newStatus, 
      progress: newStatus === 'Completed' ? 100 : t.progress,
      lastUpdate: 'Just now'
    } : t));
    notify(`Task ${id} status updated to ${newStatus}`, 'info');
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'Critical') return t.priority === 'Critical';
    if (filter === 'Active') return t.status === 'In Progress' || t.status === 'Pending';
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tight">Field Operations</h2>
           <p className="text-slate-500 font-medium">Coordinate rapid response missions and logistics across districts.</p>
        </div>
        <div className="flex gap-3">
           <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
              {(['All', 'Active', 'Critical'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                    filter === f ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {f}
                </button>
              ))}
           </div>
           <button 
             onClick={() => setShowCreateModal(true)}
             className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:scale-105 transition-all flex items-center"
           >
              <i className="fa-solid fa-plus mr-3"></i>
              Dispatch Mission
           </button>
        </div>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Task List */}
        <div className="xl:col-span-8 space-y-4">
           {filteredTasks.map(task => (
             <div key={task.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-blue-200 transition-all p-8 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-2 h-full ${
                  task.priority === 'Critical' ? 'bg-red-600' : 
                  task.priority === 'High' ? 'bg-orange-500' :
                  'bg-blue-600'
                }`}></div>
                
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                   <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3 mb-1">
                         <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                           task.priority === 'Critical' ? 'bg-red-50 text-red-600 border border-red-100' :
                           'bg-blue-50 text-blue-600 border border-blue-100'
                         }`}>
                           {task.priority} Priority
                         </span>
                         <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{task.id}</span>
                         <span className="text-[10px] font-bold text-slate-400">• Last active {task.lastUpdate}</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{task.title}</h3>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">{task.description}</p>
                      
                      <div className="flex flex-wrap gap-4 pt-4">
                         <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-600">
                            <i className="fa-solid fa-people-group text-slate-300"></i>
                            <span>{task.assignedTeam}</span>
                         </div>
                         <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-600">
                            <i className="fa-solid fa-location-dot text-slate-300"></i>
                            <span>{task.district}</span>
                         </div>
                         <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-600">
                            <i className="fa-solid fa-calendar-day text-slate-300"></i>
                            <span>Due {task.dueDate}</span>
                         </div>
                      </div>
                   </div>

                   <div className="md:w-48 space-y-4">
                      <div className="space-y-2">
                         <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Mission Progress</span>
                            <span className="text-xs font-black text-slate-900">{task.progress}%</span>
                         </div>
                         <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${task.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                              style={{ width: `${task.progress}%` }}
                            ></div>
                         </div>
                      </div>
                      
                      <div className="flex gap-2">
                         {task.status !== 'Completed' ? (
                           <>
                             <button 
                               onClick={() => updateTaskStatus(task.id, 'In Progress')}
                               className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${task.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white'}`}
                             >
                               {task.status === 'In Progress' ? 'Active' : 'Start'}
                             </button>
                             <button 
                               onClick={() => updateTaskStatus(task.id, 'Completed')}
                               className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
                             >
                               Resolve
                             </button>
                           </>
                         ) : (
                           <div className="w-full py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-center flex items-center justify-center">
                              <i className="fa-solid fa-circle-check mr-2"></i> Resolved
                           </div>
                         )}
                      </div>
                   </div>
                </div>
             </div>
           ))}

           {filteredTasks.length === 0 && (
             <div className="bg-white rounded-[3rem] p-20 border border-slate-100 flex flex-col items-center text-center opacity-40">
                <i className="fa-solid fa-clipboard-list text-6xl text-slate-200 mb-6"></i>
                <p className="text-lg font-black text-slate-400 uppercase tracking-widest">No Active Missions Found</p>
             </div>
           )}
        </div>

        {/* Operational Statistics */}
        <div className="xl:col-span-4 space-y-8">
           <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <h3 className="text-xl font-black mb-8 flex items-center relative z-10">
                 <i className="fa-solid fa-tower-broadcast text-blue-400 mr-3"></i> Response Vitals
              </h3>
              <div className="space-y-6 relative z-10">
                 <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Team Readiness</p>
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-2xl font-black">12/15</span>
                       <span className="text-[10px] font-black text-emerald-400">Deployed</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 w-[80%]"></div>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                       <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Avg Resolution</p>
                       <p className="text-lg font-black">4.2h</p>
                    </div>
                    <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                       <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Stock Status</p>
                       <p className="text-lg font-black text-emerald-400">92%</p>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-white/10">
                    <button onClick={() => notify('Requesting national briefing...', 'info')} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-400 hover:text-white transition-all">
                       Download OPS Briefing
                    </button>
                 </div>
              </div>
           </div>

           {/* Field Comms Simulation */}
           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 h-full">
              <h3 className="text-xl font-black text-slate-900 mb-8">Field Check-ins</h3>
              <div className="space-y-6 relative">
                 <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-100"></div>
                 {[
                   { user: 'Sgt. Bah', msg: 'PPE resupply received at Kenema hub.', time: '2m ago' },
                   { user: 'Nurse Fofana', msg: 'Water testing completed at Kroo Bay. Samples sent to lab.', time: '14m ago' },
                   { user: 'Officer Kallon', msg: 'Sensitization van leaving for Koidu district.', time: '1h ago' }
                 ].map((chat, i) => (
                   <div key={i} className="relative pl-10">
                      <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400 ring-4 ring-white">
                         {chat.user.split(' ')[1][0]}
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-blue-50 transition-colors">
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black text-slate-900">{chat.user}</span>
                            <span className="text-[8px] font-bold text-slate-400">{chat.time}</span>
                         </div>
                         <p className="text-xs text-slate-600 font-medium leading-relaxed">{chat.msg}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Dispatch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300">
              <form onSubmit={handleCreateTask}>
                <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                   <div>
                      <h3 className="text-2xl font-black text-slate-900">Dispatch Mission</h3>
                      <p className="text-sm text-slate-500 font-medium">Coordinate a new field response unit.</p>
                   </div>
                   <button type="button" onClick={() => setShowCreateModal(false)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-red-500 transition-colors">
                      <i className="fa-solid fa-xmark"></i>
                   </button>
                </div>
                <div className="p-10 space-y-6">
                   <div className="space-y-4">
                      <div>
                         <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mission Objective</label>
                         <input 
                           type="text" 
                           required 
                           className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:border-blue-400 outline-none transition-all" 
                           placeholder="e.g. Deliver Emergency ORS Kits"
                           value={newTask.title}
                           onChange={e => setNewTask({...newTask, title: e.target.value})}
                         />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Target District</label>
                            <select 
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none"
                              value={newTask.district}
                              onChange={e => setNewTask({...newTask, district: e.target.value})}
                            >
                               {['Western Area Urban', 'Kenema', 'Bo District', 'Bombali', 'Kailahun'].map(d => <option key={d}>{d}</option>)}
                            </select>
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Priority</label>
                            <select 
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none"
                              value={newTask.priority}
                              onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                            >
                               {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p}>{p}</option>)}
                            </select>
                         </div>
                      </div>
                      <div>
                         <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Detailed Briefing</label>
                         <textarea 
                           rows={4} 
                           className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-blue-400 outline-none transition-all"
                           placeholder="Provide specific instructions for field teams..."
                           value={newTask.description}
                           onChange={e => setNewTask({...newTask, description: e.target.value})}
                         />
                      </div>
                   </div>
                   <div className="pt-6 border-t border-slate-100 flex gap-4">
                      <button type="submit" className="flex-1 py-5 bg-blue-600 text-white rounded-3xl font-black uppercase text-xs shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                         Dispatch Team Now
                      </button>
                   </div>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
