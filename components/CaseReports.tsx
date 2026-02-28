
import React, { useState, useEffect } from 'react';
import { analyzeReportSymptoms } from '../services/geminiService';
import { sendSMSAlert } from '../services/smsService';
import { User, Permission, CaseReport, LabStatus, IsolationStatus, TracingStatus, AppView, SystemNotification, UserRole } from '../types';
// Fix: Use named import for recordAuditAction
import { recordAuditAction } from '../App';

interface CaseReportsProps {
  user: User | null;
  onNavigate?: (view: AppView) => void;
  notify: (msg: string, type?: any) => void;
}

const mockReports: CaseReport[] = [
  { 
    id: 'REP-001', 
    disease: 'Fever & Fatigue', 
    location: 'Makeni', 
    district: 'Bombali',
    status: 'Verified', 
    priority: 'Medium', 
    date: 'Today, 10:45 AM', 
    description: 'Patient reports persistent high fever and extreme fatigue for 3 days. No travel history.',
    patientName: 'Amadu Jalloh',
    // Fix: Added missing submitter fields
    submitterId: 'u2',
    submitterName: 'Nurse K. Sesay',
    submitterRole: UserRole.HEALTH_WORKER,
    age: 34,
    contact: '+232 76 123 456',
    clinicalNotes: 'Initial screening suggests common malaria. Administered testing kit.',
    assignedTo: 'Nurse K. Sesay',
    patientHistory: 'Previous malaria bout 6 months ago. Chronic smoker.',
    labStatus: 'Sample Collected',
    isolationStatus: 'Home Isolation',
    tracingStatus: 'In Progress',
    notifiedProfessionals: true
  },
  { 
    id: 'REP-002', 
    disease: 'Waterborne Symptoms', 
    location: 'Bo District', 
    district: 'Bo District',
    status: 'Pending', 
    priority: 'High', 
    date: 'Oct 12, 2024', 
    description: 'Cluster of 3 family members with severe diarrhea and dehydration. Water source contaminated.',
    patientName: 'Kadiatu Sesay (Family Head)',
    // Fix: Added missing submitter fields
    submitterId: 'u5',
    submitterName: 'Dr. M. Kamara',
    submitterRole: UserRole.HEALTH_WORKER,
    age: 42,
    contact: '+232 33 987 654',
    clinicalNotes: 'Awaiting field verification. Recommended isolation and ORS.',
    assignedTo: 'Dr. M. Kamara',
    patientHistory: 'No recent significant illnesses in the household until now.',
    labStatus: 'Pending Collection',
    isolationStatus: 'Facility Isolation',
    tracingStatus: 'Not Started',
    notifiedProfessionals: true
  }
];

const CaseReports: React.FC<CaseReportsProps> = ({ user, onNavigate, notify }) => {
  const hasPermission = (p: Permission) => user?.permissions?.includes(p);
  const canViewReports = hasPermission(Permission.VIEW_REPORTS);
  const canVerify = hasPermission(Permission.VERIFY_REPORTS);

  const [reports, setReports] = useState<CaseReport[]>(mockReports);
  const [showForm, setShowForm] = useState(!canViewReports);
  const [formStep, setFormStep] = useState(1);
  const [selectedCase, setSelectedCase] = useState<CaseReport | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [smsFeedback, setSmsFeedback] = useState<string | null>(null);

  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [peopleAffected, setPeopleAffected] = useState('1');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [cleanWater, setCleanWater] = useState(true);
  const [animalContact, setAnimalContact] = useState(false);
  const [contactWithSick, setContactWithSick] = useState(false);
  const [communityDeaths, setCommunityDeaths] = useState(false);

  const symptomsList = [
    "High Fever", "Persistent Cough", "Vomiting", "Severe Diarrhea", 
    "Unusual Bleeding", "Skin Rash", "Muscle Pain", "Red Eyes", "Loss of Appetite"
  ];

  const totalSteps = canVerify ? 4 : 3;

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const handleAnalyze = async () => {
    if (!description || description.length < 5) return;
    setIsAnalyzing(true);
    const result = await analyzeReportSymptoms(description, {
      symptoms: selectedSymptoms,
      peopleAffected,
      cleanWater,
      animalContact,
      contactWithSick,
      communityDeaths
    });
    setAnalysis(result);
    if (result?.priority) setPriority(result.priority);
    setIsAnalyzing(false);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    
    const newReport: CaseReport = {
      id: `REP-${Math.floor(Math.random() * 1000)}`,
      disease: analysis?.likelyDisease || 'Under Review',
      location: location || 'Unknown',
      district: user?.district || 'Unknown',
      status: 'Pending',
      priority: priority,
      date: 'Just Now',
      description: description,
      patientName: user?.name,
      // Fix: Added missing submitter fields
      submitterId: user?.id || 'ANON',
      submitterName: user?.name || 'Anonymous Citizen',
      submitterRole: user?.role || UserRole.PUBLIC,
      smsAlertSent: priority === 'Critical',
      notifiedProfessionals: true,
      labStatus: 'Not Required',
      isolationStatus: 'Not Required',
      tracingStatus: 'In Progress'
    };

    if (user?.role === UserRole.PUBLIC) {
      const savedNotifs = localStorage.getItem('pro_notifications') || '[]';
      const notifications: SystemNotification[] = JSON.parse(savedNotifs);
      const newNotif: SystemNotification = {
        id: `NOT-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        title: 'New Citizen Report Submitted',
        message: `A new ${newReport.priority} priority report for ${newReport.disease} has been filed in ${newReport.location}.`,
        type: 'Report',
        timestamp: new Date().toISOString(),
        readBy: [],
        reportId: newReport.id
      };
      notifications.unshift(newNotif);
      localStorage.setItem('pro_notifications', JSON.stringify(notifications.slice(0, 50)));
    }

    if (priority === 'Critical') {
      const alertLog = await sendSMSAlert(newReport);
      if (alertLog) setSmsFeedback(`Emergency alert sent to responders.`);
    }

    setReports([newReport, ...reports]);
    if (user) recordAuditAction(user, 'New Health Report Submitted', `Priority: ${newReport.priority}`);
    
    setIsSubmitting(false);

    notify("Report submitted successfully! The Ministry of Health and local Health Workers have been notified.", "success");

    if (!canViewReports && onNavigate) {
      setTimeout(() => onNavigate(AppView.DASHBOARD), 2500);
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setDescription('');
    setLocation('');
    setPeopleAffected('1');
    setSelectedSymptoms([]);
    setAnalysis(null);
    setShowForm(!canViewReports);
    setFormStep(1);
    setPriority('Medium');
  };

  const getPriorityStyles = (p: string) => {
    switch(p) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {canVerify ? 'National Surveillance Queue' : 'Submit Health Report'}
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            {canVerify ? 'Coordinate response to community and professional case reports.' : 'Report symptoms to alert health authorities.'}
          </p>
        </div>
        
        {canViewReports && !showForm && !selectedCase && (
          <button 
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-xl transition-all flex items-center transform hover:scale-105"
          >
            <i className="fa-solid fa-plus mr-2"></i> New Clinical Entry
          </button>
        )}
        
        {canViewReports && (showForm || selectedCase) && (
          <button 
            onClick={() => { setShowForm(false); setSelectedCase(null); setFormStep(1); }}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all flex items-center shadow-sm"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i> Exit View
          </button>
        )}

        {!canViewReports && (
          <button 
            onClick={() => { onNavigate && onNavigate(AppView.DASHBOARD); }}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all flex items-center shadow-sm"
          >
            <i className="fa-solid fa-house mr-2"></i> Cancel
          </button>
        )}
      </div>

      {selectedCase && canViewReports ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{selectedCase.disease}</h3>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      selectedCase.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {selectedCase.status}
                    </span>
                  </div>
                  <p className="text-slate-400 font-bold text-sm">Reference: {selectedCase.id} • {selectedCase.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest">Incident Location</p>
                  <p className="text-sm font-bold text-slate-900">{selectedCase.location}, {selectedCase.district}</p>
                  <p className="text-xs text-slate-500 mt-1">Reported by: {selectedCase.patientName || 'Anonymous Citizen'}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest">Surveillance Alert Status</p>
                  <div className="flex flex-col space-y-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border ${getPriorityStyles(selectedCase.priority)}`}>{selectedCase.priority} Priority</span>
                    {selectedCase.notifiedProfessionals && (
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-[9px] font-black uppercase bg-blue-600 text-white shadow-md">
                        Professionals Notified <i className="fa-solid fa-tower-broadcast ml-2"></i>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 mb-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Symptom Narrative</h4>
                <p className="text-slate-700 leading-relaxed text-sm font-medium">{selectedCase.description}</p>
              </div>

              {selectedCase.notifiedProfessionals && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Professional Response History</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                       <i className="fa-solid fa-bell text-blue-500"></i>
                       <p className="text-xs font-bold text-slate-600">Admin Team Alerted via System Push Notification</p>
                       <span className="ml-auto text-[8px] font-black text-slate-300">SYSTEM AUTO</span>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                       <i className="fa-solid fa-user-nurse text-blue-500"></i>
                       <p className="text-xs font-bold text-slate-600">Health Workers in {selectedCase.district} Alerted</p>
                       <span className="ml-auto text-[8px] font-black text-slate-300">REGION BROADCAST</span>
                    </div>
                    {selectedCase.smsAlertSent && (
                      <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-100 rounded-2xl shadow-sm">
                         <i className="fa-solid fa-satellite-dish text-red-500"></i>
                         <p className="text-xs font-bold text-red-600">Critical SMS Dispatch triggered to 117 Responders</p>
                         <span className="ml-auto text-[8px] font-black text-red-300">PRIORITY 1</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : showForm ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-right-4 duration-500">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
               <div className="h-2 bg-slate-100 flex">
                  {[1, 2, 3, canVerify ? 4 : null].filter(Boolean).map((step, i) => (
                    <div key={i} className={`h-full transition-all duration-500 bg-emerald-500 ${formStep >= (i + 1) ? 'flex-1' : 'w-0'}`}></div>
                  ))}
               </div>

               <div className="p-8 lg:p-12 space-y-10">
                  {formStep === 1 && (
                    <div className="space-y-8">
                       <h3 className="text-xl font-black text-slate-900 tracking-tight">Step 1: Location & Triage</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Village / Market Name</label>
                             <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={location} onChange={e => setLocation(e.target.value)} placeholder="Locality..." />
                          </div>
                          <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Report Priority</label>
                             <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black" value={priority} onChange={e => setPriority(e.target.value as any)}>
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Critical</option>
                             </select>
                          </div>
                       </div>
                    </div>
                  )}
                  {formStep === 2 && (
                    <div className="space-y-8">
                       <h3 className="text-xl font-black text-slate-900 tracking-tight">Step 2: Symptoms Checklist</h3>
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {symptomsList.map(s => (
                             <button key={s} onClick={() => toggleSymptom(s)} className={`p-4 rounded-2xl border text-left transition-all font-bold text-xs ${selectedSymptoms.includes(s) ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>{s}</button>
                          ))}
                       </div>
                       <textarea rows={4} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none" placeholder="Narrative description..." value={description} onChange={e => setDescription(e.target.value)}></textarea>
                    </div>
                  )}
                  {formStep === 3 && (
                    <div className="space-y-8">
                       <div className="flex items-center justify-between">
                         <h3 className="text-xl font-black text-slate-900 tracking-tight">Step 3: Environment Factors</h3>
                         <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl flex items-center">
                            <i className="fa-solid fa-user-shield text-blue-600 mr-2 text-xs"></i>
                            <span className="text-[9px] font-black text-blue-700 uppercase">Alerting Professionals Enabled</span>
                         </div>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { label: 'Clean Water Access', state: cleanWater, set: setCleanWater, icon: 'fa-faucet' },
                            { label: 'Animal Contact', state: animalContact, set: setAnimalContact, icon: 'fa-cow' },
                            { label: 'Contact with Sick', state: contactWithSick, set: setContactWithSick, icon: 'fa-user-nurse' },
                            { label: 'Unexplained Deaths', state: communityDeaths, set: setCommunityDeaths, icon: 'fa-skull-crossbones' }
                          ].map((risk, i) => (
                             <button key={i} onClick={() => risk.set(!risk.state)} className={`p-6 rounded-3xl border flex items-center justify-between transition-all ${risk.state ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-slate-100 text-slate-500'}`}>
                                <span className="text-sm font-bold">{risk.label}</span>
                                <div className={`w-10 h-6 rounded-full relative transition-all ${risk.state ? 'bg-emerald-500' : 'bg-slate-200'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${risk.state ? 'left-5' : 'left-1'}`}></div></div>
                             </button>
                          ))}
                       </div>
                    </div>
                  )}

                  <div className="flex flex-col space-y-6 pt-4">
                     <div className="flex space-x-4">
                        {formStep > 1 && <button onClick={() => setFormStep(formStep - 1)} className="px-8 py-4 bg-slate-100 rounded-2xl font-black text-slate-600">Previous</button>}
                        {formStep < totalSteps ? (
                           <button onClick={() => setFormStep(formStep + 1)} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg">Next Step</button>
                         ) : (
                           <button onClick={handleFinalSubmit} disabled={isSubmitting} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg">
                             {isSubmitting ? 'Submitting...' : 'Finalize & Notify Officials'}
                           </button>
                         )}
                     </div>
                     {formStep === totalSteps && (
                       <p className="text-[10px] text-slate-400 font-bold text-center italic">
                         By submitting, you agree to alert Health Workers and District Admins for immediate review.
                       </p>
                     )}
                  </div>
               </div>
            </div>
          </div>
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-500 mb-6 relative z-10">AI Diagnostic Pattern</h4>
                {!analysis && !isAnalyzing ? (
                   <button onClick={handleAnalyze} className="w-full py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">Initiate AI Analysis</button>
                ) : isAnalyzing ? (
                   <div className="py-12 flex flex-col items-center justify-center relative z-10"><div className="w-10 h-10 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-4"></div><p className="text-[10px] font-black text-blue-400 uppercase animate-pulse">Analyzing...</p></div>
                ) : (
                   <div className="space-y-6 relative z-10 animate-in fade-in zoom-in-95">
                      <p className="text-lg font-black text-white">{analysis.likelyDisease}</p>
                      <p className={`text-xs font-black ${analysis.priority === 'Critical' ? 'text-red-400' : 'text-blue-400'}`}>{analysis.priority} Priority</p>
                      <p className="text-[10px] font-medium text-slate-400 leading-relaxed">{analysis.recommendedAction}</p>
                   </div>
                )}
             </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                      <th className="pb-4">Case ID</th>
                      <th className="pb-4">Disease/Symptoms</th>
                      <th className="pb-4">Location</th>
                      <th className="pb-4">Source</th>
                      <th className="pb-4">Pros Notified</th>
                      <th className="pb-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {reports.map((r) => (
                      <tr key={r.id} className="group hover:bg-slate-50/50">
                        <td className="py-4 font-black text-slate-900">{r.id}</td>
                        <td className="py-4 font-bold text-slate-700">{r.disease}</td>
                        <td className="py-4 font-medium text-slate-500">{r.location}</td>
                        <td className="py-4 font-black text-[9px] uppercase tracking-wider text-slate-400">
                          {r.patientName === user?.name ? 'Self' : (r.patientName ? 'Professional' : 'Citizen')}
                        </td>
                        <td className="py-4">
                           {r.notifiedProfessionals ? (
                             <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase border border-blue-100 rounded">
                               Verified <i className="fa-solid fa-check ml-1.5"></i>
                             </span>
                           ) : (
                             <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[8px] font-black uppercase border border-slate-200 rounded">Pending</span>
                           )}
                        </td>
                        <td className="py-4">
                          <button onClick={() => setSelectedCase(r)} className="text-blue-600 font-black text-xs hover:underline">Manage Case</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default CaseReports;
