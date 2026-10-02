import { Bell, Settings, ChevronDown, LogOut, Key, Phone, Camera, ShieldCheck, MessageSquare, Flame } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CHANNELS = [
  {
    label: 'WhatsApp',
    icon: MessageSquare,
    dot: 'bg-emerald-500',
    text: 'text-emerald-800',
    bg: 'bg-emerald-50',
    hoverBg: 'hover:bg-emerald-100',
    border: 'border-emerald-200',
    path: '/dashboard/campaigns',
  },
  {
    label: 'RCS',
    icon: ShieldCheck,
    dot: 'bg-blue-500',
    text: 'text-blue-800',
    bg: 'bg-blue-50',
    hoverBg: 'hover:bg-blue-100',
    border: 'border-blue-200',
    path: '/dashboard/rcs',
  },
  {
    label: 'Instagram',
    icon: Camera,
    dot: 'bg-pink-500',
    text: 'text-pink-800',
    bg: 'bg-pink-50',
    hoverBg: 'hover:bg-pink-100',
    border: 'border-pink-200',
    path: '/dashboard/instagram',
  },
  {
    label: 'AI Voice',
    icon: Phone,
    dot: 'bg-rose-500',
    text: 'text-rose-800',
    bg: 'bg-rose-50',
    hoverBg: 'hover:bg-rose-100',
    border: 'border-rose-200',
    path: '/dashboard/voice',
  },
];

const TICKERS = [
  '✅ Platform is live — connect your API keys to start sending',
  '📨 WhatsApp, RCS, Instagram & Voice channels are ready',
  '🤖 AI Agent auto-replies the moment contacts message in',
  '🔑 Add API keys in the API Hub to enable all features',
  '📊 All stats on this dashboard are real-time from your workspace',
];

export function Header() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [tickerIdx, setTickerIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(() => setTickerIdx(i => (i + 1) % TICKERS.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-5 shrink-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">

      {/* ── LEFT: uniform channel pills + ticker ── */}
      <div className="flex items-center gap-3 min-w-0">

        {/* Channel pills — all same height/padding/font */}
        <div className="hidden lg:flex items-center gap-1.5">
          {CHANNELS.map(ch => (
            <button
              key={ch.label}
              onClick={() => navigate(ch.path)}
              className={`
                inline-flex items-center gap-1.5
                h-7 px-3 rounded-full
                ${ch.bg} ${ch.hoverBg} ${ch.text}
                border ${ch.border}
                text-[11px] font-bold
                transition-all hover:scale-[1.03] cursor-pointer
                whitespace-nowrap
              `}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 animate-pulse ${ch.dot}`} />
              <ch.icon className="w-3 h-3 shrink-0" />
              {ch.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="hidden xl:block w-px h-5 bg-slate-200" />

        {/* Live ticker */}
        <div className="hidden xl:flex items-center gap-2 min-w-0">
          <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <span
            key={tickerIdx}
            className="text-[11px] font-medium text-slate-500 truncate max-w-xs page-enter"
          >
            {TICKERS[tickerIdx]}
          </span>
        </div>
      </div>

      {/* ── RIGHT: actions + avatar ── */}
      <div className="flex items-center gap-2 shrink-0">

        {/* API Hub pill */}
        <button
          onClick={() => navigate('/dashboard/api-hub')}
          className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold transition-all hover:scale-[1.03] cursor-pointer whitespace-nowrap"
        >
          <Key className="w-3 h-3" />
          API Keys
        </button>

        {/* Enterprise badge */}
        <div className="hidden md:flex items-center gap-1.5 h-7 px-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[11px] font-black whitespace-nowrap shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
          ENTERPRISE · Unlimited
        </div>

        {/* Settings */}
        <button
          onClick={() => navigate('/dashboard/settings')}
          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Avatar */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1.5 pl-1 pr-2 py-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-black text-[10px] shadow-sm">
              MS
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-slide-up">
              {/* Profile header */}
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-black text-sm shadow">
                    MS
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-sm leading-tight">Mohit Shukla</p>
                    <p className="text-[11px] text-slate-500">mohit@ricoz.io</p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2.5 py-1 rounded-lg w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Super Admin · All Omnichannel Access
                </div>
              </div>

              {/* Links */}
              <div className="p-2 space-y-0.5">
                {[
                  { icon: Key, label: 'API Keys & Credentials', color: 'text-amber-500', path: '/dashboard/api-hub' },
                  { icon: Settings, label: 'Billing & Subscription', color: 'text-indigo-500', path: '/dashboard/billing' },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => { navigate(item.path); setShowProfileMenu(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Logout */}
              <div className="p-2 border-t border-slate-100">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center justify-center gap-2 text-rose-600 bg-rose-50 hover:bg-rose-100 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
