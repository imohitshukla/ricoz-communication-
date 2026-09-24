import { useState, useEffect } from 'react';
import { Users, Shield, Plus, Clock, X, Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  assigned: number;
  resolved: number;
};

export function Team() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('Agent');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // SLA State
  const [firstResponse, setFirstResponse] = useState('Within 15 minutes');
  const [resolutionTarget, setResolutionTarget] = useState('Within 2 hours');
  const [workingHours, setWorkingHours] = useState('Monday - Friday, 9:00 AM - 6:00 PM');
  const [routeToAI, setRouteToAI] = useState(true);

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

      setTeam(prev => [...prev, res.user]);
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteName('');
      setFeedbackMsg('Team member invited successfully!');
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to invite team member');
    } finally {
      setIsSubmitting(false);
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
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      await api.delete(`/api/team/members/${id}`);
      setTeam(prev => prev.filter(m => m.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to remove member');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col relative">
      {feedbackMsg && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg flex items-center space-x-2 text-sm shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <Users className="w-8 h-8 text-brand-primary mr-3" />
            Team & SLA
          </h1>
          <p className="text-secondary mt-1">Manage team members, roles, and Service Level Agreements.</p>
        </div>
        <button 
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center space-x-2 bg-brand-primary text-white px-4 py-2 rounded-md shadow-raised hover:opacity-90 transition-opacity font-medium text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 shrink-0">
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-brand-primary" />
            SLA Configuration
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">First Response Time (Target)</label>
              <select 
                value={firstResponse}
                onChange={(e) => {
                  setFirstResponse(e.target.value);
                  handleSaveSLA(e.target.value, resolutionTarget);
                }}
                className="w-full bg-base border border-border rounded-md p-2 text-sm focus:outline-none focus:border-brand-primary"
              >
                <option>Within 15 minutes</option>
                <option>Within 1 hour</option>
                <option>Within 24 hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Resolution Time (Target)</label>
              <select 
                value={resolutionTarget}
                onChange={(e) => {
                  setResolutionTarget(e.target.value);
                  handleSaveSLA(firstResponse, e.target.value);
                }}
                className="w-full bg-base border border-border rounded-md p-2 text-sm focus:outline-none focus:border-brand-primary"
              >
                <option>Within 2 hours</option>
                <option>Within 24 hours</option>
                <option>Within 48 hours</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-brand-accent" />
            Working Hours
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Monday - Friday</span>
              <span className="text-sm text-secondary">09:00 AM - 06:00 PM</span>
            </div>
            <div className="flex items-center justify-between opacity-50">
              <span className="text-sm font-medium">Saturday - Sunday</span>
              <span className="text-sm">Closed</span>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <label className="flex items-center space-x-2 text-sm text-secondary cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={routeToAI}
                  onChange={(e) => setRouteToAI(e.target.checked)}
                  className="rounded text-brand-primary focus:ring-brand-primary border-border bg-base" 
                />
                <span>Route to AI Agent outside working hours</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-surface border border-border rounded-xl shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-secondary uppercase bg-sunken border-b border-border sticky top-0">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Active Chats</th>
              <th className="px-6 py-4 font-medium">Resolved (All time)</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-secondary">Loading team members...</td>
              </tr>
            ) : team.map((member) => (
              <tr key={member.id} className="border-b border-border hover:bg-sunken/50 transition-colors">
                <td className="px-6 py-4 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-primary">{member.name}</div>
                    <div className="text-xs text-secondary">{member.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-secondary">{member.role}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium flex items-center inline-flex",
                    member.status === 'Online' ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", member.status === 'Online' ? 'bg-success animate-pulse' : 'bg-warning')} />
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">{member.assigned}</td>
                <td className="px-6 py-4">{member.resolved}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Invite New Team Member</h3>
              <button onClick={() => setIsInviteOpen(false)} className="text-secondary hover:text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Alex Smith"
                  className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Role & Permissions</label>
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                >
                  <option value="Agent">Agent (Can chat and handle assigned tickets)</option>
                  <option value="Admin">Admin (Full access to all settings and billing)</option>
                  <option value="Viewer">Viewer (Read-only analytics and history)</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <button 
                  type="button" 
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 border border-border rounded-md text-sm font-medium text-secondary hover:bg-sunken"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

