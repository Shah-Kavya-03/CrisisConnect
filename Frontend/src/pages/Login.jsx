import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import { authService } from '../services/authService';
import Logo from '../components/Logo';
import { Lock, Mail, ArrowRight, AlertCircle, Building2, User, HeartHandshake } from 'lucide-react';

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

    const cleanId = identifier.trim();
    const cleanPassword = password.trim();

    try {
      // 1. Strict Database Authentication via MongoDB API
      const data = await authService.login({
        email: cleanId,
        username: cleanId,
        password: cleanPassword,
        role: role
      });

      if (data && data.user) {
        const loggedUser = data.user;
        setUser(loggedUser);
        setActiveRole(loggedUser.role); // Automatically handles Secret Admin redirection if matched in admins collection
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('Database Authentication Failed:', err);
      setErrorMsg(
        err.message || 'Database Authentication failed. Please check your credentials or ensure MongoDB server is running.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-8 px-4">
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
        
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-8">
          <Logo size="xl" showText={true} className="mb-3" />
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-outfit mt-2">
            Welcome to <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">CrisisConnect</span>
          </h1>
          <p className="text-xs sm:text-sm text-cyan-200/80 mt-1 max-w-sm">
            Sign in to access your role-based emergency assistance portal
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-500/60 text-red-200 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
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
            <label className="block text-xs font-semibold text-cyan-200 mb-1.5">Email Address / Username</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your registered email / username"
                className="w-full bg-[#031726]/90 border border-cyan-900/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400"
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
                className="w-full bg-[#031726]/90 border border-cyan-900/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 via-teal-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 rounded-xl text-xs font-black tracking-wide shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2 transition-all mt-6"
          >
            {loading ? 'Authenticating with MongoDB...' : `Sign In as ${role}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-cyan-900/50">
          <p className="text-xs text-cyan-300/80 mb-2">
            Need a new account?
          </p>
          <button
            onClick={() => setAuthMode('signup')}
            className="w-full py-2.5 px-4 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-700/60 rounded-xl text-xs text-cyan-200 font-bold transition-all"
          >
            Create / Sign Up New Account
          </button>
        </div>

      </div>
    </div>
  );
}
