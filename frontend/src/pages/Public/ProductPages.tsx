import { Zap, Shield, TrendingUp, Users, MessageSquare, Phone } from 'lucide-react';
import { ProductMarketingPage } from '../../components/landing/ProductMarketingPage';

// 2. WhatsApp AI Agents
export function AIAgentsPage() {
  return (
    <ProductMarketingPage
      title={<>Build <span className="text-[#00a688]">WhatsApp AI Agents</span> without code</>}
      subtitle="Deploy conversational AI agents on WhatsApp to automate support, sales, and marketing."
      heroImage="https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=1200&auto=format&fit=crop"
      benefits={[
        { title: "No Code Builder", desc: "Drag and drop conversational flows visually.", icon: <Zap className="w-6 h-6" /> },
        { title: "Generative AI", desc: "Powered by advanced LLMs for natural conversations.", icon: <MessageSquare className="w-6 h-6" /> },
        { title: "Multi-language", desc: "Speak to your customers in 50+ languages.", icon: <Users className="w-6 h-6" /> }
      ]}
      features={[
        { title: "Visual Flow Builder", desc: "Design complex conversational journeys with a simple drag-and-drop interface.", image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop" },
      ]}
    />
  );
}

// 3. Marketing Automation
export function MarketingAutomationPage() {
  return (
    <ProductMarketingPage
      title={<>Drive 3x more sales with <span className="text-[#00a688]">Marketing Automation</span></>}
      subtitle="Send personalized bulk broadcasts, abandoned cart reminders, and promotional offers on WhatsApp."
      heroImage="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop"
      benefits={[
        { title: "High Open Rates", desc: "Achieve 98% open rates on your marketing campaigns.", icon: <TrendingUp className="w-6 h-6" /> },
        { title: "Personalization", desc: "Dynamically insert names and variables.", icon: <Users className="w-6 h-6" /> },
        { title: "Click-to-WhatsApp Ads", desc: "Drive traffic directly from Facebook to WhatsApp.", icon: <Zap className="w-6 h-6" /> }
      ]}
      features={[
        { title: "Broadcast Campaigns", desc: "Reach thousands of opted-in customers with a single click. Measure read rates in real-time.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop" },
      ]}
    />
  );
}

// 4. Customer Support Automation
export function CustomerSupportPage() {
  return (
    <ProductMarketingPage
      title={<>Omnichannel <span className="text-brand-primary">Shared Inbox</span></>}
      subtitle="Manage WhatsApp, Instagram, and Messenger from a single, collaborative team inbox."
      heroImage="https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1200&auto=format&fit=crop"
      benefits={[
        { title: "Unified Inbox", desc: "All channels in one place.", icon: <MessageSquare className="w-6 h-6" /> },
        { title: "Team Collaboration", desc: "Assign chats, leave internal notes, and collaborate.", icon: <Users className="w-6 h-6" /> },
        { title: "SLA Management", desc: "Ensure fast response times with automated SLA alerts.", icon: <Shield className="w-6 h-6" /> }
      ]}
      features={[
        { title: "Smart Routing", desc: "Automatically route incoming chats to the right agent based on skill or workload.", image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop" },
      ]}
    />
  );
}

// 5. MyCallGenie AI Call Receptionist
export function MyCallGeniePage() {
  return (
    <ProductMarketingPage
      title={<>Never miss a call with <span className="text-[#00a688]">MyCallGenie</span></>}
      subtitle="An AI voice receptionist that answers missed calls and follows up via WhatsApp automatically."
      heroImage="https://images.unsplash.com/photo-1516387938699-a93567ec168e?q=80&w=1200&auto=format&fit=crop"
      benefits={[
        { title: "24/7 Voice Receptionist", desc: "Answers calls with human-like voice AI.", icon: <Phone className="w-6 h-6" /> },
        { title: "WhatsApp Follow-up", desc: "Sends an instant WhatsApp summary to the caller.", icon: <MessageSquare className="w-6 h-6" /> },
        { title: "Lead Capture", desc: "Transcribes calls and extracts lead intent.", icon: <TrendingUp className="w-6 h-6" /> }
      ]}
      features={[
        { title: "Turn missed calls into sales", desc: "When a customer calls and you're busy, MyCallGenie picks up, answers FAQs, and books appointments.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop" },
      ]}
    />
  );
}

// 6. WhatsApp Voice Calling
export function VoiceCallingPage() {
  return (
    <ProductMarketingPage
      title={<>Introducing <span className="text-[#00a688]">WhatsApp Voice Calling</span></>}
      subtitle="Call your customers directly over WhatsApp VoIP. Crystal clear audio, globally."
      heroImage="https://images.unsplash.com/photo-1581404106518-e760c41fcbf4?q=80&w=1200&auto=format&fit=crop"
      benefits={[
        { title: "Zero Telecom Fees", desc: "Bypass international calling rates.", icon: <TrendingUp className="w-6 h-6" /> },
        { title: "High Trust", desc: "Customers see your verified WhatsApp business profile when you call.", icon: <Shield className="w-6 h-6" /> },
        { title: "Call Recording", desc: "Automatically record and transcribe calls for quality assurance.", icon: <Phone className="w-6 h-6" /> }
      ]}
      features={[
        { title: "The future of sales calls", desc: "Connect with customers globally without worrying about carrier restrictions or spam labels.", image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop" },
      ]}
    />
  );
}
