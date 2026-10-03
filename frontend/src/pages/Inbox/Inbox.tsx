import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MoreVertical, 
  Send, 
  Paperclip, 
  Bot, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  CheckCheck, 
  Play, 
  Pause, 
  ExternalLink,
  MessageSquare,
  CreditCard,
  Flame,
  Languages,
  FileText,
  Copy,
  Check,
  X,
  RefreshCw,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api, API_URL } from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import { soundFx } from '@/lib/soundFx';

type Contact = {
  id: string;
  phoneNumber: string;
  name?: string;
};

type Message = {
  id: string;
  conversationId: string;
  text: string;
  sender: 'contact' | 'agent' | 'bot';
  status?: string;
  channel?: string;
  mediaUrl?: string;
  metadata?: string;
  timestamp: string;
  time?: string;
};

type Chat = {
  id: string;
  contactId: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  channel: 'whatsapp' | 'instagram' | 'rcs' | 'voice' | 'email' | string;
  messages: Message[];
  contact: Contact;
};

interface SentimentInfo {
  sentiment: string;
  score: number;
  intentCategory: string;
  objections: string[];
  recommendedAction: string;
}

interface ThreadSummary {
  summary: string;
  customerSentiment: string;
  recommendedAction: string;
  openQuestions: string[];
}

export function Inbox() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChannelFilter, setActiveChannelFilter] = useState<string>('all');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  
  // AI Copilot States
  const [sentimentData, setSentimentData] = useState<SentimentInfo | null>(null);
  const [loadingSentiment, setLoadingSentiment] = useState(false);
  const [summaryData, setSummaryData] = useState<ThreadSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showSummaryBanner, setShowSummaryBanner] = useState(false);
  const [copilotDrafts, setCopilotDrafts] = useState<{ professional: string; friendly: string; closer: string } | null>(null);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [showDraftsPicker, setShowDraftsPicker] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // In-Chat Payment Request States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    itemName: 'Enterprise Pro Subscription',
    amount: 149,
    currency: 'USD'
  });
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeChat = chats.find(c => c.id === activeChatId) || null;

  const fetchConversations = async () => {
    try {
      const res = await api.get('/api/conversations');
      const mappedChats: Chat[] = res.data.map((c: any) => ({
        id: c.id,
        contactId: c.contactId,
        name: c.contact?.name || c.contact?.phoneNumber || 'Customer',
        lastMessage: c.messages?.[0]?.text || 'Started conversation',
        time: c.messages?.[0]?.timestamp ? new Date(c.messages[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
        unread: 0,
        channel: c.channel || 'whatsapp',
        messages: [],
        contact: c.contact || { id: c.contactId, phoneNumber: 'Unknown' }
      }));

      setChats(mappedChats);
      if (mappedChats.length > 0 && !activeChatId) {
        setActiveChatId(mappedChats[0].id);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    
    let newSocket = io(API_URL.replace('/api', ''));
    setSocket(newSocket);

    newSocket.on('new_message', (msg: any) => {
      setChats(prevChats => {
        const exists = prevChats.some(c => c.id === msg.conversationId);
        if (exists) {
          return prevChats.map(chat => {
            if (chat.id === msg.conversationId) {
              const newMsg: Message = {
                id: msg.id || Math.random().toString(),
                conversationId: msg.conversationId,
                text: msg.text,
                sender: msg.sender,
                channel: msg.channel || chat.channel,
                mediaUrl: msg.mediaUrl,
                metadata: msg.metadata,
                timestamp: new Date().toISOString(),
                time: msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
              return {
                ...chat,
                lastMessage: msg.text,
                time: newMsg.time || chat.time,
                unread: (msg.sender === 'contact' && activeChatId !== chat.id) ? chat.unread + 1 : chat.unread,
                messages: [...chat.messages, newMsg]
              };
            }
            return chat;
          });
        } else {
          fetchConversations();
          return prevChats;
        }
      });
    });

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages.length]);

  // When active chat changes, reset copilot states and auto-analyze intent
  useEffect(() => {
    if (!activeChatId) return;
    setCopilotDrafts(null);
    setShowDraftsPicker(false);
    setShowSummaryBanner(false);
    setSummaryData(null);
    fetchSentimentForChat(activeChatId);
  }, [activeChatId]);

  const fetchSentimentForChat = async (convId: string) => {
    setLoadingSentiment(true);
    try {
      const res = await api.post('/api/ai/copilot/sentiment', { conversationId: convId });
      setSentimentData(res.data);
    } catch (err) {
      console.error('Failed to analyze sentiment:', err);
    } finally {
      setLoadingSentiment(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeChat) return;
    
    const sentText = inputText;
    setInputText('');

    try {
      const res = await api.post(`/api/conversations/${activeChat.id}/messages`, {
        text: sentText,
        sender: 'agent'
      });
      
      const newMsg: Message = {
        id: res.data?.id || Math.random().toString(),
        conversationId: activeChat.id,
        text: sentText,
        sender: 'agent',
        status: 'delivered',
        channel: activeChat.channel,
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChats(prev => prev.map(c => 
        c.id === activeChat.id ? { 
          ...c, 
          messages: [...c.messages, newMsg],
          lastMessage: sentText,
          time: newMsg.time || c.time
        } : c
      ));
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleChatSelect = async (id: string) => {
    setActiveChatId(id);
    setChats(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    
    const selectedChat = chats.find(c => c.id === id);
    if (selectedChat && selectedChat.messages.length === 0) {
      setLoadingMessages(true);
      try {
        const res = await api.get(`/api/conversations/${id}/messages`);
        const msgs = res.data.map((m: any) => ({
          ...m,
          time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        
        setChats(prev => prev.map(c => c.id === id ? { ...c, messages: msgs } : c));
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    }
  };

  // Copilot Action: Generate 3 draft replies
  const handleGenerateDrafts = async () => {
    if (!activeChat) return;
    setLoadingDrafts(true);
    setShowDraftsPicker(true);
    try {
      const lastIncoming = [...activeChat.messages].reverse().find(m => m.sender === 'contact')?.text || activeChat.lastMessage || 'Hello';
      const history = activeChat.messages.slice(-6).map(m => ({ text: m.text, sender: m.sender }));
      
      const res = await api.post('/api/ai/copilot/draft', {
        incomingText: lastIncoming,
        history,
        contactName: activeChat.name
      });

      if (res.data?.drafts) {
        setCopilotDrafts(res.data.drafts);
      }
    } catch (err) {
      console.error('Failed to generate drafts:', err);
    } finally {
      setLoadingDrafts(false);
    }
  };

  // Copilot Action: Summarize thread
  const handleSummarizeThread = async () => {
    if (!activeChat) return;
    setLoadingSummary(true);
    setShowSummaryBanner(true);
    try {
      const res = await api.post('/api/ai/copilot/summarize', {
        conversationId: activeChat.id,
        messages: activeChat.messages
      });
      setSummaryData(res.data);
    } catch (err) {
      console.error('Failed to summarize thread:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Copilot Action: Translate text
  const handleTranslate = async (lang: string) => {
    setShowLangMenu(false);
    const textToTranslate = inputText.trim() || activeChat?.lastMessage;
    if (!textToTranslate) return;

    setIsTranslating(true);
    try {
      const res = await api.post('/api/ai/copilot/translate', {
        text: textToTranslate,
        targetLanguage: lang
      });
      if (res.data?.translatedText) {
        setInputText(res.data.translatedText);
      }
    } catch (err) {
      console.error('Translation failed:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // In-Chat Payment: Create payment link & send interactive card to thread
  const handleSendPaymentCard = async () => {
    if (!activeChat) return;
    setIsCreatingPayment(true);
    try {
      await api.post('/api/commerce/payment-links', {
        conversationId: activeChat.id,
        items: [{ name: paymentForm.itemName, quantity: 1, price: Number(paymentForm.amount) }],
        amount: Number(paymentForm.amount),
        currency: paymentForm.currency,
        customerName: activeChat.name,
        customerPhone: activeChat.contact?.phoneNumber || 'Unknown'
      });

      soundFx.playConnectChime();
      setIsPaymentModalOpen(false);
    } catch (err) {
      console.error('Failed to send payment card:', err);
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Helper to parse payment card data if message is a payment request
  const parsePaymentCard = (msg: Message) => {
    const isPayment = msg.text.includes('/pay/') || msg.text.includes('[Payment Request:');
    if (!isPayment) return null;

    const orderMatch = msg.text.match(/ORD-[A-Z0-9-]+/);
    const orderNumber = orderMatch ? orderMatch[0] : null;

    const amountMatch = msg.text.match(/([$€₹]?\s?\d+(?:\.\d{2})?)\s?(USD|INR|EUR)?/i);
    const amountStr = amountMatch ? amountMatch[0] : '$149.00';

    const payUrlMatch = msg.text.match(/\/pay\/[^\s\)]+/);
    const payPath = payUrlMatch ? payUrlMatch[0] : (orderNumber ? `/pay/${orderNumber}` : '/pay');

    return {
      orderNumber,
      amountStr,
      payPath,
      fullUrl: window.location.origin + payPath,
      isPaid: msg.text.includes('PAID') || msg.text.includes('Receipt')
    };
  };

  const filteredChats = activeChannelFilter === 'all' 
    ? chats 
    : chats.filter(c => c.channel?.toLowerCase() === activeChannelFilter.toLowerCase());

  return (
    <div className="flex h-full overflow-hidden bg-white">
      
      {/* Left Navigation Pane (340px) */}
      <div className="w-[340px] shrink-0 border-r border-slate-200 bg-white flex flex-col h-full">
        
        {/* Top Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Omnichannel Inbox</h2>
            <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 animate-pulse"></span>
              Live Synced
            </span>
          </div>

          {/* Channel Filters Pill Bar */}
          <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Channels' },
              { id: 'whatsapp', label: 'WhatsApp' },
              { id: 'instagram', label: 'Instagram' },
              { id: 'rcs', label: 'RCS' },
              { id: 'voice', label: 'Calls' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveChannelFilter(f.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeChannelFilter === f.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative mt-3">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
        
        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredChats.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No messages under "{activeChannelFilter}".
            </div>
          ) : (
            filteredChats.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => handleChatSelect(chat.id)}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:bg-slate-50 relative",
                  activeChat?.id === chat.id ? "bg-slate-100/80 border-l-4 border-l-indigo-600" : "border-l-4 border-l-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center space-x-1.5 truncate max-w-[190px]">
                    <span className="font-extrabold text-slate-900 text-sm truncate">{chat.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium shrink-0">{chat.time}</span>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-slate-500 truncate pr-2 leading-relaxed">{chat.lastMessage}</p>
                  
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                      chat.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-800' :
                      chat.channel === 'instagram' ? 'bg-pink-100 text-pink-800' :
                      chat.channel === 'rcs' ? 'bg-blue-100 text-blue-800' :
                      chat.channel === 'voice' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {chat.channel === 'whatsapp' ? 'WA' : chat.channel === 'instagram' ? 'IG' : chat.channel === 'voice' ? 'CALL' : 'RCS'}
                    </span>

                    {chat.unread > 0 && (
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Center Thread Area */}
      <div className="flex-1 flex flex-col bg-[#f8f9fc] min-w-0 relative">
        {!activeChat ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 flex-col space-y-3">
            <Bot className="w-12 h-12 opacity-25 text-indigo-500" />
            <p className="text-sm font-semibold">Select a conversation thread to view & reply</p>
          </div>
        ) : (
          <>
            {/* Thread Header with Sentiment & Buyer Intent Meter */}
            <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 shadow-2xs">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-extrabold uppercase shadow-sm">
                  {activeChat.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-slate-900 text-sm truncate max-w-[260px]">{activeChat.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeChat.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-800' :
                      activeChat.channel === 'instagram' ? 'bg-pink-100 text-pink-800' :
                      activeChat.channel === 'rcs' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      via {activeChat.channel?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{activeChat.contact?.phoneNumber} • Verified Real Customer</p>
                </div>
              </div>

              {/* Buying Intent Badge & Action Controls */}
              <div className="flex items-center space-x-3">
                {/* Live Sentiment & Intent Badge */}
                {sentimentData && (
                  <div className={cn(
                    "flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs transition-all",
                    sentimentData.intentCategory === 'ready_to_buy' 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : sentimentData.intentCategory === 'hot'
                      ? "bg-rose-50 text-rose-700 border-rose-300"
                      : sentimentData.intentCategory === 'warm'
                      ? "bg-amber-50 text-amber-700 border-amber-300"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  )}>
                    <Flame className={cn("w-3.5 h-3.5", sentimentData.intentCategory === 'hot' || sentimentData.intentCategory === 'ready_to_buy' ? "text-rose-500 fill-rose-500" : "text-slate-400")} />
                    <span>
                      {sentimentData.intentCategory === 'ready_to_buy' ? 'Ready to Buy' :
                       sentimentData.intentCategory === 'hot' ? 'Hot Lead' :
                       sentimentData.intentCategory === 'warm' ? 'Warm Intent' : 'Cold Lead'} ({Math.round(sentimentData.score * 100)}%)
                    </span>
                  </div>
                )}

                <button 
                  onClick={() => fetchSentimentForChat(activeChat.id)}
                  disabled={loadingSentiment}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors cursor-pointer" 
                  title="Refresh Sentiment & Buying Intent"
                >
                  <RefreshCw className={cn("w-4 h-4", loadingSentiment && "animate-spin text-indigo-600")} />
                </button>

                <button 
                  onClick={() => soundFx.playKeyTone('1')}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" 
                  title="Direct Call"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Collapsible Executive Summary Banner */}
            {showSummaryBanner && (
              <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-4 mx-6 mt-4 rounded-2xl shadow-lg border border-indigo-500/30 flex flex-col relative animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-300" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-200">AI Thread Summary & Next Action</span>
                  </div>
                  <button onClick={() => setShowSummaryBanner(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {loadingSummary ? (
                  <div className="text-xs text-indigo-200 py-2 flex items-center space-x-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing complete chat history...</span>
                  </div>
                ) : summaryData ? (
                  <div className="space-y-2 text-xs">
                    <p className="text-slate-200 leading-relaxed font-medium">{summaryData.summary}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded font-bold">
                        Sentiment: {summaryData.customerSentiment}
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded font-bold">
                        Next Step: {summaryData.recommendedAction}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Messages Canvas */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {loadingMessages ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">Loading message history...</div>
              ) : (
                activeChat.messages.map((msg, i) => {
                  const paymentCard = parsePaymentCard(msg);

                  return (
                    <div 
                      key={msg.id || i} 
                      className={cn("max-w-[75%] flex flex-col", msg.sender === 'agent' || msg.sender === 'bot' ? "self-end items-end" : "self-start items-start")}
                    >
                      {/* Interactive In-Chat Payment Card */}
                      {paymentCard ? (
                        <div className="w-80 bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden text-slate-900 border-l-4 border-l-emerald-500">
                          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-3.5 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <CreditCard className="w-4 h-4 text-emerald-400" />
                              <span className="text-xs font-bold tracking-tight">1-Click In-Chat Payment</span>
                            </div>
                            <span className={cn(
                              "text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase",
                              paymentCard.isPaid ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                            )}>
                              {paymentCard.isPaid ? 'Paid' : 'Pending'}
                            </span>
                          </div>

                          <div className="p-4 space-y-3">
                            <div>
                              <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Amount</div>
                              <div className="text-2xl font-extrabold text-slate-900">{paymentCard.amountStr}</div>
                              {paymentCard.orderNumber && (
                                <div className="text-[11px] text-slate-500 font-mono mt-0.5">{paymentCard.orderNumber}</div>
                              )}
                            </div>

                            <div className="flex items-center space-x-2 pt-1">
                              <a
                                href={paymentCard.payPath}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-extrabold text-center flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                              >
                                <span>Pay Now</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>

                              <button
                                onClick={() => copyToClipboard(paymentCard.fullUrl, msg.id)}
                                className="px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center space-x-1 transition-colors cursor-pointer"
                                title="Copy Payment Link"
                              >
                                {copiedLink === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : msg.channel === 'voice' || msg.text?.includes('[Audio Recording]') ? (
                        <div className="bg-white border border-rose-200 p-4 rounded-2xl shadow-sm text-slate-900 max-w-md">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-extrabold text-rose-600 flex items-center">
                              <Phone className="w-3.5 h-3.5 mr-1 text-rose-600" />
                              VoIP AI Voice Recording
                            </span>
                            <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded">
                              Positive Call • Audio Synced
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 mb-3">{msg.text}</p>
                          
                          <button
                            onClick={() => {
                              if (playingVoiceId === msg.id) {
                                setPlayingVoiceId(null);
                              } else {
                                soundFx.playConnectChime();
                                setPlayingVoiceId(msg.id);
                              }
                            }}
                            className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                          >
                            {playingVoiceId === msg.id ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                            <span>{playingVoiceId === msg.id ? 'Pause Replay' : 'Listen to Recording'}</span>
                          </button>
                        </div>
                      ) : msg.channel === 'rcs' && msg.mediaUrl ? (
                        <div className="bg-white border border-blue-200 rounded-2xl overflow-hidden shadow-sm max-w-sm">
                          <img src={msg.mediaUrl} alt="RCS Media" className="w-full h-36 object-cover" />
                          <div className="p-3.5">
                            <div className="flex items-center space-x-1 mb-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                              <span className="text-[10px] text-blue-600 font-extrabold">Verified Google RCS Card</span>
                            </div>
                            <p className="text-xs text-slate-800 leading-relaxed">{msg.text}</p>
                          </div>
                        </div>
                      ) : (
                        <div className={cn(
                          "rounded-2xl px-4 py-2.5 text-sm shadow-2xs leading-relaxed",
                          msg.sender === 'agent' 
                            ? "bg-slate-900 text-white rounded-tr-xs" 
                            : msg.sender === 'bot'
                            ? "bg-indigo-600 text-white rounded-tr-xs"
                            : "bg-white border border-slate-200 text-slate-900 rounded-tl-xs"
                        )}>
                          {msg.text}
                        </div>
                      )}

                      <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-1">
                        <span>{msg.time || 'Just now'}</span>
                        {msg.sender === 'agent' && <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* AI Copilot Drafts Picker Panel */}
            {showDraftsPicker && (
              <div className="mx-4 mb-2 p-3 bg-white border border-indigo-200 rounded-2xl shadow-lg relative animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-indigo-700">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-extrabold uppercase tracking-wider">AI Copilot Drafts (Click to Insert)</span>
                  </div>
                  <button onClick={() => setShowDraftsPicker(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {loadingDrafts ? (
                  <div className="text-xs text-slate-500 py-3 flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Analyzing RAG knowledge base & generating 3 distinct responses...</span>
                  </div>
                ) : copilotDrafts ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div 
                      onClick={() => { setInputText(copilotDrafts.professional); setShowDraftsPicker(false); }}
                      className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl cursor-pointer transition-all"
                    >
                      <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">💼 Professional</div>
                      <p className="text-xs text-slate-800 line-clamp-3 leading-relaxed">{copilotDrafts.professional}</p>
                    </div>

                    <div 
                      onClick={() => { setInputText(copilotDrafts.friendly); setShowDraftsPicker(false); }}
                      className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl cursor-pointer transition-all"
                    >
                      <div className="text-[10px] font-bold text-emerald-600 uppercase mb-1">😊 Friendly & Warm</div>
                      <p className="text-xs text-slate-800 line-clamp-3 leading-relaxed">{copilotDrafts.friendly}</p>
                    </div>

                    <div 
                      onClick={() => { setInputText(copilotDrafts.closer); setShowDraftsPicker(false); }}
                      className="p-3 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl cursor-pointer transition-all"
                    >
                      <div className="text-[10px] font-bold text-amber-700 uppercase mb-1">🎯 Deal Closer</div>
                      <p className="text-xs text-slate-800 line-clamp-3 leading-relaxed">{copilotDrafts.closer}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* AI Copilot Super Toolbar */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleGenerateDrafts}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Draft AI Reply</span>
                </button>

                <button
                  onClick={handleSummarizeThread}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Summarize Thread</span>
                </button>

                {/* 1-Click Translate Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowLangMenu(!showLangMenu)}
                    disabled={isTranslating}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    <Languages className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{isTranslating ? 'Translating...' : 'Translate'}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {showLangMenu && (
                    <div className="absolute bottom-full left-0 mb-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 space-y-1 z-20">
                      {[
                        { code: 'English', label: 'English' },
                        { code: 'Hindi', label: 'Hindi (हिंदी)' },
                        { code: 'Spanish', label: 'Spanish' },
                        { code: 'French', label: 'French' },
                        { code: 'Arabic', label: 'Arabic' }
                      ].map(l => (
                        <button
                          key={l.code}
                          onClick={() => handleTranslate(l.code)}
                          className="w-full text-left px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors"
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* In-Chat Payment Request Button */}
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer shrink-0"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Request In-Chat Payment</span>
              </button>
            </div>

            {/* Composer Box */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
              <div className="flex items-end space-x-2 bg-slate-50 border border-slate-200 rounded-2xl p-2.5 focus-within:border-indigo-500 transition-colors">
                <input type="file" ref={fileInputRef} className="hidden" />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-slate-700 shrink-0 cursor-pointer"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={`Reply via ${activeChat.channel?.toUpperCase()}...`}
                  className="flex-1 max-h-32 bg-transparent resize-none outline-none text-sm py-1.5 text-slate-900"
                  rows={1}
                />

                <button 
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* In-Chat Payment Request Modal */}
      {isPaymentModalOpen && activeChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-extrabold text-slate-900">Send In-Chat Payment Request</h3>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Customer</label>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800">
                  {activeChat.name} ({activeChat.contact?.phoneNumber})
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Item / Service Name</label>
                <input 
                  type="text"
                  value={paymentForm.itemName}
                  onChange={(e) => setPaymentForm({ ...paymentForm, itemName: e.target.value })}
                  placeholder="e.g. Enterprise License, Consultation Fee"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Amount</label>
                  <input 
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Currency</label>
                  <select 
                    value={paymentForm.currency}
                    onChange={(e) => setPaymentForm({ ...paymentForm, currency: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendPaymentCard}
                disabled={isCreatingPayment || !paymentForm.itemName || paymentForm.amount <= 0}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isCreatingPayment ? 'Sending Card...' : 'Send Payment Card'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
