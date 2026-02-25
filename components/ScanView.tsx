
import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, X, Loader2, ArrowRight, 
  ShieldCheck, Sparkles, Stethoscope, 
  Video, BadgeCheck, ChevronLeft,
  FileText, Activity, ClipboardList, Info, Eye, AlertTriangle, MapPin,
  Maximize2, Layers, Search, Star, MessageCircleHeart, BrainCircuit,
  CheckCircle2, Clock, BellRing
} from 'lucide-react';
import { analyzeSkinImage, compressAndValidateImage } from '../services/geminiService';
import { AnalysisResult, ScanResult, Doctor } from '../types';
import { MOCK_DOCTORS, generateConsultationRoom } from '../constants';

const PROJECT_ID = 'good-skin-2';
const CASES_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/active_cases`;

interface ScanViewProps {
  onScanComplete: (result: ScanResult) => void;
  onConsult: (doctor: Doctor, scanResult?: ScanResult) => Promise<string | void>;
  onBack: () => void;
}

const ANALYSIS_PHASES = [
  "Calibrating Neural Sensors...",
  "Analyzing Skin Layers...",
  "Running ABCDE Algorithm...",
  "Generating Patient Summary...",
  "Finalizing Board Report..."
];

const ScanView: React.FC<ScanViewProps> = ({ onScanComplete, onConsult, onBack }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [caseStatus, setCaseStatus] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: number;
    if (analyzing) {
      interval = window.setInterval(() => {
        setAnalysisStep(prev => (prev < ANALYSIS_PHASES.length - 1 ? prev + 1 : prev));
      }, 1800);
    } else {
      setAnalysisStep(0);
    }
    return () => clearInterval(interval);
  }, [analyzing]);

  useEffect(() => {
    if (!activeCaseId) return;
    let isMounted = true;
    const pollProtocol = async () => {
      try {
        const res = await fetch(`${CASES_URL}/${activeCaseId}`);
        const data = await res.json();
        if (!isMounted) return;
        const status = data.fields?.status?.stringValue;
        setCaseStatus(status);
      } catch (e) { console.error("[WATCHER] Polling Error:", e); }
    };
    const interval = setInterval(pollProtocol, 3000); 
    return () => { isMounted = false; clearInterval(interval); };
  }, [activeCaseId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { 
        setImage(reader.result as string); 
        setResult(null); 
        setError(null);
        setActiveCaseId(null); 
        setCaseStatus(null); 
        setSelectedDoctorId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    setError(null);
    try {
      const processed = await compressAndValidateImage(image);
      if (!processed.isValid) { 
        setError(processed.reason || "Asset intake failed."); 
        setAnalyzing(false); 
        return; 
      }
      const analysis = await analyzeSkinImage(processed.data);
      setResult(analysis);
      onScanComplete({ id: Date.now().toString(), date: new Date().toISOString(), imageUrl: image, analysis: analysis });
    } catch (err: any) {
      setError(err.message || "Diagnostic engine timed out.");
    } finally { setAnalyzing(false); }
  };

  const triggerConsult = async (doctor: Doctor) => {
    if (!image || !result) return;
    setIsSyncing(true);
    try {
        const scanResult: ScanResult = { id: Date.now().toString(), date: new Date().toISOString(), imageUrl: image, analysis: result };
        const id = await onConsult(doctor, scanResult);
        if (id) setActiveCaseId(id);
    } catch (e) { setError("Consultation bridge failed."); }
    finally { setIsSyncing(false); }
  };

  if (caseStatus === 'in-consultation') {
    return (
      <div className="h-full bg-black flex flex-col animate-in fade-in duration-1000">
        <header className="px-10 py-8 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-6">
             <div className="w-12 h-12 bg-vitality rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_#10B981]"><Video className="w-6 h-6" /></div>
             <div>
                <h2 className="text-xl font-bold uppercase italic text-white tracking-tighter">Live Session</h2>
                <p className="text-[9px] font-bold text-vitality uppercase tracking-widest">AUTHORIZED CLINICAL BRIDGE</p>
             </div>
          </div>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-rose-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest">End Session</button>
        </header>
        <div className="flex-1 bg-zinc-950">
          <iframe src={generateConsultationRoom(activeCaseId || '')} allow="camera; microphone; fullscreen; display-capture" className="w-full h-full border-none" title="Video Consult" />
        </div>
      </div>
    );
  }

  // UPDATED: Post-Submission Success Screen (Wait Room)
  if (activeCaseId) {
    const selectedDoctor = MOCK_DOCTORS.find(d => d.id === selectedDoctorId);

    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-white text-center animate-in fade-in duration-500">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 relative overflow-hidden">
             {/* Decorative Background */}
             <div className="absolute top-0 left-0 w-full h-2 bg-vitality" />
             <div className="absolute -right-10 -top-10 opacity-5">
                 <ShieldCheck className="w-48 h-48" />
             </div>

             <div className="w-20 h-20 bg-vitality/10 rounded-3xl flex items-center justify-center mb-8 mx-auto text-vitality shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
             </div>

             <h2 className="text-3xl font-black text-charcoal mb-4 tracking-tighter uppercase italic">Request Confirmed</h2>
             
             <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Target Specialist</p>
                <div className="flex items-center gap-4">
                    <img src={selectedDoctor?.image} className="w-12 h-12 rounded-xl object-cover" alt="Doctor" />
                    <div>
                        <p className="text-sm font-black text-charcoal uppercase italic">{selectedDoctor?.name || 'Specialist'}</p>
                        <p className="text-[10px] text-slate-500 font-medium">Notification Sent</p>
                    </div>
                </div>
             </div>

             <div className="flex items-start gap-4 mb-10 text-left bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                <BellRing className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-xs font-black text-blue-900 uppercase tracking-wide mb-1">Estimated Wait: ~30 Mins</h4>
                    <p className="text-[11px] text-blue-700/80 leading-relaxed">
                        Dr. {selectedDoctor?.name?.split(' ').pop()} is currently in clinic. You will receive a notification on your dashboard when they are ready to join the call.
                    </p>
                </div>
             </div>

             <button 
                onClick={onBack} 
                className="w-full py-5 bg-charcoal text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
             >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
             </button>
             
             <p className="mt-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest">It is safe to close this screen.</p>
        </div>
      </div>
    );
  }

  if (result) {
    const urgencyColors = {
        'Low': 'bg-emerald-50 text-emerald-600',
        'Medium': 'bg-amber-50 text-amber-600',
        'High': 'bg-rose-50 text-rose-600'
    };

    const selectedDoctor = MOCK_DOCTORS.find(d => d.id === selectedDoctorId);

    return (
      <div className="flex flex-col h-full bg-warmgrey animate-in slide-in-from-bottom-10 duration-500 overflow-y-auto pt-24 pb-32">
        <div className="absolute top-28 left-6 z-50">
          <button onClick={onBack} className="p-3 bg-white/70 backdrop-blur-md rounded-full text-charcoal shadow-sm hover:scale-[1.1] transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
        
        <div className="relative h-[440px] w-full bg-charcoal shrink-0">
          <img src={image || ''} alt="Analyzed" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/30 to-transparent"></div>
          <div className="absolute bottom-10 left-10 right-10">
            <div className="flex items-center gap-3 mb-4">
               <Layers className="w-6 h-6 text-vitality" />
               <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Analysis Complete</h2>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-vitality" style={{ width: `${result.confidence_score}%` }}></div>
                </div>
                <span className="text-[10px] text-vitality font-black uppercase tracking-[0.4em]">{result.confidence_score}% Accuracy Score</span>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-10 max-w-4xl mx-auto w-full">
          <div className="grid grid-cols-1 gap-8">
            
            {/* DIAGNOSIS HEADER */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-vitality/5 flex items-center justify-center text-vitality">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Primary Diagnosis</h3>
              </div>
              <div className="py-6 border-l-4 border-vitality pl-10">
                <div className="text-5xl font-black text-charcoal uppercase italic tracking-tighter leading-none mb-6">
                  {result.primary_diagnosis}
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${urgencyColors[result.urgency] || 'bg-slate-50'}`}>
                    Priority: {result.urgency}
                  </span>
                </div>
              </div>
            </div>

            {/* PATIENT SUMMARY LAYER */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                  <MessageCircleHeart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-1">Patient Summary</h3>
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">Understanding Your Skin</p>
                </div>
              </div>
              
              <div className="space-y-8">
                 <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-3xl">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">What It Is</h4>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                        {result.patient_explanation}
                    </p>
                 </div>

                 <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Why It Happens</h4>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                        {result.patient_causes}
                    </p>
                 </div>

                 <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Immediate Advice</h4>
                    <div className="grid gap-3">
                        {result.patient_advice && result.patient_advice.length > 0 ? (
                            result.patient_advice.map((tip, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0">
                                        {idx + 1}
                                    </div>
                                    <p className="text-xs font-bold text-slate-700 uppercase">{tip}</p>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 bg-white border border-slate-100 rounded-2xl text-xs text-slate-400">Consult specialist for personalized advice.</div>
                        )}
                    </div>
                 </div>
              </div>
            </div>

            {/* TECHNICAL DETAILS TOGGLE (SUBTLE) */}
            <div className="px-6 py-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-3 opacity-50">
                    <BrainCircuit className="w-4 h-4 text-slate-400" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Technical data (Morphology: {result.morphology.substring(0, 30)}...) saved for specialist review.
                    </p>
                </div>
            </div>
            
            {/* SPECIALIST CHOICE SECTION */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Authorized Specialist Hub</h3>
                </div>
                
                <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Choose an online specialist to establish signal:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {MOCK_DOCTORS.map((doc) => (
                            <button 
                                key={doc.id}
                                onClick={() => setSelectedDoctorId(doc.id)}
                                className={`flex items-center gap-4 p-5 rounded-[2rem] border-2 transition-all text-left group ${selectedDoctorId === doc.id ? 'border-vitality bg-vitality/5 ring-4 ring-vitality/5' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                            >
                                <img src={doc.image} className="w-16 h-16 rounded-2xl object-cover shadow-sm" alt={doc.name} />
                                <div className="flex-1">
                                    <h4 className={`text-sm font-black uppercase italic tracking-tight ${selectedDoctorId === doc.id ? 'text-vitality' : 'text-charcoal'}`}>{doc.name}</h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{doc.specialty}</p>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                        <span className="text-[9px] font-black text-slate-400">{doc.rating}</span>
                                    </div>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedDoctorId === doc.id ? 'border-vitality bg-vitality text-white' : 'border-slate-200 bg-white'}`}>
                                    {selectedDoctorId === doc.id && <BadgeCheck className="w-4 h-4" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
          </div>

          <div className="bg-charcoal rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden group">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
              <div className="flex-1">
                <h4 className="font-bold text-white text-3xl tracking-tight leading-none uppercase italic mb-3">Start Your Consultation</h4>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Start a private video call with your selected doctor now</p>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                 {selectedDoctor && (
                     <div className="text-center md:text-right">
                         <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Session Fee</p>
                         <p className="text-3xl font-black text-white tracking-tighter italic">GHS {selectedDoctor.price}</p>
                     </div>
                 )}
                 <button 
                    onClick={() => {
                      if (selectedDoctor) triggerConsult(selectedDoctor);
                    }} 
                    disabled={isSyncing || !selectedDoctorId} 
                    className={`px-14 py-8 rounded-full font-black text-[11px] uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 ${isSyncing || !selectedDoctorId ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-vitality text-white shadow-vitality/30 hover:bg-emerald-400'}`}
                  >
                      {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Connect Now <ArrowRight className="w-5 h-5" /></>}
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-8 bg-warmgrey pt-32 animate-in fade-in">
      <header className="mb-14 flex items-start gap-8">
        <button onClick={onBack} className="p-4 bg-white border border-slate-100 squircle text-slate-400 hover:text-charcoal transition-all shadow-sm"><ChevronLeft className="w-7 h-7" /></button>
        <div>
          <h2 className="text-5xl font-bold text-charcoal mb-2 tracking-tighter uppercase italic leading-none">Skin Health Check</h2>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.4em]">Get instant insights & connect with a doctor</p>
        </div>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center">
        {image ? (
          <div className="w-full max-w-lg relative rounded-[4rem] overflow-hidden shadow-2xl mb-12 border-4 border-white">
            <img src={image} className="w-full h-[32rem] object-cover" />
            {!analyzing && <button onClick={() => { setImage(null); setError(null); }} className="absolute top-10 right-10 p-5 bg-charcoal/40 backdrop-blur-md text-white rounded-3xl"><X className="w-8 h-8" /></button>}
            {analyzing && (
              <div className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm flex flex-col items-center justify-center p-10 text-center space-y-8">
                 <div className="scanning-line" />
                 <div className="relative">
                    <Loader2 className="w-20 h-20 text-vitality animate-spin" />
                    <Activity className="absolute inset-0 m-auto w-8 h-8 text-white animate-pulse" />
                 </div>
                 <div className="space-y-4 w-full max-w-[280px]">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-vitality transition-all duration-300" 
                         style={{ width: `${((analysisStep + 1) / ANALYSIS_PHASES.length) * 100}%` }}
                       />
                    </div>
                    <p className="text-white font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">
                      {ANALYSIS_PHASES[analysisStep]}
                    </p>
                 </div>
              </div>
            )}
          </div>
        ) : (
          <div onClick={() => fileInputRef.current?.click()} className="w-full max-w-lg h-[32rem] border-4 border-dashed border-slate-100 rounded-[4rem] flex flex-col items-center justify-center bg-white hover:border-vitality/30 transition-all cursor-pointer mb-12 group shadow-sm hover:shadow-xl">
            <div className="w-36 h-36 bg-slate-50 squircle flex items-center justify-center mb-10 text-charcoal group-hover:text-vitality transition-all shadow-xl border border-slate-100 group-hover:scale-105 duration-500"><Camera className="w-16 h-16" /></div>
            <span className="font-black text-slate-300 uppercase tracking-[0.6em] text-xs group-hover:text-charcoal transition-colors">Tap to Upload Photo</span>
          </div>
        )}
        
        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileSelect} />
        
        {error && (
          <div className="w-full max-w-lg mb-8 p-8 bg-rose-50 border border-rose-100 rounded-[2.5rem] flex items-start gap-5 animate-in slide-in-from-top-4 shadow-sm">
            <AlertTriangle className="w-8 h-8 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-rose-900 font-black text-[10px] uppercase tracking-widest mb-2">Diagnostic Alert</p>
              <p className="text-rose-700/80 text-[11px] font-bold leading-relaxed uppercase tracking-tight">{error}</p>
            </div>
          </div>
        )}

        {image && !analyzing && <button onClick={handleAnalyze} className="w-full max-w-lg py-10 bg-charcoal text-white rounded-full font-black uppercase tracking-[0.6em] text-[13px] shadow-2xl flex items-center justify-center gap-4">Analyze My Skin</button>}
      </div>
    </div>
  );
};

export default ScanView;
