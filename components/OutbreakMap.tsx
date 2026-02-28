
import React, { useState, useRef, useEffect } from 'react';
import { analyzeRegionalThreat, searchHospitals } from '../services/geminiService';
import { CaseReport } from '../types';

interface DistrictData {
  id: string;
  name: string;
  cases: number;
  risk: 'Critical' | 'High' | 'Medium' | 'Low';
  facilities: number;
  quarantines: number;
  x: number;
  y: number;
}

interface HospitalInfo {
  name: string;
  uri: string;
  title: string;
}

interface OutbreakMapProps {
  notify: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  initialLayer?: 'Cases' | 'Hospitals';
}

const REPORT_DB_KEY = 'alert_sl_reports_database';

const OutbreakMap: React.FC<OutbreakMapProps> = ({ notify, initialLayer }) => {
  const [dbDistricts, setDbDistricts] = useState<DistrictData[]>([
    { id: 'WAU', name: 'Western Area Urban', risk: 'Medium', cases: 0, facilities: 24, quarantines: 2, x: 12, y: 58 },
    { id: 'KEN', name: 'Kenema', risk: 'Critical', cases: 0, facilities: 18, quarantines: 5, x: 75, y: 68 },
    { id: 'BO', name: 'Bo District', risk: 'Low', cases: 0, facilities: 15, quarantines: 0, x: 45, y: 72 },
    { id: 'BOM', name: 'Bombali', risk: 'High', cases: 0, facilities: 14, quarantines: 1, x: 42, y: 32 },
    { id: 'KAY', name: 'Kailahun', risk: 'Critical', cases: 0, facilities: 9, quarantines: 4, x: 88, y: 55 },
  ]);

  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseReport | null>(null);
  const [reports, setReports] = useState<CaseReport[]>([]);
  const [viewLayer, setViewLayer] = useState<'Cases' | 'Hospitals'>(initialLayer || 'Cases');
  const [isSearchingHospitals, setIsSearchingHospitals] = useState(false);
  const [hospitals, setHospitals] = useState<HospitalInfo[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [hospitalText, setHospitalText] = useState<string>('');

  const calculateDynamicTotals = () => {
    const saved = localStorage.getItem(REPORT_DB_KEY);
    if (!saved) return;
    const allReports: CaseReport[] = JSON.parse(saved);
    setReports(allReports);
    
    setDbDistricts(prev => prev.map(district => {
      const count = allReports.filter(r => r.district === district.name).length;
      let risk: DistrictData['risk'] = 'Low';
      if (count > 10) risk = 'Critical';
      else if (count > 5) risk = 'High';
      else if (count > 2) risk = 'Medium';
      
      return { ...district, cases: count, risk };
    }));
  };

  useEffect(() => {
    calculateDynamicTotals();
    window.addEventListener('storage', calculateDynamicTotals);
    
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location", error);
        }
      );
    }

    return () => window.removeEventListener('storage', calculateDynamicTotals);
  }, []);

  useEffect(() => {
    if (viewLayer === 'Hospitals' && hospitals.length === 0 && !isSearchingHospitals) {
      handleFetchHospitals();
    }
  }, [viewLayer]);

  const handleFetchHospitals = async () => {
    setIsSearchingHospitals(true);
    notify("Searching for nearby health facilities...", "info");
    const result = await searchHospitals(userLocation ? { latitude: userLocation.lat, longitude: userLocation.lng } : undefined);
    
    if (result) {
      setHospitalText(result.text || '');
      const extracted: HospitalInfo[] = [];
      result.groundingChunks.forEach((chunk: any) => {
        if (chunk.maps) {
          extracted.push({
            name: chunk.maps.title,
            uri: chunk.maps.uri,
            title: chunk.maps.title
          });
        }
      });
      setHospitals(extracted);
      notify(`Found ${extracted.length} key facilities.`, "success");
    } else {
      notify("Failed to retrieve hospital data.", "warning");
    }
    setIsSearchingHospitals(false);
  };

  useEffect(() => {
    if (viewLayer === 'Hospitals' && hospitals.length === 0) {
      handleFetchHospitals();
    }
  }, [viewLayer]);

  const handleDistrictSelect = (d: DistrictData) => {
    setSelectedDistrict(d);
    setSelectedCase(null);
    notify(`Monitoring clusters in ${d.name}: ${d.cases} cases reported.`, "info");
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'bg-red-600';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-blue-600';
      default: return 'bg-emerald-500';
    }
  };

  const getCaseXY = (lat: number, lng: number) => {
    // Linear mapping based on district anchors
    const x = 12 + (lng - (-13.23)) / 2.66 * 76;
    const y = 68 + (lat - 7.88) / 1.33 * (-36);
    return { x, y };
  };

  const mapQuery = viewLayer === 'Hospitals' 
    ? (selectedDistrict ? `hospitals in ${selectedDistrict.name}, Sierra Leone` : "hospitals in Sierra Leone")
    : (selectedDistrict ? `${selectedDistrict.name}, Sierra Leone` : "Sierra Leone");

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">National Health Security Map</h2>
          <p className="text-slate-500 font-medium">Real-time surveillance and facility tracking.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
           <button 
             onClick={() => setViewLayer('Cases')}
             className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${viewLayer === 'Cases' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
           >
             Disease Clusters
           </button>
           <button 
             onClick={() => setViewLayer('Hospitals')}
             className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${viewLayer === 'Hospitals' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
           >
             Hospital Tracker
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-[3rem] shadow-2xl relative overflow-hidden h-[600px] border border-slate-200 dark:border-slate-700 group transition-colors">
             {/* Real Google Map Embed */}
             <iframe
               title="Health Map"
               width="100%"
               height="100%"
               style={{ border: 0 }}
               loading="lazy"
               allowFullScreen
               referrerPolicy="no-referrer-when-downgrade"
               src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=10&ie=UTF8&iwloc=&output=embed`}
               className="grayscale-[20%] contrast-[110%] brightness-[95%] dark:invert dark:hue-rotate-180 dark:brightness-75"
             ></iframe>

             {/* Overlay for Disease Clusters when that layer is active */}
             {viewLayer === 'Cases' && (
                <div className="absolute inset-0 z-20 pointer-events-none">
                   {/* District Bubbles */}
                   {dbDistricts.map(d => (
                      <div 
                        key={d.id} 
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto group" 
                        style={{ left: `${d.x}%`, top: `${d.y}%` }}
                        onClick={() => handleDistrictSelect(d)}
                      >
                         <div className={`w-10 h-10 rounded-full border-[4px] border-white dark:border-slate-900 shadow-xl transition-all flex items-center justify-center ${getRiskColor(d.risk)} group-hover:scale-125`}>
                           <span className="text-[10px] font-black text-white">{d.cases}</span>
                         </div>
                         <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-slate-100 dark:border-slate-700">
                            <p className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{d.name}</p>
                         </div>
                      </div>
                   ))}

                   {/* Individual Case Markers */}
                   {reports.map((r, idx) => {
                      if (!r.lat || !r.lng) return null;
                      const { x, y } = getCaseXY(r.lat, r.lng);
                      return (
                        <div 
                          key={r.id || idx}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto group z-30"
                          style={{ left: `${x}%`, top: `${y}%` }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCase(r);
                            setSelectedDistrict(null);
                          }}
                        >
                           <div className={`w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-lg animate-pulse ${
                             r.priority === 'Critical' ? 'bg-red-500' : 
                             r.priority === 'High' ? 'bg-orange-500' : 
                             'bg-amber-400'
                           }`}></div>
                           
                           {/* Marker Tooltip */}
                           <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {r.disease}
                           </div>
                        </div>
                      );
                   })}
                </div>
             )}
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm p-8 h-full overflow-y-auto max-h-[600px] transition-colors">
            {viewLayer === 'Hospitals' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Nearby Facilities</h3>
                  <button 
                    onClick={handleFetchHospitals}
                    disabled={isSearchingHospitals}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                  >
                    <i className={`fa-solid fa-arrows-rotate ${isSearchingHospitals ? 'animate-spin' : ''}`}></i>
                  </button>
                </div>
                
                {isSearchingHospitals ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Consulting Health Registry...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hospitals.length > 0 ? (
                      hospitals.map((h, i) => (
                        <a 
                          key={i} 
                          href={h.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">{h.name}</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Verified Health Center</p>
                            </div>
                            <i className="fa-solid fa-arrow-up-right-from-square text-slate-300 text-xs group-hover:text-blue-400"></i>
                          </div>
                        </a>
                      ))
                    ) : (
                      <div className="py-10 text-center opacity-40">
                        <i className="fa-solid fa-hospital-user text-4xl mb-4 text-slate-200"></i>
                        <p className="text-[10px] font-black uppercase tracking-widest dark:text-slate-400">No facilities found in current view.</p>
                      </div>
                    )}

                    {hospitalText && (
                      <div className="mt-8 p-6 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-100 dark:shadow-none">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-80">AI Capability Briefing</p>
                        <p className="text-xs leading-relaxed font-medium">{hospitalText}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : selectedCase ? (
              <div className="space-y-8 animate-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Case Detail</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    selectedCase.priority === 'Critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 
                    selectedCase.priority === 'High' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 
                    'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {selectedCase.priority} Priority
                  </span>
                </div>
                
                <div className="space-y-6">
                   <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Likely Pathogen</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedCase.disease}</p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                         <p className="text-xs font-bold text-slate-900 dark:text-white">{selectedCase.status}</p>
                      </div>
                      <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Reported</p>
                         <p className="text-xs font-bold text-slate-900 dark:text-white">{selectedCase.date.split(',')[0]}</p>
                      </div>
                   </div>

                   <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-3xl">
                      <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Symptom Summary</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                        {selectedCase.description}
                      </p>
                   </div>
                </div>
                
                <button onClick={() => setSelectedCase(null)} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase text-xs transition-colors">Close Details</button>
              </div>
            ) : selectedDistrict ? (
              <div className="space-y-8 animate-in slide-in-from-right-4">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{selectedDistrict.name}</h3>
                <div className="grid grid-cols-1 gap-4">
                   <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Database Count</p>
                      <p className="text-4xl font-black text-slate-900 dark:text-white">{selectedDistrict.cases}</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">Reports from all portals</p>
                   </div>
                   <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-3xl">
                      <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Outbreak Pressure</p>
                      <p className={`text-xl font-black ${selectedDistrict.risk === 'Critical' ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'}`}>{selectedDistrict.risk} Level</p>
                   </div>
                </div>
                <button onClick={() => setSelectedDistrict(null)} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase text-xs transition-colors">Clear Selection</button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                <i className="fa-solid fa-map-location-dot text-6xl mb-6 text-slate-200 dark:text-slate-700"></i>
                <p className="text-xs font-black uppercase tracking-widest dark:text-slate-500">Select a district or switch layers to view health infrastructure.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutbreakMap;
