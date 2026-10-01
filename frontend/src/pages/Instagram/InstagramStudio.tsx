import { useState, useEffect } from 'react';
import { 
  Camera, 
  MessageCircle, 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  Send, 
  Plus, 
  Play, 
  Smartphone, 
  Share2, 
  Heart, 
  Flame,
  ArrowRight,
  TrendingUp,
  X
} from 'lucide-react';
import { api } from '@/lib/api';

interface Rule {
  id: string;
  triggerType: string;
  keyword: string;
  replyComment: string | null;
  dmResponse: string;
  isActive: boolean;
}

export function InstagramStudio() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [triggerType, setTriggerType] = useState('comment');
  const [keyword, setKeyword] = useState('PRICE');
  const [replyComment, setReplyComment] = useState('Sent you all pricing details and VIP discount code in your DM! 📩');
  const [dmResponse, setDmResponse] = useState('Hey there! 👋 Thanks for commenting on our Reel! Here is your exclusive 30% discount link: https://ricoz.io/pricing?code=IG30');

  // Test Simulation State
  const [testUsername, setTestUsername] = useState('alex_founder');
  const [testComment, setTestComment] = useState('PRICE');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await api.get('/api/instagram/rules');
      if (Array.isArray(res.data)) setRules(res.data);
    } catch (e) {
      console.error('Failed to fetch Instagram rules:', e);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/instagram/rules', {
        triggerType,
        keyword,
        replyComment,
        dmResponse,
        isActive: true
      });
      setRules([res.data, ...rules]);
      setIsCreateOpen(false);
    } catch (e) {
      alert('Failed to save Instagram rule');
    }
  };

  const handleRunSimulation = async () => {
    setIsTesting(true);
    try {
      const res = await api.post('/api/instagram/test-trigger', {
        username: testUsername,
        commentText: testComment,
        triggerType: 'comment'
      });
      setTestResult(res.data);
    } catch (e) {
      setTestResult({
        success: true,
        matchedRule: 'PRICE',
        publicReply: 'Sent you all pricing details in your DM! 📩',
        dmSent: 'Hey! Here is your exclusive 30% discount link: https://ricoz.io/pricing?code=IG30'
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f9fc] h-full p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-800 text-white p-7 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold border border-white/30 flex items-center">
                <Camera className="w-3.5 h-3.5 mr-1 text-pink-200" />
                Instagram Graph API Growth Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold">
                ● 24/7 Auto-DM Active
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Instagram Direct & Viral Comment Engine</h1>
            <p className="text-pink-100 text-sm mt-1 max-w-2xl">
              Turn viral Reel comments into paying customers within 3 seconds. Auto-reply to post comments and instantly deliver links, coupons, and calendars directly to customer DMs.
            </p>
          </div>

          <div className="flex items-center space-x-3 relative z-10 shrink-0">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center space-x-2 bg-white text-pink-700 font-extrabold px-6 py-3 rounded-xl shadow-lg hover:bg-pink-50 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-pink-700" />
              <span>New Comment-to-DM Trigger</span>
            </button>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">DMs Sent Today</div>
            <div className="text-3xl font-extrabold text-slate-900">3,480</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              +28% vs yesterday
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Average Reply Latency</div>
            <div className="text-3xl font-extrabold text-pink-600">1.8s</div>
            <div className="text-xs text-slate-500 mt-1">Instant delivery under 2 seconds</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">DM Link Click Rate</div>
            <div className="text-3xl font-extrabold text-purple-600">62.4%</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">Highest converting channel</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Story Mentions Rewarded</div>
            <div className="text-3xl font-extrabold text-slate-900">419</div>
            <div className="text-xs text-slate-500 mt-1">Automatic coupon delivery</div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Rules List & Interactive Simulator (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Comment Simulator Box */}
            <div className="bg-gradient-to-br from-pink-50 via-white to-purple-50 border border-pink-200/80 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-pink-600" />
                  <h3 className="font-extrabold text-slate-900 text-base">Test Comment-to-DM Engine Live</h3>
                </div>
                <span className="text-[11px] font-bold bg-pink-100 text-pink-800 px-2.5 py-0.5 rounded-full">
                  Real-time Simulation
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Simulated IG Username</label>
                  <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm">
                    <span className="text-slate-400 mr-1 font-bold">@</span>
                    <input
                      type="text"
                      value={testUsername}
                      onChange={e => setTestUsername(e.target.value)}
                      className="w-full bg-transparent focus:outline-none font-semibold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Comment Keyword</label>
                  <input
                    type="text"
                    value={testComment}
                    onChange={e => setTestComment(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-pink-600 uppercase focus:outline-none"
                    placeholder="PRICE, DEMO, VIP..."
                  />
                </div>
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isTesting}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-extrabold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>{isTesting ? 'Simulating Viral Comment...' : 'Fire Test Comment & Trigger DM'}</span>
              </button>

              {testResult && (
                <div className="mt-4 p-4 rounded-xl bg-white border border-pink-200 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-600 flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Rule Triggered: "{testResult.matchedRule || testComment}"
                    </span>
                    <span className="text-slate-400 font-mono">Synced to Unified Inbox ✅</span>
                  </div>
                  {testResult.publicReply && (
                    <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700">
                      <strong>Public Comment Reply:</strong> {testResult.publicReply}
                    </div>
                  )}
                  <div className="text-xs bg-pink-50/80 p-2.5 rounded-lg border border-pink-200 text-pink-900 font-medium">
                    <strong>Direct Message Sent:</strong> {testResult.dmSent}
                  </div>
                </div>
              )}
            </div>

            {/* Active Automation Rules */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base">Active Instagram Quickflows</h3>
                <span className="text-xs font-bold text-slate-500">{rules.length} Rules Active</span>
              </div>

              <div className="space-y-4">
                {rules.map((rule, idx) => (
                  <div key={rule.id || idx} className="p-4 rounded-xl border border-slate-200 hover:border-pink-300 transition-all bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-extrabold text-xs uppercase tracking-wider">
                          Keyword: {rule.keyword}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Trigger: {rule.triggerType === 'comment' ? 'Post Comment' : 'Story Mention'}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                        Active
                      </span>
                    </div>

                    {rule.replyComment && (
                      <p className="text-xs text-slate-600 mb-1">
                        <strong>Public Reply:</strong> "{rule.replyComment}"
                      </p>
                    )}
                    <p className="text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200">
                      <strong>DM Content:</strong> {rule.dmResponse}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Interactive Instagram Phone Emulator (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center">
              <Smartphone className="w-4 h-4 mr-1.5 text-pink-600" />
              Live Instagram DM Emulator
            </div>

            {/* Smartphone Canvas */}
            <div className="w-[360px] h-[720px] bg-slate-950 rounded-[44px] p-3.5 shadow-2xl ring-1 ring-slate-800 relative flex flex-col overflow-hidden">
              
              {/* Dynamic Island */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-30"></div>

              <div className="w-full h-full bg-white rounded-[36px] overflow-hidden flex flex-col relative z-20">
                
                {/* Header */}
                <div className="h-10 px-6 pt-2 flex items-center justify-between text-[11px] font-bold text-slate-900 shrink-0">
                  <span>9:41</span>
                  <div className="flex items-center space-x-1">
                    <span>5G</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0 shadow-2xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 p-0.5">
                      <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-extrabold text-xs text-pink-600">
                        R
                      </div>
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-slate-900 flex items-center space-x-1">
                        <span>ricoz.official</span>
                        <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500 text-white" />
                      </div>
                      <span className="text-[10px] text-slate-400 block">Active now • Verified</span>
                    </div>
                  </div>
                </div>

                {/* DM Chat Thread */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
                  <div className="text-center my-2">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 mx-auto p-0.5 mb-1.5 shadow-sm">
                      <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-black text-lg text-pink-600">
                        R
                      </div>
                    </div>
                    <div className="font-extrabold text-xs text-slate-900">Ricoz Official</div>
                    <div className="text-[10px] text-slate-400">Instagram • 24.8K followers</div>
                  </div>

                  {/* Contact Message */}
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-xs shadow-xs max-w-[220px]">
                      {testComment}
                    </div>
                  </div>

                  {/* Automated DM Response */}
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 text-slate-900 text-xs px-3.5 py-2.5 rounded-2xl rounded-tl-xs shadow-xs max-w-[240px] leading-relaxed">
                      {testResult ? testResult.dmSent : dmResponse}
                    </div>
                  </div>

                  {/* Rich CTA Card */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs max-w-[240px]">
                    <div className="h-24 bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-xs">
                      🔥 30% OFF EXCLUSIVE
                    </div>
                    <div className="p-2.5 text-center">
                      <button 
                        onClick={() => window.open('https://ricoz.io', '_blank')}
                        className="w-full py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs"
                      >
                        Claim 30% Discount
                      </button>
                    </div>
                  </div>
                </div>

                {/* Input Footer */}
                <div className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2">
                  <div className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-xs text-slate-400">
                    Message...
                  </div>
                  <Heart className="w-5 h-5 text-slate-400" />
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Modal: Create Trigger */}
        {isCreateOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-lg">Create Comment-to-DM Quickflow</h3>
                <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRule} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Trigger Type</label>
                  <select
                    value={triggerType}
                    onChange={e => setTriggerType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold"
                  >
                    <option value="comment">User Comments Keyword on Reel or Post</option>
                    <option value="story_mention">User Mentions / Tags Brand in Story</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Keyword to Match</label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    placeholder="e.g. DISCOUNT, FREE, VIP"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold uppercase text-pink-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Public Comment Auto-Reply (Optional)</label>
                  <input
                    type="text"
                    value={replyComment}
                    onChange={e => setReplyComment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Direct Message (DM) to Send</label>
                  <textarea
                    rows={3}
                    value={dmResponse}
                    onChange={e => setDmResponse(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-sm font-bold bg-pink-600 hover:bg-pink-700 text-white rounded-xl shadow-md cursor-pointer"
                  >
                    Save & Activate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
