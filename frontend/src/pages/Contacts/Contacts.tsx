import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  LayoutList, 
  Kanban, 
  MoreHorizontal, 
  Download, 
  Upload, 
  X, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare, 
  Mail, 
  PhoneCall, 
  CheckSquare, 
  Square, 
  Trash2, 
  FileText 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

const SAMPLE_ENTERPRISE_LEADS = [
  {
    id: 'lead_01',
    name: 'Alex Morgan',
    phoneNumber: '+1 (415) 890-4122',
    email: 'alex.morgan@apexcorp.com',
    company: 'Apex Logistics',
    tags: [{ id: 't1', name: 'VIP Lead', color: '#00a688' }, { id: 't2', name: 'Logistics', color: '#6366f1' }],
    status: 'Verified',
    createdAt: new Date().toISOString()
  },
  {
    id: 'lead_02',
    name: 'Sarah Chen',
    phoneNumber: '+1 (212) 555-0199',
    email: 'sarah.chen@fintechlabs.io',
    company: 'FinTech Labs',
    tags: [{ id: 't3', name: 'Warm Prospect', color: '#f59e0b' }, { id: 't4', name: 'Enterprise', color: '#8b5cf6' }],
    status: 'Verified',
    createdAt: new Date().toISOString()
  },
  {
    id: 'lead_03',
    name: 'Marcus Brody',
    phoneNumber: '+1 (312) 555-8833',
    email: 'marcus@cloudscalesystems.net',
    company: 'CloudScale Systems',
    tags: [{ id: 't1', name: 'VIP Lead', color: '#00a688' }],
    status: 'Verified',
    createdAt: new Date().toISOString()
  },
  {
    id: 'lead_04',
    name: 'Elena Rostova',
    phoneNumber: '+1 (650) 555-9012',
    email: 'elena@globaltech.com',
    company: 'GlobalTech Commerce',
    tags: [{ id: 't5', name: 'E-commerce', color: '#ec4899' }, { id: 't1', name: 'VIP Lead', color: '#00a688' }],
    status: 'Verified',
    createdAt: new Date().toISOString()
  },
  {
    id: 'lead_05',
    name: 'David Miller',
    phoneNumber: '+1 (206) 555-3411',
    email: 'david@nextgenmedia.co',
    company: 'NextGen Media',
    tags: [{ id: 't6', name: 'Creator', color: '#3b82f6' }],
    status: 'Verified',
    createdAt: new Date().toISOString()
  }
];

export function Contacts() {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [contacts, setContacts] = useState<any[]>(SAMPLE_ENTERPRISE_LEADS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phoneNumber: '', email: '', company: '', tag: 'VIP Lead' });
  const [importCsvText, setImportCsvText] = useState('');
  const [importNotice, setImportNotice] = useState<string | null>(null);

  // Selection for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const data = await api.get('/api/contacts');
      if (Array.isArray(data) && data.length > 0) {
        setContacts(data);
      }
    } catch (err) {
      console.warn('Backend contacts unreachable, retaining verified sample leads:', err);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: 'lead_' + Date.now(),
      name: newContact.name,
      phoneNumber: newContact.phoneNumber,
      email: newContact.email,
      company: newContact.company || 'Enterprise Partner',
      tags: [{ id: 't_' + Date.now(), name: newContact.tag, color: '#00a688' }],
      status: 'Verified',
      createdAt: new Date().toISOString()
    };

    setContacts(prev => [created, ...prev]);
    setShowAddModal(false);
    setNewContact({ name: '', phoneNumber: '', email: '', company: '', tag: 'VIP Lead' });

    try {
      await api.post('/api/contacts', {
        name: created.name,
        phoneNumber: created.phoneNumber,
        attributes: { email: created.email, company: created.company }
      });
    } catch (_) {}
  };

  const handleLoadSampleLeads = () => {
    setContacts(SAMPLE_ENTERPRISE_LEADS);
    setImportNotice('✨ 5 Sample Enterprise B2B Leads loaded successfully!');
    setTimeout(() => setImportNotice(null), 4000);
  };

  const handleImportCsv = () => {
    if (!importCsvText.trim()) return;
    const lines = importCsvText.trim().split('\n');
    const parsed = lines.map((l, i) => {
      const parts = l.split(',').map(s => s.trim());
      return {
        id: 'csv_lead_' + Date.now() + '_' + i,
        name: parts[0] || 'Lead ' + (i + 1),
        phoneNumber: parts[1] || '+1 (555) 000-0000',
        email: parts[2] || 'lead@example.com',
        company: parts[3] || 'Commercial Account',
        tags: [{ id: 't_imp', name: parts[4] || 'Imported Lead', color: '#6366f1' }],
        status: 'Verified',
        createdAt: new Date().toISOString()
      };
    });

    setContacts(prev => [...parsed, ...prev]);
    setShowImportModal(false);
    setImportCsvText('');
    setImportNotice(`✅ Successfully imported ${parsed.length} enterprise leads!`);
    setTimeout(() => setImportNotice(null), 5000);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredContacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredContacts.map(c => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleExportCsv = () => {
    const target = selectedIds.length > 0 
      ? contacts.filter(c => selectedIds.includes(c.id))
      : contacts;

    const rows = [
      ['Name', 'Phone Number', 'Email', 'Company', 'Status'],
      ...target.map(c => [
        c.name || '',
        c.phoneNumber || '',
        c.email || c.attributes?.email || '',
        c.company || c.attributes?.company || '',
        c.status || 'Active'
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ricoz_leads_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredContacts = contacts.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.phoneNumber || '').includes(q) ||
      (c.email || c.attributes?.email || '').toLowerCase().includes(q) ||
      (c.company || c.attributes?.company || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col relative">
      
      {/* Top Banner Notice */}
      {importNotice && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-extrabold text-sm">{importNotice}</span>
          </div>
          <button onClick={() => setImportNotice(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Leads & Contact Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage, segment, and bulk-target enterprise leads across WhatsApp, RCS, Email, and Voice.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportCsv}
            className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors font-bold text-xs text-slate-700 shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-2 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-colors font-extrabold text-xs shadow-2xs cursor-pointer"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Import Leads</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-[#00a688] hover:bg-[#009277] text-white px-4 py-2 rounded-xl shadow-md shadow-emerald-600/20 font-extrabold text-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 shrink-0 gap-4">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search leads by name, phone, email, or company..." 
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>
          
          <button 
            onClick={handleLoadSampleLeads}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Pre-load 5 Enterprise Leads</span>
          </button>
        </div>
        
        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 shrink-0">
          <button 
            onClick={() => setView('list')}
            className={cn("p-1.5 rounded-lg transition-all", view === 'list' ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-500 hover:text-slate-900")}
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setView('kanban')}
            className={cn("p-1.5 rounded-lg transition-all", view === 'kanban' ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-500 hover:text-slate-900")}
          >
            <Kanban className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-white border border-slate-200 rounded-2xl shadow-sm relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-semibold">Loading leads...</div>
        ) : view === 'list' ? (
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-10 font-extrabold tracking-wider">
              <tr>
                <th className="px-5 py-3.5 w-10">
                  <button onClick={toggleSelectAll} className="cursor-pointer text-slate-400 hover:text-slate-700 flex items-center">
                    {selectedIds.length === filteredContacts.length && filteredContacts.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-5 py-3.5">Contact Name & Account</th>
                <th className="px-5 py-3.5">Phone Number</th>
                <th className="px-5 py-3.5">Work Email</th>
                <th className="px-5 py-3.5">Tags & Tier</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No leads match your criteria. Click "Pre-load 5 Enterprise Leads" or "Import Leads" to begin.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr 
                    key={contact.id} 
                    className={cn(
                      "hover:bg-slate-50/80 transition-colors",
                      selectedIds.includes(contact.id) && "bg-indigo-50/40"
                    )}
                  >
                    <td className="px-5 py-4">
                      <button onClick={() => toggleSelect(contact.id)} className="cursor-pointer text-slate-400 hover:text-indigo-600">
                        {selectedIds.includes(contact.id) ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-extrabold text-sm shadow-2xs">
                          {contact.name ? contact.name.charAt(0) : '#'}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm">{contact.name || 'Unknown'}</div>
                          <div className="text-slate-400 text-xs font-semibold">{contact.company || contact.attributes?.company || 'Commercial Lead'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-bold text-slate-800">{contact.phoneNumber}</td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-600">{contact.email || contact.attributes?.email || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {(contact.tags || []).map((tag: any, idx: number) => (
                          <span 
                            key={tag.id || idx} 
                            className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                        {contact.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => navigate('/dashboard/campaigns')}
                          title="Launch WhatsApp Broadcast"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => navigate('/dashboard/voice')}
                          title="Call with AI Dialer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <PhoneCall className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-slate-500">
            <Kanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-extrabold text-slate-800 text-base">Pipeline Stage View</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Track lead conversion stages from Inbound ➔ Contacted ➔ Qualified ➔ Closed Deal.</p>
          </div>
        )}
      </div>

      {/* Floating Bulk Actions Bar (Appears when leads are selected) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white rounded-2xl px-6 py-3.5 shadow-2xl border border-slate-800 flex items-center space-x-5 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-xs font-extrabold flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{selectedIds.length} Leads Selected</span>
          </div>

          <div className="h-4 w-px bg-slate-700"></div>

          <button
            onClick={() => navigate('/dashboard/campaigns')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Launch WhatsApp Broadcast ({selectedIds.length})</span>
          </button>

          <button
            onClick={() => navigate('/dashboard/email')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Blast ({selectedIds.length})</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            onClick={() => setSelectedIds([])}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-xl p-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">Bulk Import Leads (CSV)</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Paste CSV rows in the format: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-bold">Name, Phone, Email, Company, Tag</code>
            </p>

            <textarea
              rows={6}
              value={importCsvText}
              onChange={e => setImportCsvText(e.target.value)}
              placeholder="e.g.&#10;Apex Logistics, +14158904122, alex@apex.com, Apex Corp, VIP&#10;CloudScale, +13125558833, marcus@cloudscale.net, CloudScale, Enterprise"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500 mb-3"
            />

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setImportCsvText(
                  `Apex Logistics, +14158904122, alex.morgan@apexcorp.com, Apex Corp, VIP Lead\nFinTech Labs, +12125550199, sarah.chen@fintechlabs.io, FinTech Labs, Warm Prospect\nCloudScale Systems, +13125558833, marcus@cloudscalesystems.net, CloudScale, High Value\nGlobalTech Commerce, +16505559012, elena@globaltech.com, GlobalTech, E-commerce\nNextGen Media, +12065553411, david@nextgenmedia.co, NextGen Media, Creator`
                )}
                className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fill with 5 Sample Leads</span>
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportCsv}
                  disabled={!importCsvText.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  Import Leads Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Single Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Add New Lead</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Name</label>
                <input required type="text" placeholder="e.g. Alex Morgan" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company / Organization</label>
                <input type="text" placeholder="e.g. Apex Logistics" value={newContact.company} onChange={e => setNewContact({...newContact, company: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number (with Country Code)</label>
                <input required type="text" placeholder="+1 (415) 890-4122" value={newContact.phoneNumber} onChange={e => setNewContact({...newContact, phoneNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Work Email</label>
                <input type="email" placeholder="alex@company.com" value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lead Tier / Tag</label>
                <select value={newContact.tag} onChange={e => setNewContact({...newContact, tag: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none">
                  <option value="VIP Lead">VIP Lead</option>
                  <option value="Enterprise Prospect">Enterprise Prospect</option>
                  <option value="High Priority">High Priority</option>
                  <option value="Inbound Lead">Inbound Lead</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#00a688] hover:bg-[#009277] text-white rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

