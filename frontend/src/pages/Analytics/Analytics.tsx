import { BarChart2, TrendingUp, Users, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const data = [
  { name: 'Mon', inbound: 400, outbound: 240 },
  { name: 'Tue', inbound: 300, outbound: 139 },
  { name: 'Wed', inbound: 200, outbound: 980 },
  { name: 'Thu', inbound: 278, outbound: 390 },
  { name: 'Fri', inbound: 189, outbound: 480 },
  { name: 'Sat', inbound: 239, outbound: 380 },
  { name: 'Sun', inbound: 349, outbound: 430 },
];

export function Analytics() {
  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <BarChart2 className="w-8 h-8 text-brand-primary mr-3" />
            Analytics
          </h1>
          <p className="text-secondary mt-1">Deep dive into your workspace's performance metrics.</p>
        </div>
        <button className="bg-surface border border-border px-4 py-2 rounded-md hover:bg-sunken text-sm font-medium text-secondary transition-colors">
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2 text-secondary mb-2">
            <MessageSquareIcon className="w-4 h-4" />
            <h3 className="text-sm font-medium">Total Volume</h3>
          </div>
          <div className="text-3xl font-semibold">124.5k</div>
        </div>
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2 text-secondary mb-2">
            <Users className="w-4 h-4" />
            <h3 className="text-sm font-medium">Active Contacts</h3>
          </div>
          <div className="text-3xl font-semibold text-brand-primary">8,204</div>
        </div>
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2 text-secondary mb-2">
            <Activity className="w-4 h-4" />
            <h3 className="text-sm font-medium">Avg Resolution Time</h3>
          </div>
          <div className="text-3xl font-semibold">14m</div>
        </div>
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2 text-secondary mb-2">
            <TrendingUp className="w-4 h-4" />
            <h3 className="text-sm font-medium">CSAT Score</h3>
          </div>
          <div className="text-3xl font-semibold text-success">4.8/5</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-6">Message Volume (7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgb(var(--text-secondary))'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgb(var(--text-secondary))'}} dx={-10} />
                <Tooltip cursor={{fill: 'rgb(var(--bg-sunken))'}} contentStyle={{backgroundColor: 'rgb(var(--bg-surface))', borderColor: 'rgb(var(--border))', borderRadius: '8px'}} />
                <Bar dataKey="inbound" fill="rgb(var(--brand-primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outbound" fill="rgb(var(--brand-accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-6">Agent Performance Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgb(var(--text-secondary))'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgb(var(--text-secondary))'}} dx={-10} />
                <Tooltip contentStyle={{backgroundColor: 'rgb(var(--bg-surface))', borderColor: 'rgb(var(--border))', borderRadius: '8px'}} />
                <Line type="monotone" dataKey="inbound" stroke="rgb(var(--success))" strokeWidth={3} dot={{r: 4, fill: 'rgb(var(--success))'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageSquareIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}
