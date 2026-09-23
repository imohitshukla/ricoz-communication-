import React, { useState, useEffect } from 'react';
import { PlayCircle, Globe, FileText, Database, GitBranch, ShoppingBag, Save, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

export function WhatsAppAIAgent() {
  const [isActive, setIsActive] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful customer support agent for Ricoz.');
  const [businessContext, setBusinessContext] = useState('');
  const [faq, setFaq] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await api.get('/api/ai/config');
        setIsActive(data.isActive);
        setSystemPrompt(data.systemPrompt);
        setBusinessContext(data.businessContext || '');
        setFaq(data.faq || '');
      } catch (err) {
        console.error('Failed to load AI config', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      await api.post('/api/ai/config', {
        isActive,
        systemPrompt,
        businessContext,
        faq
      });
      setMessage('AI Agent configuration saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save AI config', err);
      setMessage('Failed to save configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white h-full">
        <div className="animate-spin w-8 h-8 border-4 border-[#00a688] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white h-full flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200 sticky top-0 bg-white z-20">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-bold text-gray-900">Build Your AI Agent</h2>
          <button className="flex items-center space-x-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-red-100 transition-colors">
            <PlayCircle className="w-4 h-4 fill-current text-red-500 bg-white rounded-full" />
            <span>Watch Tutorial</span>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          {message && (
            <span className={`text-sm font-medium ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </span>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#00a688] hover:bg-[#008c73] disabled:opacity-50 text-white font-semibold px-6 py-2 rounded text-sm transition-colors flex items-center space-x-2 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      <div className="p-8 max-w-[1000px] w-full mx-auto">
        {/* Warning/Info Box */}
        <div className="mb-6">
          <p className="text-sm text-gray-800">
            <span className="font-bold text-yellow-600 mr-1">😁 First 7 days are completely free — no charges on any conversations.</span>
            <br />
            After your free trial ends, the AI Agent will be paused. Cost after Free Trial: <span className="font-bold">₹3000/month & ₹0.5 per AI message.</span>
          </p>
        </div>

        {/* Hero Banner */}
        <div className="bg-[#f2fbf7] border border-[#d2efe0] rounded-t-2xl p-8 relative overflow-hidden flex justify-between items-center mb-6">
          <div className="max-w-xl relative z-10">
            <div className="flex items-center space-x-4 mb-4">
              <h1 className="text-3xl font-bold text-gray-900">AI Sales Agent Settings</h1>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${isActive ? 'bg-[#00a688]' : 'bg-gray-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isActive ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <div className="ml-3 text-gray-700 font-medium">
                  {isActive ? 'Agent is Active' : 'Agent is Paused'}
                </div>
              </label>
            </div>
            <p className="text-gray-600 text-[15px] mb-8 leading-relaxed">
              Configure how your AI Agent responds to customers. The agent uses Google Gemini to generate dynamic, contextual responses based on the rules below.
            </p>
          </div>
          
          <div className="relative z-10 pr-8 hidden md:block">
            <div className="w-32 h-32 bg-[#d2efe0] rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <Database className="w-12 h-12 text-[#00a688]" />
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="p-6 space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">System Prompt / Role</label>
              <p className="text-xs text-gray-500 mb-2">Define the AI's persona, tone, and core objective.</p>
              <textarea 
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a688] focus:border-transparent font-medium"
                placeholder="You are a helpful customer support agent for Ricoz..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Business Context</label>
              <p className="text-xs text-gray-500 mb-2">Information about your company, products, and services the AI should know.</p>
              <textarea 
                value={businessContext}
                onChange={(e) => setBusinessContext(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a688] focus:border-transparent font-medium"
                placeholder="Ricoz Communication provides omnichannel SaaS for WhatsApp and Instagram. Pricing starts at ₹3499/qtr."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Frequently Asked Questions (Knowledge Base)</label>
              <p className="text-xs text-gray-500 mb-2">Specific answers to common questions so the AI doesn't hallucinate.</p>
              <textarea 
                value={faq}
                onChange={(e) => setFaq(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a688] focus:border-transparent font-medium"
                placeholder="Q: Do you offer a free trial? A: Yes, we offer a 14-day free trial."
              />
            </div>

          </div>
        </div>

        {/* Workflow Info Box */}
        <div className="bg-[#f8fcf9] border border-gray-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <GitBranch className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="text-[#008cDD] font-bold text-[15px] mb-1">Works alongside your existing workflows</h4>
              <p className="text-sm text-gray-600">Your existing automations and auto-replies always take priority. The AI bot only responds when no exact keyword rule matches.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
