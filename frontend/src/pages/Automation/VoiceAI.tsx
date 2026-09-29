import React, { useState } from 'react';
import { Phone, Mic, Play, Pause, Settings, ArrowRight, CheckCircle2 } from 'lucide-react';

export function VoiceAI() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [greeting, setGreeting] = useState("Hi! Thank you for calling Ricoz. I'm your AI assistant. How can I help you today?");

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fcf9] h-full">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Voice AI – Inbound Calls</h1>
          </div>
          <p className="text-gray-500 text-sm">An AI-powered IVR that picks up inbound calls, qualifies leads, and routes to agents.</p>
        </div>

        {/* Twilio Connect Banner */}
        <div className="bg-[#F22F46] rounded-xl p-5 mb-6 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1">📞 Connect Twilio to Enable Calls</h3>
            <p className="text-white/80 text-sm">Add your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to Railway environment variables.</p>
          </div>
          <a href="/dashboard/integrations" className="bg-white text-[#F22F46] font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-red-50 transition-colors whitespace-nowrap flex items-center space-x-2">
            <span>Setup</span><ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Config Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">AI Voice Agent</h2>
            <label className="flex items-center space-x-2 cursor-pointer">
              <span className="text-sm text-gray-600">{isEnabled ? 'Enabled' : 'Disabled'}</span>
              <div className={`w-12 h-6 rounded-full transition-colors relative ${isEnabled ? 'bg-red-500' : 'bg-gray-300'}`} onClick={() => setIsEnabled(p => !p)}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
              </div>
            </label>
          </div>

          <div className="mb-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Opening Greeting Script</label>
            <textarea
              rows={3}
              value={greeting}
              onChange={e => setGreeting(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Language', value: 'Hindi / English', icon: '🌐' },
              { label: 'Voice Gender', value: 'Female', icon: '🎙️' },
              { label: 'Transfer To', value: '+91 98XXXXXX00', icon: '📲' },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="text-lg mb-1">{item.icon}</div>
                <div className="text-xs text-gray-500 font-medium">{item.label}</div>
                <div className="text-sm font-bold text-gray-900">{item.value}</div>
              </div>
            ))}
          </div>

          <button className="bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors">
            Save Configuration
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { title: 'Automatic Call Transcription', desc: 'Every call is transcribed and saved in the contact timeline', status: true },
            { title: 'Lead Qualification IVR', desc: 'Ask qualifying questions automatically before connecting to agent', status: true },
            { title: 'Missed Call WhatsApp', desc: 'Auto-send WhatsApp message when call is missed', status: true },
            { title: 'Call Recording', desc: 'Record and replay all inbound calls from the inbox', status: false },
          ].map(f => (
            <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className={`w-5 h-5 mt-0.5 ${f.status ? 'text-green-500' : 'text-gray-300'}`} />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{f.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
