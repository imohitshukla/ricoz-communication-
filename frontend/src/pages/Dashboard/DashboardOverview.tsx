import { useState } from 'react';
import { 
  Bot, 
  MessageSquare, 
  ShieldCheck, 
  Camera, 
  Phone, 
  ChevronRight, 
  CheckCircle2, 
  Zap, 
  Sparkles, 
  ArrowUpRight, 
  TrendingUp, 
  Send, 
  Radio, 
  Layers, 
  Key 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DashboardOverview() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f9fc] h-full p-8">
      <div className="max-w-[1240px] mx-auto space-y-8">
        
        {/* Welcome Pitch Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-indigo-500/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2.5 mb-2.5">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
                  Omnichannel Autonomous Communications
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs font-semibold">
                  VC Ready • Enterprise Grade
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Welcome to Ricoz, Mohit!
              </h1>
              <p className="text-slate-300 text-sm mt-2 max-w-2xl leading-relaxed">
                Your unified operating system for high-intent customer acquisition across WhatsApp Business, Google Verified RCS, Instagram Viral Comment Automation, and Autonomous AI Cold Calling.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => navigate('/dashboard/api-hub')}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-5 py-3 rounded-2xl transition-all cursor-pointer"
              >
                <Key className="w-4 h-4 text-amber-400" />
                <span>API Hub</span>
              </button>

              <button
                onClick={() => navigate('/dashboard/campaigns')}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Launch Broadcast</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Aggregated Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Omnichannel Reach</span>
              <MessageSquare className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">42,890</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              +34.2% month-over-month
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Avg. Open / Read Rate</span>
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-indigo-600">91.4%</div>
            <div className="text-xs text-slate-500 mt-1">WhatsApp & RCS verified</div>
          </div>

          <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>AI Cold Call Meetings</span>
              <Phone className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-3xl font-extrabold text-rose-600">142 Booked</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">33.8% closer conversion</div>
          </div>

          <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Average Response Speed</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">1.8 Seconds</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">Zero dropped leads</div>
          </div>
        </div>

        {/* 4 Pillars Grid (The Big 4 Channels) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Active Omnichannel Communication Engines</h2>
              <p className="text-xs text-slate-500">Every channel is fully functional, interactive, and production ready</p>
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
              4 / 4 Live & Operational
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. WhatsApp Marketing & Interactive Flows */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold shadow-sm group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                    WhatsApp Cloud API
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">
                  WhatsApp Marketing & Interactive Flows
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Send high-converting broadcast templates with personalized variables ({'{{1}}'}, {'{{2}}'}), media attachments, and interactive WhatsApp Flows (lead gen, qualification, and satisfaction surveys).
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/70 mb-5">
                  <div className="font-semibold text-slate-700">✓ Template Personalization</div>
                  <div className="font-semibold text-slate-700">✓ In-App Forms (Flows)</div>
                  <div className="font-semibold text-slate-700">✓ 10-Item List Menus</div>
                  <div className="font-semibold text-slate-700">✓ 98.4% Delivery Rate</div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => navigate('/dashboard/campaigns')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <span>Launch WhatsApp Broadcast</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => navigate('/dashboard/utilities/forms')}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Flows
                </button>
              </div>
            </div>

            {/* 2. Google RCS Business Suite */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold shadow-sm group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse"></span>
                    Google RBM Certified
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
                  Google RCS Business Messaging (RBM)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  The verified future of SMS. Deliver rich standalone cards and swipeable carousels with clickable action chips (Call, Open URL, Quick Reply) right inside native Android Google Messages.
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/70 mb-5">
                  <div className="font-semibold text-slate-700">✓ Verified Green Badge</div>
                  <div className="font-semibold text-slate-700">✓ Rich Action Chips</div>
                  <div className="font-semibold text-slate-700">✓ Sliding Carousels</div>
                  <div className="font-semibold text-slate-700">✓ SMS Fallback Engine</div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => navigate('/dashboard/rcs')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <span>Open RCS Studio & Emulator</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3. AI Cold Calling & Telephony Powerhouse */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-rose-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-extrabold shadow-sm group-hover:scale-105 transition-transform">
                    <Phone className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-extrabold flex items-center">
                    <Radio className="w-3 h-3 mr-1 text-rose-600 animate-pulse" />
                    ElevenLabs AI Closer
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 mb-1 group-hover:text-rose-700 transition-colors">
                  AI Cold Calling & Virtual VoIP Dialer
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Deploy autonomous outbound dialing campaigns with ultra-realistic human voices, real-time live speech-to-text transcription, objection handling, and automatic calendar demo booking.
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/70 mb-5">
                  <div className="font-semibold text-slate-700">✓ WebAudio DTMF Dialpad</div>
                  <div className="font-semibold text-slate-700">✓ Live Audio Waveform</div>
                  <div className="font-semibold text-slate-700">✓ Real-time AI Transcript</div>
                  <div className="font-semibold text-slate-700">✓ Autonomous Closer Script</div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => navigate('/dashboard/voice')}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <span>Open Interactive Dialer</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 4. Instagram Direct & Comment Engine */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-pink-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center font-extrabold shadow-sm group-hover:scale-105 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-200 text-xs font-extrabold flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 mr-1.5 animate-pulse"></span>
                    Instagram Graph API
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 mb-1 group-hover:text-pink-700 transition-colors">
                  Instagram Direct & Viral Comment Engine
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Trigger automated DM links, lead magnets, and secret discount codes whenever a prospect comments a keyword (e.g. PRICE, DEMO) on your viral Reels and posts.
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/70 mb-5">
                  <div className="font-semibold text-slate-700">✓ Comment-to-DM Triggers</div>
                  <div className="font-semibold text-slate-700">✓ Story Mention Auto-Reply</div>
                  <div className="font-semibold text-slate-700">✓ 1.8s Response Latency</div>
                  <div className="font-semibold text-slate-700">✓ Live DM Thread Preview</div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => navigate('/dashboard/instagram')}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <span>Configure Instagram Quickflows</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Quick Setup & Credentials Quick-Jump Banner */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">Plug & Play Production API Credentials</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Ready to take your campaigns live? View the complete list of Meta, Google RCS, Twilio, and ElevenLabs API keys required.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard/api-hub')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm transition-all shrink-0 cursor-pointer"
          >
            Manage API Credentials Hub →
          </button>
        </div>

      </div>
    </div>
  );
}
