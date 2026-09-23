import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';

export function Billing() {
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isManaging, setIsManaging] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Check URL parameters for successful checkout or portal return
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setSuccessMsg('Payment successful! Your subscription is now active.');
      // Remove query params
      window.history.replaceState({}, '', '/billing');
    } else if (params.get('canceled') === 'true') {
      setError('Checkout was canceled.');
      window.history.replaceState({}, '', '/billing');
    }

    const fetchSubscription = async () => {
      try {
        // Ideally we would fetch the user's workspace subscription info here.
        // For now we'll fetch from a generic mock or existing user route if we had one.
        // Let's assume we can get it from /api/auth/me which we can add fields to later,
        // or we just mock it for the UI demo based on the success message.
        
        // Mocking the fetch for now until we have a dedicated GET /api/billing/info
        setTimeout(() => {
          setSubscriptionInfo({
            status: params.get('success') === 'true' ? 'active' : 'trialing',
            planTier: params.get('mockPlan') || 'Free Trial',
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          });
          setIsLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error('Failed to load billing info', err);
        setError('Failed to load billing information.');
        setIsLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  const handleManageBilling = async () => {
    setIsManaging(true);
    try {
      const response = await api.post('/api/billing/create-portal-session');
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error('Portal error:', err);
      // Fallback for mock mode
      alert('Mock mode: Stripe Customer Portal opened!');
    } finally {
      setIsManaging(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 h-full">
        <div className="animate-spin w-8 h-8 border-4 border-[#00a688] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const isTrialing = subscriptionInfo?.status === 'trialing';

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 h-full flex flex-col">
      <div className="px-8 py-6 border-b border-gray-200 bg-white sticky top-0 z-20 shadow-sm flex items-center space-x-3">
        <div className="p-2 bg-[#00a688]/10 rounded-lg">
          <CreditCard className="w-5 h-5 text-[#00a688]" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Billing & Subscription</h2>
      </div>

      <div className="p-8 max-w-[800px] w-full mx-auto space-y-6">
        
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Current Plan</h3>
                <p className="text-gray-500 text-sm">Manage your subscription and billing details.</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isTrialing ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                {subscriptionInfo?.status}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 flex justify-between items-center mb-6">
              <div>
                <div className="text-2xl font-black text-gray-900 mb-1">{subscriptionInfo?.planTier}</div>
                {isTrialing ? (
                  <p className="text-sm font-medium text-gray-600">
                    Trial ends on {new Date(subscriptionInfo?.trialEndsAt).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-gray-600">
                    Next billing date: {new Date(subscriptionInfo?.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div>
                {isTrialing && (
                  <button onClick={() => window.location.href = '/pricing'} className="bg-[#ff9900] hover:bg-[#e68a00] text-white px-5 py-2 rounded-lg font-bold text-sm shadow-sm transition-colors">
                    Upgrade Plan
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-[#00a688]" />
                <span>Unlimited WhatsApp Agents</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-[#00a688]" />
                <span>Google Gemini Integration</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-[#00a688]" />
                <span>Full CRM Access</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-between items-center">
            <div className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Payments secured by Stripe</span>
            </div>
            <button 
              onClick={handleManageBilling}
              disabled={isManaging || isTrialing}
              className="flex items-center space-x-2 text-[#00a688] font-bold text-sm hover:text-[#008c73] transition-colors disabled:opacity-50"
            >
              <span>{isManaging ? 'Loading...' : 'Manage Billing in Stripe Portal'}</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
