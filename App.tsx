
import React, { useState, useEffect, useRef } from 'react';
import * as Lucide from 'lucide-react';
import { analyzeSkinImage } from './services/geminiService';
import { PRACTITIONER_REGISTRY, Practitioner, APP_LOGO_URL, MOCK_DOCTORS, ACTIVE_CLINIC_ID, ADMIN_EMAIL } from './constants';
import SpecialistHub from './components/SpecialistHub';
import ScanView from './components/ScanView';
import AdminConsole from './components/AdminConsole';
import { Doctor, ScanResult } from './types';

/**
 * UTILS
 */
const getPersistentID = () => localStorage.getItem('permanentPatientID') || '';
const getSpecialistSession = () => JSON.parse(localStorage.getItem('specialistSession') || 'null');

/**
 * FIRESTORE REST API CONFIGURATION (Simulated)
 */
const PROJECT_ID = 'good-skin-2';
const BASE_DB_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const VERIFIED_URL = `${BASE_DB_URL}/verified_specialists`;

/**
 * VERIFICATION SERVICE
 */
async function verifySpecialist(email: string, mdc: string) {
  try {
    // Hidden Admin Bypass
    if (email === ADMIN_EMAIL && mdc === 'ADMIN') {
        return { name: "System Admin", email: ADMIN_EMAIL, mdc: "ADMIN", avatar: "", isAdmin: true };
    }

    const docId = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const response = await fetch(`${VERIFIED_URL}/${docId}`);
    
    if (!response.ok) {
      if (response.status === 404) throw new Error('NOT_WHITELISTED');
      throw new Error('AUTH_FAIL');
    }

    const data = await response.json();
    const f = data.fields;
    
    if (!f.access_granted?.booleanValue) throw new Error('ACCESS_DENIED');
    if (f.MDC_Number?.stringValue !== mdc) throw new Error('MDC_MISMATCH');

    return {
      name: f.name?.stringValue || "Specialist",
      email: email,
      mdc: mdc,
      avatar: f.avatar?.stringValue || MOCK_DOCTORS[0].image,
      isAdmin: false
    };
  } catch (e: any) {
    if (e.message === 'Failed to fetch' || e.message === 'AUTH_FAIL') {
        console.warn("Auth service offline - using mock session for development.");
        return { name: MOCK_DOCTORS[0].name, email, mdc, avatar: MOCK_DOCTORS[0].image, isAdmin: false };
    }
    throw e;
  }
}

/**
 * SUB-COMPONENTS
 */

const SpecialistLoginModal = ({ onLogin, onClose }: { onLogin: (s: any) => void, onClose: () => void }) => {
  const [email, setEmail] = useState('');
  const [mdc, setMdc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
        const session = await verifySpecialist(email, mdc);
        localStorage.setItem('specialistSession', JSON.stringify(session));
        onLogin(session);
    } catch (e: any) {
        setError(e.message === 'NOT_WHITELISTED' ? 'Access Denied. Credentials not verified.' : 'Security error.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-black/10 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="w-full max-w-md bg-white/70 backdrop-blur-3xl rounded-[3rem] p-12 shadow-2xl space-y-12 relative border border-white/40 animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-10 right-10 text-slate-500 hover:text-charcoal transition-colors">
          <Lucide.X className="w-6 h-6" />
        </button>
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-white border border-slate-100 squircle flex items-center justify-center text-vitality mx-auto shadow-sm">
            <Lucide.ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Clinical Auth</h2>
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.5em] mt-3">Verified Specialist Portal</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <input 
              type="email" required placeholder="OFFICIAL EMAIL" 
              className="w-full bg-white/50 border border-slate-200 rounded-2xl px-8 py-5 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-charcoal transition-all placeholder:text-slate-500"
              value={email} onChange={e => setEmail(e.target.value)}
            />
            <input 
              type="text" required placeholder="MDC REGISTRATION" 
              className="w-full bg-white/50 border border-slate-200 rounded-2xl px-8 py-5 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-charcoal transition-all placeholder:text-slate-500"
              value={mdc} onChange={e => setMdc(e.target.value)}
            />
          </div>
          {error && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest text-center italic">{error}</p>}
          <button 
            type="submit" disabled={loading}
            className="w-full py-6 bg-charcoal text-white rounded-full font-bold uppercase text-[11px] tracking-[0.6em] shadow-xl hover:bg-black active:scale-[0.98] transition-all"
          >
            {loading ? 'Verifying...' : 'Authorize Session'}
          </button>
        </form>
      </div>
    </div>
  );
};

const PatientLogin = ({ onLogin, onBack }: { onLogin: (p: string) => void, onBack: () => void }) => {
  const [phone, setPhone] = useState('');
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white animate-in fade-in duration-700">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-[3rem] p-12 space-y-12 shadow-2xl">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-slate-50 squircle flex items-center justify-center text-vitality mx-auto">
            <Lucide.FolderLock className="w-8 h-8" />
          </div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">My Registry</h2>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.5em] italic leading-relaxed px-4">Enter your mobile ID to synchronize your clinical history.</p>
        </div>
        <div className="space-y-6">
          <input 
            type="tel" 
            placeholder="024 XXX XXXX"
            className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-8 py-6 text-2xl font-black text-center focus:bg-white focus:border-charcoal outline-none transition-all placeholder:text-slate-400"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button 
            onClick={() => phone.length >= 10 && onLogin(phone)}
            className="w-full py-7 bg-charcoal text-white rounded-full font-black uppercase text-[13px] tracking-[0.6em] shadow-2xl hover:bg-black active:scale-[0.98] transition-all"
          >
            Login
          </button>
          <button onClick={onBack} className="w-full text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center hover:text-charcoal transition-colors">Return to Entry</button>
        </div>
      </div>
    </div>
  );
};

const PatientDashboard = ({ phone, onStartNewCase, onLogout }: { phone: string, onStartNewCase: () => void, onLogout: () => void }) => {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-8 animate-in fade-in duration-1000">
      <div className="max-w-4xl mx-auto space-y-16">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-2">
            <h2 className="text-5xl font-black text-charcoal tracking-tighter uppercase italic leading-none">Clinical Folder</h2>
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.6em] italic">Active Patient Registry: {phone}</p>
          </div>
          <button 
            onClick={onLogout}
            className="px-10 py-4 bg-white border border-slate-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm active:scale-95"
          >
            End Session
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white rounded-[3.5rem] p-14 space-y-12 border border-slate-50 shadow-[0_30px_80px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_100px_rgba(0,0,0,0.06)] hover:scale-[1.01] transition-all duration-700 group">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-vitality/5 rounded-3xl text-vitality flex items-center justify-center group-hover:bg-vitality group-hover:text-white transition-all duration-500">
                <Lucide.Scan className="w-10 h-10" />
              </div>
              <h3 className="text-4xl font-black uppercase italic tracking-tighter">New Scan</h3>
            </div>
            <p className="text-[12px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed italic pr-4">Initiate a high-precision neural analysis of your skin health for specialist assessment.</p>
            <button 
              onClick={onStartNewCase}
              className="w-full py-8 bg-charcoal text-white rounded-full font-bold uppercase text-[12px] tracking-[0.6em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-5"
            >
              Start Scan <Lucide.ArrowRight className="w-6 h-6 text-vitality" />
            </button>
          </div>

          <div className="bg-slate-50/30 rounded-[3.5rem] p-14 space-y-12 border border-slate-100 group opacity-50">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl text-slate-500 flex items-center justify-center">
                <Lucide.History className="w-10 h-10" />
              </div>
              <h3 className="text-4xl font-black uppercase italic tracking-tighter">History</h3>
            </div>
            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed italic pr-4">Review historical clinical findings, prescribed protocols, and consultation records.</p>
            <button disabled className="w-full py-8 bg-slate-100 text-slate-500 rounded-full font-bold uppercase text-[11px] tracking-[0.5em] cursor-not-allowed border border-slate-200">
              Folder Sealed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * MAIN APP CONTAINER
 */
const App = () => {
  const [view, setView] = useState<'landing' | 'patient-login' | 'patient-dashboard' | 'patient-intake' | 'specialist-hub' | 'admin-console'>('landing');
  const [patientPhone, setPatientPhone] = useState(getPersistentID());
  const [specialist, setSpecialist] = useState<any>(getSpecialistSession());
  const [showSpecialistModal, setShowSpecialistModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hidden Route Check
    if (window.location.hash === '#admin' && specialist?.isAdmin) {
        setView('admin-console');
    }
    setTimeout(() => setIsLoading(false), 800);
  }, [specialist]);

  const handlePatientLogout = () => {
    localStorage.removeItem('permanentPatientID');
    setPatientPhone('');
    setView('landing');
  };

  const handleSpecialistLogout = () => {
    localStorage.removeItem('specialistSession');
    setSpecialist(null);
    setView('landing');
  };

  if (isLoading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-10 animate-in fade-in duration-500">
      <img src={APP_LOGO_URL} className="w-16 h-16 squircle animate-float shadow-xl border border-slate-50" />
      <div className="italic font-black text-[11px] uppercase tracking-[1em] text-slate-400">Synchronizing...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white selection:bg-vitality/20 font-sans overflow-x-hidden text-charcoal tracking-tight">
      
      {/* STUDIO HEADER */}
      {view !== 'admin-console' && (
        <header className="fixed top-0 left-0 right-0 z-[5000] bg-white/80 backdrop-blur-3xl border-b border-slate-100/50 px-8 py-6 flex justify-between items-center transition-all duration-700">
          <div className="flex items-center gap-4 cursor-pointer hover:opacity-70 transition-all group" onClick={() => setView('landing')}>
            <img src={APP_LOGO_URL} className="w-8 h-8 squircle shadow-sm group-hover:scale-105 transition-transform" />
            <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">GoodSkin</h1>
          </div>

          <div className="flex items-center gap-8">
              <button 
                  onClick={() => {
                      if (specialist?.isAdmin) setView('admin-console');
                      else if (specialist) setView('specialist-hub');
                      else setShowSpecialistModal(true);
                  }}
                  className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.4em] text-slate-600 hover:text-charcoal transition-all group"
              >
                  <Lucide.Lock className="w-3 h-3 opacity-80 group-hover:opacity-100 transition-opacity" />
                  Specialist Portal
              </button>
              {patientPhone && (
                  <button 
                      onClick={() => setView('patient-dashboard')}
                      className="p-3 bg-charcoal text-white rounded-full hover:bg-black transition-all shadow-2xl active:scale-90"
                  >
                      <Lucide.User className="w-4 h-4" />
                  </button>
              )}
          </div>
        </header>
      )}

      {/* SPECIALIST LOGIN MODAL (Glassmorphism) */}
      {showSpecialistModal && (
          <SpecialistLoginModal 
            onLogin={(s) => { 
                setSpecialist(s); 
                setShowSpecialistModal(false); 
                if (s.isAdmin) setView('admin-console');
                else setView('specialist-hub'); 
            }} 
            onClose={() => setShowSpecialistModal(false)} 
          />
      )}

      <main className="pt-0">
        {view === 'landing' && (
          <div className="min-h-screen flex flex-col items-center justify-center px-10 text-center animate-in fade-in duration-1000 relative overflow-hidden">
            <div className="max-w-4xl mx-auto space-y-12 md:space-y-14">
              {/* STUDIO HERO: FLOATING LOGO */}
              <div className="flex justify-center">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-white border border-slate-50 shadow-[0_25px_60px_rgba(0,0,0,0.05)] p-0 squircle overflow-hidden animate-float flex items-center justify-center relative group">
                   <div className="absolute inset-0 bg-gradient-to-tr from-vitality/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                   <img src={APP_LOGO_URL} className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-[2000ms]" />
                </div>
              </div>

              <div className="space-y-6 md:space-y-8">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter italic uppercase leading-[0.95] text-charcoal">
                    Dermatology, <br /> <span className="text-slate-500">simplified by AI.</span>
                </h2>
                <p className="text-[10px] md:text-[11px] font-bold text-slate-600 uppercase tracking-[0.8em] max-w-lg mx-auto italic leading-relaxed">
                  Precision Imaging Hub
                </p>
              </div>

              {/* ACTION CENTER */}
              <div className="flex flex-col items-center gap-6 md:gap-8 pt-4">
                <button 
                  onClick={() => setView('patient-intake')}
                  className="w-full md:max-w-xs py-7 bg-charcoal text-white rounded-[2.5rem] font-black uppercase text-[14px] tracking-[0.5em] shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:bg-black hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-5 group"
                >
                  <Lucide.Scan className="w-5 h-5 text-vitality group-hover:rotate-90 transition-transform duration-700" />
                  Start New Scan
                </button>

                <button 
                  onClick={() => patientPhone ? setView('patient-dashboard') : setView('patient-login')}
                  className="w-full md:max-w-xs py-5 bg-white border border-slate-200 text-slate-700 rounded-full font-black uppercase text-[9px] tracking-[0.4em] hover:text-charcoal hover:border-charcoal hover:shadow-lg transition-all duration-500"
                >
                  Login Previous User
                </button>
              </div>
            </div>
            
            {/* SUBTLE BRANDING FOOTER */}
            <div className="absolute bottom-10 left-0 right-0 opacity-30 pointer-events-none">
                <p className="text-[9px] font-black uppercase tracking-[1em] text-charcoal">Studio White • 2025</p>
            </div>
          </div>
        )}

        {view === 'patient-login' && <PatientLogin onLogin={(p) => { setPatientPhone(p); setView('patient-dashboard'); }} onBack={() => setView('landing')} />}

        {view === 'patient-dashboard' && patientPhone && (
            <PatientDashboard phone={patientPhone} onStartNewCase={() => setView('patient-intake')} onLogout={handlePatientLogout} />
        )}

        {view === 'patient-intake' && (
            <div className="h-screen bg-white">
                <ScanView onBack={() => setView(patientPhone ? 'patient-dashboard' : 'landing')} onScanComplete={() => {}} onConsult={(doc) => alert(`Routing to ${doc.name}...`)} />
            </div>
        )}

        {view === 'specialist-hub' && specialist && (
            <div className="h-screen pt-24 bg-charcoal">
                <SpecialistHub doctor={{...MOCK_DOCTORS[0], name: specialist.name, image: specialist.avatar}} onLogout={handleSpecialistLogout} onCompleteConsultation={() => {}} />
            </div>
        )}

        {view === 'admin-console' && specialist?.isAdmin && (
            <AdminConsole onExit={() => setView('landing')} />
        )}
      </main>
    </div>
  );
};

export default App;
