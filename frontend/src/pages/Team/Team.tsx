import { Users, Shield, Plus, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_TEAM = [
  { id: 1, name: 'Mohit Shukla', role: 'Admin', status: 'Online', assigned: 12, resolved: 145 },
  { id: 2, name: 'Sarah Connor', role: 'Support Agent', status: 'Online', assigned: 4, resolved: 89 },
  { id: 3, name: 'John Doe', role: 'Sales Rep', status: 'Away', assigned: 8, resolved: 230 },
];

export function Team() {
  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <Users className="w-8 h-8 text-brand-primary mr-3" />
            Team & SLA
          </h1>
          <p className="text-secondary mt-1">Manage team members, roles, and Service Level Agreements.</p>
        </div>
        <button className="flex items-center space-x-2 bg-brand-primary text-white px-4 py-2 rounded-md shadow-raised hover:opacity-90 transition-opacity font-medium text-sm">
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
              <select className="w-full bg-base border border-border rounded-md p-2 text-sm focus:outline-none focus:border-brand-primary">
                <option>Within 15 minutes</option>
                <option>Within 1 hour</option>
                <option>Within 24 hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Resolution Time (Target)</label>
              <select className="w-full bg-base border border-border rounded-md p-2 text-sm focus:outline-none focus:border-brand-primary">
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
              <label className="flex items-center space-x-2 text-sm text-secondary">
                <input type="checkbox" className="rounded text-brand-primary focus:ring-brand-primary border-border bg-base" />
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
            {MOCK_TEAM.map((member) => (
              <tr key={member.id} className="border-b border-border hover:bg-sunken/50 transition-colors">
                <td className="px-6 py-4 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <span className="font-medium text-primary">{member.name}</span>
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
                  <button className="text-brand-primary font-medium hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
