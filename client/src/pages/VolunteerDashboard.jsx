import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import { Award, ShieldCheck, MapPin, Clock, ArrowUpDown, ChevronRight, CheckCircle2, Navigation, HeartHandshake } from 'lucide-react';

export default function VolunteerDashboard({ setActiveTab, setSelectedRequestId }) {
  const { requests, updateRequestStatus, user } = useCrisis();

  const [severityFilter, setSeverityFilter] = useState('All');

  // SORT REQUESTS BY SEVERITY & AI PRIORITY SCORE FIRST
  const sortedRequests = [...requests].sort((a, b) => {
    const priorityWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    const wA = priorityWeight[a.urgency] || 0;
    const wB = priorityWeight[b.urgency] || 0;

    if (wA !== wB) return wB - wA;
    return (b.aiPriorityScore || 0) - (a.aiPriorityScore || 0);
  });

  const filteredRequests = sortedRequests.filter(req => {
    if (severityFilter !== 'All' && req.urgency !== severityFilter) return false;
    return true;
  });

  const activeAssignmentsCount = requests.filter(r => r.assignedTo && r.assignedTo.name === user?.name && r.status !== 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* HEADER & VOLUNTEER PROFILE BAR */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-800/60 bg-gradient-to-r from-[#031726] via-[#071E2B] to-cyan-950/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/50 text-xs font-bold inline-flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-cyan-400" />
              <span>VERIFIED VOLUNTEER RESPONDER</span>
            </span>
            <span className="text-xs text-cyan-300/70 font-semibold">ID: VOL-802</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-outfit">
            Volunteer Response Feed
          </h1>
          <p className="text-xs text-cyan-200/80 mt-1">
            Responder: <strong className="text-white">{user?.name || 'Dr. Rahul Verma'}</strong> • Status: <span className="text-teal-400 font-bold">🟢 Active & Ready for Emergency Dispatch</span>
          </p>
        </div>

        {/* TRUST SCORE BADGE COUNTER */}
        <div className="flex items-center gap-4 bg-[#031726]/90 p-4 rounded-2xl border border-cyan-900/80">
          <div className="text-center cursor-pointer" onClick={() => setActiveTab('trust-score')}>
            <div className="text-2xl font-black text-cyan-400 font-outfit">
              {user?.trustScore || 96}<span className="text-xs text-cyan-500/70 font-normal">/100</span>
            </div>
            <div className="text-[10px] text-cyan-300/80 uppercase tracking-wider font-bold">Trust Score</div>
          </div>
          <div className="h-8 w-px bg-cyan-900/80"></div>
          <div className="text-center">
            <div className="text-2xl font-black text-teal-300 font-outfit">{activeAssignmentsCount}</div>
            <div className="text-[10px] text-cyan-300/80 uppercase tracking-wider font-bold">Active</div>
          </div>
          <div className="h-8 w-px bg-cyan-900/80"></div>
          <div className="text-center">
            <div className="text-2xl font-black text-sky-400 font-outfit">{user?.completedAssignments || 52}</div>
            <div className="text-[10px] text-cyan-300/80 uppercase tracking-wider font-bold">Completed</div>
          </div>
        </div>
      </div>

      {/* FILTER & SORT CONTROLS BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-cyan-900/60">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Urgency Feed: Sorted by AI Priority Score (0-100)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-[#031726] p-1 border border-cyan-900/80 text-xs">
            {['All', 'Critical', 'High', 'Medium'].map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  severityFilter === sev
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow'
                    : 'text-cyan-300/70 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PRIORITY REQUEST FEED GRID */}
      <div className="space-y-4">
        {filteredRequests.map(req => {
          const isCritical = req.urgency === 'Critical';

          return (
            <div
              key={req.id}
              className={`glass-panel p-6 rounded-2xl border transition-all ${
                isCritical
                  ? 'border-cyan-500/70 bg-gradient-to-r from-cyan-950/40 via-[#071E2B] to-[#031726]'
                  : 'border-cyan-900/60 hover:border-cyan-500/60'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left Request Specs */}
                <div className="space-y-2 flex-1">
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black text-white ${
                      req.urgency === 'Critical' ? 'bg-red-600 animate-pulse' :
                      req.urgency === 'High' ? 'bg-amber-600' : 'bg-teal-600'
                    }`}>
                      🔴 {req.urgency.toUpperCase()}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full bg-[#031726] text-cyan-200 text-xs font-bold border border-cyan-800">
                      {req.category}
                    </span>

                    <span className="font-mono text-xs text-cyan-400 font-bold">#{req.id}</span>

                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/40">
                      AI Priority: {req.aiPriorityScore}/100
                    </span>

                    {req.isDuplicate && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 text-xs font-bold border border-amber-800">
                        ⚠️ Duplicate Flagged ({req.similarityScore}%)
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug">
                    {req.title}
                  </h3>

                  <p className="text-xs text-cyan-100/80 leading-relaxed line-clamp-2">
                    "{req.description}"
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-cyan-300/70 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-cyan-200">
                      <Navigation className="w-3.5 h-3.5 text-cyan-400" /> {req.distanceKm} km away
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {req.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" /> Received 15m ago
                    </span>
                  </div>

                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-row lg:flex-col gap-2 min-w-[200px]">
                  {req.status === 'Awaiting Help' ? (
                    <button
                      onClick={() => updateRequestStatus(req.id, 'Assigned')}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-xs shadow-lg transition-transform hover:scale-105 border border-cyan-300/60"
                    >
                      ⚡ Claim & Accept Dispatch
                    </button>
                  ) : req.status === 'Assigned' ? (
                    <button
                      onClick={() => updateRequestStatus(req.id, 'En Route')}
                      className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-lg transition-transform hover:scale-105 border border-amber-400/40"
                    >
                      🚚 Mark En Route
                    </button>
                  ) : req.status === 'En Route' ? (
                    <button
                      onClick={() => updateRequestStatus(req.id, 'Resolved')}
                      className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition-transform hover:scale-105 border border-emerald-400/40"
                    >
                      ✅ Mark Completed & Resolved
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 py-3 px-4 rounded-xl bg-[#031726] text-cyan-400 font-bold text-xs border border-cyan-900 cursor-not-allowed"
                    >
                      Status: {req.status}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedRequestId(req.id);
                      setActiveTab('request-details');
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#031726] hover:bg-cyan-950 text-cyan-200 font-bold text-xs border border-cyan-900 flex items-center justify-center gap-1"
                  >
                    <span>View Dossier & Map</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
