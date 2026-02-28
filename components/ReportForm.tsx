
import React, { useState } from 'react';
import { User, AppView, UserRole, CaseReport } from '../types';
import { analyzeReportSymptoms } from '../services/geminiService';

interface ReportFormProps {
  user: User | null;
  onNavigate: (view: AppView, data?: any) => void;
  notify: (msg: string, type?: any) => void;
}

const REPORT_DB_KEY = 'alert_sl_reports_database';

const ReportForm: React.FC<ReportFormProps> = ({ user, onNavigate, notify }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const isProfessional = user?.role === UserRole.HEALTH_WORKER || user?.role === UserRole.ADMIN;
  
  // Dynamic Theming
  const themeColor = user?.role === UserRole.ADMIN ? 'bg-blue-600' : 
                     user?.role === UserRole.HEALTH_WORKER ? 'bg-emerald-600' : 
                     'bg-indigo-600';
  const themeFocus = user?.role === UserRole.ADMIN ? 'focus:border-blue-400' : 
                     user?.role === UserRole.HEALTH_WORKER ? 'focus:border-emerald-400' : 
                     'focus:border-indigo-400';
  const themeBg = user?.role === UserRole.ADMIN ? 'bg-blue-50' : 
                   user?.role === UserRole.HEALTH_WORKER ? 'bg-emerald-50' : 
                   'bg-indigo-50';
  const themeText = user?.role === UserRole.ADMIN ? 'text-blue-600' : 
                    user?.role === UserRole.HEALTH_WORKER ? 'text-emerald-600' : 
                    'text-indigo-600';

  const [formData, setFormData] = useState({
    disease: '',
    location: '',
    description: '',
    priority: 'Medium' as const,
    patientName: '',
    age: '',
    contact: '',
    symptoms: [] as string[],
    onsetDate: '',
    travelHistory: '',
    hasTravelHistory: false,
    contactWithSick: false,
    rodentExposure: false,
    bushmeatContact: false,
    cleanWater: true,
    peopleAffected: '1',
    progression: 'Stable',
    householdSize: '1-3',
    occupation: 'Other',
    clinicalNotes: '',
    assignedTo: '',
    patientHistory: ''
  });

  const symptomsList = [
    { id: 'fever', label: 'High Fever', icon: 'fa-temperature-high' },
    { id: 'diarrhea', label: 'Severe Diarrhea', icon: 'fa-droplet-slash' },
    { id: 'vomiting', label: 'Vomiting', icon: 'fa-face-frown-open' },
    { id: 'bleeding', label: 'Unusual Bleeding', icon: 'fa-droplet' },
    { id: 'fatigue', label: 'Extreme Fatigue', icon: 'fa-bed' },
    { id: 'headache', label: 'Headache', icon: 'fa-head-side-virus' },
    { id: 'cough', label: 'Persistent Cough', icon: 'fa-lungs' },
    { id: 'rash', label: 'Skin Rash', icon: 'fa-braille' },
  ];

  const occupations = [
    { id: 'Farmer', label: 'Farmer', icon: 'fa-wheat-awn' },
    { id: 'Miner', label: 'Miner', icon: 'fa-pickaxe' },
    { id: 'Trader', label: 'Trader/Market', icon: 'fa-shop' },
    { id: 'Student', label: 'Student', icon: 'fa-user-graduate' },
    { id: 'Health', label: 'Health Worker', icon: 'fa-user-nurse' },
    { id: 'Other', label: 'Other', icon: 'fa-user' }
  ];

  const toggleSymptom = (id: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(id) 
        ? prev.symptoms.filter(s => s !== id) 
        : [...prev.symptoms, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // AI Analysis using full structured data
    const analysis = await analyzeReportSymptoms(formData.description, {
      ...formData,
      travelHistory: formData.hasTravelHistory ? formData.travelHistory : 'None',
    });
    
    const newReport: CaseReport = {
      id: `REP-${Math.floor(Math.random() * 9000) + 1000}`,
      disease: analysis?.likelyDisease || 'Under Review',
      location: formData.location || 'Unknown',
      district: user?.district || 'Unknown',
      status: 'Pending',
      priority: analysis?.priority || formData.priority,
      date: new Date().toLocaleString(),
      description: formData.description,
      submitterId: user?.id || 'ANON',
      submitterName: user?.name || 'Anonymous Citizen',
      submitterRole: user?.role || UserRole.PUBLIC,
      patientName: formData.patientName,
      age: formData.age ? parseInt(formData.age) : undefined,
      contact: formData.contact,
      clinicalNotes: isProfessional ? formData.clinicalNotes : undefined,
      assignedTo: isProfessional ? formData.assignedTo : undefined,
      patientHistory: isProfessional ? formData.patientHistory : undefined,
      notifiedProfessionals: true,
      labStatus: 'Pending Collection',
      isolationStatus: 'Not Required',
      tracingStatus: 'Not Started',
      lat: 8.48 + (Math.random() - 0.5) * 2, // Default to Sierra Leone center with jitter
      lng: -11.77 + (Math.random() - 0.5) * 2
    };

    // SAVE TO SHARED DATABASE
    const existingDb = localStorage.getItem(REPORT_DB_KEY);
    const db: CaseReport[] = existingDb ? JSON.parse(existingDb) : [];
    db.unshift(newReport);
    localStorage.setItem(REPORT_DB_KEY, JSON.stringify(db));

    notify(`Case ${newReport.id} successfully synced to National Database.`, "success");
    setLoading(false);
    onNavigate(AppView.DASHBOARD);
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const totalSteps = 4;

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden transition-colors">
          
          {/* Progress Bar */}
          <div className="h-2 bg-slate-100 dark:bg-slate-800 flex">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className={`h-full transition-all duration-700 ${step >= i ? themeColor : 'bg-transparent'} flex-1 border-r border-white/10 last:border-0`}></div>
             ))}
          </div>

          <div className="p-10 lg:p-16">
            <div className="text-center mb-12">
               <div className={`w-16 h-16 ${themeBg} dark:bg-slate-800 ${themeText} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 shadow-sm border border-current opacity-70`}>
                  <i className={`fa-solid ${
                    step === 1 ? 'fa-user-pulse' : 
                    step === 2 ? 'fa-shield-virus' : 
                    step === 3 ? 'fa-house-chimney-medical' : 
                    'fa-file-signature'
                  }`}></i>
               </div>
               <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                 {step === 1 ? 'Patient & Symptoms' : 
                  step === 2 ? 'Environment & Risk' : 
                  step === 3 ? 'Living Context' : 
                  'Review & Submit'}
               </h2>
               <p className="text-slate-500 dark:text-slate-400 font-medium">
                 {step === 1 ? 'Who is sick and what are they feeling?' : 
                  step === 2 ? 'Tell us about animal contact and travel.' : 
                  step === 3 ? 'Help us understand how the disease might spread.' : 
                  'Check everything before sending to the Ministry.'}
               </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
               {/* STEP 1: SYMPTOMS & PROFILE */}
               {step === 1 && (
                 <div className="space-y-10 animate-in slide-in-from-right-4">
                    <div className="space-y-6">
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                         <span className="w-8 h-px bg-slate-100 mr-3"></span> Core Symptoms
                       </h3>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {symptomsList.map(s => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => toggleSymptom(s.id)}
                              className={`p-6 rounded-3xl border flex flex-col items-center justify-center space-y-3 transition-all ${
                                formData.symptoms.includes(s.id) 
                                  ? `${themeColor} text-white shadow-xl scale-105 border-transparent` 
                                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-900 shadow-sm'
                              }`}
                            >
                               <i className={`fa-solid ${s.icon} text-xl`}></i>
                               <span className="text-[10px] font-black uppercase tracking-tighter text-center">{s.label}</span>
                            </button>
                          ))}
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                          <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">When did it start?</label>
                             <input type="date" required className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold ${themeFocus} outline-none transition-all dark:text-white`} value={formData.onsetDate} onChange={e => setFormData({...formData, onsetDate: e.target.value})} />
                          </div>
                          <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Symptom Progression</label>
                             <select className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold ${themeFocus} outline-none transition-all cursor-pointer dark:text-white`} value={formData.progression} onChange={e => setFormData({...formData, progression: e.target.value})}>
                                <option value="Stable" className="dark:bg-slate-900">Stable (Staying the same)</option>
                                <option value="Worsening" className="dark:bg-slate-900">Worsening (Getting worse)</option>
                                <option value="Rapidly Declining" className="dark:bg-slate-900">Rapidly Declining (Getting bad very fast)</option>
                             </select>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                          <span className="w-8 h-px bg-slate-100 dark:bg-slate-800 mr-3"></span> Patient Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            <div className="md:col-span-8">
                               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Name (or Initials for privacy)</label>
                               <input type="text" className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold ${themeFocus} outline-none transition-all dark:text-white`} placeholder="Full name or initials..." value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} />
                            </div>
                            <div className="md:col-span-4">
                               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Age</label>
                               <input type="number" className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold ${themeFocus} outline-none transition-all dark:text-white`} placeholder="Years" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                            </div>
                        </div>

                        {isProfessional && (
                          <div className="grid grid-cols-1 gap-6 pt-4 animate-in slide-in-from-top-2">
                             <div>
                                <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 ml-1">Patient Clinical History (Professional Only)</label>
                                <textarea className={`w-full px-6 py-4 bg-emerald-50/30 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 rounded-2xl text-sm font-medium ${themeFocus} outline-none transition-all dark:text-white resize-none`} rows={3} placeholder="Previous medical conditions, vaccinations, etc..." value={formData.patientHistory} onChange={e => setFormData({...formData, patientHistory: e.target.value})} />
                             </div>
                             <div>
                                <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 ml-1">Initial Clinical Notes (Professional Only)</label>
                                <textarea className={`w-full px-6 py-4 bg-emerald-50/30 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 rounded-2xl text-sm font-medium ${themeFocus} outline-none transition-all dark:text-white resize-none`} rows={3} placeholder="Observations, vital signs, immediate triage notes..." value={formData.clinicalNotes} onChange={e => setFormData({...formData, clinicalNotes: e.target.value})} />
                             </div>
                          </div>
                        )}
                    </div>
                 </div>
               )}

               {/* STEP 2: TRAVEL & RISK */}
               {step === 2 && (
                 <div className="space-y-10 animate-in slide-in-from-right-4">
                    <div className="space-y-6">
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                         <span className="w-8 h-px bg-slate-100 mr-3"></span> Travel History
                       </h3>
                       <div className="flex items-center space-x-6 p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                          <p className="text-sm font-bold text-slate-700">Traveled in the last 14 days?</p>
                          <div className="flex gap-2">
                             <button type="button" onClick={() => setFormData({...formData, hasTravelHistory: true})} className={`px-5 py-2 rounded-xl text-xs font-black uppercase transition-all ${formData.hasTravelHistory ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}>Yes</button>
                             <button type="button" onClick={() => setFormData({...formData, hasTravelHistory: false, travelHistory: ''})} className={`px-5 py-2 rounded-xl text-xs font-black uppercase transition-all ${!formData.hasTravelHistory ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}>No</button>
                          </div>
                       </div>
                       {formData.hasTravelHistory && (
                         <div className="animate-in slide-in-from-top-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Destination Districts/Countries</label>
                            <input type="text" className={`w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold ${themeFocus} outline-none transition-all`} placeholder="e.g. Kenema, Kailahun, or Guinea..." value={formData.travelHistory} onChange={e => setFormData({...formData, travelHistory: e.target.value})} />
                         </div>
                       )}
                    </div>

                    <div className="space-y-6">
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                         <span className="w-8 h-px bg-slate-100 mr-3"></span> Animal & Environment Risks
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { id: 'contactWithSick', label: 'Contact with sick people?', state: formData.contactWithSick, icon: 'fa-user-nurse' },
                            { id: 'rodentExposure', label: 'Rats/Rodents in home?', state: formData.rodentExposure, icon: 'fa-rat' },
                            { id: 'bushmeatContact', label: 'Eaten/Handled Bushmeat?', state: formData.bushmeatContact, icon: 'fa-drumstick-bite' },
                          ].map(risk => (
                             <button
                               key={risk.id}
                               type="button"
                               onClick={() => setFormData({...formData, [risk.id]: !risk.state})}
                               className={`p-6 rounded-3xl border flex items-center justify-between transition-all ${
                                 risk.state ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-100'
                               }`}
                             >
                                <div className="flex items-center space-x-3">
                                   <i className={`fa-solid ${risk.icon} opacity-40`}></i>
                                   <span className="text-sm font-bold">{risk.label}</span>
                                </div>
                                <div className={`w-10 h-6 rounded-full relative transition-all ${risk.state ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${risk.state ? 'left-5' : 'left-1'}`}></div>
                                </div>
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>
               )}

               {/* STEP 3: LIVING CONTEXT */}
               {step === 3 && (
                 <div className="space-y-10 animate-in slide-in-from-right-4">
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                            <span className="w-8 h-px bg-slate-100 mr-3"></span> Living Situation
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Household Size (How many at home?)</label>
                                <select className={`w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold ${themeFocus} outline-none transition-all cursor-pointer`} value={formData.householdSize} onChange={e => setFormData({...formData, householdSize: e.target.value})}>
                                    <option value="1-3">Small (1-3 people)</option>
                                    <option value="4-7">Medium (4-7 people)</option>
                                    <option value="8+">Large (8+ people)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Clean Water Access</label>
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, cleanWater: !formData.cleanWater})}
                                    className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${
                                        formData.cleanWater ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-red-50 border-red-200 text-red-900'
                                    }`}
                                >
                                    <span className="text-sm font-bold">{formData.cleanWater ? 'Safe Water Available' : 'No Safe Water'}</span>
                                    <i className={`fa-solid ${formData.cleanWater ? 'fa-faucet' : 'fa-faucet-drip'}`}></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                            <span className="w-8 h-px bg-slate-100 mr-3"></span> Occupation Risk
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {occupations.map(occ => (
                                <button
                                    key={occ.id}
                                    type="button"
                                    onClick={() => setFormData({...formData, occupation: occ.id})}
                                    className={`p-6 rounded-3xl border flex flex-col items-center justify-center space-y-3 transition-all ${
                                        formData.occupation === occ.id 
                                            ? 'bg-slate-900 text-white shadow-xl scale-105 border-transparent' 
                                            : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                                    }`}
                                >
                                    <i className={`fa-solid ${occ.icon} text-lg`}></i>
                                    <span className="text-[10px] font-black uppercase tracking-tighter">{occ.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                 </div>
               )}

               {/* STEP 4: FINAL REVIEW */}
               {step === 4 && (
                 <div className="space-y-10 animate-in slide-in-from-right-4">
                    <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 space-y-8">
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Final Summary Narrative</label>
                          <textarea 
                            required 
                            rows={5} 
                            className={`w-full px-6 py-5 bg-white border border-slate-100 rounded-[2.5rem] text-sm font-medium ${themeFocus} outline-none transition-all resize-none shadow-sm`}
                            placeholder="Briefly describe the situation in your own words. E.g., 'My child has a fever and we had rodents in the kitchen recently...'"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                          />
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                          <div className="space-y-2">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Village/Locality</p>
                             <input type="text" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black outline-none" placeholder="Enter Village Name" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Case Priority</p>
                             <select className={`w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black outline-none`} value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})}>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                             </select>
                          </div>
                          
                          {isProfessional && (
                            <>
                              <div className="space-y-2 animate-in slide-in-from-top-2">
                                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Assign To Unit / Responder</p>
                                 <input type="text" className="w-full px-4 py-2 bg-emerald-50/30 border border-emerald-100 rounded-xl text-xs font-black outline-none" placeholder="e.g. Rapid Response Team A" value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})} />
                              </div>
                              <div className="space-y-2 animate-in slide-in-from-top-2">
                                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total People Affected</p>
                                 <input type="number" className="w-full px-4 py-2 bg-emerald-50/30 border border-emerald-100 rounded-xl text-xs font-black outline-none" placeholder="Number of people" value={formData.peopleAffected} onChange={e => setFormData({...formData, peopleAffected: e.target.value})} />
                              </div>
                            </>
                          )}
                       </div>
                    </div>

                    <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2.5rem] flex items-start space-x-6">
                       <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-lg">
                          <i className="fa-solid fa-user-shield"></i>
                       </div>
                       <div>
                          <h4 className="text-lg font-black text-blue-900 mb-1">National Verification Protocol</h4>
                          <p className="text-sm text-blue-700 opacity-80 leading-relaxed">
                            Once you submit, this case will be immediately visible to District Health Responders and the Ministry of Health.
                          </p>
                       </div>
                    </div>
                 </div>
               )}

               {/* Navigation Controls */}
               <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {step === 1 ? (
                    <button type="button" onClick={() => onNavigate(AppView.DASHBOARD)} className="w-full py-5 bg-slate-100 text-slate-600 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-200 transition-all">
                       Cancel Report
                    </button>
                  ) : (
                    <button type="button" onClick={prevStep} className="w-full py-5 bg-slate-100 text-slate-600 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-200 transition-all">
                       Back
                    </button>
                  )}

                  {step < totalSteps ? (
                    <button type="button" onClick={nextStep} className={`w-full py-5 ${themeColor} text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center`}>
                       Continue
                       <i className="fa-solid fa-arrow-right ml-3"></i>
                    </button>
                  ) : (
                    <button type="submit" disabled={loading} className={`w-full py-5 ${themeColor} text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center`}>
                       {loading ? <i className="fa-solid fa-circle-notch animate-spin mr-3"></i> : <i className="fa-solid fa-paper-plane mr-3"></i>}
                       Submit & Sync Case
                    </button>
                  )}
               </div>
            </form>
          </div>
       </div>
    </div>
  );
};

export default ReportForm;
