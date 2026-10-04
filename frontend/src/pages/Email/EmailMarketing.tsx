import { useState, useEffect, useRef } from 'react';
import {
  Mail, Plus, Send, Users, BarChart2, Eye, MousePointer, TrendingUp,
  CheckCircle2, X, Trash2, RefreshCw, Upload, Download, Search,
  FileText, Palette, Play, PauseCircle, Edit2, Clock, AlertCircle,
  ChevronRight, Filter, Tag, Inbox, Zap, Globe, ArrowUpRight
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { io } from 'socket.io-client';
import { API_URL } from '@/lib/api';

// ── HTML Email Templates preset library ──────────────────────────────────────
const TEMPLATE_PRESETS = [
  {
    name: 'Product Launch Blast',
    category: 'Marketing',
    subject: 'Introducing {{product_name}} — Exclusively for {{name}} 🚀',
    previewText: "You're one of the first to hear this.",
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>body{margin:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif}*{box-sizing:border-box}.wrap{max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.09)}.hero{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:56px 40px;text-align:center}.hero h1{margin:0;color:#fff;font-size:32px;font-weight:800;letter-spacing:-.5px}.hero p{color:rgba(255,255,255,.85);margin:12px 0 0;font-size:16px}.body{padding:40px}.body p{color:#374151;line-height:1.8;font-size:15px}.btn{display:inline-block;margin:24px 0;padding:16px 40px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff!important;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;letter-spacing:.2px}.features{display:flex;gap:16px;margin:24px 0;flex-wrap:wrap}.feature{flex:1;min-width:140px;background:#f8fafc;border-radius:10px;padding:16px;border:1px solid #e2e8f0}.feature-icon{font-size:24px;margin-bottom:8px}.feature h3{margin:0;color:#1e293b;font-size:14px;font-weight:700}.feature p{margin:4px 0 0;color:#64748b;font-size:12px}.footer{background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center}.footer p{color:#94a3b8;font-size:12px;margin:4px 0}.footer a{color:#6366f1;text-decoration:none}</style></head><body><div class="wrap"><div class="hero"><h1>🚀 Introducing [Product Name]</h1><p>Built for teams who demand the best.</p></div><div class="body"><p>Hi <strong>{{name}}</strong>,</p><p>We've been working on something special, and today we're finally ready to share it with you. [Product Name] is a breakthrough solution designed to help you [key benefit].</p><div class="features"><div class="feature"><div class="feature-icon">⚡</div><h3>Lightning Fast</h3><p>Deploy in minutes, not days.</p></div><div class="feature"><div class="feature-icon">🛡️</div><h3>Enterprise Grade</h3><p>Bank-level security built-in.</p></div><div class="feature"><div class="feature-icon">🤖</div><h3>AI Powered</h3><p>Smart automation at scale.</p></div></div><p>As a valued member of our community, you get <strong>exclusive early access</strong> at a special price. This offer is valid for 48 hours only.</p><center><a href="#" class="btn">Claim Your Early Access →</a></center></div><div class="footer"><p>© 2024 Ricoz Communication · <a href="{{unsubscribe_url}}">Unsubscribe</a></p></div></div></body></html>`
  },
  {
    name: 'Newsletter Monthly Digest',
    category: 'Newsletter',
    subject: '{{name}}, Your Monthly Ricoz Digest is Here 📧',
    previewText: 'Top stories, tips & product updates just for you.',
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>body{margin:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif}*{box-sizing:border-box}.wrap{max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}.header{background:#0f172a;padding:28px 40px;display:flex;align-items:center;justify-content:space-between}.header .logo{color:#fff;font-weight:800;font-size:20px}.header .date{color:#64748b;font-size:12px}.hero{background:linear-gradient(135deg,#0ea5e9,#38bdf8);padding:48px 40px;text-align:center}.hero h1{color:#fff;margin:0;font-size:28px;font-weight:800}.hero p{color:rgba(255,255,255,.9);margin:10px 0 0;font-size:15px}.body{padding:40px}.section-title{font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#0ea5e9;font-weight:700;margin:32px 0 12px}.article{border-bottom:1px solid #f1f5f9;padding:20px 0}.article h3{margin:0;color:#1e293b;font-size:16px;font-weight:700}.article p{margin:8px 0;color:#64748b;font-size:14px;line-height:1.6}.article a{color:#0ea5e9;font-size:13px;font-weight:600;text-decoration:none}.cta-box{background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:12px;padding:32px;text-align:center;margin:32px 0}.cta-box h2{color:#fff;margin:0;font-size:20px;font-weight:700}.cta-box p{color:#94a3b8;font-size:14px;margin:8px 0 20px}.cta-box a{display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#0ea5e9,#38bdf8);color:#fff!important;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px}.footer{background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center}.footer p{color:#94a3b8;font-size:12px;margin:4px 0}.footer a{color:#0ea5e9;text-decoration:none}</style></head><body><div class="wrap"><div class="header"><div class="logo">📧 Ricoz Digest</div><div class="date">${new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'})}</div></div><div class="hero"><h1>Your Monthly Update is Here</h1><p>Hi {{name}}, here's what happened this month.</p></div><div class="body"><div class="section-title">🔥 Top Stories</div><div class="article"><h3>WhatsApp Business API Now Supports AI Voice Calls</h3><p>Meta has announced a new integration that allows AI-powered voice calls directly within the WhatsApp ecosystem...</p><a href="#">Read more →</a></div><div class="article"><h3>RCS Surpasses 1 Billion Monthly Active Users</h3><p>Google's RCS protocol has hit a major milestone, with rich business messaging now available across 190+ countries...</p><a href="#">Read more →</a></div><div class="cta-box"><h2>Upgrade to Pro this Month</h2><p>Unlock unlimited broadcasts, AI agents, and advanced analytics.</p><a href="#">Get 30% Off →</a></div></div><div class="footer"><p>© 2024 Ricoz Communication · <a href="{{unsubscribe_url}}">Unsubscribe</a> · <a href="#">View in browser</a></p></div></div></body></html>`
  },
  {
    name: 'Promo Discount Offer',
    category: 'Promotional',
    subject: '🔥 {{name}}, Your Exclusive 40% Off Expires Tonight',
    previewText: 'Your limited-time discount is waiting inside.',
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>body{margin:0;background:#fff7ed;font-family:'Segoe UI',Arial,sans-serif}*{box-sizing:border-box}.wrap{max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.09)}.hero{background:linear-gradient(135deg,#f97316 0%,#ef4444 100%);padding:56px 40px;text-align:center;position:relative}.hero::before{content:'🔥';position:absolute;top:16px;left:50%;transform:translateX(-50%);font-size:40px}.hero h1{margin:48px 0 0;color:#fff;font-size:36px;font-weight:900;letter-spacing:-1px}.hero .discount{background:#fff;color:#ef4444;font-size:48px;font-weight:900;border-radius:12px;padding:8px 24px;display:inline-block;margin:16px 0}.hero p{color:rgba(255,255,255,.9);font-size:15px;margin:8px 0 0}.body{padding:40px;text-align:center}.body p{color:#374151;line-height:1.8;font-size:16px;text-align:left}.countdown{display:flex;gap:8px;justify-content:center;margin:24px 0}.countdown .box{background:#fff7ed;border:2px solid #fed7aa;border-radius:10px;padding:12px 16px;text-align:center}.countdown .num{font-size:28px;font-weight:800;color:#ea580c}.countdown .label{font-size:10px;color:#9a3412;text-transform:uppercase;font-weight:600}.code-box{background:#fff7ed;border:2px dashed #fed7aa;border-radius:10px;padding:20px;margin:24px 0;text-align:center}.code-box p{margin:0;color:#92400e;font-size:13px;font-weight:600}.code-box .code{font-size:32px;font-weight:900;color:#ea580c;letter-spacing:4px}.btn{display:inline-block;padding:18px 48px;background:linear-gradient(135deg,#f97316,#ef4444);color:#fff!important;text-decoration:none;border-radius:10px;font-weight:800;font-size:16px;margin-top:8px}.footer{background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center}.footer p{color:#94a3b8;font-size:12px}.footer a{color:#f97316;text-decoration:none}</style></head><body><div class="wrap"><div class="hero"><h1>Special Offer</h1><div class="discount">40% OFF</div><p>Exclusive deal for {{name}} — expires tonight at midnight</p></div><div class="body"><p>Hi <strong>{{name}}</strong>,</p><p>We're giving you an exclusive 40% discount on all annual plans. This is the biggest sale we've run this year, and it's only available for the next 24 hours.</p><div class="countdown"><div class="box"><div class="num">23</div><div class="label">Hours</div></div><div class="box"><div class="num">59</div><div class="label">Mins</div></div><div class="box"><div class="num">59</div><div class="label">Secs</div></div></div><div class="code-box"><p>Use code at checkout:</p><div class="code">SAVE40</div></div><a href="#" class="btn">Claim My 40% Discount →</a></div><div class="footer"><p>© 2024 Ricoz Communication · <a href="{{unsubscribe_url}}">Unsubscribe</a></p></div></div></body></html>`
  }
];

type Tab = 'overview' | 'campaigns' | 'templates' | 'contacts';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  status: string;
  totalRecipients: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  sentAt?: string;
  createdAt: string;
  htmlBody?: string;
  audienceTag?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  status: string;
  previewText?: string;
  htmlBody: string;
  createdAt: string;
}

interface EmailContact {
  id: string;
  email: string;
  name?: string;
  status: string;
  source: string;
  tags?: string;
  createdAt: string;
}

interface EmailStats {
  totalSubscribers: number;
  totalCampaigns: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  avgOpenRate: number;
  avgClickRate: number;
}

export function EmailMarketing() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Data states
  const [stats, setStats] = useState<EmailStats>({
    totalSubscribers: 0, totalCampaigns: 0, totalDelivered: 0,
    totalOpened: 0, totalClicked: 0, totalBounced: 0,
    avgOpenRate: 0, avgClickRate: 0
  });
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [contacts, setContacts] = useState<EmailContact[]>([]);

  // Loading/action states
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Campaign modal
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    name: '', subject: '', fromName: 'Ricoz Communication',
    fromEmail: 'hello@ricoz.io', htmlBody: '', audienceTag: '', templateId: ''
  });
  const [campaignCreating, setCampaignCreating] = useState(false);

  // Template modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '', subject: '', category: 'Marketing', previewText: '', htmlBody: ''
  });
  const [templateSaving, setTemplateSaving] = useState(false);

  // Contact modal
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ email: '', name: '', tags: '' });
  const [contactSaving, setContactSaving] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  // Preview modal
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  // Test email
  const [testEmailFor, setTestEmailFor] = useState<string | null>(null);
  const [testEmailAddr, setTestEmailAddr] = useState('');

  // Search
  const [contactSearch, setContactSearch] = useState('');

  const socketRef = useRef<any>(null);

  useEffect(() => {
    loadAll();

    // Socket for real-time campaign updates
    socketRef.current = io(API_URL.replace('/api', ''));
    socketRef.current.on('email_campaign_sent', (data: any) => {
      setCampaigns(prev => prev.map(c =>
        c.id === data.campaignId
          ? { ...c, status: 'sent', delivered: data.delivered, opened: data.opened, clicked: data.clicked, bounced: data.bounced }
          : c
      ));
      setSendingId(null);
      setSuccessMsg(`Campaign delivered to ${data.delivered} subscribers!`);
      setTimeout(() => setSuccessMsg(null), 6000);
      loadStats();
    });

    return () => socketRef.current?.disconnect();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadStats(), loadCampaigns(), loadTemplates(), loadContacts()]);
    setLoading(false);
  };

  const loadStats = async () => {
    try {
      const res = await api.get('/api/email/stats');
      setStats(res.data);
    } catch {}
  };

  const loadCampaigns = async () => {
    try {
      const res = await api.get('/api/email/campaigns');
      setCampaigns(res.data);
    } catch {}
  };

  const loadTemplates = async () => {
    try {
      const res = await api.get('/api/email/templates');
      setTemplates(res.data);
    } catch {}
  };

  const loadContacts = async () => {
    try {
      const res = await api.get('/api/email/contacts');
      setContacts(res.data);
    } catch {}
  };

  const handleCreateCampaign = async () => {
    if (!campaignForm.name || !campaignForm.subject || !campaignForm.htmlBody) return;
    setCampaignCreating(true);
    try {
      const res = await api.post('/api/email/campaigns', campaignForm);
      setCampaigns(prev => [res.data, ...prev]);
      setShowCampaignModal(false);
      setCampaignForm({ name: '', subject: '', fromName: 'Ricoz Communication', fromEmail: 'hello@ricoz.io', htmlBody: '', audienceTag: '', templateId: '' });
      setSuccessMsg('Campaign draft created! Click "Send" to launch it.');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch {
      alert('Failed to create campaign');
    } finally {
      setCampaignCreating(false);
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    setSendingId(campaignId);
    try {
      await api.post(`/api/email/campaigns/${campaignId}/send`);
      // Socket will handle the completion event
    } catch {
      setSendingId(null);
      alert('Failed to launch campaign');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      await api.delete(`/api/email/campaigns/${id}`);
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch {}
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.htmlBody) return;
    setTemplateSaving(true);
    try {
      if (editingTemplate) {
        const res = await api.put(`/api/email/templates/${editingTemplate.id}`, templateForm);
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? res.data : t));
      } else {
        const res = await api.post('/api/email/templates', templateForm);
        setTemplates(prev => [res.data, ...prev]);
      }
      setShowTemplateModal(false);
      setEditingTemplate(null);
      setTemplateForm({ name: '', subject: '', category: 'Marketing', previewText: '', htmlBody: '' });
    } catch {
      alert('Failed to save template');
    } finally {
      setTemplateSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await api.delete(`/api/email/templates/${id}`);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch {}
  };

  const handleUsePreset = (preset: typeof TEMPLATE_PRESETS[0]) => {
    setTemplateForm({
      name: preset.name,
      subject: preset.subject,
      category: preset.category,
      previewText: preset.previewText,
      htmlBody: preset.html
    });
    setShowTemplateModal(true);
  };

  const handleAddContact = async () => {
    if (!contactForm.email) return;
    setContactSaving(true);
    try {
      const tags = contactForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await api.post('/api/email/contacts', { ...contactForm, tags });
      setContacts(prev => [res.data, ...prev]);
      setShowContactModal(false);
      setContactForm({ email: '', name: '', tags: '' });
      loadStats();
    } catch {
      alert('Failed to add contact');
    } finally {
      setContactSaving(false);
    }
  };

  const handleBulkImport = async () => {
    if (!importText.trim()) return;
    setImportLoading(true);
    try {
      const lines = importText.trim().split('\n');
      const parsed = lines.map(l => {
        const parts = l.split(',');
        return { email: parts[0]?.trim(), name: parts[1]?.trim() || '', tags: [] };
      }).filter(c => c.email && c.email.includes('@'));

      const res = await api.post('/api/email/contacts/bulk-import', { contacts: parsed });
      setSuccessMsg(`Imported ${res.data.imported} contacts (${res.data.skipped} skipped).`);
      setTimeout(() => setSuccessMsg(null), 6000);
      setImportText('');
      setShowImport(false);
      loadContacts();
      loadStats();
    } catch {
      alert('Import failed');
    } finally {
      setImportLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailFor || !testEmailAddr) return;
    try {
      await api.post(`/api/email/campaigns/${testEmailFor}/send-test`, { testEmail: testEmailAddr });
      setSuccessMsg(`Test email sent to ${testEmailAddr}`);
      setTestEmailFor(null);
      setTestEmailAddr('');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      alert('Failed to send test email');
    }
  };

  const handleUnsubscribe = async (id: string) => {
    try {
      await api.patch(`/api/email/contacts/${id}/unsubscribe`);
      setContacts(prev => prev.map(c => c.id === id ? { ...c, status: 'unsubscribed' } : c));
      loadStats();
    } catch {}
  };

  const filteredContacts = contacts.filter(c =>
    c.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
    (c.name || '').toLowerCase().includes(contactSearch.toLowerCase())
  );

  const openRate = (c: EmailCampaign) => c.delivered > 0 ? ((c.opened / c.delivered) * 100).toFixed(1) : '0.0';
  const clickRate = (c: EmailCampaign) => c.delivered > 0 ? ((c.clicked / c.delivered) * 100).toFixed(1) : '0.0';

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      sent: 'bg-emerald-100 text-emerald-800',
      sending: 'bg-blue-100 text-blue-800 animate-pulse',
      draft: 'bg-slate-100 text-slate-700',
      scheduled: 'bg-amber-100 text-amber-800',
      paused: 'bg-rose-100 text-rose-700'
    };
    return map[status] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f8f9fc]">
      {/* Header */}
      <div className="shrink-0 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-8 py-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-400/30 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5 animate-pulse" />
                Email Marketing Studio
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Email Broadcast & Automation</h1>
            <p className="text-slate-300 text-xs mt-1">
              Create, send, and track personalized email campaigns at scale via Mailtrap/SMTP.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {activeTab === 'campaigns' && (
              <button
                onClick={() => setShowCampaignModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-rose-500/30 transition-all text-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Campaign</span>
              </button>
            )}
            {activeTab === 'templates' && (
              <button
                onClick={() => { setEditingTemplate(null); setTemplateForm({ name: '', subject: '', category: 'Marketing', previewText: '', htmlBody: '' }); setShowTemplateModal(true); }}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg text-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Template</span>
              </button>
            )}
            {activeTab === 'contacts' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowImport(true)}
                  className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Bulk Import CSV</span>
                </button>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all text-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Subscriber</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-5 max-w-7xl mx-auto border-b border-slate-700 pb-0">
          {(['overview', 'campaigns', 'templates', 'contacts'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2.5 text-xs font-bold capitalize border-b-2 transition-all cursor-pointer -mb-px",
                activeTab === tab
                  ? "text-white border-rose-400"
                  : "text-slate-400 border-transparent hover:text-slate-200"
              )}
            >
              {tab === 'overview' && <span className="flex items-center space-x-1.5"><BarChart2 className="w-3.5 h-3.5" /><span>Overview</span></span>}
              {tab === 'campaigns' && <span className="flex items-center space-x-1.5"><Send className="w-3.5 h-3.5" /><span>Campaigns ({campaigns.length})</span></span>}
              {tab === 'templates' && <span className="flex items-center space-x-1.5"><Palette className="w-3.5 h-3.5" /><span>Templates ({templates.length})</span></span>}
              {tab === 'contacts' && <span className="flex items-center space-x-1.5"><Users className="w-3.5 h-3.5" /><span>Subscribers ({contacts.filter(c => c.status === 'subscribed').length})</span></span>}
            </button>
          ))}
        </div>
      </div>

      {/* Main body */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Success Banner */}
          {successMsg && (
            <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-semibold animate-in fade-in duration-200">
              <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>{successMsg}</span></div>
              <button onClick={() => setSuccessMsg(null)}><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* ─── OVERVIEW TAB ─── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Subscribers', value: stats.totalSubscribers.toLocaleString(), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
                  { label: 'Avg Open Rate', value: `${stats.avgOpenRate}%`, icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                  { label: 'Avg Click Rate', value: `${stats.avgClickRate}%`, icon: MousePointer, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
                  { label: 'Campaigns Sent', value: stats.totalCampaigns.toString(), icon: Send, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
                ].map(stat => (
                  <div key={stat.label} className={`bg-white border ${stat.border} rounded-2xl p-5 flex items-start space-x-4`}>
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{stat.label}</div>
                      <div className={`text-2xl font-extrabold ${stat.color} mt-0.5`}>{stat.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Delivery Pipeline</h3>
                  {[
                    { label: 'Total Delivered', value: stats.totalDelivered, color: 'bg-slate-900' },
                    { label: 'Opened', value: stats.totalOpened, color: 'bg-emerald-500' },
                    { label: 'Clicked', value: stats.totalClicked, color: 'bg-blue-500' },
                    { label: 'Bounced', value: stats.totalBounced, color: 'bg-rose-400' }
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${row.color}`} />
                        <span className="text-xs font-semibold text-slate-700">{row.label}</span>
                      </div>
                      <span className="text-sm font-extrabold text-slate-900">{row.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Recent campaigns */}
                <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Campaigns</h3>
                    <button onClick={() => setActiveTab('campaigns')} className="text-xs text-indigo-600 font-bold hover:underline flex items-center">
                      View all <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  {campaigns.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No campaigns yet. Launch your first one!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {campaigns.slice(0, 4).map(c => (
                        <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-900 text-sm truncate">{c.name}</div>
                            <div className="text-xs text-slate-400 truncate">{c.subject}</div>
                          </div>
                          <div className="flex items-center space-x-3 ml-4 shrink-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(c.status)}`}>{c.status.toUpperCase()}</span>
                            <div className="text-xs font-bold text-emerald-600">{openRate(c)}% open</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Template presets as quick starters */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">🎨 Pre-Built Template Library — Click to Start</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {TEMPLATE_PRESETS.map(preset => (
                    <button
                      key={preset.name}
                      onClick={() => handleUsePreset(preset)}
                      className="p-4 bg-gradient-to-br from-slate-50 to-indigo-50 border border-slate-200 hover:border-indigo-400 rounded-xl text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{preset.category.toUpperCase()}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                      <div className="font-bold text-slate-900 text-sm">{preset.name}</div>
                      <div className="text-xs text-slate-500 mt-1 truncate">{preset.subject}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── CAMPAIGNS TAB ─── */}
          {activeTab === 'campaigns' && (
            <div>
              {campaigns.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                  <Mail className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-600 font-bold text-base">No email campaigns yet</p>
                  <p className="text-slate-400 text-sm mt-1 mb-4">Create your first campaign to broadcast to your subscribers.</p>
                  <button
                    onClick={() => setShowCampaignModal(true)}
                    className="inline-flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Campaign</span>
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {['Campaign Name', 'Status', 'Recipients', 'Open Rate', 'Click Rate', 'Bounced', 'Actions'].map(h => (
                          <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {campaigns.map(camp => (
                        <tr key={camp.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900">{camp.name}</div>
                            <div className="text-xs text-slate-400 truncate max-w-[200px]">{camp.subject}</div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(camp.status)}`}>
                              {camp.status === 'sending' ? '⟳ Sending...' : camp.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-slate-700">{camp.totalRecipients.toLocaleString()}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-3 h-3 text-emerald-600" />
                              <span className="font-bold text-emerald-700">{openRate(camp)}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center space-x-1">
                              <MousePointer className="w-3 h-3 text-blue-600" />
                              <span className="font-bold text-blue-700">{clickRate(camp)}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-bold text-rose-600">{camp.bounced}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center space-x-2">
                              {camp.status === 'draft' && (
                                <>
                                  <button
                                    onClick={() => handleSendCampaign(camp.id)}
                                    disabled={sendingId === camp.id}
                                    className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50 transition-colors"
                                  >
                                    {sendingId === camp.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                    <span>{sendingId === camp.id ? 'Sending...' : 'Send Now'}</span>
                                  </button>
                                  <button
                                    onClick={() => setTestEmailFor(camp.id)}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                                  >
                                    Test
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDeleteCampaign(camp.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ─── TEMPLATES TAB ─── */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              {/* Built-in presets */}
              {templates.length === 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
                  <p className="text-sm font-bold text-indigo-900 mb-3">🎨 Start from a pre-built template below or create your own:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {TEMPLATE_PRESETS.map(p => (
                      <button key={p.name} onClick={() => handleUsePreset(p)} className="p-4 bg-white border border-indigo-200 hover:border-indigo-500 rounded-xl text-left text-sm cursor-pointer transition-all">
                        <div className="text-[10px] font-bold text-indigo-600 mb-1">{p.category.toUpperCase()}</div>
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5 truncate">{p.subject}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {templates.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* New template card */}
                  <button
                    onClick={() => { setEditingTemplate(null); setTemplateForm({ name: '', subject: '', category: 'Marketing', previewText: '', htmlBody: '' }); setShowTemplateModal(true); }}
                    className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-8 flex flex-col items-center justify-center space-y-2 text-slate-500 hover:text-indigo-600 transition-all cursor-pointer bg-white group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold">Create Template</span>
                  </button>

                  {templates.map(tpl => (
                    <div key={tpl.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {/* Email preview mini */}
                      <div
                        className="h-40 bg-slate-100 overflow-hidden cursor-pointer relative group"
                        onClick={() => setPreviewTemplate(tpl)}
                      >
                        <div className="scale-[0.3] origin-top-left w-[333%] h-[333%] pointer-events-none">
                          <div dangerouslySetInnerHTML={{ __html: tpl.htmlBody }} />
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="bg-white/90 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>Preview</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tpl.category === 'Marketing' ? 'bg-rose-100 text-rose-700' :
                            tpl.category === 'Newsletter' ? 'bg-blue-100 text-blue-700' :
                            tpl.category === 'Promotional' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                          }`}>{tpl.category}</span>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => { setEditingTemplate(tpl); setTemplateForm({ name: tpl.name, subject: tpl.subject, category: tpl.category, previewText: tpl.previewText || '', htmlBody: tpl.htmlBody }); setShowTemplateModal(true); }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(tpl.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="font-bold text-slate-900 text-sm">{tpl.name}</div>
                        <div className="text-xs text-slate-400 truncate">{tpl.subject}</div>
                        <button
                          onClick={() => {
                            setCampaignForm(prev => ({ ...prev, htmlBody: tpl.htmlBody, subject: tpl.subject, templateId: tpl.id, name: tpl.name }));
                            setActiveTab('campaigns');
                            setShowCampaignModal(true);
                          }}
                          className="mt-3 w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                        >
                          Use in Campaign →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── CONTACTS TAB ─── */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              {/* Search bar */}
              <div className="flex items-center space-x-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search subscribers..."
                    value={contactSearch}
                    onChange={e => setContactSearch(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold">
                  <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-bold">
                    {contacts.filter(c => c.status === 'subscribed').length} subscribed
                  </span>
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">
                    {contacts.filter(c => c.status === 'unsubscribed').length} unsubscribed
                  </span>
                </div>
              </div>

              {/* Bulk import panel */}
              {showImport && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900 text-sm">📤 Bulk CSV Import</h3>
                    <button onClick={() => setShowImport(false)}><X className="w-4 h-4 text-slate-400" /></button>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">Paste CSV rows — one contact per line: <code className="bg-slate-100 px-1 rounded">email, name</code></p>
                  <textarea
                    value={importText}
                    onChange={e => setImportText(e.target.value)}
                    rows={6}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-indigo-500 resize-none bg-slate-50"
                    placeholder="john@example.com, John Smith&#10;jane@example.com, Jane Doe&#10;...etc"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleBulkImport}
                      disabled={importLoading || !importText.trim()}
                      className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2 rounded-xl cursor-pointer disabled:opacity-50 transition-colors"
                    >
                      {importLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>{importLoading ? 'Importing...' : 'Import Contacts'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Contacts table */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {filteredContacts.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-sm">No subscribers yet.</p>
                    <p className="text-xs mt-1">Add individual subscribers or import from CSV.</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {['Name / Email', 'Status', 'Source', 'Tags', 'Added', 'Actions'].map(h => (
                          <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredContacts.map(contact => (
                        <tr key={contact.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900 text-sm">{contact.name || '—'}</div>
                            <div className="text-xs text-slate-400">{contact.email}</div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              contact.status === 'subscribed' ? 'bg-emerald-100 text-emerald-800' :
                              contact.status === 'bounced' ? 'bg-rose-100 text-rose-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {contact.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-500 font-medium capitalize">{contact.source}</td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1">
                              {(JSON.parse(contact.tags || '[]') as string[]).map(tag => (
                                <span key={tag} className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{tag}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-400">
                            {new Date(contact.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center space-x-2">
                              {contact.status === 'subscribed' && (
                                <button
                                  onClick={() => handleUnsubscribe(contact.id)}
                                  className="text-xs text-slate-500 hover:text-rose-600 font-bold cursor-pointer transition-colors"
                                >
                                  Unsub
                                </button>
                              )}
                              <button
                                onClick={async () => {
                                  await api.delete(`/api/email/contacts/${contact.id}`);
                                  setContacts(prev => prev.filter(c => c.id !== contact.id));
                                  loadStats();
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════════════════ */}

      {/* Campaign creation modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <h2 className="text-lg font-extrabold text-slate-900">📧 Create Email Campaign</h2>
              <button onClick={() => setShowCampaignModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Campaign Name *</label>
                  <input type="text" value={campaignForm.name} onChange={e => setCampaignForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. October Product Launch" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Subject Line *</label>
                  <input type="text" value={campaignForm.subject} onChange={e => setCampaignForm(p => ({ ...p, subject: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Hey {{name}}, big news!" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">From Name</label>
                  <input type="text" value={campaignForm.fromName} onChange={e => setCampaignForm(p => ({ ...p, fromName: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">From Email</label>
                  <input type="email" value={campaignForm.fromEmail} onChange={e => setCampaignForm(p => ({ ...p, fromEmail: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Audience Filter (Tag)</label>
                <input type="text" value={campaignForm.audienceTag} onChange={e => setCampaignForm(p => ({ ...p, audienceTag: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none"
                  placeholder="Leave empty to send to ALL subscribed contacts" />
              </div>

              {templates.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Use Template</label>
                  <select onChange={e => {
                    const tpl = templates.find(t => t.id === e.target.value);
                    if (tpl) setCampaignForm(p => ({ ...p, htmlBody: tpl.htmlBody, subject: tpl.subject, templateId: tpl.id }));
                  }} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none">
                    <option value="">— Paste HTML manually below —</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email HTML Body *</label>
                <textarea
                  rows={10}
                  value={campaignForm.htmlBody}
                  onChange={e => setCampaignForm(p => ({ ...p, htmlBody: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500 resize-y"
                  placeholder="Paste your full HTML email code here, or select a template above. Use {{name}} and {{email}} for personalization."
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end space-x-3 shrink-0">
              <button onClick={() => setShowCampaignModal(false)} className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
              <button
                onClick={handleCreateCampaign}
                disabled={campaignCreating || !campaignForm.name || !campaignForm.subject || !campaignForm.htmlBody}
                className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-extrabold rounded-xl shadow-md shadow-rose-600/30 disabled:opacity-50 transition-all cursor-pointer"
              >
                {campaignCreating ? 'Creating...' : 'Save Draft Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template edit modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <h2 className="text-lg font-extrabold text-slate-900">{editingTemplate ? 'Edit' : 'Create'} Email Template</h2>
              <button onClick={() => { setShowTemplateModal(false); setEditingTemplate(null); }}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Template Name *</label>
                  <input type="text" value={templateForm.name} onChange={e => setTemplateForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. VIP Welcome Email" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                  <select value={templateForm.category} onChange={e => setTemplateForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none">
                    {['Marketing', 'Newsletter', 'Promotional', 'Transactional'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Default Subject *</label>
                <input type="text" value={templateForm.subject} onChange={e => setTemplateForm(p => ({ ...p, subject: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Preview Text (shown in inbox)</label>
                <input type="text" value={templateForm.previewText} onChange={e => setTemplateForm(p => ({ ...p, previewText: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">HTML Body *</label>
                <textarea rows={14} value={templateForm.htmlBody} onChange={e => setTemplateForm(p => ({ ...p, htmlBody: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500 resize-y" />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end space-x-3 shrink-0">
              <button onClick={() => { setShowTemplateModal(false); setEditingTemplate(null); }} className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
              <button
                onClick={handleSaveTemplate}
                disabled={templateSaving || !templateForm.name || !templateForm.htmlBody}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold rounded-xl shadow-md shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
              >
                {templateSaving ? 'Saving...' : (editingTemplate ? 'Save Changes' : 'Create Template')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add contact modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">Add Subscriber</h3>
              <button onClick={() => setShowContactModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address *</label>
                <input type="email" value={contactForm.email} onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-500" placeholder="user@example.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Name</label>
                <input type="text" value={contactForm.name} onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-500" placeholder="Full name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tags (comma-separated)</label>
                <input type="text" value={contactForm.tags} onChange={e => setContactForm(p => ({ ...p, tags: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none"
                  placeholder="vip, enterprise, trial" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-2 border-t border-slate-100">
              <button onClick={() => setShowContactModal(false)} className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
              <button
                onClick={handleAddContact}
                disabled={contactSaving || !contactForm.email}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold rounded-xl cursor-pointer disabled:opacity-50"
              >
                {contactSaving ? 'Adding...' : 'Add Subscriber'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template HTML preview */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="font-extrabold text-slate-900">{previewTemplate.name}</h3>
                <p className="text-xs text-slate-400">{previewTemplate.subject}</p>
              </div>
              <button onClick={() => setPreviewTemplate(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <iframe
                srcDoc={previewTemplate.htmlBody}
                className="w-full"
                style={{ height: '600px', border: 'none' }}
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      )}

      {/* Test email modal */}
      {testEmailFor && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900">Send Test Email</h3>
              <button onClick={() => setTestEmailFor(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p className="text-xs text-slate-500">Sends a personalized preview to your email. No subscribers will be notified.</p>
            <input type="email" value={testEmailAddr} onChange={e => setTestEmailAddr(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-500"
              placeholder="your@email.com" />
            <div className="flex justify-end space-x-3 pt-2 border-t border-slate-100">
              <button onClick={() => setTestEmailFor(null)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
              <button onClick={handleSendTestEmail} disabled={!testEmailAddr}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold rounded-xl cursor-pointer disabled:opacity-50">
                Send Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
