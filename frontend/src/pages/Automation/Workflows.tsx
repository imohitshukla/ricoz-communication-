import { useState } from 'react';
import { 
  GitBranch, Play, Pause, Plus, ArrowRight, Zap, CheckCircle2, 
  Trash2, Clock, MessageSquare, Mail, Phone, ShieldCheck, 
  Sliders, ArrowUpRight, Sparkles, X, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WorkflowStep {
  id: string;
  channel: 'whatsapp' | 'email' | 'voice' | 'delay';
  action: string;
  detail: string;
}

interface Workflow {
  id: number;
  name: string;
  trigger: string;
  steps: WorkflowStep[];
  status: 'active' | 'paused';
  runs: number;
  conversionRate: string;
}

const INITIAL_WORKFLOWS: Workflow[] = [
  { 
    id: 1, 
    name: 'Lead Qualification & Omnichannel Nurture', 
    trigger: 'New Contact Added', 
    steps: [
      { id: 's1', channel: 'whatsapp', action: 'Send WhatsApp Welcome', detail: 'Template: welcome_lead_v1' },
      { id: 's2', channel: 'delay', action: 'Wait 3 Hours', detail: 'If no reply after initial ping' },
      { id: 's3', channel: 'email', action: 'Send Product Catalog Email', detail: 'Template: Product Launch Blast' },
      { id: 's4', channel: 'voice', action: 'Trigger AI Voice Call', detail: 'Rep: Assistant Alex (if lead score > 70)' }
    ], 
    status: 'active', 
    runs: 342,
    conversionRate: '28.4%'
  },
  { 
    id: 2, 
    name: 'Cart Abandonment Recovery Sprint', 
    trigger: 'Shopify: Cart Abandoned', 
    steps: [
      { id: 's1', channel: 'whatsapp', action: 'Send Dynamic Cart Reminder', detail: 'Include 10% coupon & product image' },
      { id: 's2', channel: 'delay', action: 'Wait 12 Hours', detail: 'Check if purchase completed' },
      { id: 's3', channel: 'email', action: 'Send Flash Sale Email Blast', detail: 'Template: Promo Discount Offer' }
    ], 
    status: 'active', 
    runs: 184,
    conversionRate: '34.2%'
  },
  { 
    id: 3, 
    name: 'Post-Purchase VIP Onboarding', 
    trigger: 'Payment Succeeded', 
    steps: [
      { id: 's1', channel: 'whatsapp', action: 'Send Order Confirmation & PDF', detail: 'Flow: Order tracker & invoice' },
      { id: 's2', channel: 'delay', action: 'Wait 2 Days', detail: 'Post delivery satisfaction check' },
      { id: 's3', channel: 'email', action: 'Request Review & Referral', detail: 'Template: Newsletter Monthly Digest' }
    ], 
    status: 'active', 
    runs: 92,
    conversionRate: '41.0%'
  },
];

export function Workflows() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>(INITIAL_WORKFLOWS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTrigger, setNewTrigger] = useState('New Contact Added');
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'email' | 'voice' | 'delay'>('whatsapp');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggle = (id: number) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id === id) {
        const next = w.status === 'active' ? 'paused' : 'active';
        showToast(`Workflow "${w.name}" set to ${next}`);
        return { ...w, status: next };
      }
      return w;
    }));
  };

  const handleDelete = (id: number) => {
    setWorkflows(prev => prev.filter(w => w.id !== id));
    showToast('Workflow deleted');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newWf: Workflow = {
      id: Date.now(),
      name: newTitle.trim(),
      trigger: newTrigger,
      steps: [
        { id: '1', channel: selectedChannel, action: `Initial ${selectedChannel.toUpperCase()} Action`, detail: 'Automated step' },
        { id: '2', channel: 'delay', action: 'Wait 1 Day', detail: 'Cooldown buffer' },
        { id: '3', channel: 'email', action: 'Omnichannel Follow-up', detail: 'Template broadcast' }
      ],
      status: 'active',
      runs: 0,
      conversionRate: '0.0%'
    };

    setWorkflows([newWf, ...workflows]);
    setIsModalOpen(false);
    setNewTitle('');
    showToast(`Workflow "${newWf.name}" launched successfully!`);
  };

  const getChannelIcon = (ch: WorkflowStep['channel']) => {
    switch (ch) {
      case 'whatsapp': return <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />;
      case 'email': return <Mail className="w-3.5 h-3.5 text-purple-500" />;
      case 'voice': return <Phone className="w-3.5 h-3.5 text-rose-500" />;
      case 'delay': return <Clock className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-sm border border-slate-700 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Automation Journeys</h1>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-extrabold px-2 py-0.5 rounded-full uppercase">
                Enterprise
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Multi-step omnichannel automation triggers combining WhatsApp, Email, RCS, and AI Voice dialers.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/dashboard/flow-builder')}
              className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-sm transition-all"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Canvas Flow Builder</span>
            </button>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-[#00a688] to-emerald-600 hover:from-[#008f75] hover:to-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>New Journey</span>
            </button>
          </div>
        </div>

        {/* Workflow Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Automated Journeys</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {workflows.filter(w => w.status === 'active').length} <span className="text-xs font-normal text-slate-400">/ {workflows.length} total</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Journey Executions</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              {workflows.reduce((acc, w) => acc + w.runs, 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Lead Conversion</span>
            <div className="text-2xl font-extrabold text-indigo-600 mt-1">
              34.5%
            </div>
          </div>
        </div>

        {/* Workflow Cards */}
        <div className="space-y-4">
          {workflows.map(wf => (
            <div 
              key={wf.id} 
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-start space-x-3.5">
                  <div className="w-11 h-11 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <GitBranch className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-slate-900 text-base">{wf.name}</h3>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        wf.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {wf.status === 'active' ? '● Active' : '⏸ Paused'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>Trigger: <strong className="text-slate-700 font-semibold">{wf.trigger}</strong></span>
                      <span>•</span>
                      <span>Steps: <strong className="text-slate-700 font-semibold">{wf.steps.length} sequential actions</strong></span>
                      <span>•</span>
                      <span>Executed: <strong className="text-emerald-700 font-semibold">{wf.runs} contacts</strong></span>
                      <span>•</span>
                      <span>Conversion: <strong className="text-indigo-700 font-semibold">{wf.conversionRate}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end lg:self-center">
                  <button 
                    onClick={() => handleToggle(wf.id)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 border border-slate-200"
                    title={wf.status === 'active' ? 'Pause journey' : 'Activate journey'}
                  >
                    {wf.status === 'active' ? <Pause className="w-4 h-4 text-amber-600" /> : <Play className="w-4 h-4 text-emerald-600" />}
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard/flow-builder')}
                    className="flex items-center space-x-1 bg-emerald-50 hover:bg-emerald-100 text-[#00a688] font-bold text-xs px-3.5 py-2 rounded-xl transition-colors"
                  >
                    <span>Edit Canvas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(wf.id)}
                    className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Step Sequence Timeline */}
              <div className="mt-4 pt-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Execution Pathway:
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {wf.steps.map((st, idx) => (
                    <div key={st.id} className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs">
                        {getChannelIcon(st.channel)}
                        <span className="font-semibold text-slate-700">{st.action}</span>
                      </div>
                      {idx < wf.steps.length - 1 && (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Visual Builder Pro Card */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-7 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-amber-400 text-lg">⚡</span>
              <h3 className="font-extrabold text-lg text-white">Full Visual Drag-and-Drop Node Canvas</h3>
            </div>
            <p className="text-slate-300 text-sm max-w-xl">
              Construct complex decision branching, condition filters, tag segmentation, and automated retries across WhatsApp, SMS, RCS, Voice, and Email in our node canvas.
            </p>
          </div>
          <button 
            onClick={() => navigate('/dashboard/flow-builder')}
            className="whitespace-nowrap bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:scale-105 flex items-center space-x-2"
          >
            <span>Open Canvas Studio</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-extrabold text-slate-900">Create New Journey</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Journey Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Inbound Webinar Nurture Flow"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Trigger Event</label>
                <select 
                  value={newTrigger}
                  onChange={e => setNewTrigger(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="New Contact Added">New Contact Added</option>
                  <option value="WhatsApp Inbound Keyword">WhatsApp Inbound Keyword</option>
                  <option value="Shopify: Cart Abandoned">Shopify: Cart Abandoned</option>
                  <option value="Form Submission Received">Form Submission Received</option>
                  <option value="Payment Succeeded">Payment Succeeded</option>
                  <option value="API Webhook Trigger">API Webhook Trigger</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">First Step Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('whatsapp')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 ${
                      selectedChannel === 'whatsapp' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('email')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 ${
                      selectedChannel === 'email' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Mail className="w-4 h-4 text-purple-500" />
                    <span>Email Blast</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('voice')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 ${
                      selectedChannel === 'voice' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Phone className="w-4 h-4 text-rose-500" />
                    <span>AI Voice</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Create & Launch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
