import { useState, useEffect } from 'react';
import { Phone, PhoneCall, PhoneIncoming, PlayCircle, X, CheckCircle2, Volume2, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

type Call = {
  id: string;
  contactName: string;
  phoneNumber: string;
  duration: string;
  sentiment: string;
  type: string;
  transcript?: string;
  timestamp: string;
};

export function Voice() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isIVROpen, setIsIVROpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // IVR Form
  const [welcomeMessage, setWelcomeMessage] = useState('Thank you for calling Ricoz. How may we assist you today?');
  const [aiPrompt, setAiPrompt] = useState('You are a friendly AI receptionist for Ricoz. Answer common inquiries and transfer to support if requested.');
  const [voiceGender, setVoiceGender] = useState('female');
  const [fallbackNumber, setFallbackNumber] = useState('+1 (800) 555-0199');
  const [isSavingIVR, setIsSavingIVR] = useState(false);

  useEffect(() => {
    fetchVoiceData();
  }, []);

  const fetchVoiceData = async () => {
    try {
      setIsLoading(true);
      const [callsData, ivrData] = await Promise.all([
        api.get('/api/voice/calls'),
        api.get('/api/voice/ivr-config')
      ]);

      if (Array.isArray(callsData)) {
        setCalls(callsData);
      }
      if (ivrData) {
        setWelcomeMessage(ivrData.welcomeMessage || welcomeMessage);
        setAiPrompt(ivrData.aiPrompt || aiPrompt);
        setVoiceGender(ivrData.voiceGender || 'female');
        setFallbackNumber(ivrData.fallbackNumber || fallbackNumber);
      }
    } catch (err) {
      console.error('Failed to load voice data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIVR = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingIVR(true);
    try {
      await api.post('/api/voice/ivr-config', {
        welcomeMessage,
        aiPrompt,
        voiceGender,
        fallbackNumber
      });

      setIsIVROpen(false);
      setFeedbackMsg('IVR Receptionist settings saved successfully!');
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err) {
      alert('Failed to save IVR settings');
    } finally {
      setIsSavingIVR(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col relative">
      {feedbackMsg && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg flex items-center space-x-2 text-sm shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <Phone className="w-8 h-8 text-brand-primary mr-3" />
            AI Voice Receptionist
          </h1>
          <p className="text-secondary mt-1">Manage call logs, transcripts, and AI-generated summaries.</p>
        </div>
        <button 
          onClick={() => setIsIVROpen(true)}
          className="flex items-center space-x-2 bg-brand-primary text-white px-4 py-2 rounded-md shadow-raised hover:opacity-90 transition-opacity font-medium text-sm cursor-pointer"
        >
          <span>Configure IVR</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-secondary text-sm font-medium">Total Calls (Today)</h3>
          <div className="mt-2 text-3xl font-semibold">142</div>
        </div>
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-secondary text-sm font-medium">AI Handled</h3>
          <div className="mt-2 text-3xl font-semibold text-brand-primary">85%</div>
        </div>
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-secondary text-sm font-medium">Avg Handle Time</h3>
          <div className="mt-2 text-3xl font-semibold">2m 14s</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-surface border border-border rounded-xl shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-secondary uppercase bg-sunken border-b border-border sticky top-0">
            <tr>
              <th className="px-6 py-4 font-medium">Contact</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Duration</th>
              <th className="px-6 py-4 font-medium">AI Sentiment</th>
              <th className="px-6 py-4 font-medium">Time</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-secondary">Loading call logs...</td>
              </tr>
            ) : calls.map((call) => (
              <tr key={call.id} className="border-b border-border hover:bg-sunken/50 transition-colors">
                <td className="px-6 py-4 font-medium text-primary">
                  <div>{call.contactName}</div>
                  <div className="text-xs text-secondary">{call.phoneNumber}</div>
                </td>
                <td className="px-6 py-4 flex items-center">
                  {call.type === 'incoming' ? <PhoneIncoming className="w-4 h-4 text-success mr-2" /> : 
                   call.type === 'missed' ? <PhoneIncoming className="w-4 h-4 text-danger mr-2" /> : 
                   <PhoneCall className="w-4 h-4 text-brand-primary mr-2" />}
                  <span className="capitalize">{call.type}</span>
                </td>
                <td className="px-6 py-4">{call.duration}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    call.sentiment === 'Positive' ? 'bg-success/10 text-success' : 
                    call.sentiment === 'Negative' ? 'bg-danger/10 text-danger' : 
                    'bg-secondary/10 text-secondary'
                  }`}>
                    {call.sentiment}
                  </span>
                </td>
                <td className="px-6 py-4 text-secondary">
                  {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setSelectedCall(call)}
                    className="text-brand-primary font-medium hover:underline flex items-center justify-end w-full cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4 mr-1" /> View Transcript
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transcript Modal */}
      {selectedCall && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center">
                  <Volume2 className="w-5 h-5 text-brand-primary mr-2" />
                  Call Transcript: {selectedCall.contactName}
                </h3>
                <p className="text-xs text-secondary">{selectedCall.phoneNumber} • {selectedCall.duration}</p>
              </div>
              <button onClick={() => setSelectedCall(null)} className="text-secondary hover:text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-base border border-border rounded-lg p-4 mb-4 text-sm text-primary leading-relaxed max-h-60 overflow-y-auto">
              {selectedCall.transcript || "No audio transcript recorded for this brief session."}
            </div>
            <div className="flex items-center justify-between text-xs text-secondary border-t border-border pt-4">
              <span className="flex items-center">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1" />
                Sentiment: <strong>{selectedCall.sentiment}</strong>
              </span>
              <button 
                onClick={() => setSelectedCall(null)}
                className="px-4 py-1.5 bg-brand-primary text-white rounded text-sm hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configure IVR Modal */}
      {isIVROpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Configure AI Receptionist (IVR)</h3>
              <button onClick={() => setIsIVROpen(false)} className="text-secondary hover:text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveIVR} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Welcome Voice Greeting</label>
                <textarea 
                  rows={2}
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">AI Receptionist Persona & Instructions</label>
                <textarea 
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Voice Accent / Pitch</label>
                  <select 
                    value={voiceGender}
                    onChange={(e) => setVoiceGender(e.target.value)}
                    className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                  >
                    <option value="female">Joanna (Female, Friendly)</option>
                    <option value="male">Matthew (Male, Professional)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Fallback Transfer #</label>
                  <input 
                    type="text"
                    value={fallbackNumber}
                    onChange={(e) => setFallbackNumber(e.target.value)}
                    placeholder="+1 800 555 0199"
                    className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <button 
                  type="button" 
                  onClick={() => setIsIVROpen(false)}
                  className="px-4 py-2 border border-border rounded-md text-sm font-medium text-secondary hover:bg-sunken"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSavingIVR}
                  className="px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {isSavingIVR ? 'Saving...' : 'Save IVR Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

