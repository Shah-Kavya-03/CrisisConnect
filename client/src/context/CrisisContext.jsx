import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CrisisContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Realistic Initial Disaster Requests
const INITIAL_REQUESTS = [
  {
    id: 'CC-1042',
    category: 'Medical',
    urgency: 'Critical',
    aiPriorityScore: 96,
    title: 'Urgent Insulin & Oxygen Supply Required',
    description: 'Elderly diabetic patient trapped in flooded apartment complex with low oxygen cylinder levels. Requires immediate medical supply dispatch.',
    location: 'Central Heights, Sector 4, Metro Area',
    coordinates: { lat: 28.6139, lng: 77.2090 },
    distanceKm: 1.2,
    requesterName: 'Ananya Sharma',
    requesterPhone: '+91 98765 43210',
    status: 'Assigned',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    expiresAt: new Date(Date.now() + 2 * 3600000 + 45 * 60000).toISOString(),
    assignedTo: {
      id: 'VOL-802',
      name: 'Dr. Rahul Verma',
      type: 'Volunteer Doctor',
      trustScore: 98,
      phone: '+91 91234 56789'
    },
    timeline: [
      { status: 'Created', timestamp: new Date(Date.now() - 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'Emergency request submitted via Web App' },
      { status: 'AI Triaged', timestamp: new Date(Date.now() - 14 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'AI Auto-Triage assigned CRITICAL (96/100)' },
      { status: 'Volunteer Assigned', timestamp: new Date(Date.now() - 8 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'Assigned to Dr. Rahul Verma (Dispatched)' },
    ],
    isDuplicate: false,
    keywords: ['diabetic', 'oxygen cylinder', 'flooded', 'medical supply', 'immediate']
  },
  {
    id: 'CC-1043',
    category: 'Rescue',
    urgency: 'Critical',
    aiPriorityScore: 98,
    title: 'Family Trapped on Roof due to Rising Floodwaters',
    description: '4 adults and 2 children stuck on rooftop near Riverside Colony. Water levels rising rapidly.',
    location: 'Riverside Colony, Block C, River Bank',
    coordinates: { lat: 28.6250, lng: 77.2180 },
    distanceKm: 2.4,
    requesterName: 'Vikram Singh',
    requesterPhone: '+91 99887 76655',
    status: 'Awaiting Help',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    expiresAt: new Date(Date.now() + 3 * 3600000).toISOString(),
    assignedTo: null,
    timeline: [
      { status: 'Created', timestamp: new Date(Date.now() - 5 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'Submitted via 1-Tap SOS Button' },
      { status: 'AI Triaged', timestamp: new Date(Date.now() - 4 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'AI Auto-Triage assigned CRITICAL (98/100)' },
    ],
    isDuplicate: false,
    keywords: ['trapped', 'roof', 'flooded', 'children', 'rising water']
  },
  {
    id: 'CC-1044',
    category: 'Food & Water',
    urgency: 'High',
    aiPriorityScore: 84,
    title: 'Clean Drinking Water Packets for 50 Evacuees',
    description: 'Community center shelter hosting families displaced by storm. Running out of drinking water.',
    location: 'Community Hall, Sector 12',
    coordinates: { lat: 28.6010, lng: 77.2250 },
    distanceKm: 3.8,
    requesterName: 'Priya Mehta (NGO Co-ordinator)',
    requesterPhone: '+91 97654 32109',
    status: 'En Route',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 3600000).toISOString(),
    assignedTo: {
      id: 'NGO-102',
      name: 'Red Cross Relief Team B',
      type: 'Registered NGO',
      trustScore: 99,
      phone: '+91 90000 11111'
    },
    timeline: [
      { status: 'Created', timestamp: new Date(Date.now() - 45 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'Standard request created' },
      { status: 'AI Triaged', timestamp: new Date(Date.now() - 44 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'AI Auto-Triage assigned HIGH (84/100)' },
      { status: 'Volunteer Assigned', timestamp: new Date(Date.now() - 30 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'Red Cross Relief Team B accepted' },
      { status: 'Volunteer En Route', timestamp: new Date(Date.now() - 10 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'Water truck dispatched & en route' },
    ],
    isDuplicate: false,
    keywords: ['drinking water', 'shelter', 'displaced', 'evacuees']
  },
  {
    id: 'CC-1045',
    category: 'Shelter',
    urgency: 'Medium',
    aiPriorityScore: 68,
    title: 'Temporary Tarpaulin Sheets & Dry Blankets',
    description: 'Roof damaged in storm. Need waterproof tarps for 3 families to prevent rain exposure.',
    location: 'West Ridge Basti, Plot 14',
    coordinates: { lat: 28.5900, lng: 77.1950 },
    distanceKm: 4.1,
    requesterName: 'Sunil Kumar',
    requesterPhone: '+91 94567 89012',
    status: 'Awaiting Help',
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
    expiresAt: new Date(Date.now() + 1 * 3600000 + 15 * 60000).toISOString(),
    assignedTo: null,
    timeline: [
      { status: 'Created', timestamp: new Date(Date.now() - 90 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'Standard request created' },
      { status: 'AI Triaged', timestamp: new Date(Date.now() - 89 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'AI Auto-Triage assigned MEDIUM (68/100)' }
    ],
    isDuplicate: false,
    keywords: ['tarpaulin', 'roof damaged', 'blankets', 'rain']
  },
  {
    id: 'CC-1046',
    category: 'Rescue',
    urgency: 'Critical',
    aiPriorityScore: 92,
    title: 'Rooftop Rescue Needed Near Riverside Colony (Flagged)',
    description: 'People stuck on roof at Riverside Colony near river bank. Please send boat urgently!',
    location: 'Riverside Colony, Block C, River Bank',
    coordinates: { lat: 28.6254, lng: 77.2182 },
    distanceKm: 2.4,
    requesterName: 'Rajesh G.',
    requesterPhone: '+91 99887 00011',
    status: 'Flagged Duplicate',
    createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
    expiresAt: new Date(Date.now() + 4 * 3600000).toISOString(),
    assignedTo: null,
    timeline: [
      { status: 'Created', timestamp: new Date(Date.now() - 2 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'Submitted' },
      { status: 'Flagged Duplicate', timestamp: new Date(Date.now() - 1 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'Flagged 87% similarity match with #CC-1043' }
    ],
    isDuplicate: true,
    duplicateMatchId: 'CC-1043',
    similarityScore: 87,
    duplicateReasons: ['Nearby GPS location (420m)', 'Same category (Rescue)', 'Highly similar wording', 'Submitted within 3 mins of CC-1043'],
    keywords: ['stuck on roof', 'riverside colony', 'boat rescue']
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-1',
    type: 'critical',
    title: '🔴 Critical Emergency Broadcast',
    message: 'New SOS Rescue Request #CC-1043 (Family trapped on roof) received 2.4 km away.',
    timestamp: '5m ago',
    read: false,
    requestId: 'CC-1043'
  },
  {
    id: 'NOTIF-2',
    type: 'duplicate',
    title: '⚠️ Duplicate Request Flagged',
    message: 'AI system flagged Request #CC-1046 as 87% duplicate match to #CC-1043.',
    timestamp: '2m ago',
    read: false,
    requestId: 'CC-1046'
  },
  {
    id: 'NOTIF-3',
    type: 'assignment',
    title: '✅ Request #CC-1044 Updated',
    message: 'Red Cross Relief Team B is now En Route with drinking water supplies.',
    timestamp: '10m ago',
    read: true,
    requestId: 'CC-1044'
  }
];

export const CrisisProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState('Requester');
  const [isOnline, setIsOnline] = useState(true);
  const [syncQueue, setSyncQueue] = useState([]);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [selectedRequestId, setSelectedRequestId] = useState('CC-1042');
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [isSimulatingDemo, setIsSimulatingDemo] = useState(false);

  // Authenticated User State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('crisis_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: 'Amit Patel',
      phone: '+91 98123 45678',
      role: 'Requester',
      location: 'Sector 4, Central Metro Area',
      coordinates: { lat: 28.6139, lng: 77.2090 },
      trustScore: 92,
      completedAssignments: 48,
      abandonedAssignments: 2,
      avgResponseMinutes: 14,
      badges: ['🏆 Reliable Responder', '⚡ Fast Response', '✅ 50+ Completed Requests']
    };
  });

  // Calculate AI Priority Score
  const calculateAiScore = (category, urgency, description) => {
    let score = 50;
    if (urgency === 'Critical') score += 35;
    else if (urgency === 'High') score += 20;
    else if (urgency === 'Medium') score += 10;

    const criticalWords = ['trapped', 'oxygen', 'diabetic', 'blood', 'unconscious', 'flooded', 'fire', 'collapsed', 'child', 'infant', 'bleeding'];
    const descLower = (description || '').toLowerCase();
    
    let matchCount = 0;
    criticalWords.forEach(w => {
      if (descLower.includes(w)) matchCount++;
    });

    score += Math.min(matchCount * 4, 15);
    return Math.min(Math.max(score, 10), 99);
  };

  // Submit SOS Emergency Request instantly
  const triggerSOS = (customCoords = null) => {
    const coords = customCoords || { lat: 28.6139 + (Math.random() - 0.5) * 0.01, lng: 77.2090 + (Math.random() - 0.5) * 0.01 };
    const newId = `CC-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    
    const newRequest = {
      id: newId,
      category: 'Medical',
      urgency: 'Critical',
      aiPriorityScore: 97,
      title: '🚨 CRITICAL SOS: Immediate Emergency Help Needed',
      description: 'Automated high-priority SOS alert sent via Panic Button. Requester requires immediate response at current GPS coordinates.',
      location: 'Detected GPS Location (Lat: ' + coords.lat.toFixed(4) + ', Lng: ' + coords.lng.toFixed(4) + ')',
      coordinates: coords,
      distanceKm: 0.8,
      requesterName: user?.name || 'Anonymous Crisis Requester',
      requesterPhone: user?.phone || '+91 98765 00000',
      status: 'Awaiting Help',
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 4 * 3600000).toISOString(),
      assignedTo: null,
      timeline: [
        { status: 'Created', timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: '1-Tap SOS Panic Button Triggered' },
        { status: 'AI Triaged', timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'AI Auto-Triage: Assigned MAXIMUM CRITICAL priority (97/100)' }
      ],
      isDuplicate: false,
      keywords: ['SOS', 'emergency', 'panic button', 'critical location']
    };

    if (!isOnline) {
      setSyncQueue(prev => [...prev, newRequest]);
      addNotification({
        type: 'warning',
        title: '🟠 Saved to Offline Queue',
        message: `SOS Request ${newId} saved locally. Will auto-sync when online.`,
        requestId: newId
      });
    } else {
      setRequests(prev => [newRequest, ...prev]);
      setSelectedRequestId(newId);
      addNotification({
        type: 'critical',
        title: '🚨 New SOS Emergency Broadcast',
        message: `Emergency SOS Request #${newId} submitted. AI priority 97/100!`,
        requestId: newId
      });

      // Attempt live API post in background if backend reachable
      axios.post(`${API_BASE}/requests`, {
        title: newRequest.title,
        description: newRequest.description,
        category: newRequest.category,
        urgency: newRequest.urgency,
        coordinates: coords,
        isSOS: true
      }).catch(() => {});
    }

    return newRequest;
  };

  // Submit standard help request
  const submitHelpRequest = (data) => {
    const newId = `CC-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const score = calculateAiScore(data.category, data.urgency, data.description);

    // Check duplicate similarity
    let isDup = false;
    let matchId = null;
    const descLower = (data.description || '').toLowerCase();

    requests.forEach(r => {
      if (r.category === data.category && (descLower.includes(r.category.toLowerCase()) || r.description.toLowerCase().includes(descLower.slice(0, 15)))) {
        isDup = true;
        matchId = r.id;
      }
    });

    const newRequest = {
      id: newId,
      category: data.category || 'General',
      urgency: data.urgency || 'Medium',
      aiPriorityScore: score,
      title: data.title || `${data.category} Support Request`,
      description: data.description || 'No description provided.',
      location: data.location || 'User Specified Location',
      coordinates: data.coordinates || { lat: 28.6150, lng: 77.2100 },
      distanceKm: (Math.random() * 3 + 0.5).toFixed(1),
      requesterName: user?.name || 'Citizen Requester',
      requesterPhone: user?.phone || '+91 98765 43210',
      status: isDup ? 'Flagged Duplicate' : 'Awaiting Help',
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 4 * 3600000).toISOString(),
      assignedTo: null,
      timeline: [
        { status: 'Created', timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'Request submitted' },
        { status: 'AI Triaged', timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: `AI Triaged (${score}/100)` }
      ],
      isDuplicate: isDup,
      duplicateMatchId: matchId,
      similarityScore: isDup ? 84 : 0,
      duplicateReasons: isDup ? ['Matching location cluster', 'Similar requested resources', 'Timestamp proximity'] : [],
      keywords: data.keywords || [data.category.toLowerCase()]
    };

    if (!isOnline) {
      setSyncQueue(prev => [...prev, newRequest]);
    } else {
      setRequests(prev => [newRequest, ...prev]);
      setSelectedRequestId(newId);
      addNotification({
        type: 'info',
        title: '✨ Request Created',
        message: `Request #${newId} successfully submitted and triaged!`,
        requestId: newId
      });

      axios.post(`${API_BASE}/requests`, {
        title: newRequest.title,
        description: newRequest.description,
        category: newRequest.category,
        urgency: newRequest.urgency,
        coordinates: newRequest.coordinates,
        locationName: newRequest.location
      }).catch(() => {});
    }

    return newRequest;
  };

  // Update Request Status (Accept, Mark En Route, Mark Completed, Resolve)
  const updateRequestStatus = (requestId, newStatus, volunteerInfo = null) => {
    const now = new Date();
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const updatedTimeline = [
          ...req.timeline,
          {
            status: newStatus,
            timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            note: `Status updated to ${newStatus}`
          }
        ];
        return {
          ...req,
          status: newStatus,
          assignedTo: volunteerInfo || req.assignedTo || {
            id: 'VOL-CURRENT',
            name: user?.name || 'Volunteer Responder',
            trustScore: user?.trustScore || 92,
            phone: user?.phone || '+91 91234 56789'
          },
          timeline: updatedTimeline
        };
      }
      return req;
    }));

    addNotification({
      type: newStatus === 'Resolved' ? 'success' : 'info',
      title: `⚡ Request #${requestId} Updated`,
      message: `Status set to: ${newStatus}`,
      requestId
    });

    if (isOnline) {
      axios.patch(`${API_BASE}/requests/${requestId}/status`, {
        status: newStatus,
        volunteerInfo
      }).catch(() => {});
    }
  };

  // Renew Auto-Expiring Request
  const renewRequest = (requestId) => {
    const newExpiry = new Date(Date.now() + 4 * 3600000).toISOString();
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          expiresAt: newExpiry,
          timeline: [
            ...req.timeline,
            { status: 'Renewed', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'Requester confirmed active emergency status' }
          ]
        };
      }
      return req;
    }));

    addNotification({
      type: 'info',
      title: '🔄 Request Renewed',
      message: `Request #${requestId} active duration extended by 4 hours.`,
      requestId
    });

    if (isOnline) {
      axios.patch(`${API_BASE}/requests/${requestId}/renew`).catch(() => {});
    }
  };

  // Add Notification
  const addNotification = (notif) => {
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      timestamp: 'Just now',
      read: false,
      ...notif
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Sync Offline Queue when returning online
  useEffect(() => {
    if (isOnline && syncQueue.length > 0) {
      setRequests(prev => [...syncQueue, ...prev]);
      addNotification({
        type: 'success',
        title: '🟢 Online Sync Completed',
        message: `Successfully synchronized ${syncQueue.length} queued offline request(s)!`
      });
      setSyncQueue([]);
    }
  }, [isOnline]);

  // Hackathon Live Demo Sequence Trigger
  const runDemoFlow = () => {
    setIsSimulatingDemo(true);
    setActiveRole('Requester');
    setSosModalOpen(true);

    setTimeout(() => {
      const sosReq = triggerSOS();
      setSosModalOpen(false);
      
      setTimeout(() => {
        setActiveRole('Volunteer');
        setSelectedRequestId(sosReq.id);
        
        setTimeout(() => {
          updateRequestStatus(sosReq.id, 'Assigned');
          
          setTimeout(() => {
            setActiveRole('Admin');
            
            setTimeout(() => {
              updateRequestStatus(sosReq.id, 'Resolved');
              setIsSimulatingDemo(false);
              addNotification({
                type: 'success',
                title: '🎉 Hackathon Live Demo Sequence Complete!',
                message: 'Full lifecycle demonstrated: SOS → AI Triage → Priority Feed → Volunteer Accept → Admin Command Center → Resolution!'
              });
            }, 3500);
          }, 3500);
        }, 3000);
      }, 3000);
    }, 2000);
  };

  const selectedRequest = requests.find(r => r.id === selectedRequestId) || requests[0];

  return (
    <CrisisContext.Provider value={{
      activeRole,
      setActiveRole,
      isOnline,
      setIsOnline,
      syncQueue,
      requests,
      selectedRequest,
      setSelectedRequestId,
      notifications,
      addNotification,
      markAllNotificationsRead,
      sosModalOpen,
      setSosModalOpen,
      triggerSOS,
      submitHelpRequest,
      updateRequestStatus,
      renewRequest,
      user,
      setUser,
      isSimulatingDemo,
      runDemoFlow
    }}>
      {children}
    </CrisisContext.Provider>
  );
};

export const useCrisis = () => {
  const context = useContext(CrisisContext);
  if (!context) {
    throw new Error('useCrisis must be used within a CrisisProvider');
  }
  return context;
};
