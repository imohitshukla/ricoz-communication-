import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

export function Pricing() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Marketing & Support Hub');
  const [billingCycle, setBillingCycle] = useState('Quarterly');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleCheckout = async (planName: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Not logged in, go to signup
      navigate('/signup');
      return;
    }

    setIsLoading(planName);
    try {
      // Call backend to create stripe checkout session
      const response = await api.post('/api/billing/create-checkout-session', { planName });
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to initiate checkout. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const tabs = ['Marketing & Support Hub', 'WhatsApp AI Agents', 'Sales CRM'];
  const cycles = [
    { name: 'Monthly', badge: null },
    { name: 'Quarterly', badge: '▼8%' },
    { name: 'Yearly', badge: '▼20%' }
  ];

  return (
    <div className="pt-32 pb-24 bg-[#f8f9fa] min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4">
        
        {/* Header & Tabs */}
        <div className="text-center mb-10">
          <div className="inline-flex bg-gray-100 p-1 rounded-lg mb-8">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2.5 rounded-md text-sm font-bold transition-all",
                  activeTab === tab ? "bg-[#00a688] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
            Best <span className="relative inline-block">
              WhatsApp & Instagram
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-[#00a688] rounded-full"></div>
            </span> Automation<br />Tools with Affordable Plans
          </h1>

          <div className="inline-flex items-center bg-gray-100 p-1 rounded-full mb-4">
            {cycles.map(cycle => (
              <button
                key={cycle.name}
                onClick={() => setBillingCycle(cycle.name)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1",
                  billingCycle === cycle.name ? "bg-[#00a688] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {cycle.name}
                {cycle.badge && (
                  <span className={cn("text-[10px] font-black", billingCycle === cycle.name ? "text-[#ff9900]" : "text-[#ff9900]")}>
                    {cycle.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          <p className="text-sm font-bold text-gray-900">
            Save <span className="text-[#00a688]">8% on Quarterly</span>. Discounted Price below.
          </p>
        </div>

        {/* Pricing Table */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <tbody>
                
                {/* Headers */}
                <tr>
                  <td className="p-6 border-b border-r w-[20%] align-top bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-700 leading-tight">Find the right plan for your needs</h3>
                  </td>
                  
                  {/* Starter */}
                  <td className="p-6 border-b border-r w-[20%] align-top">
                    <div className="text-[#ff9900] font-bold mb-2">Starter</div>
                    <div className="text-3xl font-black text-gray-900">
                      ₹3,499<span className="text-xs font-normal text-gray-500">/qtr (+taxes)</span>
                    </div>
                    <div className="mt-4 mb-4 text-xs font-bold text-gray-900">
                      Unlimited agents (Owner Roles)
                    </div>
                    <button onClick={() => handleCheckout('Starter')} disabled={isLoading === 'Starter'} className="w-full py-2.5 bg-[#ff9900] text-white font-bold rounded hover:bg-[#e68a00] transition-colors disabled:opacity-50">
                      {isLoading === 'Starter' ? 'Loading...' : 'Start Free Trial'}
                    </button>
                  </td>

                  {/* Growth */}
                  <td className="p-6 border-b border-r w-[20%] align-top">
                    <div className="text-[#00a688] font-bold mb-2">Growth</div>
                    <div className="text-3xl font-black text-gray-900">
                      ₹7,699<span className="text-xs font-normal text-gray-500">/qtr (+taxes)</span>
                    </div>
                    <div className="mt-4 mb-4 text-xs font-bold text-gray-900 flex items-center">
                      Unlimited agents (All Roles) <Info className="w-3 h-3 ml-1 text-gray-400" />
                    </div>
                    <button onClick={() => handleCheckout('Growth')} disabled={isLoading === 'Growth'} className="w-full py-2.5 bg-[#00a688] text-white font-bold rounded hover:bg-[#008c73] transition-colors disabled:opacity-50">
                      {isLoading === 'Growth' ? 'Loading...' : 'Start Free Trial'}
                    </button>
                  </td>

                  {/* Advanced */}
                  <td className="p-6 border-b border-r w-[20%] align-top">
                    <div className="text-[#0088cc] font-bold mb-2">Advanced</div>
                    <div className="text-3xl font-black text-gray-900">
                      ₹10,499<span className="text-xs font-normal text-gray-500">/qtr (+taxes)</span>
                    </div>
                    <div className="mt-4 mb-4 text-xs font-bold text-gray-900 flex items-center">
                      Unlimited agents (All Roles) <Info className="w-3 h-3 ml-1 text-gray-400" />
                    </div>
                    <button onClick={() => handleCheckout('Advanced')} disabled={isLoading === 'Advanced'} className="w-full py-2.5 bg-[#0088cc] text-white font-bold rounded hover:bg-[#0077b3] transition-colors disabled:opacity-50">
                      {isLoading === 'Advanced' ? 'Loading...' : 'Start Free Trial'}
                    </button>
                  </td>

                  {/* Enterprise */}
                  <td className="p-6 border-b w-[20%] align-top bg-[#f8fffd]">
                    <div className="text-[#006655] font-bold mb-2">Enterprise</div>
                    <div className="text-3xl font-black text-gray-900">
                      On request
                    </div>
                    <div className="mt-4 mb-4 text-xs font-bold text-gray-900 flex items-center">
                      Unlimited agents (All Roles) <Info className="w-3 h-3 ml-1 text-gray-400" />
                    </div>
                    <button className="w-full py-2.5 bg-[#006655] text-white font-bold rounded hover:bg-[#004d40] transition-colors">
                      Get In Touch
                    </button>
                  </td>
                </tr>

                {/* Channels */}
                <tr>
                  <td className="p-6 border-b border-r align-middle bg-white">
                    <span className="text-sm font-medium text-gray-700">Channels</span>
                  </td>
                  <td className="p-4 border-b border-r text-center">
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-2">Pick any one channel</div>
                    <div className="flex items-center justify-center gap-2 border border-green-200 rounded p-1 text-xs font-bold text-[#00a688] bg-green-50">
                      <Check className="w-3 h-3" /> WhatsApp
                    </div>
                    <div className="flex items-center justify-center gap-2 border border-gray-200 rounded p-1 text-xs font-medium text-gray-400 mt-1">
                      Instagram
                    </div>
                  </td>
                  <td className="p-4 border-b border-r text-center">
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-2">Includes both channels</div>
                    <div className="flex items-center justify-center gap-4 border border-green-200 rounded py-2 text-xs font-bold text-[#00a688] bg-green-50">
                      <span className="flex items-center"><Check className="w-3 h-3 mr-1" /> WhatsApp</span>
                      <span className="flex items-center"><Check className="w-3 h-3 mr-1 text-gray-400" /> <span className="text-gray-500">Instagram</span></span>
                    </div>
                  </td>
                  <td className="p-4 border-b border-r text-center">
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-2">Includes both channels</div>
                    <div className="flex items-center justify-center gap-4 border border-green-200 rounded py-2 text-xs font-bold text-[#00a688] bg-green-50">
                      <span className="flex items-center"><Check className="w-3 h-3 mr-1" /> WhatsApp</span>
                      <span className="flex items-center"><Check className="w-3 h-3 mr-1 text-gray-400" /> <span className="text-gray-500">Instagram</span></span>
                    </div>
                  </td>
                  <td className="p-4 border-b text-center bg-[#f8fffd]">
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-2">Includes both channels</div>
                    <div className="flex items-center justify-center gap-4 border border-green-200 rounded py-2 text-xs font-bold text-[#00a688] bg-green-50">
                      <span className="flex items-center"><Check className="w-3 h-3 mr-1" /> WhatsApp</span>
                      <span className="flex items-center"><Check className="w-3 h-3 mr-1 text-gray-400" /> <span className="text-gray-500">Instagram</span></span>
                    </div>
                  </td>
                </tr>

                {/* Choose your plan summary */}
                <tr>
                  <td className="p-6 border-b border-r align-top bg-gray-50">
                    <span className="text-sm font-medium text-gray-700">Choose your plan</span>
                  </td>
                  <td className="p-6 border-b border-r align-top bg-[#fff8ef]">
                    <ul className="space-y-4 text-xs font-medium text-gray-700">
                      <li className="flex items-start"><Check className="w-4 h-4 text-[#ff9900] mr-2 shrink-0 mt-0.5" /> Send bulk WhatsApp campaigns</li>
                      <li className="flex items-start"><Check className="w-4 h-4 text-[#ff9900] mr-2 shrink-0 mt-0.5" /> Manage chats in a Shared Team Inbox & set up</li>
                    </ul>
                  </td>
                  <td className="p-6 border-b border-r align-top bg-[#f0fbf9]">
                    <div className="text-xs font-bold text-gray-800 mb-4">Everything in <span className="text-[#00a688]">Starter</span>, Plus</div>
                    <ul className="space-y-4 text-xs font-medium text-gray-700">
                      <li className="flex items-start"><Check className="w-4 h-4 text-[#00a688] mr-2 shrink-0 mt-0.5" /> FAQ automations & linear chatbot flows</li>
                      <li className="flex items-start"><Check className="w-4 h-4 text-[#00a688] mr-2 shrink-0 mt-0.5" /> Advanced campaigns</li>
                    </ul>
                  </td>
                  <td className="p-6 border-b border-r align-top bg-[#f0f8fb]">
                    <div className="text-xs font-bold text-gray-800 mb-4">Everything in <span className="text-[#0088cc]">Growth</span>, Plus</div>
                    <ul className="space-y-4 text-xs font-medium text-gray-700">
                      <li className="flex items-start"><Check className="w-4 h-4 text-[#0088cc] mr-2 shrink-0 mt-0.5" /> Get advanced chatbot flows with branching, API calls & Conditions</li>
                    </ul>
                  </td>
                  <td className="p-6 border-b align-top bg-[#e6fcf8]">
                    <div className="text-xs font-bold text-gray-800 mb-4">Everything in <span className="text-[#0088cc]">Advanced</span>, Plus</div>
                    <ul className="space-y-4 text-xs font-medium text-gray-700">
                      <li className="flex items-start"><Check className="w-4 h-4 text-[#0088cc] mr-2 shrink-0 mt-0.5" /> RCS channel</li>
                      <li className="flex items-start"><Check className="w-4 h-4 text-[#0088cc] mr-2 shrink-0 mt-0.5" /> Higher Rate Limits</li>
                      <li className="flex items-start"><Check className="w-4 h-4 text-[#0088cc] mr-2 shrink-0 mt-0.5" /> Better Campaign Speeds</li>
                    </ul>
                  </td>
                </tr>

                {/* Limits */}
                <tr>
                  <td className="p-6 border-b border-r align-top bg-white">
                    <span className="text-sm font-medium text-gray-700">Limits</span>
                  </td>
                  <td className="p-6 border-b border-r align-top">
                    <ul className="space-y-3 text-xs font-medium text-gray-700">
                      <li className="flex items-start"><Check className="w-4 h-4 text-[#ff9900] mr-2 shrink-0" /> Unlimited Messages (Based on your WhatsApp Number)</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-[#ff9900] mr-2" /> Unlimited Contacts</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-[#ff9900] mr-2" /> 15 Custom Fields</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-[#ff9900] mr-2" /> 15 Custom Tags</li>
                    </ul>
                  </td>
                  <td className="p-6 border-b border-r align-top">
                    <ul className="space-y-3 text-xs font-medium text-gray-700">
                      <li className="flex items-start"><Check className="w-4 h-4 text-[#00a688] mr-2 shrink-0" /> Unlimited Messages (Based on your WhatsApp Number)</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-[#00a688] mr-2" /> Unlimited Contacts</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-[#00a688] mr-2" /> 25 Custom Fields</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-[#00a688] mr-2" /> 30 Custom Tags</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-[#00a688] mr-2" /> 5 Custom Events</li>
                    </ul>
                  </td>
                  <td className="p-6 border-b border-r align-top">
                    <ul className="space-y-3 text-xs font-medium text-gray-700">
                      <li className="flex items-start"><Check className="w-4 h-4 text-[#0088cc] mr-2 shrink-0" /> Unlimited Messages (Based on your WhatsApp Number)</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-[#0088cc] mr-2" /> Unlimited Contacts</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-[#0088cc] mr-2" /> 30 Custom Fields</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-[#0088cc] mr-2" /> 45 Custom Tags</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-[#0088cc] mr-2" /> 7 Custom Events</li>
                    </ul>
                  </td>
                  <td className="p-6 border-b align-top bg-[#f8fffd]">
                    <ul className="space-y-3 text-xs font-medium text-gray-700">
                      <li className="flex items-start"><Check className="w-4 h-4 text-[#0088cc] mr-2 shrink-0" /> Unlimited Messages (Based on your WhatsApp Number)</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-[#0088cc] mr-2" /> Unlimited Contacts</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-[#0088cc] mr-2" /> Unlimited Custom Fields</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-[#0088cc] mr-2" /> Unlimited Custom Tags</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-[#0088cc] mr-2" /> Unlimited Custom Events</li>
                    </ul>
                  </td>
                </tr>

                {/* Message Cost */}
                <tr>
                  <td className="p-6 border-b border-r align-top bg-white">
                    <span className="text-sm font-medium text-gray-700 block mb-2">Message cost (Based on the type of template)*</span>
                    <span className="text-[10px] text-gray-500 italic">*Price for Indian destination numbers. <a href="#" className="text-blue-500">Click here for other regions</a></span>
                  </td>
                  <td className="p-6 border-b border-r align-top">
                    <div className="text-xs font-bold text-gray-900 mb-2">Message cost (Based on the type of template)*</div>
                    <table className="w-full text-xs">
                      <tbody>
                        <tr><td className="py-1 font-bold">Marketing</td><td className="text-right">₹0.970</td></tr>
                        <tr><td className="py-1 font-bold">Authentication</td><td className="text-right">₹0.129</td></tr>
                        <tr><td className="py-1 font-bold">Utility</td><td className="text-right">₹0.160</td></tr>
                        <tr><td className="py-1 font-bold">Service</td><td className="text-right">FREE</td></tr>
                      </tbody>
                    </table>
                  </td>
                  <td className="p-6 border-b border-r align-top">
                    <div className="text-xs font-bold text-gray-900 mb-2">Message cost (Based on the type of template)*</div>
                    <table className="w-full text-xs">
                      <tbody>
                        <tr><td className="py-1 font-bold">Marketing</td><td className="text-right">₹0.958</td></tr>
                        <tr><td className="py-1 font-bold">Authentication</td><td className="text-right">₹0.128</td></tr>
                        <tr><td className="py-1 font-bold">Utility</td><td className="text-right">₹0.150</td></tr>
                        <tr><td className="py-1 font-bold">Service</td><td className="text-right">FREE</td></tr>
                      </tbody>
                    </table>
                  </td>
                  <td className="p-6 border-b border-r align-top">
                    <div className="text-xs font-bold text-gray-900 mb-2">Message cost (Based on the type of template)*</div>
                    <table className="w-full text-xs">
                      <tbody>
                        <tr><td className="py-1 font-bold">Marketing</td><td className="text-right">₹0.949</td></tr>
                        <tr><td className="py-1 font-bold">Authentication</td><td className="text-right">₹0.127</td></tr>
                        <tr><td className="py-1 font-bold">Utility</td><td className="text-right">₹0.140</td></tr>
                        <tr><td className="py-1 font-bold">Service</td><td className="text-right">FREE</td></tr>
                      </tbody>
                    </table>
                  </td>
                  <td className="p-6 border-b align-top bg-[#f8fffd]">
                    <ul className="space-y-4 text-xs font-bold text-gray-900">
                      <li>Unlimited Messages</li>
                      <li>No Markup Charges</li>
                      <li>Dedicated Account Manager</li>
                    </ul>
                  </td>
                </tr>

                {/* AI Agents Banner */}
                <tr>
                  <td colSpan={5} className="bg-[#a3f4a3] py-4 text-center border-b">
                    <span className="font-bold text-[#006633] tracking-wide text-sm">ADD ON: WHATSAPP AI AGENTS @ 3000 INR FOR GROWTH & ADVANCED PLAN</span>
                  </td>
                </tr>

                {/* Market Header Row */}
                <tr>
                  <td colSpan={5} className="bg-gray-100 p-4 border-b font-bold text-gray-800 flex justify-between items-center">
                    Market
                    <span className="text-xl leading-none">&times;</span>
                  </td>
                </tr>

                {/* Market Details */}
                <tr>
                  <td className="p-4 border-b border-r text-sm text-gray-700">One-time Campaigns</td>
                  <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                  <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                  <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                  <td className="p-4 border-b text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-r text-sm text-gray-700">Ongoing Campaigns</td>
                  <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                  <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                  <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                  <td className="p-4 border-b text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-r text-sm text-gray-700">Advanced Campaign Triggers</td>
                  <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                  <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                  <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                  <td className="p-4 border-b text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-r text-sm text-gray-700">Click Tracking</td>
                  <td className="p-4 border-b border-r text-center"></td>
                  <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                  <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                  <td className="p-4 border-b text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-r text-sm text-gray-700">Post-reply-flows</td>
                  <td className="p-4 border-b border-r text-center text-xs">Opt-Out Flow</td>
                  <td className="p-4 border-b border-r text-center text-xs">Opt-Out Flow, Send Products, Interaktive List, Send Custom Reply...</td>
                  <td className="p-4 border-b border-r text-center text-xs">Opt-Out Flow, Send Products, Interaktive List, Send Custom Reply...</td>
                  <td className="p-4 border-b text-center text-xs">Opt-Out Flow, Send Products, Interaktive List, Send Custom Reply...</td>
                </tr>

                {/* Templates Header */}
                <tr>
                  <td colSpan={5} className="bg-gray-100 p-4 border-b font-bold text-gray-800 flex justify-between items-center">
                    Template Types
                    <span className="text-xl leading-none">&times;</span>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-r text-sm text-gray-700">CTWA Ads – Launcher</td>
                  <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                  <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                  <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                  <td className="p-4 border-b text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-r text-sm text-gray-700">WhatsApp Forms Creation</td>
                  <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                  <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                  <td className="p-4 border-b border-r text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                  <td className="p-4 border-b text-center"><Check className="w-5 h-5 text-[#00a688] mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-r text-sm text-gray-700">WhatsApp Forms Sending</td>
                  <td className="p-4 border-b border-r text-center text-xs text-gray-700">Send via Welcome Message</td>
                  <td className="p-4 border-b border-r text-center text-xs text-gray-700">Send via Welcome, OOO, Delayed Messages</td>
                  <td className="p-4 border-b border-r text-center text-xs text-gray-700">Send via Welcome, OOO, Delayed Messages, Workflows</td>
                  <td className="p-4 border-b text-center text-xs text-gray-700">Same as advanced</td>
                </tr>
                
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
