import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Globe, MessageSquare, ArrowRight, Phone, Camera, MessageCircle, FileText, TrendingUp, Zap, ShoppingCart, Bell, Briefcase, Plane, Coffee, Scissors, Heart, Sparkles, BookOpen, Car, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeChannel, setActiveChannel] = useState('WhatsApp');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null);
  }, [location.pathname]);

  const channels = [
    { name: 'WhatsApp', icon: <MessageCircle className="w-5 h-5" />, active: true },
    { name: 'Instagram', icon: <Camera className="w-5 h-5" /> },
    { name: 'RCS', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Voice', icon: <Phone className="w-5 h-5" />, isNew: true },
  ];

  const whatsappFeatures = [
    { name: 'WhatsApp Voice Calling', path: '/whatsapp-voice-calling' },
    { name: 'No Code Chatbot Builder', path: '/whatsapp-ai-agents' },
    { name: 'WhatsApp Business API', path: '/whatsapp-business-api-live-demo' },
    { name: 'WhatsApp Forms', path: '/whatsapp-ai-agents' },
    { name: 'Click to WhatsApp Ads', path: '/marketing-automation' },
    { name: 'WhatsApp Marketing', path: '/marketing-automation' },
    { name: 'WhatsApp Automation', path: '/customer-support-automation' },
    { name: 'WhatsApp CRM', path: '/solo' },
    { name: 'WhatsApp Commerce', path: '/solo' },
    { name: 'WhatsApp Chat Widget', path: '/customer-support-automation' },
    { name: 'WhatsApp Notification Library', path: '/marketing-automation' },
  ];

  const instagramFeatures = [
    { name: 'Instagram DM Automation', path: '/customer-support-automation' },
    { name: 'Auto-Reply to Stories', path: '/customer-support-automation' },
    { name: 'Instagram Marketing Campaigns', path: '/marketing-automation' },
    { name: 'AI Agents for Instagram', path: '/whatsapp-ai-agents' },
    { name: 'Click to Instagram Direct Ads', path: '/marketing-automation' },
    { name: 'Instagram CRM', path: '/solo' },
  ];

  const rcsFeatures = [
    { name: 'RCS Business Messaging', path: '/marketing-automation' },
    { name: 'RCS Interactive Campaigns', path: '/marketing-automation' },
    { name: 'Rich Media Chatbots', path: '/whatsapp-ai-agents' },
    { name: 'RCS Customer Support', path: '/customer-support-automation' },
    { name: 'Verified Business Profile', path: '/solo' },
  ];

  const voiceFeatures = [
    { name: 'MyCallGenie AI Receptionist', path: '/mycallgenie-ai-call-receptionist' },
    { name: 'WhatsApp Voice Calling', path: '/whatsapp-voice-calling' },
    { name: 'AI Voice Agents', path: '/whatsapp-ai-agents' },
    { name: 'Automated Voice Campaigns', path: '/marketing-automation' },
    { name: 'Voice Analytics', path: '/solo' },
  ];

  const industries = [
    { name: 'B2B Sales', icon: <Briefcase className="w-4 h-4" />, path: '/solo' },
    { name: 'Travel and Tourism', icon: <Plane className="w-4 h-4" />, path: '/solo' },
    { name: 'Restaurants & Food Business', icon: <Coffee className="w-4 h-4" />, path: '/solo' },
    { name: 'Spas and Salons', icon: <Scissors className="w-4 h-4" />, path: '/solo' },
    { name: 'Health & Wellness Brands', icon: <Heart className="w-4 h-4" />, path: '/solo' },
    { name: 'Beauty & Cosmetics Brands', icon: <Sparkles className="w-4 h-4" />, path: '/solo' },
    { name: 'Edutech', icon: <BookOpen className="w-4 h-4" />, path: '/solo' },
    { name: 'Automotive Industry', icon: <Car className="w-4 h-4" />, path: '/solo' },
    { name: 'Home Decor & Furnishing', icon: <Home className="w-4 h-4" />, path: '/solo' },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-black text-white text-sm py-2 px-4 flex flex-col sm:flex-row items-center justify-center sm:space-x-2 relative z-[60]">
        <span className="opacity-90">Running your business alone?</span>
        <span className="flex items-center mx-2 my-1 sm:my-0">
          <img src="https://ui-avatars.com/api/?name=AI&background=00a688&color=fff&rounded=true&size=24" alt="AI" className="w-6 h-6 mr-1 shadow-md" />
          <img src="https://ui-avatars.com/api/?name=Agent&background=4F3CC9&color=fff&rounded=true&size=24" alt="Agent" className="w-6 h-6 -ml-2 border-2 border-black shadow-md" />
        </span>
        <span className="font-medium italic mr-3">Meet your AI Business Team.</span>
        <button 
          onClick={() => navigate('/solo')}
          className="bg-[#ff9900] text-black font-bold text-xs px-3 py-1 rounded hover:bg-[#e68a00] transition-colors mt-2 sm:mt-0"
        >
          Try SOLO <ArrowRight className="w-3 h-3 inline ml-1" />
        </button>
      </div>

      {/* Navigation */}
      <nav 
        className={cn(
          "fixed w-full z-50 transition-all duration-300",
          scrolled ? "bg-white shadow-md py-3 top-0" : "bg-white py-4 top-auto sm:top-[40px]"
        )}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer relative z-10" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-[#00a688] rounded-md flex items-center justify-center text-white font-bold text-xl rounded-bl-none shadow-sm">
              R
            </div>
            <span className="text-xl font-bold tracking-tight">ricoz</span>
          </div>

          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8 h-full">
            {/* Products Mega Menu Trigger */}
            <div 
              className="relative py-2"
              onMouseEnter={() => setActiveDropdown('Products')}
            >
              <button className="flex items-center text-sm font-semibold text-gray-700 hover:text-[#00a688] transition-colors">
                Products
                <ChevronDown className={cn("w-4 h-4 ml-1 opacity-50 transition-transform duration-200", activeDropdown === 'Products' ? "rotate-180" : "")} />
              </button>
            </div>
            
            {/* Solutions Simple Dropdown Trigger */}
            <div 
              className="relative py-2"
              onMouseEnter={() => setActiveDropdown('Solutions')}
            >
              <button className="flex items-center text-sm font-semibold text-gray-700 hover:text-[#00a688] transition-colors">
                Solutions
                <ChevronDown className={cn("w-4 h-4 ml-1 opacity-50 transition-transform duration-200", activeDropdown === 'Solutions' ? "rotate-180" : "")} />
              </button>
            </div>

            <button onClick={() => navigate('/integrations')} className="flex items-center text-sm font-semibold text-gray-700 hover:text-[#00a688] transition-colors">Integrations</button>
            <button onClick={() => navigate('/pricing')} className="flex items-center text-sm font-semibold text-gray-700 hover:text-[#00a688] transition-colors">Pricing</button>
            <button onClick={() => navigate('/partner-program')} className="flex items-center text-sm font-semibold text-gray-700 hover:text-[#00a688] transition-colors">Partnerships</button>
            <button className="flex items-center text-sm font-semibold text-gray-700 hover:text-[#00a688] transition-colors">
              Resources <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
            </button>
          </div>

          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6 relative z-10">
            <button onClick={() => navigate('/demo')} className="text-sm font-semibold text-gray-700 hover:text-[#00a688] transition-colors">Demo</button>
            <button onClick={() => navigate('/dashboard')} className="text-sm font-semibold text-gray-700 hover:text-[#00a688] transition-colors">Login</button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-[#00a688] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#008c73] transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-[#00a688]/20 whitespace-nowrap"
            >
              Start Free Trial
            </button>
            <div className="flex items-center text-sm font-semibold text-gray-700 cursor-pointer hover:text-black">
              <Globe className="w-4 h-4 mr-1 text-gray-400" />
              EN <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
            </div>
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        <AnimatePresence>
          {activeDropdown === 'Products' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-full left-0 w-full bg-white shadow-2xl border-t border-gray-100 overflow-hidden"
              onMouseEnter={() => setActiveDropdown('Products')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <div className="max-w-[1400px] mx-auto flex h-[500px]">
                {/* Channels Sidebar */}
                <div className="w-[250px] p-6 border-r border-gray-100 flex flex-col gap-2">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">By Channels</h4>
                  {channels.map((channel) => (
                    <button 
                      key={channel.name}
                      onMouseEnter={() => setActiveChannel(channel.name)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl transition-all w-full",
                        activeChannel === channel.name 
                          ? "bg-[#00a688]/10 text-[#00a688] font-bold" 
                          : "hover:bg-gray-50 text-gray-700 font-medium"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {channel.icon}
                        <span>{channel.name}</span>
                      </div>
                      {channel.active && <ChevronRight className="w-4 h-4" />}
                      {channel.isNew && (
                        <span className="bg-[#4F3CC9] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">New</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Features List */}
                <div className="flex-1 p-6 grid grid-cols-2 gap-x-8 gap-y-2 content-start">
                  <div className="col-span-2 flex justify-between items-center mb-4">
                     {/* Empty space to align with By Industry */}
                  </div>
                  {activeChannel === 'WhatsApp' && whatsappFeatures.map((feature) => (
                    <button 
                      key={feature.name}
                      onClick={() => navigate(feature.path)}
                      className="text-left py-2.5 font-semibold text-gray-800 hover:text-[#00a688] transition-colors flex items-center justify-between group"
                    >
                      {feature.name}
                      {feature.name === 'WhatsApp Voice Calling' && (
                        <span className="bg-[#00a688] text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-2">New</span>
                      )}
                    </button>
                  ))}
                  {activeChannel === 'Instagram' && instagramFeatures.map((feature) => (
                    <button 
                      key={feature.name}
                      onClick={() => navigate(feature.path)}
                      className="text-left py-2.5 font-semibold text-gray-800 hover:text-[#00a688] transition-colors flex items-center justify-between group"
                    >
                      {feature.name}
                    </button>
                  ))}
                  {activeChannel === 'RCS' && rcsFeatures.map((feature) => (
                    <button 
                      key={feature.name}
                      onClick={() => navigate(feature.path)}
                      className="text-left py-2.5 font-semibold text-gray-800 hover:text-[#00a688] transition-colors flex items-center justify-between group"
                    >
                      {feature.name}
                    </button>
                  ))}
                  {activeChannel === 'Voice' && voiceFeatures.map((feature) => (
                    <button 
                      key={feature.name}
                      onClick={() => navigate(feature.path)}
                      className="text-left py-2.5 font-semibold text-gray-800 hover:text-[#00a688] transition-colors flex items-center justify-between group"
                    >
                      {feature.name}
                    </button>
                  ))}
                </div>

                {/* By Industry */}
                <div className="w-[300px] p-6 border-l border-gray-100 flex flex-col gap-2 bg-gray-50/50 overflow-y-auto">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">By Industry</h4>
                  {industries.map((ind) => (
                    <button 
                      key={ind.name}
                      onClick={() => navigate(ind.path)}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-700 font-medium text-sm text-left"
                    >
                      <div className="w-8 h-8 rounded-md bg-[#00a688]/10 text-[#00a688] flex items-center justify-center shrink-0">
                        {ind.icon}
                      </div>
                      {ind.name}
                    </button>
                  ))}
                </div>

                {/* Banner CTA */}
                <div className="w-[350px] bg-[#eefaf7] p-8 flex flex-col relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-[#008c73] leading-tight mb-4">
                      See Ricoz In Action With A Personalized Demo!
                    </h3>
                    <button onClick={() => navigate('/demo')} className="text-[#008c73] font-bold border-b-2 border-[#008c73] pb-1 flex items-center hover:opacity-80 transition-opacity">
                      Book Now <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                  {/* Decorative abstract shape */}
                  <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white rounded-full opacity-50 blur-3xl" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Simple Solutions Dropdown */}
          {activeDropdown === 'Solutions' && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-full left-1/4 mt-2 w-[300px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
               <div className="p-3">
                  <button onClick={() => navigate('/mycallgenie-ai-call-receptionist')} className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition-colors text-sm font-bold text-gray-900">
                    MyCallGenie AI Call Receptionist
                  </button>
                  <button onClick={() => navigate('/whatsapp-ai-agents')} className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition-colors text-sm font-bold text-gray-900">
                    AI Business Agents
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

// Dummy ChevronRight since lucide-react might not have imported it correctly in my previous draft. Wait I'll add it to imports.
