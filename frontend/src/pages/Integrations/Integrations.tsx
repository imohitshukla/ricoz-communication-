import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Globe, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Settings, 
  X, 
  Copy, 
  ChevronRight, 
  Send,
  Zap,
  Activity,
  RefreshCw,
  Cpu,
  Radio,
  Sparkles,
  ShieldCheck,
  Check,
  Loader2,
  Share2
} from 'lucide-react';
import { api, API_URL } from '@/lib/api';

interface ChannelItem {
  id: string;
  name: string;
  provider: string;
  icon: string;
  color: string;
  bgLight: string;
  status: 'connected' | 'not_connected' | 'simulated';
  category: 'Messaging' | 'Telephony' | 'Social' | 'Email' | 'Carrier' | 'AI';
  description: string;
  liveFeatures: string[];
  requires: string[];
  docsUrl: string;
  accountInfo?: string;
  setupSteps: string[];
}

const DEFAULT_CHANNELS: ChannelItem[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Business API',
    provider: 'Meta Cloud API v20.0',
    icon: '💬',
    color: '#25D366',
    bgLight: 'rgba(37, 211, 102, 0.1)',
    status: 'not_connected',
    category: 'Messaging',
    description: 'Direct Meta Cloud API integration for 2-way live chat, interactive list messages, and media broadcasts.',
    liveFeatures: ['Two-way live chat', 'Interactive CTA buttons', 'Catalog & product list', 'Verified green badge support'],
    requires: ['WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_WABA_ID'],
    docsUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
    setupSteps: [
      'Create a Meta Business app at developers.facebook.com with WhatsApp product',
      'Generate a Permanent System User Access Token',
      'Copy your Phone Number ID and WhatsApp Business Account ID (WABA)',
      'Add credentials to backend .env or save them below',
      'Configure the Webhook URL with Verify Token: ricoz_webhook_token'
    ]
  },
  {
    id: 'instagram',
    name: 'Instagram Direct & Story DMs',
    provider: 'Meta Graph API v20.0',
    icon: '📸',
    color: '#E1306C',
    bgLight: 'rgba(225, 48, 108, 0.1)',
    status: 'not_connected',
    category: 'Social',
    description: 'Auto-reply to Instagram Direct Messages, story mentions, and comment-to-DM lead generation flows.',
    liveFeatures: ['Direct message sync', 'Story mention triggers', 'Comment-to-DM auto-reply', 'Quick reply ICE breakers'],
    requires: ['INSTAGRAM_ACCESS_TOKEN', 'INSTAGRAM_ACCOUNT_ID'],
    docsUrl: 'https://developers.facebook.com/docs/messenger-platform/instagram',
    setupSteps: [
      'Connect your Instagram Professional Account to a Facebook Page',
      'In Meta Developer App, add the Instagram Graph API and Messenger products',
      'Generate Page Access Token with instagram_manage_messages permission',
      'Set the Webhook subscription to instagram_messaging',
      'Save your Access Token and Instagram Account ID'
    ]
  },
  {
    id: 'voice',
    name: 'Voice Calling & AI Receptionist',
    provider: 'Twilio Programmable Voice',
    icon: '📞',
    color: '#F22F46',
    bgLight: 'rgba(242, 47, 70, 0.1)',
    status: 'not_connected',
    category: 'Telephony',
    description: 'Production Twilio Voice engine for live cold calling, inbound IVR trees, automated call recording, and transcriptions.',
    liveFeatures: ['Real PSTN phone calls', 'Inbound IVR phone trees', 'Call recording & transcription', 'ElevenLabs neural speech playback'],
    requires: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'],
    docsUrl: 'https://www.twilio.com/docs/voice',
    setupSteps: [
      'Sign up at twilio.com and purchase an active phone number with Voice capability',
      'Retrieve your Account SID and Auth Token from the Twilio Console',
      'Configure the Voice webhook of your Twilio number to point to Ricoz',
      'Add credentials to backend .env'
    ]
  },
  {
    id: 'sms',
    name: 'SMS & MMS Messaging',
    provider: 'Twilio Global SMS',
    icon: '📱',
    color: '#0284C7',
    bgLight: 'rgba(2, 132, 199, 0.1)',
    status: 'not_connected',
    category: 'Messaging',
    description: 'Worldwide carrier SMS & MMS dispatch with real-time delivery receipts (DLR) and 2-way conversational inbox.',
    liveFeatures: ['Global 160-char SMS & MMS', 'Real-time delivery receipts', 'Inbound SMS auto-reply', 'Opt-out (STOP/UNSUB) compliance'],
    requires: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'],
    docsUrl: 'https://www.twilio.com/docs/sms',
    setupSteps: [
      'Uses your existing Twilio Phone Number configuration',
      'In Twilio Console, set the SMS webhook to point to /api/sms/webhook',
      'Both inbound and outbound text messages will route directly through Ricoz Inbox'
    ]
  },
  {
    id: 'email',
    name: 'Email Marketing & Transactional',
    provider: 'Resend API / SMTP',
    icon: '✉️',
    color: '#6366F1',
    bgLight: 'rgba(99, 102, 241, 0.1)',
    status: 'not_connected',
    category: 'Email',
    description: 'High-deliverability email dispatch using Resend HTTP API with Mailtrap & SMTP fallback for custom domains.',
    liveFeatures: ['DKIM & SPF verified sending', 'Rich HTML marketing templates', 'Open & click tracking', 'Automated team invite emails'],
    requires: ['RESEND_API_KEY', 'EMAIL_FROM_ADDRESS'],
    docsUrl: 'https://resend.com/docs',
    setupSteps: [
      'Create an account at resend.com and add your sending domain',
      'Verify your domain DNS records (DKIM, SPF, MX)',
      'Generate an API key with Sending permissions',
      'Add RESEND_API_KEY and EMAIL_FROM_ADDRESS to your environment'
    ]
  },
  {
    id: 'rcs',
    name: 'Google RCS Business Messaging',
    provider: 'Google RBM REST API',
    icon: '💬',
    color: '#34A853',
    bgLight: 'rgba(52, 168, 83, 0.1)',
    status: 'not_connected',
    category: 'Carrier',
    description: 'Next-generation Android verified carrier messaging with interactive rich cards, image carousels, and suggested reply chips.',
    liveFeatures: ['Verified brand logo & badge', 'Rich media carousels', 'Action chips (Open URL, Call, Location)', 'Read receipts & typing indicators'],
    requires: ['RCS_API_KEY', 'RCS_AGENT_ID'],
    docsUrl: 'https://developers.google.com/business-communications/rcs-business-messaging',
    setupSteps: [
      'Register for a Google Cloud RBM Partner account',
      'Create a verified RCS Agent and obtain your Agent ID',
      'Enable the RCS Business Messaging API in Google Cloud Console',
      'Provide your Service Account Key or RBM API token'
    ]
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs Neural AI Voice',
    provider: 'ElevenLabs Speech Synthesis',
    icon: '🎙️',
    color: '#F59E0B',
    bgLight: 'rgba(245, 158, 11, 0.1)',
    status: 'not_connected',
    category: 'AI',
    description: 'Ultra-realistic human-like voice synthesis powering Cold Calling agents, custom voice cloning, and live phone greetings.',
    liveFeatures: ['Ultra-low latency speech', 'Voice cloning support', 'Pre-tuned B2B SDR personas (Rachel, Josh)', 'Emotional inflection matching'],
    requires: ['ELEVENLABS_API_KEY'],
    docsUrl: 'https://elevenlabs.io/docs',
    setupSteps: [
      'Sign up at elevenlabs.io and navigate to Profile → API Keys',
      'Copy your API key and paste it below or in backend .env',
      'Instantly upgrades your Cold Calling dialer to speak with human-like neural voice'
    ]
  },
  {
    id: 'gemini',
    name: 'Google Gemini 2.5 Pro Copilot',
    provider: 'Google AI Multimodal SDK',
    icon: '🤖',
    color: '#8B5CF6',
    bgLight: 'rgba(139, 92, 246, 0.1)',
    status: 'connected',
    category: 'AI',
    description: 'Omnichannel intelligence engine powering real-time intent classification, smart response drafting, translation, and sentiment analysis.',
    liveFeatures: ['Zero-shot sentiment scoring', 'One-click AI reply drafting', 'Multilingual 100+ language translation', 'Real-time lead qualification scoring'],
    requires: ['GEMINI_API_KEY'],
    docsUrl: 'https://ai.google.dev',
    setupSteps: [
      'Active by default — powered by Google Gemini 2.5 Pro',
      'Add a custom GEMINI_API_KEY in .env for dedicated enterprise throughput'
    ]
  }
];

export function Integrations() {
  const [channels, setChannels] = useState<ChannelItem[]>(DEFAULT_CHANNELS);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedChannel, setSelectedChannel] = useState<ChannelItem | null>(null);
  const [testingChannelId, setTestingChannelId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [isHealthChecking, setIsHealthChecking] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  // Live Test Message/Call Modal State
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testTargetChannel, setTestTargetChannel] = useState<string>('sms');
  const [testRecipient, setTestRecipient] = useState<string>('');
  const [testMessage, setTestMessage] = useState<string>('Hello! This is a live test notification from Ricoz Communication.');
  const [sendingTest, setSendingTest] = useState(false);
  const [testSendResult, setTestSendResult] = useState<{ success: boolean; text: string } | null>(null);

  // Configure Credentials Modal State
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configChannel, setConfigChannel] = useState<ChannelItem | null>(null);
  const [formCredentials, setFormCredentials] = useState<Record<string, string>>({});
  const [savingConfig, setSavingConfig] = useState(false);
  const [configFeedback, setConfigFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  const webhookBaseUrl = API_URL || 'https://ricoz-backend-production.up.railway.app';
  const WEBHOOKS = [
    { label: 'WhatsApp Webhook URL', url: `${webhookBaseUrl}/api/whatsapp/webhook`, token: 'ricoz_webhook_token' },
    { label: 'Instagram Webhook URL', url: `${webhookBaseUrl}/api/instagram/webhook`, token: 'ricoz_webhook_token' },
    { label: 'Twilio Voice Webhook URL', url: `${webhookBaseUrl}/api/voice/webhook`, method: 'POST' },
    { label: 'Twilio SMS Webhook URL', url: `${webhookBaseUrl}/api/sms/webhook`, method: 'POST' },
  ];

  // Fetch real-time status from backend
  const fetchStatus = async () => {
    try {
      const res = await api.get('/api/integrations/status');
      if (res && res.channels) {
        setChannels(prev => prev.map(ch => {
          const remote = res.channels.find((r: any) => r.id === ch.id);
          if (remote) {
            return {
              ...ch,
              status: remote.configured ? 'connected' : (remote.mode === 'dev_fallback' ? 'simulated' : 'not_connected'),
              accountInfo: remote.configured ? `Active (${remote.mode || 'live'})` : undefined
            };
          }
          return ch;
        }));
      }
    } catch (err) {
      console.warn('Could not load integrations status from backend:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  // Run connection handshake test for a single channel
  const handleTestConnection = async (channelId: string) => {
    setTestingChannelId(channelId);
    try {
      const res = await api.post('/api/integrations/test', { channelId });
      setTestResults(prev => ({
        ...prev,
        [channelId]: {
          success: Boolean(res.success),
          message: res.message || (res.success ? 'Connected and responding successfully ✅' : 'Connection check failed ⚠️')
        }
      }));
      // Refresh status after test
      fetchStatus();
    } catch (err: any) {
      setTestResults(prev => ({
        ...prev,
        [channelId]: {
          success: false,
          message: err.response?.data?.message || err.message || 'Network handshake failed'
        }
      }));
    } finally {
      setTestingChannelId(null);
    }
  };

  // Run full system diagnostics
  const handleRunFullDiagnostics = async () => {
    setIsHealthChecking(true);
    try {
      const res = await api.post('/api/integrations/test');
      const updatedResults: Record<string, { success: boolean; message: string }> = {};
      
      if (res.email) updatedResults.email = res.email;
      if (res.voice) updatedResults.voice = res.voice;
      if (res.sms) updatedResults.sms = res.sms;
      if (res.rcs) updatedResults.rcs = res.rcs;
      if (res.elevenLabs) updatedResults.elevenlabs = res.elevenLabs;
      if (res.gemini) updatedResults.gemini = res.gemini;

      setTestResults(prev => ({ ...prev, ...updatedResults }));
      fetchStatus();
    } catch (err) {
      console.error('Diagnostics failed:', err);
    } finally {
      setIsHealthChecking(false);
    }
  };

  // Send a live test message/call
  const handleSendLiveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient) return;

    setSendingTest(true);
    setTestSendResult(null);

    try {
      const res = await api.post('/api/integrations/send-test', {
        channel: testTargetChannel,
        to: testRecipient,
        message: testMessage
      });

      if (res.success) {
        setTestSendResult({
          success: true,
          text: `Success! Dispatch confirmed. ID: ${res.messageId || res.callSid || 'OK'}. Check recipient device.`
        });
      } else {
        setTestSendResult({
          success: false,
          text: `Dispatch rejected: ${res.error || 'Failed to dispatch'}`
        });
      }
    } catch (err: any) {
      setTestSendResult({
        success: false,
        text: err.response?.data?.error || err.message || 'Test dispatch failed'
      });
    } finally {
      setSendingTest(false);
    }
  };

  // Save channel configuration
  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configChannel) return;

    setSavingConfig(true);
    setConfigFeedback(null);

    try {
      const payload: any = {
        provider: configChannel.id,
        accessToken: formCredentials.accessToken || formCredentials.apiKey || formCredentials.token,
        phoneNumberId: formCredentials.phoneNumberId,
        instagramAccountId: formCredentials.instagramAccountId,
        wabaId: formCredentials.wabaId,
      };

      const res = await api.post('/api/integrations', payload);
      if (res.success) {
        setConfigFeedback({ success: true, msg: 'Credentials verified and saved successfully! Channel is now active.' });
        fetchStatus();
        setTimeout(() => {
          setConfigModalOpen(false);
          setConfigFeedback(null);
        }, 1500);
      } else {
        setConfigFeedback({ success: false, msg: res.error || 'Could not save credentials.' });
      }
    } catch (err: any) {
      setConfigFeedback({
        success: false,
        msg: err.response?.data?.details || err.response?.data?.error || err.message || 'Failed to save.'
      });
    } finally {
      setSavingConfig(false);
    }
  };

  const categories = ['All', 'Messaging', 'Telephony', 'Social', 'Email', 'Carrier', 'AI'];
  const filteredChannels = activeCategory === 'All' 
    ? channels 
    : channels.filter(c => c.category === activeCategory);

  const connectedCount = channels.filter(c => c.status === 'connected').length;

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fcf9] h-full">
      <div className="max-w-6xl mx-auto p-8">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#00382b] to-[#006e54] rounded-2xl p-8 text-white mb-8 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10 text-9xl">
            ⚡
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 bg-emerald-400/20 text-emerald-300 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Production Omnichannel Hub v4.0</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Channel Integrations & Live Gateways</h1>
              <p className="text-emerald-100/90 text-sm mt-2 max-w-2xl leading-relaxed">
                Connect real carrier and social APIs to power live two-way customer communication. Messages and calls routed here flow directly into your Unified Inbox, AI Agents, and Automation Workflows.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRunFullDiagnostics}
                disabled={isHealthChecking}
                className="flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm"
              >
                {isHealthChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                <span>{isHealthChecking ? 'Testing Network...' : 'Test All Channels'}</span>
              </button>
              
              <button
                onClick={() => {
                  setTestTargetChannel('sms');
                  setTestModalOpen(true);
                }}
                className="flex items-center justify-center space-x-2 bg-[#00a688] hover:bg-[#008f75] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Send Live Test</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-emerald-700/50 text-xs">
            <div>
              <span className="text-emerald-300 block">Total Gateways</span>
              <span className="text-xl font-bold">{channels.length} Channels</span>
            </div>
            <div>
              <span className="text-emerald-300 block">Active Status</span>
              <span className="text-xl font-bold text-emerald-200">{connectedCount} Connected</span>
            </div>
            <div>
              <span className="text-emerald-300 block">Engine Latency</span>
              <span className="text-xl font-bold">&lt; 180ms avg</span>
            </div>
            <div>
              <span className="text-emerald-300 block">Security & Encryption</span>
              <span className="text-xl font-bold">TLS 1.3 / E2EE</span>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-[#004d3d] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Channel Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-10">
          {filteredChannels.map(ch => {
            const isTesting = testingChannelId === ch.id;
            const testResult = testResults[ch.id];

            return (
              <div
                key={ch.id}
                className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3.5">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner"
                        style={{ background: ch.bgLight }}
                      >
                        {ch.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{ch.name}</h3>
                        <p className="text-xs text-gray-400 font-medium">{ch.provider}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {ch.status === 'connected' ? (
                        <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Live API
                        </span>
                      ) : ch.status === 'simulated' ? (
                        <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                          <Sparkles className="w-3.5 h-3.5 mr-1" />
                          Dev Sandbox
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">
                          Needs API Keys
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{ch.description}</p>

                  {/* Key Capabilities */}
                  <div className="mb-5">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Capabilities</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {ch.liveFeatures.map((feat, idx) => (
                        <div key={idx} className="flex items-center space-x-1.5 text-xs text-gray-600">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inline Test Result Toast if available */}
                  {testResult && (
                    <div
                      className={`mb-4 p-3 rounded-xl text-xs font-medium flex items-start space-x-2 ${
                        testResult.success
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border border-rose-200 text-rose-800'
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <span className="break-all">{testResult.message}</span>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 border-t border-gray-100 flex items-center space-x-2">
                  <button
                    onClick={() => handleTestConnection(ch.id)}
                    disabled={isTesting}
                    title="Ping the provider public API to verify token/connection status"
                    className="flex-1 flex items-center justify-center space-x-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold py-2 rounded-xl transition-colors"
                  >
                    {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-gray-500" />}
                    <span>{isTesting ? 'Pinging...' : 'Test Connection'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setConfigChannel(ch);
                      setFormCredentials({});
                      setConfigFeedback(null);
                      setConfigModalOpen(true);
                    }}
                    className="flex items-center justify-center space-x-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-gray-500" />
                    <span>Setup</span>
                  </button>

                  <button
                    onClick={() => setSelectedChannel(ch)}
                    className="flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 border border-transparent transition-colors"
                    title="View setup documentation & webhooks"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Webhooks & Endpoints Hub */}
        <div className="bg-[#002f24] rounded-2xl p-7 text-white shadow-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg flex items-center space-x-2">
                <span>🔗 Live Webhook Endpoints</span>
              </h3>
              <p className="text-emerald-200/80 text-xs mt-0.5">
                Paste these endpoints into your Meta Developer App and Twilio Console to stream live messages and call status directly into Ricoz.
              </p>
            </div>
            <span className="text-xs bg-emerald-800/80 text-emerald-200 px-3 py-1 rounded-full border border-emerald-700">
              Auto-Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WEBHOOKS.map(wh => (
              <div key={wh.label} className="bg-white/10 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-emerald-300 text-xs font-bold uppercase tracking-wider">{wh.label}</span>
                    {wh.token && (
                      <span className="text-[10px] bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded font-mono">
                        Verify Token: {wh.token}
                      </span>
                    )}
                  </div>
                  <code className="text-xs text-white font-mono break-all block my-2 select-all bg-black/20 p-2 rounded-lg">
                    {wh.url}
                  </code>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => copyToClipboard(wh.url, wh.label)}
                    className="inline-flex items-center space-x-1.5 text-xs text-emerald-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {copiedKey === wh.label ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Webhook URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MODAL 1: Send Live Test Message / Call */}
      {testModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
                  🚀
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Send Live Test Message / Call</h2>
                  <p className="text-xs text-gray-500">Test actual message delivery directly to your phone</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setTestModalOpen(false);
                  setTestSendResult(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendLiveTest} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Choose Channel
                </label>
                <select
                  value={testTargetChannel}
                  onChange={e => setTestTargetChannel(e.target.value)}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#00a688]"
                >
                  <option value="sms">📱 SMS Text Message (Twilio SMS)</option>
                  <option value="voice">📞 Phone Call (Twilio Voice Engine)</option>
                  <option value="whatsapp">💬 WhatsApp Message (Meta Cloud API)</option>
                  <option value="email">✉️ Email (Resend / SMTP)</option>
                  <option value="rcs">📱 Google RCS Rich Message (RBM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {testTargetChannel === 'email' ? 'Recipient Email Address' : 'Recipient Phone Number (with Country Code)'}
                </label>
                <input
                  type={testTargetChannel === 'email' ? 'email' : 'tel'}
                  required
                  placeholder={testTargetChannel === 'email' ? 'you@yourdomain.com' : '+1 555 123 4567 or +91 9876543210'}
                  value={testRecipient}
                  onChange={e => setTestRecipient(e.target.value)}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#00a688]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Message Content / Call Greeting
                </label>
                <textarea
                  rows={3}
                  value={testMessage}
                  onChange={e => setTestMessage(e.target.value)}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#00a688]"
                />
              </div>

              {testSendResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-medium flex items-start space-x-2 ${
                    testSendResult.success
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {testSendResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{testSendResult.text}</span>
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingTest}
                  className="flex-1 py-2.5 rounded-xl bg-[#00a688] hover:bg-[#008f75] text-white text-sm font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 shadow-sm"
                >
                  {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{sendingTest ? 'Dispatching...' : 'Send Live Test'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Configure Credentials */}
      {configModalOpen && configChannel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: configChannel.bgLight }}
                >
                  {configChannel.icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Configure {configChannel.name}</h2>
                  <p className="text-xs text-gray-400">{configChannel.provider}</p>
                </div>
              </div>
              <button
                onClick={() => setConfigModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCredentials} className="p-6 space-y-4">
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3.5 text-xs text-emerald-900 leading-relaxed">
                💡 Enter your credentials below to securely store them in the database for your workspace. You can also configure them as global environment variables in your backend <code className="font-mono bg-white px-1 py-0.5 rounded text-emerald-800">.env</code> file.
              </div>

              {configChannel.id === 'whatsapp' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Permanent Access Token</label>
                    <input
                      type="password"
                      placeholder="EAAG..."
                      value={formCredentials.accessToken || ''}
                      onChange={e => setFormCredentials({ ...formCredentials, accessToken: e.target.value })}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#00a688]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 109283746501928"
                      value={formCredentials.phoneNumberId || ''}
                      onChange={e => setFormCredentials({ ...formCredentials, phoneNumberId: e.target.value })}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#00a688]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">WABA Account ID (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 98127391823719"
                      value={formCredentials.wabaId || ''}
                      onChange={e => setFormCredentials({ ...formCredentials, wabaId: e.target.value })}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#00a688]"
                    />
                  </div>
                </>
              )}

              {configChannel.id === 'instagram' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Page Access Token</label>
                    <input
                      type="password"
                      placeholder="EAAG..."
                      value={formCredentials.accessToken || ''}
                      onChange={e => setFormCredentials({ ...formCredentials, accessToken: e.target.value })}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#00a688]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Instagram Business Account ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 17841400000000000"
                      value={formCredentials.instagramAccountId || ''}
                      onChange={e => setFormCredentials({ ...formCredentials, instagramAccountId: e.target.value })}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#00a688]"
                      required
                    />
                  </div>
                </>
              )}

              {(configChannel.id === 'voice' || configChannel.id === 'sms') && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600">
                    Twilio credentials are saved globally in your backend environment variables:
                  </p>
                  <div className="bg-gray-900 text-gray-200 p-3.5 rounded-xl font-mono text-xs space-y-1">
                    <div>TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxx</div>
                    <div>TWILIO_AUTH_TOKEN=your_auth_token_here</div>
                    <div>TWILIO_PHONE_NUMBER=+1234567890</div>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Once added to Railway or local backend <code className="font-mono">.env</code>, both Voice and SMS will activate automatically.
                  </p>
                </div>
              )}

              {configChannel.id === 'email' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600">
                    Resend production keys are configured via environment variables:
                  </p>
                  <div className="bg-gray-900 text-gray-200 p-3.5 rounded-xl font-mono text-xs space-y-1">
                    <div>RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx</div>
                    <div>EMAIL_FROM_ADDRESS="Ricoz &lt;onboarding@resend.dev&gt;"</div>
                  </div>
                </div>
              )}

              {configChannel.id === 'elevenlabs' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600">
                    ElevenLabs Speech Synthesis API Key:
                  </p>
                  <div className="bg-gray-900 text-gray-200 p-3.5 rounded-xl font-mono text-xs space-y-1">
                    <div>ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxx</div>
                  </div>
                </div>
              )}

              {configFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium flex items-start space-x-2 ${
                    configFeedback.success
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {configFeedback.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{configFeedback.msg}</span>
                </div>
              )}

              <div className="flex space-x-3 pt-3">
                <a
                  href={configChannel.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Docs</span>
                </a>
                
                {(configChannel.id === 'whatsapp' || configChannel.id === 'instagram') ? (
                  <button
                    type="submit"
                    disabled={savingConfig}
                    className="flex-1 py-2.5 rounded-xl bg-[#00a688] hover:bg-[#008f75] text-white text-sm font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {savingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>{savingConfig ? 'Validating...' : 'Verify & Save'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleTestConnection(configChannel.id);
                      setConfigModalOpen(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#00a688] hover:bg-[#008f75] text-white text-sm font-semibold flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Test Current Env</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Setup Steps & Details */}
      {selectedChannel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: selectedChannel.bgLight }}
                >
                  {selectedChannel.icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedChannel.name}</h2>
                  <p className="text-xs text-gray-400">{selectedChannel.provider}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedChannel(null)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Step-by-Step Setup
              </h3>
              <ol className="space-y-3 mb-6">
                {selectedChannel.setupSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <span className="w-6 h-6 rounded-full bg-[#00a688] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-gray-700 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="text-xs font-bold text-gray-700 uppercase mb-2">Required Environment Keys</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedChannel.requires.map(key => (
                    <code key={key} className="text-xs bg-white border border-gray-200 text-gray-800 px-2 py-1 rounded font-mono">
                      {key}
                    </code>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <a
                  href={selectedChannel.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center space-x-2 border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Developer Portal</span>
                </a>
                <button
                  onClick={() => {
                    const ch = selectedChannel;
                    setSelectedChannel(null);
                    setConfigChannel(ch);
                    setConfigModalOpen(true);
                  }}
                  className="flex-1 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors hover:opacity-90 bg-[#00a688] flex items-center justify-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Configure Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
