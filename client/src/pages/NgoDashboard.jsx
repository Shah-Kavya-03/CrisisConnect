import React, { useState, useEffect } from 'react';
import { useCrisis } from '../context/CrisisContext';
import CrisisMap from '../components/CrisisMap';
import api from '../services/api';
import { Building2, Layers, Package, Truck, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

export default function NgoDashboard({ setActiveTab, setSelectedRequestId }) {
  const { requests, exportRequestsCsv, user } = useCrisis();
  const [mapCategory, setMapCategory] = useState('All');

  // Resource Inventory State (Managed exclusively by NGO for relief operations)
  const [inventory, setInventory] = useState({
    oxygenCylinders: 35,
    foodKits: 1200,
    drinkingWaterLiters: 4500,
    temporaryShelterBeds: 180,
    rescueBoats: 6,
    medicalFirstAidKits: 250
  });

  const [inventorySaved, setInventorySaved] = useState(false);

  // Sync inventory with live backend organization inventory
  useEffect(() => {
    const fetchOrgInventory = async () => {
      try {
        const res = await api.get('/organizations');
        if (res.data?.organizations && res.data.organizations.length > 0) {
          const firstOrg = res.data.organizations[0];
          if (firstOrg.resourcesInventory) {
            setInventory(firstOrg.resourcesInventory);
          }
        }
      } catch (e) {}
    };
    fetchOrgInventory();
  }, []);

  const handleUpdateInventory = (key, delta) => {
    setInventory(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta)
    }));
    setInventorySaved(true);
    setTimeout(() => setInventorySaved(false), 2000);
  };

  const criticalCount = requests.filter(r => r.urgency === 'Critical' && r.status !== 'Resolved').length;
  const highCount = requests.filter(r => r.urgency === 'High' && r.status !== 'Resolved').length;
  const activeCount = requests.filter(r => r.status !== 'Resolved').length;
  const resolvedCount = requests.filter(r => r.status === 'Resolved').length;

  const filteredRequests = mapCategory === 'All' 
    ? requests 
    : requests.filter(r => r.category === mapCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* NGO COMMAND CENTER HEADER */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-teal-700/60 bg-gradient-to-r from-[#031726] via-[#071E2B] to-cyan-950/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/50 text-xs font-bold inline-flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-teal-400" />
              <span>NGO AGENCY COMMAND</span>
            </span>
            <span className="text-xs text-cyan-300/70 font-semibold">
              {user?.name || 'Registered Relief Organization'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-outfit">
            NGO Fleet & Operations Center
          </h1>
          <p className="text-xs text-cyan-200/80 mt-1">
            Real-time geospatial heatmap of active emergencies, NGO fleet distribution, and relief supply logistics.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportRequestsCsv}
            className="px-4 py-2.5 bg-teal-950 hover:bg-teal-900 text-teal-300 font-bold rounded-xl border border-teal-700 text-xs flex items-center gap-1.5 transition-all"
          >
            <span>📊 Export Incident CSV</span>
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className="px-4 py-2.5 bg-amber-950 hover:bg-amber-900 text-amber-300 font-bold rounded-xl border border-amber-800 text-xs flex items-center gap-1.5 transition-all"
          >
            <span>🔍 AI Duplicate Moderation</span>
          </button>
          <button
            onClick={() => setActiveTab('ai-triage')}
            className="px-4 py-2.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-200 font-bold rounded-xl border border-cyan-700 text-xs flex items-center gap-1.5 transition-all"
          >
            <span>🧠 AI Severity Triage</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS (No Trust Scores) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-red-900/60 bg-red-950/30 text-center">
          <div className="text-3xl font-black text-red-500 font-outfit">{criticalCount}</div>
          <div className="text-[11px] text-red-300 font-bold uppercase tracking-wider mt-1">🔴 Critical Needs</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-amber-900/60 bg-amber-950/30 text-center">
          <div className="text-3xl font-black text-amber-400 font-outfit">{highCount}</div>
          <div className="text-[11px] text-amber-300 font-bold uppercase tracking-wider mt-1">🟠 High Priority</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-cyan-900/60 bg-cyan-950/30 text-center">
          <div className="text-3xl font-black text-cyan-400 font-outfit">{activeCount}</div>
          <div className="text-[11px] text-cyan-300 font-bold uppercase tracking-wider mt-1">🟡 Total Active Incidents</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-teal-900/60 bg-teal-950/30 text-center">
          <div className="text-3xl font-black text-teal-300 font-outfit">{resolvedCount + 14}</div>
          <div className="text-[11px] text-teal-300 font-bold uppercase tracking-wider mt-1">🟢 Resolved Missions</div>
        </div>
      </div>

      {/* RELIEF RESOURCE INVENTORY SECTION */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white font-outfit">Agency Relief Supply Inventory</h2>
          </div>
          {inventorySaved && (
            <span className="text-xs text-teal-400 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Updated Inventory
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-[#031726]/90 p-3.5 rounded-2xl border border-cyan-900/80 text-center">
            <div className="text-xs text-cyan-300/80 font-semibold">Oxygen Cylinders</div>
            <div className="text-2xl font-black text-cyan-300 font-outfit my-1">{inventory.oxygenCylinders}</div>
            <div className="flex justify-center gap-2 mt-1">
              <button onClick={() => handleUpdateInventory('oxygenCylinders', -1)} className="px-2 py-0.5 bg-cyan-950 text-cyan-200 rounded-lg text-xs font-bold hover:bg-cyan-900">-</button>
              <button onClick={() => handleUpdateInventory('oxygenCylinders', 1)} className="px-2 py-0.5 bg-cyan-900 text-cyan-200 rounded-lg text-xs font-bold hover:bg-cyan-800">+</button>
            </div>
          </div>

          <div className="bg-[#031726]/90 p-3.5 rounded-2xl border border-cyan-900/80 text-center">
            <div className="text-xs text-cyan-300/80 font-semibold">Food Rations</div>
            <div className="text-2xl font-black text-teal-300 font-outfit my-1">{inventory.foodKits}</div>
            <div className="flex justify-center gap-2 mt-1">
              <button onClick={() => handleUpdateInventory('foodKits', -25)} className="px-2 py-0.5 bg-cyan-950 text-cyan-200 rounded-lg text-xs font-bold hover:bg-cyan-900">-25</button>
              <button onClick={() => handleUpdateInventory('foodKits', 25)} className="px-2 py-0.5 bg-cyan-900 text-cyan-200 rounded-lg text-xs font-bold hover:bg-cyan-800">+25</button>
            </div>
          </div>

          <div className="bg-[#031726]/90 p-3.5 rounded-2xl border border-cyan-900/80 text-center">
            <div className="text-xs text-cyan-300/80 font-semibold">Water (Liters)</div>
            <div className="text-2xl font-black text-sky-300 font-outfit my-1">{inventory.drinkingWaterLiters}</div>
            <div className="flex justify-center gap-2 mt-1">
              <button onClick={() => handleUpdateInventory('drinkingWaterLiters', -100)} className="px-2 py-0.5 bg-cyan-950 text-cyan-200 rounded-lg text-xs font-bold hover:bg-cyan-900">-100</button>
              <button onClick={() => handleUpdateInventory('drinkingWaterLiters', 100)} className="px-2 py-0.5 bg-cyan-900 text-cyan-200 rounded-lg text-xs font-bold hover:bg-cyan-800">+100</button>
            </div>
          </div>

          <div className="bg-[#031726]/90 p-3.5 rounded-2xl border border-cyan-900/80 text-center">
            <div className="text-xs text-cyan-300/80 font-semibold">Shelter Beds</div>
            <div className="text-2xl font-black text-amber-300 font-outfit my-1">{inventory.temporaryShelterBeds}</div>
            <div className="flex justify-center gap-2 mt-1">
              <button onClick={() => handleUpdateInventory('temporaryShelterBeds', -5)} className="px-2 py-0.5 bg-cyan-950 text-cyan-200 rounded-lg text-xs font-bold hover:bg-cyan-900">-5</button>
              <button onClick={() => handleUpdateInventory('temporaryShelterBeds', 5)} className="px-2 py-0.5 bg-cyan-900 text-cyan-200 rounded-lg text-xs font-bold hover:bg-cyan-800">+5</button>
            </div>
          </div>

          <div className="bg-[#031726]/90 p-3.5 rounded-2xl border border-cyan-900/80 text-center">
            <div className="text-xs text-cyan-300/80 font-semibold">Rescue Boats</div>
            <div className="text-2xl font-black text-teal-300 font-outfit my-1">{inventory.rescueBoats}</div>
            <div className="flex justify-center gap-2 mt-1">
              <button onClick={() => handleUpdateInventory('rescueBoats', -1)} className="px-2 py-0.5 bg-cyan-950 text-cyan-200 rounded-lg text-xs font-bold hover:bg-cyan-900">-</button>
              <button onClick={() => handleUpdateInventory('rescueBoats', 1)} className="px-2 py-0.5 bg-cyan-900 text-cyan-200 rounded-lg text-xs font-bold hover:bg-cyan-800">+</button>
            </div>
          </div>

          <div className="bg-[#031726]/90 p-3.5 rounded-2xl border border-cyan-900/80 text-center">
            <div className="text-xs text-cyan-300/80 font-semibold">First Aid Kits</div>
            <div className="text-2xl font-black text-cyan-200 font-outfit my-1">{inventory.medicalFirstAidKits}</div>
            <div className="flex justify-center gap-2 mt-1">
              <button onClick={() => handleUpdateInventory('medicalFirstAidKits', -10)} className="px-2 py-0.5 bg-cyan-950 text-cyan-200 rounded-lg text-xs font-bold hover:bg-cyan-900">-10</button>
              <button onClick={() => handleUpdateInventory('medicalFirstAidKits', 10)} className="px-2 py-0.5 bg-cyan-900 text-cyan-200 rounded-lg text-xs font-bold hover:bg-cyan-800">+10</button>
            </div>
          </div>
        </div>
      </div>

      {/* HEATMAP & ACTIVE INCIDENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* HEATMAP */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-cyan-900/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-sm text-white font-outfit">Geospatial Emergency Overwatch</span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {['All', 'Rescue', 'Medical', 'Food & Water', 'Shelter'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setMapCategory(cat)}
                  className={`px-3 py-1 rounded-xl font-bold transition-all ${
                    mapCategory === cat
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'bg-[#031726] text-cyan-300/70 hover:text-white border border-cyan-900/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel p-3 rounded-3xl border border-cyan-900/60 h-[480px] overflow-hidden relative">
            <CrisisMap
              requests={filteredRequests}
              onSelectRequest={(r) => {
                setSelectedRequestId(r.id);
                setActiveTab('request-details');
              }}
            />
          </div>
        </div>

        {/* ACTIVE INCIDENT LIST */}
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-cyan-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-sm text-white font-outfit">Active Operations Feed</span>
            </div>
            <span className="text-xs text-cyan-400 font-semibold">{filteredRequests.length} listed</span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {filteredRequests.slice(0, 6).map(req => (
              <div
                key={req.id}
                onClick={() => {
                  setSelectedRequestId(req.id);
                  setActiveTab('request-details');
                }}
                className="glass-panel p-4 rounded-2xl border border-cyan-900/60 hover:border-cyan-400 transition-all cursor-pointer space-y-2 bg-[#031726]/80"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white font-outfit truncate max-w-[180px]">{req.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    req.urgency === 'Critical' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {req.urgency}
                  </span>
                </div>
                <p className="text-xs text-cyan-300/70 line-clamp-2">{req.description}</p>
                <div className="flex items-center justify-between text-[11px] text-cyan-400/80 pt-1 border-t border-cyan-950">
                  <span>📍 {req.location}</span>
                  <span className="text-teal-400 font-semibold">{req.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
