
import React, { useState, useEffect, useRef } from 'react';
import * as Lucide from 'lucide-react';
import { 
    Activity, LogOut, Loader2, Video, PhoneOff, 
    ShieldCheck, Sparkles, Stethoscope, FileText, Pill, Trash2, Wallet, 
    Check, ScanEye, User as UserIcon, History as HistoryTab,
    Clock, BadgeDollarSign, ArrowUpRight, ReceiptText, CreditCard,
    Plus, FlaskConical, Eye, ClipboardList, ChevronRight, AlertCircle,
    Info, MapPin, Globe, Target
} from 'lucide-react';
import { Doctor, PrescriptionEntry } from '../types';
import { generateConsultationRoom } from '../constants';

const PROJECT_ID = 'good-skin-2';
const DATABASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/active_cases`;

const AiAnalysisCard = ({ analysis }: { analysis: any }) => {
    const [expanded, setExpanded] = useState<string | null>('reasoning');

    if (!analysis) return null;
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-vitality" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Clinical Triage Report</h4>
                </div>
                <div className="px-3 py-1 bg-vitality/10 border border-vitality/20 rounded-full">
                    <span className="text-[9px] font-black text-vitality uppercase">{analysis.confidence_score}% Conf.</span>
                </div>
            </div>

            <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800 border-l-4 border-l-vitality">
                <p className="text-[9px] font-black text-zinc-600 uppercase mb-2 tracking-widest">Primary Diagnosis</p>
                <p className="text-xl font-black text-white uppercase italic tracking-tighter">{analysis.primary_diagnosis || "Triage Pending"}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Skin Type</p>
                    <p className="text-[10px] font-black text-zinc-300 uppercase">{analysis.fitzpatrick_type || 'N/A'}</p>
                </div>
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Urgency</p>
                    <p className={`text-[10px] font-black uppercase ${analysis.urgency === 'High' ? 'text-rose-500' : 'text-amber-500'}`}>{analysis.urgency}</p>
                </div>
            </div>

            <div className="space-y-3">
                {/* Accordion 1: Reasoning */}
                <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950/50">
                    <button 
                        onClick={() => setExpanded(expanded === 'reasoning' ? null : 'reasoning')}
                        className="w-full flex items-center justify-between p-4 hover:bg-zinc-900 transition-colors group"
                    >
                        <div className="flex items-center gap-2">
                            <ClipboardList className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">Diagnostic Reasoning</p>
                        </div>
                        <Lucide.ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform duration-300 ${expanded === 'reasoning' ? 'rotate-180' : ''}`} />
                    </button>
                    {expanded === 'reasoning' && (
                        <div className="p-4 border-t border-zinc-800 bg-zinc-950 animate-in slide-in-from-top-2">
                             <p className="text-[11px] text-zinc-400 leading-relaxed font-mono uppercase italic">
                                {analysis.clinical_markers || analysis.morphology}
                            </p>
                            {analysis.distribution && (
                                <div className="mt-3 flex items-start gap-2 pt-3 border-t border-zinc-900">
                                    <MapPin className="w-3.5 h-3.5 text-zinc-600 mt-0.5" />
                                    <div>
                                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Distribution</p>
                                        <p className="text-[10px] text-zinc-400 uppercase">{analysis.distribution}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Accordion 2: Differentials */}
                <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950/50">
                    <button 
                        onClick={() => setExpanded(expanded === 'differentials' ? null : 'differentials')}
                        className="w-full flex items-center justify-between p-4 hover:bg-zinc-900 transition-colors group"
                    >
                        <div className="flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">Differentials</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-zinc-700 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                                {(analysis.differential_diagnoses || []).length}
                            </span>
                            <Lucide.ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform duration-300 ${expanded === 'differentials' ? 'rotate-180' : ''}`} />
                        </div>
                    </button>
                    {expanded === 'differentials' && (
                        <div className="p-4 border-t border-zinc-800 bg-zinc-950 space-y-2 animate-in slide-in-from-top-2">
                            {(analysis.differential_diagnoses || []).map((d: string, i: number) => (
                                <div key={i} className="flex items-center gap-3 px-4 py-2 bg-zinc-900/50 rounded-lg border border-zinc-900">
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase">{d}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/50">
                <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Modality Recommendation</p>
                </div>
                <div className="px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                   <p className="text-[10px] font-black text-rose-400 uppercase tracking-wider text-center">{analysis.modality_recommendation}</p>
                </div>
            </div>
        </div>
    );
};

const WorkspacePanel = ({ activeCase, setActiveCase, setCases, setBalance, setEarningsHistory, setIsVideoActive, doctor }: any) => {
    const [tab, setTab] = useState<'documentation' | 'insights'>('documentation');
    const [clinicalFindings, setClinicalFindings] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [prescriptions, setPrescriptions] = useState<{ drugName: string, dosage: string, frequency: string }[]>([]);
    const [labRequest, setLabRequest] = useState("");
    const [isFinalizing, setIsFinalizing] = useState(false);

    useEffect(() => {
        if (activeCase?.aiAnalysis) {
            setClinicalFindings(`AI MORPHOLOGY: ${activeCase.aiAnalysis.morphology}\n\nCLINICAL MARKERS: ${activeCase.aiAnalysis.clinical_markers}\n\nDISTRIBUTION: ${activeCase.aiAnalysis.distribution || 'N/A'}`);
        }
    }, [activeCase]);

    const addPrescription = () => {
        setPrescriptions([...prescriptions, { drugName: "", dosage: "", frequency: "" }]);
    };

    const removePrescription = (index: number) => {
        setPrescriptions(prescriptions.filter((_, i) => i !== index));
    };

    const updatePrescription = (index: number, field: 'drugName' | 'dosage' | 'frequency', value: string) => {
        const updated = [...prescriptions];
        updated[index] = { ...updated[index], [field]: value };
        setPrescriptions(updated);
    };

    const handleAcceptReview = async () => {
        if (!activeCase || !diagnosis.trim()) return;
        setIsFinalizing(true);
        try {
            const rxText = prescriptions
                .filter(p => p.drugName.trim())
                .map(p => `${p.drugName} - ${p.dosage} [${p.frequency}]`)
                .join('\n');

            const payload = {
                fields: {
                    status: { stringValue: 'completed' },
                    finalDiagnosis: { stringValue: diagnosis },
                    clerkingNotes: { stringValue: clinicalFindings },
                    prescriptionText: { stringValue: rxText || "No clinical prescription issued." },
                    labRequests: { stringValue: labRequest || "No investigations requested." },
                    assignedToName: { stringValue: doctor.name },
                    completedAt: { timestampValue: new Date().toISOString() }
                }
            };
            
            const fieldsToUpdate = ['status', 'finalDiagnosis', 'clerkingNotes', 'prescriptionText', 'labRequests', 'assignedToName', 'completedAt'];
            const updateMask = fieldsToUpdate.map(f => `updateMask.fieldPaths=${f}`).join('&');

            await fetch(`${DATABASE_URL}/${activeCase.id}?${updateMask}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const fee = doctor.price || 125;
            setBalance((prev: number) => prev + fee);
            setEarningsHistory((prev: any[]) => [
                {
                    id: activeCase.id,
                    patientName: activeCase.patientName,
                    diagnosis: diagnosis,
                    fee: fee,
                    status: 'pending',
                    timestamp: new Date().toISOString(),
                    patientAge: activeCase.patientAge
                },
                ...prev
            ]);

            setActiveCase(null);
            setIsVideoActive(false);
        } catch (e) { 
            console.error("Accept & Review Error:", e); 
        } finally { 
            setIsFinalizing(false); 
        }
    };

    return (
        <section className="w-full lg:w-[450px] border-l border-zinc-900 flex flex-col bg-zinc-950 shrink-0 h-full shadow-2xl z-20">
            <div className="px-6 py-4 border-b border-zinc-900 bg-zinc-950">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500"><UserIcon className="w-4 h-4" /></div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wide">{activeCase.patientName}</h3>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{activeCase.patientAge} YRS • {activeCase.patientPhone}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-xl">
                    <button onClick={() => setTab('documentation')} className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${tab === 'documentation' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Clerking Note</button>
                    <button onClick={() => setTab('insights')} className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${tab === 'insights' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Triage Data</button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-10 pb-32">
                {tab === 'documentation' ? (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-3.5 h-3.5 text-zinc-500" />
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Findings & History</label>
                            </div>
                            <textarea value={clinicalFindings} onChange={(e) => setClinicalFindings(e.target.value)} className="w-full h-40 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-300 outline-none focus:border-zinc-700 transition-all resize-none font-mono uppercase" placeholder="Enter clinical observations..." />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Stethoscope className="w-3.5 h-3.5 text-vitality" />
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Final Diagnosis</label>
                            </div>
                            <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-sm font-bold uppercase text-vitality outline-none focus:border-vitality/50 transition-all italic" placeholder="Enter diagnosis..." />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Pill className="w-3.5 h-3.5 text-amber-500" />
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Prescription</label>
                                </div>
                                <button onClick={addPrescription} className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-vitality hover:bg-zinc-800 transition-colors">
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {prescriptions.map((p, i) => (
                                    <div key={i} className="flex flex-col gap-2 p-3 bg-zinc-900 border border-zinc-800 rounded-xl animate-in slide-in-from-right-2">
                                        <div className="flex gap-2">
                                            <input 
                                                value={p.drugName} 
                                                onChange={(e) => updatePrescription(i, 'drugName', e.target.value)} 
                                                placeholder="Drug Name" 
                                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-[10px] font-bold uppercase text-white outline-none focus:border-zinc-700" 
                                            />
                                            <button onClick={() => removePrescription(i)} className="p-2 text-zinc-700 hover:text-rose-500 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <input 
                                                value={p.dosage} 
                                                onChange={(e) => updatePrescription(i, 'dosage', e.target.value)} 
                                                placeholder="Dosage" 
                                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-[10px] font-bold uppercase text-amber-500 outline-none focus:border-zinc-700" 
                                            />
                                            <input 
                                                value={p.frequency} 
                                                onChange={(e) => updatePrescription(i, 'frequency', e.target.value)} 
                                                placeholder="Frequency" 
                                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-[10px] font-bold uppercase text-emerald-500 outline-none focus:border-zinc-700" 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <FlaskConical className="w-3.5 h-3.5 text-blue-500" />
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Lab/Biopsy Request</label>
                            </div>
                            <textarea value={labRequest} onChange={(e) => setLabRequest(e.target.value)} className="w-full h-24 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-400 outline-none focus:border-zinc-700 transition-all resize-none" placeholder="Request investigations..." />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <AiAnalysisCard analysis={activeCase.aiAnalysis} />
                        <div className="aspect-square rounded-3xl overflow-hidden border border-zinc-800 shadow-inner group relative">
                             <img src={activeCase.imageURL} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Clinical Asset" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                )}
            </div>
            <div className="p-6 border-t border-zinc-900 bg-zinc-950/90 backdrop-blur-md">
                <button 
                    onClick={handleAcceptReview} 
                    disabled={isFinalizing || !diagnosis.trim()} 
                    className={`w-full py-5 rounded-xl font-bold uppercase text-[11px] tracking-widest transition-all flex items-center justify-center gap-3 ${isFinalizing || !diagnosis.trim() ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed opacity-50' : 'bg-vitality text-white shadow-lg shadow-vitality/20 hover:bg-emerald-400 active:scale-95'}`}
                >
                    {isFinalizing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Submitting Review...</span>
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Authorize Report</span>
                        </>
                    )}
                </button>
            </div>
        </section>
    );
};

const SpecialistHub: React.FC<{doctor: Doctor, onLogout: () => void, onCompleteConsultation: () => void}> = ({ doctor, onLogout }) => {
    const [activeCase, setActiveCase] = useState<any | null>(null);
    const [cases, setCases] = useState<any[]>([]);
    const [earningsHistory, setEarningsHistory] = useState<any[]>([]);
    const [isLoadingQueue, setIsLoadingQueue] = useState(true);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [isVideoActive, setIsVideoActive] = useState(false);
    const [balance, setBalance] = useState(doctor.totalEarnings || 0);
    const [sidebarTab, setSidebarTab] = useState<'queue' | 'earnings'>('queue');

    const syncEar = async () => {
        try {
            const response = await fetch(DATABASE_URL);
            const data = await response.json();
            
            if (data.documents && Array.isArray(data.documents)) {
                const mapped = data.documents.map((doc: any) => {
                    const f = doc.fields;
                    return {
                        id: doc.name.split('/').pop(),
                        patientName: f.patientName?.stringValue || 'Unknown',
                        patientAge: f.patientAge?.stringValue || 'N/A',
                        patientPhone: f.patientPhone?.stringValue || 'N/A',
                        imageURL: f.imageURL?.stringValue || '',
                        status: f.status?.stringValue || 'pending',
                        aiAnalysis: f.aiAnalysis?.stringValue ? JSON.parse(f.aiAnalysis.stringValue) : null,
                        targetSpecialistID: f.targetSpecialistID?.stringValue || '',
                        createdAt: f.createdAt?.timestampValue
                    };
                });
                // Allow multiple specialists to see ALL pending cases.
                // We show all pending cases in the "Global Queue", but we will highlight direct requests in the UI.
                const pendingCases = mapped.filter(c => c.status === 'pending');
                setCases(pendingCases);
            }
        } catch (e) { 
            console.error("Sync Registry Error:", e); 
        } finally { 
            setIsLoadingQueue(false); 
        }
    };

    useEffect(() => {
        syncEar();
        const interval = setInterval(syncEar, 3000); 
        return () => clearInterval(interval);
    }, [doctor.id]);

    const handleAcceptHandshake = async (patient: any) => {
        if (claimingId) return;
        setClaimingId(patient.id);
        try {
            // CRITICAL: Double-check server status before claiming to avoid race conditions
            // where two doctors click at the exact same moment.
            const checkRes = await fetch(`${DATABASE_URL}/${patient.id}`);
            const checkData = await checkRes.json();
            const currentStatus = checkData.fields?.status?.stringValue;
            const assignedSpec = checkData.fields?.specialistID?.stringValue;

            // If it's no longer pending, OR someone else already wrote their ID to it
            if (currentStatus !== 'pending' || (assignedSpec && assignedSpec !== doctor.id)) {
                // Remove from local list immediately
                setCases(prev => prev.filter(c => c.id !== patient.id));
                setClaimingId(null);
                return;
            }

            const payload = {
                fields: {
                    status: { stringValue: 'in-consultation' },
                    specialistID: { stringValue: doctor.id }
                }
            };
            const updateMask = 'updateMask.fieldPaths=status&updateMask.fieldPaths=specialistID';
            const acceptRes = await fetch(`${DATABASE_URL}/${patient.id}?${updateMask}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!acceptRes.ok) throw new Error('CLAIM_PATCH_FAILURE');
            
            setActiveCase({ ...patient, status: 'in-consultation' });
            setIsVideoActive(true);
        } catch (e) { 
            console.error("[HANDSHAKE] Critical Protocol Failure:", e); 
        } finally {
            setClaimingId(null);
        }
    };

    const pendingBalance = earningsHistory.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.fee, 0);

    return (
        <div className="flex h-screen bg-charcoal text-zinc-100 font-sans overflow-hidden">
            <aside className="w-[340px] bg-zinc-950 border-r border-zinc-900 flex flex-col shrink-0">
                <div className="p-6 border-b border-zinc-900 flex items-center gap-4">
                    <img src={doctor.image} className="w-10 h-10 rounded-full border border-zinc-800 object-cover shadow-lg" alt="Specialist" />
                    <div>
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">{doctor.name}</h2>
                        <div className="flex items-center gap-1.5 mt-1 text-vitality">
                            <ShieldCheck className="w-3 h-3" />
                            <p className="text-[8px] font-bold uppercase tracking-widest">Authorized</p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex justify-between items-center relative overflow-hidden group shadow-inner">
                         <div className="relative z-10">
                            <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Available</p>
                            <p className="text-2xl font-black text-white tracking-tighter italic">₵{(balance - pendingBalance).toLocaleString()}</p>
                         </div>
                         <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 group-hover:text-vitality transition-colors relative z-10">
                            <Wallet className="w-5 h-5" />
                         </div>
                    </div>
                </div>

                <div className="px-6 pb-4">
                    <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800 shadow-sm">
                        <button onClick={() => setSidebarTab('queue')} className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${sidebarTab === 'queue' ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700' : 'text-zinc-600'}`}>
                            <Activity className="w-3.5 h-3.5" /> Queue {cases.length > 0 && <span className="bg-vitality text-white px-1.5 rounded-md text-[8px] leading-none py-1">{cases.length}</span>}
                        </button>
                        <button onClick={() => setSidebarTab('earnings')} className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${sidebarTab === 'earnings' ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700' : 'text-zinc-600'}`}>
                            <BadgeDollarSign className="w-3.5 h-3.5" /> Earnings
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-2 space-y-5">
                    {sidebarTab === 'queue' ? (
                        <>
                            <div className="flex items-center justify-between px-2">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Available Assets</p>
                                <span className="w-1.5 h-1.5 rounded-full bg-vitality animate-pulse shadow-[0_0_10px_#10B981]" />
                            </div>
                            {isLoadingQueue ? (
                                <div className="py-12 flex flex-col items-center gap-3 opacity-20">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                </div>
                            ) : cases.length === 0 ? (
                                <div className="py-20 text-center space-y-4 opacity-30">
                                    <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto border border-zinc-800 text-zinc-700">
                                        <HistoryTab className="w-6 h-6" />
                                    </div>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] leading-relaxed">System Standby.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {cases.map((p) => {
                                        const isDirect = p.targetSpecialistID === doctor.id;
                                        return (
                                        <button 
                                            key={p.id} 
                                            onClick={() => handleAcceptHandshake(p)} 
                                            disabled={claimingId !== null}
                                            className={`w-full text-left p-4 rounded-2xl border transition-all group relative overflow-hidden shadow-sm ${claimingId === p.id ? 'bg-zinc-900 border-vitality shadow-vitality/10 scale-[0.98]' : 'bg-zinc-900/30 border-zinc-900 hover:bg-zinc-900 hover:border-vitality/40'}`}
                                        >
                                            <div className="flex gap-4 items-center">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-black shrink-0 relative border border-zinc-800">
                                                    <img src={p.imageURL} className={`w-full h-full object-cover transition-opacity ${claimingId === p.id ? 'opacity-30' : 'opacity-60 group-hover:opacity-100'}`} alt="Scan Preview" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <h4 className="text-xs font-black text-white uppercase truncate tracking-tight">{p.patientName}</h4>
                                                        {isDirect ? (
                                                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-500/20 rounded text-[7px] font-black text-rose-500 uppercase tracking-wider">
                                                                <Target className="w-2 h-2" /> Direct
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/10 rounded text-[7px] font-black text-blue-500 uppercase tracking-wider">
                                                                <Globe className="w-2 h-2" /> Pool
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <p className="text-[8px] font-bold uppercase text-zinc-500">{p.patientAge} YRS</p>
                                                        <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                                        <p className={`text-[8px] font-bold uppercase ${claimingId === p.id ? 'text-zinc-600' : 'text-vitality'}`}>
                                                            {claimingId === p.id ? 'CLAIMING...' : 'READY'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Lucide.ChevronRight className={`w-4 h-4 transition-all ${claimingId === p.id ? 'opacity-0' : 'text-zinc-800 group-hover:text-vitality group-hover:translate-x-1'}`} />
                                            </div>
                                        </button>
                                    )})}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div className="flex items-center justify-between px-2">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Recent Activity</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">Today</span>
                                    <ReceiptText className="w-3 h-3 text-zinc-700" />
                                </div>
                            </div>
                            
                            {earningsHistory.length === 0 ? (
                                <div className="py-20 text-center space-y-4 opacity-20">
                                    <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto border border-zinc-800 text-zinc-700">
                                        <BadgeDollarSign className="w-6 h-6" />
                                    </div>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] leading-relaxed">No Session Earnings</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {earningsHistory.map((item) => (
                                        <div key={item.id} className="w-full p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900 flex items-center gap-4 group hover:border-zinc-800 transition-all">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-center text-zinc-500 shrink-0 group-hover:text-vitality transition-colors">
                                                <Check className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="text-[10px] font-black text-white uppercase truncate tracking-wider">{item.patientName}</h4>
                                                    <p className="text-[10px] font-black text-white tracking-tight">₵{item.fee}</p>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{item.diagnosis.substring(0, 15)}...</p>
                                                    
                                                    {item.status === 'pending' ? (
                                                        <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">
                                                            <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                                                            <span className="text-[7px] font-black text-amber-500 uppercase tracking-wider">Pending</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-vitality/10 rounded border border-vitality/20">
                                                            <div className="w-1 h-1 rounded-full bg-vitality" />
                                                            <span className="text-[7px] font-black text-vitality uppercase tracking-wider">Settled</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-zinc-900 bg-zinc-950">
                    <button onClick={onLogout} className="w-full py-4 bg-zinc-900 hover:bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-600 hover:text-rose-500 transition-all text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 group">
                        <LogOut className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Terminate Session
                    </button>
                </div>
            </aside>
            {activeCase ? (
                <main className="flex-1 flex overflow-hidden">
                    <section className="flex-1 bg-black relative">
                         <div className="absolute top-8 left-8 z-20 bg-black/60 backdrop-blur-md border border-zinc-800 rounded-full px-6 py-2.5 flex items-center gap-4 shadow-2xl">
                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic">Live Clinical Bridge</span>
                        </div>
                        {isVideoActive ? (
                            <iframe src={generateConsultationRoom(activeCase.id)} allow="camera; microphone; fullscreen; display-capture" className="w-full h-full border-none" title="Video Consult" />
                        ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950">
                                <Loader2 className="w-10 h-10 animate-spin text-zinc-800 mb-6" />
                            </div>
                        )}
                    </section>
                    <WorkspacePanel 
                        activeCase={activeCase} 
                        setActiveCase={setActiveCase} 
                        setCases={setCases} 
                        setBalance={setBalance} 
                        setEarningsHistory={setEarningsHistory}
                        setIsVideoActive={setIsVideoActive} 
                        doctor={doctor}
                    />
                </main>
            ) : (
                <main className="flex-1 flex flex-col items-center justify-center bg-zinc-950 text-center p-12 relative overflow-hidden">
                    <div className="relative z-10 space-y-12">
                        <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] flex items-center justify-center shadow-2xl mx-auto">
                            <Stethoscope className="w-10 h-10 text-zinc-700" />
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic">Newman Console<span className="text-vitality">.</span></h1>
                            <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.5em] max-w-sm mx-auto leading-relaxed">Monitoring registry. Clinical handshake protocols standby.</p>
                        </div>
                    </div>
                </main>
            )}
        </div>
    );
};

export default SpecialistHub;
