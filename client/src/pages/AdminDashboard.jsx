import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import CrisisMap from '../components/CrisisMap';
import { Building2, Layers } from 'lucide-react';

export default function AdminDashboard({ setActiveTab, setSelectedRequestId }) {
  const { requests, exportRequestsCsv } = useCrisis();
  const [mapCategory, setMapCategory] = useState('All');

  const criticalCount = requests.filter(r => r.urgency === 'Critical' && r.status !== 'Resolved').length;
  const highCount = requests.filter(r => r.urgency === 'High' && r.status !== 'Resolved').length;
  const activeCount = requests.filter(r => r.status !== 'Resolved').length;
  const resolvedCount = requests.filter(r => r.status === 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* COMMAND CENTER HEADER */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-teal-700/60 bg-gradient-to-r from-[#031726] via-[#071E2B] to-cyan-950/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/50 text-xs font-bold inline-flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-teal-400" />
              <span>NGO OVERWATCH & AGENCY COMMAND</span>
            </span>
            <span className="text-xs text-cyan-300/70 font-semibold">HQ DISPATCH CENTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-outfit">
            NGO Command & Fleet Center
          </h1>
          <p className="text-xs text-cyan-200/80 mt-1">
            Real-time geospatial heatmap of emergency requests, NGO fleet distribution, and resource gaps.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportRequestsCsv}
            className="px-4 py-2.5 bg-teal-950 hover:bg-teal-900 text-teal-300 font-bold rounded-xl border border-teal-700 text-xs flex items-center gap-1.5 transition-all"
          >
            <span>📊 Export Incident CSV Report</span>
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className="px-4 py-2.5 bg-amber-950 hover:bg-amber-900 text-amber-300 font-bold rounded-xl border border-amber-800 text-xs flex items-center gap-1.5 transition-all"
          >
            <span>🔍 AI Duplicate Moderation</span>
          </button>
          <button
            onClick={() => setActiveTab('ai-triage')}
            className="px-4 py-2.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-200 font-bold rounded-xl border border-cyan-700 text-xs flex items-center gap-1.5 transition-all"
          >
            <span>🧠 AI Severity Triage</span>
          </button>
        </div>
      </div>

      {/* TOP 6 KPI STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-panel p-4 rounded-2xl border border-red-900/60 bg-red-950/30 text-center">
          <div className="text-2xl font-black text-red-500 font-outfit">{criticalCount}</div>
          <div className="text-[10px] text-red-300 font-bold uppercase tracking-wider mt-1">🔴 Critical</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-amber-900/60 bg-amber-950/30 text-center">
          <div className="text-2xl font-black text-amber-400 font-outfit">{highCount}</div>
          <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider mt-1">🟠 High Priority</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-cyan-900/60 bg-cyan-950/30 text-center">
          <div className="text-2xl font-black text-cyan-400 font-outfit">{activeCount}</div>
          <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider mt-1">🟡 Active Incidents</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-teal-900/60 bg-teal-950/30 text-center">
          <div className="text-2xl font-black text-teal-300 font-outfit">{resolvedCount + 14}</div>
          <div className="text-[10px] text-teal-300 font-bold uppercase tracking-wider mt-1">🟢 Resolved Today</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-sky-900/60 bg-sky-950/30 text-center">
          <div className="text-2xl font-black text-sky-400 font-outfit">128</div>
          <div className="text-[10px] text-sky-300 font-bold uppercase tracking-wider mt-1">👥 Volunteers</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-cyan-900/60 bg-cyan-950/30 text-center">
          <div className="text-2xl font-black text-cyan-300 font-outfit">14</div>
          <div className="text-[10px] text-cyan-200 font-bold uppercase tracking-wider mt-1">🏢 Active NGOs</div>
        </div>
      </div>

      {/* MAIN HEATMAP + UNMET DEMAND SIDE PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* HEATMAP MAIN COLUMN */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="glass-panel p-4 rounded-2xl border border-cyan-900/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-sm text-white font-outfit">
                Live Incident Map & GPS Cluster Overwatch
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1">
              {['All', 'Medical', 'Food', 'Water', 'Shelter', 'Rescue'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setMapCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    mapCategory === cat
                      ? 'bg-cyan-500 text-slate-950 font-black shadow'
                      : 'bg-[#031726] text-cyan-300/70 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Map */}
          <CrisisMap
            requests={requests}
            categoryFilter={mapCategory}
            onSelectRequest={id => {
              setSelectedRequestId(id);
              setActiveTab('request-details');
            }}
          />

        </div>

        {/* UNMET RESOURCE DEMAND SIDE PANEL */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-cyan-900/60 space-y-4">
            
            <div>
              <h3 className="font-bold text-base text-white font-outfit flex items-center justify-between">
                <span>Unmet Resource Shortages</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/40">
                  CRITICAL GAPS
                </span>
              </h3>
              <p className="text-xs text-cyan-200/70 mt-1">
                Resource gap telemetry for NGOs to deploy emergency aid trucks and rescue boats.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { category: 'Medical Supplies & Insulin', count: 42, color: 'bg-cyan-500', percent: 85 },
                { category: 'Clean Drinking Water', count: 31, color: 'bg-teal-500', percent: 65 },
                { category: 'Food Packets & Rations', count: 27, color: 'bg-[#0891B2]', percent: 55 },
                { category: 'Shelter & Tarpaulins', count: 19, color: 'bg-sky-500', percent: 40 },
                { category: 'Rooftop Rescue Equipment', count: 12, color: 'bg-emerald-500', percent: 30 }
              ].map(item => (
                <div key={item.category} className="bg-[#031726] p-3.5 rounded-xl border border-cyan-900/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-cyan-100">{item.category}</span>
                    <span className="text-cyan-400 font-mono">{item.count} requests</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#071E2B] overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('volunteer-feed')}
              className="w-full py-3 bg-[#031726] hover:bg-cyan-950 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-800 text-center transition-colors"
            >
              Dispatch Supplies to Top Demand Zone
            </button>

          </div>
        </div>

      </div>

    </div>
  );
}
