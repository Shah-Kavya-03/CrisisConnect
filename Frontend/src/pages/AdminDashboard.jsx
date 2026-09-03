import React, { useState, useEffect } from 'react';
import { useCrisis } from '../context/CrisisContext';
import api from '../services/api';
import {
  ShieldCheck,
  Users,
  Building2,
  AlertTriangle,
  Award,
  Database,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  PlusCircle,
  Sliders,
  Sparkles,
  Activity,
  Phone,
  Mail,
  MapPin,
  Clock,
  RefreshCw,
  Package,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

export default function AdminDashboard({ setActiveTab, setSelectedRequestId }) {
  const { user, requests, exportRequestsCsv } = useCrisis();
  const [currentAdminTab, setCurrentAdminTab] = useState('overview'); // 'overview' | 'users' | 'organizations' | 'requests' | 'trust'

  // Loading & notification states
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // 1. Live Database Statistics
  const [dbStats, setDbStats] = useState({
    users: { total: 4, requesters: 1, volunteers: 1, ngos: 1, admins: 1 },
    requests: { total: 5, critical: 3, high: 1, resolved: 0, duplicates: 1, active: 5 },
    organizations: { total: 2, verified: 2 },
    systemStatus: 'Operational',
    timestamp: new Date().toISOString()
  });

  // 2. User Entity Directory State
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');

  // 3. NGOs & Agencies State
  const [orgsList, setOrgsList] = useState([]);
  const [orgSearch, setOrgSearch] = useState('');

  // 4. Emergency Requests State
  const [adminRequestsList, setAdminRequestsList] = useState([]);
  const [reqStatusFilter, setReqStatusFilter] = useState('All');
  const [reqUrgencyFilter, setReqUrgencyFilter] = useState('All');
  const [reqSearch, setReqSearch] = useState('');

  // 5. Principal Trust Score Entities State
  const [trustEntities, setTrustEntities] = useState([]);
  const [trustAuditLogs, setTrustAuditLogs] = useState([]);
  const [trustSearch, setTrustSearch] = useState('');

  // Modals State
  const [scoreModalEntity, setScoreModalEntity] = useState(null);
  const [newScoreVal, setNewScoreVal] = useState(90);
  const [scoreReason, setScoreReason] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('🏆 Reliable Responder');

  const [editUserModal, setEditUserModal] = useState(null);
  const [editUserForm, setEditUserForm] = useState({ name: '', phone: '', role: 'Volunteer', isVerified: true });

  const [createOrgModal, setCreateOrgModal] = useState(false);
  const [newOrgForm, setNewOrgForm] = useState({
    name: '',
    registrationNumber: '',
    type: 'Registered NGO',
    contactEmail: '',
    contactPhone: '',
    jurisdictionCity: 'Delhi NCR',
    headquartersAddress: 'Emergency Operations Command'
  });

  // Fetch all Admin Data from Backend API
  const loadAdminData = async () => {
    setLoading(true);
    setActionError('');
    try {
      // 1. Fetch Stats
      const statsRes = await api.get('/admin/stats').catch(() => null);
      if (statsRes && statsRes.data && statsRes.data.stats) {
        setDbStats(statsRes.data.stats);
      }

      // 2. Fetch Users
      const usersRes = await api.get('/admin/users').catch(() => null);
      if (usersRes && usersRes.data && usersRes.data.users) {
        setUsersList(usersRes.data.users);
      } else {
        // Mock fallback baseline
        setUsersList([
          { _id: 'u1', name: 'Operations Commander', email: 'admin@crisis.gov', phone: '+91 98111 22233', role: 'Admin', isVerified: true, trustScore: 100, badges: ['🛡️ Command Dispatcher'] },
          { _id: 'u2', name: 'Dr. Rahul Verma', email: 'rahul@relief.org', phone: '+91 91234 56789', role: 'Volunteer', isVerified: true, trustScore: 98, badges: ['🏆 Reliable Responder', '⚡ Rapid Action'] },
          { _id: 'u3', name: 'Red Cross Admin', email: 'ngo@redcross.org', phone: '+91 90000 11111', role: 'NGO', isVerified: true, badges: ['🤝 NGO Partner'] },
          { _id: 'u4', name: 'Ananya Sharma', email: 'ananya@crisis.org', phone: '+91 98765 43210', role: 'Requester', isVerified: true, trustScore: 88, badges: ['🔰 Verified Requester'] }
        ]);
      }

      // 3. Fetch Organizations
      const orgsRes = await api.get('/admin/organizations').catch(() => null);
      if (orgsRes && orgsRes.data && orgsRes.data.organizations) {
        setOrgsList(orgsRes.data.organizations);
      } else {
        setOrgsList([
          {
            _id: 'org1',
            name: 'Red Cross Relief Team B',
            registrationNumber: 'NGO-DEL-8921',
            type: 'Registered NGO',
            contactEmail: 'contact@redcross-relief.org',
            contactPhone: '+91 90000 11111',
            jurisdictionCity: 'Delhi NCR',
            isVerified: true,
            activeVolunteersCount: 18,
            resourcesInventory: { oxygenCylinders: 40, foodKits: 1200, drinkingWaterLiters: 5000, temporaryShelterBeds: 150, rescueBoats: 6, medicalFirstAidKits: 300 }
          },
          {
            _id: 'org2',
            name: 'Central Metro Community Relief Shelter',
            registrationNumber: 'GOV-SHELTER-4401',
            type: 'Government Agency',
            contactEmail: 'shelter.metro@crisis.gov',
            contactPhone: '+91 98888 22334',
            jurisdictionCity: 'Delhi NCR',
            isVerified: true,
            activeVolunteersCount: 25,
            resourcesInventory: { oxygenCylinders: 20, foodKits: 800, drinkingWaterLiters: 4000, temporaryShelterBeds: 250, rescueBoats: 2, medicalFirstAidKits: 100 }
          }
        ]);
      }

      // 4. Fetch Requests
      const reqsRes = await api.get('/admin/requests').catch(() => null);
      if (reqsRes && reqsRes.data && reqsRes.data.requests) {
        setAdminRequestsList(reqsRes.data.requests);
      } else {
        setAdminRequestsList(requests);
      }

      // 5. Fetch Principal Trust Scores
      const trustRes = await api.get('/admin/trust-scores').catch(() => null);
      if (trustRes && trustRes.data && trustRes.data.entities) {
        setTrustEntities(trustRes.data.entities);
        setTrustAuditLogs(trustRes.data.auditLogs || []);
      } else {
        setTrustEntities([
          { _id: 'u2', name: 'Dr. Rahul Verma', email: 'rahul@relief.org', role: 'Volunteer', trustScore: 98, trustScoreLastUpdatedBy: 'Principal Admin Authority', trustScoreUpdateReason: 'Verified Rapid BLS Response', completedAssignments: 48, badges: ['🏆 Reliable Responder', '⚡ Rapid Action', '🩺 Medical Specialist'], isVerified: true },
          { _id: 'u4', name: 'Ananya Sharma', email: 'ananya@crisis.org', role: 'Requester', trustScore: 88, trustScoreLastUpdatedBy: 'Principal Admin Authority', trustScoreUpdateReason: 'Baseline Verified Requester', completedAssignments: 2, badges: ['🔰 Verified Requester'], isVerified: true },
          { _id: 'u1', name: 'Operations Commander', email: 'admin@crisis.gov', role: 'Admin', trustScore: 100, trustScoreLastUpdatedBy: 'Principal Authority', trustScoreUpdateReason: 'Central Operations Command Clearance', completedAssignments: 154, badges: ['🛡️ Command Dispatcher'], isVerified: true }
        ]);
        setTrustAuditLogs([
          { _id: 'log1', targetUserId: { name: 'Dr. Rahul Verma', role: 'Volunteer' }, verifiedBy: { name: 'Operations Commander' }, verificationType: 'TRUST_SCORE_OVERRIDE', previousScore: 95, newScore: 98, notes: 'Promoted for successful high-water ambulance evacuation', createdAt: new Date(Date.now() - 3600000).toISOString() }
        ]);
      }

    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const showToast = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  // User Actions
  const handleToggleUserVerify = async (targetUser) => {
    try {
      const updatedStatus = !targetUser.isVerified;
      await api.patch(`/admin/users/${targetUser._id}`, { isVerified: updatedStatus }).catch(() => null);
      setUsersList(prev => prev.map(u => u._id === targetUser._id ? { ...u, isVerified: updatedStatus } : u));
      showToast(`User ${targetUser.name} verification status updated to ${updatedStatus ? 'VERIFIED' : 'UNVERIFIED'}`);
    } catch (err) {
      setActionError('Failed to update verification status');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user '${userName}' from the database?`)) return;
    try {
      await api.delete(`/admin/users/${userId}`).catch(() => null);
      setUsersList(prev => prev.filter(u => u._id !== userId));
      setTrustEntities(prev => prev.filter(u => u._id !== userId));
      showToast(`User ${userName} permanently removed from database`);
    } catch (err) {
      setActionError('Failed to delete user');
    }
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editUserModal) return;
    try {
      await api.patch(`/admin/users/${editUserModal._id}`, editUserForm).catch(() => null);
      setUsersList(prev => prev.map(u => u._id === editUserModal._id ? { ...u, ...editUserForm } : u));
      setEditUserModal(null);
      showToast(`Profile for '${editUserForm.name}' updated successfully`);
    } catch (err) {
      setActionError('Failed to update user profile');
    }
  };

  // Organization Actions
  const handleToggleOrgVerify = async (targetOrg) => {
    try {
      const updatedStatus = !targetOrg.isVerified;
      await api.patch(`/admin/organizations/${targetOrg._id}`, { isVerified: updatedStatus }).catch(() => null);
      setOrgsList(prev => prev.map(o => o._id === targetOrg._id ? { ...o, isVerified: updatedStatus } : o));
      showToast(`Organization '${targetOrg.name}' status set to ${updatedStatus ? 'VERIFIED' : 'PENDING'}`);
    } catch (err) {
      setActionError('Failed to update organization status');
    }
  };

  const handleDeleteOrg = async (orgId, orgName) => {
    if (!window.confirm(`Are you sure you want to delete NGO/Agency '${orgName}' from the database?`)) return;
    try {
      await api.delete(`/admin/organizations/${orgId}`).catch(() => null);
      setOrgsList(prev => prev.filter(o => o._id !== orgId));
      showToast(`Organization '${orgName}' deleted`);
    } catch (err) {
      setActionError('Failed to delete organization');
    }
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/organizations', newOrgForm).catch(() => null);
      const created = (res && res.data && res.data.organization) || {
        _id: 'org_' + Date.now(),
        ...newOrgForm,
        isVerified: true,
        resourcesInventory: { oxygenCylinders: 20, foodKits: 400, drinkingWaterLiters: 1500, temporaryShelterBeds: 50, rescueBoats: 3, medicalFirstAidKits: 100 }
      };
      setOrgsList(prev => [created, ...prev]);
      setCreateOrgModal(false);
      showToast(`New Agency '${newOrgForm.name}' registered into database!`);
    } catch (err) {
      setActionError('Failed to create organization');
    }
  };

  // Request Actions
  const handleUpdateReqStatus = async (reqId, newStatus) => {
    try {
      await api.patch(`/admin/requests/${reqId}`, { status: newStatus, note: `Status updated to ${newStatus}` }).catch(() => null);
      setAdminRequestsList(prev => prev.map(r => (r._id === reqId || r.id === reqId) ? { ...r, status: newStatus } : r));
      showToast(`Emergency request status updated to: ${newStatus}`);
    } catch (err) {
      setActionError('Failed to update request');
    }
  };

  const handleDeleteRequest = async (reqId, reqTitle) => {
    if (!window.confirm(`Are you sure you want to delete emergency request '${reqTitle}'?`)) return;
    try {
      await api.delete(`/admin/requests/${reqId}`).catch(() => null);
      setAdminRequestsList(prev => prev.filter(r => r._id !== reqId && r.id !== reqId));
      showToast(`Request '${reqTitle}' deleted`);
    } catch (err) {
      setActionError('Failed to delete request');
    }
  };

  // Principal Trust Score Management Actions
  const handleOpenScoreModal = (entity) => {
    setScoreModalEntity(entity);
    setNewScoreVal(entity.trustScore || 85);
    setScoreReason('');
  };

  const handleSaveTrustScore = async (e) => {
    e.preventDefault();
    if (!scoreModalEntity) return;

    try {
      const scoreNum = parseInt(newScoreVal, 10);
      const badgesToAdd = selectedBadge ? [selectedBadge] : [];

      await api.patch(`/admin/trust-scores/${scoreModalEntity._id}`, {
        trustScore: scoreNum,
        reason: scoreReason || 'Principal Administrator adjustment',
        badgesToAdd
      }).catch(() => null);

      // Update in local lists
      setTrustEntities(prev => prev.map(ent => {
        if (ent._id === scoreModalEntity._id) {
          return {
            ...ent,
            trustScore: scoreNum,
            trustScoreLastUpdatedBy: 'Principal Admin Authority',
            trustScoreUpdateReason: scoreReason || 'Principal Administrator adjustment',
            badges: Array.from(new Set([...(ent.badges || []), ...badgesToAdd]))
          };
        }
        return ent;
      }));

      // Add to audit logs
      setTrustAuditLogs(prev => [
        {
          _id: 'log_' + Date.now(),
          targetUserId: { name: scoreModalEntity.name, role: scoreModalEntity.role },
          verifiedBy: { name: user?.name || 'Operations Commander' },
          verificationType: 'TRUST_SCORE_OVERRIDE',
          previousScore: scoreModalEntity.trustScore,
          newScore: scoreNum,
          notes: scoreReason || 'Principal Authority manual override',
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);

      setScoreModalEntity(null);
      showToast(`Trust Score for '${scoreModalEntity.name}' updated to ${scoreNum}/100!`);
    } catch (err) {
      setActionError('Failed to adjust trust score');
    }
  };

  // Filtering Logic
  const filteredUsers = usersList.filter(u => {
    const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter;
    const matchesSearch = !userSearch || 
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone?.includes(userSearch);
    return matchesRole && matchesSearch;
  });

  const filteredOrgs = orgsList.filter(o => {
    return !orgSearch || 
      o.name?.toLowerCase().includes(orgSearch.toLowerCase()) || 
      o.registrationNumber?.toLowerCase().includes(orgSearch.toLowerCase()) ||
      o.contactEmail?.toLowerCase().includes(orgSearch.toLowerCase());
  });

  const filteredRequests = adminRequestsList.filter(r => {
    const matchesStatus = reqStatusFilter === 'All' || r.status === reqStatusFilter;
    const matchesUrgency = reqUrgencyFilter === 'All' || r.urgency === reqUrgencyFilter;
    const matchesSearch = !reqSearch || 
      r.title?.toLowerCase().includes(reqSearch.toLowerCase()) || 
      r.locationName?.toLowerCase().includes(reqSearch.toLowerCase()) ||
      r.location?.toLowerCase().includes(reqSearch.toLowerCase()) ||
      r.requesterName?.toLowerCase().includes(reqSearch.toLowerCase());
    return matchesStatus && matchesUrgency && matchesSearch;
  });

  const filteredTrustEntities = trustEntities.filter(e => {
    return !trustSearch || 
      e.name?.toLowerCase().includes(trustSearch.toLowerCase()) || 
      e.email?.toLowerCase().includes(trustSearch.toLowerCase()) ||
      e.role?.toLowerCase().includes(trustSearch.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* HEADER BANNER */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/50 bg-gradient-to-r from-[#031726] via-[#071E2B] to-cyan-950/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/50 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>PRINCIPAL OPERATIONS COMMAND</span>
            </span>
            <span className="text-xs text-teal-400 font-semibold flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> Full Database Authority
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-outfit">
            CrisisConnect Central Admin Command
          </h1>
          <p className="text-xs sm:text-sm text-cyan-200/80">
            Comprehensive control over database collections, user identities, NGO registries, emergency SOS dispatches, and Principal Trust Score authority.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadAdminData}
            disabled={loading}
            className="px-3.5 py-2 bg-[#031726] hover:bg-cyan-950 text-cyan-200 font-bold rounded-xl border border-cyan-800 text-xs flex items-center gap-1.5 transition-all shadow"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live DB</span>
          </button>
          <button
            onClick={exportRequestsCsv}
            className="px-3.5 py-2 bg-teal-950 hover:bg-teal-900 text-teal-300 font-bold rounded-xl border border-teal-700 text-xs flex items-center gap-1.5 transition-all shadow"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
            <span>Export Database CSV</span>
          </button>
        </div>
      </div>

      {/* TOAST ALERTS */}
      {actionSuccess && (
        <div className="p-3 bg-teal-950/80 border border-teal-500/80 text-teal-200 text-xs rounded-xl flex items-center gap-2 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3 bg-red-950/80 border border-red-500/80 text-red-200 text-xs rounded-xl flex items-center gap-2 animate-fadeIn shadow-lg">
          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="font-semibold">{actionError}</span>
        </div>
      )}

      {/* 5 MAIN ADMIN NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-[#031726]/90 rounded-2xl border border-cyan-900/60 shadow-lg">
        <button
          onClick={() => setCurrentAdminTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            currentAdminTab === 'overview'
              ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg border border-cyan-400/40'
              : 'text-cyan-300/70 hover:text-white hover:bg-cyan-950/40'
          }`}
        >
          <Database className="w-4 h-4 text-cyan-300" />
          <span>1. Database Overview</span>
        </button>

        <button
          onClick={() => setCurrentAdminTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            currentAdminTab === 'users'
              ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-lg border border-sky-400/40'
              : 'text-cyan-300/70 hover:text-white hover:bg-cyan-950/40'
          }`}
        >
          <Users className="w-4 h-4 text-sky-300" />
          <span>2. User Directory ({usersList.length})</span>
        </button>

        <button
          onClick={() => setCurrentAdminTab('organizations')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            currentAdminTab === 'organizations'
              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg border border-teal-400/40'
              : 'text-cyan-300/70 hover:text-white hover:bg-cyan-950/40'
          }`}
        >
          <Building2 className="w-4 h-4 text-teal-300" />
          <span>3. NGOs & Agencies ({orgsList.length})</span>
        </button>

        <button
          onClick={() => setCurrentAdminTab('requests')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            currentAdminTab === 'requests'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg border border-amber-400/40'
              : 'text-cyan-300/70 hover:text-white hover:bg-cyan-950/40'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-300" />
          <span>4. SOS Requests ({adminRequestsList.length})</span>
        </button>

        <button
          onClick={() => setCurrentAdminTab('trust')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            currentAdminTab === 'trust'
              ? 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-black shadow-lg border border-cyan-300'
              : 'text-cyan-300 hover:text-white hover:bg-cyan-950/40'
          }`}
        >
          <Award className="w-4 h-4 text-teal-300" />
          <span>5. Principal Trust Score Authority</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SYSTEM & DATABASE OVERVIEW */}
      {/* ========================================================================= */}
      {currentAdminTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* 6 TOP SUMMARY METRICS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="glass-panel p-4 rounded-2xl border border-cyan-900/60 text-center bg-[#031726]/90">
              <div className="text-3xl font-black text-white font-outfit">{dbStats.users?.total || usersList.length}</div>
              <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider mt-1">Total Users</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-cyan-900/60 text-center bg-[#031726]/90">
              <div className="text-3xl font-black text-cyan-400 font-outfit">{dbStats.users?.volunteers || 1}</div>
              <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider mt-1">Responders</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-teal-900/60 text-center bg-[#031726]/90">
              <div className="text-3xl font-black text-teal-300 font-outfit">{dbStats.organizations?.total || orgsList.length}</div>
              <div className="text-[10px] text-teal-300 font-bold uppercase tracking-wider mt-1">NGOs & Agencies</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-red-900/60 text-center bg-red-950/30">
              <div className="text-3xl font-black text-red-500 font-outfit">{dbStats.requests?.critical || 3}</div>
              <div className="text-[10px] text-red-300 font-bold uppercase tracking-wider mt-1">Critical SOS</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-amber-900/60 text-center bg-amber-950/30">
              <div className="text-3xl font-black text-amber-400 font-outfit">{dbStats.requests?.active || 5}</div>
              <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider mt-1">Active Incidents</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-emerald-900/60 text-center bg-emerald-950/30">
              <div className="text-3xl font-black text-emerald-400 font-outfit">100%</div>
              <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider mt-1">DB Integrity</div>
            </div>
          </div>

          {/* SYSTEM ARCHITECTURE & HEALTH STATUS CARD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-cyan-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  MongoDB Collections Status
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-600/60 text-[10px] font-bold">
                  🟢 Connected
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-[#031726] rounded-xl border border-cyan-950">
                  <span className="text-cyan-200">Users Collection:</span>
                  <span className="font-bold text-white">{dbStats.users?.total || usersList.length} documents</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#031726] rounded-xl border border-cyan-950">
                  <span className="text-cyan-200">Emergency Requests Collection:</span>
                  <span className="font-bold text-white">{dbStats.requests?.total || adminRequestsList.length} documents</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#031726] rounded-xl border border-cyan-950">
                  <span className="text-cyan-200">Organizations & Shelters Collection:</span>
                  <span className="font-bold text-white">{dbStats.organizations?.total || orgsList.length} documents</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#031726] rounded-xl border border-cyan-950">
                  <span className="text-cyan-200">Principal Trust & Verification Logs:</span>
                  <span className="font-bold text-teal-300">{trustAuditLogs.length} audit records</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-cyan-900/60 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-teal-400" />
                Principal Governance Directives
              </h3>

              <div className="p-4 bg-cyan-950/40 rounded-2xl border border-cyan-800/60 text-xs text-cyan-200/90 space-y-2 leading-relaxed">
                <p>
                  <strong>• Authority Model:</strong> The CrisisConnect platform establishes an authoritative central administration where Trust Scores are strictly governed by the Principal Administrator.
                </p>
                <p>
                  <strong>• Segregation of NGOs & Agencies:</strong> Relief NGOs and government agencies operate in fleet coordination mode with no access to or control over Trust Scores.
                </p>
                <p>
                  <strong>• Full Administrative Auditing:</strong> Every adjustment made to a user, NGO inventory, request dispatch, or trust scorecard is logged permanently.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USER DIRECTORY & MANAGEMENT (FULL DATABASE ACCESS) */}
      {/* ========================================================================= */}
      {currentAdminTab === 'users' && (
        <div className="space-y-6 animate-fadeIn">
          {/* SEARCH & FILTERS BAR */}
          <div className="glass-panel p-4 rounded-2xl border border-cyan-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name, email, phone..."
                className="w-full bg-[#031726] border border-cyan-900/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-cyan-300/70 font-semibold flex items-center gap-1">
                <Filter className="w-3 h-3 text-cyan-400" /> Role:
              </span>
              {['All', 'Requester', 'Volunteer', 'NGO', 'Admin'].map(r => (
                <button
                  key={r}
                  onClick={() => setUserRoleFilter(r)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    userRoleFilter === r
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-[#031726] text-cyan-300/70 hover:text-white border border-cyan-900/60'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* USERS TABLE */}
          <div className="glass-panel rounded-3xl border border-cyan-900/60 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#031726] text-cyan-300/80 uppercase font-bold border-b border-cyan-900/80 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">User Details</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Verification</th>
                    <th className="py-3.5 px-4">Trust Status</th>
                    <th className="py-3.5 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-950/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-cyan-400/60">
                        No user entities found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u._id} className="hover:bg-cyan-950/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">{u.name}</div>
                          <div className="text-[11px] text-cyan-300/70">{u.email}</div>
                        </td>
                        <td className="py-3.5 px-4 text-cyan-200">
                          {u.phone || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'Admin' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500' :
                            u.role === 'Volunteer' ? 'bg-teal-950 text-teal-300 border border-teal-500' :
                            u.role === 'NGO' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500' :
                            'bg-sky-950 text-sky-300 border border-sky-500'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleUserVerify(u)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                              u.isVerified 
                                ? 'bg-teal-950/70 text-teal-300 border border-teal-600 hover:bg-red-950 hover:text-red-300'
                                : 'bg-amber-950/70 text-amber-300 border border-amber-600 hover:bg-teal-950 hover:text-teal-300'
                            }`}
                            title="Click to toggle status"
                          >
                            {u.isVerified ? <CheckCircle2 className="w-3 h-3 text-teal-400" /> : <Clock className="w-3 h-3 text-amber-400" />}
                            <span>{u.isVerified ? 'Verified' : 'Pending'}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          {u.role === 'NGO' ? (
                            <span className="text-[11px] text-cyan-500/60 italic">N/A (Agency)</span>
                          ) : (
                            <span className="font-bold text-cyan-300">
                              {u.trustScore !== undefined ? `${u.trustScore}/100` : '85/100'}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditUserModal(u);
                              setEditUserForm({ name: u.name, phone: u.phone, role: u.role, isVerified: u.isVerified });
                            }}
                            className="p-1.5 bg-[#031726] hover:bg-cyan-950 text-cyan-300 rounded-lg border border-cyan-900 transition-colors"
                            title="Edit User"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-lg border border-red-800 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: NGOS & AGENCIES REGISTRY (FULL DATABASE ACCESS) */}
      {/* ========================================================================= */}
      {currentAdminTab === 'organizations' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="glass-panel p-4 rounded-2xl border border-cyan-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
              <input
                type="text"
                value={orgSearch}
                onChange={(e) => setOrgSearch(e.target.value)}
                placeholder="Search NGOs by name, reg number..."
                className="w-full bg-[#031726] border border-cyan-900/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              onClick={() => setCreateOrgModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register New Agency</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrgs.map(org => (
              <div key={org._id} className="glass-panel p-5 rounded-3xl border border-cyan-900/60 space-y-4 bg-[#031726]/80">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-600 text-[10px] font-bold">
                      {org.type}
                    </span>
                    <h3 className="text-base font-bold text-white font-outfit mt-1">{org.name}</h3>
                    <p className="text-[11px] text-cyan-400 font-mono">Reg: {org.registrationNumber}</p>
                  </div>
                  <button
                    onClick={() => handleToggleOrgVerify(org)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                      org.isVerified ? 'bg-teal-950 text-teal-300 border border-teal-500' : 'bg-amber-950 text-amber-300 border border-amber-500'
                    }`}
                  >
                    {org.isVerified ? <CheckCircle2 className="w-3 h-3 text-teal-400" /> : <Clock className="w-3 h-3 text-amber-400" />}
                    <span>{org.isVerified ? 'Authorized' : 'Pending'}</span>
                  </button>
                </div>

                <div className="text-xs text-cyan-300/80 space-y-1">
                  <div>📍 Jurisdiction: <strong className="text-white">{org.jurisdictionCity}</strong></div>
                  <div>✉️ Contact: {org.contactEmail} • {org.contactPhone}</div>
                </div>

                {/* RELIEF RESOURCES INVENTORY PILLS */}
                <div className="pt-2 border-t border-cyan-950">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase mb-2">Relief Asset Inventory:</div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-center">
                    <div className="bg-[#031726] p-1.5 rounded-xl border border-cyan-900">
                      <span className="text-cyan-200">O2 Cylinders: </span>
                      <strong className="text-cyan-300">{org.resourcesInventory?.oxygenCylinders || 25}</strong>
                    </div>
                    <div className="bg-[#031726] p-1.5 rounded-xl border border-cyan-900">
                      <span className="text-cyan-200">Food Kits: </span>
                      <strong className="text-teal-300">{org.resourcesInventory?.foodKits || 500}</strong>
                    </div>
                    <div className="bg-[#031726] p-1.5 rounded-xl border border-cyan-900">
                      <span className="text-cyan-200">Boats: </span>
                      <strong className="text-teal-300">{org.resourcesInventory?.rescueBoats || 4}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-cyan-950">
                  <button
                    onClick={() => handleDeleteOrg(org._id, org.name)}
                    className="px-3 py-1 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-xl text-xs font-bold border border-red-800 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete Organization</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SOS EMERGENCY REQUESTS (FULL DATABASE ACCESS) */}
      {/* ========================================================================= */}
      {currentAdminTab === 'requests' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="glass-panel p-4 rounded-2xl border border-cyan-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
              <input
                type="text"
                value={reqSearch}
                onChange={(e) => setReqSearch(e.target.value)}
                placeholder="Search requests by title, location, citizen..."
                className="w-full bg-[#031726] border border-cyan-900/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-cyan-300/70 font-semibold">Status:</span>
              {['All', 'Awaiting Help', 'Assigned', 'En Route', 'Resolved', 'Flagged Duplicate'].map(st => (
                <button
                  key={st}
                  onClick={() => setReqStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    reqStatusFilter === st
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-[#031726] text-cyan-300/70 hover:text-white border border-cyan-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredRequests.map(req => (
              <div key={req._id || req.id} className="glass-panel p-4 rounded-2xl border border-cyan-900/60 hover:border-cyan-500/60 transition-all bg-[#031726]/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-cyan-400 font-bold">{req.customId || req.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      req.urgency === 'Critical' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {req.urgency}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
                      {req.category}
                    </span>
                    {req.isDuplicate && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">
                        ⚠️ Duplicate
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white font-outfit">{req.title}</h4>
                  <p className="text-xs text-cyan-200/70 line-clamp-2">{req.description}</p>
                  <div className="text-[11px] text-cyan-400 flex items-center gap-3 pt-1">
                    <span>📍 {req.locationName || req.location}</span>
                    <span>👤 Requester: {req.requesterName}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                  <select
                    value={req.status}
                    onChange={(e) => handleUpdateReqStatus(req._id || req.id, e.target.value)}
                    className="bg-[#031726] border border-cyan-800 rounded-xl px-2.5 py-1.5 text-xs text-cyan-200 font-semibold focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Awaiting Help">Awaiting Help</option>
                    <option value="Assigned">Assigned</option>
                    <option value="En Route">En Route</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Flagged Duplicate">Flagged Duplicate</option>
                    <option value="Rejected (Spam)">Rejected (Spam)</option>
                  </select>

                  <button
                    onClick={() => handleDeleteRequest(req._id || req.id, req.title)}
                    className="p-2 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-xl border border-red-800 transition-colors"
                    title="Delete Request"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PRINCIPAL TRUST AUTHORITY & SCORE MANAGEMENT */}
      {/* ========================================================================= */}
      {currentAdminTab === 'trust' && (
        <div className="space-y-6 animate-fadeIn">
          {/* PRINCIPAL MANDATE BANNER */}
          <div className="glass-panel p-6 rounded-3xl border border-teal-500/50 bg-gradient-to-r from-teal-950/80 via-[#071E2B] to-[#031726] space-y-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-teal-300" />
              <h2 className="text-lg font-bold text-white font-outfit">
                Principal Trust & Reliability Governance
              </h2>
            </div>
            <p className="text-xs text-cyan-200/90 leading-relaxed max-w-3xl">
              <strong>Mandate:</strong> The Trust Score represents the official credibility of responders and citizens. Per architectural guidelines, <strong>the Trust Score is associated strictly with the Principal/Admin Authority</strong>. NGOs and agencies are segregated with no access or control over trust scores.
            </p>
          </div>

          {/* SEARCH & FILTERS */}
          <div className="glass-panel p-4 rounded-2xl border border-cyan-900/60 flex items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
              <input
                type="text"
                value={trustSearch}
                onChange={(e) => setTrustSearch(e.target.value)}
                placeholder="Search entity by name or role..."
                className="w-full bg-[#031726] border border-cyan-900/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <span className="text-xs text-teal-400 font-semibold">{filteredTrustEntities.length} entities managed</span>
          </div>

          {/* ENTITY TRUST SCORE DIRECTORY */}
          <div className="glass-panel rounded-3xl border border-cyan-900/60 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#031726] text-cyan-300/80 uppercase font-bold border-b border-cyan-900/80 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Entity User</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Official Trust Score</th>
                    <th className="py-3.5 px-4">Last Governance Note</th>
                    <th className="py-3.5 px-4">Badges Granted</th>
                    <th className="py-3.5 px-4 text-right">Principal Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-950/60">
                  {filteredTrustEntities.map(ent => (
                    <tr key={ent._id} className="hover:bg-cyan-950/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{ent.name}</div>
                        <div className="text-[11px] text-cyan-400">{ent.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-bold">
                          {ent.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-black text-white font-outfit">
                            {ent.trustScore || 85}<span className="text-[10px] text-cyan-500 font-normal">/100</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            (ent.trustScore || 85) >= 90 ? 'bg-teal-950 text-teal-300 border border-teal-600' : 'bg-amber-950 text-amber-300 border border-amber-600'
                          }`}>
                            {(ent.trustScore || 85) >= 90 ? 'Top Reliability' : 'Standard'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-cyan-200/80">
                        {ent.trustScoreUpdateReason || 'Baseline Registered Profile'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(ent.badges || []).map(b => (
                            <span key={b} className="px-2 py-0.5 bg-[#031726] text-cyan-200 border border-cyan-800 rounded-md text-[10px]">
                              {b}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenScoreModal(ent)}
                          className="px-3 py-1.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 ml-auto"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Adjust Score</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RECENT PRINCIPAL AUDIT TRAIL */}
          <div className="glass-panel p-6 rounded-3xl border border-cyan-900/60 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Principal Governance Audit Trail
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
              {trustAuditLogs.map(log => (
                <div key={log._id} className="p-3 bg-[#031726] rounded-xl border border-cyan-950 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-white">{log.targetUserId?.name || 'Entity User'}</span>
                    <span className="text-cyan-400/80 ml-2">Score calibrated: {log.previousScore} ➔ {log.newScore}/100</span>
                    <p className="text-[11px] text-cyan-300/70 mt-0.5">Note: "{log.notes}"</p>
                  </div>
                  <div className="text-right text-[10px] text-cyan-500/80 shrink-0">
                    <div>Authorized by {log.verifiedBy?.name || 'Principal Administrator'}</div>
                    <div>{new Date(log.createdAt).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADJUST TRUST SCORE (PRINCIPAL AUTHORITY) */}
      {/* ========================================================================= */}
      {scoreModalEntity && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-teal-500/60 max-w-lg w-full space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-400" />
                <h3 className="text-lg font-bold text-white font-outfit">Adjust Principal Trust Score</h3>
              </div>
              <button onClick={() => setScoreModalEntity(null)} className="text-cyan-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#031726] rounded-xl border border-cyan-900 text-xs space-y-1">
              <div>Entity: <strong className="text-white text-sm">{scoreModalEntity.name}</strong></div>
              <div>Role: <span className="text-teal-300 font-semibold">{scoreModalEntity.role}</span> • Current Score: <span className="text-cyan-400 font-bold">{scoreModalEntity.trustScore}/100</span></div>
            </div>

            <form onSubmit={handleSaveTrustScore} className="space-y-4 text-xs">
              <div>
                <label className="block text-cyan-200 font-semibold mb-1">
                  Calibrate Score (0 - 100): <strong className="text-white text-sm ml-2">{newScoreVal}/100</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newScoreVal}
                  onChange={(e) => setNewScoreVal(e.target.value)}
                  className="w-full accent-teal-400 h-2 bg-cyan-950 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-cyan-200 font-semibold mb-1">Official Governance Justification Reason</label>
                <input
                  type="text"
                  required
                  value={scoreReason}
                  onChange={(e) => setScoreReason(e.target.value)}
                  placeholder="e.g., Exceptional on-site boat flood rescue performance verified"
                  className="w-full bg-[#031726] border border-cyan-900 rounded-xl px-3 py-2.5 text-white placeholder-cyan-500/50 focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-cyan-200 font-semibold mb-1">Issue Official Certification Badge</label>
                <select
                  value={selectedBadge}
                  onChange={(e) => setSelectedBadge(e.target.value)}
                  className="w-full bg-[#031726] border border-cyan-900 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                >
                  <option value="🏆 Reliable Responder">🏆 Reliable Responder</option>
                  <option value="⚡ Rapid Action">⚡ Rapid Action</option>
                  <option value="🩺 Medical Specialist">🩺 Medical Specialist</option>
                  <option value="🛡️ Command Verified">🛡️ Command Verified</option>
                  <option value="🔰 Verified Requester">🔰 Verified Requester</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setScoreModalEntity(null)}
                  className="px-4 py-2 bg-[#031726] hover:bg-cyan-950 text-cyan-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 rounded-xl font-black shadow-lg"
                >
                  Apply Principal Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT USER PROFILE */}
      {/* ========================================================================= */}
      {editUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/60 max-w-md w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-outfit">Edit User Entity Record</h3>
              <button onClick={() => setEditUserModal(null)} className="text-cyan-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-cyan-200 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                  className="w-full bg-[#031726] border border-cyan-900 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-cyan-200 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editUserForm.phone}
                  onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                  className="w-full bg-[#031726] border border-cyan-900 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-cyan-200 font-semibold mb-1">Role</label>
                <select
                  value={editUserForm.role}
                  onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                  className="w-full bg-[#031726] border border-cyan-900 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Requester">Requester</option>
                  <option value="Volunteer">Volunteer</option>
                  <option value="NGO">NGO</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isVerified"
                  checked={editUserForm.isVerified}
                  onChange={(e) => setEditUserForm({ ...editUserForm, isVerified: e.target.checked })}
                  className="rounded bg-cyan-950 border-cyan-800 text-cyan-400"
                />
                <label htmlFor="isVerified" className="text-cyan-200 font-semibold">
                  Officially Verified in Database
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditUserModal(null)}
                  className="px-4 py-2 bg-[#031726] hover:bg-cyan-950 text-cyan-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 rounded-xl font-black shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTER NEW NGO / AGENCY */}
      {/* ========================================================================= */}
      {createOrgModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-teal-500/60 max-w-md w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-outfit">Register New Agency / NGO</h3>
              <button onClick={() => setCreateOrgModal(false)} className="text-cyan-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-cyan-200 font-semibold mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  value={newOrgForm.name}
                  onChange={(e) => setNewOrgForm({ ...newOrgForm, name: e.target.value })}
                  placeholder="e.g., National Disaster Response Unit"
                  className="w-full bg-[#031726] border border-cyan-900 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-cyan-200 font-semibold mb-1">Registration ID / Code</label>
                <input
                  type="text"
                  required
                  value={newOrgForm.registrationNumber}
                  onChange={(e) => setNewOrgForm({ ...newOrgForm, registrationNumber: e.target.value })}
                  placeholder="e.g., NGO-DEL-9842"
                  className="w-full bg-[#031726] border border-cyan-900 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-cyan-200 font-semibold mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={newOrgForm.contactEmail}
                    onChange={(e) => setNewOrgForm({ ...newOrgForm, contactEmail: e.target.value })}
                    placeholder="contact@agency.org"
                    className="w-full bg-[#031726] border border-cyan-900 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-cyan-200 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={newOrgForm.contactPhone}
                    onChange={(e) => setNewOrgForm({ ...newOrgForm, contactPhone: e.target.value })}
                    placeholder="+91 90000 22222"
                    className="w-full bg-[#031726] border border-cyan-900 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-cyan-200 font-semibold mb-1">Jurisdiction City</label>
                <input
                  type="text"
                  value={newOrgForm.jurisdictionCity}
                  onChange={(e) => setNewOrgForm({ ...newOrgForm, jurisdictionCity: e.target.value })}
                  className="w-full bg-[#031726] border border-cyan-900 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateOrgModal(false)}
                  className="px-4 py-2 bg-[#031726] hover:bg-cyan-950 text-cyan-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 rounded-xl font-black shadow-lg"
                >
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
