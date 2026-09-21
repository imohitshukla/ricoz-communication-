import { Phone, PhoneCall, PhoneIncoming, PlayCircle } from 'lucide-react';

const MOCK_CALLS = [
  { id: 1, name: 'Alice Cooper', duration: '3m 45s', sentiment: 'Positive', time: '10:42 AM', type: 'incoming' },
  { id: 2, name: 'Unknown Number', duration: '0m 45s', sentiment: 'Neutral', time: 'Yesterday', type: 'missed' },
  { id: 3, name: 'Charlie Davis', duration: '12m 10s', sentiment: 'Negative', time: 'Yesterday', type: 'outgoing' },
];

export function Voice() {
  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <Phone className="w-8 h-8 text-brand-primary mr-3" />
            AI Voice Receptionist
          </h1>
          <p className="text-secondary mt-1">Manage call logs, transcripts, and AI-generated summaries.</p>
        </div>
        <button className="flex items-center space-x-2 bg-brand-primary text-white px-4 py-2 rounded-md shadow-raised hover:opacity-90 transition-opacity font-medium text-sm">
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
            {MOCK_CALLS.map((call) => (
              <tr key={call.id} className="border-b border-border hover:bg-sunken/50 transition-colors">
                <td className="px-6 py-4 font-medium text-primary">{call.name}</td>
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
                <td className="px-6 py-4 text-secondary">{call.time}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-brand-primary font-medium hover:underline flex items-center justify-end w-full">
                    <PlayCircle className="w-4 h-4 mr-1" /> Listen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
