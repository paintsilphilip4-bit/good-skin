
import React, { useState, useEffect } from 'react';
import { 
  Plus, History, Pill, ShieldCheck, LogOut, 
  ChevronRight, Calendar, Stethoscope, Loader2,
  AlertCircle, Activity, ArrowUpRight, Lock, 
  Sparkles, ClipboardList, Video, Clock, Check,
  BellRing, Wifi
} from 'lucide-react';
import { generateConsultationRoom } from '../constants';

const PROJECT_ID = 'good-skin-2';
const CASES_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/active_cases`;

interface PatientDashboardProps {
  patientPhone: string;
  patientName: string;
  onStartNewScan: () => void;
  onLogout: () => void;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ patientPhone, patientName, onStartNewScan, onLogout }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningCaseId, setJoiningCaseId] = useState<string | null>(null);

  const fetchHealthRecord = async () => {
    try {
      // Don't set global loading true on poll refresh to avoid flicker
      // only set it on first load if history is empty
      if (history.length === 0 && activeRequests.length === 0) setIsLoading(true);
      
      const response = await fetch(CASES_URL);
      const data = await response.json();

      if (data.documents) {
        // Filter for this patient
        const myCases = data.documents.filter((doc: any) => {
             return doc.fields.patientPhone?.stringValue === patientPhone;
        });

        // Split into History (Completed) and Active (Pending/In-Consultation)
        const completed = myCases
          .filter((doc: any) => doc.fields.status?.stringValue === 'completed')
          .map((doc: any) => {
            const f = doc.fields;
            return {
              id: doc.name.split('/').pop(),
              date: f.completedAt?.timestampValue || f.createdAt?.timestampValue || new Date().toISOString(),
              diagnosis: f.finalDiagnosis?.stringValue || 'Clinical Assessment',
              notes: f.clerkingNotes?.stringValue || '',
              prescriptions: f.prescriptionText?.stringValue || '',
              doctor: f.assignedToName?.stringValue || 'Specialist'
            };
          })
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const active = myCases
          .filter((doc: any) => doc.fields.status?.stringValue === 'pending' || doc.fields.status?.stringValue === 'in-consultation')
          .map((doc: any) => {
              const f = doc.fields;
              const aiAnalysis = f.aiAnalysis?.stringValue ? JSON.parse(f.aiAnalysis.stringValue) : {};
              return {
                  id: doc.name.split('/').pop(),
                  status: f.status?.stringValue,
                  createdAt: f.createdAt?.timestampValue,
                  doctorName: f.assignedToName?.stringValue || 'Specialist', // Might not be set yet if pending
                  diagnosis: aiAnalysis.primary_diagnosis || "Analysis Pending"
              };
          })
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setHistory(completed);
        setActiveRequests(active);

        // Extract unique active prescriptions from recent protocols
        const allPrescriptions = completed
          .map((r: any) => r.prescriptions)
          .filter((p: string) => p && p !== 'No clinical prescription issued.')
          .flatMap((p: string) => p.split('\n'));
        
        setPrescriptions([...new Set(allPrescriptions)] as string[]);
      }
    } catch (e) {
      console.error("Health Record Sync Error:", e);
      // Only show error if we have no data at all
      if (history.length === 0) setError("Failed to synchronize your clinical folder.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthRecord();
    const interval = setInterval(fetchHealthRecord, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [patientPhone]);

  // Identify if a doctor is waiting
  const readyCase = activeRequests.find(req => req.status === 'in-consultation');

  if (joiningCaseId) {
      return (
        <div className="h-screen bg-black flex flex-col animate-in fade-in duration-1000">
            <header className="px-10 py-8 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-vitality rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_#10B981]"><Video className="w-6 h-6" /></div>
                <div>
                    <h2 className="text-xl font-bold uppercase italic text-white tracking-tighter">Live Session</h2>
                    <p className="text-[9px] font-bold text-vitality uppercase tracking-widest">Secure Clinical Bridge Active</p>
                </div>
            </div>
            <button onClick={() => setJoiningCaseId(null)} className="px-6 py-2 bg-rose-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest">Leave Call</button>
            </header>
            <div className="flex-1 bg-zinc-950">
                <iframe src={generateConsultationRoom(joiningCaseId)} allow="camera; microphone; fullscreen; display-capture" className="w-full h-full border-none" title="Video Consult" />
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-warmgrey animate-in fade-in duration-700 pb-32 relative">
      
      {/* FULL SCREEN NOTIFICATION OVERLAY FOR READY CASES */}
      {readyCase && !joiningCaseId && (
        <div className="fixed inset-0 z-[9000] bg-charcoal/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-white rounded-[3rem] p-12 max-w-lg w-full text-center shadow-[0_0_80px_rgba(16,185,129,0.3)] relative overflow-hidden animate-in zoom-in-95 duration-500">
             {/* Pulsing indicator */}
             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-vitality to-transparent animate-pulse" />
             
             <div className="relative mb-10 inline-block">
                <div className="absolute inset-0 bg-vitality/20 rounded-full animate-ping" />
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center relative z-10 border-2 border-vitality/20">
                    <Video className="w-10 h-10 text-vitality" />
                </div>
             </div>
             
             <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter mb-4 leading-none">Session Ready</h2>
             
             <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Connecting Specialist</p>
                 <div className="flex items-center justify-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-lg font-black text-charcoal uppercase tracking-tight">{readyCase.doctorName}</p>
                 </div>
                 <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-2">Waiting in Secure Room</p>
             </div>
             
             <button 
               onClick={() => setJoiningCaseId(readyCase.id)}
               className="w-full py-6 bg-charcoal text-white rounded-2xl font-black uppercase text-sm tracking-[0.3em] hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-4 group hover:scale-[1.02] active:scale-[0.98]"
             >
               <Video className="w-5 h-5 group-hover:text-vitality transition-colors" />
               Join Consultation
             </button>
             
             <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
                <Wifi className="w-3 h-3" />
                <p className="text-[8px] font-bold uppercase tracking-widest">Encrypted Signal Established</p>
             </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <header className="pt-32 px-8 mb-12 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Lock className="w-3 h-3" /> Secure Session
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {patientPhone}</span>
            </div>
            <h1 className="text-5xl font-black text-charcoal tracking-tighter uppercase italic leading-none">
              Welcome back, <br/><span className="text-slate-400">{patientName || 'Patient'}</span>
            </h1>
            <p className="text-sm font-medium text-slate-500 max-w-md">
              Your clinical folder is active. Prescriptions and records are synchronized across all specialists.
            </p>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-full text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-all shadow-sm group"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> End Secure Session
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: ACTIONS & STATS */}
        <div className="lg:col-span-4 space-y-10">
          {/* QUICK ACTION: NEW SCAN */}
          <button 
            onClick={onStartNewScan}
            className="w-full bg-charcoal text-white rounded-[3rem] p-10 flex flex-col items-start gap-8 shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
              <Sparkles className="w-40 h-40" />
            </div>
            <div className="w-16 h-16 bg-vitality rounded-2xl flex items-center justify-center shadow-[0_0_20px_#10B981]">
              <Plus className="w-8 h-8" />
            </div>
            <div className="text-left">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-3">Initiate<br />New Scan</h3>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Analyze present skin morphology</p>
            </div>
            <div className="flex items-center gap-2 text-vitality font-black uppercase text-[10px] tracking-widest mt-4">
              Authorized Hub <ArrowUpRight className="w-4 h-4" />
            </div>
          </button>

          {/* ACTIVE REQUESTS (LIVE TRIAGE) */}
          {activeRequests.length > 0 && (
             <div className="bg-white rounded-[3rem] border border-blue-100 p-8 shadow-xl shadow-blue-100/20 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500 animate-pulse" />
                <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em] flex items-center gap-3">
                        <Activity className="w-4 h-4" /> Live Triage
                    </h4>
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                </div>
                
                <div className="space-y-4">
                    {activeRequests.map(req => (
                        <div key={req.id} className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
                             <div className="flex justify-between items-start mb-2">
                                <p className="text-xs font-black text-charcoal uppercase italic">{req.diagnosis}</p>
                                {req.status === 'in-consultation' ? (
                                    <span className="px-2 py-1 bg-vitality text-white text-[8px] font-black uppercase tracking-wider rounded">Ready</span>
                                ) : (
                                    <span className="px-2 py-1 bg-slate-200 text-slate-500 text-[8px] font-black uppercase tracking-wider rounded">Waiting</span>
                                )}
                             </div>
                             
                             {req.status === 'in-consultation' ? (
                                 <div className="space-y-3">
                                    <p className="text-[10px] text-zinc-600 font-medium">Doctor has accepted your case.</p>
                                    <button 
                                        onClick={() => setJoiningCaseId(req.id)}
                                        className="w-full py-3 bg-vitality text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-vitality/30 animate-pulse hover:animate-none hover:scale-105 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Video className="w-3 h-3" /> Join Call Now
                                    </button>
                                 </div>
                             ) : (
                                 <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold uppercase tracking-wide">
                                     <Clock className="w-3 h-3" /> Est. Wait: ~15 mins
                                 </div>
                             )}
                        </div>
                    ))}
                </div>
             </div>
          )}

          {/* ACTIVE PROTOCOLS */}
          <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                <Pill className="w-4 h-4 text-vitality" /> Active Protocols
              </h4>
              <div className="w-2 h-2 rounded-full bg-vitality animate-pulse" />
            </div>
            
            <div className="space-y-4">
              {isLoading && activeRequests.length === 0 && history.length === 0 ? (
                <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-200" /></div>
              ) : prescriptions.length > 0 ? (
                prescriptions.map((rx, i) => (
                  <div key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-vitality shadow-sm">
                      <Activity className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-black text-charcoal uppercase tracking-tight truncate">{rx}</span>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center opacity-30 italic text-[10px] uppercase font-bold tracking-widest">
                  No active medication detected
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CLINICAL TIMELINE */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-sm min-h-[600px] flex flex-col">
            <header className="flex items-center justify-between mb-12 pb-8 border-b border-slate-50">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-charcoal rounded-2xl flex items-center justify-center text-white">
                  <ClipboardList className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-charcoal tracking-tight uppercase italic">Clinical History</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Permanent Encounters & Findings</p>
                </div>
              </div>
              <div className="text-[10px] font-black text-vitality uppercase tracking-widest bg-vitality/5 px-4 py-2 rounded-full border border-vitality/10">
                {history.length} Folders Logged
              </div>
            </header>

            <div className="flex-1 space-y-8">
              {isLoading && history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Synchronizing Encounters...</p>
                </div>
              ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center text-rose-500">
                  <AlertCircle className="w-10 h-10 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                </div>
              ) : history.length > 0 ? (
                <div className="space-y-6">
                  {history.map((record, i) => (
                    <div key={i} className="p-8 bg-warmgrey/50 border border-slate-100 rounded-[2.5rem] hover:bg-white hover:shadow-xl hover:border-vitality/20 transition-all duration-500 group">
                      <div className="flex justify-between items-start mb-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <Calendar className="w-3 h-3" /> {new Date(record.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                          </div>
                          <h4 className="text-xl font-black text-charcoal uppercase italic tracking-tight group-hover:text-vitality transition-colors">{record.diagnosis}</h4>
                        </div>
                        <div className="px-4 py-2 bg-white rounded-xl border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
                          {record.doctor}
                        </div>
                      </div>
                      
                      <div className="p-6 bg-white/70 border border-slate-100 rounded-2xl text-[11px] text-slate-600 font-medium leading-relaxed uppercase tracking-tight mb-6">
                        {record.notes}
                      </div>

                      <div className="flex items-center gap-2 text-[9px] font-black text-vitality uppercase tracking-[0.3em]">
                        Full Protocol Archived <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center">
                  <History className="w-16 h-16 mb-6" />
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-2">Registry Silent</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest max-w-[200px] mx-auto">Complete a consultation to populate your persistent clinical timeline.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
