import { Bell, Settings, ChevronDown, User, LogOut, Radio, ShieldCheck, Key, Phone, Camera, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-50 shadow-2xs">
      
      {/* Left: Live Omnichannel Status Badges & Activity Ticker */}
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className="hidden lg:flex items-center space-x-2 text-xs">
          <button 
            onClick={() => navigate('/dashboard/whatsapp')} 
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>WhatsApp 🟢</span>
          </button>

          <button 
            onClick={() => navigate('/dashboard/rcs')} 
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold border border-blue-200 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>RCS Verified ⚡</span>
          </button>

          <button 
            onClick={() => navigate('/dashboard/instagram')} 
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-800 font-bold border border-pink-200 transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-pink-600" />
            <span>IG Auto-DM 📸</span>
          </button>

          <button 
            onClick={() => navigate('/dashboard/voice')} 
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold border border-rose-200 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-rose-600" />
            <span>AI Cold Call 📞</span>
          </button>
        </div>

        {/* Ticker marquee text */}
        <div className="hidden xl:flex items-center text-xs text-slate-500 font-medium pl-3 border-l border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-ping"></span>
          <span className="truncate max-w-sm">🔥 AI Cold Calling booked Sarah Jenkins for Demo • Thursday 11 AM</span>
        </div>
      </div>

      {/* Right: Actions & User Avatar */}
      <div className="flex items-center space-x-4 shrink-0">
        
        {/* Quick API Hub button */}
        <button
          onClick={() => navigate('/dashboard/api-hub')}
          className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <Key className="w-3.5 h-3.5 text-amber-500" />
          <span>API Keys</span>
        </button>

        {/* Upgrade / Enterprise Badge */}
        <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-xl p-1 pr-2 shadow-2xs">
          <span className="text-[11px] font-extrabold text-emerald-800 px-2.5 py-0.5 rounded-lg bg-emerald-100">
            ENTERPRISE OMNICHANNEL
          </span>
          <span className="text-xs text-slate-600 font-semibold">Unlimited Broadcasts</span>
        </div>

        {/* Settings */}
        <button 
          onClick={() => navigate('/dashboard/settings')}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Avatar & Profile Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-1.5 p-1 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
              MS
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-extrabold text-base">
                    MS
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-sm">Mohit Shukla</p>
                    <p className="text-xs text-slate-500">mohit@ricoz.io</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-semibold bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Super Admin • All Omnichannel Access</span>
                </div>
              </div>

              <div className="p-3 space-y-1 text-xs">
                <button 
                  onClick={() => {
                    navigate('/dashboard/api-hub');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 font-bold flex items-center space-x-2"
                >
                  <Key className="w-4 h-4 text-amber-500" />
                  <span>API Keys & Credentials</span>
                </button>

                <button 
                  onClick={() => {
                    navigate('/dashboard/billing');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 font-bold flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4 text-indigo-500" />
                  <span>Billing & Subscription</span>
                </button>
              </div>

              <div className="p-3 border-t border-slate-100">
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center justify-center space-x-2 text-rose-600 bg-rose-50 hover:bg-rose-100 py-2 rounded-xl font-bold text-xs transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
