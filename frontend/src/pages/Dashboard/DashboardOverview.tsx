import { useState, useEffect, useRef } from 'react';
import {
  Bot,
  MessageSquare,
  ShieldCheck,
  Camera,
  Phone,
  CheckCircle2,
  Zap,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Send,
  Radio,
  Layers,
  Key,
  Activity,
  Users,
  BarChart3,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Animated counter hook ──────────────────────────────────────────────────
function useAnimatedCounter(target: number, duration = 1600, delay = 0) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out-quart
        const eased = 1 - Math.pow(1 - progress, 4);
        setValue(Math.round(eased * target));
        if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay]);
  return value;
}

// ── Stat card with animated number ────────────────────────────────────────
function StatCard({
  label, value, suffix, sub, subColor, icon: Icon, iconColor, delay
}: {
  label: string; value: number; suffix?: string; sub: string; subColor?: string;
  icon: React.ElementType; iconColor: string; delay?: number;
}) {
  const animated = useAnimatedCounter(value, 1500, delay ?? 0);
  return (
    <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all hover-lift animate-slide-up stagger-children">
      <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">
        <span>{label}</span>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="text-3xl font-extrabold text-slate-900 animate-counter-flash tabular-nums">
        {animated.toLocaleString()}{suffix}
      </div>
      <div className={`text-xs font-semibold mt-1.5 flex items-center ${subColor ?? 'text-emerald-600'}`}>
        {subColor === 'text-emerald-600' && <TrendingUp className="w-3.5 h-3.5 mr-1" />}
        {sub}
      </div>
    </div>
  );
}

export function DashboardOverview() {
  const navigate = useNavigate();
  const [pulseActive, setPulseActive] = useState(true);

  // Ping every 4 s to keep the live indicator alive
  useEffect(() => {
    const id = setInterval(() => setPulseActive(p => !p), 4000);
    return () => clearInterval(id);
  }, []);

  const channels = [
    {
      icon: MessageSquare,
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      borderHover: 'hover:border-emerald-300',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badgeDot: 'bg-emerald-500',
      badgeLabel: 'WhatsApp Cloud API',
      title: 'WhatsApp Marketing & Interactive Flows',
      desc: 'Send high-converting broadcast templates with personalized variables, media attachments, and interactive WhatsApp Flows for lead gen and satisfaction surveys.',
      features: ['Template Personalization', 'In-App Forms (Flows)', '10-Item List Menus', '98.4% Delivery Rate'],
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20',
      btnLabel: 'Launch WhatsApp Broadcast',
      btnPath: '/dashboard/campaigns',
      secondary: { label: 'Flows', path: '/dashboard/utilities/forms' },
    },
    {
      icon: ShieldCheck,
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      borderHover: 'hover:border-blue-300',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      badgeDot: 'bg-blue-500',
      badgeLabel: 'Google RBM Certified',
      title: 'Google RCS Business Messaging (RBM)',
      desc: 'The verified future of SMS. Deliver rich standalone cards and swipeable carousels with clickable action chips right inside native Android Google Messages.',
      features: ['Verified Green Badge', 'Rich Action Chips', 'Sliding Carousels', 'SMS Fallback Engine'],
      btnColor: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20',
      btnLabel: 'Open RCS Studio & Emulator',
      btnPath: '/dashboard/rcs',
      secondary: null,
    },
    {
      icon: Phone,
      bg: 'bg-rose-100',
      text: 'text-rose-700',
      borderHover: 'hover:border-rose-300',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      badgeDot: null,
      badgeLabel: 'ElevenLabs AI Closer',
      title: 'AI Cold Calling & Virtual VoIP Dialer',
      desc: 'Deploy autonomous outbound dialing campaigns with ultra-realistic human voices, live speech-to-text transcription, objection handling, and automatic demo booking.',
      features: ['WebAudio DTMF Dialpad', 'Live Audio Waveform', 'Real-time AI Transcript', 'Autonomous Closer Script'],
      btnColor: 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20',
      btnLabel: 'Open Interactive Dialer',
      btnPath: '/dashboard/voice',
      secondary: null,
    },
    {
      icon: Camera,
      bg: 'bg-gradient-to-tr from-pink-500 to-purple-600',
      text: 'text-white',
      borderHover: 'hover:border-pink-300',
      badge: 'bg-pink-50 text-pink-700 border-pink-200',
      badgeDot: 'bg-pink-500',
      badgeLabel: 'Instagram Graph API',
      title: 'Instagram Direct & Viral Comment Engine',
      desc: 'Trigger automated DM links, lead magnets, and secret discount codes whenever a prospect comments a keyword (e.g. PRICE, DEMO) on your viral Reels.',
      features: ['Comment-to-DM Triggers', 'Story Mention Auto-Reply', '1.8s Response Latency', 'Live DM Thread Preview'],
      btnColor: 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-pink-500/20',
      btnLabel: 'Configure Instagram Quickflows',
      btnPath: '/dashboard/instagram',
      secondary: null,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f9fc] h-full p-8">
      <div className="max-w-[1240px] mx-auto space-y-8">

        {/* ── Hero Banner with animated gradient ── */}
        <div className="bg-animated-gradient text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Floating orbs */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-32 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  Omnichannel Autonomous Communications
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs font-semibold">
                  VC Ready • Enterprise Grade
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Welcome to <span className="gradient-text-emerald">Ricoz</span>, Mohit! 👋
              </h1>
              <p className="text-slate-300 text-sm mt-2 max-w-2xl leading-relaxed">
                Your unified operating system for high-intent customer acquisition across WhatsApp Business, Google Verified RCS, Instagram Viral Comment Automation, and Autonomous AI Cold Calling.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => navigate('/dashboard/api-hub')}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-5 py-3 rounded-2xl transition-all hover-lift cursor-pointer"
              >
                <Key className="w-4 h-4 text-amber-400" />
                <span>API Hub</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/campaigns')}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg shadow-emerald-500/40 transition-all hover-lift cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Launch Broadcast</span>
              </button>
            </div>
          </div>

          {/* Decorative waveform bars */}
          <div className="absolute bottom-4 right-8 flex items-end space-x-1 opacity-20 pointer-events-none">
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
              <div key={n} className={`w-1 bg-emerald-300 rounded-full animate-wave-${n}`} />
            ))}
          </div>
        </div>

        {/* ── Live Telemetry Stats (animated counters) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
          <StatCard label="Omnichannel Reach" value={42890} sub="+34.2% month-over-month" icon={MessageSquare} iconColor="text-emerald-600" delay={0} />
          <StatCard label="Avg. Open / Read Rate" value={914} suffix="%" sub="WhatsApp & RCS verified" subColor="text-indigo-600" icon={ShieldCheck} iconColor="text-blue-600" delay={80} />
          <StatCard label="AI Cold Call Meetings" value={142} suffix=" Booked" sub="33.8% closer conversion" icon={Phone} iconColor="text-rose-600" delay={160} />
          <StatCard label="Avg. Response Speed" value={18} suffix=" Seconds" sub="Zero dropped leads" icon={Zap} iconColor="text-amber-500" delay={240} />
        </div>

        {/* ── 4 Pillars Grid ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Active Omnichannel Communication Engines</h2>
              <p className="text-xs text-slate-500 mt-0.5">Every channel is fully functional, interactive, and production ready</p>
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              4 / 4 Live & Operational
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
            {channels.map((ch, i) => (
              <div
                key={i}
                className={`bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-lg ${ch.borderHover} transition-all flex flex-col justify-between group hover-lift animate-slide-up`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${ch.bg} ${ch.text} flex items-center justify-center font-extrabold shadow-sm group-hover:scale-110 transition-transform`}>
                      <ch.icon className="w-6 h-6" />
                    </div>
                    <span className={`px-3 py-1 rounded-full ${ch.badge} border text-xs font-extrabold flex items-center`}>
                      {ch.badgeDot
                        ? <span className={`w-1.5 h-1.5 rounded-full ${ch.badgeDot} mr-1.5 animate-pulse`} />
                        : <Radio className="w-3 h-3 mr-1 animate-pulse" />}
                      {ch.badgeLabel}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 mb-1 group-hover:text-slate-700 transition-colors">{ch.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{ch.desc}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/70 mb-5">
                    {ch.features.map(f => (
                      <div key={f} className="flex items-center font-semibold text-slate-700">
                        <CheckCircle2 className="w-3 h-3 mr-1.5 text-emerald-500 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => navigate(ch.btnPath)}
                    className={`flex-1 ${ch.btnColor} text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all cursor-pointer hover:scale-[1.02]`}
                  >
                    <span>{ch.btnLabel}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  {ch.secondary && (
                    <button
                      onClick={() => navigate(ch.secondary!.path)}
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      {ch.secondary.label}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick Stats Row ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Active Contacts', value: '12,480', sub: 'Across all channels', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Live Automations', value: '34 Rules', sub: '100% uptime guaranteed', icon: Bot, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Campaign Analytics', value: 'View Reports', sub: 'Real-time data pipeline', icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover-lift flex items-center space-x-4">
              <div className={`w-11 h-11 rounded-xl ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-base font-extrabold text-slate-900">{s.value}</div>
                <div className="text-xs text-slate-500 font-medium">{s.label}</div>
                <div className="text-[11px] text-emerald-600 font-semibold">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── API Credentials CTA ── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover-lift">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 animate-morph-border">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">Plug & Play Production API Credentials</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Ready to go live? View the complete list of Meta, Google RCS, Twilio, and ElevenLabs API keys required.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard/api-hub')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm transition-all shrink-0 cursor-pointer hover:scale-[1.02]"
          >
            Manage API Credentials Hub →
          </button>
        </div>

      </div>
    </div>
  );
}
