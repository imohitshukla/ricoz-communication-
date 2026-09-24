import { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Send, Paperclip, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api, API_URL } from '@/lib/api';
import { io, Socket } from 'socket.io-client';

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
  timestamp: string;
  // mapped properties for UI
  time?: string; 
};

type Chat = {
  id: string; // conversation id
  contactId: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  channel: string;
  messages: Message[];
  contact: Contact;
};

export function Inbox() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeChat = chats.find(c => c.id === activeChatId) || null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await api.post('/api/media/upload', {
          filename: file.name,
          mimeType: file.type,
          base64Data
        });

        const attachmentText = `📎 [Attachment: ${file.name}](${res.url})`;
        await api.post(`/api/conversations/${activeChat.id}/messages`, {
          text: attachmentText,
          sender: 'agent'
        });

        const newMsg: Message = {
          id: Math.random().toString(),
          conversationId: activeChat.id,
          text: attachmentText,
          sender: 'agent',
          timestamp: new Date().toISOString(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChats(prev => prev.map(c => 
          c.id === activeChat.id ? { 
            ...c, 
            messages: [...c.messages, newMsg],
            lastMessage: attachmentText,
            time: newMsg.time
          } : c
        ));
      } catch (err) {
        console.error('File upload error:', err);
        alert('Failed to upload file');
      }
    };
    reader.readAsDataURL(file);
  };


  const fetchConversations = async () => {
    try {
      const res = await api.get('/api/conversations');
      const mappedChats: Chat[] = res.data.map((c: any) => ({
        id: c.id,
        contactId: c.contactId,
        name: c.contact.name || c.contact.phoneNumber,
        lastMessage: c.messages[0]?.text || '',
        time: c.messages[0]?.timestamp ? new Date(c.messages[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        unread: 0,
        channel: c.channel,
        messages: [], // We will fetch full messages when clicked
        contact: c.contact
      }));
      setChats(mappedChats);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    
    let newSocket = io(API_URL.replace('/api', '')); // Connect to root of backend
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    newSocket.on('new_message', (msg: any) => {
      setChats(prevChats => {
        // Find if chat exists
        const exists = prevChats.some(c => c.id === msg.conversationId);
        
        if (exists) {
          return prevChats.map(chat => {
            if (chat.id === msg.conversationId) {
              const newMsg: Message = {
                id: msg.id,
                conversationId: msg.conversationId,
                text: msg.text,
                sender: msg.sender,
                timestamp: new Date().toISOString(),
                time: msg.time
              };
              return {
                ...chat,
                lastMessage: msg.text,
                time: msg.time,
                unread: (msg.sender === 'contact' && activeChatId !== chat.id) ? chat.unread + 1 : chat.unread,
                messages: chat.messages.length > 0 ? [...chat.messages, newMsg] : [] // Only append if we have fetched messages
              };
            }
            return chat;
          });
        } else {
          // New conversation created, refresh list
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
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages.length]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeChat) return;
    
    try {
      const res = await api.post(`/api/conversations/${activeChat.id}/messages`, {
        text: inputText,
        sender: 'agent'
      });
      
      const newMsg = {
        ...res.data,
        time: new Date(res.data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChats(prev => prev.map(c => 
        c.id === activeChat.id ? { 
          ...c, 
          messages: [...c.messages, newMsg],
          lastMessage: inputText,
          time: newMsg.time
        } : c
      ));
      
      setInputText('');
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
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

  return (
    <div className="flex h-full overflow-hidden">
      {/* List Pane */}
      <div className="w-[320px] shrink-0 border-r border-border bg-surface flex flex-col h-full">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold mb-4">Inbox</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-secondary" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-sunken border border-border rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-brand-primary/50 transition-colors"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-8 text-center text-secondary text-sm">
              No conversations yet. Add contacts and they will appear here when messaged.
            </div>
          ) : (
            chats.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => handleChatSelect(chat.id)}
                className={cn(
                  "p-4 border-b border-border cursor-pointer transition-colors hover:bg-sunken",
                  activeChat?.id === chat.id ? "bg-sunken border-l-4 border-l-brand-primary" : "border-l-4 border-l-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-primary text-sm truncate max-w-[150px]">{chat.name}</span>
                  <span className="text-xs text-secondary shrink-0">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-secondary truncate pr-2">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <div className="w-5 h-5 rounded-full bg-brand-accent text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {chat.unread}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Active Thread Pane */}
      <div className="flex-1 flex flex-col bg-base min-w-0">
        {!activeChat ? (
          <div className="flex-1 flex items-center justify-center text-secondary flex-col space-y-4">
            <Bot className="w-12 h-12 opacity-20" />
            <p>Select a conversation to start messaging</p>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            <div className="h-16 border-b border-border bg-surface flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-sunken flex items-center justify-center text-secondary font-medium uppercase">
                  {activeChat.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-primary truncate max-w-[300px]">{activeChat.name}</h3>
                  <p className="text-xs text-secondary flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5 animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
              <button className="text-secondary hover:text-primary">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {loadingMessages ? (
                <div className="h-full flex items-center justify-center text-secondary text-sm">Loading messages...</div>
              ) : (
                <div className="flex flex-col space-y-4">
                  {activeChat.messages.map((msg, i) => (
                    <div key={msg.id || i} className={cn("max-w-[70%]", msg.sender === 'agent' ? "self-end" : "self-start")}>
                      <div className={cn(
                        "border rounded-2xl px-4 py-3 text-sm shadow-sm",
                        msg.sender === 'agent' 
                          ? "bg-brand-primary text-white border-brand-primary rounded-tr-sm" 
                          : "bg-surface border-border text-primary rounded-tl-sm"
                      )}>
                        {msg.text}
                      </div>
                      <span className={cn(
                        "text-xs text-secondary mt-1 block", 
                        msg.sender === 'agent' ? "text-right mr-1" : "ml-1"
                      )}>{msg.time}</span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="p-4 bg-surface border-t border-border shrink-0">
              <div className="flex items-end space-x-2 bg-sunken border border-border rounded-xl p-2 focus-within:border-brand-primary/50 transition-colors">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-secondary hover:text-primary shrink-0 cursor-pointer"
                  title="Attach file or image"
                >
                  <Paperclip className="w-5 h-5" />
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
                  placeholder="Type a message..." 
                  className="flex-1 max-h-32 bg-transparent resize-none outline-none text-sm py-2"
                  rows={1}
                />
                <div className="flex items-center space-x-1 shrink-0 pb-1">
                  <button className="p-2 text-secondary hover:text-brand-primary transition-colors group relative">
                    <Bot className="w-5 h-5" />
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface border border-border text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">AI Reply</span>
                  </button>
                  <button onClick={handleSendMessage} className="p-2 bg-brand-primary text-white rounded-lg shadow-raised hover:opacity-90 transition-opacity">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Context Panel (300px) */}
      {activeChat && (
        <div className="hidden xl:flex w-[300px] shrink-0 border-l border-border bg-surface flex-col">
          <div className="p-6 border-b border-border flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-sunken flex items-center justify-center text-2xl text-secondary font-medium mb-4 uppercase">
              {activeChat.name.charAt(0)}
            </div>
            <h3 className="font-semibold text-lg">{activeChat.name}</h3>
            <p className="text-sm text-secondary mt-1 capitalize">via {activeChat.channel}</p>
          </div>
          
          <div className="p-6">
            <h4 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-4">Details</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Phone</span>
                <span className="font-medium text-primary">{activeChat.contact.phoneNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Status</span>
                <span className="font-medium text-success capitalize">Active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
