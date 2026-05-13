
import React, { useState, useEffect, useRef } from 'react';
import * as Lucide from 'lucide-react';
import { 
    Activity, LogOut, Loader2, Video, PhoneOff, 
    ShieldCheck, Sparkles, Stethoscope, FileText, Pill, Trash2, Wallet, 
    Check, ScanEye, User as UserIcon, History as HistoryTab,
    Clock, BadgeDollarSign, ArrowUpRight, ReceiptText, CreditCard,
    Plus, FlaskConical, Eye, ClipboardList, ChevronRight, AlertCircle,
    Info, MapPin, Globe, Target, UserPlus, Share, ArrowRightLeft,
    ChevronDown, MoreVertical, Maximize2, StickyNote
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Doctor, PrescriptionEntry } from '../types';
import { generateConsultationRoom, MOCK_DOCTORS } from '../constants';
import { useFirestore } from '../hooks/useFirestore';

const PROJECT_ID = 'good-skin-2';
const DATABASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/active_cases`;

const AiAnalysisCard = ({ analysis }: { analysis: any }) => {
    const [expanded, setExpanded] = useState<string | null>('reasoning');
    const [instanceId] = useState(() => Math.random().toString(16).substring(2, 10).toUpperCase());

    if (!analysis) return null;
    return (
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-[2.5rem] p-8 space-y-8 animate-in fade-in zoom-in-95 duration-700 shadow-2xl relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 p-8">
                <div className="w-20 h-20 bg-vitality/5 rounded-full blur-3xl" />
            </div>

            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-800">
                        <Sparkles className="w-5 h-5 text-vitality animate-pulse" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Core Intelligence</h4>
                        <p className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest mt-0.5">Triage Instance: {instanceId}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[12px] font-black text-white italic tracking-tighter">{analysis.confidence_score}%</span>
                    <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest leading-none mt-1">Reliability Threshold</span>
                </div>
            </div>

            <div className="p-8 bg-zinc-950/80 rounded-[2rem] border border-zinc-800 shadow-inner group relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-vitality rounded-r-full shadow-[0_0_15px_#10B981]" />
                <p className="text-[9px] font-black text-zinc-600 uppercase mb-3 tracking-[0.3em] px-2">Primary Diagnostic Hypothesis</p>
                <p className="text-2xl font-black text-white uppercase italic tracking-tighter px-2 group-hover:text-vitality transition-colors duration-500">{analysis.primary_diagnosis || "Awaiting Synthesis"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="p-5 bg-zinc-950/50 rounded-2xl border border-zinc-900 hover:border-zinc-800 transition-colors">
                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-blue-500" />
                        Clinical Phenotype
                    </p>
                    <p className="text-[11px] font-black text-zinc-300 uppercase tracking-tight">{analysis.fitzpatrick_type || 'Unclassified'}</p>
                </div>
                <div className="p-5 bg-zinc-950/50 rounded-2xl border border-zinc-900 hover:border-zinc-800 transition-colors">
                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className={`w-1 h-1 rounded-full ${analysis.urgency === 'High' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                        Priority Matrix
                    </p>
                    <p className={`text-[11px] font-black uppercase tracking-tight ${analysis.urgency === 'High' ? 'text-rose-500' : 'text-amber-500'}`}>{analysis.urgency}</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Accordion 1: Reasoning */}
                <div className="border border-zinc-800/50 rounded-2xl overflow-hidden bg-zinc-950/30 group/acc">
                    <button 
                        onClick={() => setExpanded(expanded === 'reasoning' ? null : 'reasoning')}
                        className="w-full flex items-center justify-between p-5 hover:bg-zinc-900/50 transition-all duration-300"
                    >
                        <div className="flex items-center gap-3">
                            <ClipboardList className="w-4 h-4 text-zinc-600 group-hover/acc:text-vitality transition-colors" />
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] group-hover/acc:text-zinc-300 transition-colors">Morphological Reasoning</p>
                        </div>
                        <Lucide.ChevronDown className={`w-4 h-4 text-zinc-700 transition-transform duration-500 ${expanded === 'reasoning' ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                        {expanded === 'reasoning' && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-6 border-t border-zinc-800/50 bg-zinc-950">
                                    <p className="text-[11px] text-zinc-400 leading-relaxed font-mono uppercase italic border-l-2 border-zinc-800 pl-4 py-1">
                                        {analysis.clinical_markers || analysis.morphology}
                                    </p>
                                    {analysis.distribution && (
                                        <div className="mt-4 flex items-start gap-3 pt-4 border-t border-zinc-900">
                                            <div className="p-1.5 bg-zinc-900 rounded shadow-inner">
                                                <MapPin className="w-3.5 h-3.5 text-zinc-600" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Anatomical Cluster</p>
                                                <p className="text-[10px] text-zinc-400 uppercase mt-0.5">{analysis.distribution}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Accordion 2: Differentials */}
                <div className="border border-zinc-800/50 rounded-2xl overflow-hidden bg-zinc-950/30 group/acc">
                    <button 
                        onClick={() => setExpanded(expanded === 'differentials' ? null : 'differentials')}
                        className="w-full flex items-center justify-between p-5 hover:bg-zinc-900/50 transition-all duration-300"
                    >
                        <div className="flex items-center gap-3">
                            <Activity className="w-4 h-4 text-zinc-600 group-hover/acc:text-blue-500 transition-colors" />
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] group-hover/acc:text-zinc-300 transition-colors">Alternative Differentials</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-zinc-500 bg-zinc-900/80 px-2.5 py-1 rounded-lg border border-zinc-800 shadow-inner">
                                {(analysis.differential_diagnoses || []).length}
                            </span>
                            <Lucide.ChevronDown className={`w-4 h-4 text-zinc-700 transition-transform duration-500 ${expanded === 'differentials' ? 'rotate-180' : ''}`} />
                        </div>
                    </button>
                    <AnimatePresence>
                        {expanded === 'differentials' && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-6 border-t border-zinc-800/50 bg-zinc-950 space-y-2">
                                    {(analysis.differential_diagnoses || []).map((d: string, i: number) => (
                                        <div key={i} className="flex items-center gap-4 px-5 py-3 bg-zinc-900/20 rounded-xl border border-zinc-900 hover:border-zinc-800 transition-all group/item">
                                            <div className="w-2 h-2 rounded-full bg-zinc-800 group-hover/item:bg-blue-500/50 transition-colors" />
                                            <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wide group-hover/item:text-zinc-200 transition-colors">{d}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="pt-4 border-t border-zinc-800/30">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-1 px-2 border border-rose-500/20 bg-rose-500/5 rounded">
                            <AlertCircle className="w-3 h-3 text-rose-500" />
                        </div>
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Protocol Recommendation</p>
                    </div>
                </div>
                <div className="px-6 py-4 bg-zinc-950 shadow-inner rounded-2xl border border-zinc-900 relative">
                   <p className="text-[11px] font-black text-rose-500/90 uppercase tracking-widest text-center italic">{analysis.modality_recommendation}</p>
                </div>
            </div>
        </div>
    );
};


const WorkspacePanel = ({ activeCase, setActiveCase, setCases, setBalance, setEarningsHistory, setIsVideoActive, doctor, updateCase }: any) => {
    const [tab, setTab] = useState<'documentation' | 'insights'>('documentation');
    const [expandedSections, setExpandedSections] = useState<string[]>(['observation', 'verdict']);
    const [clinicalFindings, setClinicalFindings] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [prescriptions, setPrescriptions] = useState<{ id: string, drugName: string, dosage: string, frequency: string, duration: string, notes: string }[]>([]);
    const [labs, setLabs] = useState<{ id: string, testName: string, urgency: 'Routine' | 'Urgent' }[]>([]);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [showEvidence, setShowEvidence] = useState(false);

    const toggleSection = (id: string) => {
        setExpandedSections(prev => 
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    useEffect(() => {
        if (activeCase?.aiAnalysis) {
            setClinicalFindings(`AI MORPHOLOGY: ${activeCase.aiAnalysis.morphology}\n\nCLINICAL MARKERS: ${activeCase.aiAnalysis.clinical_markers}\n\nDISTRIBUTION: ${activeCase.aiAnalysis.distribution || 'N/A'}`);
        } else {
            setClinicalFindings("");
        }
        setDiagnosis("");
        setPrescriptions([]);
        setLabs([]);
        setExpandedSections(['observation', 'verdict']);
    }, [activeCase]);

    const addPrescription = () => {
        setPrescriptions([...prescriptions, { 
            id: Math.random().toString(36).substring(7),
            drugName: "", 
            dosage: "", 
            frequency: "",
            duration: "",
            notes: ""
        }]);
    };

    const removePrescription = (id: string) => {
        setPrescriptions(prescriptions.filter(p => p.id !== id));
    };

    const updatePrescription = (id: string, field: string, value: string) => {
        setPrescriptions(prescriptions.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const addLabRequest = () => {
        setLabs([...labs, { id: Math.random().toString(36).substring(7), testName: "", urgency: 'Routine' }]);
    };

    const removeLabRequest = (id: string) => {
        setLabs(labs.filter(l => l.id !== id));
    };

    const updateLabRequest = (id: string, field: string, value: string) => {
        setLabs(labs.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    const handleAcceptReview = async () => {
        if (!activeCase || !diagnosis.trim()) return;
        setIsFinalizing(true);
        try {
            const rxText = prescriptions
                .filter(p => p.drugName.trim())
                .map(p => `${p.drugName} - ${p.dosage} (${p.frequency}) for ${p.duration}. Notes: ${p.notes}`)
                .join('\n');

            const labText = labs
                .filter(l => l.testName.trim())
                .map(l => `[${l.urgency}] ${l.testName}`)
                .join('\n');

            await updateCase(activeCase.id, {
                status: 'completed',
                finalDiagnosis: diagnosis,
                clerkingNotes: clinicalFindings,
                prescriptionText: rxText || "No clinical prescription issued.",
                labRequests: labText || "No investigations requested.",
                assignedToName: doctor.name,
                completedAt: new Date()
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
        <section className="w-full lg:w-[540px] border-l border-zinc-900 flex bg-zinc-950 shrink-0 h-full shadow-2xl z-20 relative overflow-hidden">
            {/* Context Sidebar (Left narrow bar for evidence & quick nav) */}
            <div className="w-16 border-r border-zinc-900 flex flex-col items-center py-6 gap-6 bg-zinc-950/50 z-50">
                <button 
                    onClick={() => setShowEvidence(!showEvidence)}
                    className={`p-3 rounded-xl transition-all ${showEvidence ? 'bg-vitality/20 text-vitality border border-vitality/40' : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white'}`}
                >
                    <Maximize2 className="w-5 h-5" />
                </button>
                <div className="flex-1 flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-800 group relative cursor-pointer" onClick={() => setShowEvidence(true)}>
                        <img src={activeCase.imageURL} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                </div>
                <button onClick={() => setActiveCase(null)} className="p-3 text-zinc-700 hover:text-rose-500 transition-colors">
                    <Lucide.X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 flex flex-col relative">
                {/* Evidence Slide-over */}
                <AnimatePresence>
                    {showEvidence && (
                        <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute inset-0 z-40 bg-zinc-950/80 backdrop-blur-2xl p-8 border-r border-zinc-800 shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Synoptic Evidence View</h4>
                                <button onClick={() => setShowEvidence(false)} className="p-2 text-zinc-500 hover:text-white"><Lucide.ChevronLeft className="w-6 h-6" /></button>
                            </div>
                            <div className="flex-1 rounded-[3rem] overflow-hidden border-4 border-zinc-900 bg-black shadow-inner relative group">
                                <img src={activeCase.imageURL} className="w-full h-full object-contain" />
                                <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 uppercase font-mono">
                                        <p className="text-[8px] text-zinc-500 tracking-widest mb-1">Pixel Precision Sync</p>
                                        <p className="text-[10px] text-white tracking-widest leading-none">Capture: {new Date(activeCase.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Header */}
                <div className="px-6 py-5 border-b border-zinc-900 bg-zinc-950/20 sticky top-0 z-30">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 shadow-inner group overflow-hidden">
                             <div className="absolute inset-0 bg-vitality/5 group-hover:bg-vitality/10 transition-colors" />
                             <UserIcon className="w-6 h-6 relative z-10" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-base font-black text-white uppercase tracking-tighter italic leading-tight">{activeCase.patientName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-black text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 uppercase tracking-widest">{activeCase.patientAge}Y / {activeCase.fitzpatrick_type || 'TX'}</span>
                                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">• {activeCase.patientPhone.slice(-4)}XXXX</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex p-0.5 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
                        {['documentation', 'insights'].map((t) => (
                            <button 
                                key={t}
                                onClick={() => setTab(t as any)} 
                                className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${tab === t ? 'bg-zinc-800 text-white shadow-lg border border-zinc-700' : 'text-zinc-600 hover:text-zinc-300'}`}
                            >
                                {t === 'documentation' ? <FileText className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Viewport content */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4 pb-44">
                    {tab === 'documentation' ? (
                        <div className="space-y-4">
                            {/* Clinical Clerking */}
                            <div className="border border-zinc-900 rounded-[2rem] bg-zinc-900/10 overflow-hidden transition-all duration-500">
                                <button 
                                    onClick={() => toggleSection('observation')}
                                    className="w-full flex items-center justify-between p-6 hover:bg-zinc-900/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-xl bg-blue-500/10">
                                            <Eye className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Clinical Observation</h4>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-zinc-700 transition-transform duration-500 ${expandedSections.includes('observation') ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {expandedSections.includes('observation') && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-6 pt-2">
                                                <div className="relative group">
                                                    <textarea 
                                                        value={clinicalFindings} 
                                                        onChange={(e) => setClinicalFindings(e.target.value)} 
                                                        className="w-full h-32 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 text-[11px] text-zinc-300 outline-none focus:border-zinc-700 focus:bg-zinc-900 transition-all resize-none font-mono uppercase shadow-inner leading-relaxed"
                                                        placeholder="SYNC CLINICAL FINDINGS..." 
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Verdict */}
                            <div className="border border-zinc-900 rounded-[2rem] bg-zinc-900/10 overflow-hidden transition-all duration-500">
                                <button 
                                    onClick={() => toggleSection('verdict')}
                                    className="w-full flex items-center justify-between p-6 hover:bg-zinc-900/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-xl bg-vitality/10">
                                            <Stethoscope className="w-4 h-4 text-vitality" />
                                        </div>
                                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Definitive Diagnosis</h4>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-zinc-700 transition-transform duration-500 ${expandedSections.includes('verdict') ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {expandedSections.includes('verdict') && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-6 pt-2">
                                                <div className="relative group">
                                                    <input 
                                                        value={diagnosis} 
                                                        onChange={(e) => setDiagnosis(e.target.value)} 
                                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-[2rem] px-8 py-5 text-sm font-black uppercase text-vitality outline-none focus:border-vitality shadow-inner italic tracking-tight placeholder:text-zinc-800" 
                                                        placeholder="SPECIFY CLINICAL VERDICT..." 
                                                    />
                                                    <Lucide.Search className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800 pointer-events-none group-focus-within:text-vitality transition-colors" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Pharmacotherapy */}
                            <div className="border border-zinc-900 rounded-[2rem] bg-zinc-900/10 overflow-hidden transition-all duration-500">
                                <button 
                                    onClick={() => toggleSection('rx')}
                                    className="w-full flex items-center justify-between p-6 hover:bg-zinc-900/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-xl bg-amber-500/10">
                                            <Pill className="w-4 h-4 text-amber-500" />
                                        </div>
                                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Pharmacotherapy Orders</h4>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {prescriptions.length > 0 && <span className="text-[8px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full">{prescriptions.length} Orders</span>}
                                        <ChevronDown className={`w-4 h-4 text-zinc-700 transition-transform duration-500 ${expandedSections.includes('rx') ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>
                                <AnimatePresence>
                                    {expandedSections.includes('rx') && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-6 pt-2 space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">Authorization Required per Item</p>
                                                    <button 
                                                        onClick={addPrescription}
                                                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[9px] font-black text-amber-500 uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95 shadow-lg"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                        Issue Rx
                                                    </button>
                                                </div>

                                                <div className="space-y-4">
                                                    <AnimatePresence mode="popLayout">
                                                        {prescriptions.map((p) => (
                                                            <motion.div 
                                                                key={p.id}
                                                                layout
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, scale: 0.95 }}
                                                                className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative"
                                                            >
                                                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/30" />
                                                                <div className="p-5 space-y-4">
                                                                    <div className="flex gap-4">
                                                                        <div className="flex-1 space-y-1">
                                                                            <label className="text-[7px] font-black text-zinc-600 uppercase tracking-widest px-1">Generic / Compound</label>
                                                                            <input 
                                                                                value={p.drugName} 
                                                                                onChange={(e) => updatePrescription(p.id, 'drugName', e.target.value)} 
                                                                                placeholder="IDENTIFY MEDICATION..." 
                                                                                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3.5 text-[11px] font-black uppercase text-white outline-none focus:border-zinc-700 transition-colors shadow-inner" 
                                                                            />
                                                                        </div>
                                                                        <button onClick={() => removePrescription(p.id)} className="mt-7 p-3 text-zinc-700 hover:text-rose-500 hover:bg-zinc-950 rounded-2xl transition-all">
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                    <div className="grid grid-cols-3 gap-3">
                                                                        {[
                                                                            { label: 'Posology', field: 'dosage', color: 'text-amber-500' },
                                                                            { label: 'Frequency', field: 'frequency', color: 'text-emerald-500' },
                                                                            { label: 'Duration', field: 'duration', color: 'text-blue-400' }
                                                                        ].map((cfg) => (
                                                                            <div key={cfg.field} className="space-y-1">
                                                                                <label className="text-[7px] font-black text-zinc-600 uppercase tracking-widest px-1">{cfg.label}</label>
                                                                                <input 
                                                                                    value={(p as any)[cfg.field]} 
                                                                                    onChange={(e) => updatePrescription(p.id, cfg.field, e.target.value)} 
                                                                                    placeholder={`ENTER...`} 
                                                                                    className={`w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-[10px] font-black uppercase ${cfg.color} outline-none focus:border-zinc-700 shadow-inner`} 
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[7px] font-black text-zinc-600 uppercase tracking-widest px-1">Instruction Nodes</label>
                                                                        <input 
                                                                            value={p.notes} 
                                                                            onChange={(e) => updatePrescription(p.id, 'notes', e.target.value)} 
                                                                            placeholder="OPTIONAL ADMINISTRATION PROTOCOL..." 
                                                                            className="w-full bg-transparent border-t border-zinc-800 pt-3 px-1 text-[9px] font-bold text-zinc-500 uppercase tracking-wider outline-none" 
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Diagnostics */}
                            <div className="border border-zinc-900 rounded-[2rem] bg-zinc-900/10 overflow-hidden transition-all duration-500">
                                <button 
                                    onClick={() => toggleSection('labs')}
                                    className="w-full flex items-center justify-between p-6 hover:bg-zinc-900/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-xl bg-blue-500/10">
                                            <FlaskConical className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Diagnostic Protocols</h4>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {labs.length > 0 && <span className="text-[8px] font-black bg-blue-500 text-white px-2 py-0.5 rounded-full">{labs.length} Protocols</span>}
                                        <ChevronDown className={`w-4 h-4 text-zinc-700 transition-transform duration-500 ${expandedSections.includes('labs') ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>
                                <AnimatePresence>
                                    {expandedSections.includes('labs') && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-6 pt-2 space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">Laboratory Analysis Handshake Required</p>
                                                    <button 
                                                        onClick={addLabRequest}
                                                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[9px] font-black text-blue-500 uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95 shadow-lg"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                        Request Lab
                                                    </button>
                                                </div>

                                                <div className="space-y-3">
                                                    <AnimatePresence mode="popLayout">
                                                        {labs.map((l) => (
                                                            <motion.div 
                                                                key={l.id} 
                                                                layout
                                                                initial={{ opacity: 0, y: 5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="group flex items-center gap-4 p-3 bg-zinc-900 rounded-3xl border border-zinc-800 shadow-sm relative overflow-hidden"
                                                            >
                                                                <div className={`w-1.5 h-10 rounded-full ${l.urgency === 'Urgent' ? 'bg-rose-500' : 'bg-blue-500'} ml-1 shadow-lg`} />
                                                                <input 
                                                                    value={l.testName} 
                                                                    onChange={(e) => updateLabRequest(l.id, 'testName', e.target.value)} 
                                                                    placeholder="SPECIFY ANALYSIS PROTOCOL..." 
                                                                    className="flex-1 bg-transparent text-[10px] font-black uppercase text-zinc-200 outline-none placeholder:text-zinc-800 px-2" 
                                                                />
                                                                <select 
                                                                    value={l.urgency} 
                                                                    onChange={(e) => updateLabRequest(l.id, 'urgency', e.target.value)}
                                                                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-[8px] font-black uppercase text-zinc-500 outline-none cursor-pointer"
                                                                >
                                                                    <option value="Routine">Routine</option>
                                                                    <option value="Urgent">Urgent</option>
                                                                </select>
                                                                <button onClick={() => removeLabRequest(l.id)} className="p-2 text-zinc-800 hover:text-rose-500 transition-colors">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
                            <AiAnalysisCard analysis={activeCase.aiAnalysis} />
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Synoptic Evidence Capture</p>
                                </div>
                                <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border-4 border-zinc-900 shadow-2xl relative bg-black group-img-preview overflow-hidden">
                                     <img src={activeCase.imageURL} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-1000" />
                                     <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-gradient-to-t from-black to-transparent pointer-events-none">
                                        <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] text-center">Dermoscopic Node Sync</div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sticky Footer Action */}
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent pt-12 z-40">
                    <div className="bg-zinc-950/50 backdrop-blur-3xl border border-zinc-900 rounded-[2.5rem] p-2.5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
                        <button 
                            onClick={handleAcceptReview} 
                            disabled={isFinalizing || !diagnosis.trim()} 
                            className={`w-full py-6 rounded-[2rem] font-black uppercase text-[12px] tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-xl overflow-hidden group/authorize relative ${isFinalizing || !diagnosis.trim() ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed opacity-50' : 'bg-vitality text-white hover:scale-[1.02] active:scale-95'}`}
                        >
                            {isFinalizing ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span>Syncing Diagnosis...</span>
                                </>
                            ) : (
                                <>
                                    <div className="absolute top-0 left-0 w-full h-1 bg-white/10" />
                                    <ShieldCheck className="w-5 h-5 opacity-80" />
                                    <span>Validate & Authorize</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

const SpecialistHub: React.FC<{doctor: Doctor, onLogout: () => void, onCompleteConsultation: () => void}> = ({ doctor, onLogout }) => {
    const [activeCase, setActiveCase] = useState<any | null>(null);
    const [earningsHistory, setEarningsHistory] = useState<any[]>([]);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [isVideoActive, setIsVideoActive] = useState(false);
    const [balance, setBalance] = useState(doctor.totalEarnings || 0);
    const [sidebarTab, setSidebarTab] = useState<'queue' | 'earnings'>('queue');
    const [delegatingId, setDelegatingId] = useState<string | null>(null);
    const [showDelegationMenu, setShowDelegationMenu] = useState<string | null>(null);
    const [noteModalId, setNoteModalId] = useState<string | null>(null);
    const [currentNote, setCurrentNote] = useState("");
    const [isSavingNote, setIsSavingNote] = useState(false);

    const { data: cases, fetchData: syncCases, addDocument: updateCase, getDocument: getCase } = useFirestore('active_cases');

    const handleSaveNote = async () => {
        if (!noteModalId) return;
        setIsSavingNote(true);
        try {
            await updateCase(noteModalId, {
                quickNote: currentNote
            });
            setNoteModalId(null);
            syncCases();
        } catch (e) {
            console.error("Note sync failure:", e);
        } finally {
            setIsSavingNote(false);
        }
    };

    const openNoteModal = (p: any) => {
        setNoteModalId(p.id);
        setCurrentNote(p.quickNote || "");
    };

    const handleDelegate = async (caseId: string, targetId: string | null) => {
        setDelegatingId(caseId);
        try {
            await updateCase(caseId, {
                targetSpecialistID: targetId || "",
                status: 'pending' // Ensure it remains pending for the next doctor
            });
            setShowDelegationMenu(null);
            syncCases();
        } catch (e) {
            console.error("Delegation protocol failure:", e);
        } finally {
            setDelegatingId(null);
        }
    };

    useEffect(() => {
        syncCases();
        const interval = setInterval(syncCases, 3000); 
        return () => clearInterval(interval);
    }, [doctor.id, syncCases]);

    const handleAcceptHandshake = async (patient: any) => {
        if (claimingId) return;
        setClaimingId(patient.id);
        try {
            const checkData = await getCase(patient.id);
            if (!checkData || checkData.status !== 'pending' || (checkData.specialistID && checkData.specialistID !== doctor.id)) {
                syncCases();
                setClaimingId(null);
                return;
            }

            await updateCase(patient.id, {
                status: 'in-consultation',
                specialistID: doctor.id
            });
            
            setActiveCase({ ...patient, status: 'in-consultation' });
            setIsVideoActive(true);
        } catch (e) { 
            console.error("[HANDSHAKE] Critical Protocol Failure:", e); 
        } finally {
            setClaimingId(null);
        }
    };

    const pendingBalance = earningsHistory.filter((e: any) => e.status === 'pending').reduce((sum: number, e: any) => sum + e.fee, 0);
    const pendingCases = cases.filter((c: any) => c.status === 'pending');

    return (
        <div className="flex h-screen bg-charcoal text-zinc-100 font-sans overflow-hidden">
            {/* LEFT COLUMN: HISTORY & QUEUE */}
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
                         <div className="flex flex-col items-end relative z-10">
                            <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 group-hover:text-vitality transition-colors mb-1">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-[0.2em] leading-none shrink-0">Protocol Wallet</span>
                         </div>
                    </div>
                </div>

                <div className="px-6 pb-4">
                    <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800 shadow-sm">
                        <button onClick={() => setSidebarTab('queue')} className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${sidebarTab === 'queue' ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700' : 'text-zinc-600'}`}>
                            <Activity className="w-3.5 h-3.5" /> Queue {pendingCases.length > 0 && <span className="bg-vitality text-white px-1.5 rounded-md text-[8px] leading-none py-1">{pendingCases.length}</span>}
                        </button>
                        <button onClick={() => setSidebarTab('earnings')} className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${sidebarTab === 'earnings' ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700' : 'text-zinc-600'}`}>
                            <BadgeDollarSign className="w-3.5 h-3.5" /> Earnings {earningsHistory.filter((e: any) => e.status === 'pending').length > 0 && <span className="bg-amber-500 text-white px-1.5 rounded-md text-[8px] leading-none py-1">{earningsHistory.filter((e: any) => e.status === 'pending').length}</span>}
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
                            {pendingCases.length === 0 ? (
                                <div className="py-20 text-center space-y-4 opacity-30">
                                    <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto border border-zinc-800 text-zinc-700">
                                        <HistoryTab className="w-6 h-6" />
                                    </div>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] leading-relaxed">System Standby.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <AnimatePresence>
                                        {pendingCases.map((p) => {
                                            const isDirect = p.targetSpecialistID === doctor.id;
                                        const urgency = p.aiAnalysis?.urgency || 'Low';
                                        const urgencyConfig = {
                                            'High': { color: 'bg-rose-500', label: 'Urgent', bg: 'bg-rose-500/10', text: 'text-rose-500' },
                                            'Medium': { color: 'bg-amber-500', label: 'Review', bg: 'bg-amber-500/10', text: 'text-amber-500' },
                                            'Low': { color: 'bg-emerald-500', label: 'Routine', bg: 'bg-emerald-500/10', text: 'text-emerald-500' }
                                        }[urgency as 'High' | 'Medium' | 'Low'] || { color: 'bg-zinc-500', label: 'Triage', bg: 'bg-zinc-500/10', text: 'text-zinc-500' };

                                        return (
                                        <motion.div 
                                            key={p.id} 
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className={`w-full group relative rounded-[2rem] border transition-all overflow-hidden shadow-sm pt-2 ${
                                              claimingId === p.id 
                                                ? 'bg-zinc-900 border-vitality scale-[0.98]' 
                                                : isDirect 
                                                  ? 'bg-zinc-900/60 border-rose-500/30' 
                                                  : 'bg-zinc-900/30 border-zinc-900 hover:bg-zinc-900 hover:border-zinc-800'
                                            }`}
                                        >
                                            {isDirect && (
                                              <div className="absolute top-4 right-4 z-20">
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-500 rounded border border-rose-400/50 shadow-lg">
                                                    <Target className="w-2 h-2 text-white" />
                                                    <span className="text-[6px] font-black text-white uppercase tracking-widest">Priority</span>
                                                </div>
                                              </div>
                                            )}
                                            <div className="p-5">
                                                <div className="flex gap-4 items-start">
                                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black shrink-0 relative border-2 border-zinc-900 group-hover:border-zinc-800 transition-colors shadow-2xl">
                                                        <img src={p.imageURL} className={`w-full h-full object-cover transition-opacity duration-500 ${claimingId === p.id ? 'opacity-30' : 'opacity-40 group-hover:opacity-100'}`} alt="Scan Preview" />
                                                        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none group-hover:opacity-0 transition-opacity`} />
                                                        <div className={`absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full border-2 border-black z-10 ${urgencyConfig.color}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <div className="flex flex-col">
                                                              <h4 className="text-sm font-black text-white uppercase truncate tracking-tight italic group-hover:text-vitality transition-colors">{p.patientName}</h4>
                                                              <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{p.patientAge}Y</span>
                                                                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                                                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{p.patientPhone.slice(-4)}XXXX</span>
                                                              </div>
                                                            </div>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); openNoteModal(p); }}
                                                                className={`p-2 rounded-lg transition-all shrink-0 ${p.quickNote ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-zinc-900 border border-zinc-800 text-zinc-700 hover:text-zinc-400'}`}
                                                                title={p.quickNote ? "View Quick Note" : "Add Note"}
                                                            >
                                                                <StickyNote className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] border ${urgencyConfig.bg} ${urgencyConfig.text} border-transparent shadow-inner`}>
                                                                <AlertCircle className="w-2.5 h-2.5" />
                                                                <span className="text-[8px] font-black uppercase tracking-widest">{urgencyConfig.label}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* QUICK ACTIONS BAR */}
                                                <div className="mt-6 pt-5 border-t border-zinc-800/40 flex gap-2">
                                                    <button 
                                                        onClick={() => handleAcceptHandshake(p)}
                                                        disabled={claimingId !== null || delegatingId !== null}
                                                        className="flex-1 flex items-center justify-center gap-3 py-3 bg-zinc-950 border border-zinc-800 hover:border-vitality/50 hover:bg-vitality text-zinc-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn shadow-inner"
                                                    >
                                                        {claimingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Video className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />}
                                                        <span>{claimingId === p.id ? 'Connecting...' : 'Quick Session'}</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => setShowDelegationMenu(showDelegationMenu === p.id ? null : p.id)}
                                                        disabled={claimingId !== null || delegatingId !== null}
                                                        className="px-4 flex items-center justify-center bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-700 hover:text-zinc-300 rounded-xl transition-all group/del shadow-inner"
                                                        title="Delegate Case"
                                                    >
                                                        <ArrowRightLeft className="w-4 h-4 group-hover/del:rotate-180 transition-transform duration-700" />
                                                    </button>
                                                </div>

                                                {/* DELEGATION MENU */}
                                                {showDelegationMenu === p.id && (
                                                    <div className="mt-3 p-2 bg-zinc-950 rounded-xl border border-zinc-800 animate-in slide-in-from-top-2 duration-200">
                                                        <p className="text-[7px] font-black text-zinc-600 uppercase tracking-widest mb-2 px-2">Delegate to Practitioner</p>
                                                        <div className="grid grid-cols-1 gap-1">
                                                            <button 
                                                                onClick={() => handleDelegate(p.id, null)}
                                                                className="flex items-center gap-2 p-2 hover:bg-zinc-900 rounded-lg text-left group/opt"
                                                            >
                                                                <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover/opt:bg-blue-500 group-hover/opt:text-white transition-all">
                                                                    <Globe className="w-3 h-3" />
                                                                </div>
                                                                <span className="text-[9px] font-bold text-zinc-300 uppercase">Return to Global Pool</span>
                                                            </button>
                                                            {MOCK_DOCTORS.filter(d => d.id !== doctor.id).map(otherDoc => (
                                                                <button 
                                                                    key={otherDoc.id}
                                                                    onClick={() => handleDelegate(p.id, otherDoc.id)}
                                                                    className="flex items-center gap-2 p-2 hover:bg-zinc-900 rounded-lg text-left group/opt"
                                                                >
                                                                    <img src={otherDoc.image} className="w-6 h-6 rounded-md object-cover grayscale group-hover/opt:grayscale-0 transition-all" alt={otherDoc.name} />
                                                                    <div className="flex-1">
                                                                        <span className="text-[9px] font-bold text-zinc-300 uppercase block leading-none">{otherDoc.name}</span>
                                                                        <span className="text-[7px] text-zinc-600 font-bold uppercase">{otherDoc.specialty}</span>
                                                                    </div>
                                                                    <Share className="w-3 h-3 text-zinc-800 group-hover/opt:text-zinc-400" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            </motion.div>
                                        )})}
                                    </AnimatePresence>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div className="grid grid-cols-2 gap-3 mb-4 px-2">
                                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                                    <p className="text-[7px] font-black text-zinc-500 uppercase tracking-widest mb-1">Settled</p>
                                    <p className="text-sm font-black text-vitality uppercase italic">₵{(balance - pendingBalance).toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/5 rounded-full -mr-6 -mt-6 group-hover:scale-150 transition-transform" />
                                    <p className="text-[7px] font-black text-zinc-500 uppercase tracking-widest mb-1">Pending Payout</p>
                                    <p className="text-sm font-black text-amber-500 uppercase italic">₵{pendingBalance.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-2">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Consultation Log</p>
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
                                    <AnimatePresence>
                                        {earningsHistory.map((item) => (
                                            <motion.div 
                                                key={item.id} 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="w-full p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900 flex items-center gap-4 group hover:border-zinc-800 transition-all"
                                            >
                                            <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 shrink-0 group-hover:text-vitality transition-colors">
                                                <div className="flex flex-col items-center">
                                                    <Check className="w-4 h-4" />
                                                    <span className="text-[6px] font-bold">₵{item.fee}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="text-[10px] font-black text-white uppercase truncate tracking-wider">{item.patientName}</h4>
                                                    <span className="text-[8px] text-zinc-600 font-mono italic">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest truncate max-w-[150px]">{item.diagnosis}</p>
                                                    
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
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
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

            {/* CENTER & RIGHT COLUMNS */}
            {activeCase ? (
                <main className="flex-1 flex overflow-hidden">
                    {/* CENTER COLUMN: IMAGE & AI */}
                    <section className="flex-1 bg-black relative flex flex-col">
                         <div className="absolute top-8 left-8 z-20 bg-black/60 backdrop-blur-md border border-zinc-800 rounded-full px-6 py-2.5 flex items-center gap-4 shadow-2xl">
                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic">Live Clinical Bridge</span>
                        </div>
                        
                        <div className="flex-1 relative">
                            {isVideoActive ? (
                                <iframe 
                                    src={generateConsultationRoom(activeCase.id)} 
                                    allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write" 
                                    className="w-full h-full border-none" 
                                    title="Video Consult" 
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950">
                                    <Loader2 className="w-10 h-10 animate-spin text-zinc-800 mb-6" />
                                </div>
                            )}
                        </div>

                        {/* AI INSIGHTS OVERLAY OR BOTTOM PANEL */}
                        <div className="h-1/3 bg-zinc-950 border-t border-zinc-900 overflow-y-auto p-6">
                            <AiAnalysisCard analysis={activeCase.aiAnalysis} />
                        </div>
                    </section>

                    {/* RIGHT COLUMN: DOCUMENTATION & CALL CONTROLS */}
                    <WorkspacePanel 
                        activeCase={activeCase} 
                        setActiveCase={setActiveCase} 
                        setCases={syncCases} 
                        setBalance={setBalance} 
                        setEarningsHistory={setEarningsHistory}
                        setIsVideoActive={setIsVideoActive} 
                        doctor={doctor}
                        updateCase={updateCase}
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

            {/* QUICK NOTE MODAL */}
            <AnimatePresence>
                {noteModalId && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl"
                        >
                            <div className="p-8 border-b border-zinc-800 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                        <StickyNote className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Quick Note</h4>
                                        <p className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest mt-0.5">Non-Critical Memo</p>
                                    </div>
                                </div>
                                <button onClick={() => setNoteModalId(null)} className="p-2 text-zinc-500 hover:text-zinc-200 transition-colors">
                                    <Lucide.X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-8 space-y-6">
                                <textarea 
                                    value={currentNote}
                                    onChange={(e) => setCurrentNote(e.target.value)}
                                    placeholder="JOT DOWN BRIEF OBSERVATIONS..."
                                    className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-[11px] text-zinc-300 outline-none focus:border-amber-500/30 transition-all resize-none font-mono uppercase shadow-inner leading-relaxed placeholder:text-zinc-800"
                                    autoFocus
                                />
                                <button 
                                    onClick={handleSaveNote}
                                    disabled={isSavingNote}
                                    className="w-full py-4 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isSavingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    {isSavingNote ? 'Syncing...' : 'Save Memo'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SpecialistHub;
