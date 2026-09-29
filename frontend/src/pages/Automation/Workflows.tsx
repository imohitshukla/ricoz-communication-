import React from 'react';
import { GitBranch, Play, Pause, Plus, ArrowRight } from 'lucide-react';

const SAMPLE_WORKFLOWS = [
  { id: 1, name: 'Lead Qualification Flow', trigger: 'New Contact', steps: 4, status: 'active', runs: 128 },
  { id: 2, name: 'Cart Abandonment Recovery', trigger: 'Shopify: Cart Abandoned', steps: 3, status: 'paused', runs: 52 },
  { id: 3, name: 'Post-Purchase Follow-up', trigger: 'Order Confirmed', steps: 5, status: 'active', runs: 89 },
];

export function Workflows() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fcf9] h-full">
      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
            <p className="text-gray-500 text-sm mt-1">Visual multi-step automation sequences triggered by events.</p>
          </div>
          <button className="flex items-center space-x-2 bg-[#00a688] hover:bg-[#008c73] text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors">
            <Plus className="w-4 h-4" /><span>Create Workflow</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {SAMPLE_WORKFLOWS.map(wf => (
            <div key={wf.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center">
                  <GitBranch className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{wf.name}</h3>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xs text-gray-500">Trigger: <span className="font-medium text-gray-700">{wf.trigger}</span></span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{wf.steps} steps</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{wf.runs} runs</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${wf.status === 'active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500'}`}>
                  {wf.status === 'active' ? '● Active' : '⏸ Paused'}
                </span>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  {wf.status === 'active' ? <Pause className="w-4 h-4 text-gray-600" /> : <Play className="w-4 h-4 text-gray-600" />}
                </button>
                <button className="flex items-center space-x-1 bg-[#f0fbf6] hover:bg-[#d2efe0] text-[#00a688] text-xs font-bold px-3 py-2 rounded-lg transition-colors">
                  <span>Edit</span><ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-gradient-to-br from-[#1e4c3b] to-[#00a688] rounded-xl p-6 text-white">
          <h3 className="font-bold text-lg mb-1">🚀 Visual Workflow Builder</h3>
          <p className="text-green-200 text-sm mb-4">Drag-and-drop workflow builder with conditions, delays, and multi-channel branching coming soon.</p>
          <button className="bg-white text-[#1e4c3b] font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-green-50 transition-colors">
            Join Waitlist →
          </button>
        </div>
      </div>
    </div>
  );
}
