import React, { useState, useEffect } from 'react';
import { useCrisis } from '../context/CrisisContext';
import CrisisMap from '../components/CrisisMap';
import { MapPin, Phone, User, Clock, ShieldAlert, CheckCircle2, ArrowLeft, AlertTriangle, Send, Navigation, FileText, RefreshCw, MessageSquare, Timer } from 'lucide-react';

export default function RequestDetailsPage({ setActiveTab }) {
  const { selectedRequest, updateRequestStatus, renewRequest, addRequestComment, user } = useCrisis();
  const [commentInput, setCommentInput] = useState('');
  const [timeLeft, setTimeLeft] = useState('28m 42s');

  useEffect(() => {
    if (!selectedRequest?.expiresAt) return;
    const interval = setInterval(() => {
      const diff = new Date(selectedRequest.expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Lease Expired (Re-entering Pool)');
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins}m ${secs < 10 ? '0' : ''}${secs}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedRequest?.expiresAt]);

  if (!selectedRequest) return (
    <div className="max-w-4xl mx-auto p-8 text-center text-slate-400">
      Select a request from the Volunteer Feed to view details.
    </div>
  );

  const steps = [
    { key: 'Created', label: 'Request Created', desc: 'Emergency broadcast submitted' },
    { key: 'AI Triaged', label: 'AI Triaged', desc: `Scored ${selectedRequest.aiPriorityScore}/100 priority` },
    { key: 'Assigned', label: 'Volunteer Assigned', desc: selectedRequest.assignedTo ? selectedRequest.assignedTo.name : 'Awaiting assignment' },
    { key: 'En Route', label: 'Volunteer En Route', desc: 'Responder dispatched to location' },
    { key: 'Resolved', label: 'Request Resolved', desc: 'Emergency resolved' }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === selectedRequest.status);

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addRequestComment(selectedRequest.id, commentInput, user?.name);
    setCommentInput('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('volunteer-feed')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Priority Feed
        </button>

        <button
          onClick={() => renewRequest(selectedRequest.id)}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-blue-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Extend 4h Emergency Lease
        </button>
      </div>

      {/* Main Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black text-white ${
                selectedRequest.urgency === 'Critical' ? 'bg-red-600' :
                selectedRequest.urgency === 'High' ? 'bg-orange-500' : 'bg-amber-500'
              }`}>
                🔴 {selectedRequest.urgency.toUpperCase()}
              </span>
              <span className="font-mono text-xs text-slate-400 font-bold">#{selectedRequest.id}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
                {selectedRequest.category}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
              {selectedRequest.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* 30-min Lease Timer Badge */}
            <div className="bg-amber-950/80 p-3 rounded-2xl border border-amber-800 text-center min-w-[130px]">
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                <Timer className="w-3 h-3 text-amber-400" /> Lease Timer
              </span>
              <span className="text-lg font-extrabold text-white font-mono">{timeLeft}</span>
            </div>

            {/* AI Priority Score */}
            <div className="bg-red-950 p-3.5 rounded-2xl border border-red-800 text-center min-w-[110px]">
              <span className="text-[10px] text-red-300 font-bold uppercase tracking-wider block">AI Score</span>
              <span className="text-2xl font-extrabold text-white font-mono">{selectedRequest.aiPriorityScore}<span className="text-xs text-red-400 font-normal">/100</span></span>
            </div>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Response Dispatch Timeline
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {steps.map((step, idx) => {
              const isPastOrCurrent = idx <= (currentStepIndex === -1 ? 1 : currentStepIndex);
              return (
                <div
                  key={step.key}
                  className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${
                    isPastOrCurrent
                      ? 'bg-blue-950/60 border-blue-600/80 text-blue-200 shadow'
                      : 'bg-slate-900/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>Step {idx + 1}</span>
                    {isPastOrCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                  <div className="font-bold text-white text-xs">{step.label}</div>
                  <div className="text-[10px] opacity-80">{step.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info & Map Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          <div className="space-y-4">
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" /> Requester & Dispatch Details
              </h4>
              <div className="text-xs space-y-1.5 text-slate-300">
                <div>Name: <strong className="text-white">{selectedRequest.requesterName}</strong></div>
                <div>Phone: <strong className="text-blue-400">{selectedRequest.requesterPhone}</strong></div>
                <div>Distance: <strong className="text-emerald-400">{selectedRequest.distanceKm} km away</strong></div>
                <div>Address: <strong className="text-slate-200">{selectedRequest.location}</strong></div>
                {selectedRequest.assignedTo && (
                  <div className="pt-2 border-t border-slate-800">
                    Assigned Responder: <strong className="text-emerald-400">{selectedRequest.assignedTo.name}</strong> ({selectedRequest.assignedTo.phone || '+91 91234 56789'})
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" /> Emergency Description
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                "{selectedRequest.description}"
              </p>
            </div>
          </div>

          {/* Interactive Pinpoint Map */}
          <div>
            <CrisisMap
              requests={[selectedRequest]}
              selectedRequestId={selectedRequest.id}
            />
          </div>

        </div>

        {/* LIVE DISPATCH LOG & NOTES THREAD */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="font-bold text-sm text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-400" /> Live Dispatch Communication & Incident Notes
          </h4>

          <div className="max-h-48 overflow-y-auto space-y-2.5 pr-2">
            {(!selectedRequest.comments || selectedRequest.comments.length === 0) ? (
              <div className="text-xs text-slate-500 italic p-2">
                No dispatch notes yet. Use the input below to log en route updates or patient status.
              </div>
            ) : (
              selectedRequest.comments.map(c => (
                <div key={c.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-400">{c.author}</span>
                    <span className="text-[10px] text-slate-500">{c.timestamp}</span>
                  </div>
                  <p className="text-slate-200">{c.text}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendComment} className="flex gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Add incident update or responder note..."
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow"
            >
              <Send className="w-3.5 h-3.5" /> Post
            </button>
          </form>
        </div>

        {/* ACTION BUTTONS BAR */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => updateRequestStatus(selectedRequest.id, 'Assigned')}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-transform hover:scale-105"
          >
            ⚡ Accept / Claim Request
          </button>

          <button
            onClick={() => updateRequestStatus(selectedRequest.id, 'En Route')}
            className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg transition-transform hover:scale-105"
          >
            🚚 Mark En Route
          </button>

          <button
            onClick={() => updateRequestStatus(selectedRequest.id, 'Resolved')}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-transform hover:scale-105"
          >
            ✅ Mark Completed & Resolved
          </button>
        </div>

      </div>

    </div>
  );
}

