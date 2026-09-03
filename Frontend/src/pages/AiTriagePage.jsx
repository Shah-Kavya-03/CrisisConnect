import React from 'react';
import { useCrisis } from '../context/CrisisContext';
import { Brain, Sparkles, CheckCircle2, AlertOctagon, Layers, Search, Cpu } from 'lucide-react';

export default function AiTriagePage() {
  const { requests } = useCrisis();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-900/40 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40">
        <span className="px-3 py-1 bg-purple-950 text-purple-400 border border-purple-800 rounded-full text-xs font-bold inline-block mb-2">
          NATURAL LANGUAGE SEVERITY ENGINE
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
          AI Auto-Triage Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Demonstrates how the CrisisConnect AI backend extracts critical distress signals and calculates real-time priority scores.
        </p>
      </div>

      {/* INTERACTIVE DEMO CARD */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-800/60 bg-gradient-to-br from-slate-900 to-purple-950/20 space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-lg text-white font-outfit">
              Live AI Triage Extraction Demo
            </h3>
          </div>
          <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-xs font-bold">
            MODEL: Crisis-NLP-v2.4
          </span>
        </div>

        {/* Input Text Box */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
          <span className="text-slate-400 font-bold uppercase tracking-wider block">Raw Distress Input Text:</span>
          <p className="text-base text-white font-semibold leading-relaxed">
            "Person trapped in flooded building and needs immediate rescue."
          </p>
        </div>

        {/* Extraction Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">Detected Keywords</span>
            <div className="flex flex-wrap gap-1.5">
              {['trapped', 'flooded', 'immediate rescue'].map(kw => (
                <span key={kw} className="px-2.5 py-1 bg-purple-950 text-purple-300 border border-purple-800 rounded-lg text-xs font-bold">
                  ⚡ {kw}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">Resource Category</span>
            <span className="text-lg font-extrabold text-blue-400 font-outfit block">Rescue Operation</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">Calculated Severity</span>
            <span className="text-lg font-extrabold text-red-500 font-outfit block">🔴 CRITICAL</span>
          </div>

        </div>

        {/* PRIORITY GAUGE DISPLAY */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">AI Priority Score</span>
            <span className="text-4xl font-extrabold text-red-500 font-mono">97 <span className="text-sm text-slate-400 font-normal">/ 100</span></span>
          </div>

          <div className="w-1/2 bg-slate-900 h-4 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 w-[97%] shadow-lg"></div>
          </div>
        </div>

      </div>

      {/* TABLE OF RECENT AI DECISIONS */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-base text-white font-outfit">
          Recent AI Triage Logs
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Request ID</th>
                <th className="p-3">Emergency Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">AI Urgency</th>
                <th className="p-3">Score</th>
                <th className="p-3">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-300">#{req.id}</td>
                  <td className="p-3 font-bold text-white max-w-xs truncate">{req.title}</td>
                  <td className="p-3 text-slate-300">{req.category}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold text-white ${
                      req.urgency === 'Critical' ? 'bg-red-600' :
                      req.urgency === 'High' ? 'bg-orange-500' : 'bg-amber-500'
                    }`}>
                      {req.urgency}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-purple-300">{req.aiPriorityScore}/100</td>
                  <td className="p-3 font-semibold text-blue-400">{req.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
