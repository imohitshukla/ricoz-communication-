import React, { useState } from 'react';
import { Brain, Plus, Trash2, Save, CheckCircle } from 'lucide-react';

interface Intent {
  id: string;
  name: string;
  keywords: string[];
  response: string;
  isActive: boolean;
}

export function AIIntentMatching() {
  const [intents, setIntents] = useState<Intent[]>([
    {
      id: '1',
      name: 'Pricing Inquiry',
      keywords: ['price', 'cost', 'how much', 'fee', 'plan'],
      response: 'Our plans start from ₹999/month. You can check all pricing at ricoz.com/pricing or I can connect you with a sales rep!',
      isActive: true
    },
    {
      id: '2',
      name: 'Support Request',
      keywords: ['help', 'problem', 'issue', 'error', 'not working'],
      response: 'I\'m here to help! Please describe your issue and I\'ll do my best to assist. For complex issues, I\'ll connect you to a human agent.',
      isActive: true
    },
    {
      id: '3',
      name: 'Human Handoff',
      keywords: ['agent', 'human', 'person', 'talk to someone'],
      response: 'Connecting you to a live agent right away! Please hold on for a moment.',
      isActive: true
    },
  ]);
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fcf9] h-full">
      {toast && <div className="fixed top-4 right-4 z-50 bg-[#1e4c3b] text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">{toast}</div>}
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <Brain className="w-7 h-7 text-purple-500" />
              <h1 className="text-2xl font-bold text-gray-900">AI Intent Matching</h1>
            </div>
            <p className="text-gray-500 text-sm">Train the AI to understand customer intent and respond appropriately — even when phrasing varies.</p>
          </div>
          <button
            onClick={() => setIntents(p => [...p, { id: Date.now().toString(), name: 'New Intent', keywords: [], response: '', isActive: false }])}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /><span>Add Intent</span>
          </button>
        </div>

        <div className="space-y-4">
          {intents.map((intent) => (
            <div key={intent.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <input
                  className="font-bold text-gray-900 text-sm bg-transparent border-b border-dashed border-gray-300 focus:outline-none focus:border-purple-500"
                  value={intent.name}
                  onChange={e => setIntents(p => p.map(i => i.id === intent.id ? { ...i, name: e.target.value } : i))}
                />
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-10 h-5 rounded-full cursor-pointer transition-colors relative ${intent.isActive ? 'bg-purple-600' : 'bg-gray-300'}`}
                    onClick={() => setIntents(p => p.map(i => i.id === intent.id ? { ...i, isActive: !i.isActive } : i))}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${intent.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <button onClick={() => { setIntents(p => p.filter(i => i.id !== intent.id)); showToast('Intent removed'); }} className="p-1.5 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Training Keywords (comma separated)</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  value={intent.keywords.join(', ')}
                  onChange={e => setIntents(p => p.map(i => i.id === intent.id ? { ...i, keywords: e.target.value.split(',').map(k => k.trim()) } : i))}
                  placeholder="e.g. price, cost, how much, charges"
                />
              </div>

              <div className="mb-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">AI Response</label>
                <textarea
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                  value={intent.response}
                  onChange={e => setIntents(p => p.map(i => i.id === intent.id ? { ...i, response: e.target.value } : i))}
                  placeholder="What should the AI say when this intent is detected?"
                />
              </div>

              <div className="flex justify-end">
                <button onClick={() => showToast('✅ Intent saved!')} className="flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                  <Save className="w-3.5 h-3.5" /><span>Save Intent</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-purple-50 border border-purple-100 rounded-xl p-4 text-sm text-purple-700">
          <strong>🧠 How AI Intent Matching works:</strong> The AI analyzes incoming messages and matches them against your defined intents. If a match is found with high confidence (&gt;80%), it uses your custom response. Otherwise, it falls back to general AI generation.
        </div>
      </div>
    </div>
  );
}
