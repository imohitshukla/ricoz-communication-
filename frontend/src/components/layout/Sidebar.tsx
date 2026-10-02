import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
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
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    omnichannel: true,
    automation: true
  });

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <aside className="w-[264px] h-screen bg-slate-900 border-r border-slate-800 flex flex-col z-20 shrink-0 text-slate-300">
      
      {/* Sidebar Header */}
      <div className="flex items-center shrink-0 h-16 border-b border-slate-800 bg-slate-950 px-4 justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-gradient-to-tr from-[#00a688] to-emerald-400 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/30 animate-morph-border">
            <span className="text-white font-extrabold text-sm tracking-wider">R</span>
          </div>
          <div>
            <span className="font-extrabold text-white text-base tracking-tight block leading-none">Ricoz</span>
            <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">Omnichannel AI</span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
          v3.2 PRO
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-6 scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* Core Hubs */}
        <div className="px-4 mb-2">
          <span className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase">Mission Control</span>
        </div>

        <div className="space-y-0.5 px-2 mb-4">
          <NavLink
            to="/dashboard/overview"
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-xl transition-all text-xs font-bold",
              isActive 
                ? "text-white bg-emerald-500/15 border border-emerald-500/30 shadow-xs" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <Home className="w-4 h-4 mr-2.5 text-emerald-400" />
            Overview
          </NavLink>

          <NavLink
            to="/dashboard/inbox"
            className={({ isActive }) => cn(
              "flex items-center justify-between px-3 py-2 rounded-xl transition-all text-xs font-bold",
              isActive 
                ? "text-white bg-indigo-500/15 border border-indigo-500/30 shadow-xs" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2.5 text-indigo-400" />
              Unified Inbox
            </div>
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">Live</span>
          </NavLink>

          <NavLink
            to="/dashboard/campaigns"
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-xl transition-all text-xs font-bold",
              isActive 
                ? "text-white bg-emerald-500/15 border border-emerald-500/30 shadow-xs" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <Send className="w-4 h-4 mr-2.5 text-teal-400" />
            Broadcast Studio
          </NavLink>

          <NavLink
            to="/dashboard/contacts"
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-xl transition-all text-xs font-bold",
              isActive 
                ? "text-white bg-emerald-500/15 border border-emerald-500/30 shadow-xs" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <Users className="w-4 h-4 mr-2.5 text-blue-400" />
            Contacts & Segments
          </NavLink>
        </div>

        {/* Omnichannel Channels Section */}
        <div className="px-4 mb-2 flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase">Omnichannel Engines</span>
          <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20 flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
            4 Live
          </span>
        </div>

        <div className="space-y-0.5 px-2 mb-4">
          <NavLink
            to="/dashboard/rcs"
            className={({ isActive }) => cn(
              "flex items-center justify-between px-3 py-2 rounded-xl transition-all text-xs font-bold",
              isActive 
                ? "text-white bg-blue-500/20 border border-blue-400/30 shadow-xs" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <div className="flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2.5 text-blue-400" />
              Google RCS Studio
            </div>
            <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-extrabold">NEW</span>
          </NavLink>

          <NavLink
            to="/dashboard/voice"
            className={({ isActive }) => cn(
              "flex items-center justify-between px-3 py-2 rounded-xl transition-all text-xs font-bold",
              isActive 
                ? "text-white bg-rose-500/20 border border-rose-400/30 shadow-xs" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2.5 text-rose-400" />
              AI Cold Calling & VoIP
            </div>
            <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-extrabold">DIALER</span>
          </NavLink>

          <NavLink
            to="/dashboard/instagram"
            className={({ isActive }) => cn(
              "flex items-center justify-between px-3 py-2 rounded-xl transition-all text-xs font-bold",
              isActive 
                ? "text-white bg-pink-500/20 border border-pink-400/30 shadow-xs" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <div className="flex items-center">
              <Camera className="w-4 h-4 mr-2.5 text-pink-400" />
              Instagram DM & Viral
            </div>
            <span className="text-[9px] bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded font-extrabold">AUTO</span>
          </NavLink>

          <NavLink
            to="/dashboard/automation/ai-agent"
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-xl transition-all text-xs font-bold",
              isActive 
                ? "text-white bg-emerald-500/15 border border-emerald-500/30 shadow-xs" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <MessageSquare className="w-4 h-4 mr-2.5 text-emerald-400" />
            WhatsApp AI Agent
          </NavLink>
        </div>

        {/* WhatsApp Interactive Utilities */}
        <div className="px-4 mb-2">
          <span className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase">WhatsApp Interactive</span>
        </div>

        <div className="space-y-0.5 px-2 mb-4">
          <NavLink
            to="/dashboard/utilities/forms"
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-xl transition-all text-xs font-bold",
              isActive 
                ? "text-white bg-emerald-500/15 border border-emerald-500/30 shadow-xs" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <FileText className="w-4 h-4 mr-2.5 text-emerald-400" />
            WhatsApp Forms (Flows)
          </NavLink>

          <NavLink
            to="/dashboard/utilities/list"
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-xl transition-all text-xs font-bold",
              isActive 
                ? "text-white bg-emerald-500/15 border border-emerald-500/30 shadow-xs" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <ListFilter className="w-4 h-4 mr-2.5 text-emerald-400" />
            Interactive List Menus
          </NavLink>

          <NavLink
            to="/dashboard/flow-builder"
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-xl transition-all text-xs font-bold",
              isActive 
                ? "text-white bg-purple-500/15 border border-purple-500/30 shadow-xs" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <Zap className="w-4 h-4 mr-2.5 text-purple-400" />
            Visual Flow Builder
          </NavLink>
        </div>

        {/* Credentials & System Hub */}
        <div className="px-4 mb-2">
          <span className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase">Platform & Keys</span>
        </div>

        <div className="space-y-0.5 px-2">
          <NavLink
            to="/dashboard/api-hub"
            className={({ isActive }) => cn(
              "flex items-center justify-between px-3 py-2 rounded-xl transition-all text-xs font-bold",
              isActive 
                ? "text-white bg-amber-500/20 border border-amber-400/30 shadow-xs" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <div className="flex items-center">
              <Key className="w-4 h-4 mr-2.5 text-amber-400" />
              API Credentials Hub
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </NavLink>

          <NavLink
            to="/dashboard/integrations"
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-xl transition-all text-xs font-bold",
              isActive 
                ? "text-white bg-emerald-500/15 border border-emerald-500/30 shadow-xs" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <Puzzle className="w-4 h-4 mr-2.5 text-slate-400" />
            Integrations
          </NavLink>

          <NavLink
            to="/dashboard/analytics"
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-xl transition-all text-xs font-bold",
              isActive 
                ? "text-white bg-emerald-500/15 border border-emerald-500/30 shadow-xs" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <LineChart className="w-4 h-4 mr-2.5 text-slate-400" />
            ROI & Analytics
          </NavLink>

          <NavLink
            to="/dashboard/billing"
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-xl transition-all text-xs font-bold",
              isActive 
                ? "text-white bg-emerald-500/15 border border-emerald-500/30 shadow-xs" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <ShoppingBag className="w-4 h-4 mr-2.5 text-slate-400" />
            Billing & Usage
          </NavLink>
        </div>

      </nav>

      {/* Bottom Status Strip */}
      <div className="shrink-0 border-t border-slate-800 bg-slate-950 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative flex">
              <span className="animate-ring absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400">All Systems Live</span>
          </div>
          <span className="text-[10px] text-slate-600 font-mono">99.9% uptime</span>
        </div>
        <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full w-[99.9%] bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
        </div>
      </div>

    </aside>
  );
}
