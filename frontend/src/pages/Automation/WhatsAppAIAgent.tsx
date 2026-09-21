import { PlayCircle, Globe, FileText, Database, GitBranch, ShoppingBag } from 'lucide-react';

export function WhatsAppAIAgent() {
  return (
    <div className="flex-1 overflow-y-auto bg-white h-full flex flex-col">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-bold text-gray-900">Build Your AI Agent</h2>
          <button className="flex items-center space-x-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-red-100 transition-colors">
            <PlayCircle className="w-4 h-4 fill-current text-red-500 bg-white rounded-full" />
            <span>Watch Tutorial</span>
          </button>
        </div>
        <button className="bg-[#8997b0] hover:bg-[#728099] text-white font-semibold px-4 py-2 rounded text-sm transition-colors">
          Start Free Trial
        </button>
      </div>

      <div className="p-8 max-w-[1000px] w-full">
        {/* Warning/Info Box */}
        <div className="mb-6">
          <p className="text-sm text-gray-800">
            <span className="font-bold text-yellow-600 mr-1">😁 First 7 days are completely free — no charges on any conversations.</span>
            <br />
            After your free trial ends, the AI Agent will be paused. Cost after Free Trial: <span className="font-bold">₹3000/month & ₹0.5 per AI message.</span>
          </p>
        </div>

        {/* Hero Banner */}
        <div className="bg-[#f2fbf7] border border-[#d2efe0] rounded-t-2xl p-8 relative overflow-hidden flex justify-between items-center">
          
          <div className="max-w-xl relative z-10">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-6 h-6 bg-[#00a688] rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">R</span>
              </div>
              <span className="text-[#00a688] font-bold text-lg tracking-tight">Ricoz</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Meet AI Sales Agent</h1>
            <p className="text-gray-600 text-[15px] mb-8 leading-relaxed">
              Guide customers through their buying journey, recommend products, and help them make purchase decisions in real time.
            </p>

            <div>
              <p className="text-xs font-bold text-gray-700 tracking-wider mb-3">TRAINING RESOURCES</p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-full py-1.5 px-3 pr-4 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                    <Globe className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-800">Website URL</span>
                </div>
                
                <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-full py-1.5 px-3 pr-4 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-800">Documents</span>
                </div>

                <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-full py-1.5 px-3 pr-4 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <ShoppingBag className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-800">Meta Catalog</span>
                </div>
              </div>
            </div>
          </div>

          {/* Robot Graphic Mockup */}
          <div className="relative z-10 pr-8">
            <div className="w-48 h-32 bg-[#d2efe0] rounded-full flex flex-col items-center justify-center relative shadow-sm border border-green-200">
              <div className="absolute -top-4 w-1 bg-gray-400 h-6"></div>
              <div className="absolute -top-6 w-3 h-3 bg-gray-500 rounded-full"></div>
              
              <div className="flex space-x-12 absolute top-8">
                <div className="w-4 h-4 rounded-full bg-[#1e4c3b]"></div>
                <div className="w-4 h-4 rounded-full bg-[#1e4c3b]"></div>
              </div>
              <div className="w-16 h-8 bg-green-500 rounded-full absolute bottom-8 flex items-center justify-center shadow-inner">
                <div className="w-10 h-2 bg-green-900 rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-[#d2efe0]/50 to-transparent"></div>
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center space-x-1.5 py-4 border-x border-gray-200">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          <div className="w-6 h-1.5 rounded-full bg-[#1e4c3b]"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
        </div>

        {/* Workflow Info Box */}
        <div className="bg-[#f8fcf9] border border-gray-200 rounded-b-2xl p-6">
          <div className="flex items-start space-x-3">
            <GitBranch className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="text-[#008cDD] font-bold text-[15px] mb-1">Works alongside your existing workflows</h4>
              <p className="text-sm text-gray-600">Your existing automations always take priority. The AI bot only responds when no other workflow matches.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
