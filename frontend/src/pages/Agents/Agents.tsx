import { useState } from 'react';
import { Bot, FileText, Globe, Upload, Settings2, Sparkles, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Agents() {
  const [activeTab, setActiveTab] = useState<'knowledge' | 'behavior' | 'test'>('knowledge');

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <Bot className="w-8 h-8 text-brand-primary mr-3" />
            AI Agent Studio
          </h1>
          <p className="text-secondary mt-1">Configure your RAG-powered support copilot.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 mr-4">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-success">Agent is Active</span>
          </div>
          <button className="bg-brand-primary text-white px-4 py-2 rounded-md shadow-raised hover:opacity-90 transition-opacity font-medium text-sm">
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-8 min-h-0">
        {/* Left Column: Configuration */}
        <div className="w-2/3 flex flex-col h-full bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          
          <div className="flex border-b border-border bg-sunken">
            <button 
              onClick={() => setActiveTab('knowledge')}
              className={cn("px-6 py-4 text-sm font-medium border-b-2 transition-colors", activeTab === 'knowledge' ? "border-brand-primary text-brand-primary bg-surface" : "border-transparent text-secondary hover:text-primary")}
            >
              Knowledge Base
            </button>
            <button 
              onClick={() => setActiveTab('behavior')}
              className={cn("px-6 py-4 text-sm font-medium border-b-2 transition-colors", activeTab === 'behavior' ? "border-brand-primary text-brand-primary bg-surface" : "border-transparent text-secondary hover:text-primary")}
            >
              Behavior & Tone
            </button>
            <button 
              onClick={() => setActiveTab('test')}
              className={cn("px-6 py-4 text-sm font-medium border-b-2 transition-colors lg:hidden", activeTab === 'test' ? "border-brand-primary text-brand-primary bg-surface" : "border-transparent text-secondary hover:text-primary")}
            >
              Test Preview
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {activeTab === 'knowledge' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Data Sources</h3>
                  <p className="text-sm text-secondary mb-4">Upload documents or link websites to train your agent. It will strictly cite these sources to prevent hallucinations.</p>
                  
                  <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center bg-sunken/50 hover:bg-sunken transition-colors cursor-pointer mb-6">
                    <Upload className="w-8 h-8 text-brand-primary mb-3" />
                    <p className="font-medium text-primary">Click to upload or drag and drop</p>
                    <p className="text-xs text-secondary mt-1">PDF, DOCX, TXT, or CSV (Max 10MB)</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-secondary text-center py-4">No sources added yet. Upload files or link URLs to start training your agent.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'behavior' && (
              <div className="space-y-8">
                <div>
                  <h3 className="font-semibold mb-3">Agent Persona</h3>
                  <textarea 
                    className="w-full h-32 bg-sunken border border-border rounded-xl p-4 text-sm focus:outline-none focus:border-brand-primary/50 transition-colors resize-none"
                    defaultValue="You are a helpful, professional, and friendly customer support agent for Ricoz. You must answer concisely. If you do not know the answer, politely offer to connect the user to a human agent."
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Tone Setting</h3>
                  <div className="flex space-x-4">
                    {['Professional', 'Friendly', 'Empathetic', 'Direct'].map((tone, i) => (
                      <button key={tone} className={cn(
                        "px-4 py-2 rounded-full border text-sm font-medium transition-colors",
                        i === 1 ? "border-brand-primary bg-brand-primary/10 text-brand-primary" : "border-border bg-base text-secondary hover:text-primary hover:border-brand-primary/50"
                      )}>
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Settings2 className="w-4 h-4 mr-2" /> Handoff Rules
                  </h3>
                  <div className="bg-base border border-border rounded-xl p-4 space-y-4">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary bg-surface border-border" />
                      <span className="text-sm font-medium">Transfer to human when sentiment is highly negative</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary bg-surface border-border" />
                      <span className="text-sm font-medium">Transfer if the user explicitly asks for a "human" or "manager"</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sandbox/Test (Hidden on mobile unless active tab) */}
        <div className={cn(
          "w-1/3 flex flex-col h-full bg-surface border border-border rounded-xl shadow-sm overflow-hidden",
          "hidden lg:flex"
        )}>
          <div className="h-14 border-b border-border bg-sunken flex items-center justify-center relative">
            <h3 className="font-semibold text-primary">Sandbox Preview</h3>
            <div className="absolute right-4 text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              Live AI
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-base flex items-center justify-center">
            <div className="text-center text-secondary">
              <Bot className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Sandbox ready.<br/>Send a message to test your agent.</p>
            </div>
          </div>

          <div className="p-4 bg-surface border-t border-border">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Message the agent..." 
                className="w-full bg-sunken border border-border rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-brand-primary/50 transition-colors"
              />
              <button className="absolute right-1 top-1 w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity">
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
