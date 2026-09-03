import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import { Play, Sparkles, User, Shield, Activity, ChevronDown, ChevronUp } from 'lucide-react';

export default function DemoBar() {
  const { activeRole, setActiveRole, runDemoFlow, isSimulatingDemo, triggerSOS } = useCrisis();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-gradient-to-r from-red-950 via-slate-900 to-blue-950 border-b border-red-900/40 text-slate-200 text-xs px-4 py-2 relative z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-red-400 font-bold tracking-wide">HACKATHON DEMO CONTROL:</span>
          <span className="text-slate-300 hidden md:inline">Switch views instantly or trigger live emergency dispatch sequence</span>
        </div>

        {!collapsed && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium">Switch Role:</span>
            <div className="inline-flex rounded-lg bg-slate-800/90 p-0.5 border border-slate-700">
              <button
                onClick={() => setActiveRole('Requester')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeRole === 'Requester' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Requester
              </button>
              <button
                onClick={() => setActiveRole('Volunteer')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeRole === 'Volunteer' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Volunteer
              </button>
              <button
                onClick={() => setActiveRole('Admin')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeRole === 'Admin' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Admin Command
              </button>
            </div>

            <button
              onClick={runDemoFlow}
              disabled={isSimulatingDemo}
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-lg shadow-md transition-transform hover:scale-105 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              {isSimulatingDemo ? 'Simulating Live Flow...' : '🚀 Launch 30s Live Demo Flow'}
            </button>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white p-1"
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
