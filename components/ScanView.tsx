
import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Upload, X, AlertCircle, CheckCircle2, Loader2, 
  RefreshCw, Star, ArrowRight, FolderCheck, ChevronLeft, 
  ShieldCheck, Zap, Info, Eye, Sparkles, Droplets, Stethoscope,
  Timer
} from 'lucide-react';
import { analyzeSkinImage, compressAndValidateImage } from '../services/geminiService';
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
  const [triageError, setTriageError] = useState<string | null>(null);
  const [quotaCountdown, setQuotaCountdown] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (result) {
      setIsDoctorBusy(Math.random() > 0.6); 
    }
  }, [result]);

  // Quota Countdown Timer
  useEffect(() => {
    if (quotaCountdown > 0) {
      const timer = setInterval(() => {
        setQuotaCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quotaCountdown]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null); 
        setTriageError(null);
        setIsSyncing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    setTriageError(null);

    try {
      // 1. Performance Optimization & Local Triage
      const processed = await compressAndValidateImage(image);
      
      if (!processed.isValid) {
        setTriageError(processed.reason || "Local triage failed.");
        setAnalyzing(false);
        return;
      }

      // 2. AI Analysis Call
      const analysis = await analyzeSkinImage(processed.data);
      setResult(analysis);
      onScanComplete({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        imageUrl: image,
        analysis: analysis
      });
    } catch (error: any) {
      console.error(error);
      if (error.message === 'QUOTA_EXCEEDED') {
        setQuotaCountdown(60);
      } else {
        setTriageError("An unexpected error occurred during analysis.");
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const triggerConsult = (doctor: Doctor) => {
    if (!image || !result) return;
    setIsSyncing(true);
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

  if (quotaCountdown > 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-white animate-in fade-in duration-500 text-center">
        <div className="w-24 h-24 bg-slate-50 border border-slate-100 squircle flex items-center justify-center mb-10 text-charcoal shadow-xl">
           <Timer className="w-10 h-10 text-vitality animate-pulse" />
        </div>
        <h2 className="text-4xl font-black text-charcoal mb-4 tracking-tighter uppercase italic">Studio Calibrating</h2>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed">
          GoodSkin AI is currently calibrating. Please try your scan again in {quotaCountdown} seconds.
        </p>
        <div className="mt-12 text-[10px] font-black text-slate-200 uppercase tracking-[1em]">Calibrating Neural Hub...</div>
      </div>
    );
  }

  if (result) {
    const primaryDoctor = MOCK_DOCTORS[0]; 
    const urgencyColors = {
        Low: 'bg-emerald-50 text-emerald-600',
        Medium: 'bg-amber-50 text-amber-600',
        High: 'bg-rose-50 text-rose-600'
    };

    return (
      <div className="flex flex-col h-full bg-warmgrey animate-in slide-in-from-bottom-10 duration-500 overflow-y-auto no-scrollbar relative pt-24">
        <div className="absolute top-28 left-6 z-50">
          <button onClick={onBack} className="p-3 bg-white/70 backdrop-blur-md rounded-full text-charcoal shadow-sm hover:scale-[1.1] transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="relative h-[400px] w-full bg-charcoal flex-shrink-0">
          <img src={image || ''} alt="Analyzed" className="w-full h-full object-cover opacity-60 grayscale-[50%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent"></div>
          
          <div className="absolute bottom-10 left-10 right-10">
            <div className="flex items-center justify-between mb-4">
                <div className="px-5 py-1.5 bg-vitality text-white text-[10px] font-bold rounded-full uppercase tracking-[0.3em] border border-white/10 shadow-[0_0_20px_#10B981]">
                {result.condition}
                </div>
                <div className={`px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] border border-white/5 ${urgencyColors[result.urgency || 'Low']}`}>
                Urgency: {result.urgency}
                </div>
            </div>
            <h2 className="text-5xl font-bold text-white mb-4 tracking-tighter">
              Score: <span className="text-vitality">{result.severityScore}/10</span>
            </h2>
            <div className="flex items-center gap-4">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-vitality shadow-[0_0_15px_#10B981]" style={{ width: `${result.confidence}%` }}></div>
                </div>
                <span className="text-[10px] text-vitality font-bold uppercase whitespace-nowrap tracking-widest">{result.confidence}% Confidence</span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-10 space-y-10">
          <div className="glass-card rounded-[2.5rem] p-10 shadow-xl">
            <h3 className="text-charcoal font-bold flex items-center gap-3 mb-6 uppercase text-[10px] tracking-[0.4em]">
              <ShieldCheck className="w-4 h-4 text-vitality" /> AI Clinical Assessment
            </h3>
            <p className="text-slate-600 text-base leading-relaxed mb-10 italic font-medium uppercase">"{result.description}"</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-amber-500" /> Possible Triggers
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        {result.potentialCauses?.map((cause, i) => (
                            <span key={i} className="text-[10px] font-bold text-charcoal bg-white border border-slate-200 px-3 py-1.5 rounded-xl uppercase tracking-tight">
                                {cause}
                            </span>
                        ))}
                    </div>
                </div>
                
                <div className="bg-vitality/5 p-6 rounded-3xl border border-vitality/10">
                    <h4 className="text-[10px] font-bold text-vitality uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Droplets className="w-3.5 h-3.5" /> Recommended Ingredients
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        {result.recommendedIngredients?.map((ing, i) => (
                            <span key={i} className="text-[10px] font-bold text-emerald-800 bg-white border border-vitality/20 px-3 py-1.5 rounded-xl uppercase tracking-tight shadow-sm">
                                {ing}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
          </div>

          <div className="glass-card rounded-[3rem] border-2 border-vitality/10 p-10 shadow-2xl relative overflow-hidden group hover:scale-[1.01] transition-all duration-500">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
               <Stethoscope className="w-32 h-32 text-charcoal" />
            </div>

            <div className="flex justify-between items-start mb-8 relative z-10">
              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                {isSyncing ? 'Linking Registry' : 'Human Specialist Uplink'}
              </h3>
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-bold tracking-widest ${isDoctorBusy ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                <div className={`w-2 h-2 rounded-full ${isDoctorBusy ? 'bg-amber-500' : 'bg-vitality animate-pulse shadow-[0_0_8px_#10B981]'}`} />
                {isDoctorBusy ? 'PEAK LOAD' : 'LIVE'}
              </div>
            </div>

            <div className="flex gap-6 items-center mb-10 relative z-10">
              <img src={primaryDoctor.image} alt={primaryDoctor.name} className="w-20 h-20 squircle object-cover ring-4 ring-white shadow-2xl" />
              <div>
                <h4 className="font-bold text-charcoal text-2xl tracking-tight leading-none mb-1.5 uppercase italic">{primaryDoctor.name}</h4>
                <p className="text-[10px] text-vitality font-bold uppercase tracking-[0.3em] mb-3">{primaryDoctor.specialty}</p>
                <div className="flex items-center gap-2">
                   <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{primaryDoctor.rating} Verified Specialist</span>
                </div>
              </div>
            </div>

            <button 
                onClick={() => triggerConsult(primaryDoctor)}
                disabled={isSyncing}
                className={`w-full py-7 rounded-full font-bold text-xs uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-xl hover:scale-[1.02] active:scale-[0.98] ${isSyncing ? 'bg-charcoal text-vitality' : 'bg-vitality text-white shadow-vitality/30'}`}
            >
                {isSyncing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Synchronizing...
                    </>
                ) : (
                    <>
                        Authorize Consultation <ArrowRight className="w-5 h-5" />
                    </>
                )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-8 pb-32 bg-warmgrey pt-32 animate-in fade-in duration-700">
      <header className="mb-14 flex items-start gap-8">
        <button onClick={onBack} className="p-4 bg-white border border-slate-100 squircle text-slate-400 hover:text-charcoal transition-all shadow-sm">
          <ChevronLeft className="w-7 h-7" />
        </button>
        <div>
          <h2 className="text-5xl font-bold text-charcoal mb-2 tracking-tighter uppercase italic">Precision Scan</h2>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.4em]">AI-Driven Imaging Hub</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center">
        {image ? (
          <div className="w-full max-w-lg relative rounded-[3rem] overflow-hidden shadow-2xl mb-12 border-4 border-white animate-in zoom-in-95">
            <img src={image} alt="Preview" className="w-full h-[32rem] object-cover" />
            {!analyzing && (
                <button 
                onClick={() => { setImage(null); setTriageError(null); }}
                className="absolute top-8 right-8 p-4 bg-charcoal/40 backdrop-blur-md text-white rounded-2xl hover:bg-charcoal/60 transition shadow-lg"
                >
                <X className="w-7 h-7" />
                </button>
            )}
            <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-charcoal/60 to-transparent">
                <div className="flex items-center gap-3 text-white/90">
                    <Eye className="w-5 h-5 text-vitality" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Macro Diagnostic Active</span>
                </div>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-lg h-[32rem] border-4 border-dashed border-slate-100 rounded-[4rem] flex flex-col items-center justify-center bg-white hover:border-vitality/30 transition-all duration-700 cursor-pointer mb-12 group relative shadow-sm"
          >
            <div className="w-32 h-32 bg-slate-50 squircle flex items-center justify-center mb-10 text-charcoal group-hover:scale-[1.1] transition-all duration-700 shadow-xl border border-slate-100 group-hover:bg-vitality/5 group-hover:text-vitality">
              <Camera className="w-16 h-16" />
            </div>
            <span className="font-bold text-slate-400 uppercase tracking-[0.5em] text-sm group-hover:text-charcoal transition-colors">Engage Scanner</span>
            <p className="mt-4 text-[10px] text-slate-300 font-bold uppercase tracking-widest px-16 text-center leading-relaxed">Ensure Skin Is In Direct Light For Clinical Accuracy</p>
          </div>
        )}

        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileSelect} />

        {triageError && (
          <div className="w-full max-w-lg p-6 bg-rose-50 border border-rose-100 rounded-3xl mb-8 flex items-center gap-4 animate-in slide-in-from-top-2">
            <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" />
            <p className="text-[11px] font-bold text-rose-600 uppercase tracking-widest leading-relaxed">
              {triageError}
            </p>
          </div>
        )}

        {image && !analyzing && (
          <button 
            onClick={handleAnalyze}
            className="w-full max-w-lg py-8 bg-charcoal text-white rounded-full font-bold uppercase tracking-[0.6em] text-[13px] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4"
          >
            <Sparkles className="w-6 h-6 text-vitality" /> Authorize Neural Assessment
          </button>
        )}

        {analyzing && (
          <div className="w-full max-w-lg py-8 bg-vitality text-white rounded-full font-bold uppercase tracking-[0.6em] text-[13px] flex items-center justify-center gap-6 shadow-2xl">
            <Loader2 className="w-7 h-7 animate-spin" />
            Neural Mapping...
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanView;
