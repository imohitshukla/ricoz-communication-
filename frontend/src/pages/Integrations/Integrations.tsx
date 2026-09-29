import React, { useState } from 'react';
import { MessageSquare, Mail, Phone, Globe, ExternalLink, CheckCircle2, Settings, X, Copy, ChevronRight, Camera } from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  icon: string;
  color: string;
  status: 'connected' | 'not_connected';
  description: string;
  accountName?: string;
  setupSteps: string[];
  requiresApi: boolean;
  apiEnvKey?: string;
}

const CHANNELS: Channel[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    icon: '💬',
    color: '#25D366',
    status: 'not_connected',
    description: 'Connect your WhatsApp Business number via Meta Cloud API to send & receive messages.',
    setupSteps: [
      'Go to Meta for Developers → Create a WhatsApp Business App',
      'Get your Phone Number ID and Permanent Access Token',
      'Add WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN to Railway env vars',
      'Set webhook URL to: https://ricoz-backend-production.up.railway.app/api/whatsapp/webhook',
      'Set verify token to: ricoz_webhook_token',
    ],
    requiresApi: true,
    apiEnvKey: 'WHATSAPP_ACCESS_TOKEN',
  },
  {
    id: 'instagram',
    name: 'Instagram DMs',
    icon: '📸',
    color: '#E1306C',
    status: 'not_connected',
    description: 'Respond to Instagram DMs and story mentions automatically.',
    setupSteps: [
      'Connect your Instagram Business account to your Facebook Page',
      'Go to Meta for Developers → Create an Instagram Messaging App',
      'Get your Instagram Page Access Token',
      'Add INSTAGRAM_ACCESS_TOKEN to Railway env vars',
      'Set webhook URL for instagram_messaging events',
    ],
    requiresApi: true,
    apiEnvKey: 'INSTAGRAM_ACCESS_TOKEN',
  },
  {
    id: 'email',
    name: 'Email (SMTP)',
    icon: '✉️',
    color: '#4285F4',
    status: 'not_connected',
    description: 'Send automated email notifications and campaign emails.',
    setupSteps: [
      'Get your SMTP credentials from Gmail, SendGrid, or Mailgun',
      'Add SMTP_HOST, SMTP_USER, SMTP_PASS to Railway env vars',
      'Test by sending a campaign from the Campaigns page',
    ],
    requiresApi: true,
    apiEnvKey: 'SMTP_HOST',
  },
  {
    id: 'voice',
    name: 'Voice Calling (Twilio)',
    icon: '📞',
    color: '#F22F46',
    status: 'not_connected',
    description: 'Handle inbound & outbound calls with AI-powered voice agents.',
    setupSteps: [
      'Create a Twilio account at twilio.com',
      'Get a phone number and find your Account SID and Auth Token',
      'Add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to Railway env vars',
      'Configure your Twilio number webhook to point to the voice route',
    ],
    requiresApi: true,
    apiEnvKey: 'TWILIO_ACCOUNT_SID',
  },
  {
    id: 'website',
    name: 'Website Chat Widget',
    icon: '🌐',
    color: '#00a688',
    status: 'connected',
    accountName: 'ricoz-communication-74lg.vercel.app',
    description: 'Embed a live chat widget on your website. Visitors can start WhatsApp conversations.',
    setupSteps: [],
    requiresApi: false,
  },
];

export function Integrations() {
  const [channels, setChannels] = useState(CHANNELS);
  const [selected, setSelected] = useState<Channel | null>(null);
  const [copied, setCopied] = useState('');

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const WEBHOOK_URL = 'https://ricoz-backend-production.up.railway.app/api/whatsapp/webhook';
  const VERIFY_TOKEN = 'ricoz_webhook_token';

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fcf9] h-full">
      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Channel Integrations</h1>
          <p className="text-gray-500 text-sm mt-1">Connect your communication channels to Ricoz. All conversations flow into one unified inbox.</p>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {channels.map(ch => (
            <div key={ch.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: ch.color + '20' }}>
                    {ch.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{ch.name}</h3>
                    {ch.status === 'connected'
                      ? <span className="flex items-center text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full mt-1">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
                        </span>
                      : <span className="text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full mt-1 inline-block">
                          Not Connected
                        </span>
                    }
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4">{ch.description}</p>
              {ch.status === 'connected' ? (
                <div className="flex space-x-2">
                  <button className="flex-1 flex items-center justify-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" /><span>Configure</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSelected(ch)}
                  className="w-full flex items-center justify-center space-x-2 text-white text-sm font-semibold py-2 rounded-lg transition-colors hover:opacity-90"
                  style={{ backgroundColor: ch.color }}
                >
                  <span>Connect {ch.name}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Quick Webhook Info */}
        <div className="bg-[#1e4c3b] rounded-xl p-6 text-white">
          <h3 className="font-bold text-lg mb-1">🔗 Your Webhook Endpoints</h3>
          <p className="text-green-200 text-sm mb-4">Use these URLs when setting up Meta webhooks for WhatsApp & Instagram</p>
          <div className="space-y-3">
            {[
              { label: 'WhatsApp Webhook URL', value: WEBHOOK_URL },
              { label: 'Verify Token', value: VERIFY_TOKEN },
            ].map(item => (
              <div key={item.label} className="bg-white/10 rounded-lg px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-green-300 text-xs font-bold uppercase tracking-wider mb-0.5">{item.label}</div>
                  <code className="text-white text-sm font-mono">{item.value}</code>
                </div>
                <button
                  onClick={() => copy(item.value, item.label)}
                  className="ml-4 bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                >
                  {copied === item.label ? <CheckCircle2 className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Setup Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: selected.color + '20' }}>
                  {selected.icon}
                </div>
                <h2 className="text-lg font-bold text-gray-900">Connect {selected.name}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5">
                <p className="text-sm text-amber-800 font-medium">
                  ⚡ This integration requires an API key. Follow the steps below and add the credentials to your Railway backend environment variables.
                </p>
              </div>

              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Setup Steps</h3>
              <ol className="space-y-3 mb-5">
                {selected.setupSteps.map((step, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <span className="w-6 h-6 rounded-full bg-[#00a688] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-sm text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>

              {selected.id === 'whatsapp' && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-gray-500 uppercase">Webhook URL</div>
                      <code className="text-xs text-gray-900">{WEBHOOK_URL}</code>
                    </div>
                    <button onClick={() => copy(WEBHOOK_URL, 'wh')} className="p-1.5 hover:bg-gray-200 rounded">
                      {copied === 'wh' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-gray-500 uppercase">Verify Token</div>
                      <code className="text-xs text-gray-900">{VERIFY_TOKEN}</code>
                    </div>
                    <button onClick={() => copy(VERIFY_TOKEN, 'vt')} className="p-1.5 hover:bg-gray-200 rounded">
                      {copied === 'vt' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <a
                  href={
                    selected.id === 'whatsapp' ? 'https://developers.facebook.com/docs/whatsapp/cloud-api/get-started' :
                    selected.id === 'instagram' ? 'https://developers.facebook.com/docs/messenger-platform/instagram' :
                    selected.id === 'email' ? 'https://sendgrid.com/docs/for-developers/sending-email/api-getting-started/' :
                    'https://www.twilio.com/docs/voice/quickstart'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Official Docs</span>
                </a>
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors hover:opacity-90"
                  style={{ backgroundColor: selected.color }}
                >
                  Got It!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
