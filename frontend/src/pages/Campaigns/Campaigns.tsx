import { useState } from 'react';
import { Search, Plus, Filter, Play, Pause, BarChart2, MessageSquare, AlertCircle, X } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export function Campaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendCampaign = async () => {
    if (!campaignName || !messageText) return;
    setIsSending(true);
    try {
      const res = await api.post('/api/campaigns/send', {
        name: campaignName,
        message: messageText,
        recipients: ['all'] 
      });
      console.log('Campaign started:', res.data);

      // Add to local state
      setCampaigns(prev => [{
        id: Math.random().toString(),
        name: campaignName,
        type: 'Broadcast',
        status: 'Completed',
        sent: res.data.sentCount,
        read: 0,
        replied: 0,
        conversion: '0%'
      }, ...prev]);

      setIsModalOpen(false);
      setCampaignName('');
      setMessageText('');
    } catch (err) {
      console.error('Error sending campaign:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold">Campaigns</h1>
          <p className="text-secondary mt-1">Manage marketing broadcasts and automated journeys.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-brand-primary text-white px-4 py-2 rounded-md shadow-raised hover:opacity-90 transition-opacity font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 shrink-0">
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-secondary text-sm font-medium">Total Messages Sent</h3>
          <div className="mt-2 text-3xl font-semibold">{campaigns.reduce((acc, c) => acc + c.sent, 0).toLocaleString()}</div>
        </div>
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-secondary text-sm font-medium">Avg. Read Rate</h3>
          <div className="mt-2 text-3xl font-semibold text-brand-primary">0%</div>
        </div>
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-secondary text-sm font-medium">Avg. Reply Rate</h3>
          <div className="mt-2 text-3xl font-semibold">0%</div>
        </div>
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-brand-accent/10 text-brand-accent">Attention</span>
          </div>
          <h3 className="text-secondary text-sm font-medium">Template Rejections</h3>
          <div className="mt-2 text-3xl font-semibold text-danger">0</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center space-x-4 w-full max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-secondary" />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              className="w-full bg-surface border border-border rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-brand-primary/50 transition-colors shadow-sm"
            />
          </div>
          <button className="flex items-center space-x-2 bg-surface border border-border px-4 py-2 rounded-md hover:bg-sunken transition-colors text-sm text-primary shadow-sm">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-surface border border-border rounded-xl shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-secondary uppercase bg-sunken border-b border-border sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 font-medium">Campaign Name</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Sent</th>
              <th className="px-6 py-4 font-medium">Read</th>
              <th className="px-6 py-4 font-medium">Replied</th>
              <th className="px-6 py-4 font-medium">Conversion</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-secondary">
                  No campaigns yet. Create your first campaign to get started.
                </td>
              </tr>
            ) : (
              campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-border hover:bg-sunken/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-primary mb-1">{campaign.name}</div>
                    <div className="text-xs text-secondary flex items-center">
                      <MessageSquare className="w-3 h-3 mr-1" /> {campaign.type}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium flex items-center inline-flex",
                      campaign.status === 'Active' ? "bg-success/10 text-success" : 
                      campaign.status === 'Completed' ? "bg-brand-primary/10 text-brand-primary" : 
                      "bg-secondary/10 text-secondary"
                    )}>
                      {campaign.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5 animate-pulse"></span>}
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">{campaign.sent.toLocaleString()}</td>
                  <td className="px-6 py-4 text-brand-primary font-medium">{campaign.read.toLocaleString()}</td>
                  <td className="px-6 py-4 text-success font-medium">{campaign.replied.toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium">{campaign.conversion}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button className="p-1.5 text-brand-primary hover:bg-brand-primary/10 rounded transition-colors" title="View Analytics">
                        <BarChart2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-border">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-xl font-semibold">New Campaign</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-secondary hover:text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Campaign Name</label>
                <input 
                  type="text" 
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full bg-sunken border border-border rounded-md px-4 py-2 text-sm focus:outline-none focus:border-brand-primary/50"
                  placeholder="e.g. Black Friday Sale"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Audience</label>
                <select className="w-full bg-sunken border border-border rounded-md px-4 py-2 text-sm focus:outline-none focus:border-brand-primary/50">
                  <option value="all">All Contacts</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message Content</label>
                <textarea 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={4}
                  className="w-full bg-sunken border border-border rounded-md px-4 py-2 text-sm focus:outline-none focus:border-brand-primary/50 resize-none"
                  placeholder="Type your broadcast message here..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-border bg-sunken flex justify-end space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-md font-medium text-sm text-secondary hover:bg-surface border border-transparent hover:border-border transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendCampaign}
                disabled={isSending || !campaignName || !messageText}
                className="px-6 py-2 bg-brand-primary text-white rounded-md font-bold text-sm shadow-raised hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSending ? 'Sending...' : 'Send Broadcast'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
