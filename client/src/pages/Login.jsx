import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import { Shield, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

export default function Login({ setActiveTab }) {
  const { user, setUser, setActiveRole } = useCrisis();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Requester');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setUser({
        name: email.split('@')[0] || 'Amit Patel',
        email: email || 'demo@crisisconnect.org',
        phone: '+91 98123 45678',
        role,
        trustScore: role === 'Volunteer' ? 95 : 88,
        completedAssignments: role === 'Volunteer' ? 52 : 3,
        abandonedAssignments: 1,
        avgResponseMinutes: 12,
        badges: role === 'Volunteer' ? ['🏆 Rapid Responder', '⚡ Certified First Aid'] : ['🔰 Verified Citizen']
      });
      setActiveRole(role);
      setLoading(false);
      
      if (role === 'Requester') setActiveTab('requester-dashboard');
      else if (role === 'Volunteer') setActiveTab('volunteer-feed');
      else setActiveTab('admin-command');
    }, 600);
  };

  const handleQuickDemoLogin = (selectedRole, demoName, demoEmail) => {
    setUser({
      name: demoName,
      email: demoEmail,
      phone: '+91 98123 45678',
      role: selectedRole,
      trustScore: selectedRole === 'Volunteer' ? 96 : selectedRole === 'Admin' ? 99 : 88,
      completedAssignments: selectedRole === 'Volunteer' ? 48 : 2,
      abandonedAssignments: 0,
      avgResponseMinutes: 11,
      badges: selectedRole === 'Volunteer' ? ['🏆 Reliable Responder', '⚡ Rapid Action'] : ['🛡️ Command Dispatcher']
    });
    setActiveRole(selectedRole);
    if (selectedRole === 'Requester') setActiveTab('requester-dashboard');
    else if (selectedRole === 'Volunteer') setActiveTab('volunteer-feed');
    else setActiveTab('admin-command');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 shadow-lg shadow-red-900/40 mb-3">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-outfit">
            Sign In to Crisis<span className="text-red-500">Connect</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access real-time emergency dispatch and response network
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Role</label>
            <div className="grid grid-cols-3 gap-2">
              {['Requester', 'Volunteer', 'Admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    role === r
                      ? 'bg-slate-800 border-red-500 text-white shadow-md'
                      : 'border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@crisisconnect.org"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Demo Access Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 text-center mb-3">
            ⚡ 1-Click Fast Evaluator Login
          </div>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleQuickDemoLogin('Requester', 'Ananya Sharma', 'ananya@crisis.org')}
              className="w-full py-2 px-3 bg-red-950/40 hover:bg-red-900/40 border border-red-800/50 rounded-xl text-xs text-red-200 font-medium flex items-center justify-between transition-colors"
            >
              <span>🚨 Login as Requester (In Distress)</span>
              <UserCheck className="w-3.5 h-3.5 text-red-400" />
            </button>
            <button
              onClick={() => handleQuickDemoLogin('Volunteer', 'Dr. Rahul Verma', 'rahul@relief.org')}
              className="w-full py-2 px-3 bg-blue-950/40 hover:bg-blue-900/40 border border-blue-800/50 rounded-xl text-xs text-blue-200 font-medium flex items-center justify-between transition-colors"
            >
              <span>🩺 Login as Verified Medical Volunteer</span>
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            </button>
            <button
              onClick={() => handleQuickDemoLogin('Admin', 'Operations Commander', 'admin@crisis.gov')}
              className="w-full py-2 px-3 bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/50 rounded-xl text-xs text-purple-200 font-medium flex items-center justify-between transition-colors"
            >
              <span>🗺️ Login as Command Center Admin</span>
              <UserCheck className="w-3.5 h-3.5 text-purple-400" />
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => setActiveTab('signup')}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Don't have an account? <span className="text-red-400 underline font-semibold">Sign Up</span>
          </button>
        </div>
      </div>
    </div>
  );
}
