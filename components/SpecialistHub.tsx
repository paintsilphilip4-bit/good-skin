
import React, { useState, useEffect, useRef } from 'react';
import * as Lucide from 'lucide-react';
import { 
    Activity, LogOut, Loader2, Video, PhoneOff, 
    ShieldCheck, Sparkles, Clock, AlertTriangle,
    Stethoscope, FileText, Pill, ChevronRight,
    Search, BarChart3, Bell, Eye, Database,
    Printer, Mic, MicOff, CheckCircle, User as UserIcon,
    ClipboardList, HeartPulse, Microscope, ChevronDown, ChevronUp,
    History, FlaskConical, Plus, Trash2, Wallet, 
    ArrowUpRight, Smartphone, Check, X, Menu, Calendar,
    ScanEye, Scale
} from 'lucide-react';
import { 
    Doctor, DashboardPatient, ConsultationHistoryRecord, 
    MedicalAnalysis, PrescriptionEntry 
} from '../types';
import { analyzeAsDermatologist } from '../services/geminiService';
import { ACTIVE_CLINIC_ID } from '../constants';

const PROJECT_ID = 'good-skin-2';
const DATABASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/cases`;

const generateConsultationRoom = (caseId: string) => {
  return `https://goodskin.daily.co/consultation-${caseId}`;
};

const MedicalTimeline = ({ history }: { history: any[] }) => {
    const [openPrescription, setOpenPrescription] = useState<string | null>(null);

    return (
        <div className="space-y-8 relative">
            <div className="absolute left-[11px] top-4 bottom-4 w-px bg-zinc-800 border-l border-dashed border-zinc-700" />
            {history.length === 0 ? (
                <div className="pl-10 py-4 opacity-20 italic text-[10px] font-bold uppercase tracking-widest">Registry Empty</div>
            ) : history.map((record, i) => (
                <div key={i} className="pl-10 relative group">
                    <div className="absolute left-0 top-1.5 w-[22px] h-[22px] bg-zinc-950 border-2 border-zinc-800 rounded-full flex items-center justify-center z-10 group-hover:border-emerald-500 transition-colors">
                        <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full group-hover:bg-emerald-500" />
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">{new Date(record.timestamp).toLocaleDateString()}</p>
                                <h5 className="text-[13px] font-bold italic tracking-tight text-zinc-200 uppercase leading-none">{record.diagnosis}</h5>
                            </div>
                            <div className="w-12 h-12 squircle overflow-hidden border border-zinc-800">
                                <img src={record.imageUrl} className="w-full h-full object-cover grayscale opacity-50" />
                            </div>
                        </div>
                        <div className="p-5 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl text-[10px] text-zinc-400 leading-relaxed uppercase font-medium">
                            {record.notes}
                        </div>
                        
                        <button 
                            onClick={() => setOpenPrescription(openPrescription === record.id ? null : record.id)}
                            className="flex items-center gap-2 text-[9px] font-bold text-vitality uppercase tracking-widest hover:text-emerald-400 transition-colors"
                        >
                            <Pill className="w-4 h-4" /> 
                            {openPrescription === record.id ? 'Hide Protocol' : 'View Protocol'}
                        </button>

                        {openPrescription === record.id && (
                            <div className="p-5 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl space-y-2 animate-in slide-in-from-top-2 duration-300">
                                <p className="text-[8px] font-bold text-vitality uppercase tracking-widest mb-1">Pharmacotherapy Log</p>
                                {record.prescriptions ? record.prescriptions.split('\n').map((rx: string, idx: number) => (
                                    <p key={idx} className="text-[10px] font-bold text-zinc-300 uppercase leading-none">{rx}</p>
                                )) : <p className="text-[10px] font-bold text-zinc-600 uppercase">No Data</p>}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

interface SpecialistHubProps {
  doctor: Doctor;
  onLogout: () => void;
  onCompleteConsultation: () => void;
}

const SpecialistHub: React.FC<SpecialistHubProps> = ({ doctor, onLogout, onCompleteConsultation }) => {
    const [selectedPatient, setSelectedPatient] = useState<DashboardPatient | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isVideoActive, setIsVideoActive] = useState(false);
    const [queue, setQueue] = useState<DashboardPatient[]>([]);
    const [isLoadingQueue, setIsLoadingQueue] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const [balance, setBalance] = useState(doctor.totalEarnings || 0);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [momoNumber, setMomoNumber] = useState("");
    const [isProcessingPayout, setIsProcessingPayout] = useState(false);
    const [payoutSuccess, setPayoutSuccess] = useState(false);

    const [clinicalFindings, setClinicalFindings] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [prescriptions, setPrescriptions] = useState<PrescriptionEntry[]>([]);

    useEffect(() => {
        let isMounted = true;
        const syncFlowboard = async () => {
            try {
                const response = await fetch(DATABASE_URL);
                const data = await response.json();
                if (!isMounted) return;

                if (data.documents && Array.isArray(data.documents)) {
                    const activeCases = data.documents
                        .filter((doc: any) => {
                            const fields = doc?.fields || {};
                            const status = fields.status?.stringValue;
                            return fields.assignedToId?.stringValue === ACTIVE_CLINIC_ID && 
                                   (status === 'assigned' || status === 'in-consultation');
                        })
                        .map((doc: any) => {
                            const fields = doc.fields || {};
                            return {
                                id: doc.name.split('/').pop(),
                                patientId: fields.patientFolderID?.stringValue || fields.patientId?.stringValue || 'LEGACY',
                                phoneNumber: fields.phoneNumber?.stringValue || fields.patientId?.stringValue || 'N/A',
                                patientName: fields.patientName?.stringValue || 'Unknown',
                                name: fields.patientName?.stringValue || 'Unknown',
                                age: parseInt(fields.age?.stringValue || '0'),
                                status: fields.status?.stringValue || 'waiting',
                                requestTime: Date.parse(fields.timestamp?.timestampValue) || Date.now(),
                                attachedImages: [fields.imageUrl?.stringValue || ''],
                                aiAnalysisJson: { condition: fields.aiDiagnosis?.stringValue || 'Analysis Pending', probability: 1, severity: 'Medium' },
                                aiFindings: fields.aiFindings?.stringValue || 'None'
                            };
                        });
                    setQueue(activeCases);
                }
            } catch (e) { console.error("Sync Error:", e); }
            finally { if (isMounted) setIsLoadingQueue(false); }
        };

        syncFlowboard();
        const listener = setInterval(syncFlowboard, 2500);
        return () => { isMounted = false; clearInterval(listener); };
    }, []);

    const fetchPatientHistory = async (folderID: string) => {
        if (!folderID) return;
        setIsLoadingHistory(true);
        try {
            const response = await fetch(DATABASE_URL);
            const data = await response.json();
            if (data.documents) {
                const history = data.documents
                    .filter((doc: any) => {
                        const f = doc.fields;
                        const docFolderID = f.patientFolderID?.stringValue || f.phoneNumber?.stringValue || f.patientId?.stringValue;
                        return docFolderID === folderID && f.status?.stringValue === 'completed';
                    })
                    .map((doc: any) => ({
                        id: doc.name.split('/').pop(),
                        timestamp: doc.fields.timestamp?.timestampValue || doc.fields.completedAt?.timestampValue,
                        diagnosis: doc.fields.finalDiagnosis?.stringValue || 'Dermatological Condition',
                        notes: doc.fields.clerkingNotes?.stringValue || 'Consultation complete.',
                        imageUrl: doc.fields.imageUrl?.stringValue || '',
                        prescriptions: doc.fields.prescriptionText?.stringValue || '',
                        specialist: doc.fields.assignedToName?.stringValue || 'Specialist'
                    }))
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                setMedicalHistory(history);
            }
        } catch (e) { console.error("EMR Access Failure:", e); }
        finally { setIsLoadingHistory(false); }
    };

    const handleAcceptAndStart = async (patient: DashboardPatient) => {
        setSelectedPatient({ ...patient, status: 'in-consultation' });
        setIsVideoActive(true); 
        setIsAnalyzing(true);
        setIsSidebarOpen(false); 
        fetchPatientHistory(patient.patientId);
        try {
            const payload = { fields: { status: { stringValue: 'in-consultation' } } };
            await fetch(`${DATABASE_URL}/${patient.id}?updateMask.fieldPaths=status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const analysis = await analyzeAsDermatologist(patient.attachedImages[0]);
            setDiagnosis(analysis.diagnosis || "");
            setClinicalFindings(analysis.findings || "");
        } catch (error) { console.error("Clinical Bridge Error", error); }
        finally { setIsAnalyzing(false); }
    };

    const handleFinalize = async () => {
        if (!selectedPatient) return;
        setIsFinalizing(true);
        const structuredPrescriptionText = prescriptions.filter(p => p.drugName.trim()).map(p => `${p.drugName} | ${p.dosage} | ${p.duration}`).join('\n');
        const payload = {
            fields: {
                status: { stringValue: 'completed' },
                clerkingNotes: { stringValue: clinicalFindings },
                prescriptionText: { stringValue: structuredPrescriptionText || 'No clinical prescription issued.' },
                finalDiagnosis: { stringValue: diagnosis },
                completedAt: { timestampValue: new Date().toISOString() }
            }
        };
        try {
            const updateMask = ['status', 'clerkingNotes', 'prescriptionText', 'finalDiagnosis', 'completedAt'].map(p => `updateMask.fieldPaths=${p}`).join('&');
            await fetch(`${DATABASE_URL}/${selectedPatient.id}?${updateMask}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            setSelectedPatient(null);
            setIsVideoActive(false);
            setBalance(prev => prev + 150);
        } catch (e) { console.error("Ledger Update Failure:", e); }
        finally { setIsFinalizing(false); }
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-charcoal text-zinc-100 font-sans selection:bg-vitality/30 overflow-hidden relative">
            
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl" onClick={() => setIsWithdrawModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-10 md:p-16 shadow-2xl">
                        {payoutSuccess ? (
                            <div className="flex flex-col items-center py-10 space-y-10">
                                <div className="w-24 h-24 bg-vitality text-white rounded-full flex items-center justify-center shadow-[0_0_30px_#10B981]"><Check className="w-12 h-12" /></div>
                                <h3 className="text-2xl font-bold uppercase italic text-center tracking-tight">Revenue Settled</h3>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                <h3 className="text-2xl font-bold uppercase italic tracking-tight">Liquidate Balance</h3>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em]">Beneficiary Mobile Number</p>
                                    <input value={momoNumber} onChange={(e) => setMomoNumber(e.target.value)} className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl py-6 px-10 text-base font-bold text-white focus:border-vitality outline-none transition-all" placeholder="0XX XXX XXXX" />
                                </div>
                                <button onClick={() => { setIsProcessingPayout(true); setTimeout(() => { setPayoutSuccess(true); setBalance(0); setTimeout(() => setIsWithdrawModalOpen(false), 2000); }, 1500); }} className="w-full py-8 bg-white text-charcoal rounded-full font-bold uppercase text-[12px] tracking-[0.4em] hover:scale-[1.02] active:scale-[0.98] transition-all">
                                    {isProcessingPayout ? 'Authorizing Shift...' : 'Confirm Settlement'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <aside className={`fixed inset-y-0 left-0 z-[2100] w-[350px] bg-zinc-950 border-r border-zinc-900 transition-transform duration-500 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:static lg:flex lg:flex-col shrink-0 overflow-hidden`}>
                <div className="p-10 border-b border-zinc-900 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 squircle overflow-hidden border border-zinc-800">
                            <img src={doctor.image} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h2 className="text-[11px] font-bold uppercase tracking-[0.5em] text-zinc-200">{doctor.name}</h2>
                            <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-600">Specialist Hub</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-10 relative overflow-hidden group">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.5em] mb-4">Registry Earnings</p>
                        <div className="mb-10">
                            <span className="text-4xl font-bold italic tracking-tight text-vitality">₵ {balance.toLocaleString()}.00</span>
                        </div>
                        <button onClick={() => setIsWithdrawModalOpen(true)} className="w-full py-5 bg-zinc-950 border-2 border-zinc-800 text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.4em] hover:bg-zinc-900 transition-all">Dispatch Settlement</button>
                    </div>

                    <div className="space-y-6">
                        <p className="px-4 text-[11px] font-bold text-zinc-700 uppercase tracking-[0.5em]">Active Queue</p>
                        {isLoadingQueue ? (
                            <div className="py-20 flex flex-col items-center gap-4 opacity-20"><Loader2 className="w-8 h-8 animate-spin" /></div>
                        ) : queue.map((p) => (
                            <button 
                                key={p.id} 
                                onClick={() => handleAcceptAndStart(p)} 
                                className={`w-full text-left p-8 rounded-[2rem] border-2 transition-all duration-300 animate-pulse-subtle ${selectedPatient?.id === p.id ? 'bg-zinc-900 border-vitality/30' : 'bg-zinc-900/30 border-transparent hover:border-zinc-800'}`}
                            >
                                <div className="flex gap-6 items-center">
                                    <div className="w-16 h-16 squircle overflow-hidden shrink-0 border-2 border-zinc-800"><img src={p.attachedImages[0]} className="w-full h-full object-cover grayscale opacity-50" /></div>
                                    <div className="flex-1 truncate">
                                        <h4 className="text-[14px] font-bold italic tracking-tight text-zinc-200 uppercase truncate leading-none mb-2">{p.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-vitality animate-pulse shadow-[0_0_8px_#10B981]" />
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-vitality truncate">In Queue</p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="p-8 border-t border-zinc-900">
                    <button onClick={onLogout} className="w-full p-6 bg-zinc-900/50 hover:bg-rose-950/20 rounded-[1.8rem] text-zinc-600 hover:text-rose-500 transition-all flex items-center justify-center gap-5 text-[11px] font-bold uppercase tracking-[0.4em]">
                        <LogOut className="w-5 h-5" /> End Clinical Shift
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden bg-charcoal relative">
                {selectedPatient ? (
                    <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-500">
                        <header className="px-12 py-12 border-b border-zinc-900 flex justify-between items-center shrink-0 z-30">
                            <div className="flex items-center gap-10">
                                <div className="p-6 bg-zinc-900 squircle border border-zinc-800 shadow-xl"><Stethoscope className="w-10 h-10 text-vitality" /></div>
                                <div>
                                    <h3 className="text-4xl font-bold italic tracking-tight uppercase leading-none mb-2">{selectedPatient.name}</h3>
                                    <p className="text-[11px] font-bold text-vitality uppercase tracking-[0.5em]">Patient Registry Tethered • {selectedPatient.phoneNumber}</p>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <button onClick={() => setIsVideoActive(!isVideoActive)} className={`px-12 py-6 rounded-full font-bold uppercase text-[12px] tracking-[0.5em] transition-all flex items-center gap-4 hover:scale-[1.02] active:scale-[0.98] ${isVideoActive ? 'bg-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.3)]' : 'bg-vitality shadow-[0_0_20px_#10B981]'}`}>
                                    {isVideoActive ? <><PhoneOff className="w-5 h-5" /> Terminate Link</> : <><Video className="w-5 h-5" /> Connect Uplink</>}
                                </button>
                            </div>
                        </header>

                        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden no-scrollbar bg-black">
                            <section className="hidden lg:flex w-[400px] border-r border-zinc-900 p-12 flex-col gap-12 shrink-0 overflow-y-auto no-scrollbar bg-zinc-950/80 backdrop-blur-3xl">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 border-b border-zinc-800 pb-5">
                                        <Scale className="w-5 h-5 text-vitality" />
                                        <h4 className="text-[11px] font-bold uppercase tracking-[0.6em] text-zinc-400">Clinical Baseline</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="aspect-square bg-zinc-900 squircle overflow-hidden border border-zinc-800 relative group">
                                            {medicalHistory.length > 0 ? <img src={medicalHistory[0].imageUrl} className="w-full h-full object-cover grayscale opacity-40" /> : <div className="w-full h-full flex items-center justify-center text-zinc-800"><History className="w-10 h-10" /></div>}
                                            <div className="absolute inset-0 bg-black/40 flex items-end p-3"><span className="text-[8px] font-bold text-white uppercase tracking-widest bg-black/60 px-2 py-1 rounded">Prior Case</span></div>
                                        </div>
                                        <div className="aspect-square bg-zinc-900 squircle overflow-hidden border-2 border-vitality/30 relative group">
                                            <img src={selectedPatient.attachedImages[0]} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-vitality/10 flex items-end p-3"><span className="text-[8px] font-bold text-white uppercase tracking-widest bg-vitality px-2 py-1 rounded">Current Scan</span></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center gap-4 border-b border-zinc-800 pb-5">
                                        <Database className="w-5 h-5 text-zinc-600" />
                                        <h4 className="text-[11px] font-bold uppercase tracking-[0.6em] text-zinc-600">Patient History</h4>
                                    </div>
                                    <div className="min-h-[300px]">
                                        {isLoadingHistory ? (
                                            <div className="py-20 flex flex-col items-center gap-4 opacity-10"><Loader2 className="w-8 h-8 animate-spin" /></div>
                                        ) : <MedicalTimeline history={medicalHistory} />}
                                    </div>
                                </div>
                            </section>

                            <section className="flex-1 bg-black relative flex flex-col group h-full">
                                {isVideoActive ? <iframe src={generateConsultationRoom(selectedPatient.id)} allow="camera; microphone; fullscreen; display-capture" className="w-full h-full border-none" /> : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950">
                                        <div className="w-24 h-24 bg-zinc-900 squircle flex items-center justify-center text-zinc-800 animate-pulse border border-zinc-800 shadow-2xl"><Video className="w-12 h-12" /></div>
                                    </div>
                                )}
                            </section>

                            <section className="w-full lg:w-[480px] border-l border-zinc-900 flex flex-col bg-zinc-950 shrink-0 h-full relative">
                                <div className="p-12 space-y-12 flex-1 overflow-y-auto no-scrollbar pb-40">
                                    <div className="space-y-6">
                                        <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.5em]">Clerking Observations</p>
                                        <textarea value={clinicalFindings} onChange={(e) => setClinicalFindings(e.target.value)} className="w-full h-64 bg-zinc-900/30 border border-zinc-800 rounded-3xl p-10 text-sm text-zinc-300 focus:outline-none focus:border-vitality/30 focus:bg-zinc-900 transition-all resize-none leading-relaxed font-medium uppercase placeholder:text-zinc-800" placeholder="Clinical narrative..." />
                                    </div>
                                    <div className="space-y-8">
                                        <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.5em]">Protocol Directive</p>
                                        <div className="space-y-4">
                                            {prescriptions.map((p, idx) => (
                                                <div key={idx} className="p-8 bg-zinc-900/40 border border-zinc-800 rounded-3xl space-y-6 shadow-2xl">
                                                    <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Therapeutic Entry #{idx + 1}</span><button onClick={() => setPrescriptions(prescriptions.filter((_, i) => i !== idx))} className="p-2 text-zinc-800 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button></div>
                                                    <input value={p.drugName} onChange={(e) => { const n = [...prescriptions]; n[idx].drugName = e.target.value; setPrescriptions(n); }} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-4 text-[12px] font-bold text-white focus:border-vitality transition-all" placeholder="MEDICATION NAME" />
                                                </div>
                                            ))}
                                            <button onClick={() => setPrescriptions([...prescriptions, { drugName: "", dosage: "", duration: "" }])} className="w-full py-8 border-2 border-dashed border-zinc-900 rounded-[2.5rem] text-[11px] font-bold uppercase text-zinc-700 hover:text-vitality hover:border-vitality/30 transition-all flex items-center justify-center gap-5">
                                                <Plus className="w-5 h-5" /> Add Protocol Entry
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.5em]">Clinical Final Auth</p>
                                        <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="w-full bg-zinc-900/60 border border-zinc-800 rounded-[2.5rem] px-10 py-8 text-xl font-bold uppercase text-vitality focus:border-vitality outline-none shadow-2xl transition-all" placeholder="SPECIFY CONDITION..." />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-12 border-t-2 border-zinc-900 bg-zinc-950/90 backdrop-blur-3xl z-40">
                                    <button onClick={handleFinalize} disabled={isFinalizing || !diagnosis} className={`w-full py-8 rounded-full font-bold uppercase text-[13px] tracking-[0.6em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-6 ${isFinalizing || !diagnosis ? 'bg-zinc-900 text-zinc-700' : 'bg-vitality text-white shadow-[0_0_30px_#10B981]'}`}>
                                        {isFinalizing ? <Loader2 className="w-8 h-8 animate-spin" /> : <><ShieldCheck className="w-8 h-8" /> Authorize & Archive</>}
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-20 animate-in fade-in duration-1000">
                        <img src={doctor.image} className="w-32 h-32 squircle grayscale opacity-40 mb-8" />
                        <h3 className="text-5xl font-bold italic tracking-tight uppercase mb-4 text-white">Registry Idle</h3>
                        <p className="text-[11px] font-bold uppercase tracking-[0.8em] text-zinc-600">Awaiting Clinical Uplink Authorization</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SpecialistHub;
