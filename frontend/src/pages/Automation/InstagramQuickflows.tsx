import React from 'react';
import { Camera, ArrowRight, CheckCircle2, Zap } from 'lucide-react';

const QUICKFLOWS = [
  {
    id: 1,
    name: 'Story Mention Reply',
    trigger: 'User mentions your story',
    action: 'Send a thank-you DM with a CTA',
    status: 'active',
    icon: '📣',
  },
  {
    id: 2,
    name: 'Comment Auto-Reply',
    trigger: 'User comments on your post',
    action: 'Reply publicly + send DM with offer',
    status: 'active',
    icon: '💬',
  },
  {
    id: 3,
    name: 'DM Lead Capture',
    trigger: 'User sends "DM" keyword',
    action: 'Collect name, email, phone via DM flow',
    status: 'paused',
    icon: '🎯',
  },
  {
    id: 4,
    name: 'Bio Link Click Flow',
    trigger: 'User clicks "Message" button',
    action: 'Send welcome message + product catalog',
    status: 'paused',
    icon: '🔗',
  },
];

export function InstagramQuickflows() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fcf9] h-full">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Instagram Quickflows</h1>
          </div>
          <p className="text-gray-500 text-sm">Automate Instagram DMs, comment replies, and story mention responses.</p>
        </div>

        {/* Connect Instagram Banner */}
        <div className="bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-xl p-5 mb-8 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1">📸 Connect Instagram First</h3>
            <p className="text-white/80 text-sm">Link your Instagram Business account to enable these automations.</p>
          </div>
          <a href="/dashboard/integrations" className="bg-white text-[#dc2743] font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-pink-50 transition-colors whitespace-nowrap flex items-center space-x-2">
            <span>Connect Instagram</span><ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {QUICKFLOWS.map(flow => (
            <div key={flow.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl">{flow.icon}</div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${flow.status === 'active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500'}`}>
                  {flow.status === 'active' ? '● Active' : '⏸ Paused'}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{flow.name}</h3>
              <div className="space-y-1 mb-4">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Zap className="w-3 h-3 text-orange-500" />
                  <span><strong>When:</strong> {flow.trigger}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span><strong>Then:</strong> {flow.action}</span>
                </div>
              </div>
              <button className="w-full border border-gray-200 hover:border-[#dc2743] hover:text-[#dc2743] text-gray-600 text-sm font-semibold py-2 rounded-lg transition-colors">
                {flow.status === 'active' ? 'Configure' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
