import React, { useState } from 'react';
import { MessageSquare, Plus, Trash2, Save, CheckCircle } from 'lucide-react';

const CHANNEL_OPTIONS = ['WhatsApp', 'Instagram', 'Both'];

interface Flow {
  id: string;
  trigger: string;
  channel: string;
  messages: string[];
  isActive: boolean;
}

export function CustomAutoReply() {
  const [flows, setFlows] = useState<Flow[]>([
    { id: '1', trigger: 'First Message', channel: 'WhatsApp', messages: ['Hi there! 👋 Thanks for reaching out to us. How can we help you today?'], isActive: true },
    { id: '2', trigger: 'Out of Hours', channel: 'Both', messages: ['We\'re currently out of office. Our team will respond within 24 hours. For urgent queries, email us at support@ricoz.com'], isActive: true },
  ]);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const toggle = (id: string) => setFlows(p => p.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f));
  const remove = (id: string) => { setFlows(p => p.filter(f => f.id !== id)); showToast('Flow removed'); };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fcf9] h-full">
      {toast && <div className="fixed top-4 right-4 z-50 bg-[#1e4c3b] text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">{toast}</div>}
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Custom Auto Reply</h1>
            <p className="text-gray-500 text-sm mt-1">Build custom greeting flows and out-of-hours replies for each channel.</p>
          </div>
          <button
            onClick={() => {
              const id = Date.now().toString();
              setFlows(p => [...p, { id, trigger: 'New Flow', channel: 'WhatsApp', messages: [''], isActive: false }]);
            }}
            className="flex items-center space-x-2 bg-[#00a688] hover:bg-[#008c73] text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /><span>New Flow</span>
          </button>
        </div>

        <div className="space-y-4">
          {flows.map(flow => (
            <div key={flow.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#f0fbf6] rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-[#00a688]" />
                  </div>
                  <input
                    className="font-bold text-gray-900 bg-transparent border-b border-dashed border-gray-300 focus:outline-none focus:border-[#00a688] text-sm"
                    value={flow.trigger}
                    onChange={e => setFlows(p => p.map(f => f.id === flow.id ? { ...f, trigger: e.target.value } : f))}
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <select
                    value={flow.channel}
                    onChange={e => setFlows(p => p.map(f => f.id === flow.id ? { ...f, channel: e.target.value } : f))}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#00a688]"
                  >
                    {CHANNEL_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <label className="flex items-center cursor-pointer">
                    <div className={`w-10 h-5 rounded-full transition-colors relative ${flow.isActive ? 'bg-[#00a688]' : 'bg-gray-300'}`} onClick={() => toggle(flow.id)}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${flow.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                  </label>
                  <button onClick={() => remove(flow.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </div>
              {flow.messages.map((msg, i) => (
                <textarea
                  key={i}
                  rows={2}
                  value={msg}
                  onChange={e => setFlows(p => p.map(f => f.id === flow.id ? { ...f, messages: f.messages.map((m, mi) => mi === i ? e.target.value : m) } : f))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a688] resize-none"
                  placeholder="Type your auto-reply message..."
                />
              ))}
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => { showToast('✅ Flow saved!'); }}
                  className="flex items-center space-x-1.5 bg-[#1e4c3b] hover:bg-[#153a2d] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  <Save className="w-3.5 h-3.5" /><span>Save</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
