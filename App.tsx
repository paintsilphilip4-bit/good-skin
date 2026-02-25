
import React, { useState, useEffect, useRef } from 'react';
import * as Lucide from 'lucide-react';
import { analyzeSkinImage } from './services/geminiService';
import { PRACTITIONER_REGISTRY, Practitioner, APP_LOGO_URL, MOCK_DOCTORS, ACTIVE_CLINIC_ID, ADMIN_EMAIL, NEWMAN_EMAIL, NEWMAN_MDC, ARABA_EMAIL, ARABA_MDC } from './constants';
import SpecialistHub from './components/SpecialistHub';
import ScanView from './components/ScanView';
import AdminConsole from './components/AdminConsole';
import PatientDashboard from './components/PatientDashboard';
import { Doctor, ScanResult } from './types';

/**
 * UTILS
 */
const getPersistentID = () => localStorage.getItem('permanentPatientID') || '';
const getPersistentName = () => localStorage.getItem('permanentPatientName') || '';
const getSpecialistSession = () => {
    try {
        const session = localStorage.getItem('specialistSession');
        return session ? JSON.parse(session) : null;
    } catch (e) {
        return null;
    }
};

/**
 * FIRESTORE REST API CONFIGURATION
 */
const PROJECT_ID = 'good-skin-2';
const BASE_DB_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const PATIENTS_URL = `${BASE_DB_URL}/patients`;
const VERIFIED_URL = `${BASE_DB_URL}/verified_specialists`;
const CASES_URL = `${BASE_DB_URL}/active_cases`; 

/**
 * CASE MANAGEMENT SERVICE (THE BROADCAST LOGIC)
 */
async function createClinicalCase(doctor: Doctor, scan: ScanResult, patientPhone: string, patientName: string, patientAge: string) {
  const payload = {
    fields: {
      patientName: { stringValue: patientName || "Guest Patient" },
      patientAge: { stringValue: patientAge || "N/A" },
      patientPhone: { stringValue: patientPhone || "N/A" },
      imageURL: { stringValue: scan.imageUrl },
      status: { stringValue: 'pending' },
      aiAnalysis: { stringValue: JSON.stringify(scan.analysis) }, 
      specialistID: { stringValue: "" }, 
      targetSpecialistID: { stringValue: doctor.id },
      createdAt: { timestampValue: new Date().toISOString() } 
    }
  };

  const response = await fetch(CASES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error('BROADCAST_FAILURE');
  const data = await response.json();
  return data.name.split('/').pop(); 
}

/**
 * PATIENT PROFILE SERVICE
 */
async function savePatientProfile(phone: string, name: string, age: string) {
    const payload = {
        fields: {
            name: { stringValue: name },
            age: { stringValue: age },
            phone: { stringValue: phone },
            registeredAt: { timestampValue: new Date().toISOString() }
        }
    };
    
    await fetch(`${PATIENTS_URL}/${phone}?updateMask.fieldPaths=name&updateMask.fieldPaths=age&updateMask.fieldPaths=phone`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}

/**
 * VERIFICATION SERVICE
 */
async function verifySpecialist(email: string, mdc: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedMDC = mdc.trim();
  
  if (normalizedEmail === 'philip@goodskin.com') {
      return { name: "Philip (Founder)", email: normalizedEmail, mdc: "MASTER", avatar: APP_LOGO_URL, isAdmin: true, id: 'FOUNDER_001' };
  }

  if (normalizedEmail === NEWMAN_EMAIL && (normalizedMDC === 'NEWMAN' || normalizedMDC === NEWMAN_MDC)) {
      const doc = MOCK_DOCTORS.find(d => d.id === 'DOC_NEWMAN_001');
      return { name: doc?.name, email: normalizedEmail, mdc: normalizedMDC, avatar: doc?.image, isAdmin: false, id: doc?.id, doctorData: doc };
  }

  if (normalizedEmail === ARABA_EMAIL && (normalizedMDC === 'ARABA' || normalizedMDC === ARABA_MDC)) {
      const doc = MOCK_DOCTORS.find(d => d.id === 'DOC_ARABA_002');
      return { name: doc?.name, email: normalizedEmail, mdc: normalizedMDC, avatar: doc?.image, isAdmin: false, id: doc?.id, doctorData: doc };
  }

  try {
    const docId = normalizedEmail.replace(/[^a-z0-9]/g, '_');
    const response = await fetch(`${VERIFIED_URL}/${docId}`);
    if (!response.ok) throw new Error('NOT_WHITELISTED');
    const data = await response.json();
    return { name: data.fields.name.stringValue, email, mdc, avatar: data.fields.avatar?.stringValue || MOCK_DOCTORS[0].image, isAdmin: false, id: ACTIVE_CLINIC_ID };
  } catch (e: any) {
    return { name: MOCK_DOCTORS[0].name, email, mdc, avatar: MOCK_DOCTORS[0].image, isAdmin: false, id: ACTIVE_CLINIC_ID };
  }
}

/**
 * SUB-COMPONENTS
 */

const PatientLoginModal = ({ onLogin, onCancel }: { onLogin: (phone: string, name: string) => void, onCancel: () => void }) => {
  const [phone, setPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const handleDiscovery = async () => {
    if (phone.length < 5) return;
    setIsSearching(true);
    setError('');
    try {
      const response = await fetch(`${PATIENTS_URL}/${phone}`);
      if (!response.ok) {
         setError('No clinical record found for this mobile ID.');
         return;
      }
      const data = await response.json();
      const name = data.fields?.name?.stringValue || "Valued Patient";
      onLogin(phone, name);
    } catch (e) {
      setError('Connection Error. Try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-charcoal/60 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-[3rem] p-12 shadow-2xl space-y-12 animate-in zoom-in-95 duration-500">
        <div className="text-center space-y-4">
           <div className="w-16 h-16 bg-vitality/10 rounded-2xl flex items-center justify-center text-vitality mx-auto">
             <Lucide.Search className="w-8 h-8" />
           </div>
           <h3 className="text-3xl font-black uppercase italic tracking-tighter text-charcoal">Welcome Back</h3>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Enter your phone number to access your history.</p>
        </div>
        <div className="space-y-6">
          <input 
            type="tel" value={phone} onChange={e => setPhone(e.target.value)} 
            placeholder="Phone Number" 
            className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-2xl text-2xl font-black text-center text-charcoal outline-none focus:border-vitality transition-all" 
          />
          {error && <p className="text-[10px] font-bold text-rose-500 uppercase text-center tracking-widest">{error}</p>}
          <button 
            onClick={handleDiscovery} disabled={isSearching || phone.length < 5}
            className="w-full py-6 bg-charcoal text-white rounded-full font-black uppercase text-[12px] tracking-[0.4em] shadow-xl flex items-center justify-center gap-3"
          >
            {isSearching ? <Lucide.Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </button>
          <button onClick={onCancel} className="w-full text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Go Back</button>
        </div>
      </div>
    </div>
  );
};

const PatientIdentityModal = ({ onSave, onCancel, onSwitchToLogin }: { onSave: (p: string, n: string, a: string) => Promise<any>, onCancel: () => void, onSwitchToLogin: () => void }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [duplicateFound, setDuplicateFound] = useState(false);

  const handleSave = async () => {
    if (!name || !phone || !age) return;
    setLoading(true);
    setDuplicateFound(false);

    try {
        // Step 1: Check if phone already exists
        const checkResponse = await fetch(`${PATIENTS_URL}/${phone}`);
        if (checkResponse.ok) {
            // 200 OK means record exists
            setDuplicateFound(true);
            setLoading(false);
            return;
        }

        // Step 2: If not found (404), proceed to save
        await onSave(phone, name, age);
    } catch (e) {
        console.error("Identity Verification Error", e);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-charcoal/60 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-[3rem] p-12 shadow-2xl space-y-8 animate-in zoom-in-95 duration-500">
        <header className="text-center">
           <h3 className="text-3xl font-black uppercase italic tracking-tighter text-charcoal mb-2">New Patient</h3>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Create your secure profile</p>
        </header>

        {duplicateFound ? (
             <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl text-center space-y-4 animate-in slide-in-from-top-4">
                <Lucide.AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <div>
                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Account Exists</h4>
                    <p className="text-[10px] font-bold text-amber-700/80 mt-1">This phone number is already registered.</p>
                </div>
                <button 
                    onClick={onSwitchToLogin}
                    className="w-full py-4 bg-amber-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-amber-500/20"
                >
                    Sign In Instead
                </button>
             </div>
        ) : (
            <>
                <div className="space-y-4">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold uppercase tracking-widest outline-none focus:border-vitality transition-all" />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold uppercase tracking-widest outline-none focus:border-vitality transition-all" />
                  <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold uppercase tracking-widest outline-none focus:border-vitality transition-all" />
                </div>
                <div className="flex flex-col gap-4 pt-4">
                   <button onClick={handleSave} disabled={!name || !phone || loading} className="w-full py-5 bg-charcoal text-white rounded-full font-black uppercase text-[11px] tracking-[0.4em] shadow-xl flex items-center justify-center gap-3">
                      {loading ? <Lucide.Loader2 className="w-4 h-4 animate-spin" /> : "Create Profile"}
                   </button>
                   <button onClick={onCancel} className="w-full py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cancel</button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

const SpecialistLoginModal = ({ onLogin, onClose }: { onLogin: (s: any) => void, onClose: () => void }) => {
  const [email, setEmail] = useState('');
  const [mdc, setMdc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const user = await verifySpecialist(email, mdc);
    onLogin(user);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-charcoal/60 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-[3rem] p-12 shadow-2xl space-y-8">
        <header className="text-center">
           <Lucide.ShieldCheck className="w-12 h-12 text-vitality mx-auto mb-6" />
           <h3 className="text-3xl font-black uppercase italic tracking-tighter text-charcoal mb-2">Specialist Gate</h3>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized Clinical Access Only</p>
        </header>
        <div className="space-y-4">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Clinical Email" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold uppercase tracking-widest outline-none focus:border-vitality transition-all" />
          <input value={mdc} onChange={(e) => setMdc(e.target.value)} placeholder="MDC Registration Number" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold uppercase tracking-widest outline-none focus:border-vitality transition-all" />
        </div>
        <div className="flex flex-col gap-4 pt-4">
           <button onClick={handleLogin} disabled={!email || loading} className="w-full py-5 bg-vitality text-white rounded-full font-black uppercase text-[11px] tracking-[0.4em] shadow-xl flex items-center justify-center gap-3">
              {loading ? <Lucide.Loader2 className="w-4 h-4 animate-spin" /> : "Authenticate"}
           </button>
           <button onClick={onClose} className="w-full py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Return to Public Area</button>
        </div>
      </div>
    </div>
  );
};

const AdminLoginModal = ({ onLogin, onClose }: { onLogin: (s: any) => void, onClose: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (email === 'philip@goodskin.com') {
        const user = { name: "Philip (Founder)", email, isAdmin: true, avatar: APP_LOGO_URL, id: 'FOUNDER_001' };
        onLogin(user);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-sm bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl space-y-8">
        <header className="text-center">
           <Lucide.Terminal className="w-12 h-12 text-vitality mx-auto mb-6" />
           <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">Terminal Login</h3>
        </header>
        <div className="space-y-4">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Root User" className="w-full px-8 py-5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold uppercase text-white tracking-[0.3em] outline-none focus:border-vitality transition-all" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Keyphrase" className="w-full px-8 py-5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold uppercase text-white tracking-[0.3em] outline-none focus:border-vitality transition-all" />
        </div>
        <button onClick={handleLogin} className="w-full py-5 bg-vitality text-white rounded-full font-black uppercase text-[11px] tracking-[0.4em]">Execute Auth</button>
        <button onClick={onClose} className="w-full py-2 text-[10px] font-bold text-slate-700 uppercase tracking-widest">Close</button>
      </div>
    </div>
  );
};

const LandingView = ({ onIntake, onHistory, patientName }: { onIntake: () => void, onHistory: () => void, patientName: string }) => {
  return (
    <div className="min-h-screen pt-40 px-8 pb-32 animate-in fade-in duration-1000 overflow-hidden bg-white">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        
        {/* INTERACTIVE LOGO HUB AREA */}
        <div className="relative animate-float flex justify-center w-full mb-16">
           <div className="relative group max-w-xs w-full">
              <div className="relative bg-white p-6 rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-slate-50 transition-all duration-700 hover:shadow-[0_60px_120px_-20px_rgba(0,0,0,0.12)]">
                 <div className="relative aspect-square squircle overflow-hidden bg-white flex items-center justify-center group cursor-default">
                   <div className="scanning-line" />
                   <div className="w-full h-full flex items-center justify-center relative z-10">
                      <img 
                        src={APP_LOGO_URL} 
                        className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-105" 
                        alt="GoodSkin Official Logo" 
                      />
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-tr from-vitality/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                 </div>
                 <div className="mt-6 flex justify-center items-center gap-4">
                    <div className="flex items-center gap-2.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-vitality animate-pulse shadow-[0_0_10px_#10B981]" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Protocol Authorized</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-12 relative">
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full">
               <Lucide.Sparkles className="w-3.5 h-3.5 text-vitality" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-charcoal">AI-Powered Clinical Triage</span>
            </div>
            <h2 className="text-7xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.85] text-charcoal">
              Future of<br /><span className="text-slate-400">Skin Health.</span>
            </h2>
            <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto leading-relaxed">
              Professional dermatological analysis and specialist consultation, synchronized instantly through neural imaging.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 relative z-10">
             <button onClick={onIntake} className="w-full md:w-auto px-12 py-8 bg-charcoal text-white rounded-full font-black uppercase text-sm tracking-[0.4em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4">
                Start Precision Scan <Lucide.ArrowRight className="w-5 h-5" />
             </button>
             <button onClick={onHistory} className="w-full md:w-auto px-12 py-8 bg-white border border-slate-100 text-charcoal rounded-full font-black uppercase text-sm tracking-[0.4em] shadow-xl hover:bg-slate-50 transition-all">
                Sign In / Previous User
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * MAIN APP
 */

const App = () => {
  const [view, setView] = useState<'landing' | 'patient-login' | 'patient-dashboard' | 'patient-intake' | 'specialist-hub' | 'admin-console'>('landing');
  const [patientPhone, setPatientPhone] = useState(getPersistentID());
  const [patientName, setPatientName] = useState(getPersistentName());
  const [patientAge, setPatientAge] = useState('');
  
  const [specialist, setSpecialist] = useState<any>(getSpecialistSession());
  const [showSpecialistModal, setShowSpecialistModal] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const pendingConsultation = useRef<{ doctor: Doctor, scan: ScanResult } | null>(null);

  useEffect(() => {
    if (specialist) {
        if (specialist.email === 'philip@goodskin.com' || specialist.isAdmin) setView('admin-console');
        else setView('specialist-hub');
    }
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [specialist]); 

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount >= 5) {
      setLogoClicks(0);
      setShowAdminModal(true);
    }
    setTimeout(() => setLogoClicks(0), 3000);
  };

  const handleConsultRequest = async (doctor: Doctor, scan?: ScanResult) => {
    if (!scan) return;
    if (!patientPhone) {
        pendingConsultation.current = { doctor, scan };
        setShowIdentityModal(true);
        return;
    }
    try {
      return await createClinicalCase(doctor, scan, patientPhone, patientName, patientAge);
    } catch (e) {
      console.error("Specialist Bridge Failed:", e);
      throw e;
    }
  };

  const finalizeIdentity = async (phone: string, name: string, age: string) => {
    await savePatientProfile(phone, name, age);
    localStorage.setItem('permanentPatientID', phone);
    localStorage.setItem('permanentPatientName', name);
    setPatientPhone(phone);
    setPatientName(name);
    setPatientAge(age);
    setShowIdentityModal(false);
    if (pendingConsultation.current) {
        const { doctor, scan } = pendingConsultation.current;
        const id = await createClinicalCase(doctor, scan, phone, name, age);
        pendingConsultation.current = null;
        return id;
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-10 animate-in fade-in duration-500">
      <img src={APP_LOGO_URL} className="w-16 h-16 squircle animate-float shadow-xl border border-slate-50" />
      <Lucide.Loader2 className="w-4 h-4 text-vitality animate-spin opacity-50" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white selection:bg-vitality/20 font-sans overflow-x-hidden text-charcoal tracking-tight">
      {showIdentityModal && (
        <PatientIdentityModal 
            onSave={finalizeIdentity} 
            onCancel={() => setShowIdentityModal(false)} 
            onSwitchToLogin={() => {
                setShowIdentityModal(false);
                setView('patient-login');
            }}
        />
      )}
      
      {view === 'patient-login' && (
        <PatientLoginModal 
          onLogin={(phone, name) => {
            localStorage.setItem('permanentPatientID', phone);
            localStorage.setItem('permanentPatientName', name);
            setPatientPhone(phone);
            setPatientName(name);
            setView('patient-dashboard');
          }}
          onCancel={() => setView('landing')}
        />
      )}

      {showAdminModal && (
        <AdminLoginModal onLogin={(s) => { setSpecialist(s); setShowAdminModal(false); setView('admin-console'); }} onClose={() => setShowAdminModal(false)} />
      )}

      {view !== 'admin-console' && (
        <header className="fixed top-0 left-0 right-0 z-[5000] bg-white/80 backdrop-blur-3xl border-b border-slate-100/50 px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView('landing')}>
            <img src={APP_LOGO_URL} onClick={handleLogoClick} className="w-8 h-8 squircle shadow-sm" />
            <h1 className="text-xl font-black uppercase italic tracking-tighter text-charcoal">GoodSkin</h1>
          </div>
          <div className="flex items-center gap-8">
              <button onClick={() => specialist ? (specialist.isAdmin ? setView('admin-console') : setView('specialist-hub')) : setShowSpecialistModal(true)} className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.4em] text-slate-600 hover:text-charcoal transition-all">
                  <Lucide.Lock className="w-3 h-3" /> Specialist Portal
              </button>
              {patientPhone && (
                  <button onClick={() => setView('patient-dashboard')} className="p-3 bg-charcoal text-white rounded-full hover:bg-black transition-all">
                      <Lucide.User className="w-4 h-4" />
                  </button>
              )}
          </div>
        </header>
      )}

      {showSpecialistModal && (
          <SpecialistLoginModal onLogin={(s) => { setSpecialist(s); setShowSpecialistModal(false); if (s.isAdmin) setView('admin-console'); else setView('specialist-hub'); }} onClose={() => setShowSpecialistModal(false)} />
      )}

      <main className="pt-0">
        {view === 'landing' && (
          <LandingView 
            onIntake={() => setView('patient-intake')} 
            onHistory={() => patientPhone ? setView('patient-dashboard') : setView('patient-login')} 
            patientName={patientName} 
          />
        )}
        {view === 'patient-dashboard' && (
          <PatientDashboard 
            patientPhone={patientPhone} 
            patientName={patientName} 
            onStartNewScan={() => setView('patient-intake')} 
            onLogout={() => { 
              localStorage.removeItem('permanentPatientID'); 
              localStorage.removeItem('permanentPatientName');
              setPatientPhone(''); 
              setView('landing'); 
            }} 
          />
        )}
        {view === 'patient-intake' && <ScanView onBack={() => setView(patientPhone ? 'patient-dashboard' : 'landing')} onConsult={handleConsultRequest} onScanComplete={() => {}} />}
        {view === 'specialist-hub' && specialist && (
          <SpecialistHub 
            doctor={specialist.doctorData || MOCK_DOCTORS[0]} 
            onLogout={() => { localStorage.removeItem('specialistSession'); setSpecialist(null); setView('landing'); }} 
            onCompleteConsultation={() => {}} 
          />
        )}
        {view === 'admin-console' && specialist?.isAdmin && <AdminConsole onExit={() => setView('landing')} />}
      </main>
    </div>
  );
};

export default App;
