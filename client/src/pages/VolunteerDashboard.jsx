import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import { Award, ShieldCheck, MapPin, Clock, Filter, AlertTriangle, ArrowUpDown, ChevronRight, CheckCircle2, Navigation, AlertOctagon, UserCheck } from 'lucide-react';

export default function VolunteerDashboard({ setActiveTab, setSelectedRequestId }) {
  const { requests, updateRequestStatus, user } = useCrisis();

  const [severityFilter, setSeverityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // SORT REQUESTS BY SEVERITY & AI PRIORITY SCORE FIRST!
  const sortedRequests = [...requests].sort((a, b) => {
    // Critical first, then High, Medium, Low
    const priorityWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    const wA = priorityWeight[a.urgency] || 0;
    const wB = priorityWeight[b.urgency] || 0;

    if (wA !== wB) return wB - wA;
    return (b.aiPriorityScore || 0) - (a.aiPriorityScore || 0);
  });

  const filteredRequests = sortedRequests.filter(req => {
    if (severityFilter !== 'All' && req.urgency !== severityFilter) return false;
    if (categoryFilter !== 'All' && !req.category.toLowerCase().includes(categoryFilter.toLowerCase())) return false;
    return true;
  });

  const activeAssignmentsCount = requests.filter(r => r.assignedTo && r.assignedTo.name === user?.name && r.status !== 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* HEADER & VOLUNTEER PROFILE BAR */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 text-xs font-bold">
              VERIFIED RESPONDER
            </span>
            <span className="text-xs text-slate-400 font-medium">ID: VOL-802</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
            Volunteer Response Center
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Logged in as: <strong className="text-white">{user?.name}</strong> • Active Status: <span className="text-emerald-400 font-bold">🟢 Available for Dispatch</span>
          </p>
        </div>

        {/* TRUST SCORE BADGE COUNTER */}
        <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          <div className="text-center cursor-pointer" onClick={() => setActiveTab('trust-score')}>
            <div className="text-2xl font-extrabold text-emerald-400 font-outfit">
              {user?.trustScore || 92}<span className="text-xs text-slate-500 font-normal">/100</span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Trust Score</div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="text-center">
            <div className="text-2xl font-extrabold text-blue-400 font-outfit">{activeAssignmentsCount}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Active</div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="text-center">
            <div className="text-2xl font-extrabold text-slate-200 font-outfit">{user?.completedAssignments || 48}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Completed</div>
          </div>
        </div>
      </div>

      {/* FILTER & SORT CONTROLS BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-red-500" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Feed Priority: Sorted by AI Urgency Score (0-100)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Severity Pills */}
          <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
            {['All', 'Critical', 'High', 'Medium'].map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  severityFilter === sev
                    ? 'bg-red-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
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
                  ? 'border-red-600/60 bg-gradient-to-r from-red-950/30 via-slate-900 to-slate-900'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left Request Specs */}
                <div className="space-y-2 flex-1">
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black text-white ${
                      req.urgency === 'Critical' ? 'bg-red-600 animate-pulse' :
                      req.urgency === 'High' ? 'bg-orange-500' :
                      req.urgency === 'Medium' ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}>
                      🔴 {req.urgency.toUpperCase()}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
                      {req.category}
                    </span>

                    <span className="font-mono text-xs text-slate-400 font-bold">#{req.id}</span>

                    {/* AI Score Badge */}
                    <span className="px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 text-xs font-mono font-bold border border-red-800/80">
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

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    "{req.description}"
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-200">
                      <Navigation className="w-3.5 h-3.5 text-red-500" /> {req.distanceKm} km away
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> {req.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> Received 15m ago
                    </span>
                  </div>

                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-row lg:flex-col gap-2 min-w-[200px]">
                  {req.status === 'Awaiting Help' ? (
                    <button
                      onClick={() => updateRequestStatus(req.id, 'Assigned')}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs shadow-lg transition-transform hover:scale-105 border border-red-400/40"
                    >
                      ⚡ Claim & Accept (30m Lease)
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
                      ✅ Mark Complete & Resolved
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 py-3 px-4 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs border border-slate-700 cursor-not-allowed"
                    >
                      Status: {req.status}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedRequestId(req.id);
                      setActiveTab('request-details');
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-800 flex items-center justify-center gap-1"
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
