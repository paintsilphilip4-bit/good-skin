
import React, { useState, useRef, useEffect } from 'react';
/* Added Eye and Sparkles icons, removed Droplets from lucide-react import to fix local declaration conflict */
import { Camera, Upload, X, AlertCircle, CheckCircle2, Loader2, RefreshCw, Star, ArrowRight, FolderCheck, ChevronLeft, ShieldCheck, Zap, Info, Eye, Sparkles } from 'lucide-react';
import { analyzeSkinImage } from '../services/geminiService';
import { AnalysisResult, ScanResult, Doctor } from '../types';
import { MOCK_DOCTORS } from '../constants';

interface ScanViewProps {
  onScanComplete: (result: ScanResult) => void;
  onConsult: (doctor: Doctor, scanResult?: ScanResult) => string | void;
  onBack: () => void;
}

const ScanView: React.FC<ScanViewProps> = ({ onScanComplete, onConsult, onBack }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isDoctorBusy, setIsDoctorBusy] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
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
        setIsSyncing(false);
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
    setIsSyncing(false);
  };

  const triggerConsult = (doctor: Doctor) => {
    if (!image || !result) return;
    setIsSyncing(true);
    
    // Slight delay to simulate data preparation
    setTimeout(() => {
        const scanResult: ScanResult = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            imageUrl: image,
            analysis: result
        };
        onConsult(doctor, scanResult);
    }, 1500);
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
            <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">
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
            <p className="text-slate-600 text-sm leading-relaxed mb-6 italic font-medium">"{result.description}"</p>
            
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

          <div className={`bg-white rounded-[2.5rem] border-2 p-7 shadow-2xl shadow-teal-900/5 relative overflow-hidden group transition-all duration-500 ${isSyncing ? 'border-teal-500 bg-teal-50/50' : 'border-teal-100'}`}>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Stethoscope className="w-20 h-20 text-teal-900" />
            </div>

            <div className="flex justify-between items-start mb-6 relative z-10">
              <h3 className="font-black text-teal-900 uppercase tracking-widest text-[10px]">
                {isSyncing ? 'Synchronizing Clinical File' : 'Human Specialist Review'}
              </h3>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${isDoctorBusy ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isDoctorBusy ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                {isDoctorBusy ? 'HIGH LOAD' : 'READY'}
              </div>
            </div>

            <div className="flex gap-4 items-center mb-8 relative z-10">
              <img src={primaryDoctor.image} alt={primaryDoctor.name} className="w-16 h-16 rounded-[1.5rem] object-cover ring-4 ring-white shadow-xl" />
              <div>
                <h4 className="font-black text-slate-900 text-xl leading-none mb-1">{primaryDoctor.name}</h4>
                <p className="text-xs text-teal-600 font-black uppercase tracking-widest mb-2">{primaryDoctor.specialty}</p>
                <div className="flex items-center gap-1">
                   <Star className="w-3 h-3 text-yellow-500 fill-current" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{primaryDoctor.rating} • Top Rated</span>
                </div>
              </div>
            </div>

            <button 
                onClick={() => triggerConsult(primaryDoctor)}
                disabled={isSyncing}
                className={`w-full py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-xl transform active:scale-95 ${isSyncing ? 'bg-slate-900 text-teal-400' : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/30'}`}
            >
                {isSyncing ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Preparing Secure Link...
                    </>
                ) : (
                    <>
                        Consult specialist <ArrowRight className="w-5 h-5" />
                    </>
                )}
            </button>
            
            <div className="mt-5 flex items-center justify-center gap-2 opacity-30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Clinical HIPAA Compliant</span>
            </div>
          </div>
          
          <div className="pb-24 text-[9px] text-slate-300 text-center px-10 uppercase font-bold tracking-widest leading-relaxed">
            AI analysis provides diagnostic guidance only. Consult a specialist for definitive medical planning.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 pb-24 bg-slate-50">
      <header className="mb-10 flex items-start gap-5">
        <button onClick={onBack} className="mt-1 p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-teal-600 hover:border-teal-200 transition shadow-sm">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-4xl font-black text-slate-900 mb-1 tracking-tighter">Precision Scan</h2>
          <p className="text-slate-400 text-sm font-medium tracking-tight">AI-driven dermatological diagnostics.</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center">
        {image ? (
          <div className="w-full relative rounded-[3rem] overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.15)] mb-10 group animate-in zoom-in-95 duration-500 border-4 border-white">
            <img src={image} alt="Preview" className="w-full h-[28rem] object-cover" />
            {!analyzing && (
                <button 
                onClick={() => setImage(null)}
                className="absolute top-6 right-6 p-3 bg-black/40 backdrop-blur-md text-white rounded-2xl hover:bg-black/60 transition shadow-lg"
                >
                <X className="w-6 h-6" />
                </button>
            )}
            <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex items-center gap-2 text-white/80">
                    <Eye className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Macro Lens Mode</span>
                </div>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-[28rem] border-4 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center bg-white hover:bg-teal-50/30 hover:border-teal-400 transition-all duration-500 cursor-pointer mb-10 group relative"
          >
            <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6 text-teal-600 group-hover:scale-110 group-hover:bg-teal-100 transition-all duration-500 shadow-xl shadow-teal-100/50">
              <Camera className="w-12 h-12" />
            </div>
            <span className="font-black text-slate-400 uppercase tracking-[0.2em] text-xs group-hover:text-teal-600 transition-colors">Start Clinical Scan</span>
            <p className="mt-2 text-[10px] text-slate-300 font-bold uppercase tracking-widest px-12 text-center">Place your skin in clear light for high-fidelity imaging</p>
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
            className="w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-slate-900/30 hover:bg-teal-600 transition transform active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <Sparkles className="w-5 h-5" /> Analyze with AI
          </button>
        )}

        {analyzing && (
          <div className="w-full py-5 bg-teal-600 text-white rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 shadow-2xl">
            <Loader2 className="w-6 h-6 animate-spin" />
            Neural Assessment...
          </div>
        )}
      </div>
    </div>
  );
};

const Stethoscope = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2a.3.3 0 1 0-.2.3Z"/><path d="M10 22v-2"/><path d="M7 15H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-3"/><path d="M21 14V5a2 2 0 0 0-12 2H5a2 2 0 0 0-2 2v9"/><path d="M10 10l4 4"/><path d="M14 10l-4 4"/></svg>
);

const Droplets = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 22 1-1h.01a2.36 2.36 0 0 0 1.99-2.02l.02-.03A2.36 2.36 0 0 0 13 17h-.01L12 18l-1-1h-.01a2.36 2.36 0 0 0-1.99 2.02l-.02.03A2.36 2.36 0 0 0 11 22h.01Z"/><path d="M12 13V2"/><path d="m12 13-4-4"/><path d="m12 13 4-4"/></svg>
);

export default ScanView;
