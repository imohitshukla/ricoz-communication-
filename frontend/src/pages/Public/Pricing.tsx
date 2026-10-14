import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info, Bot, Users, MessageSquare, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

type PlanTier = 'Starter' | 'Growth' | 'Advanced' | 'Enterprise';
type BillingCycle = 'Monthly' | 'Quarterly' | 'Yearly';

interface ServicePlanConfig {
  title: string;
  subtitle: string;
  bannerText: string;
  plans: {
    Starter: {
      prices: Record<BillingCycle, number | null>;
      role: string;
      channelText: string;
      channels: string[];
      choosePlan: string[];
      limits: string[];
      costHeader: string;
      costItems: { label: string; value: string; isFree?: boolean }[];
    };
    Growth: {
      prices: Record<BillingCycle, number | null>;
      role: string;
      channelText: string;
      channels: string[];
      choosePlan: string[];
      limits: string[];
      costHeader: string;
      costItems: { label: string; value: string; isFree?: boolean }[];
    };
    Advanced: {
      prices: Record<BillingCycle, number | null>;
      role: string;
      channelText: string;
      channels: string[];
      choosePlan: string[];
      limits: string[];
      costHeader: string;
      costItems: { label: string; value: string; isFree?: boolean }[];
    };
    Enterprise: {
      prices: Record<BillingCycle, number | null>;
      role: string;
      channelText: string;
      channels: string[];
      choosePlan: string[];
      limits: string[];
      costHeader: string;
      costItems: { label: string; value: string; isFree?: boolean }[];
    };
  };
}

export function Pricing() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Marketing & Support Hub' | 'WhatsApp AI Agents' | 'Sales CRM'>('Marketing & Support Hub');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('Quarterly');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const SERVICES: Record<string, ServicePlanConfig> = {
    'Marketing & Support Hub': {
      title: 'Best WhatsApp & Instagram Automation Tools with Affordable Plans',
      subtitle: 'Scalable outreach, shared team inbox, catalog commerce & automated broadcasts.',
      bannerText: 'ADD ON: WHATSAPP AI AGENTS @ ₹3,000 INR / MO FOR GROWTH & ADVANCED PLAN',
      plans: {
        Starter: {
          prices: { Monthly: 999, Quarterly: 3499, Yearly: 11999 },
          role: 'Unlimited agents (Owner Roles)',
          channelText: 'Pick any one channel',
          channels: ['WhatsApp (on Quarterly/Yearly) or Instagram'],
          choosePlan: [
            'Send bulk WhatsApp campaigns',
            'Manage chats in a Shared Team Inbox',
            'Quick replies & tags setup',
            'Basic broadcast metrics'
          ],
          limits: [
            'Unlimited Messages (Based on your WhatsApp Number)',
            'Unlimited Contacts',
            '15 Custom Fields',
            '15 Custom Tags'
          ],
          costHeader: 'Message cost (Indian destination numbers)*',
          costItems: [
            { label: 'Marketing', value: '₹0.970' },
            { label: 'Authentication', value: '₹0.129' },
            { label: 'Utility', value: '₹0.160' },
            { label: 'Service', value: 'FREE', isFree: true }
          ]
        },
        Growth: {
          prices: { Monthly: 2799, Quarterly: 7699, Yearly: 26399 },
          role: 'Unlimited agents (All Roles)',
          channelText: 'Includes both channels',
          channels: ['WhatsApp', 'Instagram'],
          choosePlan: [
            'Everything in Starter, Plus',
            'FAQ automations & linear chatbot flows',
            'Advanced campaigns with click tracking',
            'Meta Catalog integration & product links'
          ],
          limits: [
            'Unlimited Messages (Based on your WhatsApp Number)',
            'Unlimited Contacts',
            '25 Custom Fields',
            '30 Custom Tags',
            '5 Custom Events'
          ],
          costHeader: 'Message cost (Indian destination numbers)*',
          costItems: [
            { label: 'Marketing', value: '₹0.958' },
            { label: 'Authentication', value: '₹0.128' },
            { label: 'Utility', value: '₹0.150' },
            { label: 'Service', value: 'FREE', isFree: true }
          ]
        },
        Advanced: {
          prices: { Monthly: 3799, Quarterly: 10499, Yearly: 35999 },
          role: 'Unlimited agents (All Roles)',
          channelText: 'Includes both channels',
          channels: ['WhatsApp', 'Instagram'],
          choosePlan: [
            'Everything in Growth, Plus',
            'Advanced chatbot flows with branching logic, API calls & Conditions',
            'Smart team chat auto-assignment & routing',
            'Custom webhooks & in-depth delivery reports'
          ],
          limits: [
            'Unlimited Messages (Based on your WhatsApp Number)',
            'Unlimited Contacts',
            '30 Custom Fields',
            '45 Custom Tags',
            '7 Custom Events'
          ],
          costHeader: 'Message cost (Indian destination numbers)*',
          costItems: [
            { label: 'Marketing', value: '₹0.949' },
            { label: 'Authentication', value: '₹0.127' },
            { label: 'Utility', value: '₹0.140' },
            { label: 'Service', value: 'FREE', isFree: true }
          ]
        },
        Enterprise: {
          prices: { Monthly: null, Quarterly: null, Yearly: null },
          role: 'Unlimited agents (All Roles)',
          channelText: 'Includes all channels',
          channels: ['WhatsApp', 'Instagram', 'RCS Channel'],
          choosePlan: [
            'Everything in Advanced, Plus',
            'RCS Verified Sender branding',
            'Highest API Rate Limits & campaign speed',
            'Dedicated Enterprise Account Manager'
          ],
          limits: [
            'Unlimited Messages',
            'Unlimited Contacts',
            'Unlimited Custom Fields & Tags',
            'Unlimited Custom Events'
          ],
          costHeader: 'Enterprise Message Terms',
          costItems: [
            { label: 'Message Markup', value: '0 Markup' },
            { label: 'Service Messages', value: 'Unlimited' },
            { label: 'Dedicated IP / Route', value: 'Included' },
            { label: 'Priority SLA', value: '24/7 Dedicated' }
          ]
        }
      }
    },

    'WhatsApp AI Agents': {
      title: 'Autonomous WhatsApp AI Agents Built for Sales & 24/7 Support',
      subtitle: 'Train intelligent conversational agents on your catalogs, PDFs, and website to resolve queries and close deals.',
      bannerText: 'AI AGENTS AUTOMATE 80%+ OF INQUIRIES & DRIVE 35% MORE DIRECT SALES ON WHATSAPP',
      plans: {
        Starter: {
          prices: { Monthly: 1999, Quarterly: 5499, Yearly: 18999 },
          role: '1 Active AI Agent Included',
          channelText: 'Channels: WhatsApp & Webchat',
          channels: ['WhatsApp', 'Webchat'],
          choosePlan: [
            '1,000 AI Conversations / mo included',
            'Knowledge base sync from PDF, DOCX & Website URLs',
            'Instant FAQ auto-responses with citation links',
            '22+ Languages supported natively'
          ],
          limits: [
            '1 Active AI Agent',
            '1,000 AI Conversations / mo',
            '20 Knowledge Base Documents',
            'Standard Inference Speed (< 2.5s)'
          ],
          costHeader: 'AI Conversation & Usage Rates',
          costItems: [
            { label: 'Extra AI Conversations', value: '₹1.50 / conversation' },
            { label: 'Agent Handoff', value: 'Manual' },
            { label: 'Vector Storage', value: 'Included' },
            { label: 'Setup / Training Fee', value: 'FREE', isFree: true }
          ]
        },
        Growth: {
          prices: { Monthly: 3000, Quarterly: 8280, Yearly: 28800 },
          role: '3 Active AI Agents Included',
          channelText: 'Channels: WhatsApp & Instagram DM',
          channels: ['WhatsApp', 'Instagram DM'],
          choosePlan: [
            '5,000 AI Conversations / mo included',
            'Meta Catalog integration with live product recommendations',
            'Autonomous Lead Qualification & scoring bot',
            'Context-aware human agent handoff with chat summary'
          ],
          limits: [
            '3 Active AI Agents',
            '5,000 AI Conversations / mo',
            'Unlimited Knowledge Base Sources',
            'Real-time Catalog & Stock Sync'
          ],
          costHeader: 'AI Conversation & Usage Rates',
          costItems: [
            { label: 'Extra AI Conversations', value: '₹1.20 / conversation' },
            { label: 'Agent Handoff', value: 'Automated & Contextual' },
            { label: 'Catalog Integration', value: 'Included' },
            { label: 'Inference Speed', value: 'Priority (< 1.8s)' }
          ]
        },
        Advanced: {
          prices: { Monthly: 5999, Quarterly: 16550, Yearly: 57590 },
          role: 'Unlimited Active AI Agents',
          channelText: 'Channels: WhatsApp, Instagram & RCS',
          channels: ['WhatsApp', 'Instagram', 'RCS'],
          choosePlan: [
            '15,000 AI Conversations / mo included',
            'Custom API tool-calling & external webhook actions',
            'Live order tracking & shipment status bot',
            'Multi-tenant agent routing & CRM bi-directional sync'
          ],
          limits: [
            'Unlimited AI Agents',
            '15,000 AI Conversations / mo',
            'Custom Prompt Guardrails & Brand Personas',
            'Dedicated GPU Inference Allocation'
          ],
          costHeader: 'AI Conversation & Usage Rates',
          costItems: [
            { label: 'Extra AI Conversations', value: '₹0.90 / conversation' },
            { label: 'Custom Tools / APIs', value: 'Unlimited' },
            { label: 'Inference Speed', value: 'Ultra-fast (< 1.2s)' },
            { label: 'Uptime SLA', value: '99.9%' }
          ]
        },
        Enterprise: {
          prices: { Monthly: null, Quarterly: null, Yearly: null },
          role: 'Enterprise AI Cluster',
          channelText: 'Channels: Full Omnichannel Suite',
          channels: ['WhatsApp', 'Instagram', 'RCS', 'Webhooks'],
          choosePlan: [
            'Dedicated LLM fine-tuning & domain dataset training',
            'Private vector database & on-premise connectors',
            'Strict enterprise data privacy & compliance guarantees',
            'Dedicated AI Prompt Engineering team'
          ],
          limits: [
            'Custom Conversation Quotas',
            'Dedicated GPU Cluster',
            'Multi-region deployment',
            'Enterprise Security & SOC2 / HIPAA Ready'
          ],
          costHeader: 'Enterprise AI Support Terms',
          costItems: [
            { label: 'Conversation Quota', value: 'Volume Tiered' },
            { label: 'Dedicated AI Engineer', value: 'Included' },
            { label: 'Model Fine-Tuning', value: 'Custom SLA' },
            { label: 'SLA Guarantee', value: '99.99% Uptime' }
          ]
        }
      }
    },

    'Sales CRM': {
      title: 'WhatsApp-First Sales CRM to Capture, Qualify & Close Leads',
      subtitle: 'Manage pipelines, assign deals round-robin, and track rep performance directly on WhatsApp.',
      bannerText: 'INTERAKT SALES CRM: CLOSE 3X MORE DEALS WITH AUTOMATED PIPELINES & TEAM COLLABORATION',
      plans: {
        Starter: {
          prices: { Monthly: 1499, Quarterly: 4139, Yearly: 14390 },
          role: '2 Sales Agent Seats Included',
          channelText: 'Channels: WhatsApp & Instagram Leads',
          channels: ['WhatsApp', 'Instagram'],
          choosePlan: [
            'Visual Kanban deal pipeline',
            'Automatic lead capture from WhatsApp chats',
            'Deal stages, tags & quick sales notes',
            'Unified contact activity timeline'
          ],
          limits: [
            '2 Sales Agent Seats',
            '1 Active Sales Pipeline',
            '500 Active Deals',
            'Unlimited Contacts'
          ],
          costHeader: 'Extra Sales Agent Seat Pricing',
          costItems: [
            { label: 'Extra Agent Seats', value: '₹499 / agent / mo' },
            { label: 'Kanban Pipelines', value: '1 Pipeline' },
            { label: 'Deal Value Tracking', value: 'Included' },
            { label: 'Lead Source Tracking', value: 'Included' }
          ]
        },
        Growth: {
          prices: { Monthly: 2499, Quarterly: 6897, Yearly: 23988 },
          role: '5 Sales Agent Seats Included',
          channelText: 'Channels: WhatsApp, Instagram & Web Leads',
          channels: ['WhatsApp', 'Instagram', 'Web Leads'],
          choosePlan: [
            'Multiple custom deal pipelines for different products',
            'Automated round-robin lead assignment among reps',
            'Revenue forecasting & win probability tracking',
            'Google Sheets & webhook bi-directional sync'
          ],
          limits: [
            '5 Sales Agent Seats',
            '5 Custom Sales Pipelines',
            '2,500 Active Deals',
            'Automated SLA Reminders'
          ],
          costHeader: 'Extra Sales Agent Seat Pricing',
          costItems: [
            { label: 'Extra Agent Seats', value: '₹499 / agent / mo' },
            { label: 'Pipelines', value: '5 Custom' },
            { label: 'Auto Assignment', value: 'Round-Robin' },
            { label: 'Revenue Forecast', value: 'Included' }
          ]
        },
        Advanced: {
          prices: { Monthly: 4499, Quarterly: 12417, Yearly: 43190 },
          role: '10 Sales Agent Seats Included',
          channelText: 'Channels: Omnichannel Lead Aggregation',
          channels: ['WhatsApp', 'Instagram', 'Web Leads', 'API Ingestion'],
          choosePlan: [
            'Advanced lead routing by deal value, territory, or tag',
            'Sales rep performance & conversion analytics',
            'Payment link tracking with automated recovery nudges',
            'Custom webhook triggers & third-party integrations'
          ],
          limits: [
            '10 Sales Agent Seats',
            'Unlimited Sales Pipelines',
            'Unlimited Active Deals',
            'Custom Deal Automations'
          ],
          costHeader: 'Extra Sales Agent Seat Pricing',
          costItems: [
            { label: 'Extra Agent Seats', value: '₹399 / agent / mo' },
            { label: 'Pipelines', value: 'Unlimited' },
            { label: 'Routing Logic', value: 'Territory & Value' },
            { label: 'Performance Analytics', value: 'Advanced Reports' }
          ]
        },
        Enterprise: {
          prices: { Monthly: null, Quarterly: null, Yearly: null },
          role: 'Unlimited Sales Seats',
          channelText: 'Channels: Full Enterprise Ingestion',
          channels: ['WhatsApp', 'Instagram', 'RCS', 'Enterprise CRM'],
          choosePlan: [
            'Bi-directional sync with Salesforce, HubSpot & Zoho CRM',
            'Custom hierarchical role permissions & security policies',
            'Custom deal approval workflows & multi-currency support',
            'Dedicated CRM implementation engineer'
          ],
          limits: [
            'Unlimited Agent Seats',
            'Unlimited Pipelines & Deals',
            'Custom Data Retention',
            'Enterprise SSO & Audit Logs'
          ],
          costHeader: 'Enterprise CRM Terms',
          costItems: [
            { label: 'CRM Sync', value: 'Salesforce / HubSpot' },
            { label: 'Permissions', value: 'Hierarchical RBAC' },
            { label: 'Implementation', value: 'Dedicated Engineer' },
            { label: 'Support', value: '24/7 Priority SLA' }
          ]
        }
      }
    }
  };

  const currentService = SERVICES[activeTab];

  const getPrice = (tier: 'Starter' | 'Growth' | 'Advanced') => {
    const price = currentService.plans[tier].prices[billingCycle];
    if (price === null) return 'On request';
    return price.toLocaleString('en-IN');
  };

  const getPeriod = () => {
    if (billingCycle === 'Monthly') return '/mo';
    if (billingCycle === 'Quarterly') return '/qtr';
    return '/yr';
  };

  const handleCheckout = async (planName: PlanTier) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signup');
      return;
    }

    const fullPlanName = activeTab === 'Marketing & Support Hub' ? planName : `${activeTab} ${planName}`;
    setIsLoading(planName);
    try {
      const response = await api.post('/api/billing/create-checkout-session', { 
        planName: fullPlanName, 
        billingCycle,
        service: activeTab
      });
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        alert('Could not start checkout session. Please try again.');
        setIsLoading(null);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setIsLoading(null);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        alert('Your session has expired. Please log in again to continue.');
        navigate('/login');
        return;
      }
      const msg = error.response?.data?.error || error.message || 'Failed to initiate checkout. Please try again.';
      alert(`Checkout Notice: ${msg}`);
    } finally {
      setIsLoading(null);
    }
  };

  const tabs: ('Marketing & Support Hub' | 'WhatsApp AI Agents' | 'Sales CRM')[] = [
    'Marketing & Support Hub', 
    'WhatsApp AI Agents', 
    'Sales CRM'
  ];

  const cycles: { name: BillingCycle; badge: string | null }[] = [
    { name: 'Monthly', badge: null },
    { name: 'Quarterly', badge: '▼8%' },
    { name: 'Yearly', badge: '▼20%' }
  ];

  return (
    <div className="pt-32 pb-24 bg-[#f8f9fa] min-h-screen">
      <div className="max-w-[1240px] mx-auto px-4">
        
        {/* Header & Tabs */}
        <div className="text-center mb-10">
          
          {/* Service Switcher Tabs */}
          <div className="inline-flex bg-gray-200/80 p-1.5 rounded-xl mb-8 shadow-inner">
            {tabs.map(tab => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                    isActive 
                      ? "bg-[#00a688] text-white shadow-md scale-100" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
                  )}
                >
                  {tab === 'Marketing & Support Hub' && <MessageSquare className="w-4 h-4" />}
                  {tab === 'WhatsApp AI Agents' && <Bot className="w-4 h-4" />}
                  {tab === 'Sales CRM' && <Users className="w-4 h-4" />}
                  {tab}
                </button>
              );
            })}
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 max-w-4xl mx-auto leading-tight">
            {activeTab === 'Marketing & Support Hub' ? (
              <>
                Best <span className="relative inline-block">
                  WhatsApp & Instagram
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-[#00a688] rounded-full"></div>
                </span> Automation<br />Tools with Affordable Plans
              </>
            ) : activeTab === 'WhatsApp AI Agents' ? (
              <>
                Autonomous <span className="relative inline-block">
                  WhatsApp AI Agents
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-[#00a688] rounded-full"></div>
                </span> Built for<br />24/7 Sales & Customer Support
              </>
            ) : (
              <>
                WhatsApp-First <span className="relative inline-block">
                  Sales CRM
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-[#00a688] rounded-full"></div>
                </span> to Capture,<br />Qualify & Close Leads Faster
              </>
            )}
          </h1>

          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto mb-6">
            {currentService.subtitle}
          </p>

          {/* Billing Cycle Switcher */}
          <div className="inline-flex items-center bg-gray-100 p-1 rounded-full mb-3 shadow-sm border border-gray-200">
            {cycles.map(cycle => (
              <button
                key={cycle.name}
                onClick={() => setBillingCycle(cycle.name)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5",
                  billingCycle === cycle.name 
                    ? "bg-[#00a688] text-white shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {cycle.name}
                {cycle.badge && (
                  <span className={cn(
                    "text-[10px] font-black px-1.5 py-0.5 rounded",
                    billingCycle === cycle.name ? "bg-white/20 text-yellow-200" : "bg-[#ff9900]/10 text-[#ff9900]"
                  )}>
                    {cycle.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          <div className="h-6">
            {billingCycle === 'Monthly' && (
              <p className="text-sm font-semibold text-gray-700">
                Flexible <span className="text-[#00a688] font-bold">Monthly Billing</span>. Upgrade or cancel anytime.
              </p>
            )}
            {billingCycle === 'Quarterly' && (
              <p className="text-sm font-semibold text-gray-700">
                Save <span className="text-[#00a688] font-bold">8% on Quarterly</span>. Discounted price shown below.
              </p>
            )}
            {billingCycle === 'Yearly' && (
              <p className="text-sm font-semibold text-gray-700">
                Save <span className="text-[#00a688] font-bold">20% on Yearly</span>. Best value for high-growth teams.
              </p>
            )}
          </div>
        </div>

        {/* Pricing Table */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <tbody>
                
                {/* Headers / Pricing Cards */}
                <tr>
                  <td className="p-6 border-b border-r w-[20%] align-top bg-gray-50">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-gray-400 block mb-1">
                      {activeTab}
                    </span>
                    <h3 className="text-xl font-bold text-gray-800 leading-tight">
                      Find the right plan for your business needs
                    </h3>
                  </td>
                  
                  {/* Starter */}
                  <td className="p-6 border-b border-r w-[20%] align-top bg-white hover:bg-amber-50/20 transition-colors">
                    <div className="text-[#ff9900] font-bold text-lg mb-1">Starter</div>
                    <div className="text-3xl font-black text-gray-900">
                      ₹{getPrice('Starter')}
                      <span className="text-xs font-normal text-gray-500 ml-1">
                        {getPeriod()} (+taxes)
                      </span>
                    </div>
                    <div className="mt-3 mb-4 text-xs font-semibold text-gray-700 bg-amber-50 border border-amber-200/60 rounded px-2.5 py-1.5 inline-block">
                      {currentService.plans.Starter.role}
                    </div>
                    <button 
                      onClick={() => handleCheckout('Starter')} 
                      disabled={isLoading === 'Starter'} 
                      className="w-full py-2.5 bg-[#ff9900] text-white font-bold rounded-lg hover:bg-[#e68a00] transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isLoading === 'Starter' ? 'Loading...' : 'Start Free Trial'}
                    </button>
                  </td>

                  {/* Growth */}
                  <td className="p-6 border-b border-r w-[20%] align-top bg-white hover:bg-emerald-50/20 transition-colors relative">
                    <div className="absolute top-0 right-0 bg-[#00a688] text-white text-[10px] font-black px-2 py-0.5 rounded-bl">
                      POPULAR
                    </div>
                    <div className="text-[#00a688] font-bold text-lg mb-1">Growth</div>
                    <div className="text-3xl font-black text-gray-900">
                      ₹{getPrice('Growth')}
                      <span className="text-xs font-normal text-gray-500 ml-1">
                        {getPeriod()} (+taxes)
                      </span>
                    </div>
                    <div className="mt-3 mb-4 text-xs font-semibold text-gray-700 bg-emerald-50 border border-emerald-200/60 rounded px-2.5 py-1.5 inline-flex items-center gap-1">
                      {currentService.plans.Growth.role} <Info className="w-3 h-3 text-gray-400" />
                    </div>
                    <button 
                      onClick={() => handleCheckout('Growth')} 
                      disabled={isLoading === 'Growth'} 
                      className="w-full py-2.5 bg-[#00a688] text-white font-bold rounded-lg hover:bg-[#008c73] transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isLoading === 'Growth' ? 'Loading...' : 'Start Free Trial'}
                    </button>
                  </td>

                  {/* Advanced */}
                  <td className="p-6 border-b border-r w-[20%] align-top bg-white hover:bg-sky-50/20 transition-colors">
                    <div className="text-[#0088cc] font-bold text-lg mb-1">Advanced</div>
                    <div className="text-3xl font-black text-gray-900">
                      ₹{getPrice('Advanced')}
                      <span className="text-xs font-normal text-gray-500 ml-1">
                        {getPeriod()} (+taxes)
                      </span>
                    </div>
                    <div className="mt-3 mb-4 text-xs font-semibold text-gray-700 bg-sky-50 border border-sky-200/60 rounded px-2.5 py-1.5 inline-flex items-center gap-1">
                      {currentService.plans.Advanced.role} <Info className="w-3 h-3 text-gray-400" />
                    </div>
                    <button 
                      onClick={() => handleCheckout('Advanced')} 
                      disabled={isLoading === 'Advanced'} 
                      className="w-full py-2.5 bg-[#0088cc] text-white font-bold rounded-lg hover:bg-[#0077b3] transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isLoading === 'Advanced' ? 'Loading...' : 'Start Free Trial'}
                    </button>
                  </td>

                  {/* Enterprise */}
                  <td className="p-6 border-b w-[20%] align-top bg-[#f8fffd] hover:bg-teal-50/40 transition-colors">
                    <div className="text-[#006655] font-bold text-lg mb-1">Enterprise</div>
                    <div className="text-3xl font-black text-gray-900">
                      On request
                    </div>
                    <div className="mt-3 mb-4 text-xs font-semibold text-gray-700 bg-teal-50 border border-teal-200/60 rounded px-2.5 py-1.5 inline-flex items-center gap-1">
                      {currentService.plans.Enterprise.role} <Info className="w-3 h-3 text-gray-400" />
                    </div>
                    <button 
                      onClick={() => window.location.href = 'mailto:sales@ricoz.io?subject=Enterprise%20Plan%20Inquiry'}
                      className="w-full py-2.5 bg-[#006655] text-white font-bold rounded-lg hover:bg-[#004d40] transition-colors shadow-sm"
                    >
                      Get In Touch
                    </button>
                  </td>
                </tr>

                {/* Channels / Coverage */}
                <tr>
                  <td className="p-6 border-b border-r align-middle bg-white font-semibold text-gray-800">
                    <span className="text-sm">Channels & Coverage</span>
                  </td>
                  
                  {/* Starter */}
                  <td className="p-4 border-b border-r text-center">
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-2">
                      {currentService.plans.Starter.channelText}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {currentService.plans.Starter.channels.map((ch, idx) => (
                        <div key={idx} className="flex items-center justify-center gap-1.5 border border-amber-200 rounded py-1.5 px-2 text-xs font-bold text-amber-800 bg-amber-50">
                          <Check className="w-3.5 h-3.5 text-[#ff9900]" /> {ch}
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Growth */}
                  <td className="p-4 border-b border-r text-center">
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-2">
                      {currentService.plans.Growth.channelText}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 border border-green-200 rounded py-2 px-2 text-xs font-bold text-[#00a688] bg-green-50">
                      {currentService.plans.Growth.channels.map((ch, idx) => (
                        <span key={idx} className="flex items-center">
                          <Check className="w-3.5 h-3.5 mr-1" /> {ch}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Advanced */}
                  <td className="p-4 border-b border-r text-center">
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-2">
                      {currentService.plans.Advanced.channelText}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 border border-sky-200 rounded py-2 px-2 text-xs font-bold text-[#0088cc] bg-sky-50">
                      {currentService.plans.Advanced.channels.map((ch, idx) => (
                        <span key={idx} className="flex items-center">
                          <Check className="w-3.5 h-3.5 mr-1" /> {ch}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Enterprise */}
                  <td className="p-4 border-b text-center bg-[#f8fffd]">
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-2">
                      {currentService.plans.Enterprise.channelText}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 border border-teal-200 rounded py-2 px-2 text-xs font-bold text-[#006655] bg-teal-50">
                      {currentService.plans.Enterprise.channels.map((ch, idx) => (
                        <span key={idx} className="flex items-center">
                          <Check className="w-3.5 h-3.5 mr-1" /> {ch}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>

                {/* Choose your plan summary */}
                <tr>
                  <td className="p-6 border-b border-r align-top bg-gray-50 font-semibold text-gray-800">
                    <span className="text-sm">Key Features Included</span>
                  </td>

                  {/* Starter */}
                  <td className="p-6 border-b border-r align-top bg-[#fff8ef]">
                    <ul className="space-y-3.5 text-xs font-medium text-gray-700">
                      {currentService.plans.Starter.choosePlan.map((item, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="w-4 h-4 text-[#ff9900] mr-2 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </td>

                  {/* Growth */}
                  <td className="p-6 border-b border-r align-top bg-[#f0fbf9]">
                    <div className="text-xs font-bold text-gray-800 mb-3 pb-2 border-b border-green-200/60">
                      Everything in <span className="text-[#00a688]">Starter</span>, Plus
                    </div>
                    <ul className="space-y-3.5 text-xs font-medium text-gray-700">
                      {currentService.plans.Growth.choosePlan.map((item, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="w-4 h-4 text-[#00a688] mr-2 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </td>

                  {/* Advanced */}
                  <td className="p-6 border-b border-r align-top bg-[#f0f8fb]">
                    <div className="text-xs font-bold text-gray-800 mb-3 pb-2 border-b border-blue-200/60">
                      Everything in <span className="text-[#0088cc]">Growth</span>, Plus
                    </div>
                    <ul className="space-y-3.5 text-xs font-medium text-gray-700">
                      {currentService.plans.Advanced.choosePlan.map((item, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="w-4 h-4 text-[#0088cc] mr-2 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </td>

                  {/* Enterprise */}
                  <td className="p-6 border-b align-top bg-[#e6fcf8]">
                    <div className="text-xs font-bold text-gray-800 mb-3 pb-2 border-b border-teal-200/60">
                      Everything in <span className="text-[#006655]">Advanced</span>, Plus
                    </div>
                    <ul className="space-y-3.5 text-xs font-medium text-gray-700">
                      {currentService.plans.Enterprise.choosePlan.map((item, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="w-4 h-4 text-[#006655] mr-2 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>

                {/* Plan Limits */}
                <tr>
                  <td className="p-6 border-b border-r align-top bg-white font-semibold text-gray-800">
                    <span className="text-sm">Usage & Limits</span>
                  </td>

                  {/* Starter */}
                  <td className="p-6 border-b border-r align-top">
                    <ul className="space-y-3 text-xs font-medium text-gray-700">
                      {currentService.plans.Starter.limits.map((limit, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="w-4 h-4 text-[#ff9900] mr-2 shrink-0" />
                          <span>{limit}</span>
                        </li>
                      ))}
                    </ul>
                  </td>

                  {/* Growth */}
                  <td className="p-6 border-b border-r align-top">
                    <ul className="space-y-3 text-xs font-medium text-gray-700">
                      {currentService.plans.Growth.limits.map((limit, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="w-4 h-4 text-[#00a688] mr-2 shrink-0" />
                          <span>{limit}</span>
                        </li>
                      ))}
                    </ul>
                  </td>

                  {/* Advanced */}
                  <td className="p-6 border-b border-r align-top">
                    <ul className="space-y-3 text-xs font-medium text-gray-700">
                      {currentService.plans.Advanced.limits.map((limit, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="w-4 h-4 text-[#0088cc] mr-2 shrink-0" />
                          <span>{limit}</span>
                        </li>
                      ))}
                    </ul>
                  </td>

                  {/* Enterprise */}
                  <td className="p-6 border-b align-top bg-[#f8fffd]">
                    <ul className="space-y-3 text-xs font-medium text-gray-700">
                      {currentService.plans.Enterprise.limits.map((limit, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="w-4 h-4 text-[#006655] mr-2 shrink-0" />
                          <span>{limit}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>

                {/* Message / Conversation / Add-on Costs */}
                <tr>
                  <td className="p-6 border-b border-r align-top bg-white font-semibold text-gray-800">
                    <span className="text-sm block mb-1">
                      {activeTab === 'Marketing & Support Hub' 
                        ? 'WhatsApp Message Costs*' 
                        : activeTab === 'WhatsApp AI Agents' 
                        ? 'AI Conversation Rates' 
                        : 'Seat Add-on Costs'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-normal italic">
                      {activeTab === 'Marketing & Support Hub' 
                        ? '*Base Meta charges + platform markup' 
                        : activeTab === 'WhatsApp AI Agents'
                        ? '*Volume discounts on longer commitments'
                        : '*Billed monthly or aligned with billing cycle'}
                    </span>
                  </td>

                  {/* Starter */}
                  <td className="p-6 border-b border-r align-top bg-gray-50/50">
                    <div className="text-xs font-bold text-gray-800 mb-2.5">
                      {currentService.plans.Starter.costHeader}
                    </div>
                    <table className="w-full text-xs">
                      <tbody>
                        {currentService.plans.Starter.costItems.map((c, idx) => (
                          <tr key={idx} className="border-b border-gray-100 last:border-none">
                            <td className="py-1.5 font-medium text-gray-600">{c.label}</td>
                            <td className={cn("text-right font-bold", c.isFree ? "text-[#00a688]" : "text-gray-900")}>
                              {c.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>

                  {/* Growth */}
                  <td className="p-6 border-b border-r align-top bg-gray-50/50">
                    <div className="text-xs font-bold text-gray-800 mb-2.5">
                      {currentService.plans.Growth.costHeader}
                    </div>
                    <table className="w-full text-xs">
                      <tbody>
                        {currentService.plans.Growth.costItems.map((c, idx) => (
                          <tr key={idx} className="border-b border-gray-100 last:border-none">
                            <td className="py-1.5 font-medium text-gray-600">{c.label}</td>
                            <td className={cn("text-right font-bold", c.isFree ? "text-[#00a688]" : "text-gray-900")}>
                              {c.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>

                  {/* Advanced */}
                  <td className="p-6 border-b border-r align-top bg-gray-50/50">
                    <div className="text-xs font-bold text-gray-800 mb-2.5">
                      {currentService.plans.Advanced.costHeader}
                    </div>
                    <table className="w-full text-xs">
                      <tbody>
                        {currentService.plans.Advanced.costItems.map((c, idx) => (
                          <tr key={idx} className="border-b border-gray-100 last:border-none">
                            <td className="py-1.5 font-medium text-gray-600">{c.label}</td>
                            <td className={cn("text-right font-bold", c.isFree ? "text-[#00a688]" : "text-gray-900")}>
                              {c.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>

                  {/* Enterprise */}
                  <td className="p-6 border-b align-top bg-[#f8fffd]">
                    <div className="text-xs font-bold text-gray-800 mb-2.5">
                      {currentService.plans.Enterprise.costHeader}
                    </div>
                    <table className="w-full text-xs">
                      <tbody>
                        {currentService.plans.Enterprise.costItems.map((c, idx) => (
                          <tr key={idx} className="border-b border-gray-100 last:border-none">
                            <td className="py-1.5 font-medium text-gray-600">{c.label}</td>
                            <td className="text-right font-bold text-gray-900">
                              {c.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>

                {/* Highlight Banner */}
                <tr>
                  <td colSpan={5} className="bg-gradient-to-r from-[#e6fcf8] via-[#c9f6ee] to-[#e6fcf8] py-4 text-center border-b">
                    <span className="font-extrabold text-[#006633] tracking-wider text-sm uppercase">
                      {currentService.bannerText}
                    </span>
                  </td>
                </tr>

                {/* Feature Comparison Matrix Header */}
                <tr>
                  <td colSpan={5} className="bg-gray-100 px-6 py-4 border-b font-bold text-gray-800 flex justify-between items-center">
                    <span>Comprehensive Feature Breakdown</span>
                    <span className="text-xs font-normal text-gray-500">All features updated with 2026 Interakt benchmarks</span>
                  </td>
                </tr>

                {/* Detailed Matrix Rows */}
                {activeTab === 'Marketing & Support Hub' && (
                  <>
                    <tr>
                      <td className="p-4 border-b border-r text-sm text-gray-700 font-medium">One-time WhatsApp Broadcasts</td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-r text-sm text-gray-700 font-medium">Ongoing Automated Campaigns</td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-r text-sm text-gray-700 font-medium">Click Tracking & Conversion Analytics</td>
                      <td className="p-4 border-b border-r text-center text-xs text-gray-400">—</td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-r text-sm text-gray-700 font-medium">Click to WhatsApp (CTWA) Ads Launcher</td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-r text-sm text-gray-700 font-medium">WhatsApp Forms & Interactive Flows</td>
                      <td className="p-4 border-b border-r text-center text-xs text-gray-600">Welcome flows</td>
                      <td className="p-4 border-b border-r text-center text-xs text-gray-600">Welcome, OOO & Catalogs</td>
                      <td className="p-4 border-b border-r text-center text-xs text-gray-600">Full Branching & APIs</td>
                      <td className="p-4 border-b text-center text-xs text-gray-600">Custom Flows</td>
                    </tr>
                  </>
                )}

                {activeTab === 'WhatsApp AI Agents' && (
                  <>
                    <tr>
                      <td className="p-4 border-b border-r text-sm text-gray-700 font-medium">24/7 Autonomous AI Resolution</td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-r text-sm text-gray-700 font-medium">Meta Catalog Product Recommendations</td>
                      <td className="p-4 border-b border-r text-center text-xs text-gray-400">—</td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-r text-sm text-gray-700 font-medium">Lead Qualification & Scoring Questions</td>
                      <td className="p-4 border-b border-r text-center text-xs text-gray-600">Basic 2 questions</td>
                      <td className="p-4 border-b border-r text-center text-xs text-gray-600">Up to 4 questions</td>
                      <td className="p-4 border-b border-r text-center text-xs text-gray-600">Unlimited conditional</td>
                      <td className="p-4 border-b text-center text-xs text-gray-600">Custom dynamic</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-r text-sm text-gray-700 font-medium">Custom API Tool-Calling & Order Lookup</td>
                      <td className="p-4 border-b border-r text-center text-xs text-gray-400">—</td>
                      <td className="p-4 border-b border-r text-center text-xs text-gray-400">—</td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                    </tr>
                  </>
                )}

                {activeTab === 'Sales CRM' && (
                  <>
                    <tr>
                      <td className="p-4 border-b border-r text-sm text-gray-700 font-medium">Visual Kanban Lead Pipeline</td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-r text-sm text-gray-700 font-medium">Round-Robin Lead Assignment</td>
                      <td className="p-4 border-b border-r text-center text-xs text-gray-400">—</td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-r text-sm text-gray-700 font-medium">Sales Rep Conversion & SLA Reports</td>
                      <td className="p-4 border-b border-r text-center text-xs text-gray-400">—</td>
                      <td className="p-4 border-b border-r text-center text-xs text-gray-600">Standard Reports</td>
                      <td className="p-4 border-b border-r text-center text-xs text-gray-600">Advanced Analytics</td>
                      <td className="p-4 border-b text-center text-xs text-gray-600">Custom Dashboards</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-r text-sm text-gray-700 font-medium">Payment Link Tracking & Recovery Flow</td>
                      <td className="p-4 border-b border-r text-center text-xs text-gray-400">—</td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                      <td className="p-4 border-b text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                    </tr>
                  </>
                )}
                
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ or Guarantee Footer */}
        <div className="mt-12 text-center text-gray-500 text-xs flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#00a688]" />
            <span>Official WhatsApp Business Solution Provider (BSP)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#ff9900]" />
            <span>Instant API Onboarding & Phone Verification</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-[#0088cc]" />
            <span>14-day free trial on all plans. No credit card required.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
