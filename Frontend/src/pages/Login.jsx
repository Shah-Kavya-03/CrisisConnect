import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import { authService } from '../services/authService';
import Logo from '../components/Logo';
import { Lock, Mail, ArrowRight, UserCheck, AlertCircle, Building2, User, HeartHandshake, ShieldCheck } from 'lucide-react';

export default function Login({ setAuthMode }) {
  const { setUser, setActiveRole } = useCrisis();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Requester');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Authenticate against database API collection
      const data = await authService.login({
        email: identifier.trim(),
        username: identifier.trim(),
        password: password.trim()
      });

      if (data && data.user) {
        const loggedUser = data.user;
        setUser(loggedUser);

        // HIDDEN ADMIN REDIRECTION:
        // If credentials match an Admin in the database, redirect directly to Admin Dashboard
        if (loggedUser.role === 'Admin') {
          setActiveRole('Admin');
        } else if (loggedUser.role === 'NGO') {
          setActiveRole('NGO');
        } else if (loggedUser.role === 'Volunteer') {
          setActiveRole('Volunteer');
        } else {
          setActiveRole('Requester');
        }
      }
    } catch (err) {
      console.warn('Backend API login error:', err);

      // Fallback verification for offline demonstration if server is starting or DB is offline
      const idLower = identifier.trim().toLowerCase();
      if ((idLower === 'admin@crisis.gov' || idLower === 'admin' || idLower === 'operations commander') && password === 'password123') {
        // Fallback Hidden Admin Login
        const fallbackAdmin = {
          name: 'Operations Commander',
          email: 'admin@crisis.gov',
          phone: '+91 98111 22233',
          role: 'Admin',
          trustScore: 100,
          badges: ['🛡️ Command Dispatcher', '👑 Principal Authority']
        };
        setUser(fallbackAdmin);
        setActiveRole('Admin');
        setLoading(false);
        return;
      }

      // Check for demo fallback if API is unreachable
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        if (password === 'password123') {
          const fallbackUser = {
            name: identifier.split('@')[0] || 'Amit Patel',
            email: identifier || 'user@crisisconnect.org',
            phone: '+91 98123 45678',
            role: role,
            trustScore: role === 'NGO' ? undefined : role === 'Volunteer' ? 96 : 88,
            completedAssignments: role === 'Volunteer' ? 52 : 3,
            badges: role === 'Volunteer' ? ['🏆 Rapid Responder'] : role === 'NGO' ? ['🏢 Relief Agency'] : ['🔰 Verified Citizen']
          };
          setUser(fallbackUser);
          setActiveRole(role);
          setLoading(false);
          return;
        }
      }

      setErrorMsg(err.message || 'Invalid username/email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (selectedRole, demoName, demoEmail) => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Attempt real database login with seeded credentials
      const data = await authService.login({
        email: demoEmail,
        password: 'password123'
      });
      if (data && data.user) {
        setUser(data.user);
        setActiveRole(data.user.role);
        setLoading(false);
        return;
      }
    } catch (e) {
      // Offline fallback
    }

    // Direct fallback session
    setUser({
      name: demoName,
      email: demoEmail,
      phone: '+91 98123 45678',
      role: selectedRole,
      // Note: NGOs have NO trust score
      trustScore: selectedRole === 'NGO' ? undefined : selectedRole === 'Volunteer' ? 98 : 88,
      completedAssignments: selectedRole === 'Volunteer' ? 48 : 2,
      abandonedAssignments: 0,
      avgResponseMinutes: 11,
      badges: selectedRole === 'Volunteer' 
        ? ['🏆 Verified Responder', '⚡ Rapid Action'] 
        : selectedRole === 'NGO' 
        ? ['🏢 Registered Relief NGO', '⚡ Fleet Manager'] 
        : ['🔰 Verified Citizen']
    });
    setActiveRole(selectedRole);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto py-8 px-4">
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
        
        {/* Ambient Teal Radial Glow Background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size="xl" showText={true} className="mb-3" />
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-outfit mt-2">
            Welcome to <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">CrisisConnect</span>
          </h1>
          <p className="text-xs sm:text-sm text-cyan-200/80 mt-1 max-w-sm">
            Please sign in to access your role-based emergency assistance dashboard
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-500/60 text-red-200 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Public Role Selector Tabs (Only regular roles - Hidden Admin login exists via credentials) */}
          <div>
            <label className="block text-xs font-semibold text-cyan-200 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#031726]/80 rounded-2xl border border-cyan-900/60">
              <button
                type="button"
                onClick={() => setRole('Requester')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  role === 'Requester'
                    ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/50 border border-cyan-400/40'
                    : 'text-cyan-300/70 hover:text-white hover:bg-cyan-950/40'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Requester</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('NGO')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  role === 'NGO'
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-900/50 border border-teal-400/40'
                    : 'text-cyan-300/70 hover:text-white hover:bg-cyan-950/40'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>NGO Person</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('Volunteer')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  role === 'Volunteer'
                    ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-900/50 border border-cyan-400/40'
                    : 'text-cyan-300/70 hover:text-white hover:bg-cyan-950/40'
                }`}
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Volunteer</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cyan-200 mb-1.5">
              Email Address or Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="user@crisisconnect.org or username"
                className="w-full bg-[#031726]/90 border border-cyan-900/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cyan-200 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#031726]/90 border border-cyan-900/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 via-teal-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 rounded-xl text-xs font-black tracking-wide shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]"
          >
            {loading ? 'Authenticating with Database...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Fast Evaluator Role Logins */}
        <div className="mt-8 pt-6 border-t border-cyan-900/50">
          <div className="text-[11px] font-bold text-cyan-300 tracking-wider uppercase text-center mb-3 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fast 1-Click Login by Role</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={() => handleQuickDemoLogin('Requester', 'Ananya Sharma', 'ananya@crisis.org')}
              className="w-full py-2.5 px-3 bg-sky-950/40 hover:bg-sky-900/50 border border-sky-800/60 rounded-xl text-xs text-sky-200 font-semibold flex items-center justify-between transition-all hover:border-sky-400"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-sky-400" />
                <span>1. Citizen Requester Portal</span>
              </div>
              <UserCheck className="w-4 h-4 text-sky-400" />
            </button>

            <button
              onClick={() => handleQuickDemoLogin('NGO', 'Red Cross Admin', 'ngo@redcross.org')}
              className="w-full py-2.5 px-3 bg-teal-950/40 hover:bg-teal-900/50 border border-teal-800/60 rounded-xl text-xs text-teal-200 font-semibold flex items-center justify-between transition-all hover:border-teal-400"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-400" />
                <span>2. NGO Agency Command Center</span>
              </div>
              <UserCheck className="w-4 h-4 text-teal-400" />
            </button>

            <button
              onClick={() => handleQuickDemoLogin('Volunteer', 'Dr. Rahul Verma', 'rahul@relief.org')}
              className="w-full py-2.5 px-3 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/60 rounded-xl text-xs text-cyan-200 font-semibold flex items-center justify-between transition-all hover:border-cyan-400"
            >
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-cyan-400" />
                <span>3. Volunteer Emergency Feed</span>
              </div>
              <UserCheck className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => setAuthMode('signup')}
            className="text-xs text-cyan-300/80 hover:text-white transition-colors"
          >
            Don't have an account yet? <span className="text-cyan-400 font-bold underline">Sign Up Now</span>
          </button>
        </div>

      </div>
    </div>
  );
}
