import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import Logo from './Logo';
import { Bell, Wifi, WifiOff, ChevronDown, Menu, X, LogOut, User, Building2, HeartHandshake, ShieldCheck, PlusCircle, Award, Sparkles, Layers } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const {
    isOnline,
    setIsOnline,
    notifications,
    markAllNotificationsRead,
    syncQueue,
    user,
    logoutUser
  } = useCrisis();

  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logoutUser();
    setActiveTab('login');
  };

  const isRequester = user?.role === 'Requester';
  const isVolunteer = user?.role === 'Volunteer';
  const isNgo = user?.role === 'NGO';
  const isAdmin = user?.role === 'Admin';

  const roleLabel = isAdmin 
    ? 'Central Administrator' 
    : isNgo 
    ? 'NGO Agency Leader' 
    : isVolunteer 
    ? 'Field Volunteer' 
    : 'Citizen Requester';

  return (
    <header className="sticky top-0 z-40 bg-[#071E2B]/95 backdrop-blur-md border-b border-cyan-900/50 shadow-xl shadow-cyan-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="cursor-pointer" onClick={() => setActiveTab('landing')}>
            <Logo size="md" showText={true} />
          </div>

          {/* Desktop Navigation Links - STRICTLY AUTHORIZED BY USER ROLE */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#031726]/80 p-1.5 rounded-2xl border border-cyan-900/60">
            
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'landing' ? 'bg-cyan-900/60 text-white shadow border border-cyan-500/40' : 'text-cyan-200/70 hover:text-white'
              }`}
            >
              Overview
            </button>

            {/* REQUESTER ROLE ONLY FEATURES */}
            {isRequester && (
              <>
                <button
                  onClick={() => setActiveTab('requester-dashboard')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'requester-dashboard'
                      ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow border border-sky-400/40'
                      : 'text-cyan-200/70 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-sky-300" />
                  <span>My Emergency Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab('create-request')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'create-request'
                      ? 'bg-cyan-900/60 text-cyan-200 border border-cyan-500/50'
                      : 'text-cyan-200/70 hover:text-white'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>New Help Request</span>
                </button>
              </>
            )}

            {/* VOLUNTEER ROLE ONLY FEATURES */}
            {isVolunteer && (
              <>
                <button
                  onClick={() => setActiveTab('volunteer-feed')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'volunteer-feed'
                      ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow border border-cyan-400/40'
                      : 'text-cyan-200/70 hover:text-white'
                  }`}
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Emergency Priority Feed</span>
                </button>

                <button
                  onClick={() => setActiveTab('trust-score')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'trust-score'
                      ? 'bg-teal-900/60 text-teal-200 border border-teal-500/50'
                      : 'text-cyan-200/70 hover:text-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-teal-400" />
                  <span>Trust Score & Badges</span>
                </button>
              </>
            )}

            {/* NGO AGENCY ROLE ONLY FEATURES (No Trust Scores) */}
            {isNgo && (
              <>
                <button
                  onClick={() => setActiveTab('ngo-dashboard')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'ngo-dashboard'
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow border border-teal-400/40'
                      : 'text-cyan-200/70 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-teal-300" />
                  <span>NGO Command Center</span>
                </button>

                <button
                  onClick={() => setActiveTab('moderation')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'moderation' ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50' : 'text-cyan-200/70 hover:text-white'
                  }`}
                >
                  AI Duplicate Moderation
                </button>

                <button
                  onClick={() => setActiveTab('ai-triage')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'ai-triage' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50' : 'text-cyan-200/70 hover:text-white'
                  }`}
                >
                  AI Severity Triage
                </button>
              </>
            )}

            {/* ADMIN ROLE ONLY CENTRAL COMMAND */}
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('admin-dashboard')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'admin-dashboard'
                      ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow border border-cyan-400/40'
                      : 'text-cyan-200/70 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Central Admin Operations</span>
                </button>

                <button
                  onClick={() => setActiveTab('moderation')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'moderation' ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50' : 'text-cyan-200/70 hover:text-white'
                  }`}
                >
                  AI Duplicate Moderation
                </button>

                <button
                  onClick={() => setActiveTab('ai-triage')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'ai-triage' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50' : 'text-cyan-200/70 hover:text-white'
                  }`}
                >
                  AI Severity Triage
                </button>
              </>
            )}

          </nav>

          {/* Action Tools & Profile Right Side */}
          <div className="flex items-center gap-2">
            
            {/* Online / Low Bandwidth Toggle */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              title={isOnline ? "Switch to disaster low bandwidth mode" : "Restore connection"}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isOnline
                  ? 'bg-teal-950/60 border-teal-700/80 text-teal-300 hover:bg-teal-900/50'
                  : 'bg-amber-950/60 border-amber-600/80 text-amber-300 animate-pulse'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isOnline ? '🟢 Online' : '🟠 Low Bandwidth'}</span>
              {syncQueue.length > 0 && (
                <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                  {syncQueue.length}
                </span>
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl border border-cyan-900/80 bg-[#031726] text-cyan-200 hover:text-white hover:bg-cyan-950 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 text-slate-950 rounded-full text-[10px] font-black flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl border border-cyan-700/60 overflow-hidden z-50">
                  <div className="p-3 bg-[#071E2B] border-b border-cyan-900/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-xs text-white">Emergency Broadcasts</span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[10px] text-cyan-400 hover:underline font-semibold"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-cyan-900/40">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-cyan-400/60">No notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-3 text-xs transition-colors ${n.read ? 'bg-[#031726]/40' : 'bg-cyan-950/40 font-semibold'}`}>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-cyan-100 font-bold">{n.title}</span>
                            <span className="text-[10px] text-cyan-400/70 shrink-0">{n.timestamp}</span>
                          </div>
                          <p className="text-cyan-200/80 text-[11px] mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Authenticated User Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl border border-cyan-700/60 bg-[#031726] hover:bg-cyan-950 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-teal-500 flex items-center justify-center text-slate-950 font-black text-xs">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-white truncate max-w-[110px]">{user.name}</span>
                    <span className="text-[9px] text-cyan-300 font-semibold uppercase tracking-wider">{roleLabel}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl shadow-2xl border border-cyan-700/60 overflow-hidden z-50">
                    <div className="p-3 bg-[#071E2B] border-b border-cyan-900/80">
                      <p className="text-xs font-bold text-white">{user.name}</p>
                      <p className="text-[10px] text-cyan-300 truncate">{user.email || user.phone}</p>
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-[10px] font-bold text-cyan-300">
                        <ShieldCheck className="w-3 h-3 text-cyan-400" />
                        <span>Role: {user.role}</span>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      {isVolunteer && (
                        <button
                          onClick={() => { setActiveTab('trust-score'); setUserDropdownOpen(false); }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-950/60 rounded-xl flex items-center gap-2"
                        >
                          <Award className="w-3.5 h-3.5 text-teal-400" />
                          <span>Trust Profile & Badges</span>
                        </button>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-950/60 rounded-xl flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-400" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 text-xs font-black shadow-md hover:from-cyan-400 hover:to-teal-400 transition-all"
              >
                Sign In
              </button>
            )}

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-cyan-900 bg-[#031726] text-cyan-200 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu - STRICTLY ROLE AUTHORIZED */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#071E2B] border-b border-cyan-900/80 px-4 pt-2 pb-4 space-y-2">
          <button
            onClick={() => { setActiveTab('landing'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-cyan-100 bg-[#031726]"
          >
            Overview
          </button>

          {isRequester && (
            <>
              <button
                onClick={() => { setActiveTab('requester-dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-sky-300 bg-sky-950/40"
              >
                My Emergency Dashboard
              </button>
              <button
                onClick={() => { setActiveTab('create-request'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-950/40"
              >
                New Help Request
              </button>
            </>
          )}

          {isVolunteer && (
            <>
              <button
                onClick={() => { setActiveTab('volunteer-feed'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-950/40"
              >
                Emergency Priority Feed
              </button>
              <button
                onClick={() => { setActiveTab('trust-score'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-teal-300 bg-teal-950/40"
              >
                Trust Score & Badges
              </button>
            </>
          )}

          {isNgo && (
            <>
              <button
                onClick={() => { setActiveTab('ngo-dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-teal-300 bg-teal-950/40"
              >
                NGO Command Center
              </button>
              <button
                onClick={() => { setActiveTab('moderation'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-950/40"
              >
                AI Duplicate Moderation
              </button>
              <button
                onClick={() => { setActiveTab('ai-triage'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-950/40"
              >
                AI Severity Triage
              </button>
            </>
          )}

          {isAdmin && (
            <>
              <button
                onClick={() => { setActiveTab('admin-dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-950/40"
              >
                Central Admin Operations
              </button>
              <button
                onClick={() => { setActiveTab('moderation'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-950/40"
              >
                AI Duplicate Moderation
              </button>
              <button
                onClick={() => { setActiveTab('ai-triage'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-teal-300 bg-teal-950/40"
              >
                AI Severity Triage
              </button>
            </>
          )}

          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-950/40 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </header>
  );
}
