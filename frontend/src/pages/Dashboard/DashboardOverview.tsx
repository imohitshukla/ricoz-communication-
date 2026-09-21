import { useState } from 'react';
import { Bot, MessageSquare, ListPlus, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DashboardOverview() {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'instagram'>('whatsapp');
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f9fa] h-full">
      <div className="max-w-[1200px] mx-auto p-8">
        
        <h1 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Welcome to Ricoz, Mohit!</h1>

        {/* Main Dashboard Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          
          {/* Tabs */}
          <div className="flex px-6 pt-6 pb-4 space-x-3 border-b border-gray-100">
            <button 
              onClick={() => setActiveTab('whatsapp')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeTab === 'whatsapp' ? 'bg-[#00a688] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
            <button 
              onClick={() => setActiveTab('instagram')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeTab === 'instagram' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold">@</span>
              <span>Instagram</span>
            </button>
          </div>

          <div className="p-6">
            {/* AI Agent Banner */}
            <div className="bg-[#f0fbf6] border border-[#d2efe0] rounded-lg p-5 flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#00a688] rounded-lg flex items-center justify-center shrink-0">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold text-lg mb-1">Build Your AI Agent</h3>
                  <p className="text-gray-600 text-sm">Create an AI agent to handle conversations, answer questions, qualify leads, and assist customers automatically.</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/dashboard/automation/ai-agent')}
                className="bg-[#1e4c3b] hover:bg-[#153a2d] text-white font-semibold px-5 py-2.5 rounded shrink-0 transition-colors"
              >
                Create Agent
              </button>
            </div>

            {/* Quick Setup Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              
              {/* Connect Number */}
              <div className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between relative">
                <div className="absolute -top-3 right-4 bg-yellow-100 border border-yellow-200 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                  <span>💡</span>
                  <span>Rs. 400</span>
                  <span className="text-gray-400 font-normal">ⓘ</span>
                </div>
                <div className="flex items-start space-x-3 mb-6">
                  <div className="w-10 h-10 bg-green-50 rounded flex items-center justify-center shrink-0 border border-green-100">
                    <MessageSquare className="w-6 h-6 text-green-500 fill-current" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Connect Number</h4>
                    <div className="flex items-center space-x-1 bg-gray-100 text-gray-500 text-[10px] font-semibold px-2 py-0.5 rounded w-max">
                      <AlertCircle className="w-3 h-3" />
                      <span>Not Verified</span>
                    </div>
                  </div>
                </div>
                <button className="w-full bg-[#1e4c3b] hover:bg-[#153a2d] text-white font-semibold py-2 rounded transition-colors text-sm">
                  Connect
                </button>
              </div>

              {/* Greeting Flow */}
              <div className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between">
                <div className="flex items-start space-x-3 mb-6">
                  <div className="w-10 h-10 bg-red-50 rounded flex items-center justify-center shrink-0 border border-red-100">
                    <div className="w-5 h-5 bg-red-400 rounded-sm text-white flex items-center justify-center text-xs font-bold">♥</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Greeting Flow</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded w-max border border-green-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Activated</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded w-max">
                        <span className="text-[#00a688]">✦</span>
                        <span>AI-generated</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="w-full bg-[#1e4c3b] hover:bg-[#153a2d] text-white font-semibold py-2 rounded transition-colors text-sm">
                  Edit Flow
                </button>
              </div>

              {/* FAQ Auto-replies */}
              <div className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between">
                <div className="flex items-start space-x-3 mb-6">
                  <div className="w-10 h-10 bg-purple-50 rounded flex items-center justify-center shrink-0 border border-purple-100">
                    <ListPlus className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">FAQ Auto-replies</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded w-max border border-green-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Activated</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded w-max">
                        <span className="text-[#00a688]">✦</span>
                        <span>AI-generated</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="w-full bg-[#1e4c3b] hover:bg-[#153a2d] text-white font-semibold py-2 rounded transition-colors text-sm">
                  Edit
                </button>
              </div>

            </div>
            
            <div className="text-center pt-2">
              <button className="text-[#008cDD] text-sm font-semibold flex items-center justify-center mx-auto hover:underline">
                View All <ChevronDown className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Objectives Section */}
        <div>
          <h2 className="text-sm font-bold text-[#8a98b4] tracking-widest mb-4">OBJECTIVES</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Generate High-intent Leads */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div className="pr-4">
                  <h3 className="font-bold text-gray-900 text-[15px] mb-1">Generate High-intent Leads</h3>
                  <p className="text-sm text-blue-600">Via Click to WhatsApp Ads</p>
                </div>
                {/* Mockup graphic placeholder */}
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative border border-gray-200">
                  <div className="absolute top-0 left-0 right-0 h-4 bg-blue-100 flex items-center px-1">
                     <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center">
                    <MessageSquare className="w-2 h-2 mr-0.5 fill-current" /> WhatsApp
                  </div>
                </div>
              </div>
              <button className="w-1/2 bg-[#1e4c3b] hover:bg-[#153a2d] text-white font-semibold py-2 rounded transition-colors text-sm">
                Setup
              </button>
            </div>

            {/* Qualify Ad Leads */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div className="pr-4">
                  <h3 className="font-bold text-gray-900 text-[15px] mb-1">Qualify Ad Leads</h3>
                  <p className="text-sm text-blue-600">Via WhatsApp Forms</p>
                </div>
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative border border-gray-200 flex items-end justify-center pb-2">
                   <div className="w-16 h-20 bg-white rounded-t border-t border-l border-r border-gray-300 shadow-sm relative">
                     <div className="absolute top-2 left-2 right-2 h-2 bg-gray-200 rounded"></div>
                     <div className="absolute top-6 left-2 right-2 h-2 bg-gray-200 rounded"></div>
                   </div>
                </div>
              </div>
              <button className="w-1/2 bg-[#1e4c3b] hover:bg-[#153a2d] text-white font-semibold py-2 rounded transition-colors text-sm">
                Setup
              </button>
            </div>

            {/* Integrate with Google Sheets */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div className="pr-4">
                  <h3 className="font-bold text-gray-900 text-[15px] mb-1">Integrate with Google Sheets</h3>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200 shadow-sm">
                    <div className="w-6 h-6 bg-[#00a688] rounded flex items-center justify-center text-white font-bold text-xs">R</div>
                  </div>
                  <div className="text-gray-400">🔗</div>
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200 shadow-sm">
                    <div className="w-6 h-6 bg-green-600 text-white flex items-center justify-center text-xs font-bold rounded">G</div>
                  </div>
                </div>
              </div>
              <button className="w-1/2 bg-[#1e4c3b] hover:bg-[#153a2d] text-white font-semibold py-2 rounded transition-colors text-sm">
                Setup
              </button>
            </div>

          </div>

          <div className="text-center pt-6 pb-12">
            <button className="text-[#008cDD] text-sm font-semibold flex items-center justify-center mx-auto hover:underline">
              View All <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
