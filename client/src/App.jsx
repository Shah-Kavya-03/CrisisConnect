import React, { useState, useEffect } from 'react';
import { CrisisProvider, useCrisis } from './context/CrisisContext';
import Navbar from './components/Navbar';
import SosModal from './components/SosModal';

import LandingPage from './pages/LandingPage';
import RequesterDashboard from './pages/RequesterDashboard';
import RequestCreationPage from './pages/RequestCreationPage';
import VolunteerDashboard from './pages/VolunteerDashboard';
import RequestDetailsPage from './pages/RequestDetailsPage';
import TrustScorePage from './pages/TrustScorePage';
import AdminDashboard from './pages/AdminDashboard';
import NgoDashboard from './pages/NgoDashboard';
import DuplicateModerationPage from './pages/DuplicateModerationPage';
import AiTriagePage from './pages/AiTriagePage';
import Login from './pages/Login';
import Signup from './pages/Signup';

function MainAppContent() {
  const { user, setSelectedRequestId } = useCrisis();
  const [authMode, setAuthMode] = useState('login');
  const [activeTab, setActiveTab] = useState('landing');

  // Auto-route logged in user to their role-specific default portal
  useEffect(() => {
    if (user) {
      if (user.role === 'Admin') {
        setActiveTab('admin-dashboard');
      } else if (user.role === 'NGO') {
        setActiveTab('ngo-dashboard');
      } else if (user.role === 'Volunteer') {
        setActiveTab('volunteer-feed');
      } else if (user.role === 'Requester') {
        setActiveTab('requester-dashboard');
      } else {
        setActiveTab('landing');
      }
    }
  }, [user]);

  // UNAUTHENTICATED: Force mandatory Login/Signup portal first
  if (!user) {
    return (
      <div className="min-h-screen bg-[#031726] text-cyan-50 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
        <main className="flex-1 flex items-center justify-center p-4">
          {authMode === 'signup' ? (
            <Signup setActiveTab={(tab) => tab === 'login' && setAuthMode('login')} setAuthMode={setAuthMode} />
          ) : (
            <Login setActiveTab={(tab) => tab === 'signup' && setAuthMode('signup')} setAuthMode={setAuthMode} />
          )}
        </main>
      </div>
    );
  }

  // AUTHENTICATED: STRICT ROLE-BASED PAGE RENDERING
  const renderActivePage = () => {
    const isRequester = user?.role === 'Requester';
    const isVolunteer = user?.role === 'Volunteer';
    const isNgo = user?.role === 'NGO';
    const isAdmin = user?.role === 'Admin';

    switch (activeTab) {
      case 'landing':
        return <LandingPage setActiveTab={setActiveTab} />;

      // 1. ADMIN ONLY OVERWATCH
      case 'admin-dashboard':
        return isAdmin ? (
          <AdminDashboard setActiveTab={setActiveTab} setSelectedRequestId={setSelectedRequestId} />
        ) : isNgo ? (
          <NgoDashboard setActiveTab={setActiveTab} setSelectedRequestId={setSelectedRequestId} />
        ) : isVolunteer ? (
          <VolunteerDashboard setActiveTab={setActiveTab} setSelectedRequestId={setSelectedRequestId} />
        ) : (
          <RequesterDashboard setActiveTab={setActiveTab} />
        );

      // 2. NGO AGENCY PORTAL (NO TRUST SCORES)
      case 'ngo-dashboard':
        return (isNgo || isAdmin) ? (
          <NgoDashboard setActiveTab={setActiveTab} setSelectedRequestId={setSelectedRequestId} />
        ) : (
          <RequesterDashboard setActiveTab={setActiveTab} />
        );

      // 3. CITIZEN REQUESTER PAGES
      case 'requester-dashboard':
        return isRequester ? <RequesterDashboard setActiveTab={setActiveTab} /> : <VolunteerDashboard setActiveTab={setActiveTab} setSelectedRequestId={setSelectedRequestId} />;
      case 'create-request':
        return isRequester ? <RequestCreationPage setActiveTab={setActiveTab} /> : <RequesterDashboard setActiveTab={setActiveTab} />;

      // 4. VOLUNTEER RESPONDER PAGES
      case 'volunteer-feed':
        return isVolunteer ? (
          <VolunteerDashboard setActiveTab={setActiveTab} setSelectedRequestId={setSelectedRequestId} />
        ) : isAdmin ? (
          <AdminDashboard setActiveTab={setActiveTab} setSelectedRequestId={setSelectedRequestId} />
        ) : isNgo ? (
          <NgoDashboard setActiveTab={setActiveTab} setSelectedRequestId={setSelectedRequestId} />
        ) : (
          <RequesterDashboard setActiveTab={setActiveTab} />
        );
      case 'trust-score':
        return isVolunteer ? (
          <TrustScorePage />
        ) : isAdmin ? (
          <AdminDashboard setActiveTab={setActiveTab} setSelectedRequestId={setSelectedRequestId} />
        ) : (
          <VolunteerDashboard setActiveTab={setActiveTab} setSelectedRequestId={setSelectedRequestId} />
        );

      // 5. SHARED MODERATION & TRIAGE (Admin and NGO)
      case 'moderation':
        return (isAdmin || isNgo) ? <DuplicateModerationPage /> : <VolunteerDashboard setActiveTab={setActiveTab} setSelectedRequestId={setSelectedRequestId} />;
      case 'ai-triage':
        return (isAdmin || isNgo) ? <AiTriagePage /> : <VolunteerDashboard setActiveTab={setActiveTab} setSelectedRequestId={setSelectedRequestId} />;

      // SHARED DETAILS PAGE
      case 'request-details':
        return <RequestDetailsPage setActiveTab={setActiveTab} />;

      default:
        if (isAdmin) return <AdminDashboard setActiveTab={setActiveTab} setSelectedRequestId={setSelectedRequestId} />;
        if (isNgo) return <NgoDashboard setActiveTab={setActiveTab} setSelectedRequestId={setSelectedRequestId} />;
        if (isVolunteer) return <VolunteerDashboard setActiveTab={setActiveTab} setSelectedRequestId={setSelectedRequestId} />;
        return <RequesterDashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#031726] text-cyan-50 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1">
        {renderActivePage()}
      </main>

      <SosModal activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <CrisisProvider>
      <MainAppContent />
    </CrisisProvider>
  );
}
