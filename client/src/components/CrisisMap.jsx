import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AlertTriangle, MapPin, Phone, User, ShieldAlert, CheckCircle, Navigation } from 'lucide-react';
import { useCrisis } from '../context/CrisisContext';

// Custom SVG Markers based on severity
const createCustomIcon = (severity, category) => {
  let color = '#EF4444'; // Critical - Red
  if (severity === 'High') color = '#F97316'; // High - Orange
  else if (severity === 'Medium') color = '#F59E0B'; // Medium - Yellow
  else if (severity === 'Low' || severity === 'Resolved') color = '#10B981'; // Green

  const svgHtml = `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: ${color}; opacity: 0.3; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 28px; height: 28px; border-radius: 50%; background: ${color}; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
        ${severity === 'Critical' ? '🚨' : severity === 'High' ? '⚠️' : '📍'}
      </div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-map-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

const createVolunteerIcon = (vehicleType) => {
  let emoji = '🚙';
  if ((vehicleType || '').toLowerCase().includes('boat')) emoji = '🚤';
  else if ((vehicleType || '').toLowerCase().includes('ambulance') || (vehicleType || '').toLowerCase().includes('medical')) emoji = '🚑';
  else if ((vehicleType || '').toLowerCase().includes('truck')) emoji = '🚛';

  const svgHtml = `
    <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: #06B6D4; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 28px; height: 28px; border-radius: 50%; background: #0891B2; border: 2.5px solid #67E8F9; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px;">
        ${emoji}
      </div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-volunteer-marker',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  });
};

// Component to dynamically re-center map when center prop changes
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function CrisisMap({ requests = [], selectedRequestId, onSelectRequest, categoryFilter = 'All' }) {
  const defaultCenter = [28.6139, 77.2090];
  const [activeCenter, setActiveCenter] = useState(defaultCenter);
  const { activeResponderLocations } = useCrisis();

  const filteredRequests = requests.filter(r => {
    if (categoryFilter === 'All') return true;
    return r.category.toLowerCase().includes(categoryFilter.toLowerCase());
  });

  useEffect(() => {
    const selected = requests.find(r => r.id === selectedRequestId);
    if (selected && selected.coordinates) {
      setActiveCenter([selected.coordinates.lat, selected.coordinates.lng]);
    }
  }, [selectedRequestId, requests]);

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter center={activeCenter} />

        {filteredRequests.map(req => {
          if (!req.coordinates) return null;
          const position = [req.coordinates.lat, req.coordinates.lng];
          const isSelected = req.id === selectedRequestId;

          return (
            <React.Fragment key={req.id}>
              {/* Highlight Radius for Critical emergencies */}
              {req.urgency === 'Critical' && (
                <CircleMarker
                  center={position}
                  radius={35}
                  pathOptions={{
                    color: '#DC2626',
                    fillColor: '#EF4444',
                    fillOpacity: 0.15,
                    weight: 2
                  }}
                />
              )}

              <Marker
                position={position}
                icon={createCustomIcon(req.urgency, req.category)}
                eventHandlers={{
                  click: () => onSelectRequest && onSelectRequest(req.id)
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-3 max-w-xs text-slate-900 font-sans">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${
                        req.urgency === 'Critical' ? 'bg-red-600' :
                        req.urgency === 'High' ? 'bg-orange-500' :
                        req.urgency === 'Medium' ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}>
                        {req.urgency.toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-slate-500">#{req.id}</span>
                      <span className="ml-auto text-xs bg-slate-100 font-semibold px-2 py-0.5 rounded text-slate-700">
                        Score: {req.aiPriorityScore}/100
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 leading-tight mb-1">
                      {req.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                      {req.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500" /> {req.distanceKm} km away
                      </span>
                      <span className="font-semibold text-blue-600">
                        {req.status}
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectRequest && onSelectRequest(req.id)}
                      className="mt-3 w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors"
                    >
                      View Full Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* Real-Time Live Moving Responders & Dispatch Vectors */}
        {Object.values(activeResponderLocations || {}).map((responder, idx) => {
          if (!responder.coordinates || !responder.coordinates.lat || !responder.coordinates.lng) return null;
          const responderPos = [responder.coordinates.lat, responder.coordinates.lng];
          
          // Find target request coordinates to draw dispatch vector
          const targetReq = responder.targetRequestId ? requests.find(r => r.id === responder.targetRequestId) : null;
          const targetPos = targetReq?.coordinates ? [targetReq.coordinates.lat, targetReq.coordinates.lng] : null;

          return (
            <React.Fragment key={responder.volunteerId || idx}>
              {targetPos && (
                <Polyline
                  positions={[responderPos, targetPos]}
                  pathOptions={{ color: '#06B6D4', weight: 2.5, dashArray: '6, 8', opacity: 0.85 }}
                />
              )}
              <Marker position={responderPos} icon={createVolunteerIcon(responder.vehicleType)}>
                <Popup className="custom-popup">
                  <div className="p-2.5 max-w-xs text-slate-900 font-sans text-xs">
                    <div className="font-bold text-cyan-700 flex items-center gap-1 mb-1">
                      <span>⚡ Active Responder: {responder.name}</span>
                    </div>
                    <div className="text-slate-600">Vehicle: <strong>{responder.vehicleType || '4x4 Patrol'}</strong></div>
                    {responder.targetRequestId && (
                      <div className="text-teal-600 font-semibold mt-1">Dispatched to #{responder.targetRequestId}</div>
                    )}
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] glass-panel p-3 rounded-xl shadow-lg border border-slate-700/80 text-xs flex flex-wrap gap-3 items-center">
        <span className="font-bold text-slate-300">Live Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></span>
          <span className="text-slate-300">Critical ({requests.filter(r => r.urgency === 'Critical').length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-500"></span>
          <span className="text-slate-300">High ({requests.filter(r => r.urgency === 'High').length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span className="text-slate-300">Medium ({requests.filter(r => r.urgency === 'Medium').length})</span>
        </div>
      </div>
    </div>
  );
}
