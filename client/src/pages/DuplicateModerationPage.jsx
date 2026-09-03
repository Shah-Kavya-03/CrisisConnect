import React from 'react';
import { useCrisis } from '../context/CrisisContext';
import { Search, ShieldAlert, CheckCircle2, XCircle, GitMerge, AlertTriangle, MapPin, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function DuplicateModerationPage() {
  const { requests, approveFlaggedRequest, mergeFlaggedRequest, rejectFlaggedRequest } = useCrisis();

  const flagged = requests.filter(r => (r.isDuplicate || r.similarityScore > 0) && r.status !== 'Merged' && r.status !== 'Rejected (Spam)');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-900/40 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-amber-950 text-amber-400 border border-amber-800 rounded-full text-xs font-bold inline-block mb-2">
            INTELLIGENT MODERATION ENGINE
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
            Request Verification & Duplicate Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Requests flagged by spatial-temporal NLP similarity models for duplicate or fake detection before dispatch.
          </p>
        </div>

        <div className="bg-slate-950/80 px-4 py-3 rounded-2xl border border-slate-800 text-center">
          <div className="text-2xl font-extrabold text-amber-400 font-outfit">{flagged.length}</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Review</div>
        </div>
      </div>

      {flagged.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-emerald-900/40 bg-emerald-950/10 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-950/80 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-800 shadow-lg shadow-emerald-950">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white font-outfit">
            All Incident Reports Verified!
          </h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            There are no pending duplicate or unverified requests in the queue. All live broadcasts are validated and routed to active responders.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {flagged.map(req => {
            return (
              <div
                key={req.id}
                className="glass-panel p-6 rounded-2xl border border-amber-700/60 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900 space-y-4"
              >
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-xs font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Possible Duplicate
                      </span>
                      <span className="font-mono text-xs text-slate-400 font-bold">#{req.id}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">{req.title}</h3>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Similarity Score</span>
                      <span className="font-mono font-extrabold text-amber-400 text-base">{req.similarityScore}%</span>
                    </div>
                    <div className="h-6 w-px bg-slate-800"></div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Proximity</span>
                      <span className="font-mono font-bold text-slate-200 text-sm">420 meters</span>
                    </div>
                    <div className="h-6 w-px bg-slate-800"></div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Matched ID</span>
                      <span className="font-mono font-bold text-blue-400 text-sm">#{req.duplicateMatchId || 'CC-1043'}</span>
                    </div>
                  </div>
                </div>

                {/* Reasons List */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    AI Detection Match Reasons:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(req.duplicateReasons && req.duplicateReasons.length > 0 ? req.duplicateReasons : ['Nearby location cluster (420m)', 'Matching keywords', 'Similar submission timestamp']).map((reason, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-xs font-medium">
                        • {reason}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description Comparison */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div>
                    <span className="text-slate-400 font-semibold">Flagged Request Description:</span>
                    <p className="text-slate-200 mt-0.5">"{req.description}"</p>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => approveFlaggedRequest(req.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve as Legitimate
                  </button>

                  <button
                    onClick={() => mergeFlaggedRequest(req.id, req.duplicateMatchId || 'CC-1043')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all"
                  >
                    <GitMerge className="w-4 h-4" /> Merge with #{req.duplicateMatchId || 'CC-1043'}
                  </button>

                  <button
                    onClick={() => rejectFlaggedRequest(req.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all"
                  >
                    <XCircle className="w-4 h-4" /> Reject as Fake / Spam
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

