import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Calendar, TrendingUp, ChevronLeft } from 'lucide-react';

const data = [
  { day: 'Mon', score: 4 },
  { day: 'Tue', score: 5 },
  { day: 'Wed', score: 5 },
  { day: 'Thu', score: 6 },
  { day: 'Fri', score: 7 },
  { day: 'Sat', score: 8 },
  { day: 'Sun', score: 8 },
];

interface ProgressTrackerProps {
  onBack: () => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ onBack }) => {
  return (
    <div className="p-4 pb-24 h-full overflow-y-auto">
      <header className="mb-6 flex items-start gap-4">
        <button onClick={onBack} className="mt-1 p-2 bg-white border border-slate-200 rounded-full text-slate-500 hover:bg-slate-50 transition shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Your Progress</h2>
          <p className="text-slate-500 text-sm">Track your skin health journey over time.</p>
        </div>
      </header>

      {/* Main Stats Card */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/20 mb-8">
          <div className="flex items-center gap-2 mb-2 opacity-80 text-sm">
            <TrendingUp className="w-4 h-4" /> Current Trend
          </div>
          <div className="text-4xl font-bold mb-2">Improving</div>
          <p className="text-slate-400 text-sm leading-relaxed">Your skin score has increased by 40% this week. Keep up the good work!</p>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6">
        <h3 className="font-bold text-slate-900 mb-6">Weekly Health Score</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
                dy={10}
              />
              <YAxis hide domain={[0, 10]} />
              <Tooltip 
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                cursor={{stroke: '#cbd5e1', strokeWidth: 1}}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#0d9488" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorScore)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History List */}
      <h3 className="font-bold text-slate-900 mb-4 px-2">Recent Scans</h3>
      <div className="space-y-3">
          {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                        <div className="font-bold text-slate-900">Oct {20 + item}, 2023</div>
                        <div className="text-xs text-slate-400">Scan #{1023 + item}</div>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${item === 3 ? 'text-teal-600' : 'text-slate-400'}`}>
                      {5 + item}/10
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};

export default ProgressTracker;