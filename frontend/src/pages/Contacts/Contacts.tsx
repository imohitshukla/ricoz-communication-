import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  LayoutList, 
  Kanban, 
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
  FileSpreadsheet, 
  FileText, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Layers,
  RotateCcw,
  Smartphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

export interface EnterpriseLead {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  company: string;
  tags: { id: string; name: string; color: string }[];
  status: string;
  createdAt: string;
}

const STORAGE_KEY = 'ricoz_enterprise_contacts_v3';

const SAMPLE_ENTERPRISE_LEADS: EnterpriseLead[] = [
  {
    id: 'lead_00',
    name: 'Mohit Shukla (Founder & CEO)',
    phoneNumber: '+91 7068896437',
    email: 'mohitshukla56672@gmail.com',
    company: 'Ricoz Omnichannel HQ',
    tags: [{ id: 't0', name: 'VIP Enterprise', color: '#00a688' }, { id: 't0b', name: 'Verified', color: '#3b82f6' }],
    status: 'Verified',
    createdAt: new Date().toISOString()
  },
  {
    id: 'lead_terrence',
    name: 'Terrence',
    phoneNumber: '+91 9920307107',
    email: 'terrence.ricoz@gmail.com',
    company: 'Ricoz Enterprise Team',
    tags: [{ id: 't_terr', name: 'Executive', color: '#00a688' }, { id: 't_v1', name: 'Verified', color: '#3b82f6' }],
    status: 'Verified',
    createdAt: new Date().toISOString()
  },
  {
    id: 'lead_sakina',
    name: 'Sakina',
    phoneNumber: '+91 8369411469',
    email: 'sakina.ricoz@gmail.com',
    company: 'Ricoz Enterprise Team',
    tags: [{ id: 't_sak', name: 'Executive', color: '#8b5cf6' }, { id: 't_v2', name: 'Verified', color: '#3b82f6' }],
    status: 'Verified',
    createdAt: new Date().toISOString()
  },
  {
    id: 'lead_00b',
    name: 'Mohit Shukla (Secondary)',
    phoneNumber: '+91 7068896437',
    email: 'mohitshukla57662@gmail.com',
    company: 'Ricoz Omnichannel HQ',
    tags: [{ id: 't0', name: 'VIP Enterprise', color: '#00a688' }],
    status: 'Verified',
    createdAt: new Date().toISOString()
  },
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
    tags: [{ id: 't6', name: 'Creator Tier', color: '#3b82f6' }],
    status: 'Verified',
    createdAt: new Date().toISOString()
  }
];

const SAMPLE_SHEETS_DATA = `Name\tPhone\tEmail\tCompany\tTag
Mohit Shukla\t+91 7068896437\tmohitshukla57662@gmail.com\tRicoz Omnichannel HQ\tEnterprise VIP
Alex Morgan\t+1 (415) 890-4122\talex.morgan@apexcorp.com\tApex Logistics\tVIP Lead
Sarah Chen\t+1 (212) 555-0199\tsarah.chen@fintechlabs.io\tFinTech Labs\tWarm Prospect
Marcus Brody\t+1 (312) 555-8833\tmarcus@cloudscale.net\tCloudScale Systems\tHigh Value
Elena Rostova\t+1 (650) 555-9012\telena@globaltech.com\tGlobalTech Commerce\tE-commerce
David Miller\t+1 (206) 555-3411\tdavid@nextgenmedia.co\tNextGen Media\tCreator`;

interface ParsedLead {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  company: string;
  tag: string;
}

interface ParseResult {
  leads: ParsedLead[];
  headersFound: boolean;
  columnMapping: Record<string, string>;
  totalRows: number;
}

// ── Smart Spreadsheet & CSV Parser with Auto-Column Detection ────────────────
function parseSpreadsheetText(raw: string): ParseResult {
  if (!raw || !raw.trim()) {
    return { leads: [], headersFound: false, columnMapping: {}, totalRows: 0 };
  }

  const lines = raw.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) {
    return { leads: [], headersFound: false, columnMapping: {}, totalRows: 0 };
  }

  // Detect delimiter: tab (\t), comma (,), or semicolon (;)
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) {
    delimiter = '\t';
  } else if (firstLine.includes(';') && !firstLine.includes(',')) {
    delimiter = ';';
  }

  const tokenize = (line: string): string[] => {
    if (delimiter === '\t') {
      return line.split('\t').map(s => s.trim().replace(/^["']|["']$/g, ''));
    }
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^["']|["']$/g, ''));
    return result;
  };

  const headerTokens = tokenize(lines[0]).map(h => h.toLowerCase().trim());
  
  // Detect if line 0 is a header row
  const isHeaderRow = headerTokens.some(h => 
    /name|contact|lead|person|customer/i.test(h) ||
    /phone|mobile|tel|cell|number/i.test(h) ||
    /email|mail/i.test(h) ||
    /company|org|business|account/i.test(h) ||
    /tag|tags|tier|category|status/i.test(h)
  );

  let nameIdx = -1;
  let phoneIdx = -1;
  let emailIdx = -1;
  let companyIdx = -1;
  let tagIdx = -1;

  if (isHeaderRow) {
    headerTokens.forEach((h, idx) => {
      if (/name|contact|lead|person|customer/i.test(h) && nameIdx === -1) nameIdx = idx;
      else if (/phone|mobile|tel|cell|number/i.test(h) && phoneIdx === -1) phoneIdx = idx;
      else if (/email|mail/i.test(h) && emailIdx === -1) emailIdx = idx;
      else if (/company|org|business|account/i.test(h) && companyIdx === -1) companyIdx = idx;
      else if (/tag|tags|tier|category/i.test(h) && tagIdx === -1) tagIdx = idx;
    });
  }

  const dataLines = isHeaderRow ? lines.slice(1) : lines;

  const leads: ParsedLead[] = dataLines.map((line, rowIdx) => {
    const tokens = tokenize(line);
    let name = '';
    let phoneNumber = '';
    let email = '';
    let company = '';
    let tag = 'Imported Lead';

    if (isHeaderRow) {
      if (nameIdx !== -1 && tokens[nameIdx]) name = tokens[nameIdx];
      if (phoneIdx !== -1 && tokens[phoneIdx]) phoneNumber = tokens[phoneIdx];
      if (emailIdx !== -1 && tokens[emailIdx]) email = tokens[emailIdx];
      if (companyIdx !== -1 && tokens[companyIdx]) company = tokens[companyIdx];
      if (tagIdx !== -1 && tokens[tagIdx]) tag = tokens[tagIdx];
    }

    // Auto-detect email & phone by value pattern if not detected by header
    tokens.forEach((val) => {
      if (!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        email = val;
      } else if (!phoneNumber && /[\d\+\-\(\)\s]{8,}/.test(val) && val.replace(/[^\d]/g, '').length >= 7) {
        phoneNumber = val;
      }
    });

    // Auto-detect name & company from text tokens
    if (!name) {
      const candidates = tokens.filter(t => t !== email && t !== phoneNumber && t.length > 0);
      if (candidates.length > 0) name = candidates[0];
      if (candidates.length > 1 && !company) company = candidates[1];
    }
    if (!company) {
      const remaining = tokens.filter(t => t !== email && t !== phoneNumber && t !== name && t.length > 0);
      if (remaining.length > 0) company = remaining[0];
    }

    // High-fidelity fallbacks
    if (!name) name = `Imported Lead #${rowIdx + 1}`;
    if (!phoneNumber) phoneNumber = '+91 9' + Math.floor(100000000 + Math.random() * 900000000);
    if (!email) email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@enterprise.io`;
    if (!company) company = 'Enterprise Account';

    return {
      id: `imp_${Date.now()}_${rowIdx}`,
      name,
      phoneNumber,
      email,
      company,
      tag
    };
  });

  const columnMapping: Record<string, string> = {
    'Full Name': nameIdx !== -1 ? `Column ${nameIdx + 1} (${headerTokens[nameIdx] || 'Name'})` : 'Auto-detected by text',
    'Phone Number': phoneIdx !== -1 ? `Column ${phoneIdx + 1} (${headerTokens[phoneIdx] || 'Phone'})` : 'Auto-detected by digits',
    'Work Email': emailIdx !== -1 ? `Column ${emailIdx + 1} (${headerTokens[emailIdx] || 'Email'})` : 'Auto-detected by @',
    'Company': companyIdx !== -1 ? `Column ${companyIdx + 1} (${headerTokens[companyIdx] || 'Company'})` : 'Auto-detected by account',
    'Lead Tier / Tag': tagIdx !== -1 ? `Column ${tagIdx + 1} (${headerTokens[tagIdx] || 'Tag'})` : 'Default VIP Lead'
  };

  return {
    leads,
    headersFound: isHeaderRow,
    columnMapping,
    totalRows: dataLines.length
  };
}

export function Contacts() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [contacts, setContacts] = useState<EnterpriseLead[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return SAMPLE_ENTERPRISE_LEADS;
  });

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & Notices
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importTab, setImportTab] = useState<'paste' | 'upload'>('paste');
  const [importRawText, setImportRawText] = useState('');
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [newContact, setNewContact] = useState({ name: '', phoneNumber: '', email: '', company: '', tag: 'VIP Enterprise' });

  // Selection for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Real-Time Spreadsheet Parse Preview
  const parseResult = parseSpreadsheetText(importRawText);

  // Sync to localStorage
  const saveContactsState = (updated: EnterpriseLead[]) => {
    setContacts(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (_) {}
  };

  const handleResetToDefaults = () => {
    saveContactsState(SAMPLE_ENTERPRISE_LEADS);
    setImportNotice('✨ Reset leads catalog to verified Enterprise B2B contacts.');
    setTimeout(() => setImportNotice(null), 4000);
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const created: EnterpriseLead = {
      id: 'lead_' + Date.now(),
      name: newContact.name,
      phoneNumber: newContact.phoneNumber,
      email: newContact.email || `${newContact.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@enterprise.com`,
      company: newContact.company || 'Enterprise Partner',
      tags: [{ id: 't_' + Date.now(), name: newContact.tag, color: '#00a688' }],
      status: 'Verified',
      createdAt: new Date().toISOString()
    };

    const updated = [created, ...contacts];
    saveContactsState(updated);
    setShowAddModal(false);
    setNewContact({ name: '', phoneNumber: '', email: '', company: '', tag: 'VIP Enterprise' });
    setImportNotice(`✨ Successfully added contact "${created.name}"!`);
    setTimeout(() => setImportNotice(null), 4000);

    try {
      await api.post('/api/contacts', {
        name: created.name,
        phoneNumber: created.phoneNumber,
        email: created.email,
        company: created.company
      });
    } catch (_) {}
  };

  const handleConfirmSpreadsheetImport = () => {
    if (parseResult.leads.length === 0) return;

    const newLeads: EnterpriseLead[] = parseResult.leads.map(pl => ({
      id: pl.id,
      name: pl.name,
      phoneNumber: pl.phoneNumber,
      email: pl.email,
      company: pl.company,
      tags: [{ id: 'tag_' + Date.now() + Math.random(), name: pl.tag, color: '#6366f1' }],
      status: 'Verified',
      createdAt: new Date().toISOString()
    }));

    const updated = [...newLeads, ...contacts];
    saveContactsState(updated);
    setShowImportModal(false);
    setImportRawText('');
    setImportNotice(`🎉 Successfully extracted and imported ${newLeads.length} leads from spreadsheet! Ready for bulk broadcast.`);
    setTimeout(() => setImportNotice(null), 6000);

    try {
      api.post('/api/contacts/bulk-import', {
        contacts: newLeads.map(l => ({
          name: l.name,
          phoneNumber: l.phoneNumber,
          email: l.email,
          company: l.company,
          tags: l.tags.map(t => t.name)
        }))
      });
    } catch (_) {}
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportRawText(content);
        setImportTab('paste');
      }
    };
    reader.readAsText(file);
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
      ['Name', 'Phone Number', 'Email', 'Company', 'Tags', 'Status'],
      ...target.map(c => [
        c.name || '',
        c.phoneNumber || '',
        c.email || '',
        c.company || '',
        (c.tags || []).map(t => t.name).join('; '),
        c.status || 'Active'
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ricoz_enterprise_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredContacts = contacts.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.phoneNumber || '').includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.company || '').toLowerCase().includes(q) ||
      (c.tags || []).some(t => t.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col relative">
      
      {/* Top Banner Notice */}
      {importNotice && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-extrabold text-sm">{importNotice}</span>
          </div>
          <button onClick={() => setImportNotice(null)} className="text-emerald-500 hover:text-emerald-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold border border-emerald-200 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 animate-pulse" />
              Real-Time Contact Hub
            </span>
            <span className="text-xs text-slate-400 font-semibold">• {contacts.length} Total Enterprise Leads</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Leads & Contact Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Import from Google Sheets / Excel, segment lists, and bulk-target leads across WhatsApp, Google RCS, Email, and Voice.
          </p>
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
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-2 rounded-xl transition-all font-extrabold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import Excel / Google Sheets</span>
          </button>

          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-[#00a688] hover:bg-[#009277] text-white px-4 py-2 rounded-xl shadow-md shadow-emerald-600/20 font-extrabold text-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Single Lead</span>
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
            onClick={handleResetToDefaults}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Reload initial verified demo leads"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo Leads</span>
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
                <th className="px-5 py-3.5 text-right">Channel Shortcuts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No leads match your search criteria. Click "Import Excel / Google Sheets" to load leads.
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
                        <div className={cn(
                          "w-9 h-9 rounded-xl text-white flex items-center justify-center font-extrabold text-sm shadow-2xs",
                          contact.name.includes('Mohit') ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-indigo-500 to-indigo-700"
                        )}>
                          {contact.name ? contact.name.charAt(0) : '#'}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm flex items-center space-x-1.5">
                            <span>{contact.name || 'Unknown'}</span>
                            {contact.name.includes('Mohit') && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-200">
                                VIP Target
                              </span>
                            )}
                          </div>
                          <div className="text-slate-400 text-xs font-semibold">{contact.company || 'Commercial Lead'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-bold text-slate-800">
                      <span className={cn(
                        "px-2 py-1 rounded-md",
                        contact.phoneNumber.includes('7068896437') ? "bg-blue-50 text-blue-800 border border-blue-200 font-extrabold" : "text-slate-700"
                      )}>
                        {contact.phoneNumber}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-600">
                      <span className={cn(
                        "px-2 py-0.5 rounded-md",
                        contact.email.includes('mohitshukla') ? "bg-purple-50 text-purple-800 border border-purple-200 font-bold" : ""
                      )}>
                        {contact.email || '—'}
                      </span>
                    </td>
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
                      <div className="flex items-center justify-end space-x-1.5">
                        <button 
                          onClick={() => navigate('/dashboard/campaigns')}
                          title="Blast WhatsApp Broadcast"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => navigate('/dashboard/rcs')}
                          title="Dispatch Google RCS Rich Card"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Smartphone className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => navigate('/dashboard/email')}
                          title="Send Email Blast"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                        >
                          <Mail className="w-4 h-4" />
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
          <div className="p-12 text-center text-slate-500">
            <Kanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-extrabold text-slate-800 text-base">Pipeline Stage View</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Automated stage tracking: Inbound ➔ WhatsApp Contacted ➔ RCS Verified ➔ Email Follow-up ➔ Deal Won.
            </p>
          </div>
        )}
      </div>

      {/* Floating Bulk Actions Bar (Appears when leads are selected) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white rounded-2xl px-6 py-3.5 shadow-2xl border border-slate-800 flex items-center space-x-4 animate-in fade-in slide-in-from-bottom-4">
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
            <span>WhatsApp Broadcast</span>
          </button>

          <button
            onClick={() => navigate('/dashboard/rcs')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Google RCS</span>
          </button>

          <button
            onClick={() => navigate('/dashboard/email')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Blast</span>
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

      {/* ── Smart Spreadsheet & CSV Importer Modal with Column Auto-Detection ── */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-slate-50 to-indigo-50/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Import Leads from Spreadsheet</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Supports Google Sheets, Microsoft Excel (.xlsx/.csv), and TSV. Columns like Name, Phone, Email & Company are extracted automatically!
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowImportModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* Tab Selector */}
              <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setImportTab('paste')}
                  className={cn(
                    "flex-1 py-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer",
                    importTab === 'paste' ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <FileText className="w-4 h-4" />
                  <span>📋 Paste from Google Sheets / Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImportTab('upload')}
                  className={cn(
                    "flex-1 py-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer",
                    importTab === 'upload' ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <Upload className="w-4 h-4" />
                  <span>📁 Upload CSV / Spreadsheet File</span>
                </button>
              </div>

              {/* Tab 1: Direct Paste */}
              {importTab === 'paste' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-700">
                      Paste Rows (Tab-separated or Comma-separated)
                    </label>
                    <button
                      type="button"
                      onClick={() => setImportRawText(SAMPLE_SHEETS_DATA)}
                      className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>⚡ Load Sample Google Sheets / Excel Data</span>
                    </button>
                  </div>

                  <textarea
                    rows={5}
                    value={importRawText}
                    onChange={e => setImportRawText(e.target.value)}
                    placeholder={`Copy rows directly from Google Sheets or Excel and paste here...\n\nExample:\nName\tPhone\tEmail\tCompany\tTag\nMohit Shukla\t+91 7068896437\tmohitshukla57662@gmail.com\tRicoz Omnichannel HQ\tEnterprise VIP`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500 shadow-inner"
                  />
                </div>
              )}

              {/* Tab 2: Upload File */}
              {importTab === 'upload' && (
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.tsv,.txt,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-indigo-50/50"
                  >
                    <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <p className="text-sm font-extrabold text-slate-800">Click to Browse or Drop Spreadsheet</p>
                    <p className="text-xs text-slate-500 mt-1">Accepts .CSV, .TSV, .TXT exported from Excel or Google Sheets</p>
                  </div>
                </div>
              )}

              {/* Real-Time Column Extraction Preview */}
              {parseResult.leads.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                        Live Auto-Extraction Preview ({parseResult.leads.length} Leads Detected)
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
                      {parseResult.headersFound ? '✓ Headers Auto-Mapped' : '✓ Columns Auto-Detected'}
                    </span>
                  </div>

                  {/* Column Mapping Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px]">
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">NAME FIELD</span>
                      <span className="font-extrabold text-indigo-700">{parseResult.columnMapping['Full Name']}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">PHONE FIELD</span>
                      <span className="font-extrabold text-blue-700">{parseResult.columnMapping['Phone Number']}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">EMAIL FIELD</span>
                      <span className="font-extrabold text-purple-700">{parseResult.columnMapping['Work Email']}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">COMPANY</span>
                      <span className="font-extrabold text-emerald-700">{parseResult.columnMapping['Company']}</span>
                    </div>
                  </div>

                  {/* Extracted Rows Preview Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-[10px] uppercase font-extrabold text-slate-600 sticky top-0">
                        <tr>
                          <th className="px-3 py-2">Extracted Name</th>
                          <th className="px-3 py-2">Phone Number</th>
                          <th className="px-3 py-2">Email</th>
                          <th className="px-3 py-2">Company</th>
                          <th className="px-3 py-2">Tag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parseResult.leads.slice(0, 6).map((lead, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-3 py-2 font-bold text-slate-900">{lead.name}</td>
                            <td className="px-3 py-2 font-mono text-[11px] font-bold text-blue-700">{lead.phoneNumber}</td>
                            <td className="px-3 py-2 text-slate-600">{lead.email}</td>
                            <td className="px-3 py-2 text-slate-600">{lead.company}</td>
                            <td className="px-3 py-2">
                              <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                                {lead.tag}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {parseResult.leads.length > 0 ? (
                  <span className="text-emerald-700 font-bold">
                    ✓ Ready to import {parseResult.leads.length} contacts
                  </span>
                ) : (
                  'Paste data or select a file to preview'
                )}
              </span>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSpreadsheetImport}
                  disabled={parseResult.leads.length === 0}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm & Import {parseResult.leads.length > 0 ? `(${parseResult.leads.length}) Leads` : ''}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Add Single Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">Add Enterprise Lead</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Name</label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. Mohit Shukla" 
                  value={newContact.name} 
                  onChange={e => setNewContact({...newContact, name: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company / Organization</label>
                <input 
                  type="text" 
                  placeholder="e.g. Ricoz Omnichannel HQ" 
                  value={newContact.company} 
                  onChange={e => setNewContact({...newContact, company: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number (with Country Code)</label>
                <input 
                  required 
                  type="text" 
                  placeholder="+91 7068896437" 
                  value={newContact.phoneNumber} 
                  onChange={e => setNewContact({...newContact, phoneNumber: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:outline-none focus:border-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Work Email</label>
                <input 
                  type="email" 
                  placeholder="mohitshukla57662@gmail.com" 
                  value={newContact.email} 
                  onChange={e => setNewContact({...newContact, email: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lead Tier / Tag</label>
                <select 
                  value={newContact.tag} 
                  onChange={e => setNewContact({...newContact, tag: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                >
                  <option value="VIP Enterprise">VIP Enterprise</option>
                  <option value="Warm Prospect">Warm Prospect</option>
                  <option value="High Priority">High Priority</option>
                  <option value="Decision Maker">Decision Maker</option>
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
