import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, ShieldCheck, Phone, Camera,
  CheckCircle2, Zap, Sparkles, ArrowUpRight, TrendingUp,
  Send, Key, Users, BarChart3, Bot, Radio, Activity,
  Flame, Star, Globe, Lock, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ── Animated counter ── */
function useAnimatedCounter(target: number, duration = 1800, delay = 0) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const e = 1 - Math.pow(1 - p, 4);
        setValue(Math.round(e * target));
        if (p < 1) raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(t); cancelAnimationFrame(raf.current); };
  }, [target, duration, delay]);
  return value;
}

/* ── Stat card ── */
function StatCard({ label, value, suffix, sub, subColor, icon: Icon, gradient, delay }: any) {
  const animated = useAnimatedCounter(value, 1600, delay ?? 0);
  return (
    <div className={`relative overflow-hidden rounded-2xl p-px animate-slide-up`} style={{ animationDelay: `${delay}ms` }}>
      <div className={`absolute inset-0 ${gradient} opacity-80 rounded-2xl`} />
      <div className="relative bg-white/95 rounded-[15px] p-5 h-full hover-lift transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{label}</span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${gradient} shadow-lg`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="text-3xl font-black text-slate-900 tabular-nums tracking-tight">
          {animated.toLocaleString()}{suffix}
        </div>
        <div className={`text-xs font-bold mt-1.5 flex items-center gap-1 ${subColor ?? 'text-emerald-600'}`}>
          <TrendingUp className="w-3 h-3" />
          {sub}
        </div>
      </div>
    </div>
  );
}

/* ── Channel card ── */
function ChannelCard({ ch, delay, navigate }: any) {
  return (
    <div
      className="relative group rounded-3xl overflow-hidden animate-slide-up hover-lift cursor-default"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient border via outline div */}
      <div className={`absolute inset-0 ${ch.border} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative bg-white border border-slate-200 rounded-3xl p-6 flex flex-col gap-4 group-hover:border-transparent transition-all">
        {/* Top */}
        <div className="flex items-start justify-between">
          <div className={`w-13 h-13 rounded-2xl ${ch.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <ch.icon className={`w-6 h-6 ${ch.iconText}`} />
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border flex items-center gap-1.5 ${ch.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${ch.dot} animate-pulse`} />
            {ch.badgeLabel}
          </span>
        </div>

        {/* Title + desc */}
        <div>
          <h3 className="text-base font-black text-slate-900 leading-snug mb-1.5">{ch.title}</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">{ch.desc}</p>
        </div>

        {/* Stats strip */}
        <div className={`grid grid-cols-3 gap-2 rounded-xl p-3 ${ch.statsBg}`}>
          {ch.stats.map((s: any) => (
            <div key={s.label} className="text-center">
              <div className={`text-sm font-black ${ch.statsValue}`}>{s.value}</div>
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-1.5">
          {ch.features.map((f: string) => (
            <div key={f} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
              <CheckCircle2 className={`w-3 h-3 shrink-0 ${ch.checkColor}`} />
              {f}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => navigate(ch.btnPath)}
            className={`flex-1 ${ch.btnGradient} text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all hover:scale-[1.02] cursor-pointer`}
          >
            {ch.btnLabel} <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          {ch.secondary && (
            <button
              onClick={() => navigate(ch.secondary.path)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              {ch.secondary.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function DashboardOverview() {
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const liveEvents = [
    { icon: '🔥', text: 'WhatsApp broadcast sent to 4,850 contacts', time: '2m ago', color: 'text-emerald-600' },
    { icon: '📞', text: 'AI Closer booked meeting with Sarah Jenkins (VP Marketing)', time: '8m ago', color: 'text-rose-600' },
    { icon: '📷', text: 'Instagram comment "PRICE" triggered DM to @alex_founder', time: '12m ago', color: 'text-pink-600' },
    { icon: '💬', text: 'Google RCS carousel delivered to 3,200 Android users', time: '19m ago', color: 'text-blue-600' },
    { icon: '🤖', text: 'AI Agent replied to 23 conversations autonomously', time: '24m ago', color: 'text-purple-600' },
  ];

  const channels = [
    {
      icon: MessageSquare, iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-600',
      iconText: 'text-white', border: 'bg-gradient-to-br from-emerald-400 to-teal-600',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500', badgeLabel: 'WhatsApp Cloud API',
      title: 'WhatsApp Marketing & Interactive Flows',
      desc: 'Send personalized broadcast templates with media, interactive WhatsApp Flows for lead gen, and 10-item list menus.',
      stats: [{ value: '4,850', label: 'Sent' }, { value: '98.4%', label: 'Delivered' }, { value: '39%', label: 'Converted' }],
      statsBg: 'bg-emerald-50/60', statsValue: 'text-emerald-700', checkColor: 'text-emerald-500',
      features: ['Template Personalization', 'In-App Forms (Flows)', '10-Item List Menus', '98.4% Delivery Rate'],
      btnGradient: 'bg-gradient-to-r from-emerald-500 to-teal-600',
      btnLabel: 'Launch WhatsApp Broadcast', btnPath: '/dashboard/campaigns',
      secondary: { label: 'Flows', path: '/dashboard/utilities/forms' },
    },
    {
      icon: ShieldCheck, iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      iconText: 'text-white', border: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500', badgeLabel: 'Google RBM Verified',
      title: 'Google RCS Business Messaging (RBM)',
      desc: 'Deliver verified rich cards and swipeable carousels with clickable action chips inside native Android Google Messages.',
      stats: [{ value: '3,200', label: 'Sent' }, { value: '91.4%', label: 'Read' }, { value: '44.8%', label: 'CTR' }],
      statsBg: 'bg-blue-50/60', statsValue: 'text-blue-700', checkColor: 'text-blue-500',
      features: ['Verified Green Badge', 'Rich Action Chips', 'Sliding Carousels', 'SMS Fallback Engine'],
      btnGradient: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      btnLabel: 'Open RCS Studio & Emulator', btnPath: '/dashboard/rcs',
      secondary: null,
    },
    {
      icon: Phone, iconBg: 'bg-gradient-to-br from-rose-500 to-red-600',
      iconText: 'text-white', border: 'bg-gradient-to-br from-rose-500 to-red-600',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500', badgeLabel: 'ElevenLabs AI Voice',
      title: 'AI Cold Calling & Virtual VoIP Dialer',
      desc: 'Deploy autonomous outbound dialing with ultra-realistic voices, live speech-to-text, objection handling, and demo booking.',
      stats: [{ value: '150', label: 'Dialed' }, { value: '142', label: 'Connected' }, { value: '33.8%', label: 'Booked' }],
      statsBg: 'bg-rose-50/60', statsValue: 'text-rose-700', checkColor: 'text-rose-500',
      features: ['WebAudio DTMF Dialpad', 'Live Audio Waveform', 'Real-time AI Transcript', 'Autonomous Closer Script'],
      btnGradient: 'bg-gradient-to-r from-rose-500 to-red-600',
      btnLabel: 'Open Interactive Dialer', btnPath: '/dashboard/voice',
      secondary: null,
    },
    {
      icon: Camera, iconBg: 'bg-gradient-to-br from-pink-500 to-purple-600',
      iconText: 'text-white', border: 'bg-gradient-to-br from-pink-500 to-purple-600',
      badge: 'bg-pink-50 text-pink-700 border-pink-200',
      dot: 'bg-pink-500', badgeLabel: 'Instagram Graph API',
      title: 'Instagram Direct & Viral Comment Engine',
      desc: 'Trigger automated DM links and secret discounts whenever a prospect comments a keyword on your viral Reels.',
      stats: [{ value: '3,480', label: 'DMs Sent' }, { value: '1.8s', label: 'Latency' }, { value: '62.4%', label: 'Click CTR' }],
      statsBg: 'bg-pink-50/60', statsValue: 'text-pink-700', checkColor: 'text-pink-500',
      features: ['Comment-to-DM Triggers', 'Story Mention Auto-Reply', '1.8s Response Time', 'Live DM Preview'],
      btnGradient: 'bg-gradient-to-r from-pink-600 to-purple-600',
      btnLabel: 'Configure Instagram Quickflows', btnPath: '/dashboard/instagram',
      secondary: null,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto h-full" style={{ background: 'linear-gradient(160deg, #f0fdf8 0%, #f8faff 40%, #fdf4ff 100%)' }}>
      <div className="max-w-[1260px] mx-auto px-8 py-8 space-y-8">

        {/* ── HERO BANNER ── */}
        <div className="relative rounded-[28px] overflow-hidden shadow-2xl">
          {/* Base dark animated gradient */}
          <div className="absolute inset-0 bg-animated-gradient" />
          {/* Overlay mesh */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 70% 50%, rgba(99,102,241,0.35) 0%, transparent 70%), radial-gradient(ellipse 50% 80% at 20% 80%, rgba(0,196,156,0.3) 0%, transparent 70%)' }} />
          {/* Noise texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

          <div className="relative z-10 p-9">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex-1">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    LIVE · Omnichannel AI Platform
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/8 border border-white/15 text-slate-300 text-xs font-bold">
                    VC Ready · Enterprise Grade
                  </span>
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
                    ✦ 4 Channels Active
                  </span>
                </div>

                {/* Heading */}
                <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-3">
                  Welcome back,{' '}
                  <span style={{ background: 'linear-gradient(90deg, #34d399, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Mohit
                  </span>{' '}
                  <span className="animate-float inline-block">👋</span>
                </h1>
                <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
                  Your unified OS for high-intent customer acquisition across{' '}
                  <span className="text-emerald-400 font-bold">WhatsApp Business</span>,{' '}
                  <span className="text-blue-400 font-bold">Google RCS</span>,{' '}
                  <span className="text-pink-400 font-bold">Instagram Viral</span>, and{' '}
                  <span className="text-rose-400 font-bold">AI Cold Calling</span>.
                </p>

                {/* Live ticker */}
                <div className="mt-5 flex items-center gap-2 bg-white/6 border border-white/10 rounded-xl px-4 py-2.5 w-max">
                  <Flame className="w-4 h-4 text-orange-400 shrink-0" />
                  <span className="text-xs text-slate-300 font-semibold">
                    {liveEvents[tick % liveEvents.length].text}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">{liveEvents[tick % liveEvents.length].time}</span>
                </div>
              </div>

              {/* Right CTAs */}
              <div className="flex flex-col gap-3 shrink-0">
                <button
                  onClick={() => navigate('/dashboard/campaigns')}
                  className="flex items-center justify-center gap-2 font-black text-sm px-7 py-3.5 rounded-2xl text-white shadow-xl transition-all hover:scale-[1.03] cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #10b981, #0891b2)', boxShadow: '0 8px 32px rgba(16,185,129,0.35)' }}
                >
                  <Send className="w-4 h-4" />
                  Launch Broadcast
                </button>
                <button
                  onClick={() => navigate('/dashboard/api-hub')}
                  className="flex items-center justify-center gap-2 font-bold text-sm px-7 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Key className="w-4 h-4 text-amber-400" />
                  API Hub & Credentials
                </button>
                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
                  <Lock className="w-3 h-3 text-slate-500" />
                  SOC2 · GDPR · ISO27001 Compliant
                </div>
              </div>
            </div>

            {/* Waveform decoration */}
            <div className="absolute bottom-5 right-8 flex items-end gap-[3px] opacity-15 pointer-events-none">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                <div key={n} className={`w-1.5 rounded-full bg-emerald-300 animate-wave-${n}`} />
              ))}
            </div>
          </div>
        </div>

        {/* ── ANIMATED STATS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          <StatCard label="Omnichannel Reach" value={42890} sub="+34.2% this month" icon={Globe} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" delay={0} />
          <StatCard label="Read / Open Rate" value={91} suffix="%" sub="vs 14% email average" subColor="text-blue-600" icon={Star} gradient="bg-gradient-to-br from-blue-500 to-indigo-600" delay={80} />
          <StatCard label="AI Meetings Booked" value={142} sub="33.8% closer rate" subColor="text-rose-600" icon={Phone} gradient="bg-gradient-to-br from-rose-500 to-red-600" delay={160} />
          <StatCard label="Response Speed" value={18} suffix="s" sub="Zero dropped leads" subColor="text-amber-600" icon={Zap} gradient="bg-gradient-to-br from-amber-400 to-orange-500" delay={240} />
        </div>

        {/* ── MAIN SPLIT LAYOUT ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">

          {/* Left: 4 Channel Cards */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Omnichannel Communication Engines</h2>
                <p className="text-xs text-slate-500 mt-0.5">All 4 channels functional • production-ready • fully animated</p>
              </div>
              <span className="text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                4 / 4 Live & Operational
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
              {channels.map((ch, i) => (
                <ChannelCard key={i} ch={ch} delay={i * 80} navigate={navigate} />
              ))}
            </div>
          </div>

          {/* Right: Activity Panel */}
          <div className="space-y-5">

            {/* Live Activity Feed */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span className="font-black text-slate-900 text-sm">Live Activity</span>
                </div>
                <span className="text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  LIVE
                </span>
              </div>
              <div className="divide-y divide-slate-50">
                {liveEvents.map((e, i) => (
                  <div key={i} className={`px-5 py-3.5 flex items-start gap-3 hover:bg-slate-50/60 transition-colors ${i === tick % liveEvents.length ? 'bg-emerald-50/40' : ''}`}>
                    <span className="text-base shrink-0 mt-0.5">{e.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-slate-700 leading-snug">{e.text}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{e.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100">
                <span className="font-black text-slate-900 text-sm">Quick Actions</span>
              </div>
              <div className="divide-y divide-slate-50">
                {[
                  { icon: Users, label: 'Active Contacts', value: '12,480', color: 'text-blue-600', bg: 'bg-blue-50', path: '/dashboard/contacts' },
                  { icon: Bot, label: 'Live Automations', value: '34 Rules', color: 'text-purple-600', bg: 'bg-purple-50', path: '/dashboard/automation/ai-agent' },
                  { icon: BarChart3, label: 'ROI Analytics', value: 'View Report', color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/dashboard/analytics' },
                  { icon: Key, label: 'API Hub', value: '6 Keys Needed', color: 'text-amber-600', bg: 'bg-amber-50', path: '/dashboard/api-hub' },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(item.path)}
                    className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}>
                        <item.icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-slate-900">{item.label}</div>
                        <div className={`text-[10px] font-semibold ${item.color}`}>{item.value}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Health */}
            <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}>
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-white">Platform Health</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">99.9% Uptime</span>
                </div>
                {[
                  { label: 'WhatsApp API', pct: 100, color: '#10b981' },
                  { label: 'Google RCS', pct: 99, color: '#6366f1' },
                  { label: 'AI Voice (Twilio)', pct: 97, color: '#f43f5e' },
                  { label: 'Instagram Graph', pct: 100, color: '#ec4899' },
                ].map(bar => (
                  <div key={bar.label} className="mb-3">
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span className="text-slate-400">{bar.label}</span>
                      <span style={{ color: bar.color }}>{bar.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${bar.pct}%`, background: bar.color, boxShadow: `0 0 8px ${bar.color}80` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
