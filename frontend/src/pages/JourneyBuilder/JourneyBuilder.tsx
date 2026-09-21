import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Play, Pause, MessageSquare, Zap, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

type Rule = {
  id: string;
  keyword: string;
  replyText: string;
  isActive: boolean;
};

export function JourneyBuilder() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/rules');
      setRules(res.data);
    } catch (err) {
      console.error('Error fetching rules:', err);
    }
  };

  const handleSaveRule = async () => {
    if (!keyword || !replyText) return;
    setIsLoading(true);
    try {
      await axios.post('http://localhost:3000/api/rules', { keyword, replyText });
      await fetchRules();
      setIsModalOpen(false);
      setKeyword('');
      setReplyText('');
    } catch (err) {
      console.error('Error saving rule:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/api/rules/${id}`);
      setRules(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error deleting rule:', err);
    }
  };

  const handleToggleRule = async (id: string, isActive: boolean) => {
    try {
      await axios.put(`http://localhost:3000/api/rules/${id}/toggle`, { isActive });
      setRules(prev => prev.map(r => r.id === id ? { ...r, isActive } : r));
    } catch (err) {
      console.error('Error toggling rule:', err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold">Auto-Reply Rules</h1>
          <p className="text-secondary mt-1">Set up automated responses based on customer keywords.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-brand-primary text-white px-4 py-2 rounded-md shadow-raised hover:opacity-90 transition-opacity font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Rule</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-secondary text-sm font-medium">Active Rules</h3>
          <div className="mt-2 text-3xl font-semibold text-success">{rules.filter(r => r.isActive).length}</div>
        </div>
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-secondary text-sm font-medium">Total Rules</h3>
          <div className="mt-2 text-3xl font-semibold">{rules.length}</div>
        </div>
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm bg-gradient-to-br from-brand-primary/5 to-transparent">
          <h3 className="text-secondary text-sm font-medium">Automated Responses</h3>
          <div className="mt-2 text-3xl font-semibold text-brand-primary">24/7</div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-4">
          {rules.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-12 text-center text-secondary">
              <Zap className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No auto-reply rules found. Create one to automate your customer support.</p>
            </div>
          ) : (
            rules.map((rule) => (
              <div key={rule.id} className="bg-surface border border-border rounded-xl p-6 shadow-sm flex items-start justify-between hover:border-brand-primary/30 transition-colors">
                <div className="flex-1 pr-8">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-semibold text-lg text-primary">If message contains:</span>
                    <span className="bg-sunken border border-border px-3 py-1 rounded-full text-brand-primary font-mono text-sm">
                      "{rule.keyword}"
                    </span>
                  </div>
                  <div className="flex items-start space-x-3 mt-4">
                    <MessageSquare className="w-5 h-5 text-success mt-0.5" />
                    <div>
                      <span className="font-semibold text-sm text-primary block mb-1">Bot replies with:</span>
                      <p className="text-sm text-secondary bg-sunken p-3 rounded-lg border border-border inline-block">
                        {rule.replyText}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-4 shrink-0">
                  <div className="flex items-center space-x-2">
                    <span className={cn("text-xs font-medium", rule.isActive ? "text-success" : "text-secondary")}>
                      {rule.isActive ? 'Active' : 'Paused'}
                    </span>
                    <button 
                      onClick={() => handleToggleRule(rule.id, !rule.isActive)}
                      className={cn(
                        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                        rule.isActive ? "bg-success" : "bg-border"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                        rule.isActive ? "translate-x-4" : "translate-x-1"
                      )} />
                    </button>
                  </div>
                  <button 
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-2 text-danger hover:bg-danger/10 rounded transition-colors" 
                    title="Delete Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-border">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-xl font-semibold">New Auto-Reply Rule</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-secondary hover:text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Keyword</label>
                <input 
                  type="text" 
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full bg-sunken border border-border rounded-md px-4 py-2 text-sm focus:outline-none focus:border-brand-primary/50"
                  placeholder="e.g. pricing"
                />
                <p className="text-xs text-secondary mt-1">Triggered if the customer's message contains this word.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bot Reply Message</label>
                <textarea 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="w-full bg-sunken border border-border rounded-md px-4 py-2 text-sm focus:outline-none focus:border-brand-primary/50 resize-none"
                  placeholder="Type the automated response..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-border bg-sunken flex justify-end space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-md font-medium text-sm text-secondary hover:bg-surface border border-transparent hover:border-border transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveRule}
                disabled={isLoading || !keyword || !replyText}
                className="px-6 py-2 bg-brand-primary text-white rounded-md font-bold text-sm shadow-raised hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
