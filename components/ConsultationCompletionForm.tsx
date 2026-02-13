
import React, { useState } from 'react';
import { 
  FileText, Pill, FlaskConical, Sparkles, 
  ShieldCheck, Loader2, Plus, Trash2, 
  CheckCircle2, AlertCircle 
} from 'lucide-react';
import { DashboardPatient, MedicalAnalysis } from '../types';

interface PrescriptionItem {
  drugName: string;
  dosage: string;
  frequency: string;
}

interface ConsultationCompletionFormProps {
  patient: DashboardPatient;
  aiInsight: MedicalAnalysis | null;
  onComplete: (data: {
    notes: string;
    prescriptions: PrescriptionItem[];
    labRequest: string;
  }) => Promise<void>;
}

const ConsultationCompletionForm: React.FC<ConsultationCompletionFormProps> = ({ 
  patient, 
  aiInsight, 
  onComplete 
}) => {
  const [notes, setNotes] = useState("");
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [labRequest, setLabRequest] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleImportAI = () => {
    if (!aiInsight) return;
    const aiText = `CLINICAL OBSERVATION:\n${aiInsight.physicalFindings}\n\nPATHOPHYSIOLOGY:\n${aiInsight.pathophysiology}\n\nAI TREATMENT PROTOCOL:\n${aiInsight.treatmentPlan}`;
    setNotes(prev => prev ? `${prev}\n\n-- NEURAL SYNCED DATA --\n${aiText}` : aiText);
  };

  const addPrescription = () => {
    setPrescriptions([...prescriptions, { drugName: "", dosage: "", frequency: "" }]);
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const updatePrescription = (index: number, field: keyof PrescriptionItem, value: string) => {
    const updated = [...prescriptions];
    updated[index] = { ...updated[index], [field]: value };
    setPrescriptions(updated);
  };

  const handleSubmit = async () => {
    setIsSigning(true);
    try {
      await onComplete({ notes, prescriptions, labRequest });
      setShowSuccess(true);
    } catch (error) {
      console.error("Signing failed:", error);
    } finally {
      setIsSigning(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-[3rem] flex items-center justify-center text-emerald-500 mb-8 shadow-2xl shadow-emerald-950/20">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h3 className="text-4xl font-black text-white tracking-tighter italic mb-4 text-center uppercase">Report Authorized</h3>
        <p className="text-zinc-500 text-xs font-black text-center max-w-xs leading-relaxed uppercase tracking-[0.2em] mb-10">
          Clinical records cryptographically signed and routed to patient registry.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      {/* Neural Assist Link */}
      {aiInsight && (
        <div className="bg-zinc-900 rounded-[3rem] p-8 border border-zinc-800 text-white relative overflow-hidden group shadow-2xl">
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-1">Neural Integration Active</h4>
                <p className="text-xs font-bold text-zinc-400">Synchronize preliminary AI findings into your official report.</p>
              </div>
            </div>
            <button 
              onClick={handleImportAI}
              className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl active:scale-95"
            >
              Merge AI Assets
            </button>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000">
            <Sparkles className="w-48 h-48" />
          </div>
        </div>
      )}

      {/* Main EMR Suite */}
      <div className="grid grid-cols-1 gap-12">
        {/* Clerking Notes: Pathophysiology Area */}
        <section className="bg-zinc-900 rounded-[4rem] p-12 border border-zinc-800 shadow-2xl space-y-10">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-zinc-950 rounded-3xl text-emerald-500 border border-zinc-800">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-3xl font-black text-white tracking-tighter uppercase italic">Clerking Protocol</h4>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Formal Assessment & Physical Examination Records</p>
            </div>
          </div>
          <textarea 
            className="w-full h-64 bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-10 text-lg font-medium text-zinc-200 focus:outline-none focus:border-emerald-600 focus:bg-zinc-900 transition-all shadow-inner placeholder:text-zinc-800 leading-relaxed font-mono uppercase"
            placeholder="Document Clinical Presentation..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </section>

        {/* Prescription & Labs Split Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* E-Prescription Desk */}
          <section className="bg-zinc-900 rounded-[3rem] p-10 border border-zinc-800 shadow-xl flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-zinc-950 rounded-2xl text-emerald-500 border border-zinc-800">
                  <Pill className="w-6 h-6" />
                </div>
                <h4 className="font-black uppercase tracking-[0.2em] text-[10px] text-zinc-400">Prescription Desk</h4>
              </div>
              <button 
                onClick={addPrescription}
                className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-950/20 active:scale-90"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 flex-1">
              {prescriptions.map((p, i) => (
                <div key={i} className="flex gap-4 animate-in slide-in-from-left-4 duration-500">
                  <input 
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl px-8 py-5 text-xs font-black uppercase tracking-widest text-white focus:bg-zinc-900 focus:border-emerald-600 outline-none"
                    placeholder="DRUG NAME"
                    value={p.drugName}
                    onChange={(e) => updatePrescription(i, 'drugName', e.target.value)}
                  />
                  <input 
                    className="w-32 bg-zinc-950 border border-zinc-800 rounded-2xl px-8 py-5 text-xs font-black uppercase tracking-widest text-emerald-500 focus:bg-zinc-900 focus:border-emerald-600 outline-none"
                    placeholder="SIG."
                    value={p.dosage}
                    onChange={(e) => updatePrescription(i, 'dosage', e.target.value)}
                  />
                  <button 
                    onClick={() => removePrescription(i)}
                    className="p-5 text-zinc-700 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {prescriptions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-zinc-800 rounded-[3rem] opacity-30">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Registry awaiting medication list</p>
                </div>
              )}
            </div>
          </section>

          {/* Investigation Panel */}
          <section className="bg-zinc-900 rounded-[3rem] p-10 border border-zinc-800 shadow-xl">
            <div className="flex items-center gap-5 mb-10">
              <div className="p-4 bg-zinc-950 rounded-2xl text-zinc-200 border border-zinc-800">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h4 className="font-black uppercase tracking-[0.2em] text-[10px] text-zinc-400">Labs & Diagnostics</h4>
            </div>
            <textarea 
              className="w-full h-48 bg-zinc-950 border border-zinc-800 rounded-[2rem] p-10 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 focus:outline-none focus:border-emerald-600 focus:bg-zinc-900 transition-all shadow-inner placeholder:text-zinc-900 leading-relaxed font-mono"
              placeholder="Request CBC, Culture, or Biopsy..."
              value={labRequest}
              onChange={(e) => setLabRequest(e.target.value)}
            />
          </section>
        </div>
      </div>

      {/* Authority Control */}
      <footer className="flex flex-col items-center pt-16">
        <button 
          onClick={handleSubmit}
          disabled={isSigning || !notes}
          className={`w-full max-w-2xl py-8 rounded-[3rem] font-black uppercase text-[12px] tracking-[0.5em] transition-all flex items-center justify-center gap-5 shadow-2xl active:scale-[0.98] ${isSigning || !notes ? 'bg-zinc-800 text-zinc-700 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-950/40'}`}
        >
          {isSigning ? (
            <>
              <Loader2 className="w-7 h-7 animate-spin" />
              Cryptographic Authorization...
            </>
          ) : (
            <>
              <ShieldCheck className="w-7 h-7" /> Authorize & Sign Report
            </>
          )}
        </button>
        <div className="mt-8 flex items-center gap-3 opacity-20">
          <AlertCircle className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Digital signatures are binding and unalterable</span>
        </div>
      </footer>
    </div>
  );
};

export default ConsultationCompletionForm;
