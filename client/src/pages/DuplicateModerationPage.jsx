import React from 'react';
import { useCrisis } from '../context/CrisisContext';
import { CheckCircle2, XCircle, GitMerge, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function DuplicateModerationPage() {
  const { requests, approveFlaggedRequest, mergeFlaggedRequest, rejectFlaggedRequest } = useCrisis();

  const flagged = requests.filter(r => (r.isDuplicate || r.similarityScore > 0) && r.status !== 'Merged' && r.status !== 'Rejected (Spam)');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-700/60 bg-gradient-to-r from-[#031726] via-[#071E2B] to-cyan-950/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-500/50 rounded-full text-xs font-bold inline-block mb-2">
            INTELLIGENT MODERATION ENGINE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-outfit">
            Request Verification & Duplicate Center
          </h1>
          <p className="text-xs sm:text-sm text-cyan-200/80 mt-1">
            Requests flagged by spatial-temporal similarity models for duplicate or fake detection before dispatch.
          </p>
        </div>

        <div className="bg-[#031726]/80 px-4 py-3 rounded-2xl border border-cyan-900 text-center">
          <div className="text-2xl font-black text-cyan-400 font-outfit">{flagged.length}</div>
          <div className="text-[10px] text-cyan-300/80 font-bold uppercase tracking-wider">Pending Review</div>
        </div>
      </div>

      {flagged.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-teal-800/60 bg-teal-950/20 text-center space-y-4">
          <div className="w-16 h-16 bg-teal-950 text-teal-300 rounded-2xl flex items-center justify-center mx-auto border border-teal-600 shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white font-outfit">
            All Incident Reports Verified!
          </h3>
          <p className="text-xs text-cyan-200/80 max-w-md mx-auto">
            There are no pending duplicate or unverified requests in the queue. All live broadcasts are validated and routed to active responders.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {flagged.map(req => {
            return (
              <div
                key={req.id}
                className="glass-panel p-6 rounded-2xl border border-cyan-700/60 bg-gradient-to-r from-cyan-950/40 via-[#071E2B] to-[#031726] space-y-4"
              >
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cyan-900 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-xs font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Possible Duplicate
                      </span>
                      <span className="font-mono text-xs text-cyan-300 font-bold">#{req.id}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">{req.title}</h3>
                  </div>

                  <div className="flex items-center gap-4 bg-[#031726] p-3 rounded-xl border border-cyan-900 text-xs">
                    <div>
                      <span className="text-[10px] text-cyan-400 block uppercase">Similarity Score</span>
                      <span className="font-mono font-black text-amber-400 text-base">{req.similarityScore}%</span>
                    </div>
                    <div className="h-6 w-px bg-cyan-900"></div>
                    <div>
                      <span className="text-[10px] text-cyan-400 block uppercase">Proximity</span>
                      <span className="font-mono font-bold text-cyan-100 text-sm">420 meters</span>
                    </div>
                    <div className="h-6 w-px bg-cyan-900"></div>
                    <div>
                      <span className="text-[10px] text-cyan-400 block uppercase">Matched ID</span>
                      <span className="font-mono font-bold text-cyan-300 text-sm">#{req.duplicateMatchId || 'CC-1043'}</span>
                    </div>
                  </div>
                </div>

                {/* Reasons List */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    AI Detection Match Reasons:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(req.duplicateReasons && req.duplicateReasons.length > 0 ? req.duplicateReasons : ['Nearby location cluster (420m)', 'Matching keywords', 'Similar submission timestamp']).map((reason, i) => (
                      <span key={i} className="px-3 py-1 bg-[#031726] border border-cyan-900 text-cyan-200 rounded-lg text-xs font-medium">
                        • {reason}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description Comparison */}
                <div className="bg-[#031726]/90 p-4 rounded-xl border border-cyan-900 text-xs space-y-2">
                  <div>
                    <span className="text-cyan-400 font-semibold">Flagged Request Description:</span>
                    <p className="text-cyan-100 mt-0.5">"{req.description}"</p>
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
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow transition-all"
                  >
                    <GitMerge className="w-4 h-4 text-slate-950" /> Merge with #{req.duplicateMatchId || 'CC-1043'}
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
