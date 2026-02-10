
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, Doctor, ScanResult, Patient, MedicalAnalysis } from './types';
import { MOCK_DOCTORS, EDUCATION_ARTICLES, SKINCARE_ROUTINE_TIPS, CLIENT_TESTIMONIALS, DERMATOLOGIST_ADVICE, AdviceItem } from './constants';
import ScanView from './components/ScanView';
import Marketplace from './components/Marketplace';
import ProgressTracker from './components/ProgressTracker';
import { analyzeAsDermatologist } from './services/geminiService';
import { 
    Home, Scan, Calendar, User as UserIcon, LogOut, Stethoscope, Activity, BookOpen, DollarSign,
    Users, Quote, Share2, Clock, FileText, ChevronRight, Leaf, Zap, Info, X, Sparkles,
    ArrowRight, FolderCheck, ChevronLeft, Video, VideoOff, Mic, MicOff, Send, ClipboardList, Eye,
    AlertCircle, Save, PenLine, UserSearch, Plus, Trash2, Upload, FileCheck, ShieldCheck, Settings,
    RefreshCw, ChevronDown, Camera, Briefcase, MapPin, Award, CheckCircle2, Loader2, Microscope, Brain, History,
    Search, Filter, ExternalLink, CalendarDays, Bell, Mail, MessageSquare
} from 'lucide-react';

// --- CLINICAL ARCHIVE TYPES & DATA ---
interface HistoricalConsult {
    id: string;
    date: string;
    time: string;
    type: 'Video' | 'AI Review' | 'In-Person';
    diagnosis: string;
    notes: MedicalAnalysis;
}

interface PatientRecord {
    id: string;
    name: string;
    age: number;
    gender: string;
    image: string;
    consults: HistoricalConsult[];
}

const PATIENT_RECORDS: PatientRecord[] = [
    {
        id: 'P-9902',
        name: 'Sarah Miller',
        age: 32,
        gender: 'Female',
        image: 'https://picsum.photos/seed/sarahm/200/200',
        consults: [
            {
                id: 'C-1002',
                date: 'Oct 24, 2023',
                time: '14:30 PM',
                type: 'Video',
                diagnosis: 'Severe Atopic Dermatitis',
                notes: {
                    physicalFindings: 'Large erythematous plaques with significant lichenification observed on the antecubital and popliteal fossae. Active weeping in some areas.',
                    pathophysiology: 'Defective filaggrin production leading to impaired skin barrier function and subsequent Th2-mediated inflammatory response.',
                    treatmentPlan: 'Initiated Dupilumab 300mg Q2W after loading dose. Continued topical tacrolimus 0.1% for flare-ups. Patch testing scheduled for next month.'
                }
            },
            {
                id: 'C-1001',
                date: 'Aug 12, 2023',
                time: '10:15 AM',
                type: 'AI Review',
                diagnosis: 'Contact Dermatitis',
                notes: {
                    physicalFindings: 'Localized cluster of vesicles and papules on a red base on the dorsal left wrist, following a linear pattern.',
                    pathophysiology: 'Type IV delayed-type hypersensitivity reaction, likely secondary to nickel exposure from jewelry.',
                    treatmentPlan: 'Discontinue use of metallic wristbands. Apply Mometasone furoate 0.1% cream daily for 7 days.'
                }
            }
        ]
    },
    {
        id: 'P-9905',
        name: 'Robert Vance',
        age: 45,
        gender: 'Male',
        image: 'https://picsum.photos/seed/robertv/200/200',
        consults: [
            {
                id: 'C-1005',
                date: 'Oct 22, 2023',
                time: '09:00 AM',
                type: 'In-Person',
                diagnosis: 'Seborrheic Keratosis',
                notes: {
                    physicalFindings: 'Multiple well-circumscribed, "stuck-on" appearing hyperpigmented plaques on the upper back. Verrucous surface with comedo-like openings.',
                    pathophysiology: 'Benign proliferation of cutaneous basaloid cells. No evidence of cellular atypia or malignancy.',
                    treatmentPlan: 'Reassurance provided. Cryotherapy performed on the two largest lesions for cosmetic purposes. Patient to monitor for changes.'
                }
            }
        ]
    },
    {
        id: 'P-9908',
        name: 'Maya Singh',
        age: 27,
        gender: 'Female',
        image: 'https://picsum.photos/seed/mayas/200/200',
        consults: [
            {
                id: 'C-1008',
                date: 'Oct 20, 2023',
                time: '16:45 PM',
                type: 'Video',
                diagnosis: 'Rosacea Flare-up',
                notes: {
                    physicalFindings: 'Central facial erythema with telangiectasia. Multiple inflammatory papules and few pustules on cheeks and nose. Ocular involvement absent.',
                    pathophysiology: 'Innate immune system dysregulation (LL-37 expression) combined with neurovascular hyperreactivity.',
                    treatmentPlan: 'Ivermectin 1% cream daily at night. Avoidance of spicy foods and high-intensity sunlight. Soolantra prescription issued.'
                }
            }
        ]
    }
];

// Extend Patient with appointment info for the Dashboard notifications
interface DashboardPatient extends Patient {
    nextAppointment?: string;
    remindersSent: {
        h24: boolean;
        m30: boolean;
    };
}

const MOCK_PATIENTS: DashboardPatient[] = [
    { 
        id: 'P101', 
        name: 'James Carter', 
        age: 28, 
        gender: 'Male',
        lastScanUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80',
        nextAppointment: 'Today, 14:00 PM',
        remindersSent: { h24: true, m30: false },
        history: {
            chiefComplaint: 'Itchy rash on the left forearm',
            hpc: 'Started 3 days ago after gardening. Red, bumpy, and intensely pruritic.',
            pmh: 'Childhood eczema, Hayfever',
            medications: 'None',
            allergies: 'Latex'
        }
    },
    { 
        id: 'P102', 
        name: 'Elena Gilbert', 
        age: 24, 
        gender: 'Female',
        lastScanUrl: 'https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&q=80',
        nextAppointment: 'Tomorrow, 09:30 AM',
        remindersSent: { h24: false, m30: false },
        history: {
            chiefComplaint: 'Sudden breakout on cheeks',
            hpc: 'Persistent inflammatory lesions for 2 weeks. Painful to touch.',
            pmh: 'None',
            medications: 'Occasional ibuprofen',
            allergies: 'Penicillin'
        }
    }
];

interface PrescriptionItem {
  id: string;
  drug: string;
  strength: string;
  frequency: string;
  duration: string;
  instructions: string;
}

// --- DOCTOR: CONSULTATION ROOM ---
const ConsultationRoom: React.FC<{ patient: Patient; onEnd: () => void }> = ({ patient, onEnd }) => {
    const [view, setView] = useState<'history' | 'exam' | 'video' | 'plan'>('history');
    const [aiAnalysis, setAiAnalysis] = useState<MedicalAnalysis | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [prescription, setPrescription] = useState<PrescriptionItem[]>([]);
    const [isPlanSaving, setIsPlanSaving] = useState(false);
    const [uploadedPrescription, setUploadedPrescription] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [clerkData, setClerkData] = useState({
        chiefComplaint: patient.history?.chiefComplaint || '',
        hpc: patient.history?.hpc || '',
        pmh: patient.history?.pmh || '',
        meds: patient.history?.medications || '',
        allergies: patient.history?.allergies || '',
        familySocial: '',
        examNotes: ''
    });

    const handleClerkChange = (field: string, value: string) => {
        setClerkData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveClerking = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert("Clinical notes synchronized to EMR.");
        }, 800);
    };

    const addMedication = () => {
        const newItem: PrescriptionItem = {
            id: Date.now().toString(),
            drug: '',
            strength: '',
            frequency: '',
            duration: '',
            instructions: ''
        };
        setPrescription([...prescription, newItem]);
    };

    const updateMedication = (id: string, field: keyof PrescriptionItem, value: string) => {
        setPrescription(prescription.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const removeMedication = (id: string) => {
        setPrescription(prescription.filter(item => item.id !== id));
    };

    const handleFinalizePlan = () => {
        setIsPlanSaving(true);
        setTimeout(() => {
            setIsPlanSaving(false);
            alert("Treatment plan finalized. Patient notified.");
        }, 1200);
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

    return (
        <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500">
            <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shrink-0 z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={onEnd} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500 cursor-pointer">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="font-black text-slate-900 leading-none flex items-center gap-2">
                            {patient.name} <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded">ID: {patient.id}</span>
                        </h2>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{patient.age}y • {patient.gender} • In Consult</span>
                    </div>
                </div>
                <button onClick={onEnd} className="bg-rose-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition shadow-lg shadow-rose-600/20 cursor-pointer">
                    End Session
                </button>
            </header>

            <div className="flex border-b border-slate-200 bg-white sticky top-0 z-10 overflow-x-auto no-scrollbar">
                <button onClick={() => setView('history')} className={`flex-1 min-w-[100px] py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 cursor-pointer ${view === 'history' ? 'border-teal-600 text-teal-600 bg-teal-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Clerking</button>
                <button onClick={() => setView('exam')} className={`flex-1 min-w-[100px] py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 cursor-pointer ${view === 'exam' ? 'border-teal-600 text-teal-600 bg-teal-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Examination</button>
                <button onClick={() => setView('video')} className={`flex-1 min-w-[100px] py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 cursor-pointer ${view === 'video' ? 'border-teal-600 text-teal-600 bg-teal-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Video Consult</button>
                <button onClick={() => setView('plan')} className={`flex-1 min-w-[100px] py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 cursor-pointer ${view === 'plan' ? 'border-teal-600 text-teal-600 bg-teal-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Plan</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                {view === 'history' && (
                    <div className="space-y-6 animate-in slide-in-from-left duration-300 pb-10">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-teal-600" /> Patient Clerking
                                </h3>
                                <button 
                                    onClick={handleSaveClerking}
                                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition cursor-pointer"
                                >
                                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                    Sync Notes
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="group">
                                    <label className="text-[10px] font-black text-teal-600 uppercase mb-2 block tracking-wider group-focus-within:text-teal-400 transition">Chief Complaint</label>
                                    <textarea 
                                        value={clerkData.chiefComplaint}
                                        onChange={(e) => handleClerkChange('chiefComplaint', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all shadow-inner"
                                        placeholder="Reason for visit..."
                                        rows={1}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-teal-600 uppercase mb-2 block tracking-wider">HPC (History of Presenting Complaint)</label>
                                    <textarea 
                                        value={clerkData.hpc}
                                        onChange={(e) => handleClerkChange('hpc', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-inner leading-relaxed"
                                        placeholder="Site, Onset, Character, Duration..."
                                        rows={4}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-teal-600 uppercase mb-2 block tracking-wider">Past Med History</label>
                                        <textarea 
                                            value={clerkData.pmh}
                                            onChange={(e) => handleClerkChange('pmh', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:outline-none focus:border-teal-500 transition shadow-inner"
                                            placeholder="Prev conditions..."
                                            rows={2}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-rose-600 uppercase mb-2 block tracking-wider">Allergies</label>
                                        <textarea 
                                            value={clerkData.allergies}
                                            onChange={(e) => handleClerkChange('allergies', e.target.value)}
                                            className="w-full bg-rose-50/30 border border-rose-100 rounded-2xl p-4 text-sm font-bold text-rose-700 focus:outline-none focus:border-rose-500 transition shadow-inner"
                                            placeholder="Allergic to..."
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'exam' && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-20">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Eye className="w-4 h-4 text-teal-600" /> Clinical Examination
                            </h3>
                            <div className="rounded-[2.5rem] overflow-hidden mb-6 border-4 border-slate-50 shadow-2xl relative group">
                                <img src={patient.lastScanUrl} alt="Patient Skin" className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-[2s]" />
                                <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-black uppercase tracking-widest border border-white/20">
                                    Patient Evidence
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
                                    <div className="flex items-center justify-between px-2">
                                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">AI Clinical Synthesis</h4>
                                        <div className="flex items-center gap-1.5 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 shadow-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                                            <span className="text-[9px] font-black text-teal-700 uppercase">Analysis Complete</span>
                                        </div>
                                    </div>

                                    {/* Categorized Findings */}
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:bg-white transition duration-500">
                                            <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition">
                                                <Microscope className="w-10 h-10 text-teal-900" />
                                            </div>
                                            <h5 className="text-[10px] font-black text-teal-600 uppercase mb-3 tracking-widest flex items-center gap-2">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Physical Findings
                                            </h5>
                                            <p className="text-slate-800 text-sm font-bold leading-relaxed italic pr-8">
                                                {aiAnalysis.physicalFindings}
                                            </p>
                                        </div>

                                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:bg-white transition duration-500">
                                            <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition">
                                                <Brain className="w-10 h-10 text-teal-900" />
                                            </div>
                                            <h5 className="text-[10px] font-black text-teal-600 uppercase mb-3 tracking-widest flex items-center gap-2">
                                                <Zap className="w-3.5 h-3.5" /> Differential Logic
                                            </h5>
                                            <p className="text-slate-700 text-sm font-medium leading-relaxed">
                                                {aiAnalysis.pathophysiology}
                                            </p>
                                        </div>

                                        <div className="bg-teal-900 text-white p-7 rounded-[2.5rem] shadow-2xl shadow-teal-900/20 relative overflow-hidden">
                                            <div className="absolute -bottom-4 -right-4 opacity-10">
                                                <Stethoscope className="w-24 h-24" />
                                            </div>
                                            <h5 className="text-[10px] font-black text-teal-300 uppercase mb-4 tracking-[0.2em] flex items-center gap-2">
                                                <Sparkles className="w-3.5 h-3.5" /> Suggested Treatment Lead
                                            </h5>
                                            <p className="text-sm font-bold leading-loose relative z-10">
                                                {aiAnalysis.treatmentPlan}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {view === 'video' && (
                    <div className="flex flex-col h-full animate-in zoom-in-95 duration-300">
                        <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden relative flex-1 min-h-[450px] shadow-2xl">
                            {isVideoOn ? (
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center flex-col gap-6">
                                    <div className="w-28 h-28 bg-slate-800 rounded-[2rem] flex items-center justify-center border-4 border-slate-700 shadow-2xl">
                                        <VideoOff className="w-12 h-12 text-slate-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-black uppercase tracking-[0.3em] text-[10px] mb-2">Encrypted Video Stream</p>
                                        <p className="text-slate-500 text-[10px] font-bold uppercase">Awaiting your permission</p>
                                    </div>
                                </div>
                            )}

                            <div className="absolute top-6 right-6 w-32 h-44 bg-slate-800 rounded-3xl border-2 border-white/20 shadow-2xl overflow-hidden group">
                                <img src={patient.lastScanUrl} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[9px] font-black text-white uppercase tracking-tighter bg-teal-600/60 px-2 py-1 rounded">Ref Scan</span>
                                </div>
                            </div>

                            <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-5">
                                <button onClick={toggleVideo} className={`p-5 rounded-[1.5rem] transition-all shadow-2xl border-2 cursor-pointer ${isVideoOn ? 'bg-white text-slate-900 border-white' : 'bg-rose-500 text-white border-rose-400 animate-pulse'}`}>
                                    {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                                </button>
                                <button onClick={() => setIsMicOn(!isMicOn)} className={`p-5 rounded-[1.5rem] transition-all shadow-2xl border-2 cursor-pointer ${isMicOn ? 'bg-white text-slate-900 border-white' : 'bg-slate-700 text-white border-slate-600'}`}>
                                    {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                                </button>
                                <button onClick={onEnd} className="p-5 bg-rose-600 text-white rounded-[1.5rem] shadow-2xl border-2 border-rose-500 hover:bg-rose-700 transition cursor-pointer">
                                    <LogOut className="w-6 h-6 rotate-90" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'plan' && (
                  <div className="space-y-6 animate-in slide-in-from-bottom duration-300 pb-20">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Stethoscope className="w-32 h-32 text-teal-900" />
                      </div>

                      <div className="flex justify-between items-center mb-8 relative z-10 border-b border-slate-50 pb-6">
                        <div>
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Clinic Management</h3>
                          <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Treatment Plan</h2>
                        </div>
                        <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-serif text-3xl shadow-xl">Rx</div>
                      </div>

                      <div className="space-y-5 relative z-10">
                        {prescription.map((item) => (
                          <div key={item.id} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 animate-in zoom-in-95 duration-200 relative group shadow-sm">
                            <button 
                              onClick={() => removeMedication(item.id)}
                              className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition cursor-pointer opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                              <div className="col-span-1 sm:col-span-2">
                                <label className="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-1.5 block">Drug & Dose</label>
                                <input 
                                  value={item.drug}
                                  onChange={(e) => updateMedication(item.id, 'drug', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-inner"
                                  placeholder="e.g., Minocycline 100mg"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-1.5 block">Frequency</label>
                                <input 
                                  value={item.frequency}
                                  onChange={(e) => updateMedication(item.id, 'frequency', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 shadow-inner"
                                  placeholder="e.g., Once daily"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-1.5 block">Duration</label>
                                <input 
                                  value={item.duration}
                                  onChange={(e) => updateMedication(item.id, 'duration', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 shadow-inner"
                                  placeholder="e.g., 14 Days"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        <button 
                          onClick={addMedication}
                          className="w-full py-5 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center gap-3 text-slate-400 hover:text-teal-600 hover:border-teal-400 hover:bg-teal-50 transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer group"
                        >
                          <Plus className="w-5 h-5 group-hover:rotate-90 transition" /> Add Medication Entry
                        </button>
                      </div>

                      <div className="mt-10">
                        <button 
                          onClick={handleFinalizePlan}
                          disabled={isPlanSaving || (prescription.length === 0 && !uploadedPrescription)}
                          className="w-full py-6 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-slate-900/30 hover:bg-slate-800 transition transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none cursor-pointer"
                        >
                          {isPlanSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                          Issue Treatment Order
                        </button>
                      </div>
                    </div>
                  </div>
                )}
            </div>
        </div>
    );
};

// --- DOCTOR: PATIENT RECORD DETAIL (ARCHIVE) ---
const PatientRecordDetail: React.FC<{ 
    patient: PatientRecord; 
    onBack: () => void;
}> = ({ patient, onBack }) => {
    const [expandedConsultId, setExpandedConsultId] = useState<string | null>(patient.consults[0]?.id || null);

    return (
        <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-500 overflow-y-auto no-scrollbar pb-24">
            <header className="sticky top-0 z-30 bg-white border-b border-slate-100 p-6 flex items-center gap-4">
                <button onClick={onBack} className="p-3 bg-slate-50 rounded-2xl text-slate-500 hover:bg-slate-100 transition cursor-pointer shadow-sm">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{patient.name}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{patient.age}y • {patient.gender} • Profile Archive</p>
                </div>
            </header>

            <div className="p-6 space-y-8">
                {/* Patient Overview */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex gap-6 items-center">
                    <img src={patient.image} className="w-24 h-24 rounded-[2rem] object-cover border-4 border-slate-50 shadow-xl" />
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <span className="px-2 py-0.5 bg-teal-50 text-teal-600 text-[9px] font-black rounded-full uppercase">Verified Patient</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Clinical Timeline</h3>
                        <p className="text-slate-400 text-xs font-medium">Viewing {patient.consults.length} historical records.</p>
                    </div>
                </div>

                {/* Timeline */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-teal-600" /> Longitudinal History
                    </h3>

                    <div className="relative pl-8 space-y-12 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {patient.consults.map((consult) => (
                            <div key={consult.id} className="relative">
                                {/* Timeline Dot */}
                                <div className={`absolute -left-[27px] top-2 w-4 h-4 rounded-full border-4 border-slate-50 shadow-md ${expandedConsultId === consult.id ? 'bg-teal-600' : 'bg-slate-300'}`} />
                                
                                <div 
                                    className={`bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden cursor-pointer ${expandedConsultId === consult.id ? 'border-teal-500 shadow-2xl shadow-teal-600/10' : 'border-slate-100 shadow-sm'}`}
                                    onClick={() => setExpandedConsultId(expandedConsultId === consult.id ? null : consult.id)}
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                                                    <Clock className="w-3 h-3 text-teal-600" /> {consult.date} @ {consult.time}
                                                </p>
                                                <h4 className="font-black text-slate-900 text-lg leading-tight">{consult.diagnosis}</h4>
                                            </div>
                                            <span className="text-[9px] font-black px-2 py-1 bg-slate-900 text-white rounded-lg uppercase tracking-widest">
                                                {consult.type}
                                            </span>
                                        </div>

                                        {expandedConsultId === consult.id && (
                                            <div className="space-y-6 animate-in slide-in-from-top-4 duration-500 mt-6 pt-6 border-t border-slate-50">
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="bg-slate-50/50 p-5 rounded-2xl">
                                                        <h5 className="text-[9px] font-black text-teal-600 uppercase mb-2 tracking-widest flex items-center gap-2">
                                                            <Microscope className="w-3 h-3" /> Findings
                                                        </h5>
                                                        <p className="text-slate-800 text-sm italic font-medium leading-relaxed">
                                                            "{consult.notes.physicalFindings}"
                                                        </p>
                                                    </div>
                                                    <div className="bg-slate-50/50 p-5 rounded-2xl">
                                                        <h5 className="text-[9px] font-black text-teal-600 uppercase mb-2 tracking-widest flex items-center gap-2">
                                                            <Brain className="w-3 h-3" /> Pathophysiology
                                                        </h5>
                                                        <p className="text-slate-700 text-sm font-medium leading-relaxed">
                                                            {consult.notes.pathophysiology}
                                                        </p>
                                                    </div>
                                                    <div className="bg-teal-900 p-6 rounded-2xl text-white">
                                                        <h5 className="text-[9px] font-black text-teal-300 uppercase mb-3 tracking-widest flex items-center gap-2">
                                                            <CheckCircle2 className="w-3 h-3" /> Prescribed Protocol
                                                        </h5>
                                                        <p className="text-sm font-bold leading-relaxed">
                                                            {consult.notes.treatmentPlan}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {!expandedConsultId || expandedConsultId !== consult.id ? (
                                             <div className="mt-4 flex items-center justify-between text-[10px] font-black text-teal-600 uppercase tracking-widest group">
                                                 View Full Clinical Notes <ChevronDown className="w-3.5 h-3.5 transition group-hover:translate-y-0.5" />
                                             </div>
                                        ) : (
                                            <div className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                                 Click to Collapse Record
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- DOCTOR: PROFILE MANAGEMENT ---
const DoctorProfile: React.FC<{ 
    doctor: User; 
    onBack: () => void;
    onNotify: (msg: string) => void;
}> = ({ doctor, onBack, onNotify }) => {
    const [profileData, setProfileData] = useState({
        name: doctor.name,
        specialty: 'Clinical Dermatology & Acne Specialist',
        clinic: 'Precision Derm Clinic, Central Park',
        bio: 'Specialist focused on non-invasive clinical treatments and patient education. Over 15 years of experience in managing chronic inflammatory skin conditions.',
        isAvailable: true,
        image: 'https://picsum.photos/seed/doctor_sarah/200/200'
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileData(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            onNotify("Credentials verified & Profile updated.");
            onBack();
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-500 overflow-y-auto no-scrollbar">
            <header className="p-6 flex items-center gap-4 bg-white border-b border-slate-100 sticky top-0 z-20">
                <button onClick={onBack} className="p-3 bg-slate-50 rounded-2xl text-slate-500 hover:bg-slate-100 transition cursor-pointer">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Manage Professional Identity</h2>
            </header>

            <div className="p-6 space-y-8 pb-32">
                {/* Photo Section */}
                <div className="flex flex-col items-center">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl ring-1 ring-slate-100">
                            <img src={profileData.image} className="w-full h-full object-cover group-hover:opacity-75 transition" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/20 rounded-[2.5rem]">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-teal-600 text-white p-2 rounded-2xl border-4 border-white shadow-lg">
                            <RefreshCw className="w-4 h-4" />
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    </div>
                    <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tap to update headshot</p>
                </div>

                {/* Status Toggle */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${profileData.isAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-black text-slate-900 text-sm tracking-tight">Live Consultations</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patients can book now</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setProfileData(p => ({...p, isAvailable: !p.isAvailable}))}
                        className={`w-14 h-8 rounded-full transition-all relative ${profileData.isAvailable ? 'bg-teal-600' : 'bg-slate-200'}`}
                    >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${profileData.isAvailable ? 'right-1' : 'left-1'}`} />
                    </button>
                </div>

                {/* Form Sections */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-teal-600" /> Professional Details
                        </h3>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="text-[9px] font-black text-teal-600 uppercase mb-2 block tracking-widest">Full Name & Title</label>
                                <input 
                                    value={profileData.name}
                                    onChange={(e) => setProfileData(p => ({...p, name: e.target.value}))}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-teal-500 shadow-inner"
                                />
                            </div>
                            
                            <div>
                                <label className="text-[9px] font-black text-teal-600 uppercase mb-2 block tracking-widest">Medical Specialty</label>
                                <input 
                                    value={profileData.specialty}
                                    onChange={(e) => setProfileData(p => ({...p, specialty: e.target.value}))}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-teal-500 shadow-inner"
                                />
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-teal-600 uppercase mb-2 block tracking-widest">Clinic Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-5 top-4 w-5 h-5 text-slate-300" />
                                    <input 
                                        value={profileData.clinic}
                                        onChange={(e) => setProfileData(p => ({...p, clinic: e.target.value}))}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-teal-500 shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <Award className="w-4 h-4 text-teal-600" /> Clinical Biography
                        </h3>
                        <textarea 
                            value={profileData.bio}
                            onChange={(e) => setProfileData(p => ({...p, bio: e.target.value}))}
                            className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 text-sm font-medium text-slate-600 focus:outline-none focus:border-teal-500 shadow-inner leading-relaxed"
                            rows={4}
                        />
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent z-30">
                    <button 
                        onClick={handleSave}
                        className="w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition transform active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        Save Portal Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- DOCTOR: DASHBOARD ---
const DoctorDashboard: React.FC<{ 
    onStartConsult: (p: Patient) => void; 
    onLogout: () => void;
    onOpenProfile: () => void;
    onNotify: (msg: string) => void;
}> = ({ onStartConsult, onLogout, onOpenProfile, onNotify }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'queue' | 'archive' | 'communications'>('queue');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArchivePatient, setSelectedArchivePatient] = useState<PatientRecord | null>(null);
    const [patients, setPatients] = useState<DashboardPatient[]>(MOCK_PATIENTS);

    const topPatient = patients[0];

    const handleSendReminder = (patientId: string, type: 'h24' | 'm30') => {
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                const label = type === 'h24' ? '24-hour' : '30-minute';
                onNotify(`Consultation reminder (${label}) sent to ${p.name}.`);
                return {
                    ...p,
                    remindersSent: { ...p.remindersSent, [type]: true }
                };
            }
            return p;
        }));
    };

    const filteredArchive = PATIENT_RECORDS.filter(patient => 
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.consults.some(c => c.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (selectedArchivePatient) {
        return <PatientRecordDetail patient={selectedArchivePatient} onBack={() => setSelectedArchivePatient(null)} />;
    }

    return (
        <div className="p-4 pb-24 space-y-8 h-full overflow-y-auto no-scrollbar animate-in fade-in duration-500 bg-slate-50/50">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-1">Good Skin</h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Medical Specialist Portal</p>
                </div>
                
                <div className="relative">
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="w-12 h-12 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-teal-600 font-black shadow-lg shadow-teal-600/5 hover:border-teal-500 transition cursor-pointer"
                    >
                        SL
                    </button>
                    
                    {isMenuOpen && (
                        <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                        <div className="absolute right-0 top-14 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2.5 z-50 animate-in slide-in-from-top-2 duration-200">
                            <button 
                                onClick={() => { setIsMenuOpen(false); onOpenProfile(); }}
                                className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-slate-600 hover:bg-slate-50 transition text-sm font-bold cursor-pointer group"
                            >
                                <span className="flex items-center gap-3">
                                    <UserIcon className="w-4 h-4 text-teal-600" /> Edit Profile
                                </span>
                                <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition" />
                            </button>
                            <div className="h-px bg-slate-50 my-2 mx-3" />
                            <button 
                                onClick={onLogout}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-rose-600 hover:bg-rose-50 transition text-sm font-black cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" /> Sign Out Portal
                            </button>
                        </div>
                        </>
                    )}
                </div>
            </header>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl shadow-slate-900/10 border border-white/10">
                    <div className="mb-4 text-teal-400"><Users className="w-5 h-5"/></div>
                    <div className="text-4xl font-black mb-1">{patients.length.toString().padStart(2, '0')}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Active Queue</div>
                </div>
                <div className="bg-white text-slate-900 p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="mb-4 text-emerald-600"><DollarSign className="w-5 h-5"/></div>
                    <div className="text-4xl font-black mb-1">$450</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Today's Revenue</div>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="bg-white p-1 rounded-2xl border border-slate-100 flex shadow-sm gap-1">
                <button 
                    onClick={() => setActiveTab('queue')}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition ${activeTab === 'queue' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Live Queue
                </button>
                <button 
                    onClick={() => setActiveTab('communications')}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition ${activeTab === 'communications' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Reminders
                </button>
                <button 
                    onClick={() => setActiveTab('archive')}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition ${activeTab === 'archive' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Archive
                </button>
            </div>

            {activeTab === 'queue' ? (
                <div className="space-y-8 animate-in slide-in-from-left duration-300">
                    <section>
                        <div className="flex justify-between items-center mb-6 px-1">
                            <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px]">Upcoming consult</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-emerald-600 uppercase bg-emerald-100 px-2 py-0.5 rounded-full">Synchronized</span>
                                <RefreshCw className="w-3 h-3 text-slate-300 animate-spin-slow" />
                            </div>
                        </div>
                        
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition duration-700">
                                <Sparkles className="w-24 h-24 text-teal-600" />
                            </div>
                            
                            <div className="flex flex-col gap-8 relative z-10">
                                <div className="flex gap-6 items-start">
                                    <div className="w-28 h-28 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-2xl shrink-0 ring-1 ring-slate-100">
                                        <img src={topPatient.lastScanUrl} alt="Last Scan" className="w-full h-full object-cover group-hover:scale-110 transition duration-[3s]" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">High Urgency</span>
                                        </div>
                                        <h4 className="font-black text-slate-900 text-2xl tracking-tighter mb-2">{topPatient.name}</h4>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            <span>28y • Male</span>
                                            <span>•</span>
                                            <span>ID: SK-1092</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-3 h-3 text-teal-600" /> Chief Complaint
                                    </p>
                                    <p className="text-slate-800 text-sm font-bold leading-relaxed italic">"{topPatient.history?.chiefComplaint}"</p>
                                </div>

                                <button 
                                    onClick={() => onStartConsult(topPatient)}
                                    className="w-full py-5 bg-teal-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-teal-600/30 hover:bg-teal-700 transition transform active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
                                >
                                    Open Patient File <FolderCheck className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex justify-between items-center mb-6 px-1">
                            <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px]">Live Queue</h3>
                            <span className="text-[9px] font-black text-slate-400 uppercase">View All</span>
                        </div>
                        <div className="space-y-4">
                            {patients.map((p, i) => (
                                <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between shadow-sm hover:border-teal-200 transition group cursor-pointer" onClick={() => onStartConsult(p)}>
                                    <div className="flex items-center gap-5">
                                        <div className="relative">
                                            <img src={p.lastScanUrl} className="w-16 h-16 rounded-2xl object-cover group-hover:grayscale transition" />
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 border-2 border-white rounded-full" />
                                        </div>
                                        <div>
                                            <div className="font-black text-slate-900 text-lg tracking-tight mb-1">{p.name}</div>
                                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                                                <Clock className="w-3 h-3" /> Waiting {5 + i}m
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition shadow-sm">
                                        <ChevronRight className="w-6 h-6" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            ) : activeTab === 'communications' ? (
                <div className="space-y-8 animate-in fade-in duration-300 pb-10">
                    <section>
                         <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px] mb-6 px-1 flex items-center gap-2">
                             <Mail className="w-3.5 h-3.5 text-teal-600" /> Patient Reminders Hub
                         </h3>

                         <div className="space-y-6">
                            {patients.map(p => (
                                <div key={p.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <img src={p.lastScanUrl} className="w-14 h-14 rounded-2xl object-cover shadow-inner" />
                                            <div>
                                                <h4 className="font-black text-slate-900 text-base">{p.name}</h4>
                                                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                                                    <Calendar className="w-3 h-3" /> {p.nextAppointment}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                            <MessageSquare className="w-5 h-5" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <button 
                                            onClick={() => !p.remindersSent.h24 && handleSendReminder(p.id, 'h24')}
                                            className={`py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border-2 transition-all ${p.remindersSent.h24 ? 'bg-emerald-50 border-emerald-100 text-emerald-600 grayscale opacity-60' : 'bg-white border-slate-100 text-slate-600 hover:border-teal-500 hover:text-teal-600 cursor-pointer'}`}
                                        >
                                            {p.remindersSent.h24 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                                            24h Reminder
                                        </button>
                                        <button 
                                            onClick={() => !p.remindersSent.m30 && handleSendReminder(p.id, 'm30')}
                                            className={`py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border-2 transition-all ${p.remindersSent.m30 ? 'bg-emerald-50 border-emerald-100 text-emerald-600 grayscale opacity-60' : 'bg-white border-slate-100 text-slate-600 hover:border-teal-500 hover:text-teal-600 cursor-pointer'}`}
                                        >
                                            {p.remindersSent.m30 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                            30m Reminder
                                        </button>
                                    </div>
                                    
                                    {(!p.remindersSent.h24 || !p.remindersSent.m30) && (
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center px-4">
                                            Reminders are automated but can be manually triggered if client is offline.
                                        </p>
                                    )}
                                </div>
                            ))}
                         </div>
                    </section>
                    
                    <div className="bg-teal-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition duration-1000">
                             <Zap className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-xl font-black tracking-tight mb-2">Automated Workflow</h4>
                            <p className="text-teal-200 text-sm font-medium leading-relaxed mb-6 opacity-80">
                                System tracks consultation schedules and issues secure encrypted notifications to patient's Good Skin app.
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/20">
                                <ShieldCheck className="w-4 h-4 text-teal-400" /> End-to-End Encrypted
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-10">
                    {/* Archive Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-300" />
                        <input 
                            type="text"
                            placeholder="Search Patients in Archive..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-teal-500 transition shadow-inner font-medium"
                        />
                    </div>

                    <div className="flex justify-between items-center px-1">
                        <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
                            <History className="w-3.5 h-3.5 text-teal-600" /> Master Patient Registry
                        </h3>
                        <button className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1 hover:text-slate-600 transition">
                            <Filter className="w-3 h-3" /> Filter Log
                        </button>
                    </div>

                    <div className="space-y-4">
                        {filteredArchive.map((patient) => (
                            <div 
                                key={patient.id} 
                                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative group overflow-hidden cursor-pointer hover:border-teal-200 transition-all duration-300"
                                onClick={() => setSelectedArchivePatient(patient)}
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition">
                                    <ExternalLink className="w-12 h-12 text-teal-900" />
                                </div>
                                
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <img src={patient.image} className="w-14 h-14 rounded-2xl object-cover shadow-lg border-2 border-slate-50" />
                                        <div>
                                            <h4 className="font-black text-slate-900 text-lg leading-none mb-1.5">{patient.name}</h4>
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                ID: {patient.id} • {patient.gender} • {patient.age}y
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100 uppercase tracking-widest">
                                            {patient.consults.length} RECORDS
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50 flex items-center justify-between group-hover:bg-teal-50 transition duration-300">
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Latest Clinical Outcome</p>
                                        <p className="text-slate-900 text-sm font-bold tracking-tight">{patient.consults[0].diagnosis}</p>
                                    </div>
                                    <div className="text-right">
                                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Visit</p>
                                         <p className="text-slate-900 text-xs font-black">{patient.consults[0].date}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredArchive.length === 0 && (
                            <div className="text-center py-20 bg-white/50 rounded-[3rem] border border-dashed border-slate-200">
                                <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No matching clinical records found</p>
                            </div>
                        )}
                    </div>
                </div>
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
                    <div className="w-24 h-24 bg-teal-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-teal-600/30 mb-8 border-4 border-white rotate-3">
                        <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Good Skin</h1>
                    <p className="text-slate-400 font-black text-[10px] text-center uppercase tracking-[0.4em]">Precision Dermatology</p>
                </div>

                <div className="space-y-5">
                    <button 
                        onClick={() => onLogin('client')}
                        className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition transform active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
                    >
                        Patient Access <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-6 py-4 px-4">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Medical</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    <button 
                        onClick={() => onLogin('doctor')}
                        className="w-full bg-white border-2 border-slate-100 text-slate-900 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:border-teal-500 hover:text-teal-600 transition transform active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer shadow-xl shadow-slate-200/50"
                    >
                        <Stethoscope className="w-4 h-4" /> Specialist Login
                    </button>
                </div>

                <p className="mt-20 text-center text-[9px] text-slate-300 font-black uppercase tracking-widest leading-loose px-12">
                    Advanced clinical AI analysis & private specialist networking.
                </p>
            </div>
        </div>
    );
};

// --- CLIENT EDUCATION HUB ---
const EducationHub: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <div className="p-4 pb-24 h-full overflow-y-auto no-scrollbar space-y-8 animate-in slide-in-from-right duration-500">
            <header className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 bg-white border border-slate-200 rounded-full text-slate-500 hover:bg-slate-50 transition shadow-sm cursor-pointer">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-slate-900">Education Hub</h2>
            </header>

            <div className="space-y-6">
                {EDUCATION_ARTICLES.map(article => (
                    <div key={article.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm group cursor-pointer hover:shadow-md transition">
                        <div className="h-48 overflow-hidden">
                            <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{article.category}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-4">{article.title}</h3>
                            <button className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 group-hover:text-teal-600 transition">
                                Read Article <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
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
    advice: AdviceItem;
    onOpenAdvice: () => void;
  }> = ({ user, onNavigate, onLogout, onShare, advice, onOpenAdvice }) => {
    return (
      <div className="p-4 pb-24 space-y-10 animate-in fade-in duration-500 h-full overflow-y-auto no-scrollbar">
          <header className="flex justify-between items-center px-1">
              <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">Hi, {user.name.split(' ')[0]}</h1>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Your Skin Dashboard</p>
              </div>
              <div className="flex gap-3">
                  <button onClick={onShare} className="p-3 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[1.2rem] hover:bg-slate-50 transition text-teal-600 cursor-pointer">
                      <Share2 className="w-5 h-5" />
                  </button>
                  <button onClick={onLogout} className="p-3 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[1.2rem] hover:bg-slate-50 transition text-slate-400 cursor-pointer">
                      <LogOut className="w-5 h-5" />
                  </button>
              </div>
          </header>
  
          <div 
              className="rounded-[3rem] h-72 shadow-2xl shadow-slate-900/10 relative overflow-hidden group cursor-pointer border-4 border-white"
              onClick={onOpenAdvice}
          >
              <img src={advice.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
              <div className="relative h-full z-10 p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                          <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] opacity-80">Daily Insight</span>
                  </div>
                  <h2 className="text-white text-3xl font-black mb-1 leading-tight tracking-tighter">{advice.title}</h2>
                  <button className="self-start mt-4 flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition active:scale-95 cursor-pointer">
                      Explore <ArrowRight className="w-4 h-4" />
                  </button>
              </div>
          </div>
  
          <div className="grid grid-cols-2 gap-5">
              <button onClick={() => onNavigate('scan')} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col items-center gap-6 hover:border-teal-500 transition-all duration-300 group cursor-pointer">
                  <div className="w-16 h-16 bg-teal-50 rounded-3xl flex items-center justify-center text-teal-600 group-hover:scale-110 transition duration-300">
                      <Scan className="w-8 h-8" />
                  </div>
                  <span className="font-black text-slate-900 text-[10px] uppercase tracking-widest text-center leading-tight">Precision<br/>Skin Scan</span>
              </button>
              <button onClick={() => onNavigate('marketplace')} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col items-center gap-6 hover:border-teal-500 transition-all duration-300 group cursor-pointer">
                  <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition duration-300">
                      <Stethoscope className="w-8 h-8" />
                  </div>
                  <span className="font-black text-slate-900 text-[10px] uppercase tracking-widest text-center leading-tight">Derm<br/>Network</span>
              </button>
          </div>
      </div>
    );
  };

const AdviceModal: React.FC<{ isOpen: boolean; onClose: () => void; advice: AdviceItem }> = ({ isOpen, onClose, advice }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-2xl" onClick={onClose} />
            <div className="bg-white w-full max-w-sm rounded-[3.5rem] overflow-hidden relative shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border-4 border-white">
                <button onClick={onClose} className="absolute top-8 right-8 z-30 p-3 bg-black/20 backdrop-blur-xl rounded-full text-white hover:bg-black/40 transition cursor-pointer border border-white/20">
                    <X className="w-6 h-6" />
                </button>
                
                <div className="h-64 relative">
                    <img src={advice.image} alt={advice.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                </div>

                <div className="p-10 pt-0 relative -mt-16 bg-white rounded-t-[3.5rem]">
                    <div className="w-20 h-1.5 bg-slate-100 rounded-full mx-auto mb-10" />
                    <div className="flex items-center gap-2 mb-4 text-teal-600">
                        <Sparkles className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Specialist Insight</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-6 leading-tight tracking-tighter">{advice.title}</h2>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium mb-10">
                        {advice.text}
                    </p>
                    <button 
                        onClick={onClose}
                        className="w-full bg-slate-900 text-white py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition transform active:scale-[0.98] cursor-pointer"
                    >
                        Confirm Clinical Read
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
  const [notifications, setNotifications] = useState<{ id: number; message: string; type?: 'id' }[]>([]);
  const [adviceIndex, setAdviceIndex] = useState(0);
  const [isAdviceModalOpen, setIsAdviceModalOpen] = useState(false);
  const [activeConsultation, setActiveConsultation] = useState<Patient | null>(null);
  const [isDoctorProfileOpen, setIsDoctorProfileOpen] = useState(false);

  useEffect(() => {
    const rotationTimer = setInterval(() => {
      setAdviceIndex((prev) => (prev + 1) % DERMATOLOGIST_ADVICE.length);
    }, 600000); 

    return () => clearInterval(rotationTimer);
  }, []);

  const notify = (msg: string, isId: boolean = false) => {
      const id = Date.now();
      setNotifications(prev => [...prev, { id, message: msg, type: isId ? 'id' : undefined }]);
      setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), isId ? 6000 : 3000);
  };

  const handleLogin = (role: UserRole) => {
    setUser({
        id: '123',
        name: role === 'client' ? 'Alex Johnson' : 'Dr. Sarah Lin',
        email: 'user@test.com',
        role: role
    });
    setActiveTab('home');
    setActiveConsultation(null);
    setIsDoctorProfileOpen(false);
  };

  const handleLogout = () => {
      setUser(null);
      setActiveConsultation(null);
      setIsDoctorProfileOpen(false);
      setActiveTab('home');
  };

  const handleScanComplete = (result: ScanResult) => {
      notify("Deep Scan Analysis Ready!");
  };

  const handleBooking = (doctor: Doctor) => {
      const uniqueId = `SKIN-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(Math.random() * 90 + 10)}`;
      notify(`Consultation Folder #${uniqueId} generated. Specialist has been notified.`, true);
      return uniqueId;
  };

  const handleShare = async () => {
    const shareData = {
        title: 'Good Skin',
        text: 'Check out Good Skin! 🌿 AI Dermatology.',
        url: window.location.href
    };
    try {
        if (navigator.share) await navigator.share(shareData);
        else window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text + " " + shareData.url)}`, '_blank');
    } catch (err) { console.error(err); }
  };

  if (!user) return <AuthScreen onLogin={handleLogin} />;

  const renderClientContent = () => {
      const goHome = () => setActiveTab('home');
      switch(activeTab) {
          case 'home': return (
            <ClientHome 
                user={user!} 
                onNavigate={setActiveTab} 
                onLogout={handleLogout} 
                onShare={handleShare} 
                advice={DERMATOLOGIST_ADVICE[adviceIndex]} 
                onOpenAdvice={() => setIsAdviceModalOpen(true)} 
            />
          );
          case 'scan': return <ScanView onScanComplete={handleScanComplete} onConsult={handleBooking} onBack={goHome} />;
          case 'progress': return <ProgressTracker onBack={goHome} />;
          case 'marketplace': return <Marketplace onBook={handleBooking} onBack={goHome} />;
          case 'education': return <EducationHub onBack={goHome} />;
          default: return (
            <ClientHome 
                user={user!} 
                onNavigate={setActiveTab} 
                onLogout={handleLogout} 
                onShare={handleShare} 
                advice={DERMATOLOGIST_ADVICE[adviceIndex]} 
                onOpenAdvice={() => setIsAdviceModalOpen(true)} 
            />
          );
      }
  };

  const renderDoctorContent = () => {
      if (isDoctorProfileOpen) {
          return <DoctorProfile doctor={user!} onBack={() => setIsDoctorProfileOpen(false)} onNotify={notify} />;
      }
      if (activeConsultation) {
          return <ConsultationRoom patient={activeConsultation} onEnd={() => setActiveConsultation(null)} />;
      }
      return <DoctorDashboard 
                onStartConsult={(p) => setActiveConsultation(p)} 
                onLogout={handleLogout} 
                onOpenProfile={() => setIsDoctorProfileOpen(true)} 
                onNotify={notify}
             />;
  };

  return (
    <div 
        className="min-h-screen bg-cover bg-center bg-fixed relative font-sans text-slate-900 flex justify-center overflow-hidden"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&q=80')" }}
    >
        <div className="absolute inset-0 bg-slate-100/60 backdrop-blur-sm z-0"></div>

        <main className="w-full max-w-md h-screen bg-slate-50/95 shadow-[0_50px_100px_rgba(0,0,0,0.1)] relative z-10 backdrop-blur-md flex flex-col border-x border-slate-100">
            <div className="flex-1 overflow-hidden">
                {user.role === 'client' ? renderClientContent() : renderDoctorContent()}
            </div>
            
            {!activeConsultation && !isDoctorProfileOpen && (
                <nav className="shrink-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 px-8 py-5 flex justify-between items-center z-50 safe-area-bottom">
                    {user.role === 'client' ? (
                        <>
                            <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 transition cursor-pointer ${activeTab === 'home' ? 'text-teal-600' : 'text-slate-300'}`}>
                                <Home className="w-6 h-6" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
                            </button>
                            <button onClick={() => setActiveTab('scan')} className={`flex flex-col items-center gap-1.5 transition cursor-pointer ${activeTab === 'scan' ? 'text-teal-600' : 'text-slate-300'}`}>
                                <div className="w-16 h-16 bg-teal-600 rounded-3xl flex items-center justify-center -mt-14 shadow-2xl border-4 border-slate-50 text-white transform hover:scale-105 transition">
                                    <Scan className="w-7 h-7" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest">Scan</span>
                            </button>
                            <button onClick={() => setActiveTab('progress')} className={`flex flex-col items-center gap-1.5 transition cursor-pointer ${activeTab === 'progress' ? 'text-teal-600' : 'text-slate-300'}`}>
                                <Activity className="w-6 h-6" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Track</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 transition cursor-pointer ${activeTab === 'home' ? 'text-teal-600' : 'text-slate-300'}`}>
                                <Activity className="w-6 h-6" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Dash</span>
                            </button>
                            <button className="flex flex-col items-center gap-1.5 text-slate-300 cursor-pointer hover:text-slate-400 transition">
                                <Users className="w-6 h-6" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Patients</span>
                            </button>
                            <button onClick={() => setIsDoctorProfileOpen(true)} className="flex flex-col items-center gap-1.5 text-slate-300 cursor-pointer hover:text-slate-400 transition">
                                <Settings className="w-6 h-6" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Portal</span>
                            </button>
                        </>
                    )}
                </nav>
            )}

            <div className="fixed top-6 left-0 right-0 z-[100] flex flex-col items-center gap-4 pointer-events-none px-6">
                {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`${notif.type === 'id' ? 'bg-slate-900 border-teal-500/50' : 'bg-slate-900 border-white/10'} text-white px-6 py-6 rounded-[2rem] shadow-2xl text-sm font-medium animate-in slide-in-from-top-12 w-full max-sm pointer-events-auto border-2 backdrop-blur-xl`}
                    >
                        {notif.type === 'id' ? (
                          <div className="flex gap-4 items-center">
                            <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-teal-500/20">
                                <FolderCheck className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <div className="font-black text-[10px] uppercase tracking-[0.2em] mb-1.5 text-teal-400">Secure Protocol Synced</div>
                              <div className="leading-tight font-black tracking-tight text-lg">{notif.message}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                <Activity className="w-5 h-5 text-teal-400" />
                             </div>
                             <span className="font-bold tracking-tight">{notif.message}</span>
                          </div>
                        )}
                    </div>
                ))}
            </div>

            <AdviceModal 
              isOpen={isAdviceModalOpen} 
              onClose={() => setIsAdviceModalOpen(false)} 
              advice={DERMATOLOGIST_ADVICE[adviceIndex]} 
            />
        </main>
    </div>
  );
};

export default App;
