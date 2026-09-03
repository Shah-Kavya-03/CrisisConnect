import React, { useState } from 'react';
import { CrisisProvider, useCrisis } from './context/CrisisContext';
import DemoBar from './components/DemoBar';
import Navbar from './components/Navbar';
import SosModal from './components/SosModal';

import LandingPage from './pages/LandingPage';
import RequesterDashboard from './pages/RequesterDashboard';
import RequestCreationPage from './pages/RequestCreationPage';
import VolunteerDashboard from './pages/VolunteerDashboard';
import RequestDetailsPage from './pages/RequestDetailsPage';
import TrustScorePage from './pages/TrustScorePage';
import AdminDashboard from './pages/AdminDashboard';
import DuplicateModerationPage from './pages/DuplicateModerationPage';
import AiTriagePage from './pages/AiTriagePage';
import Login from './pages/Login';
import Signup from './pages/Signup';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState('landing');
  const { setSelectedRequestId } = useCrisis();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage setActiveTab={setActiveTab} />;
      case 'requester-dashboard':
        return <RequesterDashboard setActiveTab={setActiveTab} />;
      case 'create-request':
        return <RequestCreationPage setActiveTab={setActiveTab} />;
      case 'volunteer-feed':
        return <VolunteerDashboard setActiveTab={setActiveTab} setSelectedRequestId={setSelectedRequestId} />;
      case 'request-details':
        return <RequestDetailsPage setActiveTab={setActiveTab} />;
      case 'trust-score':
        return <TrustScorePage />;
      case 'admin-command':
        return <AdminDashboard setActiveTab={setActiveTab} setSelectedRequestId={setSelectedRequestId} />;
      case 'moderation':
        return <DuplicateModerationPage />;
      case 'ai-triage':
        return <AiTriagePage />;
      case 'login':
        return <Login setActiveTab={setActiveTab} />;
      case 'signup':
        return <Signup setActiveTab={setActiveTab} />;
      default:
        return <LandingPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <DemoBar />
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
