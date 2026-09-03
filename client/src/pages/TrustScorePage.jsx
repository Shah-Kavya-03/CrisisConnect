import React from 'react';
import { useCrisis } from '../context/CrisisContext';

export default function TrustScorePage() {
  const { user } = useCrisis();

  const trustScore = user?.trustScore || 96;
  const completed = user?.completedAssignments || 52;
  const abandoned = user?.abandonedAssignments || 0;
  const avgMin = user?.avgResponseMinutes || 11;
  const badges = user?.badges || ['🏆 Reliable Responder', '⚡ Rapid Action', '✅ 50+ Completed Requests'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-700/60 text-center space-y-6">
        
        <div>
          <span className="px-3 py-1 bg-teal-950 text-teal-300 border border-teal-500/50 rounded-full text-xs font-bold inline-block mb-2">
            RESPONDER CREDENTIALS • GOVERNED BY PRINCIPAL ADMIN AUTHORITY
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-outfit">
            Trust & Reliability Profile
          </h1>
          <p className="text-xs sm:text-sm text-cyan-200/80">
            Trust scores are exclusively calibrated and verified by the <strong>Principal Admin Authority</strong> based on verified GPS responses and community feedback. Relief NGOs and agencies have no direct authority over trust score ratings.
          </p>
        </div>

        {/* CIRCULAR GAUGE DISPLAY */}
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              className="text-[#031726] stroke-current"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              className="text-teal-400 stroke-current"
              strokeWidth="8"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 * (1 - trustScore / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white font-outfit">{trustScore}</span>
            <span className="text-xs text-cyan-300/70 font-bold uppercase tracking-wider">out of 100</span>
            <span className="text-[10px] text-teal-300 font-bold mt-1">Highly Verified</span>
          </div>
        </div>

        {/* METRICS BREAKDOWN GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#031726]/90 p-4 rounded-2xl border border-cyan-900">
            <div className="text-2xl font-black text-teal-300 font-outfit">{completed}</div>
            <div className="text-xs text-cyan-300/80 font-semibold mt-1">Completed Jobs</div>
          </div>

          <div className="bg-[#031726]/90 p-4 rounded-2xl border border-cyan-900">
            <div className="text-2xl font-black text-red-400 font-outfit">{abandoned}</div>
            <div className="text-xs text-cyan-300/80 font-semibold mt-1">Abandoned</div>
          </div>

          <div className="bg-[#031726]/90 p-4 rounded-2xl border border-cyan-900">
            <div className="text-2xl font-black text-cyan-400 font-outfit">{avgMin} min</div>
            <div className="text-xs text-cyan-300/80 font-semibold mt-1">Avg Response</div>
          </div>

          <div className="bg-[#031726]/90 p-4 rounded-2xl border border-cyan-900">
            <div className="text-2xl font-black text-sky-400 font-outfit">98%</div>
            <div className="text-xs text-cyan-300/80 font-semibold mt-1">Success Rate</div>
          </div>
        </div>

        {/* ACHIEVEMENTS BADGES */}
        <div className="pt-4 border-t border-cyan-900 space-y-3">
          <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider text-left">
            Earned Responder Badges
          </h3>
          <div className="flex flex-wrap gap-3">
            {badges.map(badge => (
              <span
                key={badge}
                className="px-4 py-2 bg-[#031726] text-cyan-200 border border-cyan-800 rounded-xl text-xs font-bold shadow-md"
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
