import React from 'react';
import { 
  TrendingUp, Users, Wallet, CreditCard, 
  ExternalLink, FileText, Calendar, DollarSign,
  ChevronRight, History as HistoryIcon
} from 'lucide-react';
import { ConsultationHistoryRecord } from '../types';

interface SpecialistStatsProps {
  history: ConsultationHistoryRecord[];
  onViewNotes: (record: ConsultationHistoryRecord) => void;
}

const SpecialistStats: React.FC<SpecialistStatsProps> = ({ history, onViewNotes }) => {
  const totalConsultations = history.length;
  const lifetimeEarnings = history.reduce((sum, record) => sum + record.fee, 0);
  const pendingPayout = lifetimeEarnings * 0.15; 

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-6 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Consultations Done</h4>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-black text-slate-900 tracking-tighter italic">{totalConsultations}</p>
              <span className="text-emerald-500 text-[10px] font-black mb-1.5 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
              </span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
            <Users className="w-32 h-32" />
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group hover:shadow-teal-900/20 transition-all duration-500">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Lifetime Earnings</h4>
            <p className="text-4xl font-black tracking-tighter italic">${lifetimeEarnings.toLocaleString()}</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-[0.05] group-hover:scale-110 transition-transform duration-1000">
            <DollarSign className="w-32 h-32" />
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Available for Payout</h4>
            <p className="text-4xl font-black text-slate-900 tracking-tighter italic">${pendingPayout.toFixed(2)}</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
            <CreditCard className="w-32 h-32" />
          </div>
        </div>
      </div>

      {/* History Table Container */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <header className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
          <div>
            <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">Registry History</h4>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit Log of Completed Clinical Sessions</p>
          </div>
          <div className="flex gap-3">
             <button className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-teal-600 transition-colors">
               Latest First
             </button>
          </div>
        </header>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clinical Date</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient Details</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Professional Fee</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.map((record) => (
                <tr key={record.id} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-300">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{record.date}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl overflow-hidden shadow-inner border border-white">
                        <img src={record.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Case" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight">{record.patientName}</p>
                        <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest">{record.condition}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl text-emerald-600 font-black text-sm tracking-tighter">
                      +${record.fee}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => onViewNotes(record)}
                      className="p-3 bg-slate-50 text-slate-400 hover:text-teal-600 rounded-xl transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-300">
               <HistoryIcon className="w-12 h-12 mb-4 opacity-20" />
               <p className="text-xs font-black uppercase tracking-widest">No history recorded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecialistStats;