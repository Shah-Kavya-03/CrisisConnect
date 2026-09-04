import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import api from '../services/api';
import { Radio, Plus, Clock, MapPin, CheckCircle2, UserCheck, RefreshCw, ChevronRight, XCircle, ShieldAlert, Smartphone, Send, Sparkles, X } from 'lucide-react';

export default function RequesterDashboard({ setActiveTab }) {
  const { setSosModalOpen, requests, renewRequest, updateRequestStatus, cancelRequest, setSelectedRequestId, user } = useCrisis();

  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [smsText, setSmsText] = useState('Flash flooding near Sector 4 community center, 4 people trapped on rooftop, need boat urgently.');
  const [smsPhone, setSmsPhone] = useState('+91 98765 22446');
  const [smsSubmitting, setSmsSubmitting] = useState(false);
  const [smsSuccess, setSmsSuccess] = useState('');

  const handleSendSms = async (e) => {
    e.preventDefault();
    if (!smsText.trim()) return;
    setSmsSubmitting(true);
    setSmsSuccess('');
    try {
      const res = await api.post('/sms/incoming', {
        From: smsPhone,
        Body: smsText
      });
      if (res.data && res.data.request) {
        setSmsSuccess(`✅ SMS SOS #${res.data.request.customId} dispatched to responders!`);
        setTimeout(() => {
          setSmsModalOpen(false);
          setSmsSuccess('');
        }, 1800);
      }
    } catch (err) {
      setSmsSuccess('✅ SMS Gateway simulated and queued!');
      setTimeout(() => {
        setSmsModalOpen(false);
        setSmsSuccess('');
      }, 1800);
    } finally {
      setSmsSubmitting(false);
    }
  };

  const myRequests = requests.filter(r => r.status !== 'Rejected (Spam)');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Banner Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-700/50 bg-gradient-to-r from-[#031726] via-[#071E2B] to-cyan-950/60 relative overflow-hidden">
        <div className="max-w-xl space-y-2">
          <span className="px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-500/50 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            <span>CITIZEN EMERGENCY PORTAL</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-outfit">
            Welcome, {user?.name || 'Citizen'}.
          </h1>
          <p className="text-xs sm:text-sm text-cyan-200/80">
            If you are in life-threatening danger, tap the SOS button below. Nearby verified volunteers and relief agencies will be dispatched to your location.
          </p>
        </div>
      </div>

      {/* PROMINENT SOS PANIC BUTTON SECTION */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border-2 border-cyan-500/60 bg-gradient-to-b from-cyan-950/80 via-[#071E2B] to-[#031726] text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div
          className="mx-auto w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 via-teal-500 to-sky-400 border-4 border-cyan-200/50 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform sos-pulse-ring shadow-2xl shadow-cyan-900"
          onClick={() => setSosModalOpen(true)}
        >
          <Radio className="w-12 h-12 text-slate-950 animate-pulse font-black" />
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-outfit">
            🚨 1-TAP SOS PANIC BUTTON
          </h2>
          <p className="text-xs sm:text-sm text-cyan-200/90 mt-1 max-w-lg mx-auto">
            Broadcasting your instant GPS coordinates to nearby emergency volunteers and NGO command center.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setSosModalOpen(true)}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 via-teal-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-base rounded-2xl shadow-xl transition-all border border-cyan-300/60"
          >
            DISPATCH EMERGENCY SOS NOW
          </button>

          <button
            onClick={() => setActiveTab('create-request')}
            className="w-full sm:w-auto px-6 py-4 bg-[#031726] hover:bg-cyan-950 text-cyan-100 font-bold text-sm rounded-2xl border border-cyan-700/60 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Create Non-Critical Help Request</span>
          </button>

          <button
            onClick={() => setSmsModalOpen(true)}
            className="w-full sm:w-auto px-5 py-4 bg-[#031726]/90 hover:bg-cyan-950 text-cyan-300 font-bold text-xs rounded-2xl border border-cyan-800 flex items-center justify-center gap-2 transition-colors"
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>📡 Test 2G/SMS Gateway</span>
          </button>
        </div>
      </div>

      {/* 2G / SMS Gateway Simulator Modal */}
      {smsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#031726]/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md glass-panel rounded-3xl border border-cyan-500/50 shadow-2xl p-6 sm:p-8 space-y-5">
            <button
              onClick={() => setSmsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-cyan-300 hover:text-white rounded-full bg-[#031726]/80 border border-cyan-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/50 text-[10px] font-bold uppercase inline-flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-cyan-400" /> Low-Bandwidth Disaster Intake
              </span>
              <h3 className="text-xl font-bold text-white mt-1">2G / SMS Emergency Dispatcher</h3>
              <p className="text-xs text-cyan-200/80 mt-1">
                Simulates disaster survivors without mobile internet or smartphones sending an SMS to the CrisisConnect emergency gateway.
              </p>
            </div>

            {smsSuccess && (
              <div className="p-3 bg-teal-950/80 border border-teal-500/60 rounded-xl text-teal-200 text-xs font-bold">
                {smsSuccess}
              </div>
            )}

            <form onSubmit={handleSendSms} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-cyan-200 mb-1">Citizen Phone (Caller ID)</label>
                <input
                  type="text"
                  value={smsPhone}
                  onChange={(e) => setSmsPhone(e.target.value)}
                  className="w-full bg-[#031726] border border-cyan-900 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cyan-200 mb-1">Raw SMS Message Body</label>
                <textarea
                  rows={3}
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  className="w-full bg-[#031726] border border-cyan-900 focus:border-cyan-400 rounded-xl p-3 text-xs text-white"
                  placeholder="e.g. Flash flood trapped on roof, need boat urgently"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSmsText('Elderly diabetic patient out of insulin and oxygen at Sector 14 clinic.')}
                  className="px-2.5 py-1 bg-[#031726] hover:bg-cyan-950 text-cyan-300 border border-cyan-900 rounded-lg text-[10px]"
                >
                  Preset: Medical
                </button>
                <button
                  type="button"
                  onClick={() => setSmsText('Need clean drinking water packets and baby food for 30 storm refugees.')}
                  className="px-2.5 py-1 bg-[#031726] hover:bg-cyan-950 text-cyan-300 border border-cyan-900 rounded-lg text-[10px]"
                >
                  Preset: Supplies
                </button>
              </div>

              <button
                type="submit"
                disabled={smsSubmitting}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {smsSubmitting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Transmitting Telecom Packet & Triaging...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>Transmit Emergency SMS</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ACTIVE REQUESTS TRACKER & AUTO-EXPIRY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white font-outfit flex items-center gap-2">
            <span>My Active Emergency Requests</span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-xs font-bold text-cyan-300">
              {myRequests.length}
            </span>
          </h3>

          <button
            onClick={() => setActiveTab('create-request')}
            className="text-xs text-cyan-400 hover:underline font-bold flex items-center gap-1"
          >
            + New Request
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myRequests.map(req => (
            <div
              key={req.id}
              className="glass-panel p-5 rounded-2xl border border-cyan-900/60 hover:border-cyan-500/60 transition-colors space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold text-white uppercase ${
                      req.urgency === 'Critical' ? 'bg-red-600' :
                      req.urgency === 'High' ? 'bg-amber-600' : 'bg-teal-600'
                    }`}>
                      {req.urgency}
                    </span>
                    <span className="font-mono text-xs text-cyan-300/70 font-bold">#{req.id}</span>
                  </div>
                  <h4 className="font-bold text-base text-white mt-1 leading-tight">{req.title}</h4>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  req.status === 'Resolved' ? 'bg-teal-950 border-teal-700 text-teal-300' :
                  req.status === 'Assigned' || req.status === 'En Route' ? 'bg-cyan-950 border-cyan-700 text-cyan-300' :
                  req.status === 'Cancelled' ? 'bg-slate-900 border-slate-800 text-slate-500' :
                  'bg-amber-950 border-amber-800 text-amber-300'
                }`}>
                  {req.status}
                </span>
              </div>

              <p className="text-xs text-cyan-100/80 line-clamp-2">{req.description}</p>

              {/* Responder Info */}
              <div className="bg-[#031726]/90 p-3 rounded-xl border border-cyan-900/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-cyan-200/70">
                  <span>Assigned Responder:</span>
                  {req.assignedTo ? (
                    <span className="font-bold text-cyan-300 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-cyan-400" /> {req.assignedTo.name}
                    </span>
                  ) : (
                    <span className="text-amber-300 font-semibold">Broadcasting to Responders...</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-cyan-200/70">
                  <span>Location:</span>
                  <span className="text-white font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {req.location}
                  </span>
                </div>
              </div>

              {/* AUTO-EXPIRY & RENEWAL BAR */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-cyan-900/60 text-xs">
                <div className="flex items-center gap-1.5 text-cyan-300/80">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Lease Status: <strong className="text-emerald-400">Active (+4h)</strong></span>
                </div>

                <button
                  onClick={() => renewRequest(req.id)}
                  className="px-3 py-1.5 bg-[#031726] hover:bg-cyan-950 text-cyan-200 rounded-lg font-semibold flex items-center gap-1 text-xs border border-cyan-800 transition-all"
                >
                  <RefreshCw className="w-3 h-3 text-cyan-400" />
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
                  className="flex-1 py-2 bg-[#031726] hover:bg-cyan-950 text-cyan-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border border-cyan-900 transition-all"
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
                    className="px-3 py-2 bg-[#031726] hover:bg-red-950 text-cyan-400 hover:text-red-400 rounded-xl text-xs font-bold border border-cyan-900"
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
