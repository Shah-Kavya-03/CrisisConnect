import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import { AlertOctagon, MapPin, Radio, ShieldAlert, CheckCircle2, Clock, X, PhoneCall, Sparkles } from 'lucide-react';

export default function SosModal({ activeTab, setActiveTab }) {
  const { sosModalOpen, setSosModalOpen, triggerSOS } = useCrisis();
  const [submittedRequest, setSubmittedRequest] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  if (!sosModalOpen) return null;

  const handleSendSOS = () => {
    setIsLocating(true);
    setTimeout(() => {
      const req = triggerSOS();
      setIsLocating(false);
      setSubmittedRequest(req);
    }, 800);
  };

  const handleClose = () => {
    setSosModalOpen(false);
    setSubmittedRequest(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-red-500/40 shadow-2xl overflow-hidden p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        {!submittedRequest ? (
          <div className="text-center space-y-6">
            
            {/* Pulsing Emergency Header Icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-red-950/80 border-2 border-red-500/60 flex items-center justify-center sos-pulse-ring">
              <AlertOctagon className="w-10 h-10 text-red-500 animate-pulse" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-outfit">
                🚨 Emergency SOS Panic Request
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Instantly dispatch your current GPS coordinates to nearest active emergency volunteers & rescue NGOs. No form required.
              </p>
            </div>

            {/* GPS Metadata Box */}
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                  <MapPin className="w-4 h-4 text-red-500" /> GPS Location:
                </span>
                <span className="text-emerald-400 font-mono font-bold">Accuracy ~5 meters</span>
              </div>
              <p className="text-slate-300 font-mono pl-5">
                Lat: 28.6139° N, Lng: 77.2090° E (Metro Sector 4)
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-slate-400">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase">Request Type</span>
                  <span className="font-bold text-red-400">EMERGENCY SOS</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase">AI Priority</span>
                  <span className="font-bold text-red-400">CRITICAL (97/100)</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSendSOS}
              disabled={isLocating}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-lg shadow-xl shadow-red-950/60 transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLocating ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>Locking GPS & Triaging...</span>
                </>
              ) : (
                <>
                  <Radio className="w-6 h-6 animate-pulse" />
                  <span>SEND EMERGENCY REQUEST NOW</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-400">
              Only press in case of genuine life-threatening or severe disaster crisis.
            </p>
          </div>
        ) : (
          /* Confirmation State */
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-xs font-bold mb-2">
                BROADCAST SENT SUCCESSFULLY
              </span>
              <h3 className="text-2xl font-bold text-white font-outfit">
                Emergency Help Is On The Way
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Your emergency request has been prioritized at the top of active volunteer feeds.
              </p>
            </div>

            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-left space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Request ID:</span>
                <span className="font-mono font-bold text-red-400 text-sm">#{submittedRequest.id}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Current Status:</span>
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 animate-spin" /> {submittedRequest.status}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">AI Priority Score:</span>
                <span className="font-bold text-red-400">97 / 100 (CRITICAL)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Estimated Dispatch:</span>
                <span className="font-bold text-slate-200">~ 4 to 8 minutes</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  handleClose();
                  if (setActiveTab) setActiveTab('requester-dashboard');
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
              >
                Track Status in Dashboard
              </button>
              <button
                onClick={() => {
                  handleClose();
                  if (setActiveTab) setActiveTab('volunteer-feed');
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
              >
                View in Volunteer Feed
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
