import { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Plus, 
  Clock, 
  X, 
  Trash2, 
  CheckCircle2, 
  Key, 
  Search, 
  Copy, 
  Check, 
  Building2, 
  RefreshCw, 
  MessageSquare, 
  ChevronRight, 
  UserCheck, 
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  assigned: number;
  resolved: number;
  createdAt?: string;
};

export function Team() {
  const { user } = useAuth();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'Admin' | 'Agent' | 'Viewer'>('ALL');

  // Modals
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('Agent');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Credentials Reveal Modal
  const [revealedCreds, setRevealedCreds] = useState<{ email: string; pass: string; name: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // SLA State
  const [firstResponse, setFirstResponse] = useState('Within 15 minutes');
  const [resolutionTarget, setResolutionTarget] = useState('Within 2 hours');
  const [workingHours, setWorkingHours] = useState('Monday - Friday, 9:00 AM - 6:00 PM');
  const [routeToAI, setRouteToAI] = useState(true);

  // Role Matrix Drawer
  const [showMatrix, setShowMatrix] = useState(false);

  // Feedback Toast
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const currentUserRole = user?.role || 'Admin';
  const isAdmin = currentUserRole.toLowerCase() === 'admin' || currentUserRole.toLowerCase() === 'owner';

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setIsLoading(true);
      const [membersData, slaData] = await Promise.all([
        api.get('/api/team/members'),
        api.get('/api/team/sla')
      ]);

      if (Array.isArray(membersData)) {
        setTeam(membersData);
      }
      if (slaData) {
        setFirstResponse(slaData.firstResponseTarget || 'Within 15 minutes');
        setResolutionTarget(slaData.resolutionTarget || 'Within 2 hours');
        setWorkingHours(slaData.workingHours || 'Monday - Friday, 9:00 AM - 6:00 PM');
      }
    } catch (err) {
      console.error('Failed to load team data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setIsSubmitting(true);
    try {
      const res = await api.post('/api/team/invite', {
        email: inviteEmail,
        name: inviteName,
        role: inviteRole
      });

      if (res.user) {
        setTeam(prev => [...prev, res.user]);
      } else {
        await fetchTeamData();
      }

      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteName('');
      
      if (res.tempPassword) {
        setRevealedCreds({
          name: res.user?.name || inviteName || 'Team Member',
          email: res.user?.email || inviteEmail,
          pass: res.tempPassword
        });
      }

      setFeedbackMsg(res.message || 'Team member added successfully!');
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to invite team member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await api.put(`/api/team/members/${memberId}/role`, { role: newRole });
      setTeam(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
      setFeedbackMsg(`Role updated to ${newRole}`);
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update role');
    }
  };

  const handleResetPassword = async (member: TeamMember) => {
    if (!confirm(`Generate a new temporary password for ${member.name} (${member.email})?`)) return;
    try {
      const res = await api.post(`/api/team/members/${member.id}/reset-password`);
      if (res.tempPassword) {
        setRevealedCreds({
          name: member.name,
          email: member.email,
          pass: res.tempPassword
        });
      }
      setFeedbackMsg('New password generated successfully!');
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reset password');
    }
  };

  const handleSaveSLA = async (newResponse?: string, newResolution?: string) => {
    try {
      await api.put('/api/team/sla', {
        firstResponseTarget: newResponse || firstResponse,
        resolutionTarget: newResolution || resolutionTarget,
        workingHours
      });
      setFeedbackMsg('SLA configuration updated!');
      setTimeout(() => setFeedbackMsg(''), 2500);
    } catch (err) {
      console.error('Failed to update SLA:', err);
    }
  };

  const handleRemoveMember = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member? This action will revoke their login access.')) return;
    try {
      await api.delete(`/api/team/members/${id}`);
      setTeam(prev => prev.filter(m => m.id !== id));
      setFeedbackMsg('Team member removed.');
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to remove member');
    }
  };

  const filteredTeam = team.filter(m => {
    const matchesSearch = 
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || m.role?.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const onlineCount = team.filter(m => m.status === 'Online').length;
  const totalAssigned = team.reduce((acc, curr) => acc + (curr.assigned || 0), 0);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-screen flex flex-col space-y-6">
      
      {/* Toast Alert */}
      {feedbackMsg && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl flex items-center justify-between shadow-lg shadow-emerald-500/10 animate-slide-up">
          <div className="flex items-center space-x-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg('')} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/10">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight">Team & Access Control</h1>
            <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              {currentUserRole} PORTAL
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Manage agent seats, role-based access permissions, instant onboarding credentials, and omnichannel SLA targets.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowMatrix(!showMatrix)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>RBAC Matrix</span>
          </button>

          {isAdmin && (
            <Link
              to="/dashboard/organization"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
            >
              <Building2 className="w-4 h-4 text-teal-400" />
              <span>Org & HR Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          )}

          {isAdmin && (
            <button
              onClick={() => setIsInviteOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Seats</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{team.length}</div>
          <div className="text-[10px] text-emerald-400/90 font-medium mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Active Workspace Accounts
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Live Agents</span>
            <UserCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-teal-400">{onlineCount}</div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            Available on Omnichannel Inboxes
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Target SLA</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-black text-white truncate">{firstResponse}</div>
          <div className="text-[10px] text-amber-400 font-medium mt-1">
            First response threshold
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Queues</span>
            <MessageSquare className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalAssigned}</div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            Conversations currently handled
          </div>
        </div>
      </div>

      {/* Permissions Matrix Drawer (Conditional Expand) */}
      {showMatrix && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-black text-white">Role-Based Access Control (RBAC) Matrix</h3>
            </div>
            <button onClick={() => setShowMatrix(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold">
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Team & Member Mgmt</th>
                  <th className="py-2.5 px-3">Omnichannel Inboxes</th>
                  <th className="py-2.5 px-3">Voice / Cold Caller</th>
                  <th className="py-2.5 px-3">API Hub & Webhooks</th>
                  <th className="py-2.5 px-3">Billing & Subscriptions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                <tr>
                  <td className="py-2.5 px-3 font-bold text-purple-400">Owner</td>
                  <td className="py-2.5 px-3 text-emerald-400">Full Access</td>
                  <td className="py-2.5 px-3 text-emerald-400">Full Access</td>
                  <td className="py-2.5 px-3 text-emerald-400">Full Access</td>
                  <td className="py-2.5 px-3 text-emerald-400">Full Access</td>
                  <td className="py-2.5 px-3 text-emerald-400">Full Access</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">Admin</td>
                  <td className="py-2.5 px-3 text-emerald-400">Invite, Edit, Reset</td>
                  <td className="py-2.5 px-3 text-emerald-400">Full Access</td>
                  <td className="py-2.5 px-3 text-emerald-400">Full Access</td>
                  <td className="py-2.5 px-3 text-emerald-400">Manage Keys</td>
                  <td className="py-2.5 px-3 text-slate-500">View Only</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-sky-400">Agent</td>
                  <td className="py-2.5 px-3 text-slate-500">Directory View</td>
                  <td className="py-2.5 px-3 text-emerald-400">Assigned Chats</td>
                  <td className="py-2.5 px-3 text-emerald-400">Agent Dialer</td>
                  <td className="py-2.5 px-3 text-rose-500">Restricted</td>
                  <td className="py-2.5 px-3 text-rose-500">Restricted</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-400">Viewer</td>
                  <td className="py-2.5 px-3 text-slate-500">Directory View</td>
                  <td className="py-2.5 px-3 text-slate-400">Read-Only Logs</td>
                  <td className="py-2.5 px-3 text-slate-400">Read-Only Logs</td>
                  <td className="py-2.5 px-3 text-rose-500">Restricted</td>
                  <td className="py-2.5 px-3 text-rose-500">Restricted</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Left Column: Team Directory (2 cols) */}
        <div className="lg:col-span-2 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/40">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team member by name or email..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(['ALL', 'Admin', 'Agent', 'Viewer'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    roleFilter === role
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                  }`}
                >
                  {role}
                </button>
              ))}
              
              <button
                onClick={fetchTeamData}
                title="Refresh team roster"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin text-emerald-400")} />
              </button>
            </div>
          </div>

          {/* Members Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-slate-400 uppercase font-extrabold bg-slate-950/70 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Live Status</th>
                  <th className="py-3 px-4">Workload</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Loading team roster...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTeam.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400">
                      <p className="text-sm font-semibold text-slate-300">No members found</p>
                      <p className="text-xs text-slate-500 mt-1">Try clearing your search query or filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredTeam.map((member) => {
                    const isSelf = user?.id === member.id;
                    const memberInitials = member.name
                      ?.split(' ')
                      .map(n => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase() || 'M';

                    return (
                      <tr key={member.id} className="hover:bg-slate-800/40 transition-colors">
                        
                        {/* Member Identity */}
                        <td className="py-3.5 px-4 flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-inner">
                            {memberInitials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white flex items-center gap-1.5 truncate">
                              <span>{member.name}</span>
                              {isSelf && (
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.2 rounded border border-emerald-500/30">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">{member.email}</div>
                          </div>
                        </td>

                        {/* Role Selector */}
                        <td className="py-3.5 px-4">
                          {isAdmin && !isSelf ? (
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.id, e.target.value)}
                              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer font-semibold"
                            >
                              <option value="Admin">Admin</option>
                              <option value="Agent">Agent</option>
                              <option value="Viewer">Viewer</option>
                            </select>
                          ) : (
                            <span className={cn(
                              "px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase border",
                              member.role === 'Owner' && "bg-purple-500/15 text-purple-300 border-purple-500/30",
                              member.role === 'Admin' && "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
                              member.role === 'Agent' && "bg-sky-500/15 text-sky-300 border-sky-500/30",
                              member.role === 'Viewer' && "bg-slate-800 text-slate-300 border-slate-700"
                            )}>
                              {member.role}
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border",
                            member.status === 'Online'
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          )}>
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              member.status === 'Online' ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                            )} />
                            {member.status}
                          </span>
                        </td>

                        {/* Workload */}
                        <td className="py-3.5 px-4">
                          <div className="text-slate-200 font-bold">{member.assigned} active</div>
                          <div className="text-[10px] text-slate-400">{member.resolved} resolved</div>
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isAdmin && (
                              <button
                                onClick={() => handleResetPassword(member)}
                                title="Reset & generate temporary password"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-400 border border-slate-700 transition-colors cursor-pointer"
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {isAdmin && !isSelf && (
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                title="Remove team member"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 border border-slate-700 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Showing {filteredTeam.length} of {team.length} workspace members</span>
            <span className="font-mono text-emerald-400">SOC2 Type II Protected</span>
          </div>
        </div>

        {/* Right Column: SLA Policies & Quick Links (1 col) */}
        <div className="space-y-6">
          
          {/* SLA Settings Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-black text-white">SLA Response Standards</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">First Response Target</label>
                <select
                  disabled={!isAdmin}
                  value={firstResponse}
                  onChange={(e) => {
                    setFirstResponse(e.target.value);
                    handleSaveSLA(e.target.value, resolutionTarget);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold disabled:opacity-60"
                >
                  <option>Within 5 minutes</option>
                  <option>Within 15 minutes</option>
                  <option>Within 30 minutes</option>
                  <option>Within 1 hour</option>
                  <option>Within 24 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Resolution Target</label>
                <select
                  disabled={!isAdmin}
                  value={resolutionTarget}
                  onChange={(e) => {
                    setResolutionTarget(e.target.value);
                    handleSaveSLA(firstResponse, e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold disabled:opacity-60"
                >
                  <option>Within 1 hour</option>
                  <option>Within 2 hours</option>
                  <option>Within 4 hours</option>
                  <option>Within 24 hours</option>
                  <option>Within 48 hours</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-slate-300 font-medium mb-1">
                  <span>Shift Schedule:</span>
                  <span className="font-bold text-white">09:00 AM - 06:00 PM</span>
                </div>
                <div className="text-[10px] text-slate-500">Mon - Fri (Active Business Days)</div>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={routeToAI}
                    onChange={(e) => setRouteToAI(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-slate-300 text-xs font-semibold">
                    Auto-route to AI Agent outside working hours
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Quick Jump to Org & HR Admin Card */}
          {isAdmin && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-black text-white">Enterprise HR & Matrix</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Need department structures, shift timings, 2FA governance, or SOC2 security audit trail exports?
              </p>
              <Link
                to="/dashboard/organization"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-black border border-emerald-500/30 transition-all shadow-md group-hover:border-emerald-500/60"
              >
                <span>Open Org & HR Admin Panel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

        </div>

      </div>

      {/* MODAL 1: Invite New Member */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up relative">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">Onboard Team Member</h3>
                  <p className="text-[11px] text-slate-400">Generate immediate access credentials</p>
                </div>
              </div>
              <button onClick={() => setIsInviteOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="john@yourdomain.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value="Agent">Agent (Assigned chats, WhatsApp, Voice dialer)</option>
                  <option value="Admin">Admin (Full workspace access, team & channels)</option>
                  <option value="Viewer">Viewer (Read-only analytics and history)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400">
                <span className="font-bold text-emerald-400">Auto-Provisioning:</span> A temporary login password will be generated immediately so your team member can log in without email delays.
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Onboarding...' : 'Create & Reveal Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Revealed Credentials (Instant Onboarding / Reset) */}
      {revealedCreds && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10">
              <Key className="w-6 h-6" />
            </div>

            <h3 className="text-center font-black text-lg text-white">Login Credentials Ready</h3>
            <p className="text-center text-xs text-slate-400 mt-1 mb-5">
              Copy and share these credentials with <span className="text-emerald-400 font-bold">{revealedCreds.name}</span>.
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Login Email</span>
                <span className="text-xs font-mono font-bold text-slate-200">{revealedCreds.email}</span>
              </div>
              <div className="border-t border-slate-800/80 pt-2.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Temporary Password</span>
                <span className="text-xs font-mono font-extrabold text-emerald-400 tracking-wide">{revealedCreds.pass}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Ricoz Login Credentials:\nEmail: ${revealedCreds.email}\nPassword: ${revealedCreds.pass}\nURL: ${window.location.origin}/login`
                  );
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2500);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey ? 'Credentials Copied!' : 'Copy Credentials'}</span>
              </button>

              <button
                onClick={() => setRevealedCreds(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
