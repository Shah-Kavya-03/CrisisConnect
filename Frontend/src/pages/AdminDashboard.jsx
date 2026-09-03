import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import CrisisMap from '../components/CrisisMap';
import { ShieldAlert, Users, Building2, CheckCircle2, Clock, MapPin, Filter, BarChart3, AlertOctagon, Layers } from 'lucide-react';

export default function AdminDashboard({ setActiveTab, setSelectedRequestId }) {
  const { requests } = useCrisis();
  const [mapCategory, setMapCategory] = useState('All');

  const criticalCount = requests.filter(r => r.urgency === 'Critical' && r.status !== 'Resolved').length;
  const highCount = requests.filter(r => r.urgency === 'High' && r.status !== 'Resolved').length;
  const activeCount = requests.filter(r => r.status !== 'Resolved').length;
  const resolvedCount = requests.filter(r => r.status === 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* COMMAND CENTER HEADER */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-900/40 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-400 border border-purple-800 text-xs font-bold">
              SYSTEM OVERWATCH
            </span>
            <span className="text-xs text-slate-400 font-medium">DISASTER RESPONSE HQ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
            CrisisConnect Emergency Command Center
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Live overview of disaster severity clusters, volunteer allocation, and unmet resource shortages.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('moderation')}
            className="px-4 py-2.5 bg-amber-950 hover:bg-amber-900 text-amber-300 font-bold rounded-xl border border-amber-800 text-xs flex items-center gap-1.5"
          >
            <span>🔍 Duplicate Moderation</span>
          </button>
          <button
            onClick={() => setActiveTab('ai-triage')}
            className="px-4 py-2.5 bg-purple-900 hover:bg-purple-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
          >
            <span>🧠 AI Severity Engine</span>
          </button>
        </div>
      </div>

      {/* TOP 6 KPI STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-panel p-4 rounded-2xl border border-red-900/50 bg-red-950/20 text-center">
          <div className="text-2xl font-extrabold text-red-500 font-outfit">{criticalCount}</div>
          <div className="text-[10px] text-red-300 font-bold uppercase tracking-wider mt-1">🔴 Critical</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-orange-900/50 bg-orange-950/20 text-center">
          <div className="text-2xl font-extrabold text-orange-400 font-outfit">{highCount}</div>
          <div className="text-[10px] text-orange-300 font-bold uppercase tracking-wider mt-1">🟠 High Priority</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-amber-900/50 bg-amber-950/20 text-center">
          <div className="text-2xl font-extrabold text-amber-400 font-outfit">{activeCount}</div>
          <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider mt-1">🟡 Active Total</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-emerald-900/50 bg-emerald-950/20 text-center">
          <div className="text-2xl font-extrabold text-emerald-400 font-outfit">{resolvedCount + 14}</div>
          <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider mt-1">🟢 Resolved Today</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-blue-900/50 bg-blue-950/20 text-center">
          <div className="text-2xl font-extrabold text-blue-400 font-outfit">128</div>
          <div className="text-[10px] text-blue-300 font-bold uppercase tracking-wider mt-1">👥 Volunteers</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-purple-900/50 bg-purple-950/20 text-center">
          <div className="text-2xl font-extrabold text-purple-400 font-outfit">14</div>
          <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider mt-1">🏢 Active NGOs</div>
        </div>
      </div>

      {/* MAIN HEATMAP + UNMET DEMAND SIDE PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* HEATMAP MAIN COLUMN */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-sm text-white font-outfit">
                Live Resource Heatmap & Clusters
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
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
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
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            
            <div>
              <h3 className="font-bold text-base text-white font-outfit flex items-center justify-between">
                <span>Unmet Resource Shortages</span>
                <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 text-xs font-mono font-bold">
                  CRITICAL GAPS
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Visual guidance for NGOs to dispatch relief supplies to unserved emergency zones.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { category: 'Medical Supplies & Insulin', count: 42, color: 'bg-red-600', percent: 85 },
                { category: 'Clean Drinking Water', count: 31, color: 'bg-orange-500', percent: 65 },
                { category: 'Food Packets & Rations', count: 27, color: 'bg-amber-500', percent: 55 },
                { category: 'Shelter & Tarpaulins', count: 19, color: 'bg-blue-500', percent: 40 },
                { category: 'Rooftop Rescue Equipment', count: 12, color: 'bg-purple-500', percent: 30 }
              ].map(item => (
                <div key={item.category} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-200">{item.category}</span>
                    <span className="text-red-400 font-mono">{item.count} requests</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
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
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-blue-400 font-bold text-xs rounded-xl border border-slate-800 text-center"
            >
              Dispatch Supplies to Top Demand Zone
            </button>

          </div>
        </div>

      </div>

    </div>
  );
}
