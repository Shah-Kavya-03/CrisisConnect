import React from 'react';
import { useCrisis } from '../context/CrisisContext';
import { Radio, Plus, Clock, MapPin, CheckCircle2, AlertTriangle, UserCheck, RefreshCw, ChevronRight, Phone, MessageSquare, XCircle } from 'lucide-react';

export default function RequesterDashboard({ setActiveTab }) {
  const { setSosModalOpen, requests, renewRequest, updateRequestStatus, cancelRequest, setSelectedRequestId, user } = useCrisis();

  const myRequests = requests.filter(r => r.status !== 'Rejected (Spam)');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Banner Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/40 relative overflow-hidden">
        <div className="max-w-xl space-y-2">
          <span className="px-3 py-1 bg-red-950 text-red-400 border border-red-800 rounded-full text-xs font-bold inline-block">
            EMERGENCY PORTAL
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-outfit">
            Need emergency help? We're here.
          </h1>
          <p className="text-sm text-slate-300">
            If you are in immediate life-threatening danger, tap the 1-Tap SOS button below. For standard relief supplies, create a structured help request.
          </p>
        </div>
      </div>

      {/* PROMINENT SOS PANIC BUTTON SECTION */}
      <div className="glass-panel p-8 rounded-3xl border-2 border-red-600/50 bg-gradient-to-b from-red-950/60 to-slate-950 text-center space-y-6 shadow-2xl relative">
        <div
          className="mx-auto w-24 h-24 rounded-full bg-red-600 border-4 border-red-400/40 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform sos-pulse-ring shadow-2xl shadow-red-900"
          onClick={() => setSosModalOpen(true)}
        >
          <Radio className="w-12 h-12 text-white animate-pulse" />
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
            🚨 1-TAP SOS PANIC BUTTON
          </h2>
          <p className="text-xs sm:text-sm text-red-300 mt-1 max-w-lg mx-auto">
            Click to instantly broadcast critical emergency GPS coordinates to nearby responders. No forms required.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setSosModalOpen(true)}
            className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-extrabold text-base rounded-2xl shadow-xl transition-all border border-red-300/40"
          >
            DISPATCH EMERGENCY SOS NOW
          </button>

          <button
            onClick={() => setActiveTab('create-request')}
            className="w-full sm:w-auto px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-2xl border border-slate-700 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>Create Non-Critical Help Request</span>
          </button>
        </div>
      </div>

      {/* ACTIVE REQUESTS TRACKER & AUTO-EXPIRY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white font-outfit flex items-center gap-2">
            <span>My Active Emergency Requests</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs font-semibold text-slate-300">
              {myRequests.length}
            </span>
          </h3>

          <button
            onClick={() => setActiveTab('create-request')}
            className="text-xs text-blue-400 hover:underline font-bold flex items-center gap-1"
          >
            + New Request
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myRequests.map(req => (
            <div
              key={req.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold text-white uppercase ${
                      req.urgency === 'Critical' ? 'bg-red-600' :
                      req.urgency === 'High' ? 'bg-orange-500' : 'bg-amber-500'
                    }`}>
                      {req.urgency}
                    </span>
                    <span className="font-mono text-xs text-slate-400 font-bold">#{req.id}</span>
                  </div>
                  <h4 className="font-bold text-base text-white mt-1 leading-tight">{req.title}</h4>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  req.status === 'Resolved' ? 'bg-emerald-950 border-emerald-800 text-emerald-400' :
                  req.status === 'Assigned' || req.status === 'En Route' ? 'bg-blue-950 border-blue-800 text-blue-300' :
                  req.status === 'Cancelled' ? 'bg-slate-900 border-slate-800 text-slate-500' :
                  'bg-amber-950 border-amber-800 text-amber-300'
                }`}>
                  {req.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2">{req.description}</p>

              {/* Responder Info */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Assigned Responder:</span>
                  {req.assignedTo ? (
                    <span className="font-bold text-blue-400 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> {req.assignedTo.name}
                    </span>
                  ) : (
                    <span className="text-amber-400 font-semibold">Broadcasting to Volunteers...</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-slate-400">
                  <span>Location:</span>
                  <span className="text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500" /> {req.location}
                  </span>
                </div>
              </div>

              {/* AUTO-EXPIRY & RENEWAL BAR */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Lease Status: <strong className="text-emerald-400">Active (+4h)</strong></span>
                </div>

                <button
                  onClick={() => renewRequest(req.id)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold flex items-center gap-1 text-xs border border-slate-700 transition-all"
                >
                  <RefreshCw className="w-3 h-3 text-emerald-400" />
                  <span>Renew Request</span>
                </button>
              </div>

              {/* CARD BOTTOM ACTIONS */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setSelectedRequestId(req.id);
                    setActiveTab('request-details');
                  }}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border border-slate-800 transition-all"
                >
                  <span>View Full Timeline & Dossier</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {req.status !== 'Resolved' && req.status !== 'Cancelled' && (
                  <button
                    onClick={() => updateRequestStatus(req.id, 'Resolved')}
                    className="px-3 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-xl text-xs font-bold border border-emerald-800"
                    title="Mark help received"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}

                {req.status !== 'Resolved' && req.status !== 'Cancelled' && (
                  <button
                    onClick={() => cancelRequest(req.id)}
                    className="px-3 py-2 bg-slate-950 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-xl text-xs font-bold border border-slate-800"
                    title="Cancel request"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

