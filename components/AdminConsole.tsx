
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Activity, Wallet, Check, X, 
  Loader2, Search, Filter, ArrowUpRight, Lock,
  Globe, Server, Zap, Database, BarChart3,
  LogOut, RefreshCw, AlertTriangle, Terminal,
  ShieldAlert, Fingerprint
} from 'lucide-react';
import { ADMIN_EMAIL } from '../constants';

const PROJECT_ID = 'good-skin-2';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const PENDING_URL = `${BASE_URL}/pending_verification`;
const VERIFIED_URL = `${BASE_URL}/verified_specialists`;
const CASES_URL = `${BASE_URL}/cases`;

interface SpecialistApplication {
  id: string;
  name: string;
  email: string;
  mdc: string;
  specialty: string;
  timestamp: string;
  fields: any;
}

const AdminConsole = ({ onExit }: { onExit: () => void }) => {
  const [pending, setPending] = useState<SpecialistApplication[]>([]);
  const [stats, setStats] = useState({ totalDocs: 0, activeCases: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRegistryData = async () => {
    try {
      setLoading(true);
      // 1. Fetch Pending
      const pRes = await fetch(PENDING_URL);
      const pData = await pRes.json();
      const pendingDocs = pData.documents?.map((d: any) => ({
        id: d.name.split('/').pop(),
        name: d.fields.name?.stringValue || 'Unknown',
        email: d.fields.email?.stringValue || 'N/A',
        mdc: d.fields.MDC_Number?.stringValue || 'N/A',
        specialty: d.fields.specialty?.stringValue || 'Dermatology',
        timestamp: d.createTime,
        fields: d.fields
      })) || [];
      setPending(pendingDocs);

      // 2. Fetch Stats
      const vRes = await fetch(VERIFIED_URL);
      const vData = await vRes.json();
      const verifiedCount = vData.documents?.length || 0;

      const cRes = await fetch(CASES_URL);
      const cData = await cRes.json();
      const activeCases = cData.documents?.filter((d: any) => d.fields.status?.stringValue === 'in-consultation').length || 0;

      const revenue = vData.documents?.reduce((acc: number, d: any) => acc + (parseInt(d.fields.totalEarnings?.integerValue || '0')), 0) || 0;

      setStats({ totalDocs: verifiedCount, activeCases, revenue });
    } catch (e) {
      console.error("Admin Registry Sync Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistryData();
    const interval = setInterval(fetchRegistryData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (app: SpecialistApplication) => {
    setProcessingId(app.id);
    try {
      const docId = app.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const verifiedPayload = {
        fields: {
          ...app.fields,
          access_granted: { booleanValue: true },
          totalEarnings: { integerValue: "0" }
        }
      };
      await fetch(`${VERIFIED_URL}?documentId=${docId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifiedPayload)
      });
      await fetch(`${PENDING_URL}/${app.id}`, { method: 'DELETE' });
      fetchRegistryData();
    } catch (e) {
      console.error("Approval flow broken:", e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await fetch(`${PENDING_URL}/${id}`, { method: 'DELETE' });
      fetchRegistryData();
    } catch (e) {
      console.error("Rejection flow broken:", e);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[6000] bg-slate-950 text-zinc-100 font-sans p-8 md:p-16 animate-in fade-in duration-500 overflow-y-auto overflow-x-hidden selection:bg-vitality/30">
      
      {/* CONTROL LAYER HEADER */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-20">
        <div className="space-y-4">
          <div className="flex items-center gap-5">
             <div className="p-4 bg-vitality/10 border border-vitality/30 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.1)]">
               <ShieldCheck className="w-8 h-8 text-vitality" />
             </div>
             <div>
               <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">Central Terminal</h1>
               <div className="flex items-center gap-3 mt-1.5">
                  <Fingerprint className="w-3 h-3 text-zinc-600" />
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em]">{ADMIN_EMAIL}</p>
               </div>
             </div>
          </div>
        </div>

        <div className="flex gap-4">
           <button 
             onClick={fetchRegistryData} 
             className="p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all group"
             title="Synchronize Assets"
           >
             <RefreshCw className={`w-6 h-6 text-zinc-500 group-hover:text-vitality ${loading ? 'animate-spin' : ''}`} />
           </button>
           <button 
            onClick={onExit} 
            className="px-10 py-5 bg-rose-950/20 border border-rose-900/30 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-4 hover:bg-rose-500 hover:text-white transition-all shadow-xl"
           >
             <LogOut className="w-5 h-5" /> Terminate Session
           </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-16">
        
        {/* KPI MODULES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { label: 'Licensed Specialists', value: stats.totalDocs, icon: Users, color: 'text-vitality' },
            { label: 'Live Encounters', value: stats.activeCases, icon: Activity, color: 'text-amber-500' },
            { label: 'Platform Volume', value: `₵${stats.revenue.toLocaleString()}`, icon: Wallet, color: 'text-blue-500' }
          ].map((kpi, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 p-12 rounded-[3rem] relative overflow-hidden group shadow-2xl">
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.6em] mb-6">{kpi.label}</p>
                <div className="flex items-baseline gap-4">
                  <h2 className={`text-6xl font-black italic tracking-tighter ${kpi.color}`}>{kpi.value}</h2>
                </div>
              </div>
              <kpi.icon className="absolute -right-6 -bottom-6 w-40 h-40 text-white/5 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-[2000ms]" />
            </div>
          ))}
        </div>

        {/* REGISTRY QUEUE */}
        <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden">
          <header className="p-12 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
            <div className="flex items-center gap-8">
               <div className="w-16 h-16 bg-slate-950 rounded-3xl flex items-center justify-center border border-slate-800 shadow-inner">
                  <Terminal className="w-8 h-8 text-vitality" />
               </div>
               <div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">Verification Queue</h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Clinical Credential Audit Active
                  </p>
               </div>
            </div>
            {loading ? <Loader2 className="w-8 h-8 animate-spin text-vitality" /> : (
              <div className="px-8 py-3 bg-vitality/10 border border-vitality/30 rounded-full text-[10px] font-black text-vitality uppercase tracking-widest">
                {pending.length} New Assets
              </div>
            )}
          </header>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800/50 text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">
                  <th className="px-12 py-8">Medical Applicant</th>
                  <th className="px-12 py-8">MDC Credentials</th>
                  <th className="px-12 py-8">Protocol Timestamp</th>
                  <th className="px-12 py-8 text-right">Auth Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {pending.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={4} className="py-40 text-center">
                      <Zap className="w-16 h-16 mx-auto mb-8 text-slate-800" />
                      <p className="text-[11px] font-black text-zinc-700 uppercase tracking-[0.8em]">Registry Synchronized</p>
                    </td>
                  </tr>
                ) : pending.map((app) => (
                  <tr key={app.id} className="group hover:bg-slate-800/20 transition-all duration-500">
                    <td className="px-12 py-10">
                      <div className="flex items-center gap-8">
                        <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-zinc-700 group-hover:border-vitality group-hover:text-vitality transition-all shadow-xl">
                          <Users className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-lg font-black italic uppercase tracking-tight text-white leading-none mb-2.5">{app.name}</p>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{app.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-12 py-10">
                      <div className="space-y-2">
                        <div className="px-4 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg inline-block">
                           <p className="text-[10px] font-black text-vitality uppercase tracking-widest">REG: {app.mdc}</p>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight italic">{app.specialty}</p>
                      </div>
                    </td>
                    <td className="px-12 py-10">
                       <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">{new Date(app.timestamp).toLocaleString()}</p>
                    </td>
                    <td className="px-12 py-10 text-right">
                      <div className="flex justify-end gap-6">
                        <button 
                          disabled={processingId === app.id}
                          onClick={() => handleReject(app.id)}
                          className="px-8 py-4 bg-slate-950 border border-rose-950/30 text-rose-500 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-lg active:scale-95"
                        >
                          Reject
                        </button>
                        <button 
                          disabled={processingId === app.id}
                          onClick={() => handleApprove(app)}
                          className="px-10 py-4 bg-vitality text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] hover:bg-emerald-400 transition-all shadow-2xl shadow-vitality/20 active:scale-95 flex items-center gap-3"
                        >
                          {processingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SYSTEM INFRASTRUCTURE STATUS */}
        <footer className="grid grid-cols-1 md:grid-cols-4 gap-10">
           {[
             { label: 'Platform Engine', status: 'Healthy', icon: Zap, color: 'text-vitality' },
             { label: 'Neural Relay', status: 'Online', icon: Server, color: 'text-blue-500' },
             { label: 'Registry Sync', status: 'Active', icon: Database, color: 'text-purple-500' },
             { label: 'Auth Gate', status: 'Secured', icon: ShieldCheck, color: 'text-emerald-500' }
           ].map((sys, i) => (
             <div key={i} className="bg-slate-900/30 border border-slate-800 p-8 rounded-3xl flex items-center gap-6 shadow-xl">
               <sys.icon className={`w-6 h-6 ${sys.color}`} />
               <div>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">{sys.label}</p>
                  <p className="text-[11px] font-black uppercase text-zinc-300 italic">{sys.status}</p>
               </div>
             </div>
           ))}
        </footer>
      </main>

    </div>
  );
};

export default AdminConsole;
