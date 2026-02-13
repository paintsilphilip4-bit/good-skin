
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Activity, Wallet, Check, X, 
  Loader2, Search, Filter, ArrowUpRight, Lock,
  Globe, Server, Zap, Database, BarChart3,
  LogOut, ChevronRight, RefreshCw, AlertTriangle
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

      // Calculate total revenue (simulated sum of earnings)
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
    const interval = setInterval(fetchRegistryData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (app: SpecialistApplication) => {
    setProcessingId(app.id);
    try {
      const docId = app.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      // 1. Create in verified_specialists
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

      // 2. Delete from pending
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
    <div className="min-h-screen bg-black text-zinc-100 font-mono selection:bg-vitality/30 p-8 md:p-12 animate-in fade-in duration-1000 overflow-x-hidden">
      
      {/* HIGH-TECH HEADER */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div>
          <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-vitality/10 border border-vitality/20 rounded-xl">
               <ShieldCheck className="w-6 h-6 text-vitality" />
             </div>
             <h1 className="text-2xl font-black uppercase italic tracking-tighter">GoodSkin <span className="text-zinc-600">Admin_Terminal</span></h1>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em]">
            <Globe className="w-3 h-3 animate-pulse" /> Global System Control • {ADMIN_EMAIL}
          </div>
        </div>

        <div className="flex gap-4">
           <button onClick={fetchRegistryData} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all">
             <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
           </button>
           <button onClick={onExit} className="px-8 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 hover:text-rose-500 transition-all">
             <LogOut className="w-4 h-4" /> Exit Terminal
           </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* KPI DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Verified Specialists', value: stats.totalDocs, icon: Users, color: 'text-vitality' },
            { label: 'Live Consultations', value: stats.activeCases, icon: Activity, color: 'text-amber-500' },
            { label: 'Platform Revenue', value: `₵${stats.revenue.toLocaleString()}`, icon: Wallet, color: 'text-blue-500' }
          ].map((kpi, i) => (
            <div key={i} className="bg-zinc-950 border border-zinc-900 p-10 rounded-[2.5rem] relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.5em] mb-4">{kpi.label}</p>
                <div className="flex items-baseline gap-4">
                  <h2 className={`text-5xl font-black italic tracking-tighter ${kpi.color}`}>{kpi.value}</h2>
                  <div className="h-1 w-12 bg-zinc-900 rounded-full" />
                </div>
              </div>
              <kpi.icon className="absolute -right-4 -bottom-4 w-32 h-32 text-zinc-900/50 group-hover:scale-110 transition-transform duration-1000" />
            </div>
          ))}
        </div>

        {/* PENDING VERIFICATION TABLE */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] overflow-hidden">
          <div className="p-10 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/20">
            <div className="flex items-center gap-6">
               <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800">
                  <Lock className="w-5 h-5 text-zinc-500" />
               </div>
               <div>
                  <h3 className="text-xl font-bold uppercase italic tracking-tight">Pending Verifications</h3>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Credentials awaiting clinical authorization</p>
               </div>
            </div>
            <div className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
              {pending.length} Requests
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-900/50 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                  <th className="px-10 py-6">Applicant</th>
                  <th className="px-10 py-6">Credentials</th>
                  <th className="px-10 py-6">Timestamp</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50">
                {loading && pending.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <Loader2 className="w-10 h-10 animate-spin mx-auto text-zinc-800" />
                    </td>
                  </tr>
                ) : pending.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center opacity-20">
                      <Zap className="w-12 h-12 mx-auto mb-4" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.5em]">No pending verifications</p>
                    </td>
                  </tr>
                ) : pending.map((app) => (
                  <tr key={app.id} className="group hover:bg-zinc-900/30 transition-all">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 group-hover:border-vitality/30 group-hover:text-vitality transition-all">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-black italic uppercase tracking-tight text-zinc-200 leading-none mb-1.5">{app.name}</p>
                          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{app.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-bold text-vitality uppercase tracking-widest">MDC: {app.mdc}</p>
                        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-tight italic">{app.specialty}</p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <p className="text-[9px] font-bold text-zinc-700 uppercase">{new Date(app.timestamp).toLocaleString()}</p>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          disabled={processingId === app.id}
                          onClick={() => handleReject(app.id)}
                          className="w-12 h-12 rounded-2xl border border-zinc-900 hover:border-rose-950 hover:bg-rose-950/20 text-zinc-800 hover:text-rose-500 transition-all flex items-center justify-center"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <button 
                          disabled={processingId === app.id}
                          onClick={() => handleApprove(app)}
                          className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-vitality/50 text-vitality transition-all flex items-center justify-center group/btn"
                        >
                          {processingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-5 h-5 group-hover/btn:scale-125 transition-transform" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SYSTEM STATUS */}
        <footer className="grid grid-cols-1 md:grid-cols-4 gap-8">
           {[
             { label: 'Core Engine', status: 'Optimal', icon: Zap },
             { label: 'Neural Relay', status: 'Online', icon: Server },
             { label: 'Ledger Node', status: 'Synchronized', icon: Database },
             { label: 'Security Layer', status: 'Enforced', icon: ShieldCheck }
           ].map((sys, i) => (
             <div key={i} className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl flex items-center gap-5">
               <sys.icon className="w-5 h-5 text-zinc-700" />
               <div>
                  <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{sys.label}</p>
                  <p className="text-[10px] font-black uppercase text-zinc-400">{sys.status}</p>
               </div>
             </div>
           ))}
        </footer>
      </div>

    </div>
  );
};

export default AdminConsole;
