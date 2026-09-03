import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import { AlertOctagon, MapPin, Radio, CheckCircle2, X, Sparkles } from 'lucide-react';

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
    }, 600);
  };

  const handleClose = () => {
    setSosModalOpen(false);
    setSubmittedRequest(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#031726]/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-cyan-500/50 shadow-2xl overflow-hidden p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-cyan-300 hover:text-white rounded-full bg-[#031726]/80 border border-cyan-900"
        >
          <X className="w-5 h-5" />
        </button>

        {!submittedRequest ? (
          <div className="text-center space-y-6">
            
            {/* Pulsing Emergency Header Icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-cyan-950/90 border-2 border-cyan-400 flex items-center justify-center sos-pulse-ring">
              <AlertOctagon className="w-10 h-10 text-cyan-400 animate-pulse" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-outfit">
                🚨 Emergency SOS Panic Alert
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-cyan-200/80">
                Broadcasting your instant GPS coordinates to nearby active emergency volunteers & rescue NGOs. No form required.
              </p>
            </div>

            {/* GPS Metadata Box */}
            <div className="bg-[#031726]/90 rounded-2xl p-4 border border-cyan-900 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between text-cyan-300/80">
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <MapPin className="w-4 h-4 text-cyan-400" /> GPS Location:
                </span>
                <span className="text-emerald-400 font-mono font-bold">Accuracy ~5 meters</span>
              </div>
              <p className="text-cyan-100 font-mono pl-5">
                Lat: 28.6139° N, Lng: 77.2090° E (Metro Sector 4)
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyan-900 text-cyan-300/80">
                <div>
                  <span className="block text-[10px] text-cyan-400 uppercase">Request Type</span>
                  <span className="font-bold text-red-400">EMERGENCY SOS</span>
                </div>
                <div>
                  <span className="block text-[10px] text-cyan-400 uppercase">AI Priority</span>
                  <span className="font-bold text-cyan-300">MAXIMUM (97/100)</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSendSOS}
              disabled={isLocating}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-lg shadow-xl shadow-cyan-950/80 transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLocating ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin text-slate-950" />
                  <span>Locking GPS & Triaging...</span>
                </>
              ) : (
                <>
                  <Radio className="w-6 h-6 animate-pulse text-slate-950" />
                  <span>SEND EMERGENCY SOS NOW</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-cyan-300/70">
              Press in case of critical disaster emergency.
            </p>
          </div>
        ) : (
          /* SUCCESS CONFIRMATION MODAL STATE */
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-teal-950 border border-teal-500 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-teal-400" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white font-outfit">
                🚨 SOS DISPATCH BROADCASTED!
              </h2>
              <p className="text-xs text-cyan-200/90 mt-1">
                Your emergency request <strong className="text-cyan-400">#{submittedRequest.id}</strong> is triaged at <strong className="text-teal-300">AI Score 97/100</strong> and sent to responders.
              </p>
            </div>

            <div className="p-4 bg-[#031726] rounded-2xl border border-cyan-900 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-cyan-300/70">Request Status:</span>
                <span className="font-bold text-teal-300 animate-pulse">Awaiting Responder Claim</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-300/70">Responder Feed:</span>
                <span className="font-bold text-white">Bubbled to Top 1 Position</span>
              </div>
            </div>

            <button
              onClick={() => {
                handleClose();
                setActiveTab('requester-dashboard');
              }}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black rounded-xl text-xs shadow-lg"
            >
              Track Live Dispatch Status
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
