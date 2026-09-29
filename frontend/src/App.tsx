import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardOverview } from './pages/Dashboard/DashboardOverview';
import { Inbox } from './pages/Inbox/Inbox';
import { Contacts } from './pages/Contacts/Contacts';
import { Campaigns } from './pages/Campaigns/Campaigns';
import { JourneyBuilder } from './pages/JourneyBuilder/JourneyBuilder';
import { Agents } from './pages/Agents/Agents';
import { Commerce } from './pages/Commerce/Commerce';
import { Voice } from './pages/Voice/Voice';
import { Analytics } from './pages/Analytics/Analytics';
import { Team } from './pages/Team/Team';
import { Integrations } from './pages/Integrations/Integrations';
import { Settings } from './pages/Settings/Settings';
import { Billing } from './pages/Settings/Billing';
import { WhatsAppAIAgent } from './pages/Automation/WhatsAppAIAgent';
import { BasicAutomations } from './pages/Automation/BasicAutomations';
import { CustomAutoReply } from './pages/Automation/CustomAutoReply';
import { Workflows } from './pages/Automation/Workflows';
import { AIIntentMatching } from './pages/Automation/AIIntentMatching';
import { InstagramQuickflows } from './pages/Automation/InstagramQuickflows';
import { VoiceAI } from './pages/Automation/VoiceAI';

import { PublicLayout } from './components/layout/PublicLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Landing } from './pages/Landing/Landing';
import { Login } from './pages/Auth/Login';
import { Signup } from './pages/Auth/Signup';
import { Onboarding } from './pages/Auth/Onboarding';
import { Pricing } from '@/pages/Public/Pricing';
import { 
  AIAgentsPage, 
  MarketingAutomationPage, 
  CustomerSupportPage, 
  MyCallGeniePage, 
  VoiceCallingPage 
} from '@/pages/Public/ProductPages';
import { SoloPage } from '@/pages/Public/Solo';
import { PublicIntegrations } from '@/pages/Public/PublicIntegrations';
import { PartnerProgram } from '@/pages/Public/PartnerProgram';
import { LiveDemo } from '@/pages/Public/LiveDemo';

const ComingSoon = ({ title }: { title: string }) => (
  <div className="flex-1 flex flex-col items-center justify-center h-full bg-[#f8fcf9]">
    <div className="w-16 h-16 bg-[#f0fbf6] border border-[#d2efe0] rounded-2xl flex items-center justify-center mb-4">
      <span className="text-3xl">🚀</span>
    </div>
    <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-500 text-sm text-center max-w-xs">This module is being built. Check back soon or contact support for early access.</p>
  </div>
);

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/integrations" element={<PublicIntegrations />} />
        <Route path="/partner-program" element={<PartnerProgram />} />
        <Route path="/demo" element={<LiveDemo />} />
        <Route path="/whatsapp-business-api-live-demo" element={<LiveDemo />} />
        <Route path="/solo" element={<SoloPage />} />
        <Route path="/whatsapp-ai-agents" element={<AIAgentsPage />} />
        <Route path="/marketing-automation" element={<MarketingAutomationPage />} />
        <Route path="/customer-support-automation" element={<CustomerSupportPage />} />
        <Route path="/mycallgenie-ai-call-receptionist" element={<MyCallGeniePage />} />
        <Route path="/whatsapp-voice-calling" element={<VoiceCallingPage />} />
        <Route path="/login" element={<Login />} />
      </Route>
      <Route path="/signup" element={<Signup />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<DashboardOverview />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="flow-builder" element={<JourneyBuilder />} />
          <Route path="agents" element={<Agents />} />
          <Route path="automation/basic" element={<BasicAutomations />} />
          <Route path="automation/custom" element={<CustomAutoReply />} />
          <Route path="automation/workflows" element={<Workflows />} />
          <Route path="automation/intent" element={<AIIntentMatching />} />
          <Route path="automation/ai-agent" element={<WhatsAppAIAgent />} />
          <Route path="automation/ig-quickflows" element={<InstagramQuickflows />} />
          <Route path="automation/voice" element={<VoiceAI />} />
          <Route path="utilities/forms" element={<ComingSoon title="WhatsApp Forms" />} />
          <Route path="utilities/list" element={<ComingSoon title="Interactive Lists" />} />
          <Route path="commerce" element={<Commerce />} />
          <Route path="voice" element={<Voice />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="team" element={<Team />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="settings" element={<Settings />} />
          <Route path="billing" element={<Billing />} />
          <Route path="*" element={<ComingSoon title="Coming Soon" />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
