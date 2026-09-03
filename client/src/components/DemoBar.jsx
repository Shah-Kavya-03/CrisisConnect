import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import { Sparkles, ChevronDown, ChevronUp, User, HeartHandshake, Building2 } from 'lucide-react';

export default function DemoBar() {
  const { activeRole, setActiveRole, runDemoFlow, isSimulatingDemo, user, setUser } = useCrisis();
  const [collapsed, setCollapsed] = useState(false);

  const handleRoleSwitch = (newRole) => {
    setActiveRole(newRole);
    if (user) {
      setUser({
        ...user,
        role: newRole
      });
    }
  };

  return (
    <div className="bg-gradient-to-r from-teal-950 via-[#071E2B] to-cyan-950 border-b border-cyan-800/40 text-cyan-100 text-xs px-4 py-1.5 relative z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-cyan-300 font-black tracking-wide">QUICK EVALUATOR BAR:</span>
          <span className="text-cyan-200/80 hidden md:inline">Switch role view or simulate emergency dispatch</span>
        </div>

        {!collapsed && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-cyan-300/80 font-medium text-[11px]">Active View:</span>
            <div className="inline-flex rounded-xl bg-[#031726]/90 p-0.5 border border-cyan-800/60">
              <button
                onClick={() => handleRoleSwitch('Requester')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeRole === 'Requester' ? 'bg-sky-600 text-white shadow' : 'text-cyan-300/70 hover:text-white'
                }`}
              >
                <User className="w-3 h-3" />
                <span>Requester</span>
              </button>
              <button
                onClick={() => handleRoleSwitch('Volunteer')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeRole === 'Volunteer' ? 'bg-cyan-600 text-white shadow' : 'text-cyan-300/70 hover:text-white'
                }`}
              >
                <HeartHandshake className="w-3 h-3" />
                <span>Volunteer</span>
              </button>
              <button
                onClick={() => handleRoleSwitch('NGO')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeRole === 'NGO' || activeRole === 'Admin' ? 'bg-teal-600 text-white shadow' : 'text-cyan-300/70 hover:text-white'
                }`}
              >
                <Building2 className="w-3 h-3" />
                <span>NGO Agency</span>
              </button>
            </div>

            <button
              onClick={runDemoFlow}
              disabled={isSimulatingDemo}
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black rounded-xl shadow-md transition-transform hover:scale-105 disabled:opacity-50 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 animate-spin text-slate-950" />
              {isSimulatingDemo ? 'Simulating Live Flow...' : '🚀 Test Live Dispatch Flow'}
            </button>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-cyan-400 hover:text-white p-1"
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
