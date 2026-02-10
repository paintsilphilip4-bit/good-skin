
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, AlertCircle, CheckCircle2, Loader2, RefreshCw, MessageCircle, Clock, Star, ArrowRight, FolderCheck, ChevronLeft, ShieldCheck, Zap, Droplets, Info } from 'lucide-react';
import { analyzeSkinImage } from '../services/geminiService';
import { AnalysisResult, ScanResult, Doctor } from '../types';
import { MOCK_DOCTORS } from '../constants';

interface ScanViewProps {
  onScanComplete: (result: ScanResult) => void;
  onConsult: (doctor: Doctor) => string | void;
  onBack: () => void;
}

const ScanView: React.FC<ScanViewProps> = ({ onScanComplete, onConsult, onBack }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isDoctorBusy, setIsDoctorBusy] = useState(false);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (result) {
      setIsDoctorBusy(Math.random() > 0.6); 
    }
  }, [result]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null); 
        setConsultationId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    try {
      const analysis = await analyzeSkinImage(image);
      setResult(analysis);
      onScanComplete({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        imageUrl: image,
        analysis: analysis
      });
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const resetScan = () => {
    setImage(null);
    setResult(null);
    setConsultationId(null);
  };

  const triggerConsult = (doctor: Doctor) => {
    const id = onConsult(doctor);
    if (typeof id === 'string') {
      setConsultationId(id);
    }
  };

  if (result) {
    const primaryDoctor = MOCK_DOCTORS[0]; 
    const urgencyColors = {
        Low: 'bg-emerald-100 text-emerald-700',
        Medium: 'bg-amber-100 text-amber-700',
        High: 'bg-rose-100 text-rose-700'
    };

    return (
      <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-bottom-10 duration-500 overflow-y-auto no-scrollbar relative">
        <div className="absolute top-4 left-4 z-50">
          <button onClick={onBack} className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="relative h-72 w-full bg-slate-900 flex-shrink-0">
          <img src={image || ''} alt="Analyzed" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
          <button 
            onClick={resetScan}
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center justify-between mb-2">
                <div className="px-3 py-1 bg-teal-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest border border-white/20">
                {result.condition}
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 ${urgencyColors[result.urgency || 'Low']}`}>
                Urgency: {result.urgency}
                </div>
            </div>
            <h2 className="text-4xl font-black text-white mb-2">
              Score: <span className="text-teal-400">{result.severityScore}/10</span>
            </h2>
            <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-400" style={{ width: `${result.confidence}%` }}></div>
                </div>
                <span className="text-[10px] text-teal-300 font-bold uppercase whitespace-nowrap">{result.confidence}% Confidence</span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-slate-900 font-black flex items-center gap-2 mb-3 uppercase text-xs tracking-widest">
              <ShieldCheck className="w-4 h-4 text-teal-500" /> Professional Insight
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">"{result.description}"</p>
            
            <div className="grid grid-cols-1 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" /> Potential Causes
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {result.potentialCauses?.map((cause, i) => (
                            <span key={i} className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                                {cause}
                            </span>
                        ))}
                    </div>
                </div>
                
                <div className="bg-teal-50/30 p-4 rounded-2xl border border-teal-100">
                    <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Droplets className="w-3 h-3" /> Recommended Actives
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {result.recommendedIngredients?.map((ing, i) => (
                            <span key={i} className="text-xs font-black text-teal-800 bg-white border border-teal-200 px-2.5 py-1 rounded-lg shadow-sm">
                                {ing}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest px-1 flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-500" /> Treatment Protocol
            </h3>
            {result.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 text-sm font-medium">{tip}</span>
              </div>
            ))}
          </div>

          <div className={`bg-white rounded-3xl border-2 p-6 shadow-xl shadow-teal-900/5 relative overflow-hidden group transition-all duration-500 ${consultationId ? 'border-teal-500 bg-teal-50/50' : 'border-teal-100'}`}>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Stethoscope className="w-20 h-20 text-teal-900" />
            </div>

            <div className="flex justify-between items-start mb-6 relative z-10">
              <h3 className="font-black text-teal-900 uppercase tracking-widest text-[10px]">
                {consultationId ? 'Secure Session Active' : 'Human Verification'}
              </h3>
              {!consultationId ? (
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${isDoctorBusy ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isDoctorBusy ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                  {isDoctorBusy ? 'BUSY' : 'READY'}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-teal-600 text-white shadow-lg shadow-teal-600/20">
                  REF: {consultationId}
                </div>
              )}
            </div>

            <div className="flex gap-4 items-center mb-6 relative z-10">
              <div className="relative">
                <img src={primaryDoctor.image} alt={primaryDoctor.name} className="w-16 h-16 rounded-3xl object-cover ring-4 ring-slate-50" />
                {consultationId && (
                   <div className="absolute -bottom-1 -right-1 bg-teal-600 p-1.5 rounded-xl border-2 border-white">
                      <FolderCheck className="w-3 h-3 text-white" />
                   </div>
                )}
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-lg leading-tight">{primaryDoctor.name}</h4>
                <p className="text-xs text-teal-600 font-black uppercase tracking-widest mt-0.5">{primaryDoctor.specialty}</p>
                <div className="flex items-center gap-1 mt-1.5">
                   <Star className="w-3 h-3 text-yellow-500 fill-current" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{primaryDoctor.rating} • Verified Specialist</span>
                </div>
              </div>
            </div>

            {consultationId ? (
              <div className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-teal-600 text-white shadow-xl shadow-teal-600/30 flex items-center justify-center gap-2 animate-in zoom-in-95">
                Folder Synced <ShieldCheck className="w-4 h-4" />
              </div>
            ) : (
              <button 
                onClick={() => triggerConsult(primaryDoctor)}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-xl ${isDoctorBusy ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/30'}`}
              >
                {isDoctorBusy ? (
                  <>Waitlist Position #3 <Clock className="w-4 h-4" /></>
                ) : (
                  <>Consult Specialist <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            )}
            
            <p className="text-[10px] text-slate-400 text-center mt-4 font-bold uppercase tracking-widest">
              {consultationId ? 'Cloud Sync in Progress' : 'Verify AI results with a specialist'}
            </p>
          </div>

          <div className="pt-6 flex flex-col items-center">
            <button 
              onClick={resetScan}
              className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:text-teal-600 transition-colors py-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Recalibrate Scan
            </button>
          </div>
          
          <div className="pb-12 text-[9px] text-slate-300 text-center px-10 uppercase font-bold tracking-widest leading-relaxed">
            AI analysis provides diagnostic guidance only. High urgency indicators require immediate physical consultation.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 pb-24">
      <header className="mb-10 flex items-start gap-5">
        <button onClick={onBack} className="mt-1 p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-teal-600 hover:border-teal-200 transition shadow-sm">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Precision Scan</h2>
          <p className="text-slate-400 text-sm font-medium">Ultra-high resolution dermatological imaging.</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center">
        {image ? (
          <div className="w-full relative rounded-[2.5rem] overflow-hidden shadow-2xl mb-10 group animate-in zoom-in-95 duration-500 border-4 border-white">
            <img src={image} alt="Preview" className="w-full h-96 object-cover" />
            {!analyzing && (
                <button 
                onClick={() => setImage(null)}
                className="absolute top-4 right-4 p-3 bg-black/40 backdrop-blur-md text-white rounded-2xl hover:bg-black/60 transition shadow-lg"
                >
                <X className="w-6 h-6" />
                </button>
            )}
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-96 border-4 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center bg-white hover:bg-slate-50 hover:border-teal-400 transition-all duration-300 cursor-pointer mb-10 group relative"
          >
            <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6 text-teal-600 group-hover:scale-110 group-hover:bg-teal-100 transition-all duration-500">
              <Camera className="w-12 h-12" />
            </div>
            <span className="font-black text-slate-300 uppercase tracking-widest text-xs group-hover:text-teal-600 transition-colors">Capture Skin Image</span>
            <div className="absolute bottom-6 flex items-center gap-2 opacity-30 group-hover:opacity-60 transition-opacity">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase">Encrypted Upload</span>
            </div>
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileSelect} 
        />

        {image && !analyzing && (
          <button 
            onClick={handleAnalyze}
            className="w-full py-5 bg-teal-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-teal-600/30 hover:bg-teal-700 transition transform active:scale-[0.98] flex items-center justify-center gap-3"
          >
            Initiate AI Analysis
          </button>
        )}

        {analyzing && (
          <div className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 shadow-2xl">
            <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
            Deep Learning Sync...
          </div>
        )}
      </div>
    </div>
  );
};

const Stethoscope = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2a.3.3 0 1 0-.2.3Z"/><path d="M10 22v-2"/><path d="M7 15H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-3"/><path d="M21 14V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9"/><path d="M10 10l4 4"/><path d="M14 10l-4 4"/></svg>
);

export default ScanView;
