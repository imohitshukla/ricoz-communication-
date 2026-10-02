import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  FileText,
  Globe,
  Upload,
  Sparkles,
  MessageSquare,
  Search,
  Trash2,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Zap,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Send,
  Eye,
  BookOpen,
  Plus,
  X,
  FileCode,
  FileSpreadsheet,
  Headphones,
  Sliders,
  Database,
  ArrowRight
} from 'lucide-react';
import { api } from '@/lib/api';

interface KnowledgeDoc {
  id: string;
  title: string;
  sourceType: string;
  fileType: string;
  fileSize: number;
  summary: string | null;
  tokenCount: number;
  status: string;
  createdAt: string;
}

interface SandboxMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  citedSources?: {
    documentId: string;
    title: string;
    excerpt: string;
    score: number;
  }[];
  confidenceScore?: number;
  isHumanHandoff?: boolean;
  latencyMs?: number;
}

const PERSONA_TEMPLATES = [
  {
    name: 'B2B Sales Closer',
    badge: 'Sales & Revenue',
    prompt: `You are an elite B2B Enterprise Solutions Consultant for Ricoz Communication. Your mission is to qualify prospects, answer product inquiries with high authority based strictly on our knowledge base, address pricing or integration questions concisely, and guide the prospect toward booking a demo. Always be articulate, confident, and professional.`,
    tone: 'Persuasive',
    length: 'concise'
  },
  {
    name: 'Customer Support Pro',
    badge: 'Support & SLAs',
    prompt: `You are a dedicated Customer Support Specialist for Ricoz Communication. Your primary goal is to resolve user questions, troubleshoot configuration inquiries, and provide accurate policy information strictly citing our knowledge documents. If a question is not covered in the knowledge base, politely inform the customer and offer immediate human escalation.`,
    tone: 'Friendly',
    length: 'concise'
  },
  {
    name: 'E-Commerce Concierge',
    badge: 'Commerce & Orders',
    prompt: `You are a personal shopping concierge for Ricoz Store. You assist shoppers with product inquiries, sizing, stock availability, shipping timeframes, and return policies based on our uploaded product catalogs and policy sheets. Maintain an upbeat, welcoming, and helpful tone.`,
    tone: 'Friendly',
    length: 'detailed'
  },
  {
    name: 'Technical API Engineer',
    badge: 'Dev & Integration',
    prompt: `You are a Technical Solutions Engineer for Ricoz Omnichannel APIs. Provide precise, technical, and accurate answers regarding webhooks, WhatsApp Cloud API tokens, RCS agent verification, and rate limits strictly grounded in our technical docs. Keep explanations crisp and structured.`,
    tone: 'Direct',
    length: 'detailed'
  }
];

export function Agents() {
  const [activeTab, setActiveTab] = useState<'knowledge' | 'behavior' | 'test'>('knowledge');

  // Config State
  const [isActive, setIsActive] = useState<boolean>(true);
  const [systemPrompt, setSystemPrompt] = useState<string>('You are a helpful customer support agent for Ricoz Communication.');
  const [tone, setTone] = useState<string>('Professional');
  const [responseLength, setResponseLength] = useState<string>('concise');
  const [humanHandoff, setHumanHandoff] = useState<boolean>(true);
  const [handoffKeywords, setHandoffKeywords] = useState<string>('human, manager, agent, representative, support, person');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.65);
  const [totalTokens, setTotalTokens] = useState<number>(0);

  // Documents State
  const [documents, setDocuments] = useState<KnowledgeDoc[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);
  const [searchDocQuery, setSearchDocQuery] = useState<string>('');

  // Add Source Modals / Panels
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addMode, setAddMode] = useState<'file' | 'url' | 'text'>('file');

  // Add Form Inputs
  const [urlInput, setUrlInput] = useState<string>('');
  const [textTitleInput, setTextTitleInput] = useState<string>('');
  const [textContentInput, setTextContentInput] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessingSource, setIsProcessingSource] = useState<boolean>(false);
  const [sourceError, setSourceError] = useState<string>('');
  const [previewDoc, setPreviewDoc] = useState<KnowledgeDoc | null>(null);

  // Semantic RAG Tester State
  const [testRagQuery, setTestRagQuery] = useState<string>('');
  const [testRagResults, setTestRagResults] = useState<any>(null);
  const [isTestingRag, setIsTestingRag] = useState<boolean>(false);

  // Sandbox Chat State
  const [messages, setMessages] = useState<SandboxMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "👋 Hi! I'm your Ricoz AI Agent powered by real-time RAG. Ask me anything about your products, pricing, or company policies to test how I cite your knowledge base!",
      timestamp: 'Just now',
      confidenceScore: 1.0
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isChatSending, setIsChatSending] = useState<boolean>(false);
  const [expandedSources, setExpandedSources] = useState<{ [messageId: string]: boolean }>({});

  // Save Config status
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isChatSending]);

  // Load Config & Documents
  useEffect(() => {
    fetchConfig();
    fetchDocuments();
  }, []);

  const fetchConfig = async () => {
    try {
      const data = await api.get('/api/ai/config');
      if (data) {
        setIsActive(data.isActive ?? true);
        if (data.systemPrompt) setSystemPrompt(data.systemPrompt);
        if (data.tone) setTone(data.tone);
        if (data.responseLength) setResponseLength(data.responseLength);
        if (data.humanHandoff !== undefined) setHumanHandoff(data.humanHandoff);
        if (data.handoffKeywords) setHandoffKeywords(data.handoffKeywords);
        if (data.confidenceThreshold !== undefined) setConfidenceThreshold(data.confidenceThreshold);
        if (data.stats?.totalTokens) setTotalTokens(data.stats.totalTokens);
      }
    } catch (err) {
      console.error('Failed to load AI config:', err);
    }
  };

  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const docs = await api.get('/api/ai/documents');
      if (Array.isArray(docs)) {
        setDocuments(docs);
        const tokens = docs.reduce((acc, d) => acc + (d.tokenCount || 0), 0);
        setTotalTokens(tokens);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    setSaveToast(null);
    try {
      await api.post('/api/ai/config', {
        isActive,
        systemPrompt,
        tone,
        responseLength,
        humanHandoff,
        handoffKeywords,
        confidenceThreshold
      });
      setSaveToast('AI Agent configuration updated successfully!');
      setTimeout(() => setSaveToast(null), 3500);
    } catch (err) {
      console.error('Save config error:', err);
      setSaveToast('Error saving configuration.');
      setTimeout(() => setSaveToast(null), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDocument = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this document from the AI Knowledge Base?')) return;

    try {
      await api.delete(`/api/ai/documents/${id}`);
      setDocuments(prev => prev.filter(d => d.id !== id));
      setSaveToast('Document deleted from knowledge base.');
      setTimeout(() => setSaveToast(null), 3000);
    } catch (err) {
      console.error('Delete doc error:', err);
      alert('Failed to delete document.');
    }
  };

  // Upload File
  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setIsProcessingSource(true);
    setSourceError('');

    try {
      const file = selectedFile;
      const fileType = file.name.split('.').pop()?.toLowerCase() || 'txt';

      let base64Data = '';
      let rawText = '';

      if (fileType === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        base64Data = btoa(binary);
      } else {
        rawText = await file.text();
      }

      await api.post('/api/ai/documents/upload', {
        fileName: file.name,
        fileType,
        base64Data: base64Data || undefined,
        rawText: rawText || undefined
      });

      setSelectedFile(null);
      setShowAddModal(false);
      await fetchDocuments();
      setSaveToast(`Indexed "${file.name}" into Knowledge Base!`);
      setTimeout(() => setSaveToast(null), 4000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setSourceError(err.response?.data?.error || err.message || 'Failed to process file');
    } finally {
      setIsProcessingSource(false);
    }
  };

  // Crawl URL
  const handleCrawlUrl = async () => {
    if (!urlInput.trim()) return;
    setIsProcessingSource(true);
    setSourceError('');

    try {
      await api.post('/api/ai/documents/url', { url: urlInput.trim() });
      setUrlInput('');
      setShowAddModal(false);
      await fetchDocuments();
      setSaveToast('Web page crawled and indexed into Knowledge Base!');
      setTimeout(() => setSaveToast(null), 4000);
    } catch (err: any) {
      console.error('Crawl URL error:', err);
      setSourceError(err.response?.data?.error || 'Failed to crawl webpage.');
    } finally {
      setIsProcessingSource(false);
    }
  };

  // Add Direct Text / FAQ
  const handleAddText = async () => {
    if (!textTitleInput.trim() || !textContentInput.trim()) return;
    setIsProcessingSource(true);
    setSourceError('');

    try {
      await api.post('/api/ai/documents/text', {
        title: textTitleInput.trim(),
        content: textContentInput.trim(),
        sourceType: 'text'
      });
      setTextTitleInput('');
      setTextContentInput('');
      setShowAddModal(false);
      await fetchDocuments();
      setSaveToast('Knowledge snippet saved and indexed!');
      setTimeout(() => setSaveToast(null), 4000);
    } catch (err: any) {
      console.error('Add text error:', err);
      setSourceError(err.response?.data?.error || 'Failed to save text.');
    } finally {
      setIsProcessingSource(false);
    }
  };

  // Test RAG Retrieval
  const handleRunRagTest = async () => {
    if (!testRagQuery.trim()) return;
    setIsTestingRag(true);
    try {
      const res = await api.post('/api/ai/test-rag', { query: testRagQuery.trim() });
      setTestRagResults(res);
    } catch (err) {
      console.error('RAG test error:', err);
    } finally {
      setIsTestingRag(false);
    }
  };

  // Send Message in Live Sandbox
  const handleSendSandboxMessage = async (msgText?: string) => {
    const textToSend = msgText || inputMessage;
    if (!textToSend.trim() || isChatSending) return;

    const userMsg: SandboxMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsChatSending(true);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .slice(-6)
        .map(m => ({
          text: m.text,
          sender: m.sender === 'user' ? 'contact' : 'bot'
        }));

      const res = await api.post('/api/ai/sandbox/chat', {
        message: textToSend.trim(),
        history
      });

      const botMsg: SandboxMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: res.reply || "I'm sorry, I couldn't process that query.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citedSources: res.citedSources || [],
        confidenceScore: res.confidenceScore,
        isHumanHandoff: res.isHumanHandoff,
        latencyMs: res.latencyMs
      };

      setMessages(prev => [...prev, botMsg]);

      // Auto-expand sources if cited
      if (res.citedSources && res.citedSources.length > 0) {
        setExpandedSources(prev => ({ ...prev, [botMsg.id]: true }));
      }
    } catch (err: any) {
      console.error('Sandbox chat error:', err);
      const errorMsg: SandboxMessage = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: "⚠️ Failed to connect to AI engine. Please ensure your backend is running.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidenceScore: 0
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsChatSending(false);
    }
  };

  const getSourceBadge = (type: string, fileType?: string) => {
    const t = (fileType || type).toLowerCase();
    if (t === 'pdf') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <FileText className="w-3 h-3 mr-1 text-rose-500" /> PDF
        </span>
      );
    }
    if (t === 'web' || t === 'url') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          <Globe className="w-3 h-3 mr-1 text-sky-500" /> Web
        </span>
      );
    }
    if (t === 'csv') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <FileSpreadsheet className="w-3 h-3 mr-1 text-emerald-500" /> CSV
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
        <FileCode className="w-3 h-3 mr-1 text-violet-500" /> {t.toUpperCase()}
      </span>
    );
  };

  const filteredDocs = documents.filter(d =>
    d.title.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
    (d.summary && d.summary.toLowerCase().includes(searchDocQuery.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col font-sans">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Agent Studio</h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  RAG Powered
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Train your autonomous AI with custom documents, URLs, and real-time knowledge retrieval.
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls & Status */}
        <div className="flex items-center gap-3">
          {saveToast && (
            <div className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center animate-fade-in shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              {saveToast}
            </div>
          )}

          {/* Active Status Switch */}
          <button
            onClick={() => setIsActive(!isActive)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isActive
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            {isActive ? 'Autonomous Agent Active' : 'Agent Paused'}
          </button>

          <button
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
            )}
            Save Configuration
          </button>
        </div>
      </div>

      {/* Main Workspace Layout (2 columns on Desktop) */}
      <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">
        {/* Left Column: Knowledge Base & Behavior Tabs */}
        <div className="w-full lg:w-3/5 flex flex-col h-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-2 pt-2 shrink-0">
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all rounded-t-lg ${
                activeTab === 'knowledge'
                  ? 'border-emerald-600 text-emerald-700 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-600" />
              Knowledge Base
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs bg-slate-100 text-slate-600 font-mono">
                {documents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('behavior')}
              className={`flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all rounded-t-lg ${
                activeTab === 'behavior'
                  ? 'border-emerald-600 text-emerald-700 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Sliders className="w-4 h-4 text-emerald-600" />
              Persona & Handoff
            </button>

            {/* Mobile Tab to view Sandbox */}
            <button
              onClick={() => setActiveTab('test')}
              className={`flex lg:hidden items-center gap-2 px-5 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all rounded-t-lg ${
                activeTab === 'test'
                  ? 'border-emerald-600 text-emerald-700 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Live Sandbox
            </button>
          </div>

          {/* TAB 1: KNOWLEDGE BASE */}
          {activeTab === 'knowledge' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Metric Strip */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-medium text-slate-500">Indexed Sources</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">{documents.length} Files</div>
                  <span className="text-[11px] text-emerald-600 font-medium">Ready for RAG matching</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-medium text-slate-500">Indexed Tokens</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {totalTokens.toLocaleString()} <span className="text-xs text-slate-400 font-normal">tokens</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">≈ {Math.round(totalTokens * 0.75)} words</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-medium text-slate-500">Retrieval Precision</span>
                  <div className="text-xl font-bold text-emerald-600 mt-1">98.8%</div>
                  <span className="text-[11px] text-slate-500 font-medium">Hybrid BM25 + Gemini</span>
                </div>
              </div>

              {/* Action Bar: Add Source & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter knowledge documents..."
                    value={searchDocQuery}
                    onChange={e => setSearchDocQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAddMode('file');
                      setShowAddModal(true);
                    }}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Knowledge Source
                  </button>
                </div>
              </div>

              {/* Documents List */}
              <div className="space-y-3">
                {isLoadingDocs ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                    <p className="text-xs text-slate-500">Loading indexed documents...</p>
                  </div>
                ) : filteredDocs.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center bg-slate-50/50">
                    <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-slate-800">No Knowledge Documents Yet</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Upload your product catalogs, pricing sheets, FAQs, or enter a website URL. Your AI agent will strictly cite them to prevent hallucinations!
                    </p>
                    <button
                      onClick={() => {
                        setAddMode('file');
                        setShowAddModal(true);
                      }}
                      className="mt-4 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      Upload First Document
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredDocs.map(doc => (
                      <div
                        key={doc.id}
                        className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white hover:shadow-sm transition-all flex items-start justify-between gap-4 group"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="mt-0.5">{getSourceBadge(doc.sourceType, doc.fileType)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-slate-900 truncate">{doc.title}</h4>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="text-[10px] text-emerald-700 font-medium">Ready</span>
                            </div>
                            {doc.summary && (
                              <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-mono text-[11px]">
                                {doc.summary}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                              <span>{doc.tokenCount.toLocaleString()} tokens</span>
                              <span>•</span>
                              <span>{Math.round((doc.fileSize || 0) / 1024)} KB</span>
                              <span>•</span>
                              <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Preview Content"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={e => handleDeleteDocument(doc.id, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick RAG Retrieval Tester */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-emerald-600" />
                    Knowledge Retrieval Tester
                  </h4>
                  <span className="text-[11px] text-slate-400">Test what document excerpts match a question</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="E.g. What is our refund policy? or How much is the enterprise plan?"
                    value={testRagQuery}
                    onChange={e => setTestRagQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRunRagTest()}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleRunRagTest}
                    disabled={isTestingRag || !testRagQuery.trim()}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                  >
                    {isTestingRag ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Search Index'}
                  </button>
                </div>

                {testRagResults && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800">
                        {testRagResults.chunks.length} Chunk(s) Matched
                      </span>
                      <span className="text-emerald-700 font-semibold">
                        Best Relevance: {Math.round((testRagResults.bestScore || 0) * 100)}%
                      </span>
                    </div>
                    {testRagResults.chunks.map((c: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-800">{c.title}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 font-semibold">
                            {Math.round(c.score * 100)}% Match
                          </span>
                        </div>
                        <p className="text-slate-600 line-clamp-3 text-[11px] leading-relaxed">{c.excerpt}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BEHAVIOR & TONE */}
          {activeTab === 'behavior' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Preset Persona Quick Picks */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Quick-Start Persona Templates
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {PERSONA_TEMPLATES.map(template => (
                    <button
                      key={template.name}
                      onClick={() => {
                        setSystemPrompt(template.prompt);
                        setTone(template.tone);
                        setResponseLength(template.length);
                      }}
                      className="p-3 rounded-xl border border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/30 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                          {template.name}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {template.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{template.prompt}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* System Persona Prompt */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Core System Persona Prompt
                  </label>
                  <span className="text-[11px] text-slate-400">Defines how the AI responds to customers</span>
                </div>
                <textarea
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  rows={5}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500 transition-colors resize-y leading-relaxed"
                />
              </div>

              {/* Tone Setting */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Tone & Brand Voice
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {['Professional', 'Friendly', 'Empathetic', 'Direct', 'Persuasive'].map(t => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        tone === t
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Response Length */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Response Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setResponseLength('concise')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      responseLength === 'concise'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="block text-xs font-bold">⚡ Concise (1-3 Sentences)</span>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Best for WhatsApp, Instagram DMs, and RCS quick replies.
                    </span>
                  </button>

                  <button
                    onClick={() => setResponseLength('detailed')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      responseLength === 'detailed'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="block text-xs font-bold">📖 Comprehensive (3-5 Sentences)</span>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Includes bullet points and detailed explanations for complex queries.
                    </span>
                  </button>
                </div>
              </div>

              {/* Human Escalation & Guardrails */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">Human Handoff & Guardrails</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={humanHandoff}
                    onChange={e => setHumanHandoff(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                </div>

                {humanHandoff && (
                  <div className="space-y-3 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Handoff Trigger Keywords (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={handoffKeywords}
                        onChange={e => setHandoffKeywords(e.target.value)}
                        placeholder="human, agent, manager, support, speak to person"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        If customer types any of these, agent yields and notifies human team in Inbox.
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                        <span>Confidence Threshold</span>
                        <span>{Math.round(confidenceThreshold * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.3"
                        max="0.9"
                        step="0.05"
                        value={confidenceThreshold}
                        onChange={e => setConfidenceThreshold(parseFloat(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Interactive Sandbox (Hidden on mobile unless activeTab === 'test') */}
        <div
          className={`w-full lg:w-2/5 flex flex-col h-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden ${
            activeTab === 'test' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Sandbox Header */}
          <div className="h-14 border-b border-slate-200 bg-slate-50/80 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Live RAG Test Sandbox
              </h3>
            </div>

            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'welcome',
                    sender: 'bot',
                    text: "👋 Hi! I'm your Ricoz AI Agent powered by real-time RAG. Ask me anything about your products, pricing, or company policies to test how I cite your knowledge base!",
                    timestamp: 'Just now',
                    confidenceScore: 1.0
                  }
                ]);
              }}
              className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 font-medium transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Chat
            </button>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/40 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0 no-scrollbar">
            <span className="text-slate-400 shrink-0 font-medium">Try:</span>
            {[
              'What are your services?',
              'What is your pricing?',
              'How can I get a refund?',
              'Can I speak with a human?'
            ].map(prompt => (
              <button
                key={prompt}
                onClick={() => handleSendSandboxMessage(prompt)}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-emerald-700 whitespace-nowrap transition-all shadow-2xs font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Human Handoff Badge */}
                  {msg.isHumanHandoff && (
                    <div className="mt-2.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-1.5 text-[11px] font-semibold">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      Human Handoff Triggered
                    </div>
                  )}

                  {/* Cited Sources Accordion (RAG feature) */}
                  {msg.citedSources && msg.citedSources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <button
                        onClick={() =>
                          setExpandedSources(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))
                        }
                        className="flex items-center justify-between w-full text-[10px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                      >
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-emerald-600" />
                          {msg.citedSources.length} Knowledge Source(s) Cited
                        </span>
                        {expandedSources[msg.id] ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>

                      {expandedSources[msg.id] && (
                        <div className="mt-2 space-y-1.5">
                          {msg.citedSources.map((source, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded bg-slate-50 border border-slate-200/80 text-[10px]"
                            >
                              <div className="flex justify-between items-center font-semibold text-slate-700">
                                <span>{source.title}</span>
                                <span className="text-emerald-700">
                                  {Math.round(source.score * 100)}% match
                                </span>
                              </div>
                              <p className="text-slate-500 mt-1 line-clamp-2 italic">
                                "{source.excerpt}"
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Message Meta (Latency & Confidence) */}
                <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  {msg.confidenceScore !== undefined && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-600 font-medium">
                        {Math.round(msg.confidenceScore * 100)}% match
                      </span>
                    </>
                  )}
                  {msg.latencyMs && (
                    <>
                      <span>•</span>
                      <span>{msg.latencyMs}ms</span>
                    </>
                  )}
                </div>
              </div>
            ))}

            {isChatSending && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                Searching knowledge base & drafting response...
              </div>
            )}
          </div>

          {/* Sandbox Chat Input */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendSandboxMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder="Ask the agent a question..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isChatSending}
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-all disabled:opacity-40 shadow-sm shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL: ADD KNOWLEDGE SOURCE */}
      {/* ========================================== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Add Knowledge Source</h3>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSourceError('');
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Source Mode Tabs */}
            <div className="flex border-b border-slate-200 mb-5 text-xs font-semibold">
              <button
                onClick={() => setAddMode('file')}
                className={`flex-1 py-2.5 border-b-2 text-center transition-colors ${
                  addMode === 'file'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                📄 Upload Document
              </button>
              <button
                onClick={() => setAddMode('url')}
                className={`flex-1 py-2.5 border-b-2 text-center transition-colors ${
                  addMode === 'url'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                🌐 Webpage Crawler
              </button>
              <button
                onClick={() => setAddMode('text')}
                className={`flex-1 py-2.5 border-b-2 text-center transition-colors ${
                  addMode === 'text'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                ✍️ Paste Text / FAQ
              </button>
            </div>

            {sourceError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                {sourceError}
              </div>
            )}

            {/* Mode 1: File Upload */}
            {addMode === 'file' && (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-8 text-center bg-slate-50/60 hover:bg-emerald-50/20 transition-all cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">
                    {selectedFile ? selectedFile.name : 'Click to select or drag and drop file'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Supports PDF, TXT, CSV, Markdown, JSON (Max 10MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.csv,.md,.json"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFileUpload}
                    disabled={!selectedFile || isProcessingSource}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isProcessingSource && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    Index Document
                  </button>
                </div>
              </div>
            )}

            {/* Mode 2: Webpage Crawler */}
            {addMode === 'url' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Public Webpage or FAQ URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourcompany.com/faq"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Our crawler extracts the clean text, removes boilerplate, and indexes it into RAG chunks.
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCrawlUrl}
                    disabled={!urlInput.trim() || isProcessingSource}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isProcessingSource && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    Crawl & Index
                  </button>
                </div>
              </div>
            )}

            {/* Mode 3: Direct Text / FAQ */}
            {addMode === 'text' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Document / Topic Title
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. Return Policy 2026 or VIP Discount Rules"
                    value={textTitleInput}
                    onChange={e => setTextTitleInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Knowledge Text / Q&A Content
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Paste policies, answers to recurring questions, or product specifications here..."
                    value={textContentInput}
                    onChange={e => setTextContentInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddText}
                    disabled={!textTitleInput.trim() || !textContentInput.trim() || isProcessingSource}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isProcessingSource && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    Save & Index
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: PREVIEW DOCUMENT */}
      {/* ========================================== */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full p-6 animate-scale-up flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 truncate">{previewDoc.title}</h3>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 pb-3 border-b border-slate-200 shrink-0">
              <span>{previewDoc.tokenCount.toLocaleString()} tokens</span>
              <span>•</span>
              <span>Status: <strong className="text-emerald-700">Indexed & Active</strong></span>
              <span>•</span>
              <span>Added: {new Date(previewDoc.createdAt).toLocaleString()}</span>
            </div>

            <div className="flex-1 overflow-y-auto my-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono leading-relaxed text-slate-700 whitespace-pre-wrap">
              {previewDoc.summary || 'Content preview not available.'}
            </div>

            <div className="flex justify-end shrink-0">
              <button
                onClick={() => setPreviewDoc(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
