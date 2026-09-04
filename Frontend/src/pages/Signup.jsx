import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import { authService } from '../services/authService';
import Logo from '../components/Logo';
import { Lock, Mail, User, Phone, CheckCircle2, ArrowRight, AlertCircle, Building2, HeartHandshake } from 'lucide-react';

export default function Signup({ setAuthMode }) {
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

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Register directly with MongoDB Database API (bcrypt encrypted in database)
      const data = await authService.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        skills: formData.role === 'Volunteer' ? formData.skills : undefined
      });

      if (data && data.user) {
        setUser(data.user);
        setActiveRole(data.user.role);
      }
    } catch (err) {
      console.error('Database registration error:', err);
      setErrorMsg(
        err.message || 'Registration failed. Please ensure MongoDB is running and your inputs are valid.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-8 px-4">
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-teal-500/30 shadow-[0_0_50px_rgba(15,118,110,0.2)] relative overflow-hidden">
        
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size="xl" showText={true} className="mb-3" />
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-outfit mt-2">
            Create <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">CrisisConnect</span> Account
          </h1>
          <p className="text-xs sm:text-sm text-cyan-200/80 mt-1 max-w-sm">
            Join our real-time emergency dispatch and response network
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-500/60 text-red-200 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-cyan-200 mb-2">Register As</label>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#031726]/80 rounded-2xl border border-cyan-900/60">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'Requester' })}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  formData.role === 'Requester'
                    ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md border border-cyan-400/40'
                    : 'text-cyan-300/70 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Requester</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'NGO' })}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  formData.role === 'NGO'
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md border border-teal-400/40'
                    : 'text-cyan-300/70 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>NGO Person</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'Volunteer' })}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  formData.role === 'Volunteer'
                    ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md border border-cyan-400/40'
                    : 'text-cyan-300/70 hover:text-white'
                }`}
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Volunteer</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cyan-200 mb-1">Full Name / Organization Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. Rajesh Gupta / Red Cross Team"
                className="w-full bg-[#031726]/90 border border-cyan-900/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-cyan-200 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rajesh@relief.org"
                  className="w-full bg-[#031726]/90 border border-cyan-900/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-cyan-200 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#031726]/90 border border-cyan-900/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cyan-200 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-[#031726]/90 border border-cyan-900/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {formData.role === 'Volunteer' && (
            <div>
              <label className="block text-xs font-semibold text-cyan-200 mb-1.5">
                Certifications & Disaster Response Skills
              </label>
              <div className="grid grid-cols-2 gap-2">
                {skillOptions.map((skill) => {
                  const isChecked = formData.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`text-left p-2 rounded-xl border text-[11px] font-medium flex items-center justify-between transition-colors ${
                        isChecked
                          ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                          : 'bg-[#031726]/60 border-cyan-950 text-cyan-400/60 hover:border-cyan-800'
                      }`}
                    >
                      <span className="truncate">{skill}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 via-teal-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 rounded-xl text-xs font-black tracking-wide shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2 transition-all mt-4"
          >
            {loading ? 'Creating Profile in Database...' : 'Complete Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setAuthMode('login')}
            className="text-xs text-cyan-300/80 hover:text-white transition-colors"
          >
            Already registered? <span className="text-cyan-400 font-bold underline">Sign In Here</span>
          </button>
        </div>

      </div>
    </div>
  );
}
