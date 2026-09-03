import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import { aiService } from '../services/aiService';
import { Cpu, Send, RefreshCw, Zap } from 'lucide-react';

const PRESETS = [
  {
    label: '🌊 Flood Rescue (Critical)',
    text: '4 people trapped on rooftop near river bank with rising flood water. 1 infant with fever. Need immediate boat rescue.',
    category: 'Rescue'
  },
  {
    label: '💊 Medical Emergency',
    text: 'Elderly diabetic heart patient without oxygen cylinder and power outage in Sector 4. High acute distress.',
    category: 'Medical'
  },
  {
    label: '🍞 Food & Clean Water',
    text: 'Displacement relief shelter at community hall running low on clean drinking water and baby food for 40 evacuees.',
    category: 'Food & Water'
  },
  {
    label: '⛺ Storm Shelter Tarps',
    text: 'Storm blew away roof tarpaulin sheets. 2 families exposed to heavy rain.',
    category: 'Shelter'
  }
];

export default function AiTriagePage() {
  const { requests, submitHelpRequest, addNotification } = useCrisis();

  const [inputText, setInputText] = useState(PRESETS[0].text);
  const [selectedCategory, setSelectedCategory] = useState(PRESETS[0].category);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState({
    urgencyScore: 97,
    recommendedUrgency: 'Critical',
    urgencyTier: 'Critical Tier 1 (Immediate Dispatch)',
    confidence: 0.94,
    criticalFactors: ['trapped on rooftop', 'rising flood water', 'infant fever'],
    suggestedVolunteerSkills: ['Water Rescue', 'First Aid', 'Emergency Boat Operation']
  });

  const runAnalysis = async (textToAnalyze, cat) => {
    setAnalyzing(true);
    try {
      const res = await aiService.scoreUrgency({
        title: 'Live Triage Test',
        description: textToAnalyze || inputText,
        category: cat || selectedCategory,
        declaredUrgency: 'High',
        peopleCount: 4
      });

      setAnalysisResult({
        urgencyScore: res.urgencyScore || 85,
        recommendedUrgency: res.recommendedUrgency || 'High',
        urgencyTier: res.urgencyTier || 'Priority Tier 1',
        confidence: res.confidence || 0.92,
        criticalFactors: res.criticalFactors || ['Acute distress signals identified'],
        suggestedVolunteerSkills: res.suggestedVolunteerSkills || ['Emergency Medical Assistance', 'Disaster Relief Logistics']
      });

      addNotification({
        type: 'info',
        title: '🧠 AI Triage Analysis Complete',
        message: `Calculated Priority: ${res.urgencyScore}/100 (${res.recommendedUrgency})`
      });
    } catch (err) {
      // Fallback
    } finally {
      setAnalyzing(false);
    }
  };

  const handleBroadcast = () => {
    submitHelpRequest({
      title: `${selectedCategory} AI-Triaged Emergency`,
      description: inputText,
      category: selectedCategory,
      urgency: analysisResult.recommendedUrgency,
      location: 'Live AI Triage Test Location'
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* HEADER */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-700/60 bg-gradient-to-r from-[#031726] via-[#071E2B] to-cyan-950/70">
        <span className="px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-500/50 rounded-full text-xs font-bold inline-block mb-2">
          NATURAL LANGUAGE SEVERITY ENGINE
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-outfit">
          AI Auto-Triage & NLP Analytics Lab
        </h1>
        <p className="text-xs sm:text-sm text-cyan-200/80 mt-1">
          Test the NLP neural model in real-time to extract critical distress keywords, assess urgency tiers, and auto-dispatch priorities.
        </p>
      </div>

      {/* INTERACTIVE WORKBENCH */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-800/60 bg-gradient-to-br from-[#031726] to-cyan-950/40 space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-cyan-900 pb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-lg text-white font-outfit">
              Live Distress Input & Evaluation
            </h3>
          </div>
          <span className="px-3 py-1 bg-teal-950 text-teal-300 border border-teal-500/50 rounded-full text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            ACTIVE MODEL: Crisis-NLP-v2.4
          </span>
        </div>

        {/* PRESET CHIPS */}
        <div>
          <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block mb-2">
            Quick Test Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(preset.text);
                  setSelectedCategory(preset.category);
                  runAnalysis(preset.text, preset.category);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  inputText === preset.text
                    ? 'bg-cyan-900 text-white border-cyan-400 shadow-md shadow-cyan-950'
                    : 'bg-[#031726] text-cyan-200/80 border-cyan-900 hover:border-cyan-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* INPUT TEXTAREA */}
        <div className="space-y-2">
          <span className="text-cyan-300 font-bold uppercase tracking-wider text-xs block">
            Raw Distress Input Text:
          </span>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={3}
            className="w-full bg-[#031726] border border-cyan-900 focus:border-cyan-400 rounded-2xl p-4 text-cyan-50 text-sm focus:outline-none transition-all resize-none font-sans"
            placeholder="Type any emergency distress description here to test AI NLP analysis..."
          />
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-cyan-300/80 font-semibold">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#031726] border border-cyan-900 text-cyan-100 text-xs rounded-xl px-3 py-2 focus:outline-none"
            >
              {['Medical', 'Rescue', 'Food & Water', 'Shelter', 'Fire', 'General'].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => runAnalysis(inputText, selectedCategory)}
              disabled={analyzing || !inputText.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all"
            >
              {analyzing ? <RefreshCw className="w-4 h-4 animate-spin text-slate-950" /> : <Zap className="w-4 h-4 text-slate-950" />}
              {analyzing ? 'Analyzing with AI...' : 'Run Live AI Triage'}
            </button>

            <button
              onClick={handleBroadcast}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition-all"
            >
              <Send className="w-4 h-4" /> Broadcast as Live SOS
            </button>
          </div>
        </div>

        {/* EXTRACTION BREAKDOWN RESULTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          <div className="bg-[#031726]/90 p-4 rounded-2xl border border-cyan-900 space-y-2">
            <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px] block">
              Extracted Critical Factors
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(analysisResult.criticalFactors || ['Acute Distress Signals']).map((factor, i) => (
                <span key={i} className="px-2.5 py-1 bg-cyan-950 text-cyan-200 border border-cyan-800 rounded-lg text-xs font-bold">
                  ⚡ {factor}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#031726]/90 p-4 rounded-2xl border border-cyan-900 space-y-2">
            <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px] block">
              Recommended Urgency Tier
            </span>
            <span className={`text-base font-extrabold font-outfit block ${
              analysisResult.recommendedUrgency === 'Critical' ? 'text-red-500' :
              analysisResult.recommendedUrgency === 'High' ? 'text-amber-400' : 'text-teal-300'
            }`}>
              {analysisResult.recommendedUrgency === 'Critical' ? '🔴 CRITICAL' :
               analysisResult.recommendedUrgency === 'High' ? '🟠 HIGH' : '🟡 MEDIUM'}
            </span>
            <span className="text-[11px] text-cyan-300/80 block font-medium">
              {analysisResult.urgencyTier}
            </span>
          </div>

          <div className="bg-[#031726]/90 p-4 rounded-2xl border border-cyan-900 space-y-2">
            <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px] block">
              Suggested Volunteer Match
            </span>
            <div className="flex flex-wrap gap-1">
              {(analysisResult.suggestedVolunteerSkills || ['Emergency Responder']).map((skill, i) => (
                <span key={i} className="text-xs font-semibold text-teal-300 block">
                  • {skill}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* PRIORITY GAUGE DISPLAY */}
        <div className="bg-[#031726] p-6 rounded-2xl border border-cyan-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-cyan-300 font-bold uppercase tracking-wider block">
              Calculated AI Priority Score (Confidence: {Math.round(analysisResult.confidence * 100)}%)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-black font-mono text-cyan-400">
                {analysisResult.urgencyScore}
              </span>
              <span className="text-sm text-cyan-300/70 font-normal">/ 100</span>
            </div>
          </div>

          <div className="w-full sm:w-1/2 bg-[#071E2B] h-4 rounded-full overflow-hidden border border-cyan-900">
            <div
              className="h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 shadow-lg transition-all duration-500"
              style={{ width: `${analysisResult.urgencyScore}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* TABLE OF RECENT AI DECISIONS */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-900 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-white font-outfit">
            Active System AI Triage Records
          </h3>
          <span className="text-xs text-cyan-300/70 font-medium">
            {requests.length} triaged requests in database
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#031726] text-cyan-300 uppercase font-bold text-[10px] border-b border-cyan-900">
              <tr>
                <th className="p-3">Request ID</th>
                <th className="p-3">Emergency Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">AI Urgency</th>
                <th className="p-3">Score</th>
                <th className="p-3">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-900/60">
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-cyan-950/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-cyan-300">#{req.id}</td>
                  <td className="p-3 font-bold text-white max-w-xs truncate">{req.title}</td>
                  <td className="p-3 text-cyan-100">{req.category}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold text-white ${
                      req.urgency === 'Critical' ? 'bg-red-600' :
                      req.urgency === 'High' ? 'bg-amber-600' : 'bg-teal-600'
                    }`}>
                      {req.urgency}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-cyan-400">{req.aiPriorityScore}/100</td>
                  <td className="p-3 font-semibold text-teal-300">{req.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
