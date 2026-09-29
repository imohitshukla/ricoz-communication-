import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Zap, Save, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface Rule {
  id?: string;
  keyword: string;
  replyText: string;
  isActive: boolean;
}

export function BasicAutomations() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newReply, setNewReply] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    api.get('/api/rules').then((data: any) => {
      setRules(Array.isArray(data) ? data : []);
    }).catch(() => setRules([])).finally(() => setLoading(false));
  }, []);

  const addRule = async () => {
    if (!newKeyword.trim() || !newReply.trim()) return;
    setSaving(true);
    try {
      const created = await api.post('/api/rules', { keyword: newKeyword, replyText: newReply, isActive: true });
      setRules(prev => [...prev, created]);
      setNewKeyword(''); setNewReply('');
      showToast('✅ Rule created successfully!');
    } catch { showToast('❌ Failed to create rule'); }
    finally { setSaving(false); }
  };

  const toggleRule = async (rule: Rule) => {
    if (!rule.id) return;
    try {
      const updated = await api.put(`/api/rules/${rule.id}`, { ...rule, isActive: !rule.isActive });
      setRules(prev => prev.map(r => r.id === rule.id ? updated : r));
    } catch { showToast('Failed to update rule'); }
  };

  const deleteRule = async (id: string) => {
    try {
      await api.delete(`/api/rules/${id}`);
      setRules(prev => prev.filter(r => r.id !== id));
      showToast('Rule deleted');
    } catch { showToast('Failed to delete rule'); }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fcf9] h-full">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#1e4c3b] text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" /><span>{toast}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-[#00a688] rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Basic Automations</h1>
          </div>
          <p className="text-gray-500 text-sm ml-13">Set keyword-triggered auto-replies. When a customer sends a matching keyword, they instantly get your reply.</p>
        </div>

        {/* Add New Rule */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">➕ Add New Auto-Reply Rule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Trigger Keyword</label>
              <input
                value={newKeyword}
                onChange={e => setNewKeyword(e.target.value)}
                placeholder="e.g. pricing, hello, support"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a688] focus:border-transparent"
                onKeyDown={e => e.key === 'Enter' && addRule()}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Auto-Reply Message</label>
              <input
                value={newReply}
                onChange={e => setNewReply(e.target.value)}
                placeholder="e.g. Our pricing starts at ₹999/month..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a688] focus:border-transparent"
                onKeyDown={e => e.key === 'Enter' && addRule()}
              />
            </div>
          </div>
          <button
            onClick={addRule}
            disabled={saving || !newKeyword.trim() || !newReply.trim()}
            className="flex items-center space-x-2 bg-[#00a688] hover:bg-[#008c73] disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Add Rule'}</span>
          </button>
        </div>

        {/* Rules List */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Active Rules ({rules.length})</h2>
            <span className="text-xs text-gray-400">Rules are checked in order for incoming messages</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin w-8 h-8 border-4 border-[#00a688] border-t-transparent rounded-full"></div>
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-16">
              <Zap className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No rules yet</p>
              <p className="text-gray-400 text-sm">Add your first keyword rule above to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {rules.map((rule, i) => (
                <div key={rule.id || i} className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="bg-[#f0fbf6] text-[#00a688] border border-[#d2efe0] text-xs font-bold px-2.5 py-1 rounded-full">
                        {rule.keyword}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${rule.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {rule.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{rule.replyText}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleRule(rule)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title={rule.isActive ? 'Pause rule' : 'Activate rule'}
                    >
                      {rule.isActive
                        ? <ToggleRight className="w-5 h-5 text-[#00a688]" />
                        : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                    </button>
                    <button
                      onClick={() => rule.id && deleteRule(rule.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
          <strong>💡 How it works:</strong> When a customer sends a WhatsApp message containing your keyword (case-insensitive), the system automatically sends the reply. Rules are checked before the AI agent responds.
        </div>
      </div>
    </div>
  );
}
