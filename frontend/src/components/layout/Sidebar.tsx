import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Inbox,
  Mail,
  Send,
  Users,
  Store,
  HelpCircle,
  Zap,
  LineChart,
  ShoppingBag,
  Puzzle,
  LayoutTemplate,
  ChevronDown,
  Menu,
  Phone,
  ShieldCheck,
  Camera,
  MessageSquare,
  Key,
  Radio,
  FileText,
  ListFilter,
  Flame,
  Sparkles,
  Bot,
  Layers,
  ChevronRight,
  CheckCircle2,
  Workflow
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className="w-[270px] h-screen bg-[#0b1329] border-r border-slate-800/80 flex flex-col z-20 shrink-0 text-slate-300 shadow-2xl select-none">
      
      {/* Sidebar Top: Brand & Workspace */}
      <div className="flex flex-col shrink-0 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-4 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-gradient-to-tr from-[#00a688] via-emerald-400 to-teal-300 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-400/40">
              <span className="text-white font-black text-sm tracking-wider">R</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-white text-base tracking-tight leading-none">Ricoz</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.2 rounded border border-emerald-500/30">PRO</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400/90 tracking-wide uppercase">Omnichannel Suite</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/25 flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
            Live
          </span>
        </div>

        {/* Workspace Quick Chip */}
        <div className="mt-2.5 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 font-medium">
          <div className="flex items-center space-x-2 truncate">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></div>
            <span className="truncate text-slate-200 font-semibold">Production Workspace</span>
          </div>
          <span className="text-[9px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">ASIA-S1</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden pt-3.5 pb-6 px-2 space-y-5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        
        {/* SECTION 1: MISSION CONTROL */}
        <div>
          <div className="px-3 mb-1.5 flex items-center justify-between text-[10px] font-extrabold text-slate-400/90 tracking-wider uppercase">
            <span>Mission Control</span>
            <span className="text-[9px] text-slate-500 font-mono">4 HUBS</span>
          </div>

          <div className="space-y-1">
            <NavLink
              to="/dashboard/overview"
              className={({ isActive }) => cn(
                "group flex items-center px-3 py-2 rounded-xl transition-all text-xs font-bold relative overflow-hidden",
                isActive 
                  ? "text-white bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-400 rounded-r-full shadow-sm shadow-emerald-400" />}
                  <Home className={cn("w-4 h-4 mr-2.5 transition-colors", isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-400")} />
                  Overview
                </>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/inbox"
              className={({ isActive }) => cn(
                "group flex items-center justify-between px-3 py-2 rounded-xl transition-all text-xs font-bold relative overflow-hidden",
                isActive 
                  ? "text-white bg-gradient-to-r from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-400 rounded-r-full shadow-sm shadow-indigo-400" />}
                  <div className="flex items-center">
                    <Inbox className={cn("w-4 h-4 mr-2.5 transition-colors", isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-indigo-400")} />
                    Unified Inbox
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-red-500 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                    Live
                  </span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/campaigns"
              className={({ isActive }) => cn(
                "group flex items-center justify-between px-3 py-2 rounded-xl transition-all text-xs font-bold relative overflow-hidden",
                isActive 
                  ? "text-white bg-gradient-to-r from-teal-500/20 to-emerald-500/10 border border-teal-500/30 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-teal-400 rounded-r-full shadow-sm shadow-teal-400" />}
                  <div className="flex items-center">
                    <Send className={cn("w-4 h-4 mr-2.5 transition-colors", isActive ? "text-teal-400" : "text-slate-400 group-hover:text-teal-400")} />
                    Broadcast Studio
                  </div>
                  <span className="text-[9px] bg-teal-500/15 text-teal-300 font-bold px-1.5 py-0.5 rounded border border-teal-500/20">WA</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/contacts"
              className={({ isActive }) => cn(
                "group flex items-center px-3 py-2 rounded-xl transition-all text-xs font-bold relative overflow-hidden",
                isActive 
                  ? "text-white bg-gradient-to-r from-blue-500/20 to-sky-500/10 border border-blue-500/30 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-400 rounded-r-full shadow-sm shadow-blue-400" />}
                  <Users className={cn("w-4 h-4 mr-2.5 transition-colors", isActive ? "text-blue-400" : "text-slate-400 group-hover:text-blue-400")} />
                  Contacts & Segments
                </>
              )}
            </NavLink>
          </div>
        </div>

        {/* SECTION 2: OMNICHANNEL ENGINES (ALL 5 LIVE ENGINES) */}
        <div>
          <div className="px-3 mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400/90 tracking-wider uppercase flex items-center">
              <span>Omnichannel Engines</span>
            </span>
            <span className="text-[9px] bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
              5 Live
            </span>
          </div>

          <div className="space-y-1">
            {/* 1. Google RCS Studio */}
            <NavLink
              to="/dashboard/rcs"
              className={({ isActive }) => cn(
                "group flex items-center justify-between px-3 py-2 rounded-xl transition-all text-xs font-bold relative overflow-hidden",
                isActive 
                  ? "text-white bg-blue-500/20 border border-blue-400/40 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-400 rounded-r-full shadow-sm shadow-blue-400" />}
                  <div className="flex items-center">
                    <ShieldCheck className={cn("w-4 h-4 mr-2.5 transition-colors", isActive ? "text-blue-400" : "text-slate-400 group-hover:text-blue-400")} />
                    Google RCS Studio
                  </div>
                  <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-extrabold border border-blue-500/30">RICH</span>
                </>
              )}
            </NavLink>

            {/* 2. AI Voice & VoIP */}
            <NavLink
              to="/dashboard/voice"
              className={({ isActive }) => cn(
                "group flex items-center justify-between px-3 py-2 rounded-xl transition-all text-xs font-bold relative overflow-hidden",
                isActive 
                  ? "text-white bg-rose-500/20 border border-rose-400/40 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-rose-400 rounded-r-full shadow-sm shadow-rose-400" />}
                  <div className="flex items-center">
                    <Phone className={cn("w-4 h-4 mr-2.5 transition-colors", isActive ? "text-rose-400" : "text-slate-400 group-hover:text-rose-400")} />
                    AI Cold Calling & VoIP
                  </div>
                  <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-extrabold border border-rose-500/30">DIALER</span>
                </>
              )}
            </NavLink>

            {/* 3. Instagram DM & Viral */}
            <NavLink
              to="/dashboard/instagram"
              className={({ isActive }) => cn(
                "group flex items-center justify-between px-3 py-2 rounded-xl transition-all text-xs font-bold relative overflow-hidden",
                isActive 
                  ? "text-white bg-pink-500/20 border border-pink-400/40 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-pink-400 rounded-r-full shadow-sm shadow-pink-400" />}
                  <div className="flex items-center">
                    <Camera className={cn("w-4 h-4 mr-2.5 transition-colors", isActive ? "text-pink-400" : "text-slate-400 group-hover:text-pink-400")} />
                    Instagram DM Engine
                  </div>
                  <span className="text-[9px] bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded font-extrabold border border-pink-500/30">VIRAL</span>
                </>
              )}
            </NavLink>

            {/* 4. Email Marketing Studio (Brand New Enterprise Feature) */}
            <NavLink
              to="/dashboard/email"
              className={({ isActive }) => cn(
                "group flex items-center justify-between px-3 py-2 rounded-xl transition-all text-xs font-bold relative overflow-hidden",
                isActive 
                  ? "text-white bg-purple-500/20 border border-purple-400/40 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-400 rounded-r-full shadow-sm shadow-purple-400" />}
                  <div className="flex items-center">
                    <Mail className={cn("w-4 h-4 mr-2.5 transition-colors", isActive ? "text-purple-400" : "text-slate-400 group-hover:text-purple-400")} />
                    Email Marketing
                  </div>
                  <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-extrabold border border-purple-500/30">NEW</span>
                </>
              )}
            </NavLink>

            {/* 5. AI Agent & RAG Studio */}
            <NavLink
              to="/dashboard/agents"
              className={({ isActive }) => cn(
                "group flex items-center justify-between px-3 py-2 rounded-xl transition-all text-xs font-bold relative overflow-hidden",
                isActive 
                  ? "text-white bg-emerald-500/20 border border-emerald-400/40 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-400 rounded-r-full shadow-sm shadow-emerald-400" />}
                  <div className="flex items-center">
                    <Bot className={cn("w-4 h-4 mr-2.5 transition-colors", isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-400")} />
                    AI Agent & RAG Studio
                  </div>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-extrabold border border-emerald-500/30">RAG AI</span>
                </>
              )}
            </NavLink>
          </div>
        </div>

        {/* SECTION 3: AUTOMATION & INTERACTIVE */}
        <div>
          <div className="px-3 mb-1.5 flex items-center justify-between text-[10px] font-extrabold text-slate-400/90 tracking-wider uppercase">
            <span>Automation & Interactive</span>
            <span className="text-[9px] text-slate-500 font-mono">FLOWS</span>
          </div>

          <div className="space-y-1">
            <NavLink
              to="/dashboard/utilities/forms"
              className={({ isActive }) => cn(
                "group flex items-center px-3 py-2 rounded-xl transition-all text-xs font-bold relative overflow-hidden",
                isActive 
                  ? "text-white bg-emerald-500/15 border border-emerald-500/30 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-400 rounded-r-full shadow-sm" />}
                  <FileText className={cn("w-4 h-4 mr-2.5 transition-colors", isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-400")} />
                  WhatsApp Forms (Flows)
                </>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/utilities/list"
              className={({ isActive }) => cn(
                "group flex items-center px-3 py-2 rounded-xl transition-all text-xs font-bold relative overflow-hidden",
                isActive 
                  ? "text-white bg-emerald-500/15 border border-emerald-500/30 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-400 rounded-r-full shadow-sm" />}
                  <ListFilter className={cn("w-4 h-4 mr-2.5 transition-colors", isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-400")} />
                  Interactive List Menus
                </>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/flow-builder"
              className={({ isActive }) => cn(
                "group flex items-center justify-between px-3 py-2 rounded-xl transition-all text-xs font-bold relative overflow-hidden",
                isActive 
                  ? "text-white bg-amber-500/20 border border-amber-400/30 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-amber-400 rounded-r-full shadow-sm" />}
                  <div className="flex items-center">
                    <Zap className={cn("w-4 h-4 mr-2.5 transition-colors", isActive ? "text-amber-400" : "text-slate-400 group-hover:text-amber-400")} />
                    Visual Flow Builder
                  </div>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 font-extrabold px-1.5 py-0.5 rounded">BUILDER</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/automation/workflows"
              className={({ isActive }) => cn(
                "group flex items-center px-3 py-2 rounded-xl transition-all text-xs font-bold relative overflow-hidden",
                isActive 
                  ? "text-white bg-indigo-500/15 border border-indigo-500/30 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-400 rounded-r-full shadow-sm" />}
                  <Workflow className={cn("w-4 h-4 mr-2.5 transition-colors", isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-indigo-400")} />
                  Automation Journeys
                </>
              )}
            </NavLink>
          </div>
        </div>

        {/* SECTION 4: PLATFORM, KEYS & ANALYTICS */}
        <div>
          <div className="px-3 mb-1.5 flex items-center justify-between text-[10px] font-extrabold text-slate-400/90 tracking-wider uppercase">
            <span>Platform & Settings</span>
            <span className="text-[9px] text-slate-500 font-mono">SYSTEM</span>
          </div>

          <div className="space-y-1">
            <NavLink
              to="/dashboard/api-hub"
              className={({ isActive }) => cn(
                "group flex items-center justify-between px-3 py-2 rounded-xl transition-all text-xs font-bold relative overflow-hidden",
                isActive 
                  ? "text-white bg-amber-500/20 border border-amber-400/30 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-amber-400 rounded-r-full shadow-sm" />}
                  <div className="flex items-center">
                    <Key className={cn("w-4 h-4 mr-2.5 transition-colors", isActive ? "text-amber-400" : "text-slate-400 group-hover:text-amber-400")} />
                    API Credentials Hub
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/integrations"
              className={({ isActive }) => cn(
                "group flex items-center px-3 py-2 rounded-xl transition-all text-xs font-bold relative overflow-hidden",
                isActive 
                  ? "text-white bg-slate-800 border border-slate-700 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-400 rounded-r-full shadow-sm" />}
                  <Puzzle className={cn("w-4 h-4 mr-2.5 transition-colors", isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-white")} />
                  Integrations
                </>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/analytics"
              className={({ isActive }) => cn(
                "group flex items-center px-3 py-2 rounded-xl transition-all text-xs font-bold relative overflow-hidden",
                isActive 
                  ? "text-white bg-emerald-500/15 border border-emerald-500/30 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-400 rounded-r-full shadow-sm" />}
                  <LineChart className={cn("w-4 h-4 mr-2.5 transition-colors", isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-white")} />
                  ROI & Analytics
                </>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/billing"
              className={({ isActive }) => cn(
                "group flex items-center px-3 py-2 rounded-xl transition-all text-xs font-bold relative overflow-hidden",
                isActive 
                  ? "text-white bg-indigo-500/15 border border-indigo-500/30 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-400 rounded-r-full shadow-sm" />}
                  <ShoppingBag className={cn("w-4 h-4 mr-2.5 transition-colors", isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-white")} />
                  Billing & Credits
                </>
              )}
            </NavLink>
          </div>
        </div>

      </nav>

      {/* Sidebar Footer: Connectivity & Health */}
      <div className="shrink-0 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-2">
            <div className="relative flex">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </div>
            <span className="text-[11px] font-bold text-emerald-400">All Engines Active</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">99.98% SLA</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>PostgreSQL · Redis · Webhook</span>
          <span className="text-emerald-500 font-semibold">Healthy</span>
        </div>
      </div>

    </aside>
  );
}
