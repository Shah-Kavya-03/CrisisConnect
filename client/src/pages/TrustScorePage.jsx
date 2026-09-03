import React from 'react';
import { useCrisis } from '../context/CrisisContext';
import { Award, ShieldCheck, Zap, Clock, CheckCircle2, AlertTriangle, User, TrendingUp } from 'lucide-react';

export default function TrustScorePage() {
  const { user } = useCrisis();

  const trustScore = user?.trustScore || 92;
  const completed = user?.completedAssignments || 48;
  const abandoned = user?.abandonedAssignments || 2;
  const avgMin = user?.avgResponseMinutes || 14;
  const badges = user?.badges || ['🏆 Reliable Responder', '⚡ Rapid Action', '✅ 50+ Completed Requests'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 text-center space-y-6">
        
        <div>
          <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-xs font-bold inline-block mb-2">
            RESPONDER CREDENTIALS
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
            Trust & Reliability Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            High trust scores boost dispatch priority and allow responders to accept critical life-safety assignments.
          </p>
        </div>

        {/* CIRCULAR GAUGE DISPLAY */}
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              className="text-slate-800 stroke-current"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              className="text-emerald-400 stroke-current"
              strokeWidth="8"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 * (1 - trustScore / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold text-white font-outfit">{trustScore}</span>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">out of 100</span>
            <span className="text-[10px] text-emerald-400 font-bold mt-1">Highly Reliable</span>
          </div>
        </div>

        {/* METRICS BREAKDOWN GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <div className="text-2xl font-extrabold text-emerald-400 font-outfit">{completed}</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Completed Jobs</div>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <div className="text-2xl font-extrabold text-red-400 font-outfit">{abandoned}</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Abandoned</div>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <div className="text-2xl font-extrabold text-blue-400 font-outfit">{avgMin} min</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Avg Response</div>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <div className="text-2xl font-extrabold text-purple-400 font-outfit">96%</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Success Rate</div>
          </div>
        </div>

        {/* ACHIEVEMENTS BADGES */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">
            Earned Responder Badges
          </h3>
          <div className="flex flex-wrap gap-3">
            {badges.map(badge => (
              <span
                key={badge}
                className="px-4 py-2 bg-gradient-to-r from-slate-900 to-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold shadow-md"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
