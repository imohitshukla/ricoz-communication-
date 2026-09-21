// Mock API layer to simulate backend operations for Vercel deployment
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getStorage = (key: string, defaultValue: any) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const api = {
  get: async (url: string) => {
    await delay(500);
    if (url.includes('/api/rules')) {
      return { data: getStorage('rules', []) };
    }
    if (url.includes('/api/conversations') && !url.includes('/messages')) {
      return { data: getStorage('conversations', [
        { id: '1', contactName: 'Alice Smith', contactPhone: '+1234567890', platform: 'whatsapp', lastMessage: 'Is this available?', unreadCount: 1, lastMessageTime: new Date().toISOString() },
        { id: '2', contactName: 'Bob Jones', contactPhone: '+0987654321', platform: 'instagram', lastMessage: 'Thanks!', unreadCount: 0, lastMessageTime: new Date(Date.now() - 3600000).toISOString() }
      ]) };
    }
    if (url.includes('/messages')) {
      const match = url.match(/\/api\/conversations\/(.+)\/messages/);
      const conversationId = match ? match[1] : '1';
      const msgs = getStorage(`messages_${conversationId}`, [
        { id: 'm1', content: 'Hi there', role: 'user', timestamp: new Date(Date.now() - 7200000).toISOString() },
        { id: 'm2', content: 'Hello! How can we help?', role: 'agent', timestamp: new Date(Date.now() - 3600000).toISOString() }
      ]);
      return { data: msgs };
    }
    return { data: {} };
  },
  
  post: async (url: string, data?: any) => {
    await delay(500);
    if (url.includes('/api/auth/login')) {
      localStorage.setItem('token', 'mock_jwt_token_123');
      return { data: { token: 'mock_jwt_token_123' } };
    }
    if (url.includes('/api/rules')) {
      const rules = getStorage('rules', []);
      const newRule = { id: Date.now().toString(), keyword: data.keyword, replyText: data.replyText, isActive: true };
      setStorage('rules', [...rules, newRule]);
      return { data: newRule };
    }
    if (url.includes('/api/campaigns/send')) {
      return { data: { success: true, message: 'Campaign sent successfully' } };
    }
    if (url.includes('/messages')) {
      const match = url.match(/\/api\/conversations\/(.+)\/messages/);
      const conversationId = match ? match[1] : '1';
      const msgs = getStorage(`messages_${conversationId}`, []);
      const newMsg = { id: Date.now().toString(), content: data.content, role: 'agent', timestamp: new Date().toISOString() };
      setStorage(`messages_${conversationId}`, [...msgs, newMsg]);
      return { data: newMsg };
    }
    return { data: {} };
  },
  
  put: async (url: string, data?: any) => {
    await delay(300);
    if (url.includes('/toggle')) {
      const match = url.match(/\/api\/rules\/(.+)\/toggle/);
      const id = match ? match[1] : null;
      if (id) {
        const rules = getStorage('rules', []);
        const updated = rules.map((r: any) => r.id === id ? { ...r, isActive: data.isActive } : r);
        setStorage('rules', updated);
        return { data: { success: true } };
      }
    }
    return { data: {} };
  },
  
  delete: async (url: string) => {
    await delay(300);
    if (url.includes('/api/rules')) {
      const match = url.match(/\/api\/rules\/(.+)/);
      const id = match ? match[1] : null;
      if (id) {
        const rules = getStorage('rules', []);
        setStorage('rules', rules.filter((r: any) => r.id !== id));
        return { data: { success: true } };
      }
    }
    return { data: {} };
  }
};
