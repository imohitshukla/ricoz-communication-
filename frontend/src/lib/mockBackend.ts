// Autonomous Demo Engine (In-Memory & LocalStorage High-Fidelity Mock Backend)
// Ensures 100% uptime for live demonstrations even if cloud host (Railway) is offline or expired.

export interface MockResponse {
  status: number;
  data: any;
}

const STORAGE_KEY_PREFIX = 'ricoz_demo_';

function getStorage<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(val));
  } catch {}
}

// ── Initial Mock Datasets ──
const INITIAL_CONTACTS = [
  { id: 'ct-1', name: 'Alex Rivera', phoneNumber: '+1 (415) 890-4122', email: 'alex.rivera@apexcloud.io', company: 'Apex Cloud Solutions', tags: ['vip', 'enterprise'], status: 'subscribed', createdAt: '2026-11-20' },
  { id: 'ct-2', name: 'Sophia Taylor', phoneNumber: '+1 (212) 555-0198', email: 'sophia@taylordesign.co', company: 'Taylor Design Studios', tags: ['instagram', 'lead'], status: 'subscribed', createdAt: '2026-11-21' },
  { id: 'ct-3', name: 'Michael Chen', phoneNumber: '+1 (312) 555-0144', email: 'm.chen@synthetix.tech', company: 'Synthetix AI Corp', tags: ['rcs', 'growth'], status: 'subscribed', createdAt: '2026-11-22' },
  { id: 'ct-4', name: 'Elena Rostova', phoneNumber: '+1 (650) 555-0177', email: 'elena@nordictech.io', company: 'Nordic FinTech Ltd', tags: ['voice', 'decision-maker'], status: 'subscribed', createdAt: '2026-11-22' },
  { id: 'ct-5', name: 'David Miller', phoneNumber: '+1 (206) 555-0133', email: 'david@stratusops.net', company: 'Stratus Operations', tags: ['email', 'trial'], status: 'subscribed', createdAt: '2026-11-23' },
  { id: 'ct-6', name: 'Sarah Jenkins', phoneNumber: '+1 (415) 555-9081', email: 'sarah@beaconlabs.org', company: 'Beacon Labs', tags: ['enterprise'], status: 'subscribed', createdAt: '2026-11-23' },
  { id: 'ct-7', name: 'Marcus Vance', phoneNumber: '+1 (305) 555-4822', email: 'marcus@hypergrowth.vc', company: 'HyperGrowth VC', tags: ['vip', 'investor'], status: 'subscribed', createdAt: '2026-11-24' }
];

const INITIAL_CONVERSATIONS = [
  {
    id: 'conv-1',
    contactId: 'ct-1',
    channel: 'whatsapp',
    contact: INITIAL_CONTACTS[0],
    messages: [
      { id: 'm-1', conversationId: 'conv-1', text: 'Hi! Received your CreatorConnect campaign on WhatsApp. Looks great!', sender: 'contact', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 'm-2', conversationId: 'conv-1', text: 'Awesome Alex! We have early bird access open this week. Would you like to schedule a 15-min demo?', sender: 'agent', timestamp: new Date(Date.now() - 3000000).toISOString() },
      { id: 'm-3', conversationId: 'conv-1', text: 'Yes, let us connect tomorrow at 2 PM. Does your platform sync with our CRM?', sender: 'contact', timestamp: new Date(Date.now() - 600000).toISOString() }
    ]
  },
  {
    id: 'conv-2',
    contactId: 'ct-2',
    channel: 'instagram',
    contact: INITIAL_CONTACTS[1],
    messages: [
      { id: 'm-201', conversationId: 'conv-2', text: 'Loved your latest post on automated omnichannel workflows! Do you offer white-labeling?', sender: 'contact', timestamp: new Date(Date.now() - 7200000).toISOString() },
      { id: 'm-202', conversationId: 'conv-2', text: 'Hey Sophia! Yes, full custom branding and custom domain routing are included in Enterprise.', sender: 'agent', timestamp: new Date(Date.now() - 1800000).toISOString() }
    ]
  },
  {
    id: 'conv-3',
    contactId: 'ct-3',
    channel: 'rcs',
    contact: INITIAL_CONTACTS[2],
    messages: [
      { id: 'm-301', conversationId: 'conv-3', text: 'The verified Google RCS card appeared on my Android phone. The carousel view is super slick!', sender: 'contact', timestamp: new Date(Date.now() - 900000).toISOString() }
    ]
  }
];

const INITIAL_TEMPLATES = [
  {
    id: 'tpl-1',
    name: 'CreatorConnect Collab Invite',
    category: 'MARKETING',
    language: 'en_US',
    body: 'Hey {{1}}! 🌟 We noticed your incredible brand presence and would love to invite you to our CreatorConnect private network. Claim your exclusive access code {{2}} before slots fill up!',
    headerType: 'IMAGE',
    headerUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=600',
    status: 'APPROVED',
    buttons: [{ type: 'QUICK_REPLY', text: 'Claim Access' }, { type: 'URL', text: 'View Guidelines', url: 'https://ricoz.io' }]
  },
  {
    id: 'tpl-2',
    name: 'VIP 30% Promo Offer',
    category: 'MARKETING',
    language: 'en_US',
    body: 'Hello {{1}}! As one of our top partners, enjoy an exclusive 30% discount on all omnichannel growth packages using code {{2}}.',
    headerType: 'IMAGE',
    headerUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
    status: 'APPROVED',
    buttons: [{ type: 'QUICK_REPLY', text: 'Apply Discount' }]
  },
  {
    id: 'tpl-3',
    name: 'Product Launch Blast',
    category: 'MARKETING',
    language: 'en_US',
    body: 'Exciting news {{1}}! Our next-gen AI Copilot is officially live. Experience sub-second auto replies and multi-channel cascade routing now.',
    headerType: 'IMAGE',
    headerUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600',
    status: 'APPROVED',
    buttons: [{ type: 'QUICK_REPLY', text: 'Explore Features' }]
  }
];

export function handleMockRoute(method: string, path: string, payload?: any): MockResponse | null {
  const normalizedPath = path.split('?')[0].replace(/\/$/, '');

  // 1. Analytics & Overview
  if (normalizedPath === '/api/analytics') {
    return {
      status: 200,
      data: {
        totalContacts: 1420,
        totalSentMessages: 24850,
        activeConversations: 18,
        totalMessages: 31420,
        botMessages: 12890,
        totalCampaigns: 14,
        autoReplyRules: 8,
        avgResponseSeconds: 42,
        volumeData: [
          { name: 'Mon', inbound: 420, outbound: 1850 },
          { name: 'Tue', inbound: 580, outbound: 2420 },
          { name: 'Wed', inbound: 810, outbound: 3600 },
          { name: 'Thu', inbound: 640, outbound: 2900 },
          { name: 'Fri', inbound: 920, outbound: 4100 },
          { name: 'Sat', inbound: 310, outbound: 1200 },
          { name: 'Sun', inbound: 280, outbound: 950 }
        ],
        activityFeed: [
          { id: '1', title: 'WhatsApp Broadcast Delivered', desc: 'CreatorConnect Collab Invite sent to 1,420 target contacts (98.4% delivery rate)', time: '2m ago', type: 'whatsapp' },
          { id: '2', title: 'Inbound Sales Lead', desc: 'Alex Rivera (+1 415 890 4122) responded requesting enterprise pricing', time: '8m ago', type: 'inbox' },
          { id: '3', title: 'AI Cold Call Meeting Booked', desc: 'Autonomous Voice Agent confirmed 25-min demo with Alex Morgan (VP Tech)', time: '21m ago', type: 'voice' },
          { id: '4', title: 'Google RCS Rich Card Verified', desc: 'Delivered verified RCS carousel with CTA buttons to 850 Android subscribers', time: '35m ago', type: 'rcs' }
        ]
      }
    };
  }

  // 2. WhatsApp Templates & Broadcast
  if (normalizedPath === '/api/whatsapp/templates') {
    const tpls = getStorage('templates', INITIAL_TEMPLATES);
    return { status: 200, data: tpls };
  }

  if (normalizedPath === '/api/whatsapp/broadcast' && method === 'POST') {
    return {
      status: 200,
      data: {
        success: true,
        campaignId: 'camp_' + Date.now(),
        name: payload?.name || 'CreatorConnect Broadcast',
        sentCount: 1420,
        channel: 'WhatsApp Cloud API',
        message: 'Broadcast initiated successfully across all 1,420 target contacts'
      }
    };
  }

  // 3. Contacts
  if (normalizedPath === '/api/contacts') {
    const contacts = getStorage('contacts', INITIAL_CONTACTS);
    if (method === 'GET') {
      return { status: 200, data: contacts };
    }
    if (method === 'POST') {
      const newContact = {
        id: 'ct-' + Date.now(),
        name: payload?.name || 'New Lead',
        phoneNumber: payload?.phoneNumber || '+1 (555) 000-0000',
        email: payload?.email || 'lead@example.com',
        company: payload?.company || 'Enterprise Partner',
        tags: payload?.tags || ['new-lead'],
        status: 'subscribed',
        createdAt: new Date().toISOString().split('T')[0]
      };
      const updated = [newContact, ...contacts];
      setStorage('contacts', updated);
      return { status: 201, data: newContact };
    }
  }

  if (normalizedPath === '/api/contacts/bulk-import' && method === 'POST') {
    const current = getStorage('contacts', INITIAL_CONTACTS);
    const imported = (payload?.contacts || []).map((c: any, i: number) => ({
      id: 'ct-import-' + Date.now() + '-' + i,
      name: c.name || 'Enterprise Lead',
      phoneNumber: c.phoneNumber || '+1 (555) ' + Math.floor(1000000 + Math.random() * 9000000),
      email: c.email || 'lead@domain.com',
      company: c.company || 'Global Enterprise',
      tags: c.tags || ['imported-lead'],
      status: 'subscribed',
      createdAt: new Date().toISOString().split('T')[0]
    }));
    setStorage('contacts', [...imported, ...current]);
    return { status: 200, data: { success: true, imported: imported.length, skipped: 0 } };
  }

  // 4. Unified Inbox & Conversations
  if (normalizedPath === '/api/conversations') {
    const convs = getStorage('conversations', INITIAL_CONVERSATIONS);
    return { status: 200, data: convs };
  }

  if (normalizedPath.startsWith('/api/conversations/') && normalizedPath.endsWith('/messages')) {
    const convId = normalizedPath.split('/')[3];
    const convs = getStorage('conversations', INITIAL_CONVERSATIONS);
    const target = convs.find(c => c.id === convId) || convs[0];
    
    if (method === 'GET') {
      return { status: 200, data: target?.messages || [] };
    }
    if (method === 'POST') {
      const newMsg = {
        id: 'm-' + Date.now(),
        conversationId: convId,
        text: payload?.text || '',
        sender: 'agent',
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      if (target) {
        target.messages.push(newMsg);
        setStorage('conversations', convs);
      }
      return { status: 201, data: newMsg };
    }
  }

  // 5. AI Copilot (Unified Inbox Actions)
  if (normalizedPath === '/api/ai/copilot/draft' && method === 'POST') {
    return {
      status: 200,
      data: {
        drafts: {
          professional: `Hello ${payload?.contactName || 'there'}, thank you for reaching out. Yes, we support direct enterprise CRM integrations with HubSpot, Salesforce, and Webhooks. Let's lock in tomorrow at 2:00 PM EST.`,
          friendly: `Hey ${payload?.contactName || 'there'}! Absolutely, our CRM sync connects in one click. Super excited to show you tomorrow at 2 PM! 🎉`,
          closer: `Hi ${payload?.contactName || 'there'}, let's do 2 PM tomorrow! Here is the calendar confirmation link: https://ricoz.io/meet/alex. Looking forward to partnering.`
        }
      }
    };
  }

  if (normalizedPath === '/api/ai/copilot/summarize' && method === 'POST') {
    return {
      status: 200,
      data: {
        summary: 'Customer verified reception of the CreatorConnect broadcast and requested an enterprise demo tomorrow at 2 PM with CRM synchronization capabilities.',
        customerSentiment: 'Highly Positive (94% Purchase Intent)',
        recommendedAction: 'Send meeting calendar link and share Enterprise API documentation.',
        openQuestions: ['CRM Sync compatibility', 'Custom domain white-labeling']
      }
    };
  }

  if (normalizedPath === '/api/ai/copilot/sentiment' && method === 'POST') {
    return {
      status: 200,
      data: {
        sentiment: 'POSITIVE',
        score: 0.94,
        intentCategory: 'Demo Request / Purchase Inquiry',
        objections: [],
        recommendedAction: 'Confirm demo meeting & share rate card'
      }
    };
  }

  // 6. Google RCS Studio
  if (normalizedPath === '/api/rcs/stats') {
    return {
      status: 200,
      data: {
        totalDelivered: 4850,
        readRate: '94.2%',
        chipClickRate: '46.8%',
        activeAgents: 3,
        verifiedBadged: true
      }
    };
  }

  if (normalizedPath === '/api/rcs/send' && method === 'POST') {
    return {
      status: 200,
      data: {
        success: true,
        sentCount: 1420,
        cardType: payload?.cardType || 'STANDALONE',
        carrierStatus: 'DELIVERED_GOOGLE_RBM',
        message: 'Google RCS verified rich card broadcast dispatched to 1,420 contacts!'
      }
    };
  }

  // 7. Voice & Cold Calling
  if (normalizedPath === '/api/voice/coldcall/campaigns') {
    return {
      status: 200,
      data: [
        { id: 'vc-1', name: 'Q4 Enterprise Tech Outreach', status: 'In Progress', targetCount: 25, completedCount: 19, bookedCount: 6, agentVoice: 'Alex Morgan (Conversational AI)', conversionRate: '31.5%' },
        { id: 'vc-2', name: 'Inbound Warm Leads Callback', status: 'Completed', targetCount: 50, completedCount: 50, bookedCount: 18, agentVoice: 'Rachel (Warm Closer)', conversionRate: '36.0%' }
      ]
    };
  }

  if (normalizedPath === '/api/voice/calls') {
    return {
      status: 200,
      data: [
        { id: 'call-1', contactName: 'Alex Morgan', phoneNumber: '+1 (415) 890-4122', duration: '1m 45s', outcome: 'Demo Booked (Meeting Confirmed)', sentiment: 'Enthusiastic', recordingUrl: '#', timestamp: '12m ago' },
        { id: 'call-2', contactName: 'David Miller', phoneNumber: '+1 (206) 555-0133', duration: '2m 12s', outcome: 'Follow-up Email Requested', sentiment: 'Interested', recordingUrl: '#', timestamp: '45m ago' }
      ]
    };
  }

  if (normalizedPath === '/api/voice/ivr-config') {
    return {
      status: 200,
      data: {
        welcomeMessage: 'Thank you for calling Ricoz Enterprise Communication. How may I direct your call?',
        voiceGender: 'female',
        fallbackNumber: '+1 (800) 555-0199',
        aiPrompt: 'You are an executive receptionist. Identify intent and transfer to Sales or Support.'
      }
    };
  }

  // 8. Instagram DM Automation
  if (normalizedPath === '/api/instagram/rules') {
    return {
      status: 200,
      data: [
        { id: 'ig-1', triggerType: 'COMMENT', keyword: 'PRICE', replyComment: 'Sent you all pricing tiers in your DM! 📩', dmResponse: 'Hey! Here is your exclusive 30% discount link: https://ricoz.io/pricing?code=IG30', isActive: true, triggerCount: 184 },
        { id: 'ig-2', triggerType: 'COMMENT', keyword: 'DEMO', replyComment: 'Check your DM for the live interactive sandbox link! 🚀', dmResponse: 'Here is your 1-click test link: https://ricoz.io/demo. Let me know if you need anything!', isActive: true, triggerCount: 96 }
      ]
    };
  }

  if (normalizedPath === '/api/instagram/test-trigger' && method === 'POST') {
    return {
      status: 200,
      data: {
        success: true,
        matchedRule: payload?.commentText?.toUpperCase()?.includes('PRICE') ? 'PRICE' : 'DEMO',
        publicReply: 'Sent you all details directly in your DM! 📩',
        dmSent: 'Hey! Here is your exclusive 30% access code: https://ricoz.io/pricing?code=DEMO30'
      }
    };
  }

  // 9. Email Marketing
  if (normalizedPath === '/api/email/stats') {
    return {
      status: 200,
      data: {
        totalSubscribers: 1420,
        totalCampaigns: 2,
        totalDelivered: 1420,
        totalOpened: 482,
        totalClicked: 114,
        totalBounced: 0,
        avgOpenRate: '33.9',
        avgClickRate: '8.0'
      }
    };
  }

  if (normalizedPath === '/api/email/campaigns') {
    return {
      status: 200,
      data: [
        { id: 'camp-1', name: 'Q4 Product Launch & VIP Access', subject: 'Introducing Ricoz AI Copilot — Exclusively for {{name}} 🚀', fromName: 'Ricoz Communication', fromEmail: 'hello@ricoz.io', status: 'sent', totalRecipients: 1420, delivered: 1420, opened: 482, clicked: 114, bounced: 0, createdAt: '2026-11-20' },
        { id: 'camp-2', name: 'CreatorConnect Collab Invitation', subject: 'Partnering on CreatorConnect 2024 — Special Access for {{name}}', fromName: 'Ricoz Creator Team', fromEmail: 'creators@ricoz.io', status: 'draft', totalRecipients: 1540, delivered: 0, opened: 0, clicked: 0, bounced: 0, createdAt: '2026-11-24' }
      ]
    };
  }

  if (normalizedPath.startsWith('/api/email/campaigns/') && normalizedPath.endsWith('/send-test') && method === 'POST') {
    return {
      status: 200,
      data: {
        success: true,
        recipient: payload?.testEmail || 'test@example.com',
        status: '250 2.0.0 OK (Queued for Primary Inbox Delivery)',
        gateway: 'Brevo SMTP Relay (300 Free Emails / Day)',
        latency: '118ms',
        messageId: 'msg_' + Math.random().toString(36).substring(2, 10).toUpperCase()
      }
    };
  }

  // 10. Integrations & API Hub
  if (normalizedPath === '/api/integrations/status') {
    return {
      status: 200,
      data: {
        channels: [
          { id: 'whatsapp', name: 'WhatsApp Cloud API', configured: true, status: 'Active', category: 'Messaging', requires: ['Access Token', 'Phone Number ID', 'WABA ID'] },
          { id: 'rcs', name: 'Google RCS Business Messaging', configured: true, status: 'Active', category: 'Messaging', requires: ['Service Account Key', 'Agent ID'] },
          { id: 'instagram', name: 'Instagram Direct & Messenger API', configured: true, status: 'Active', category: 'Social', requires: ['Page Access Token', 'Instagram Account ID'] },
          { id: 'voice', name: 'AI Voice Receptionist (VoIP / WebRTC)', configured: true, status: 'Active', category: 'Voice', requires: ['SIP Trunk', 'WebRTC Key'] },
          { id: 'email', name: 'Brevo / Mailtrap SMTP Relay', configured: true, status: 'Active', category: 'Email', requires: ['SMTP Host', 'API Key'] },
          { id: 'ai', name: 'Ricoz Gemini & Groq AI Engine', configured: true, status: 'Active', category: 'Intelligence', requires: ['API Key'] }
        ]
      }
    };
  }

  if (normalizedPath === '/api/integrations/test' || normalizedPath === '/api/integrations/test-key') {
    return {
      status: 200,
      data: {
        success: true,
        latency: '138ms',
        channel: payload?.provider || 'Gateway',
        message: 'Ping successful. Carrier gateway operational.'
      }
    };
  }

  // 11. WhatsApp Forms & Interactive Lists
  if (normalizedPath === '/api/whatsapp/forms') {
    return {
      status: 200,
      data: [
        {
          id: 'flow-1',
          name: 'VIP Lead Generation & Booking Form',
          description: 'Collects customer name, package selection, and delivery details within WhatsApp',
          fields: [
            { id: 'f1', type: 'text', label: 'Full Name' },
            { id: 'f2', type: 'dropdown', label: 'Package Selected', options: ['Starter', 'Growth', 'Enterprise'] },
            { id: 'f3', type: 'text', label: 'Delivery Location' }
          ],
          responseCount: 142,
          isActive: true
        }
      ]
    };
  }

  if (normalizedPath === '/api/whatsapp/lists') {
    return {
      status: 200,
      data: [
        {
          id: 'list-1',
          title: 'Main Product Navigation Menu',
          buttonText: 'View Options',
          sections: [
            {
              title: 'Solutions',
              rows: [
                { id: 'opt-1', title: 'WhatsApp Broadcasts', description: 'Template messages with media & interactive CTA buttons' },
                { id: 'opt-2', title: 'AI Cold Calling', description: 'Autonomous voice agents that book meetings' },
                { id: 'opt-3', title: 'Google RCS Studio', description: 'Rich verified cards on Android Google Messages' }
              ]
            }
          ]
        }
      ]
    };
  }

  // 12. Organization, Team & Billing
  if (normalizedPath === '/api/team/members') {
    return {
      status: 200,
      data: [
        { id: 'tm-1', name: 'Admin Account', email: 'admin@ricoz.io', role: 'ADMIN', status: 'Active', assigned: 12, resolved: 84 },
        { id: 'tm-2', name: 'Sarah Lead Agent', email: 'sarah@ricoz.io', role: 'AGENT', status: 'Active', assigned: 8, resolved: 62 }
      ]
    };
  }

  if (normalizedPath === '/api/billing/subscription') {
    return {
      status: 200,
      data: {
        plan: 'ENTERPRISE UNLIMITED',
        status: 'active',
        currentPeriodEnd: '2027-01-01',
        features: ['Unlimited WhatsApp Broadcasts', 'AI Voice Calling', 'Google RCS', 'Dedicated Brevo SMTP Relay']
      }
    };
  }

  // Default catch-all for unknown routes
  return {
    status: 200,
    data: { success: true, message: 'Operation verified in autonomous demo mode', data: payload || {} }
  };
}
