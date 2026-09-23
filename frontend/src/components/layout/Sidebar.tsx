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
  ChevronRight,
  Menu,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    automation: true
  });

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <aside className="w-[260px] h-screen bg-[#f8fcf9] border-r border-gray-200 flex flex-col z-20 shrink-0">
      
      {/* Sidebar Header (Burger + Logo) */}
      <div className="flex items-center shrink-0 h-16 border-b border-gray-200 bg-white">
        <button className="w-16 h-16 bg-[#1e4c3b] flex items-center justify-center shrink-0 hover:bg-[#153a2d] transition-colors">
          <Menu className="w-6 h-6 text-white" />
        </button>
        <div className="flex items-center px-4">
          <div className="w-6 h-6 bg-[#00a688] rounded-md flex items-center justify-center mr-2">
            <span className="text-white font-bold text-xs">R</span>
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">Ricoz</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-20 scrollbar-hide">
        
        <div className="mb-4">
          <NavLink
            to="/dashboard/overview"
            className={({ isActive }) => cn(
              "flex items-center px-6 py-2.5 transition-colors text-sm font-medium",
              isActive ? "text-[#00a688] bg-[#00a688]/10 border-l-4 border-[#00a688]" : "text-gray-700 hover:bg-gray-100 border-l-4 border-transparent"
            )}
          >
            <Home className="w-4 h-4 mr-3" />
            Home
          </NavLink>
        </div>

        <div className="px-6 mb-2">
          <span className="text-[10px] font-bold text-[#8a98b4] tracking-wider uppercase">Quick Links</span>
        </div>

        <div className="space-y-0.5">
          {[
            { icon: Mail, label: 'Inbox', path: '/dashboard/inbox' },
            { icon: Send, label: 'Campaigns', path: '/dashboard/campaigns' },
            { icon: Users, label: 'Contacts', path: '/dashboard/contacts' },
          ].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center px-6 py-2.5 transition-colors text-sm font-medium",
                isActive ? "text-[#00a688] bg-[#00a688]/10 border-l-4 border-[#00a688]" : "text-gray-700 hover:bg-gray-100 border-l-4 border-transparent"
              )}
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Collapsible Menus */}
        <div className="mt-2 space-y-0.5">
          {/* Market */}
          <div>
            <button className="w-full flex items-center justify-between px-6 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors border-l-4 border-transparent">
              <div className="flex items-center text-sm font-medium">
                <Store className="w-4 h-4 mr-3" />
                Market
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Support */}
          <div>
            <button className="w-full flex items-center justify-between px-6 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors border-l-4 border-transparent">
              <div className="flex items-center text-sm font-medium">
                <HelpCircle className="w-4 h-4 mr-3" />
                Support
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Automation */}
          <div>
            <button 
              onClick={() => toggleMenu('automation')}
              className={cn(
                "w-full flex items-center justify-between px-6 py-2.5 transition-colors border-l-4",
                expandedMenus.automation ? "border-transparent bg-transparent" : "border-transparent hover:bg-gray-100"
              )}
            >
              <div className="flex items-center text-sm font-medium text-gray-700">
                <Zap className="w-4 h-4 mr-3" />
                Automation
                <span className="ml-2 text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full font-bold">New</span>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", expandedMenus.automation ? "rotate-180" : "")} />
            </button>
            
            {expandedMenus.automation && (
              <div className="bg-[#f0fbf6] py-2 mt-1 relative">
                <div className="absolute left-[38px] top-0 bottom-0 w-px bg-gray-200"></div>
                <ul className="space-y-1">
                  {[
                    { label: 'Basic Automations', path: '/dashboard/automation/basic' },
                    { label: 'Custom Auto Reply', path: '/dashboard/automation/custom' },
                    { label: 'Workflows', path: '/dashboard/automation/workflows' },
                    { label: 'AI Intent Matching', path: '/dashboard/automation/intent' },
                    { label: 'WhatsApp AI Agent', path: '/dashboard/automation/ai-agent' },
                    { label: 'Instagram Quickflows', path: '/dashboard/automation/ig-quickflows' },
                    { label: 'Voice AI - Inbound Calls', path: '/dashboard/automation/voice' },
                  ].map((subItem) => (
                    <li key={subItem.path}>
                      <NavLink
                        to={subItem.path}
                        className={({ isActive }) => cn(
                          "flex items-center pl-[52px] pr-6 py-2 text-sm font-medium transition-colors relative",
                          isActive ? "text-[#00a688] bg-[#dcf2e9]" : "text-gray-600 hover:text-gray-900 hover:bg-black/5"
                        )}
                      >
                        {/* Tree node connector */}
                        <div className="absolute left-[38px] top-1/2 w-3 h-px bg-gray-200"></div>
                        {subItem.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
                <div className="px-6 mt-4 mb-2">
                  <span className="text-[10px] font-bold text-[#8a98b4] tracking-wider uppercase">Utilities</span>
                </div>
                <ul className="space-y-1">
                  {[
                    { label: 'WhatsApp Forms', path: '/dashboard/utilities/forms' },
                    { label: 'Interaktive List', path: '/dashboard/utilities/list' },
                  ].map((subItem) => (
                    <li key={subItem.path}>
                      <NavLink
                        to={subItem.path}
                        className={({ isActive }) => cn(
                          "flex items-center pl-[52px] pr-6 py-2 text-sm font-medium transition-colors relative",
                          isActive ? "text-[#00a688] bg-[#dcf2e9]" : "text-gray-600 hover:text-gray-900 hover:bg-black/5"
                        )}
                      >
                        <div className="absolute left-[38px] top-1/2 w-3 h-px bg-gray-200"></div>
                        {subItem.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sales CRM */}
          <div>
            <button className="w-full flex items-center justify-between px-6 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors border-l-4 border-transparent">
              <div className="flex items-center text-sm font-medium">
                <LineChart className="w-4 h-4 mr-3" />
                Sales CRM
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* WhatsApp Commerce */}
          <div>
            <button className="w-full flex items-center justify-between px-6 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors border-l-4 border-transparent">
              <div className="flex items-center text-sm font-medium">
                <ShoppingBag className="w-4 h-4 mr-3" />
                WhatsApp Commerce
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Integrations */}
          <div>
            <NavLink
              to="/dashboard/integrations"
              className={({ isActive }) => cn(
                "flex items-center px-6 py-2.5 transition-colors text-sm font-medium",
                isActive ? "text-[#00a688] bg-[#00a688]/10 border-l-4 border-[#00a688]" : "text-gray-700 hover:bg-gray-100 border-l-4 border-transparent"
              )}
            >
              <Puzzle className="w-4 h-4 mr-3" />
              Integrations
            </NavLink>
          </div>

          {/* Widget */}
          <div>
            <NavLink
              to="/dashboard/widget"
              className={({ isActive }) => cn(
                "flex items-center px-6 py-2.5 transition-colors text-sm font-medium",
                isActive ? "text-[#00a688] bg-[#00a688]/10 border-l-4 border-[#00a688]" : "text-gray-700 hover:bg-gray-100 border-l-4 border-transparent"
              )}
            >
              <LayoutTemplate className="w-4 h-4 mr-3" />
              Widget
            </NavLink>
          </div>

          <div className="px-6 mt-4 mb-2">
            <span className="text-[10px] font-bold text-[#8a98b4] tracking-wider uppercase">Account</span>
          </div>

          <div>
            <NavLink
              to="/dashboard/billing"
              className={({ isActive }) => cn(
                "flex items-center px-6 py-2.5 transition-colors text-sm font-medium",
                isActive ? "text-[#00a688] bg-[#00a688]/10 border-l-4 border-[#00a688]" : "text-gray-700 hover:bg-gray-100 border-l-4 border-transparent"
              )}
            >
              <ShoppingBag className="w-4 h-4 mr-3" />
              Billing
            </NavLink>
          </div>

        </div>
      </nav>

      {/* Navigation Tour floating widget */}
      <div className="absolute bottom-4 left-4 right-4 bg-[#1e4c3b] rounded-lg p-3 text-white shadow-lg">
        <div className="flex items-center space-x-2 mb-2">
          <div className="bg-white/20 p-1 rounded">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold">Need a Quick Navigation Tour?</span>
        </div>
        <button className="w-full bg-white text-[#1e4c3b] text-xs font-bold py-2 rounded transition-colors hover:bg-gray-100">
          Start Tour
        </button>
      </div>

    </aside>
  );
}
