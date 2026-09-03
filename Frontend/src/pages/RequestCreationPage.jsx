import React, { useState, useEffect } from 'react';
import { useCrisis } from '../context/CrisisContext';
import { Mic, MicOff, MapPin, Send, AlertTriangle, Sparkles, CheckCircle2, Navigation, Volume2 } from 'lucide-react';

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
      // Fallback simulation for unsupported browsers
      setIsListening(true);
      setTimeout(() => {
        setDescription(prev => (prev ? prev + ' ' : '') + 'Emergency request: We need urgent clean drinking water and medical supplies at sector 4 roof area.');
        setIsListening(false);
      }, 2000);
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

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      setIsListening(false);
    }
  };

  const handleDetectGPS = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(`GPS Locked: Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}`);
          setIsLocating(false);
        },
        () => {
          setLocation('Sector 4, Central Heights (GPS Approximate)');
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description && !title) return;

    submitHelpRequest({
      category,
      urgency,
      title: title || `${category} Assistance Request`,
      description,
      location,
      coordinates: { lat: 28.6139 + (Math.random() - 0.5) * 0.02, lng: 77.2090 + (Math.random() - 0.5) * 0.02 }
    });

    setSubmitted(true);
    setTimeout(() => {
      setActiveTab('requester-dashboard');
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        
        <div>
          <span className="px-3 py-1 bg-blue-950 text-blue-400 border border-blue-800 rounded-full text-xs font-bold inline-block mb-2">
            CRISIS HELP FORM
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
            Create Help Request
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Fill out the details below. Our AI system will score urgency and assign nearby responders.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 text-center bg-emerald-950/60 border border-emerald-800/80 rounded-2xl space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-white">Request Created & Triaged!</h3>
            <p className="text-xs text-emerald-300">Redirecting to your Requester Dashboard tracker...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Category Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Emergency Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Medical', 'Food & Water', 'Shelter', 'Rescue', 'Transportation', 'Clothing', 'Other'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                      category === cat
                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Urgency Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { level: 'Critical', color: 'bg-red-600 border-red-400' },
                  { level: 'High', color: 'bg-orange-500 border-orange-400' },
                  { level: 'Medium', color: 'bg-amber-500 border-amber-400' },
                  { level: 'Low', color: 'bg-emerald-600 border-emerald-400' }
                ].map(item => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setUrgency(item.level)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      urgency === item.level
                        ? `${item.color} text-white shadow-md`
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {item.level}
                  </button>
                ))}
              </div>
            </div>

            {/* Request Title */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Title / Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Need medical supplies & clean water"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* 🎙️ Voice Input & Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Detailed Description
                </label>
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                    isListening
                      ? 'bg-red-600 border-red-400 text-white animate-pulse'
                      : 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700'
                  }`}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isListening ? 'Listening... Speak now' : '🎙️ Tap Voice-to-Request'}</span>
                </button>
              </div>

              <textarea
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what help is required, number of people affected, and any specific hazards..."
                className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
              ></textarea>
            </div>

            {/* Location Input & GPS Auto-detect */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Location
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={isLocating}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5"
                >
                  <Navigation className={`w-4 h-4 text-emerald-400 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Locating...' : 'Detect GPS'}</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-base rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              <span>SUBMIT HELP REQUEST</span>
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
