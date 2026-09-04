import React, { useState, useEffect } from 'react';
import { useCrisis } from '../context/CrisisContext';
import CrisisMap from '../components/CrisisMap';
import { User, ArrowLeft, Send, FileText, RefreshCw, MessageSquare, Timer, CheckCircle2, ShieldCheck, Navigation, Award, MapPin } from 'lucide-react';

export default function RequestDetailsPage({ setActiveTab }) {
  const { selectedRequest, updateRequestStatus, renewRequest, addRequestComment, verifyOnSiteArrival, streamVolunteerTelemetry, user } = useCrisis();
  const [commentInput, setCommentInput] = useState('');
  const [timeLeft, setTimeLeft] = useState('28m 42s');
  const [proximityMeters, setProximityMeters] = useState(140);
  const [isVerifyingArrival, setIsVerifyingArrival] = useState(false);
  const [isSimulatingApproach, setIsSimulatingApproach] = useState(false);

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

  // Simulate live GPS approach & stream WebSocket telemetry
  const handleSimulateLiveApproach = () => {
    if (!selectedRequest?.coordinates) return;
    setIsSimulatingApproach(true);
    let step = 0;
    const baseLat = selectedRequest.coordinates.lat - 0.005;
    const baseLng = selectedRequest.coordinates.lng - 0.005;

    const timer = setInterval(() => {
      step++;
      const currentLat = baseLat + (selectedRequest.coordinates.lat - baseLat) * (step / 5);
      const currentLng = baseLng + (selectedRequest.coordinates.lng - baseLng) * (step / 5);
      const remainingDist = Math.max(Math.round(250 * (1 - step / 5)), 45);

      setProximityMeters(remainingDist);
      if (streamVolunteerTelemetry) {
        streamVolunteerTelemetry({ lat: currentLat, lng: currentLng }, selectedRequest.id);
      }

      if (step >= 5) {
        clearInterval(timer);
        setIsSimulatingApproach(false);
        setProximityMeters(50);
      }
    }, 1200);
  };

  const handleVerifyArrival = async () => {
    if (!selectedRequest?.id) return;
    setIsVerifyingArrival(true);
    try {
      await verifyOnSiteArrival(selectedRequest.id, user?.id || 'VOL-CURRENT', selectedRequest.coordinates);
    } finally {
      setIsVerifyingArrival(false);
    }
  };

  if (!selectedRequest) return (
    <div className="max-w-4xl mx-auto p-8 text-center text-cyan-300/70">
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
          className="flex items-center gap-1.5 text-xs text-cyan-300 hover:text-white font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Priority Feed
        </button>

        <button
          onClick={() => renewRequest(selectedRequest.id)}
          className="px-3 py-1.5 bg-[#031726] hover:bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Extend 4h Emergency Lease
        </button>
      </div>

      {/* Main Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-700/60 space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cyan-900/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black text-white ${
                selectedRequest.urgency === 'Critical' ? 'bg-red-600' :
                selectedRequest.urgency === 'High' ? 'bg-amber-600' : 'bg-teal-600'
              }`}>
                🔴 {selectedRequest.urgency.toUpperCase()}
              </span>
              <span className="font-mono text-xs text-cyan-300/80 font-bold">#{selectedRequest.id}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#031726] text-cyan-200 text-xs font-bold border border-cyan-800">
                {selectedRequest.category}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-outfit">
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
            <div className="bg-cyan-950 p-3.5 rounded-2xl border border-cyan-500/50 text-center min-w-[110px]">
              <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider block">AI Score</span>
              <span className="text-2xl font-black text-white font-mono">{selectedRequest.aiPriorityScore}<span className="text-xs text-cyan-400 font-normal">/100</span></span>
            </div>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-cyan-200 uppercase tracking-wider">
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
                      ? 'bg-cyan-950/80 border-cyan-500/80 text-cyan-200 shadow'
                      : 'bg-[#031726]/60 border-cyan-950 text-cyan-400/50'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>Step {idx + 1}</span>
                    {isPastOrCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <div className="font-bold text-white text-xs">{step.label}</div>
                  <div className="text-[10px] opacity-80">{step.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Geofenced Proof-of-Help Radar & Arrival Verification */}
        {selectedRequest.timeline?.some(t => t.status === 'Arrived On-Site' || t.note?.includes('Geofence')) ? (
          <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>📍 On-Site Arrival Verified (Geofenced GPS)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-300 text-[10px] font-extrabold uppercase">Verified</span>
                </h4>
                <p className="text-xs text-emerald-200/80 mt-0.5">
                  Responder presence verified on-site via satellite GPS. +3 Trust Score bonus awarded to responder.
                </p>
              </div>
            </div>
            {selectedRequest.status !== 'Resolved' && (
              <button
                onClick={() => updateRequestStatus(selectedRequest.id, 'Resolved')}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow transition-all"
              >
                Mark Incident Resolved
              </button>
            )}
          </div>
        ) : (
          <div className="glass-panel p-4 rounded-2xl border border-cyan-700/60 bg-gradient-to-r from-cyan-950/60 via-[#071E2B] to-[#031726] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-cyan-300 animate-pulse" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    Proof-of-Help: Geofenced Arrival Radar
                    <span className="text-cyan-400 font-mono text-[11px] font-bold">~{proximityMeters}m from disaster site</span>
                  </span>
                  <span className="text-[10px] text-cyan-300/80 block">
                    Sat-Nav verifies responder presence within 200m before allowing on-site resolution.
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSimulateLiveApproach}
                  disabled={isSimulatingApproach}
                  className="px-3.5 py-2 bg-[#031726] hover:bg-cyan-950 text-cyan-300 border border-cyan-700/60 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isSimulatingApproach ? 'animate-spin text-teal-400' : 'text-cyan-400'}`} />
                  <span>{isSimulatingApproach ? 'Streaming GPS...' : '⚡ Broadcast Live Telemetry'}</span>
                </button>

                <button
                  onClick={handleVerifyArrival}
                  disabled={isVerifyingArrival}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>{isVerifyingArrival ? 'Verifying...' : '📍 Confirm On-Site Arrival'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info & Map Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          <div className="space-y-4">
            <div className="bg-[#031726]/90 p-4 rounded-2xl border border-cyan-900 space-y-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" /> Requester & Dispatch Details
              </h4>
              <div className="text-xs space-y-1.5 text-cyan-100/90">
                <div>Name: <strong className="text-white">{selectedRequest.requesterName}</strong></div>
                <div>Phone: <strong className="text-cyan-400">{selectedRequest.requesterPhone}</strong></div>
                <div>Distance: <strong className="text-teal-300">{selectedRequest.distanceKm} km away</strong></div>
                <div>Address: <strong className="text-white">{selectedRequest.location}</strong></div>
                {selectedRequest.assignedTo && (
                  <div className="pt-2 border-t border-cyan-900">
                    Assigned Responder: <strong className="text-teal-300">{selectedRequest.assignedTo.name}</strong> ({selectedRequest.assignedTo.phone || '+91 91234 56789'})
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#031726]/90 p-4 rounded-2xl border border-cyan-900 space-y-2">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" /> Emergency Description
              </h4>
              <p className="text-xs text-cyan-100/90 leading-relaxed">
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
        <div className="bg-[#031726]/80 p-5 rounded-2xl border border-cyan-900 space-y-4">
          <h4 className="font-bold text-sm text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" /> Live Dispatch Communication & Incident Notes
          </h4>

          <div className="max-h-48 overflow-y-auto space-y-2.5 pr-2">
            {(!selectedRequest.comments || selectedRequest.comments.length === 0) ? (
              <div className="text-xs text-cyan-400/60 italic p-2">
                No dispatch notes yet. Use the input below to log en route updates or responder status.
              </div>
            ) : (
              selectedRequest.comments.map(c => (
                <div key={c.id} className="p-3 bg-[#071E2B] rounded-xl border border-cyan-900 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400">{c.author}</span>
                    <span className="text-[10px] text-cyan-400/70">{c.timestamp}</span>
                  </div>
                  <p className="text-cyan-100">{c.text}</p>
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
              className="flex-1 bg-[#071E2B] border border-cyan-900 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1 shadow"
            >
              <Send className="w-3.5 h-3.5 text-slate-950" /> Post Note
            </button>
          </form>
        </div>

        {/* ACTION BUTTONS BAR */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-cyan-900">
          <button
            onClick={() => updateRequestStatus(selectedRequest.id, 'Assigned')}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-sky-500 text-slate-950 font-black text-xs shadow-lg transition-transform hover:scale-105"
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
