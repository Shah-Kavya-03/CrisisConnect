import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import { Shield, Bell, Wifi, WifiOff, AlertCircle, CheckCircle, ChevronDown, Radio, Activity, Menu, X, PlusCircle, Search, LogIn, LogOut, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const {
    activeRole,
    setActiveRole,
    isOnline,
    setIsOnline,
    notifications,
    markAllNotificationsRead,
    setSosModalOpen,
    syncQueue,
    user,
    setUser
  } = useCrisis();

  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    localStorage.removeItem('crisis_token');
    localStorage.removeItem('crisis_user');
    setUser(null);
    setActiveTab('landing');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 p-0.5 shadow-lg shadow-red-900/40 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-500 fill-red-500/20" />
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent font-outfit">
                Crisis<span className="text-red-500">Connect</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-wide">
                INTELLIGENT DISASTER RESPONSE
              </span>
            </div>
          </div>

          {/* Nav Links Desktop */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'landing' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => { setActiveRole('Requester'); setActiveTab('requester-dashboard'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'requester-dashboard' || activeRole === 'Requester' ? 'bg-red-900/40 text-red-300 border border-red-800/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Requester Center
            </button>

            <button
              onClick={() => { setActiveRole('Volunteer'); setActiveTab('volunteer-feed'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'volunteer-feed' || activeTab === 'trust-score' ? 'bg-blue-900/40 text-blue-300 border border-blue-800/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Volunteer Feed
            </button>

            <button
              onClick={() => { setActiveRole('Admin'); setActiveTab('admin-command'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'admin-command' || activeTab === 'moderation' || activeTab === 'ai-triage' ? 'bg-purple-900/40 text-purple-300 border border-purple-800/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Command Center
            </button>

            <button
              onClick={() => setActiveTab('moderation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'moderation' ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Duplicates AI
            </button>

            <button
              onClick={() => setActiveTab('ai-triage')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ai-triage' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              AI Severity
            </button>
          </nav>

          {/* Action Tools Right Side */}
          <div className="flex items-center gap-2">
            
            {/* Online / Connectivity Toggle */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              title={isOnline ? "Click to simulate offline / low bandwidth mode" : "Click to restore online connection"}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isOnline
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/40'
                  : 'bg-amber-950/60 border-amber-700/80 text-amber-300 animate-pulse'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isOnline ? '🟢 Online' : '🟠 Low Bandwidth'}</span>
              {syncQueue.length > 0 && (
                <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                  {syncQueue.length}
                </span>
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden z-50">
                  <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-200">Alert Center</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-blue-400 hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-xs">No active notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs transition-colors hover:bg-slate-800/40 ${
                            !n.read ? 'bg-slate-800/20' : 'opacity-70'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-200">{n.title}</span>
                            <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                          </div>
                          <p className="text-slate-400 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick SOS Trigger Button */}
            <button
              onClick={() => setSosModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs tracking-wider shadow-lg shadow-red-900/50 flex items-center gap-1.5 transition-transform hover:scale-105 border border-red-400/30 sos-pulse-ring"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>SOS PANIC</span>
            </button>

            {/* User Auth Profile / Login Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-300 hover:text-white hover:border-slate-700"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {user.name ? user.name[0] : 'U'}
                  </div>
                  <span className="hidden md:inline font-medium max-w-[90px] truncate">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 glass-panel rounded-xl shadow-2xl border border-slate-700 p-2 z-50 text-xs">
                    <div className="p-2 border-b border-slate-800">
                      <div className="font-bold text-white truncate">{user.name}</div>
                      <div className="text-[10px] text-slate-400">{user.role} • Trust {user.trustScore}%</div>
                    </div>
                    <button
                      onClick={() => { setActiveTab('trust-score'); setUserDropdownOpen(false); }}
                      className="w-full text-left p-2 hover:bg-slate-800 rounded-lg text-slate-300 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      <span>Trust Scorecard</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left p-2 hover:bg-red-950/40 text-red-300 rounded-lg flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-300" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 p-4 space-y-2">
          <button
            onClick={() => { setActiveTab('landing'); setMobileMenuOpen(false); }}
            className="w-full text-left px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:bg-slate-800"
          >
            Overview
          </button>
          <button
            onClick={() => { setActiveRole('Requester'); setActiveTab('requester-dashboard'); setMobileMenuOpen(false); }}
            className="w-full text-left px-4 py-2 rounded-lg text-sm font-semibold text-red-400 hover:bg-slate-800"
          >
            🚨 Requester Dashboard (SOS)
          </button>
          <button
            onClick={() => { setActiveRole('Volunteer'); setActiveTab('volunteer-feed'); setMobileMenuOpen(false); }}
            className="w-full text-left px-4 py-2 rounded-lg text-sm font-semibold text-blue-400 hover:bg-slate-800"
          >
            📡 Volunteer Priority Feed
          </button>
          <button
            onClick={() => { setActiveRole('Admin'); setActiveTab('admin-command'); setMobileMenuOpen(false); }}
            className="w-full text-left px-4 py-2 rounded-lg text-sm font-semibold text-purple-400 hover:bg-slate-800"
          >
            🗺️ Command Center Heatmap
          </button>
          <button
            onClick={() => { setActiveTab('moderation'); setMobileMenuOpen(false); }}
            className="w-full text-left px-4 py-2 rounded-lg text-sm font-semibold text-amber-400 hover:bg-slate-800"
          >
            🔍 Duplicate Moderation AI
          </button>
          <button
            onClick={() => { setActiveTab('ai-triage'); setMobileMenuOpen(false); }}
            className="w-full text-left px-4 py-2 rounded-lg text-sm font-semibold text-emerald-400 hover:bg-slate-800"
          >
            🧠 AI Auto-Triage Engine
          </button>
          <button
            onClick={() => { setActiveTab('login'); setMobileMenuOpen(false); }}
            className="w-full text-left px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:bg-slate-800 border-t border-slate-800 pt-3"
          >
            👤 Sign In / Account
          </button>
        </div>
      )}
    </header>
  );
}
