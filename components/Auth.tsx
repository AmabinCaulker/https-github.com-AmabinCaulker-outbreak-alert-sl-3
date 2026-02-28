
import React, { useState, useEffect } from 'react';
import { User, UserRole, UserStatus } from '../types';

interface AuthProps {
  onLogin: (user: User, password?: string) => void;
  onBack: () => void;
  notify: (msg: string, type?: any) => void;
}

const SAVED_ACCOUNTS_KEY = 'alert_sl_remembered_accounts';
const ADMIN_AUTH_CODE = 'SL-ADMIN-0207';

const isValidStaffId = (id: string): boolean => {
  const pattern = /^HW-2024-(\d{3})$/;
  const match = id.toUpperCase().trim().match(pattern);
  if (!match) return false;
  const num = parseInt(match[1], 10);
  return num >= 1 && num <= 500;
};

const Auth: React.FC<AuthProps> = ({ onLogin, onBack, notify }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot-password' | 'verify-code' | 'reset-password'>('login');
  const [isPickMode, setIsPickMode] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<User[]>([]);
  const [showDemoHelp, setShowDemoHelp] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [showSmallNotify, setShowSmallNotify] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: UserRole.PUBLIC,
    district: 'Western Area Urban',
    staffId: '',
    authCode: '',
    facilityName: ''
  });

  const [isEmailDetected, setIsEmailDetected] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);

  // Handle verification link from email
  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const email = params.get('email');
    const code = params.get('code');

    if (mode === 'verify' && email && code) {
      setFormData(prev => ({ ...prev, email }));
      setResetCode(code);
      setAuthMode('reset-password');
      notify("Email verified automatically. Please set your new password.", "success");
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Load saved accounts on mount and handle expiration
  useEffect(() => {
    let initialCheckDone = false;
    const checkExpiration = () => {
      const raw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
      if (raw) {
        const accounts: User[] = JSON.parse(raw);
        const now = Date.now();
        const validAccounts = accounts.filter(a => {
          if (!a.savedAt) return false;
          return now - a.savedAt < 30 * 60 * 1000; // 30 minutes
        });

        // Update state to keep timer running
        setSavedAccounts(validAccounts);

        if (validAccounts.length > 0) {
          // Only force pick mode on the very first check
          if (!initialCheckDone) {
            setIsPickMode(true);
            initialCheckDone = true;
          }
          if (validAccounts.length !== accounts.length) {
            localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(validAccounts));
          }
        } else if (accounts.length > 0) {
          localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify([]));
          setIsPickMode(false);
        }
      }
    };

    checkExpiration();
    const interval = setInterval(checkExpiration, 1000); // Check every second for smooth countdown

    // Load remembered email
    const remembered = localStorage.getItem('alert_sl_remembered_email');
    if (remembered && !formData.email) {
      setFormData(prev => ({ ...prev, email: remembered }));
    }

    return () => clearInterval(interval);
  }, []);

  // Auto-detect Role based on Email Domain
  useEffect(() => {
    const email = formData.email.toLowerCase().trim();
    let detectedRole = UserRole.PUBLIC;
    let detected = false;

    if (email.endsWith('@gov.sl')) {
      detectedRole = UserRole.ADMIN;
      detected = true;
    } else if (email.endsWith('@health.sl') || email.endsWith('@who.int')) {
      detectedRole = UserRole.HEALTH_WORKER;
      detected = true;
    }

    if (detectedRole !== formData.role) {
      setFormData(prev => ({ ...prev, role: detectedRole }));
    }
    setIsEmailDetected(detected);
  }, [formData.email]);

  // Real-time Verification of Registry Codes
  useEffect(() => {
    if (formData.role === UserRole.HEALTH_WORKER) {
      setIsCodeVerified(isValidStaffId(formData.staffId));
    } else if (formData.role === UserRole.ADMIN) {
      setIsCodeVerified(formData.authCode.trim() === ADMIN_AUTH_CODE);
    } else {
      setIsCodeVerified(true);
    }
  }, [formData.staffId, formData.authCode, formData.role]);

  const saveAccountToMemory = (user: User) => {
    const raw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    let accounts: User[] = raw ? JSON.parse(raw) : [];
    // Remove if already exists to update it
    accounts = accounts.filter(a => a.email.toLowerCase() !== user.email.toLowerCase());
    
    // Add timestamp
    const userWithTimestamp = { ...user, savedAt: Date.now() };
    accounts.unshift(userWithTimestamp);
    
    // Limit to 5 accounts
    const truncated = accounts.slice(0, 5);
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(truncated));
    setSavedAccounts(truncated);
  };

  const removeAccountFromMemory = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    const updated = savedAccounts.filter(a => a.email !== email);
    setSavedAccounts(updated);
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
    if (updated.length === 0) setIsPickMode(false);
    notify("Account removed from device", "info");
  };

  const handleQuickLogin = (user: User) => {
    notify(`Welcome back, ${user.name.split(' ')[0]}`, "success");
    onLogin(user, 'auto-login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authMode === 'forgot-password') {
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        });
        if (res.ok) {
          const data = await res.json();
          setGeneratedCode(data.demoCode);
          setShowSmallNotify(true);
          
          const message = data.realEmailSent 
            ? "Reset code sent to your email. Check your inbox." 
            : `Demo Mode: Your reset code is ${data.demoCode}`;
          
          notify(message, "success");
          
          // Also try browser notification if supported
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Outbreak Alert SL", {
              body: `Your reset code is: ${data.demoCode}`,
              icon: "/favicon.ico"
            });
          }

          setAuthMode('verify-code');
        } else {
          notify("Failed to send reset code", "warning");
        }
      } catch (err) {
        notify("Network error", "warning");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (authMode === 'verify-code') {
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/auth/verify-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, code: resetCode })
        });
        if (res.ok) {
          notify("Code verified", "success");
          setAuthMode('reset-password');
        } else {
          notify("Invalid or expired code", "warning");
        }
      } catch (err) {
        notify("Network error", "warning");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (authMode === 'reset-password') {
      if (formData.password !== formData.confirmPassword) {
        notify("Passwords do not match.", "warning");
        return;
      }
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        if (res.ok) {
          notify("Password reset successfully", "success");
          setAuthMode('login');
          setGeneratedCode(null);
        } else {
          notify("Failed to reset password", "warning");
        }
      } catch (err) {
        notify("Network error", "warning");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (authMode === 'signup' && formData.password !== formData.confirmPassword) {
      notify("Passwords do not match.", "warning");
      return;
    }

    if (!isCodeVerified && formData.role !== UserRole.PUBLIC) {
      const type = formData.role === UserRole.ADMIN ? 'Admin Key' : 'Staff ID';
      notify(`Invalid ${type}. Verification failed.`, "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const user = await res.json();
        saveAccountToMemory(user);
        
        if (rememberMe) {
          localStorage.setItem('alert_sl_remembered_email', formData.email);
        } else {
          localStorage.removeItem('alert_sl_remembered_email');
        }

        onLogin(user, formData.password);
      } else {
        const error = await res.json();
        notify(error.error || "Authentication failed", "warning");
      }
    } catch (err) {
      notify("Network error", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickFillAdmin = () => {
    setFormData({ ...formData, email: 'admin@gov.sl', authCode: ADMIN_AUTH_CODE, password: 'password123', confirmPassword: 'password123', name: 'Dr. Alpha Bah (Admin)' });
    setAuthMode('login');
    notify("Admin credentials pre-filled", "info");
  };

  const quickFillHealthWorker = () => {
    setFormData({ ...formData, email: 'nurse.sesay@health.sl', staffId: 'HW-2024-001', password: 'password123', confirmPassword: 'password123', name: 'Nurse Fatima Sesay', facilityName: 'Connaught Hospital' });
    setAuthMode('login');
    notify("Health Worker credentials pre-filled", "info");
  };

  const isFormValid = (formData.role === UserRole.PUBLIC) || isCodeVerified;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-blue-100 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="https://wallpapers.com/images/featured/healthcare-pictures-oco8w27tkw40cp90.jpg" 
          alt="Healthcare Background" 
          className="w-full h-full object-cover opacity-15"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-slate-50/40 backdrop-blur-[2px]"></div>
      </div>
      {/* Background Glassmorphism Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[40%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-400/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Floating Demo Tools */}
      <div className="fixed top-8 right-8 z-[110]">
         <button 
           onMouseEnter={() => setShowDemoHelp(true)}
           onMouseLeave={() => setShowDemoHelp(false)}
           className="w-12 h-12 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-blue-600 transition-all border border-white/20"
         >
           <i className="fa-solid fa-flask-vial"></i>
         </button>
         {showDemoHelp && (
           <div className="absolute top-0 right-16 w-80 bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-3xl border border-white/10 animate-in fade-in slide-in-from-right-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4 text-center">Developer Shortcuts</h4>
              <div className="space-y-4">
                 <button onClick={quickFillAdmin} className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-wider text-left hover:bg-blue-600 transition-all group">
                    <i className="fa-solid fa-bolt mr-2 text-blue-400 group-hover:text-white"></i> Auto-Fill Admin Login
                 </button>
                 <button onClick={quickFillHealthWorker} className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-wider text-left hover:bg-emerald-600 transition-all group">
                    <i className="fa-solid fa-bolt mr-2 text-emerald-400 group-hover:text-white"></i> Auto-Fill Nurse Login
                 </button>
              </div>
           </div>
         )}
      </div>

      {/* Left Branding Sidebar */}
      <div className="hidden lg:flex w-[40%] bg-[#0f172a] p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 z-0">
           <img 
             src="https://wallpapers.com/images/featured/healthcare-pictures-oco8w27tkw40cp90.jpg" 
             alt="Healthcare" 
             className="w-full h-full object-cover opacity-30 grayscale"
             referrerPolicy="no-referrer"
           />
           <div className="absolute inset-0 bg-slate-900/60"></div>
           <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px]"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[120px]"></div>
        </div>
        <div className="relative z-10">
          <button onClick={onBack} className="flex items-center text-blue-400 font-black text-xs uppercase tracking-widest mb-16 hover:text-white transition-all group">
            <i className="fa-solid fa-chevron-left mr-3 group-hover:-translate-x-1 transition-transform"></i>
            Landing
          </button>
          <div className="space-y-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40">
               <i className="fa-solid fa-virus-shield text-white text-3xl"></i>
            </div>
            <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
              One Portal <br />
              <span className="text-blue-500">Endless</span> <br />
              Vigilance.
            </h2>
            <p className="text-slate-400 text-lg font-medium max-w-sm leading-relaxed">
              Integrated National Identity Verification for Sierra Leone's Health Security Network.
            </p>
          </div>
        </div>
        <div className="relative z-10 opacity-30">
           <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Ministry of Health Infrastructure</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16 bg-white/40 backdrop-blur-xl overflow-y-auto relative z-10 border-l border-white/10">
        <div className="w-full max-w-md py-12">
          
          {isPickMode ? (
            <div className="animate-in fade-in zoom-in-95 duration-500">
               <div className="text-center mb-10">
                 <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Choose an account</h1>
                 <p className="text-slate-400 font-medium text-sm">Select a profile to continue to Outbreak Alert SL</p>
               </div>

               <div className="space-y-3 mb-10">
                  {savedAccounts.map((acc) => (
                    <div 
                      key={acc.email}
                      onClick={() => handleQuickLogin(acc)}
                      className="w-full p-4 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-between group hover:bg-slate-50 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all text-left cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-sm shadow-md group-hover:bg-blue-600 transition-colors">
                           {acc.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{acc.name}</p>
                          <p className="text-[11px] text-slate-400 font-medium">{acc.email}</p>
                          {acc.savedAt && (
                            <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mt-1">
                              {(() => {
                                const remaining = 30 * 60 * 1000 - (Date.now() - acc.savedAt);
                                if (remaining <= 0) return 'Expired';
                                if (remaining < 60000) return `Expires in ${Math.ceil(remaining / 1000)}s`;
                                return `Expires in ${Math.ceil(remaining / 60000)}m`;
                              })()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                         <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border ${
                            acc.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-600 border-purple-100' :
                            acc.role === UserRole.HEALTH_WORKER ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            'bg-slate-50 text-slate-600 border-slate-100'
                         }`}>
                           {acc.role.split(' ')[0]}
                         </span>
                         <button 
                           onClick={(e) => removeAccountFromMemory(e, acc.email)}
                           className="w-8 h-8 rounded-full bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                         >
                           <i className="fa-solid fa-trash-can text-xs"></i>
                         </button>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => setIsPickMode(false)}
                    className="w-full p-4 border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-400 flex items-center justify-center space-x-3 hover:border-blue-300 hover:text-blue-500 transition-all"
                  >
                    <i className="fa-solid fa-user-plus text-sm"></i>
                    <span className="text-sm font-black uppercase tracking-widest">Use another account</span>
                  </button>
               </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                  {authMode === 'login' ? 'Welcome Back' : 'Create ID'}
                </h1>
                <p className="text-slate-400 font-medium text-sm">
                  {authMode === 'login' ? 'Access your district dashboard' : 'Join the National Surveillance Network'}
                </p>
              </div>

              <div className="flex p-1 bg-slate-100 rounded-2xl mb-10">
                <button onClick={() => setAuthMode('login')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${authMode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Login</button>
                <button onClick={() => setAuthMode('signup')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${authMode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Sign Up</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {(authMode === 'forgot-password' || authMode === 'verify-code' || authMode === 'reset-password') && (
                  <div className="mb-6">
                    <button 
                      type="button" 
                      onClick={() => {
                        setAuthMode('login');
                        setGeneratedCode(null);
                      }}
                      className="flex items-center text-slate-400 hover:text-slate-900 transition-colors text-[10px] font-black uppercase tracking-widest"
                    >
                      <i className="fa-solid fa-arrow-left mr-2"></i> Back to Login
                    </button>
                  </div>
                )}

                {authMode === 'signup' && (
                  <div className="relative group animate-in slide-in-from-top-2">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors">
                      <i className="fa-solid fa-user"></i>
                    </span>
                    <input type="text" required className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-semibold focus:bg-white focus:border-blue-400 transition-all" placeholder="Official Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                )}

                {(authMode === 'login' || authMode === 'signup' || authMode === 'forgot-password') && (
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors">
                      <i className="fa-solid fa-envelope"></i>
                    </span>
                    <input type="email" required className={`w-full pl-11 pr-12 py-4 bg-slate-50 border rounded-2xl outline-none text-sm font-semibold transition-all ${isEmailDetected ? 'border-blue-200 bg-blue-50/20' : 'border-slate-100 focus:bg-white focus:border-blue-400'}`} placeholder="Work Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    {isEmailDetected && <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-600"><i className="fa-solid fa-circle-check"></i></div>}
                  </div>
                )}

                {authMode === 'verify-code' && (
                  <div className="space-y-4 animate-in slide-in-from-top-2">
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors">
                        <i className="fa-solid fa-key"></i>
                      </span>
                      <input type="text" required className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-semibold focus:bg-white focus:border-blue-400 transition-all" placeholder="Enter 6-digit Code" value={resetCode} onChange={e => setResetCode(e.target.value)} maxLength={6} />
                    </div>
                    <div className="flex flex-col space-y-3">
                      <a 
                        href="https://mail.google.com/" 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center hover:bg-slate-800 transition-all"
                      >
                        <i className="fa-solid fa-envelope-open-text mr-2"></i> Open Gmail
                      </a>
                      <button 
                        type="button"
                        disabled={isResending}
                        onClick={async () => {
                          setIsResending(true);
                          try {
                            const res = await fetch('/api/auth/forgot-password', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ email: formData.email })
                            });
                            if (res.ok) {
                              const data = await res.json();
                              setGeneratedCode(data.demoCode);
                              setShowSmallNotify(true);
                              notify("Code resent to your email", "success");
                            } else {
                              notify("Failed to resend code", "warning");
                            }
                          } catch (err) {
                            notify("Network error", "warning");
                          } finally {
                            setIsResending(false);
                          }
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                      >
                        {isResending ? 'Resending...' : "Didn't get a code? Resend"}
                      </button>
                    </div>
                  </div>
                )}

                {(authMode === 'login' || authMode === 'signup' || authMode === 'reset-password') && (
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors">
                      <i className="fa-solid fa-lock"></i>
                    </span>
                    <input type="password" required className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-semibold focus:bg-white focus:border-blue-400 transition-all" placeholder={authMode === 'reset-password' ? "New Password" : "Password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                )}

                {authMode === 'login' && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <div className="relative w-5 h-5">
                        <input 
                          type="checkbox" 
                          className="peer sr-only" 
                          checked={rememberMe} 
                          onChange={e => setRememberMe(e.target.checked)} 
                        />
                        <div className="w-5 h-5 bg-slate-100 border border-slate-200 rounded-lg peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                        <i className="fa-solid fa-check absolute inset-0 flex items-center justify-center text-[10px] text-white opacity-0 peer-checked:opacity-100 transition-opacity"></i>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">Remember Me</span>
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setAuthMode('forgot-password')}
                      className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                {(authMode === 'signup' || authMode === 'reset-password') && (
                  <div className="relative group animate-in slide-in-from-top-2">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors">
                      <i className="fa-solid fa-shield-halved"></i>
                    </span>
                    <input type="password" required className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-semibold focus:bg-white focus:border-blue-400 transition-all" placeholder="Confirm Password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                  </div>
                )}

                {formData.role === UserRole.HEALTH_WORKER && (
                  <div className="pt-2 animate-in slide-in-from-bottom-4 space-y-4">
                     <div className={`p-6 rounded-[2.5rem] border transition-all ${isCodeVerified ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100 shadow-xl shadow-blue-500/10'}`}>
                        <div className="flex items-center space-x-3 mb-4">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${isCodeVerified ? 'bg-emerald-600' : 'bg-blue-600'}`}><i className={`fa-solid ${isCodeVerified ? 'fa-id-card' : 'fa-user-nurse'}`}></i></div>
                           <div>
                              <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${isCodeVerified ? 'text-emerald-600' : 'text-blue-600'}`}>Staff Registry</p>
                              <p className="text-xs font-bold text-slate-800">{isCodeVerified ? 'ID Recognized' : 'Enter Staff ID'}</p>
                           </div>
                        </div>
                        <input type="text" className={`w-full px-4 py-4 bg-white border rounded-xl outline-none text-sm font-black uppercase tracking-widest ${isCodeVerified ? 'border-emerald-200 ring-4 ring-emerald-500/5' : 'border-blue-200'}`} placeholder="HW-2024-XXX" value={formData.staffId} onChange={e => setFormData({...formData, staffId: e.target.value})} />
                     </div>
                  </div>
                )}

                {formData.role === UserRole.ADMIN && (
                  <div className="pt-2 animate-in slide-in-from-bottom-4">
                     <div className={`p-6 rounded-[2.5rem] border transition-all ${isCodeVerified ? 'bg-emerald-50 border-emerald-100' : 'bg-purple-50 border-purple-100 shadow-xl shadow-purple-500/10'}`}>
                        <div className="flex items-center space-x-3 mb-4">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${isCodeVerified ? 'bg-emerald-600' : 'bg-purple-600'}`}><i className={`fa-solid ${isCodeVerified ? 'fa-shield-check' : 'fa-shield-halved'}`}></i></div>
                           <div>
                              <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${isCodeVerified ? 'text-emerald-600' : 'text-purple-600'}`}>Government Hub</p>
                              <p className="text-xs font-bold text-slate-800">{isCodeVerified ? 'Verified' : 'Enter Admin Key'}</p>
                           </div>
                        </div>
                        <input type="password" className={`w-full px-4 py-4 bg-white border rounded-xl outline-none text-sm font-black tracking-[0.4em] ${isCodeVerified ? 'border-emerald-200 ring-4 ring-emerald-500/5' : 'border-purple-200'}`} placeholder="ADMIN-CODE" value={formData.authCode} onChange={e => setFormData({...formData, authCode: e.target.value})} />
                     </div>
                  </div>
                )}

                <button type="submit" className={`w-full py-5 text-white font-black rounded-2xl shadow-xl transition-all mt-4 active:scale-95 ${(!isFormValid || isSubmitting) ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60' : 'bg-blue-600 shadow-blue-500/20 hover:bg-blue-700'}`} disabled={!isFormValid || isSubmitting}>
                  {isSubmitting ? (
                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                  ) : (
                    authMode === 'login' ? 'Authenticate & Enter' : 
                    authMode === 'signup' ? 'Provision My Account' :
                    authMode === 'forgot-password' ? 'Send Reset Code' :
                    authMode === 'verify-code' ? 'Verify Code' : 'Update Password'
                  )}
                </button>
                
                {savedAccounts.length > 0 && (
                  <button type="button" onClick={() => setIsPickMode(true)} className="w-full py-3 text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 transition-colors tracking-widest">
                     Back to account picker
                  </button>
                )}
              </form>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-slate-50 text-center opacity-30 flex justify-center space-x-12">
             <i className="fa-brands fa-google text-2xl"></i>
             <i className="fa-brands fa-microsoft text-2xl"></i>
             <i className="fa-solid fa-id-card-clip text-2xl"></i>
          </div>
        </div>
      </div>

      {/* Small Verification Notification */}
      {showSmallNotify && generatedCode && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[400] w-[calc(100%-3rem)] max-w-sm animate-in slide-in-from-top-4 duration-500">
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-lg">
                <i className="fa-solid fa-shield-check"></i>
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Verification Code</p>
                <p className="text-xl font-black tracking-[0.2em]">{generatedCode}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => {
                  setResetCode(generatedCode);
                  setShowSmallNotify(false);
                  notify("Code applied", "success");
                }}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-[10px] font-black uppercase rounded-lg transition-colors"
              >
                Apply
              </button>
              <button 
                onClick={() => setShowSmallNotify(false)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
