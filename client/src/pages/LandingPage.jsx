import React from 'react';
import { Shield, Radio, Brain, Search, Award, MapPin, WifiOff, Mic, Clock, Bell, ArrowRight, CheckCircle2, Users, HeartHandshake, Zap, ChevronRight } from 'lucide-react';
import { useCrisis } from '../context/CrisisContext';

export default function LandingPage({ setActiveTab }) {
  const { setSosModalOpen, setActiveRole, requests } = useCrisis();

  const activeCount = requests.filter(r => r.status !== 'Resolved').length;
  const criticalCount = requests.filter(r => r.urgency === 'Critical' && r.status !== 'Resolved').length;

  return (
    <div className="space-y-20 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        
        {/* Glowing Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[400px] h-[250px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="text-center max-w-4xl mx-auto space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-red-500/30 text-xs font-semibold text-red-400 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            LIVE DISASTER RESPONSE PLATFORM
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-none font-outfit">
            Crisis<span className="text-red-500">Connect</span>
          </h1>

          <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-400 via-amber-300 to-slate-200 bg-clip-text text-transparent">
            “Connect. Respond. Save Lives.”
          </p>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            An intelligent emergency-response platform connecting people in need with trusted volunteers, first responders, and NGOs in real-time.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setSosModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-base tracking-wide shadow-xl shadow-red-950/60 flex items-center justify-center gap-2.5 transition-transform hover:scale-105 border border-red-400/30 sos-pulse-ring"
            >
              <Radio className="w-5 h-5 animate-pulse" />
              <span>REQUEST EMERGENCY HELP (SOS)</span>
            </button>

            <button
              onClick={() => {
                setActiveRole('Volunteer');
                setActiveTab('volunteer-feed');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-base border border-slate-700 flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <HeartHandshake className="w-5 h-5 text-blue-400" />
              <span>JOIN AS VOLUNTEER</span>
            </button>
          </div>

          {/* Live Status Ticker */}
          <div className="pt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <span><strong className="text-white">{criticalCount}</strong> Critical Emergencies</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span><strong className="text-white">{activeCount}</strong> Active Requests</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span><strong className="text-white">128+</strong> Responders Online</span>
            </div>
          </div>

        </div>
      </section>

      {/* STATS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-red-500 font-outfit">98.4%</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Verified Delivery Rate</div>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-blue-400 font-outfit">&lt; 8 min</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Avg Emergency Response</div>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-purple-400 font-outfit">1,420+</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Lives Assisted Today</div>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-outfit">92 / 100</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Avg Volunteer Trust Score</div>
          </div>
        </div>
      </section>

      {/* WORKFLOW SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
            Emergency Response Workflow
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            How CrisisConnect coordinates rapid emergency response in 4 streamlined steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative">
            <div className="w-10 h-10 rounded-xl bg-red-950 text-red-400 border border-red-800 flex items-center justify-center font-bold text-lg mb-4">1</div>
            <h3 className="font-bold text-base text-white mb-2">1-Tap Request</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Requester taps SOS button or uses voice input. Precise GPS location is captured instantly.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-purple-900/40 relative">
            <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 border border-purple-800 flex items-center justify-center font-bold text-lg mb-4">2</div>
            <h3 className="font-bold text-base text-white mb-2">AI Triage & Deduplication</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Intelligent algorithms score urgency, filter duplicate spam, and flag critical life threats.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative">
            <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center font-bold text-lg mb-4">3</div>
            <h3 className="font-bold text-base text-white mb-2">Smart Match Dispatch</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Assigned to nearest verified high-trust volunteers or registered local rescue NGOs.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-lg mb-4">4</div>
            <h3 className="font-bold text-base text-white mb-2">Live Timeline & Resolution</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Command center monitors live progress from dispatch to verified emergency resolution.
            </p>
          </div>
        </div>
      </section>

      {/* 9 KEY FEATURE CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
            Intelligent Platform Features
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Engineered for real emergency operations under high-stress conditions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="glass-panel p-6 rounded-2xl border border-red-900/40 hover:border-red-500/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-red-950/80 text-red-500 flex items-center justify-center mb-4">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">🚨 SOS Panic Button</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              1-tap emergency dispatch that transmits GPS coordinates and auto-triages priority without mandatory forms.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-purple-900/40 hover:border-purple-500/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-950/80 text-purple-400 flex items-center justify-center mb-4">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">🧠 AI Severity Auto-Triage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Natural language keyword extraction algorithms score severity from 0 to 100 to bubble critical cases to top.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-amber-900/40 hover:border-amber-500/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-950/80 text-amber-400 flex items-center justify-center mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">🔍 Duplicate & Fake Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Spatial-temporal text similarity analysis flags duplicate reports to prevent resource waste and panic spam.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-blue-900/40 hover:border-blue-500/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-950/80 text-blue-400 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">⭐ Trust & Reliability Score</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamic responder scores calculated from response speed, completion history, and requester feedback.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-emerald-900/40 hover:border-emerald-500/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">📍 Live Resource Heatmap</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive map visualizing emergency demand clusters and unmet resource gaps for NGO planning.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-cyan-900/40 hover:border-cyan-500/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/80 text-cyan-400 flex items-center justify-center mb-4">
              <WifiOff className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">📶 Offline-Friendly Mode</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Low-bandwidth caching & local sync queues allow requests to be saved locally during network towers drop.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-pink-900/40 hover:border-pink-500/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-pink-950/80 text-pink-400 flex items-center justify-center mb-4">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">🎙️ Voice-to-Request</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Integrated Web Speech API transcription allowing users in distress to speak their emergency hands-free.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-orange-900/40 hover:border-orange-500/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-orange-950/80 text-orange-400 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">⏳ Auto-Expiry & Renewal</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated expiry timers ensure active feeds remain accurate with one-click "Still Need Help" renewals.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-indigo-900/40 hover:border-indigo-500/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-950/80 text-indigo-400 flex items-center justify-center mb-4">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">🔔 Multi-Channel Alerts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time socket updates, browser notifications, and fallbacks for immediate status changes.
            </p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-500" />
          <span className="font-bold text-slate-300">CrisisConnect Platform</span>
          <span>© 2026 Hackathon Edition</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('requester-dashboard')} className="hover:underline">Requester</button>
          <button onClick={() => setActiveTab('volunteer-feed')} className="hover:underline">Volunteers</button>
          <button onClick={() => setActiveTab('admin-command')} className="hover:underline">Command Center</button>
          <button onClick={() => setActiveTab('ai-triage')} className="hover:underline">AI Engine</button>
        </div>
      </footer>

    </div>
  );
}
