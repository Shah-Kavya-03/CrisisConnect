import React from 'react';
import { Radio, Brain, Search, Award, MapPin, WifiOff, Mic, Clock, Bell, HeartHandshake, Building2, User, ChevronRight } from 'lucide-react';
import { useCrisis } from '../context/CrisisContext';
import Logo from '../components/Logo';

export default function LandingPage({ setActiveTab }) {
  const { setSosModalOpen, requests, user } = useCrisis();

  const activeCount = requests.filter(r => r.status !== 'Resolved').length;
  const criticalCount = requests.filter(r => r.urgency === 'Critical' && r.status !== 'Resolved').length;

  const isRequester = user?.role === 'Requester';
  const isVolunteer = user?.role === 'Volunteer';
  const isNgo = user?.role === 'NGO' || user?.role === 'Admin';

  return (
    <div className="space-y-16 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        
        {/* Glowing Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-cyan-500/15 blur-[130px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[450px] h-[280px] bg-teal-500/15 blur-[110px] rounded-full pointer-events-none"></div>

        <div className="text-center max-w-4xl mx-auto space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#071E2B] border border-cyan-500/40 text-xs font-extrabold text-cyan-300 shadow-lg shadow-cyan-950/40">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            LIVE EMERGENCY DISPATCH NETWORK
          </div>

          <div className="flex justify-center my-4">
            <Logo size="xl" showText={false} />
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none font-outfit">
            Crisis<span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">Connect</span>
          </h1>

          <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-300 via-teal-200 to-sky-300 bg-clip-text text-transparent tracking-wide">
            “Connect. Respond. Save Lives.”
          </p>

          <p className="text-base sm:text-lg text-cyan-100/90 max-w-2xl mx-auto leading-relaxed">
            An intelligent disaster response & emergency coordination platform connecting citizens in distress with verified volunteers, relief agencies, and NGOs in real-time.
          </p>

          {/* Primary Action Buttons Tailored to User's Role */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isRequester && (
              <>
                <button
                  onClick={() => setSosModalOpen(true)}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-base tracking-wide shadow-xl shadow-cyan-950/80 flex items-center justify-center gap-2.5 transition-transform hover:scale-105 border border-cyan-300/50 sos-pulse-ring"
                >
                  <Radio className="w-5 h-5 animate-pulse text-slate-950" />
                  <span>REQUEST EMERGENCY HELP (SOS)</span>
                </button>

                <button
                  onClick={() => setActiveTab('requester-dashboard')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#071E2B] hover:bg-cyan-950 text-cyan-100 font-bold text-base border border-cyan-700/60 flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <User className="w-5 h-5 text-cyan-400" />
                  <span>GO TO MY DASHBOARD</span>
                </button>
              </>
            )}

            {isVolunteer && (
              <button
                onClick={() => setActiveTab('volunteer-feed')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-base tracking-wide shadow-xl shadow-cyan-950/80 flex items-center justify-center gap-2.5 transition-transform hover:scale-105 border border-cyan-300/50"
              >
                <HeartHandshake className="w-5 h-5 text-slate-950" />
                <span>OPEN EMERGENCY VOLUNTEER FEED</span>
                <ChevronRight className="w-5 h-5 text-slate-950" />
              </button>
            )}

            {isNgo && (
              <button
                onClick={() => setActiveTab('admin-command')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 font-black text-base tracking-wide shadow-xl shadow-cyan-950/80 flex items-center justify-center gap-2.5 transition-transform hover:scale-105 border border-teal-300/50"
              >
                <Building2 className="w-5 h-5 text-slate-950" />
                <span>OPEN NGO COMMAND CENTER</span>
                <ChevronRight className="w-5 h-5 text-slate-950" />
              </button>
            )}
          </div>

          {/* Live Status Ticker */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-cyan-300/80 font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></span>
              <span><strong className="text-white font-extrabold">{criticalCount}</strong> Critical Emergencies</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span><strong className="text-white font-extrabold">{activeCount}</strong> Active Requests</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
              <span><strong className="text-white font-extrabold">128+</strong> Responders Online</span>
            </div>
          </div>

        </div>
      </section>

      {/* STATS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-6 rounded-2xl border border-cyan-900/60 text-center">
            <div className="text-3xl sm:text-4xl font-black text-cyan-400 font-outfit">98.4%</div>
            <div className="text-xs text-cyan-200/70 font-semibold mt-1">Verified Relief Delivery</div>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-cyan-900/60 text-center">
            <div className="text-3xl sm:text-4xl font-black text-teal-300 font-outfit">&lt; 8 min</div>
            <div className="text-xs text-cyan-200/70 font-semibold mt-1">Avg Response Dispatch</div>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-cyan-900/60 text-center">
            <div className="text-3xl sm:text-4xl font-black text-sky-400 font-outfit">1,420+</div>
            <div className="text-xs text-cyan-200/70 font-semibold mt-1">Citizens Assisted</div>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-cyan-900/60 text-center">
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-outfit">94 / 100</div>
            <div className="text-xs text-cyan-200/70 font-semibold mt-1">Avg Responder Trust</div>
          </div>
        </div>
      </section>

      {/* INTELLIGENT PLATFORM FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white font-outfit">
            Intelligent Platform Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-cyan-200/70 mt-2">
            Built for crisis operations under severe conditions with low bandwidth support
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="glass-panel p-6 rounded-2xl border border-cyan-900/60 hover:border-cyan-500/80 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center mb-4">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2">🚨 1-Tap SOS Panic Button</h3>
            <p className="text-xs text-cyan-200/70 leading-relaxed">
              Instant priority panic alert broadcasting precise GPS coordinates with automated AI triage.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-teal-900/60 hover:border-teal-500/80 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-teal-950 text-teal-300 border border-teal-800 flex items-center justify-center mb-4">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2">🧠 AI Severity Triage Engine</h3>
            <p className="text-xs text-cyan-200/70 leading-relaxed">
              NLP algorithms analyze high-threat keywords (trapped, drowning, oxygen) to score urgency 0–100.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-sky-900/60 hover:border-sky-500/80 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-sky-950 text-sky-400 border border-sky-800 flex items-center justify-center mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2">🔍 AI Duplicate Moderation</h3>
            <p className="text-xs text-cyan-200/70 leading-relaxed">
              Spatio-temporal similarity engine matches incoming calls to prevent duplicate dispatches.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-cyan-900/60 hover:border-cyan-500/80 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2">⭐ Dynamic Responder Trust</h3>
            <p className="text-xs text-cyan-200/70 leading-relaxed">
              Volunteer ratings calculated from response speed, on-site check-in within 100m, and citizen reviews.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-emerald-900/60 hover:border-emerald-500/80 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2">📍 Live Resource Overwatch</h3>
            <p className="text-xs text-cyan-200/70 leading-relaxed">
              Interactive Leaflet maps visualizing emergency hotspots, NGO fleet units, and unfulfilled demand.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-cyan-900/60 hover:border-cyan-500/80 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center mb-4">
              <WifiOff className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2">📶 Offline Burst Sync Queue</h3>
            <p className="text-xs text-cyan-200/70 leading-relaxed">
              LocalStorage sync queue captures SOS alerts offline and bursts sync when network connection resumes.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-teal-900/60 hover:border-teal-500/80 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-teal-950 text-teal-300 border border-teal-800 flex items-center justify-center mb-4">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2">🎙️ Hands-Free Voice Request</h3>
            <p className="text-xs text-cyan-200/70 leading-relaxed">
              Speech-to-text integration enabling victims in panic to dictate emergency details hands-free.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-sky-900/60 hover:border-sky-500/80 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-sky-950 text-sky-400 border border-sky-800 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2">⏳ Auto-Expiring Life Lease</h3>
            <p className="text-xs text-cyan-200/70 leading-relaxed">
              Automatic 4-hour lease timers clear stale incidents with 1-tap renewal for active emergency status.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-cyan-900/60 hover:border-cyan-500/80 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center mb-4">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2">🔔 Socket Broadcasts</h3>
            <p className="text-xs text-cyan-200/70 leading-relaxed">
              Real-time WebSockets push emergency dispatch changes immediately to all logged-in devices.
            </p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 border-t border-cyan-900/60 text-xs text-cyan-400/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo size="sm" showText={true} />
          <span>© 2026 Emergency Ecosystem</span>
        </div>
        <div className="flex gap-4 font-semibold">
          {isRequester && (
            <button onClick={() => setActiveTab('requester-dashboard')} className="hover:text-cyan-300">My Emergency Dashboard</button>
          )}
          {isVolunteer && (
            <button onClick={() => setActiveTab('volunteer-feed')} className="hover:text-cyan-300">Emergency Priority Feed</button>
          )}
          {isNgo && (
            <>
              <button onClick={() => setActiveTab('admin-command')} className="hover:text-cyan-300 font-bold text-teal-300">NGO Command</button>
              <button onClick={() => setActiveTab('moderation')} className="hover:text-cyan-300">AI Duplicates</button>
              <button onClick={() => setActiveTab('ai-triage')} className="hover:text-cyan-300">AI Triage</button>
            </>
          )}
        </div>
      </footer>

    </div>
  );
}
