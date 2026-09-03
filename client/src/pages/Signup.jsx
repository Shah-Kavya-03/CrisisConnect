import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import { Shield, Lock, Mail, User, Phone, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';

export default function Signup({ setActiveTab }) {
  const { setUser, setActiveRole } = useCrisis();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'Volunteer',
    skills: ['First Aid / BLS']
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const skillOptions = [
    'First Aid / BLS',
    'Doctor / Physician',
    'Boat / Water Rescue',
    '4x4 Off-Road Transport',
    'Food & Ration Distribution',
    'Heavy Lifting / Debris Clearing'
  ];

  const toggleSkill = (skill) => {
    setFormData(prev => {
      const exists = prev.skills.includes(skill);
      return {
        ...prev,
        skills: exists ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill]
      };
    });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setUser({
        name: formData.name || 'New Volunteer',
        email: formData.email,
        phone: formData.phone || '+91 98765 43210',
        role: formData.role,
        trustScore: 88,
        completedAssignments: 0,
        abandonedAssignments: 0,
        avgResponseMinutes: 15,
        badges: ['🔰 Newly Verified Responder', '⚡ Emergency Standby']
      });
      setActiveRole(formData.role);
      setLoading(false);

      if (formData.role === 'Volunteer') setActiveTab('volunteer-feed');
      else if (formData.role === 'Requester') setActiveTab('requester-dashboard');
      else setActiveTab('admin-command');
    }, 600);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 shadow-lg shadow-blue-900/40 mb-3">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-outfit">
            Create Crisis<span className="text-blue-500">Connect</span> Profile
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Join the verified rapid emergency response ecosystem
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Join As</label>
            <div className="grid grid-cols-3 gap-2">
              {['Volunteer', 'Requester', 'NGO'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r })}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    formData.role === r
                      ? 'bg-slate-800 border-blue-500 text-white shadow-md'
                      : 'border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. Rajesh Gupta"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rajesh@relief.org"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {formData.role === 'Volunteer' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Certifications & Disaster Skills
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {skillOptions.map((skill) => {
                  const isChecked = formData.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`text-left p-2 rounded-xl border text-[11px] font-medium flex items-center justify-between transition-colors ${
                        isChecked
                          ? 'bg-blue-950/40 border-blue-800 text-blue-300'
                          : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="truncate">{skill}</span>
                      {isChecked && <CheckCircle2 className="w-3 h-3 text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition-all mt-4"
          >
            {loading ? 'Creating Profile...' : 'Complete Registration'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setActiveTab('login')}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Already registered? <span className="text-blue-400 underline font-semibold">Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
}
