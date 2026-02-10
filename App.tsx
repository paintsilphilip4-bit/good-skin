
import React, { useState, useEffect, useRef } from 'react';
/* Added DashboardPatient to imports from types.ts */
import { User, UserRole, Doctor, ScanResult, Patient, MedicalAnalysis, DashboardPatient, ConsultationHistoryRecord } from './types';
import { MOCK_DOCTORS, DERMATOLOGIST_ADVICE } from './constants';
import ScanView from './components/ScanView';
import Marketplace from './components/Marketplace';
import ProgressTracker from './components/ProgressTracker';
import { analyzeAsDermatologist, generateDailyInsight } from './services/geminiService';
import { 
    Home, Scan, LogOut, Stethoscope, Activity, BookOpen, 
    Users, Share2, Clock, FileText, ChevronRight, X, Sparkles,
    ArrowRight, ChevronLeft, Video, VideoOff, Mic, MicOff, Eye,
    CheckCircle2, Loader2, Brain, ClipboardList, Heart, Shield,
    MessageSquare, AlertTriangle, ShieldCheck, Maximize2, PhoneOff, Signal,
    Save, PenLine, Pill, AlertCircle, History, Calendar, ExternalLink, User as UserIcon,
    Bell, BellRing, Check, Send, PictureInPicture2, Repeat, UserCircle2, Camera, Settings,
    User as UserProfileIcon, MoreVertical, Edit3, Trash2, CalendarDays, ClipboardCheck
} from 'lucide-react';

// --- DOCTOR: NOTIFICATION LOG ---
const NotificationPanel: React.FC<{ 
    notifications: {id: string, text: string, time: string, type: '24h' | '30m'}[], 
    onClose: () => void 
}> = ({ notifications, onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white w-80 h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col relative">
                <header className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Clinical Alerts</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notification Log</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </header>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-8">
                            <Bell className="w-12 h-12 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No active alerts</p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div key={n.id} className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                                <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${n.type === '24h' ? 'bg-teal-100 text-teal-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    <Send className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-700 leading-tight mb-1">{n.text}</p>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{n.time}</span>
                                </div>
                            </div>
                        ))
                    ).reverse()}
                </div>
            </div>
        </div>
    );
};

// --- DOCTOR: APPOINTMENT EDITOR MODAL ---
const AppointmentEditor: React.FC<{ 
    appointment: DashboardPatient; 
    onClose: () => void; 
    onSave: (id: string, updates: Partial<DashboardPatient>) => void;
    onCancel: (id: string) => void;
}> = ({ appointment, onClose, onSave, onCancel }) => {
    const [scheduledTime, setScheduledTime] = useState(
        new Date(appointment.scheduledTime || Date.now()).toISOString().slice(0, 16)
    );
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            onSave(appointment.id, { 
                scheduledTime: new Date(scheduledTime).getTime(),
                remindersSent: { twentyFourHour: false, thirtyMinute: false } // Reset reminders on time change
            });
            setIsSaving(false);
            onClose();
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 relative shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100">
                <header className="mb-8">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Edit Session</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Appointment ID: {appointment.id}</p>
                </header>

                <div className="space-y-6 mb-10">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <img src={appointment.image || appointment.lastScanUrl} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                            <p className="font-black text-slate-900 text-sm">{appointment.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{appointment.age}y • {appointment.gender}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-teal-600 uppercase tracking-widest ml-1">Scheduled Time</label>
                        <input 
                            type="datetime-local" 
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => onCancel(appointment.id)}
                        className="py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition"
                    >
                        Cancel Appt
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-600 transition flex items-center justify-center gap-2"
                    >
                        {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Save Entry
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- PATIENT: WAITING ROOM ---
const WaitingRoom: React.FC<{ onCancel: () => void; doctor: Doctor }> = ({ onCancel, doctor }) => {
    return (
        <div className="flex flex-col h-full bg-slate-50 items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-500 text-center">
            <div className="relative mb-12">
                <div className="w-32 h-32 bg-teal-500/10 rounded-full flex items-center justify-center animate-ping absolute inset-0" />
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl relative border-4 border-teal-500">
                    <Stethoscope className="w-16 h-16 text-teal-600" />
                </div>
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Connecting to Specialist</h2>
            <p className="text-slate-500 font-medium mb-8 max-w-xs">
                Your scan results and clinical data are being synced with <span className="text-teal-600 font-bold">{doctor.name}</span>'s secure portal.
            </p>
            
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 w-full mb-10">
                <div className="flex items-center gap-4 mb-4">
                    <img src={doctor.image} className="w-14 h-14 rounded-2xl object-cover shadow-md" />
                    <div className="text-left">
                        <h4 className="font-black text-slate-900 leading-tight">{doctor.name}</h4>
                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{doctor.specialty}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Queue Position</span>
                    <span className="text-teal-600">#2 in line</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-teal-500 w-2/3 animate-pulse" />
                </div>
            </div>

            <button 
                onClick={onCancel}
                className="text-rose-500 font-black text-[10px] uppercase tracking-[0.3em] hover:text-rose-600 transition"
            >
                Cancel Request
            </button>
        </div>
    );
};

// --- DOCTOR: PATIENT RECORD DETAIL ---
const PatientRecordDetail: React.FC<{ record: ConsultationHistoryRecord; onBack: () => void }> = ({ record, onBack }) => {
    return (
        <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-500">
            <header className="bg-white border-b border-slate-200 p-6 flex justify-between items-center shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-teal-600 transition">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 leading-none tracking-tight">{record.patientName}</h2>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 block">Record ID: {record.id} • {record.date}</span>
                    </div>
                </div>
                <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    Completed
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-32">
                {/* Clinical Findings Summary */}
                <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                        <UserIcon className="w-40 h-40 text-slate-900" />
                    </div>
                    <h3 className="text-[11px] font-black text-teal-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Case Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-8 relative z-10">
                        <div>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Diagnosis</p>
                            <p className="text-lg font-black text-slate-900 tracking-tight">{record.condition}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Severity Score</p>
                            <p className="text-lg font-black text-rose-600 tracking-tight">{record.analysis.severityScore}/10</p>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-50">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">Clinical Notes</p>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{record.notes}"</p>
                    </div>
                </section>

                {/* Imagery & Analysis */}
                <div className="grid grid-cols-1 gap-8">
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                        <h3 className="text-[11px] font-black text-teal-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Eye className="w-4 h-4" /> Examination Media
                        </h3>
                        <div className="rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-2xl">
                            <img src={record.imageUrl} alt="Skin Exam" className="w-full h-80 object-cover" />
                        </div>
                        <div className="mt-6 flex flex-wrap gap-2">
                            {record.analysis.recommendedIngredients.map((ing, i) => (
                                <span key={i} className="px-3 py-1.5 bg-teal-50 text-teal-700 text-[10px] font-black rounded-xl border border-teal-100 uppercase tracking-widest">
                                    {ing}
                                </span>
                            ))}
                        </div>
                    </div>

                    {record.clinicalAnalysis && (
                        <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl shadow-slate-900/20 text-white">
                            <h3 className="text-[11px] font-black text-teal-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Brain className="w-4 h-4" /> Deep Analysis Results
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Pathophysiology</h4>
                                    <p className="text-sm font-medium leading-relaxed text-white/80">{record.clinicalAnalysis.pathophysiology}</p>
                                </div>
                                <div>
                                    <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Treatment Strategy</h4>
                                    <p className="text-sm font-medium leading-relaxed text-white/80">{record.clinicalAnalysis.treatmentPlan}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- DOCTOR: CONSULTATION ROOM ---
const ConsultationRoom: React.FC<{ patient: Patient; onEnd: (record?: ConsultationHistoryRecord) => void }> = ({ patient, onEnd }) => {
    const [view, setView] = useState<'history' | 'exam' | 'video' | 'plan'>('history');
    const [aiAnalysis, setAiAnalysis] = useState<MedicalAnalysis | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [callDuration, setCallDuration] = useState(0);
    const [isSavingHistory, setIsSavingHistory] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [isLocalEnlarged, setIsLocalEnlarged] = useState(false);
    
    // Clerking State
    const [history, setHistory] = useState({
        chiefComplaint: patient.history?.chiefComplaint || '',
        hpc: patient.history?.hpc || '',
        pmh: patient.history?.pmh || '',
        medications: patient.history?.medications || '',
        allergies: patient.history?.allergies || ''
    });

    const videoRef = useRef<HTMLVideoElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        let timer: any;
        if (view === 'video') {
            timer = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [view]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const runMedicalAI = async () => {
        if (!patient.lastScanUrl) return;
        setAnalyzing(true);
        try {
            const response = await fetch(patient.lastScanUrl);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                const result = await analyzeAsDermatologist(base64);
                setAiAnalysis(result);
                setAnalyzing(false);
            };
        } catch (error) {
            console.error(error);
            setAnalyzing(false);
        }
    };

    const toggleVideo = async () => {
        if (!isVideoOn) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (videoRef.current) videoRef.current.srcObject = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
                setIsVideoOn(true);
            } catch (err) {
                alert("Camera access denied");
            }
        } else {
            const stream = videoRef.current?.srcObject as MediaStream;
            stream?.getTracks().forEach(track => track.stop());
            setIsVideoOn(false);
        }
    };

    const handleSaveHistory = () => {
        setIsSavingHistory(true);
        setTimeout(() => {
            setIsSavingHistory(false);
            setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }, 800);
    };

    const finalizeConsultation = () => {
        const historyText = `
CLERKING SUMMARY:
- Chief Complaint: ${history.chiefComplaint}
- HPC: ${history.hpc}
- PMH: ${history.pmh}
- Medications: ${history.medications}
- Allergies: ${history.allergies}

CLINICAL NOTES:
${notes || "Assessment completed."}
        `.trim();

        const record: ConsultationHistoryRecord = {
            id: `REC-${Date.now()}`,
            patientId: patient.id,
            patientName: patient.name,
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            condition: "Consultation Completed", 
            imageUrl: patient.lastScanUrl || '',
            notes: historyText,
            analysis: {
                condition: "Dermatitis",
                severityScore: 3,
                confidence: 94,
                description: "Review required",
                potentialCauses: ["Irritants"],
                recommendedIngredients: ["Ceramides"],
                urgency: "Low",
                tips: []
            },
            clinicalAnalysis: aiAnalysis || undefined
        };
        onEnd(record);
    };

    const toggleNativePiP = async () => {
        if (videoRef.current && 'pictureInPictureEnabled' in document) {
            try {
                if (document.pictureInPictureElement) {
                    await document.exitPictureInPicture();
                } else {
                    await videoRef.current.requestPictureInPicture();
                }
            } catch (error) {
                console.error("PiP failed", error);
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500">
            <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shrink-0 z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => onEnd()} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500 cursor-pointer">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="font-black text-slate-900 leading-none flex items-center gap-2">
                            {patient.name} <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded">ID: {patient.id}</span>
                        </h2>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{patient.age}y • {patient.gender} • LIVE SESSION</span>
                    </div>
                </div>
                <button onClick={finalizeConsultation} className="bg-rose-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition shadow-lg shadow-rose-600/20 cursor-pointer">
                    End Session
                </button>
            </header>

            <div className="flex border-b border-slate-200 bg-white sticky top-0 z-10 overflow-x-auto no-scrollbar">
                <button onClick={() => setView('history')} className={`flex-1 min-w-[100px] py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 cursor-pointer ${view === 'history' ? 'border-teal-600 text-teal-600 bg-teal-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Clerking</button>
                <button onClick={() => setView('exam')} className={`flex-1 min-w-[100px] py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 cursor-pointer ${view === 'exam' ? 'border-teal-600 text-teal-600 bg-teal-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Examination</button>
                <button onClick={() => setView('video')} className={`flex-1 min-w-[100px] py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 cursor-pointer ${view === 'video' ? 'border-teal-600 text-teal-600 bg-teal-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Video Consult</button>
                <button onClick={() => setView('plan')} className={`flex-1 min-w-[100px] py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 cursor-pointer ${view === 'plan' ? 'border-teal-600 text-teal-600 bg-teal-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Plan</button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar relative">
                {view === 'history' && (
                    <div className="p-4 space-y-8 animate-in slide-in-from-left duration-300 pb-12">
                         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                            {/* Simulated Background Graphics */}
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                <ClipboardCheck className="w-48 h-48 text-teal-900" />
                            </div>

                            {/* Section Header */}
                            <div className="flex justify-between items-center mb-8 relative z-10">
                                <div>
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <PenLine className="w-4 h-4 text-teal-600" /> Clinical History Entry
                                    </h3>
                                    {lastSaved && (
                                        <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">
                                            Auto-saved at {lastSaved}
                                        </p>
                                    )}
                                </div>
                                <button 
                                    onClick={handleSaveHistory}
                                    disabled={isSavingHistory}
                                    className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSavingHistory ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                    Save Draft
                                </button>
                            </div>

                            {/* Form Sections */}
                            <div className="space-y-10 relative z-10">
                                
                                {/* Presenting Illness Group */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="w-1 h-4 bg-teal-500 rounded-full" />
                                        <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Subjective Complaints</h4>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <MessageSquare className="w-3 h-3" /> Chief Complaint
                                        </label>
                                        <textarea 
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:outline-none transition-all min-h-[90px] resize-none shadow-inner"
                                            value={history.chiefComplaint}
                                            onChange={(e) => setHistory({...history, chiefComplaint: e.target.value})}
                                            placeholder="What is the primary reason for today's visit?"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Activity className="w-3 h-3" /> History of Present Illness (HPC)
                                        </label>
                                        <textarea 
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:outline-none transition-all min-h-[140px] resize-none shadow-inner"
                                            value={history.hpc}
                                            onChange={(e) => setHistory({...history, hpc: e.target.value})}
                                            placeholder="Duration, location, characteristics, aggravating/relieving factors..."
                                        />
                                    </div>
                                </div>

                                {/* Systemic History Group */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Systemic Review & PMH</h4>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <History className="w-3 h-3" /> Past Medical History (PMH)
                                        </label>
                                        <textarea 
                                            className="w-full p-4 bg-emerald-50/10 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none transition-all min-h-[100px] resize-none shadow-inner"
                                            value={history.pmh}
                                            onChange={(e) => setHistory({...history, pmh: e.target.value})}
                                            placeholder="Chronic conditions, previous surgeries, hospitalizations..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <Pill className="w-3 h-3" /> Current Medications
                                            </label>
                                            <textarea 
                                                className="w-full p-4 bg-emerald-50/10 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none transition-all min-h-[80px] resize-none shadow-inner"
                                                value={history.medications}
                                                onChange={(e) => setHistory({...history, medications: e.target.value})}
                                                placeholder="Prescription and OTC medications..."
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-rose-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <AlertCircle className="w-3 h-3" /> Known Allergies
                                            </label>
                                            <div className="relative">
                                                <textarea 
                                                    className="w-full p-4 bg-rose-50/20 border border-rose-100 rounded-2xl text-sm font-black text-rose-600 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 focus:outline-none transition-all min-h-[80px] resize-none shadow-inner placeholder:text-rose-300"
                                                    value={history.allergies}
                                                    onChange={(e) => setHistory({...history, allergies: e.target.value})}
                                                    placeholder="Latex, Penicillin, Skincare actives..."
                                                />
                                                {history.allergies && (
                                                    <div className="absolute top-4 right-4 animate-pulse">
                                                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div>
                )}
                {view === 'exam' && (
                    <div className="p-4 space-y-6 animate-in slide-in-from-right duration-300 pb-20">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Eye className="w-4 h-4 text-teal-600" /> Clinical Examination
                            </h3>
                            <div className="rounded-[2.5rem] overflow-hidden mb-6 border-4 border-slate-50 shadow-2xl relative group">
                                <img src={patient.lastScanUrl} alt="Patient Skin" className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-[2s]" />
                                <div className="absolute top-4 right-4 px-3 py-1 bg-white/30 backdrop-blur-md rounded-full border border-white/20 text-[8px] font-black text-white uppercase tracking-widest">
                                    Live Image from Scan
                                </div>
                            </div>
                            
                            {!aiAnalysis ? (
                                <button 
                                    onClick={runMedicalAI}
                                    disabled={analyzing}
                                    className="w-full py-5 bg-teal-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-teal-600/30 hover:bg-teal-700 transition transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
                                >
                                    {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                    Medical AI Analysis
                                </button>
                            ) : (
                                <div className="space-y-6 animate-in fade-in duration-700">
                                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                        <h5 className="text-[10px] font-black text-teal-600 uppercase mb-3 tracking-widest flex items-center gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Physical Findings
                                        </h5>
                                        <p className="text-slate-800 text-sm font-bold leading-relaxed italic pr-8">
                                            {aiAnalysis.physicalFindings}
                                        </p>
                                    </div>
                                    <div className="bg-emerald-50/30 p-6 rounded-[2rem] border border-emerald-100 shadow-sm">
                                        <h5 className="text-[10px] font-black text-emerald-600 uppercase mb-3 tracking-widest flex items-center gap-2">
                                            <Brain className="w-3.5 h-3.5" /> Pathophysiology
                                        </h5>
                                        <p className="text-slate-800 text-sm font-bold leading-relaxed pr-8">
                                            {aiAnalysis.pathophysiology}
                                        </p>
                                    </div>
                                    <div className="bg-teal-600 p-6 rounded-[2rem] shadow-xl shadow-teal-600/20">
                                        <h5 className="text-[10px] font-black text-white uppercase mb-3 tracking-widest flex items-center gap-2">
                                            <ClipboardList className="w-3.5 h-3.5" /> Recommended Treatment Plan
                                        </h5>
                                        <p className="text-white text-sm font-bold leading-relaxed pr-8">
                                            {aiAnalysis.treatmentPlan}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {view === 'video' && (
                    <div className="flex flex-col h-full animate-in zoom-in-95 duration-300 bg-slate-900 relative">
                        {/* Video Display Logic (Enlarged vs PiP) */}
                        <div className="flex-1 relative overflow-hidden bg-black">
                             {!isVideoOn ? (
                                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-slate-950/80 backdrop-blur-sm">
                                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-white/20 border border-white/10 shadow-2xl">
                                        <VideoOff className="w-12 h-12" />
                                    </div>
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Encrypted Stream Off</p>
                                    <button 
                                        onClick={toggleVideo}
                                        className="mt-6 px-8 py-3 bg-teal-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition"
                                    >
                                        Initiate Live Video
                                    </button>
                                </div>
                             ) : (
                                <>
                                    {/* Main Feed */}
                                    <video 
                                        ref={isLocalEnlarged ? localVideoRef : videoRef} 
                                        autoPlay 
                                        playsInline 
                                        muted={isLocalEnlarged}
                                        className={`w-full h-full object-cover transition-all duration-700 ${isLocalEnlarged ? 'scale-x-[-1]' : ''}`}
                                    />

                                    {/* Floating PiP Feed */}
                                    <div 
                                        onClick={() => setIsLocalEnlarged(!isLocalEnlarged)}
                                        className="absolute bottom-32 right-6 w-36 h-52 bg-slate-800 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl ring-4 ring-black/20 animate-in slide-in-from-bottom-4 duration-700 cursor-pointer hover:ring-teal-500/50 transition-all z-40 group"
                                    >
                                        <video 
                                            ref={isLocalEnlarged ? videoRef : localVideoRef} 
                                            autoPlay 
                                            playsInline 
                                            muted={!isLocalEnlarged}
                                            className={`w-full h-full object-cover transition-opacity ${!isLocalEnlarged ? 'scale-x-[-1]' : ''}`}
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <Repeat className="text-white w-8 h-8 drop-shadow-lg" />
                                            <span className="text-[8px] font-black text-white uppercase tracking-widest bg-black/40 px-2 py-1 rounded-md">Swap View</span>
                                        </div>
                                        <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-md border border-white/10">
                                            <span className="text-[7px] font-black text-white uppercase tracking-widest">
                                                {isLocalEnlarged ? patient.name : 'You'}
                                            </span>
                                        </div>
                                    </div>
                                </>
                             )}

                             {/* HUD Overlays */}
                             <div className="absolute top-6 left-6 flex items-center gap-3 z-30">
                                <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{formatTime(callDuration)}</span>
                                </div>
                                <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2">
                                    <Signal className="w-3 h-3 text-teal-400" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Stable</span>
                                </div>
                             </div>

                             <div className="absolute top-6 right-6 flex gap-2 z-30">
                                <button 
                                    onClick={toggleNativePiP}
                                    title="Browser PiP"
                                    className="p-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 text-white hover:bg-white/10 transition"
                                >
                                    <PictureInPicture2 className="w-5 h-5" />
                                </button>
                                <button className="p-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 text-white hover:bg-white/10 transition">
                                    <Maximize2 className="w-5 h-5" />
                                </button>
                             </div>

                             {/* Status Label (Main Stream) */}
                             <div className="absolute top-20 left-6 z-30">
                                <div className="px-2 py-1 bg-black/20 backdrop-blur-sm rounded-lg border border-white/5">
                                    <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">
                                        Viewing: {isLocalEnlarged ? 'Self (Doctor)' : patient.name}
                                    </span>
                                </div>
                             </div>

                             {/* Patient Info Bubble */}
                             <div className="absolute bottom-10 left-6 right-6 z-30 pointer-events-none">
                                <div className="bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10 flex items-center justify-between pointer-events-auto">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-teal-500 rounded-2xl flex items-center justify-center text-white font-black text-xs">
                                            {patient.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-black text-sm tracking-tight">{patient.name}</h4>
                                            <p className="text-teal-400 text-[8px] font-black uppercase tracking-widest">Active Caller</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2.5 bg-white/10 rounded-xl text-white hover:bg-white/20 transition">
                                            <MessageSquare className="w-4 h-4" />
                                        </button>
                                        <button className="p-2.5 bg-white/10 rounded-xl text-white hover:bg-white/20 transition">
                                            <Sparkles className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                             </div>
                        </div>

                        {/* Professional Control Bar */}
                        <div className="h-28 bg-black/95 border-t border-white/10 flex items-center justify-center gap-8 relative z-50 shadow-2xl">
                            <button 
                                onClick={() => setIsMicOn(!isMicOn)}
                                className={`group flex flex-col items-center gap-2 transition-all ${isMicOn ? 'text-white/60 hover:text-white' : 'text-rose-500'}`}
                            >
                                <div className={`p-4 rounded-[1.5rem] transition-all border ${isMicOn ? 'bg-white/10 border-white/10 group-hover:bg-white/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                                    {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-widest">{isMicOn ? 'Mute' : 'Unmute'}</span>
                            </button>

                            <button 
                                onClick={finalizeConsultation}
                                className="group flex flex-col items-center gap-2"
                            >
                                <div className="p-5 bg-rose-600 rounded-[2rem] text-white shadow-2xl shadow-rose-600/40 hover:bg-rose-700 hover:scale-110 transition active:scale-90">
                                    <PhoneOff className="w-8 h-8" />
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-rose-500">Hang Up</span>
                            </button>

                            <button 
                                onClick={toggleVideo}
                                className={`group flex flex-col items-center gap-2 transition-all ${isVideoOn ? 'text-white/60 hover:text-white' : 'text-rose-500'}`}
                            >
                                <div className={`p-4 rounded-[1.5rem] transition-all border ${isVideoOn ? 'bg-white/10 border-white/10 group-hover:bg-white/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                                    {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-widest">{isVideoOn ? 'Camera On' : 'Camera Off'}</span>
                            </button>
                        </div>
                    </div>
                )}
                {view === 'plan' && (
                    <div className="p-4 space-y-6 animate-in slide-in-from-right duration-300">
                         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-teal-600" /> Treatment Plan Builder
                            </h3>
                            <div className="space-y-4">
                                <textarea 
                                    placeholder="Enter clinical notes and treatment steps..."
                                    className="w-full h-40 p-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none transition"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                                <button 
                                    onClick={finalizeConsultation}
                                    className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition"
                                >
                                    Finalize & Send to Patient
                                </button>
                            </div>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- DOCTOR: DASHBOARD ---
const DoctorDashboard: React.FC<{ 
    queue: DashboardPatient[];
    history: ConsultationHistoryRecord[];
    notifications: {id: string, text: string, time: string, type: '24h' | '30m'}[];
    profile: Doctor;
    onUpdateProfile: (p: Partial<Doctor>) => void;
    onUpdateAppointment: (id: string, updates: Partial<DashboardPatient>) => void;
    onCancelAppointment: (id: string) => void;
    onStartConsult: (p: Patient) => void; 
    onViewRecord: (r: ConsultationHistoryRecord) => void;
    onLogout: () => void;
}> = ({ queue, history, notifications, profile, onUpdateProfile, onUpdateAppointment, onCancelAppointment, onStartConsult, onViewRecord, onLogout }) => {
    const [activeView, setActiveView] = useState<'dashboard' | 'profile'>('dashboard');
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [localProfile, setLocalProfile] = useState(profile);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [editingApp, setEditingApp] = useState<DashboardPatient | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    
    const liveQueue = queue.filter(p => p.status === 'waiting');
    const scheduledApps = queue.filter(p => p.status === 'scheduled');

    const handleSaveProfile = () => {
        setIsSaving(true);
        setTimeout(() => {
            onUpdateProfile(localProfile);
            setIsSaving(false);
            setActiveView('dashboard');
        }, 1200);
    };

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="p-4 pb-24 space-y-10 h-full overflow-y-auto no-scrollbar animate-in fade-in duration-500 bg-slate-50/50 relative">
            <header className="flex justify-between items-center px-2 pt-2 relative z-[110]">
                <div className="flex items-center gap-3">
                    <img 
                      src="https://github.com/paintsilphilip4-bit/good-skin/blob/main/caricute%20good%20skin.png?raw=true" 
                      alt="Logo" 
                      className="w-12 h-12 rounded-2xl shadow-xl border-4 border-white object-cover cursor-pointer"
                      onClick={() => setActiveView('dashboard')}
                    />
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-0.5">Good Skin</h1>
                        <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest">Specialist Portal</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 relative">
                    <button 
                        onClick={() => setIsNotificationOpen(true)}
                        className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-teal-50 text-teal-600 transition relative"
                    >
                        {notifications.length > 0 ? <BellRing className="w-5 h-5 animate-bounce-subtle" /> : <Bell className="w-5 h-5" />}
                        {notifications.length > 0 && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                        )}
                    </button>
                    
                    {/* Unified User Menu Toggle */}
                    <div className="relative" ref={menuRef}>
                        <button 
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className={`p-1 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition flex items-center gap-2 pr-3 group ${showUserMenu ? 'ring-2 ring-teal-500/20 border-teal-500' : ''}`}
                        >
                            <img src={profile.image} className="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-100" />
                            <MoreVertical className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition" />
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-xl border border-slate-100 rounded-[2rem] shadow-2xl py-3 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[120]">
                                <div className="px-6 py-3 border-b border-slate-50 mb-2">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Account</p>
                                    <p className="text-xs font-black text-slate-900 truncate">{profile.name}</p>
                                </div>
                                <button 
                                    onClick={() => { setShowUserMenu(false); setActiveView('profile'); }}
                                    className="w-full flex items-center gap-3 px-6 py-3 hover:bg-teal-50 text-slate-600 hover:text-teal-600 transition text-left"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Profile Settings</span>
                                </button>
                                <button 
                                    onClick={onLogout}
                                    className="w-full flex items-center gap-3 px-6 py-3 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition text-left"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Log Out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {activeView === 'profile' ? (
                /* Dedicated Profile Settings View (Hidden upon login) */
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                    <div className="flex items-center gap-4 px-2">
                        <button 
                            onClick={() => setActiveView('dashboard')}
                            className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-teal-600 transition"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h3 className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
                            <Settings className="w-4 h-4 text-teal-600" /> Profile Settings
                        </h3>
                    </div>
                    
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                            <PenLine className="w-40 h-40 text-teal-900" />
                        </div>

                        <div className="flex flex-col items-center gap-6 relative z-10">
                            <div className="relative group">
                                <img 
                                    src={localProfile.image} 
                                    className="w-28 h-28 rounded-[2.5rem] object-cover ring-4 ring-slate-50 shadow-2xl transition-all group-hover:opacity-75"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white">
                                        <Camera className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                            <div className="w-full space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-teal-600 uppercase tracking-widest ml-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={localProfile.name} 
                                        onChange={(e) => setLocalProfile({...localProfile, name: e.target.value})}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition"
                                        placeholder="Enter your full clinical name..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-teal-600 uppercase tracking-widest ml-1">Medical Specialty</label>
                                    <input 
                                        type="text" 
                                        value={localProfile.specialty} 
                                        onChange={(e) => setLocalProfile({...localProfile, specialty: e.target.value})}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition"
                                        placeholder="e.g. Pediatric Dermatologist..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-teal-600 uppercase tracking-widest ml-1">Professional Bio</label>
                                    <textarea 
                                        value={localProfile.bio || ''} 
                                        onChange={(e) => setLocalProfile({...localProfile, bio: e.target.value})}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition min-h-[120px] resize-none"
                                        placeholder="Summarize your expertise and experience..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-teal-600 uppercase tracking-widest ml-1">Profile Picture URL</label>
                                    <input 
                                        type="text" 
                                        value={localProfile.image} 
                                        onChange={(e) => setLocalProfile({...localProfile, image: e.target.value})}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition"
                                        placeholder="Paste a direct link to your image..."
                                    />
                                </div>
                                
                                <button 
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                    className="w-full py-5 bg-teal-600 text-white rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-teal-600/30 hover:bg-teal-700 transition flex items-center justify-center gap-3 disabled:opacity-70"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {isSaving ? 'Persisting Changes...' : 'Save Settings'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Main Dashboard View */
                <>
                    {/* Active Queue Section */}
                    <div className="space-y-6">
                        <div className="px-2 flex justify-between items-center">
                            <h3 className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
                                <Users className="w-4 h-4 text-teal-600" /> Live Consult Requests
                            </h3>
                            {liveQueue.length > 0 && (
                                <div className="bg-teal-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                                    Live
                                </div>
                            )}
                        </div>

                        {liveQueue.length === 0 ? (
                            <div className="bg-white p-10 rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center opacity-60">
                                <Clock className="w-8 h-8 text-slate-300 mb-3" />
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No active requests</p>
                            </div>
                        ) : (
                            liveQueue.map((p, idx) => (
                                <div key={p.id} className="bg-white p-6 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 animate-in slide-in-from-right duration-500">
                                    <div className="flex items-center gap-5">
                                        <div className="relative">
                                            <img src={p.lastScanUrl || p.image} className="w-16 h-16 rounded-[1.5rem] object-cover shadow-lg border-2 border-white" />
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-teal-600 rounded-full border-2 border-white flex items-center justify-center">
                                                <span className="text-[8px] font-black text-white">#{idx + 1}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-slate-900 text-lg tracking-tight leading-none mb-1">{p.name}</h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {p.age}y • {p.gender}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => onStartConsult(p)}
                                            className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-teal-600 transition transform active:scale-95"
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Scheduled Appointments Section */}
                    <div className="space-y-6">
                        <div className="px-2">
                            <h3 className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-amber-600" /> Scheduled Appointments
                            </h3>
                        </div>

                        {scheduledApps.length === 0 ? (
                            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center text-center opacity-60 shadow-sm">
                                <Calendar className="w-8 h-8 text-slate-200 mb-3" />
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No upcoming sessions</p>
                            </div>
                        ) : (
                            scheduledApps.map((p) => (
                                <div key={p.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm relative group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="relative">
                                            <img src={p.image || "https://picsum.photos/seed/p/100/100"} className="w-12 h-12 rounded-xl object-cover" />
                                            <button 
                                                onClick={() => setEditingApp(p)}
                                                className="absolute -top-1 -right-1 p-1 bg-white border border-slate-200 rounded-lg shadow-md text-slate-400 hover:text-teal-600 transition opacity-0 group-hover:opacity-100"
                                            >
                                                <Edit3 className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-slate-900 leading-none">{p.name}</h4>
                                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-1 block">
                                                {new Date(p.scheduledTime!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {new Date(p.scheduledTime!).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => onStartConsult(p)}
                                            className="p-3 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-600 hover:text-white transition shadow-sm"
                                        >
                                            <PhoneOff className="w-4 h-4 rotate-180" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Reminders</span>
                                            <div className="flex gap-2">
                                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest ${p.remindersSent?.twentyFourHour ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                    {p.remindersSent?.twentyFourHour && <Check className="w-2 h-2" />} 24h
                                                </div>
                                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest ${p.remindersSent?.thirtyMinute ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                    {p.remindersSent?.thirtyMinute && <Check className="w-2 h-2" />} 30m
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => onCancelAppointment(p.id)}
                                            className="p-2 text-rose-300 hover:text-rose-500 transition"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Consultation History Section */}
                    <div className="space-y-6">
                        <div className="px-2">
                            <h3 className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
                                <History className="w-4 h-4 text-emerald-600" /> Consultation History
                            </h3>
                        </div>

                        {history.length === 0 ? (
                            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center text-center opacity-60">
                                <Calendar className="w-8 h-8 text-slate-200 mb-3" />
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">History is empty</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {history.map((record) => (
                                    <button 
                                        key={record.id} 
                                        onClick={() => onViewRecord(record)}
                                        className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition flex items-center gap-4 group text-left"
                                    >
                                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-black text-slate-900 leading-none">{record.patientName}</h4>
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{record.date}</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{record.condition}</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {isNotificationOpen && (
                <NotificationPanel 
                    notifications={notifications} 
                    onClose={() => setIsNotificationOpen(false)} 
                />
            )}

            {editingApp && (
                <AppointmentEditor 
                    appointment={editingApp} 
                    onClose={() => setEditingApp(null)}
                    onSave={onUpdateAppointment}
                    onCancel={(id) => {
                        onCancelAppointment(id);
                        setEditingApp(null);
                    }}
                />
            )}
        </div>
    );
};

// --- AUTH SCREEN ---
const AuthScreen: React.FC<{ onLogin: (role: UserRole) => void }> = ({ onLogin }) => {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-teal-100/50 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl opacity-50" />

            <div className="w-full max-sm z-10">
                <div className="flex flex-col items-center mb-16">
                    <img 
                      src="https://github.com/paintsilphilip4-bit/good-skin/blob/main/caricute%20good%20skin.png?raw=true" 
                      alt="Good Skin Logo" 
                      className="w-24 h-24 rounded-[2.5rem] shadow-2xl shadow-teal-600/30 mb-8 border-4 border-white rotate-3 object-cover"
                    />
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Good Skin</h1>
                    <p className="text-slate-400 font-black text-[10px] text-center uppercase tracking-[0.4em]">Precision Dermatology</p>
                </div>

                <div className="space-y-5">
                    <button 
                        onClick={() => onLogin('client')}
                        className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition transform active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        Patient Access <ArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => onLogin('doctor')}
                        className="w-full bg-white border-2 border-slate-100 text-slate-900 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:border-teal-500 hover:text-teal-600 transition transform active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        Specialist Login
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- CLIENT HOME ---
const ClientHome: React.FC<{ 
    user: User; 
    onNavigate: (tab: string) => void; 
    onLogout: () => void;
    onShare: () => void;
    advice: any;
    isLoadingAdvice: boolean;
    pendingDoctor?: Doctor;
  }> = ({ user, onNavigate, onLogout, onShare, advice, isLoadingAdvice, pendingDoctor }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    
    const slides = [
      {
        type: 'ai',
        title: advice?.title || "AI Optimizing...",
        content: advice?.shortTip || "Syncing with your bio-data...",
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80",
        tag: "Live AI Insight",
        icon: <Sparkles className="w-3 h-3 text-teal-300 animate-pulse" />
      },
      ...DERMATOLOGIST_ADVICE.slice(0, 3).map((tip, idx) => ({
        type: 'education',
        title: tip.title,
        content: tip.text,
        image: tip.image,
        tag: "Derm Education",
        icon: <BookOpen className="w-3 h-3 text-emerald-300" />
      }))
    ];

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(timer);
    }, [slides.length]);

    return (
      <div className="p-4 pb-24 space-y-10 animate-in fade-in duration-500 h-full overflow-y-auto no-scrollbar">
          <header className="flex justify-between items-center px-1">
              <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">Hi, {user.name.split(' ')[0]}</h1>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Health Dashboard</p>
              </div>
              <div className="flex gap-3">
                  <button onClick={onShare} className="p-3 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[1.2rem] hover:bg-slate-50 transition text-teal-600">
                      <Share2 className="w-5 h-5" />
                  </button>
                  <button onClick={onLogout} className="p-3 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[1.2rem] hover:bg-slate-50 transition text-slate-400">
                      <LogOut className="w-5 h-5" />
                  </button>
              </div>
          </header>

          {/* Special Urgent Action Card if waiting */}
          {pendingDoctor && (
              <button 
                onClick={() => onNavigate('waiting_room')}
                className="w-full bg-teal-600 p-6 rounded-[2.5rem] shadow-2xl shadow-teal-600/30 flex items-center justify-between group animate-bounce-subtle"
              >
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                          <Stethoscope className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                          <h4 className="text-white font-black text-sm uppercase tracking-widest">Session Pending</h4>
                          <p className="text-teal-100 text-[10px] font-bold">Waiting for {pendingDoctor.name}</p>
                      </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
              </button>
          )}
  
          <div className="relative group h-[22rem]">
            <div className="w-full h-full overflow-hidden rounded-[3rem] shadow-2xl shadow-teal-900/10 border-4 border-white relative bg-slate-900 transition-all duration-700">
              {slides.map((slide, idx) => (
                <div 
                  key={idx}
                  className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-out transform ${idx === currentSlide ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-110 translate-x-10 pointer-events-none'}`}
                >
                  <img src={slide.image} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
                  
                  <div className="relative h-full z-10 p-10 flex flex-col justify-end">
                      <div className="flex items-center gap-2 mb-6">
                          <div className={`px-4 py-1.5 backdrop-blur-xl rounded-full border border-white/20 flex items-center gap-2 transition-all duration-500 ${slide.type === 'ai' ? 'bg-teal-500/30' : 'bg-emerald-500/30'}`}>
                              {slide.icon}
                              <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">{slide.tag}</span>
                          </div>
                      </div>
                      
                      <div className={`transition-all duration-700 delay-300 ${idx === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <h2 className="text-white text-4xl font-black mb-3 leading-tight tracking-tighter drop-shadow-lg">{slide.title}</h2>
                        <p className="text-white/80 text-base font-medium leading-relaxed line-clamp-2 pr-6 mb-8">{slide.content}</p>
                      </div>
                      
                      <button 
                        onClick={() => slide.type === 'ai' ? onNavigate('advice_modal') : {}}
                        className="w-max flex items-center gap-2 text-white/50 text-[10px] font-black uppercase tracking-widest hover:text-white transition group/btn"
                      >
                          Learn More <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {slides.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 transition-all duration-500 rounded-full ${idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/30'}`} 
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
              <button onClick={() => onNavigate('scan')} className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-900/20 border-4 border-white flex flex-col items-center gap-6 hover:bg-slate-800 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-teal-400 group-hover:scale-110 transition duration-300">
                      <Scan className="w-8 h-8" />
                  </div>
                  <span className="font-black text-white text-[10px] uppercase tracking-widest text-center leading-tight">Precision<br/>Skin Scan</span>
              </button>
              <button onClick={() => onNavigate('marketplace')} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col items-center gap-6 hover:border-teal-500 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition duration-300">
                      <Stethoscope className="w-8 h-8" />
                  </div>
                  <span className="font-black text-slate-900 text-[10px] uppercase tracking-widest text-center leading-tight">Talk to a<br/>Specialist</span>
              </button>
          </div>

          <div className="pb-8 text-center">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Secure Clinical Workspace</p>
          </div>
      </div>
    );
  };

const AdviceModal: React.FC<{ isOpen: boolean; onClose: () => void; advice: any }> = ({ isOpen, onClose, advice }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-2xl" onClick={onClose} />
            <div className="bg-white w-full max-w-sm rounded-[3.5rem] overflow-hidden relative shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border-4 border-white">
                <button onClick={onClose} className="absolute top-8 right-8 z-30 p-3 bg-black/10 backdrop-blur-xl rounded-full text-slate-900 hover:bg-slate-100 transition border border-slate-200">
                    <X className="w-5 h-5" />
                </button>
                
                <div className="p-10 bg-white">
                    <div className="w-20 h-1.5 bg-slate-100 rounded-full mx-auto mb-10" />
                    <div className="flex items-center gap-2 mb-6 text-teal-600">
                        <div className="p-2 bg-teal-50 rounded-xl">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI Clinical Insight</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-6 leading-tight tracking-tighter">{advice?.title}</h2>
                    
                    <div className="space-y-6 mb-10">
                        <div className="bg-teal-50/50 p-6 rounded-[2rem] border border-teal-100">
                            <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-2">The Tip</h4>
                            <p className="text-teal-900 font-bold leading-relaxed">{advice?.shortTip}</p>
                        </div>
                        
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Context</h4>
                            <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                {advice?.detailedExplanation}
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={onClose}
                        className="w-full bg-slate-900 text-white py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition transform active:scale-[0.98]"
                    >
                        Understood
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP ---
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [aiAdvice, setAiAdvice] = useState<any>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  
  // Bridge & Clinical State
  const [activeConsultation, setActiveConsultation] = useState<Patient | null>(null);
  const [patientsQueue, setPatientsQueue] = useState<DashboardPatient[]>([
      {
          id: 'P-99',
          name: 'Jane Doe',
          age: 32,
          gender: 'Female',
          status: 'scheduled',
          requestTime: Date.now(),
          scheduledTime: Date.now() + 1000 * 60 * 45, // 45 mins from now
          image: "https://picsum.photos/seed/jane/100/100",
          remindersSent: { twentyFourHour: true, thirtyMinute: false }
      }
  ]);
  const [consultHistory, setConsultHistory] = useState<ConsultationHistoryRecord[]>([]);
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<ConsultationHistoryRecord | null>(null);
  const [pendingDoctor, setPendingDoctor] = useState<Doctor | undefined>(undefined);
  const [isAdviceModalOpen, setIsAdviceModalOpen] = useState(false);
  
  // Doctor Profile Management
  const [doctorProfile, setDoctorProfile] = useState<Doctor>(MOCK_DOCTORS[0]);

  // Notification System State
  const [notifications, setNotifications] = useState<{id: string, text: string, time: string, type: '24h' | '30m'}[]>([]);

  useEffect(() => {
    if (user?.role === 'client') {
      fetchAdvice();
    }
  }, [user]);

  // Automated Notification Logic (Simulation Backend)
  useEffect(() => {
    if (user?.role !== 'doctor') return;

    const checkReminders = () => {
        const now = Date.now();
        setPatientsQueue(prevQueue => {
            let updated = false;
            const newQueue = prevQueue.map(p => {
                if (p.status !== 'scheduled' || !p.scheduledTime) return p;

                const timeToApp = p.scheduledTime - now;
                const newReminders = { ...p.remindersSent } || { twentyFourHour: false, thirtyMinute: false };
                let reminderTriggered = false;
                let reminderType: '24h' | '30m' | null = null;

                // 24 Hour Logic
                if (timeToApp <= 24 * 60 * 60 * 1000 && timeToApp > 0 && !newReminders.twentyFourHour) {
                    newReminders.twentyFourHour = true;
                    reminderTriggered = true;
                    reminderType = '24h';
                }

                // 30 Minute Logic
                if (timeToApp <= 30 * 60 * 1000 && timeToApp > 0 && !newReminders.thirtyMinute) {
                    newReminders.thirtyMinute = true;
                    reminderTriggered = true;
                    reminderType = '30m';
                }

                if (reminderTriggered) {
                    updated = true;
                    const alertText = reminderType === '24h' 
                        ? `24-hour reminder sent to ${p.name}` 
                        : `30-minute immediate alert sent to ${p.name}`;
                    
                    setNotifications(prev => [...prev, {
                        id: Math.random().toString(),
                        text: alertText,
                        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                        type: reminderType!
                    }]);
                    
                    return { ...p, remindersSent: newReminders };
                }
                return p;
            });
            return updated ? newQueue : prevQueue;
        });
    };

    const interval = setInterval(checkReminders, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [user]);

  const fetchAdvice = async () => {
    setIsLoadingAdvice(true);
    const insight = await generateDailyInsight();
    setAiAdvice(insight);
    setIsLoadingAdvice(false);
  };

  const handleLogin = (role: UserRole) => {
    setUser({
        id: role === 'client' ? 'P-770' : 'DOC-01',
        name: role === 'client' ? 'Alex Johnson' : doctorProfile.name,
        email: 'user@test.com',
        role: role
    });
    setActiveTab('home');
  };

  // Backend Simulation Functions for Scheduled Appointments
  const handleUpdateAppointment = (id: string, updates: Partial<DashboardPatient>) => {
    setPatientsQueue(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleCancelAppointment = (id: string) => {
    setPatientsQueue(prev => prev.filter(p => p.id !== id));
  };

  // Bridge Logic
  const handleConsultRequest = (doctor: Doctor, scanResult: ScanResult) => {
    if (!user) return;
    
    const newRequest: DashboardPatient = {
        id: user.id,
        name: user.name,
        age: 28,
        gender: 'Male',
        lastScanUrl: scanResult.imageUrl,
        status: 'waiting',
        requestTime: Date.now(),
        history: {
            chiefComplaint: `Scan showing possible ${scanResult.analysis.condition}`,
            hpc: "Recent flare up observed.",
            pmh: "No prior issues.",
            medications: "OTC moisturizer only.",
            allergies: "None."
        }
    };
    
    setPatientsQueue(prev => [...prev, newRequest]);
    setPendingDoctor(doctor);
    setActiveTab('waiting_room');
  };

  const handleEndConsultation = (record?: ConsultationHistoryRecord) => {
      if (record) {
          setConsultHistory(prev => [record, ...prev]);
      }
      setActiveConsultation(null);
  };

  if (!user) return <AuthScreen onLogin={handleLogin} />;

  const renderClientContent = () => {
      const goHome = () => setActiveTab('home');
      switch(activeTab) {
          case 'home': return (
            <ClientHome 
                user={user!} 
                onNavigate={(tab) => tab === 'advice_modal' ? setIsAdviceModalOpen(true) : setActiveTab(tab)} 
                onLogout={() => setUser(null)} 
                onShare={() => {}} 
                advice={aiAdvice}
                isLoadingAdvice={isLoadingAdvice}
                pendingDoctor={pendingDoctor}
            />
          );
          case 'scan': return (
            <ScanView 
                onScanComplete={() => {}} 
                onConsult={(doctor, result) => handleConsultRequest(doctor, result!)} 
                onBack={goHome} 
            />
          );
          case 'waiting_room': return (
            <WaitingRoom 
                doctor={pendingDoctor || MOCK_DOCTORS[0]} 
                onCancel={() => {
                    setPatientsQueue(prev => prev.filter(req => req.id !== user.id));
                    setPendingDoctor(undefined);
                    setActiveTab('home');
                }} 
            />
          );
          case 'progress': return <ProgressTracker onBack={goHome} />;
          case 'marketplace': return <Marketplace onBook={() => {}} onBack={goHome} />;
          default: return <ClientHome user={user!} onNavigate={setActiveTab} onLogout={() => setUser(null)} onShare={() => {}} advice={aiAdvice} isLoadingAdvice={isLoadingAdvice} />;
      }
  };

  const renderDoctorContent = () => {
    if (selectedHistoryRecord) {
        return <PatientRecordDetail record={selectedHistoryRecord} onBack={() => setSelectedHistoryRecord(null)} />;
    }
    return (
        <DoctorDashboard 
            queue={patientsQueue} 
            history={consultHistory}
            notifications={notifications}
            profile={doctorProfile}
            onUpdateProfile={(p) => setDoctorProfile({...doctorProfile, ...p})}
            onUpdateAppointment={handleUpdateAppointment}
            onCancelAppointment={handleCancelAppointment}
            onStartConsult={(p) => {
                setPatientsQueue(prev => prev.filter(req => req.id !== p.id));
                setActiveConsultation(p);
            }} 
            onViewRecord={(r) => setSelectedHistoryRecord(r)}
            onLogout={() => setUser(null)} 
        />
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center overflow-hidden">
        <main className="w-full max-w-md h-screen bg-slate-50 shadow-2xl relative flex flex-col border-x border-slate-100">
            <div className="flex-1 overflow-hidden">
                {activeConsultation ? (
                    <ConsultationRoom patient={activeConsultation} onEnd={handleEndConsultation} />
                ) : (
                    user.role === 'client' ? renderClientContent() : renderDoctorContent()
                )}
            </div>
            
            {!activeConsultation && activeTab !== 'waiting_room' && !selectedHistoryRecord && (
                <nav className="shrink-0 bg-white border-t border-slate-100 px-10 py-5 flex justify-between items-center z-50">
                    <button onClick={() => setActiveTab('home')} className={`transition-all duration-300 ${activeTab === 'home' ? 'text-teal-600 scale-110' : 'text-slate-300'}`}>
                        <Home className="w-6 h-6" />
                    </button>
                    <button onClick={() => setActiveTab('scan')} className={`w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center -mt-12 shadow-2xl border-4 border-slate-50 text-white transform hover:scale-105 transition-all duration-300 ${activeTab === 'scan' ? 'bg-slate-900 rotate-90' : 'hover:rotate-12'}`}>
                        <Scan className="w-7 h-7" />
                    </button>
                    <button onClick={() => setActiveTab('progress')} className={`transition-all duration-300 ${activeTab === 'progress' ? 'text-teal-600 scale-110' : 'text-slate-300'}`}>
                        <Activity className="w-6 h-6" />
                    </button>
                </nav>
            )}

            <AdviceModal 
              isOpen={isAdviceModalOpen} 
              onClose={() => setIsAdviceModalOpen(false)} 
              advice={aiAdvice} 
            />
        </main>
    </div>
  );
};

export default App;
