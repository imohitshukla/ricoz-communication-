import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MoreVertical, 
  Send, 
  Paperclip, 
  Bot, 
  Phone, 
  Camera, 
  ShieldCheck, 
  Sparkles, 
  CheckCheck, 
  Play, 
  Pause, 
  CheckCircle2, 
  ExternalLink,
  MessageSquare,
  Volume2,
  Clock,
  UserCheck
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

export function Inbox() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChannelFilter, setActiveChannelFilter] = useState<string>('all');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeChat = chats.find(c => c.id === activeChatId) || null;

  // AI Copilot Quick Suggestion Pills
  const copilotSuggestions = [
    "I'd be glad to assist you with that right away!",
    "Here is your exclusive 30% discount link: https://ricoz.io/pricing?code=VIP30",
    "Would Thursday at 11:00 AM EST work for a 15-minute live demo?",
    "Connecting you with our sales engineering specialist now."
  ];

  const fetchConversations = async () => {
    try {
      const res = await api.get('/api/conversations');
      const mappedChats: Chat[] = res.data.map((c: any) => ({
        id: c.id,
        contactId: c.contactId,
        name: c.contact.name || c.contact.phoneNumber,
        lastMessage: c.messages[0]?.text || 'Started conversation',
        time: c.messages[0]?.timestamp ? new Date(c.messages[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
        unread: 0,
        channel: c.channel || 'whatsapp',
        messages: [],
        contact: c.contact
      }));

      setChats(mappedChats);
      if (mappedChats.length > 0) {
        setActiveChatId(mappedChats[0].id);
      } else {
        setActiveChatId(null);
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
                id: msg.id,
                conversationId: msg.conversationId,
                text: msg.text,
                sender: msg.sender,
                channel: msg.channel,
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
              { id: 'whatsapp', label: 'WhatsApp', color: 'emerald' },
              { id: 'instagram', label: 'Instagram', color: 'pink' },
              { id: 'rcs', label: 'RCS', color: 'blue' },
              { id: 'voice', label: 'Calls', color: 'rose' },
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
                    {/* Channel Badge Tag */}
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
      <div className="flex-1 flex flex-col bg-[#f8f9fc] min-w-0">
        {!activeChat ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 flex-col space-y-3">
            <Bot className="w-12 h-12 opacity-25 text-indigo-500" />
            <p className="text-sm font-semibold">Select a conversation thread to view & reply</p>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 shadow-2xs">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-extrabold uppercase">
                  {activeChat.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-slate-900 text-sm truncate max-w-[300px]">{activeChat.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeChat.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-800' :
                      activeChat.channel === 'instagram' ? 'bg-pink-100 text-pink-800' :
                      activeChat.channel === 'rcs' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      via {activeChat.channel?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{activeChat.contact.phoneNumber} • Customer ID Verified</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-slate-400">
                <button 
                  onClick={() => soundFx.playKeyTone('1')}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" 
                  title="Direct Call"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Canvas */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {loadingMessages ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">Loading message history...</div>
              ) : (
                activeChat.messages.map((msg, i) => (
                  <div 
                    key={msg.id || i} 
                    className={cn("max-w-[72%] flex flex-col", msg.sender === 'agent' || msg.sender === 'bot' ? "self-end items-end" : "self-start items-start")}
                  >
                    {/* Channel Specific Message Rendering */}
                    {msg.channel === 'voice' || msg.text?.includes('[Audio Recording]') ? (
                      <div className="bg-white border border-rose-200 p-4 rounded-2xl shadow-sm text-slate-900 max-w-md">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-extrabold text-rose-600 flex items-center">
                            <Phone className="w-3.5 h-3.5 mr-1 text-rose-600" />
                            VoIP AI Cold Call Audio
                          </span>
                          <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded">
                            3m 15s • Positive Lead
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
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* AI Copilot Suggestion Bar */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center space-x-2 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-extrabold text-indigo-600 uppercase flex items-center shrink-0">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Smart Replies:
              </span>
              {copilotSuggestions.map((sugg, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(sugg)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 text-xs font-semibold whitespace-nowrap transition-colors shadow-2xs cursor-pointer"
                >
                  "{sugg.slice(0, 36)}..."
                </button>
              ))}
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

    </div>
  );
}
