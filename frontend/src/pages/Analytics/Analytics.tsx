import { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, MessageSquare, Send, RefreshCw, AlertCircle, Inbox, Bot } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import { api } from '@/lib/api';

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`shimmer rounded-lg ${className}`} />;
}

export function Analytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/analytics');
      setStats(res.data);
    } catch {
      setError('Could not load analytics. Check your connection or API keys.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => {
    const id = setInterval(() => fetchStats(true), 60000);
    return () => clearInterval(id);
  }, []);

  // Build chart data from real volumeData or show empty 7-day skeleton
  const chartData = stats?.volumeData ?? [
    { name: 'Mon', inbound: 0, outbound: 0 },
    { name: 'Tue', inbound: 0, outbound: 0 },
    { name: 'Wed', inbound: 0, outbound: 0 },
    { name: 'Thu', inbound: 0, outbound: 0 },
    { name: 'Fri', inbound: 0, outbound: 0 },
    { name: 'Sat', inbound: 0, outbound: 0 },
    { name: 'Sun', inbound: 0, outbound: 0 },
  ];

  const kpis = [
    {
      label: 'Total Messages',
      value: loading ? null : (stats?.totalMessages ?? 0).toLocaleString(),
      sub: 'All inbound + outbound',
      icon: MessageSquare,
      color: 'text-slate-900',
    },
    {
      label: 'Total Contacts',
      value: loading ? null : (stats?.totalContacts ?? 0).toLocaleString(),
      sub: 'In your workspace',
      icon: Users,
      color: 'text-emerald-600',
    },
    {
      label: 'Messages Sent by You',
      value: loading ? null : (stats?.totalSentMessages ?? 0).toLocaleString(),
      sub: 'Agent + AI bot outbound',
      icon: Send,
      color: 'text-blue-600',
    },
    {
      label: 'AI Auto-Replies',
      value: loading ? null : (stats?.botMessages ?? 0).toLocaleString(),
      sub: stats?.autoReplyRules ? `${stats.autoReplyRules} active rules` : 'No rules active yet',
      icon: Bot,
      color: 'text-purple-600',
    },
  ];

  const hasAnyData = stats && (stats.totalMessages > 0 || stats.totalContacts > 0);

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <BarChart2 className="w-7 h-7 text-emerald-600" />
            ROI & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Live workspace metrics — all data is real from your account
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setRefreshing(true); fetchStats(true); }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-5 py-3.5 rounded-2xl text-sm font-semibold mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => fetchStats()} className="ml-auto text-xs underline cursor-pointer">Retry</button>
        </div>
      )}

      {/* KPI cards — all real */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 mb-3">
              <kpi.icon className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">{kpi.label}</h3>
            </div>
            {kpi.value === null ? (
              <Skeleton className="h-9 w-20 mb-2" />
            ) : (
              <div className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</div>
            )}
            <p className="text-[11px] text-slate-400 mt-1.5 font-medium">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts — real data or empty state */}
      {!hasAnyData && !loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
          <Inbox className="w-14 h-14 text-slate-200 mb-4" />
          <h3 className="text-base font-black text-slate-700 mb-2">No data yet</h3>
          <p className="text-sm text-slate-400 max-w-sm">
            Charts will appear once you import contacts and start sending messages or broadcasts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Message Volume */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-900">Message Volume (Last 7 Days)</h3>
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" />Inbound</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" />Outbound</span>
              </div>
            </div>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dx={-4} />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12 }}
                    />
                    <Bar dataKey="inbound" name="Inbound" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="outbound" name="Outbound" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Messages Sent Trend */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-900">Outbound Trend (Last 7 Days)</h3>
              <span className="text-[10px] font-bold text-slate-400">Messages sent by you</span>
            </div>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dx={-4} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12 }} />
                    <Line
                      type="monotone" dataKey="outbound" name="Sent"
                      stroke="#10b981" strokeWidth={3}
                      dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer note */}
      <p className="text-[11px] text-slate-400 text-center mt-6 font-medium">
        All metrics are real-time from your Ricoz workspace database · Auto-refreshes every 60 seconds
      </p>
    </div>
  );
}
