import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import { Mic, MicOff, Send, CheckCircle2, Navigation } from 'lucide-react';

export default function RequestCreationPage({ setActiveTab }) {
  const { submitHelpRequest } = useCrisis();

  const [category, setCategory] = useState('Medical');
  const [urgency, setUrgency] = useState('High');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Sector 4, Central Metro Area');
  const [isListening, setIsListening] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Web Speech API Voice Recognition Logic
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setIsListening(true);
      setTimeout(() => {
        setDescription(prev => (prev ? prev + ' ' : '') + 'Emergency request: Urgent clean drinking water and medical supplies required at Sector 4 rooftop.');
        setIsListening(false);
      }, 1500);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    if (!isListening) {
      setIsListening(true);
      recognition.start();

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setDescription(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      setIsListening(false);
    }
  };

  const handleDetectGPS = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setLocation(`Detected GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        },
        () => {
          setIsLocating(false);
          setLocation('Sector 4, Central Heights (GPS Refined)');
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitHelpRequest({
      category,
      urgency,
      title: title || `${category} Support Request`,
      description: description || 'Citizen emergency request submitted.',
      location
    });
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-cyan-700/60 shadow-2xl space-y-6">
        
        <div>
          <span className="px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-bold inline-block mb-2">
            CITIZEN FORM
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-outfit">
            Create Emergency Help Request
          </h1>
          <p className="text-xs sm:text-sm text-cyan-200/80 mt-1">
            Provide details about the required assistance. Your request will be triaged by AI and routed to nearby volunteers.
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-teal-950 border border-teal-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-teal-400" />
            </div>
            <h2 className="text-2xl font-black text-white font-outfit">Request Submitted & AI Triaged!</h2>
            <p className="text-xs text-cyan-200/80 max-w-md mx-auto">
              Your incident report has been broadcasted to the emergency priority queue.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => setActiveTab('requester-dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg"
              >
                Go to My Dashboard
              </button>
              <button
                onClick={() => { setSubmitted(false); setTitle(''); setDescription(''); }}
                className="px-6 py-3 bg-[#031726] text-cyan-200 font-bold text-xs rounded-xl border border-cyan-800"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold text-cyan-200 uppercase tracking-wider mb-2">
                Emergency Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {['Medical', 'Rescue', 'Food', 'Water', 'Shelter'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                      category === cat
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow border-cyan-300'
                        : 'bg-[#031726] border-cyan-900 text-cyan-300/70 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block text-xs font-bold text-cyan-200 uppercase tracking-wider mb-2">
                Urgency Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { level: 'Critical', color: 'bg-red-600 border-red-400' },
                  { level: 'High', color: 'bg-amber-600 border-amber-400' },
                  { level: 'Medium', color: 'bg-teal-600 border-teal-400' },
                  { level: 'Low', color: 'bg-cyan-700 border-cyan-500' }
                ].map(item => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setUrgency(item.level)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      urgency === item.level
                        ? `${item.color} text-white shadow-md`
                        : 'bg-[#031726] border-cyan-900 text-cyan-300/70'
                    }`}
                  >
                    {item.level}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-cyan-200 uppercase tracking-wider mb-1.5">
                Title / Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Need medical supplies & clean water"
                className="w-full px-4 py-3 bg-[#031726] border border-cyan-900 rounded-xl text-sm text-white placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Voice Input & Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-cyan-200 uppercase tracking-wider">
                  Detailed Description
                </label>
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                    isListening
                      ? 'bg-cyan-500 border-cyan-300 text-slate-950 animate-pulse'
                      : 'bg-[#031726] border-cyan-800 text-cyan-300 hover:text-white'
                  }`}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5 text-slate-950" /> : <Mic className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{isListening ? 'Listening...' : '🎙️ Tap Voice-to-Text'}</span>
                </button>
              </div>

              <textarea
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what help is required, number of people affected, and any specific hazards..."
                className="w-full p-4 bg-[#031726] border border-cyan-900 rounded-xl text-sm text-white placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400 leading-relaxed"
              ></textarea>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-cyan-200 uppercase tracking-wider mb-1.5">
                Location
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="flex-1 px-4 py-3 bg-[#031726] border border-cyan-900 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={isLocating}
                  className="px-4 py-3 bg-[#031726] hover:bg-cyan-950 text-cyan-200 rounded-xl text-xs font-bold border border-cyan-800 flex items-center gap-1.5"
                >
                  <Navigation className={`w-4 h-4 text-cyan-400 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Locating...' : 'Detect GPS'}</span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-cyan-500 via-teal-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-base rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5 text-slate-950" />
              <span>SUBMIT HELP REQUEST</span>
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
