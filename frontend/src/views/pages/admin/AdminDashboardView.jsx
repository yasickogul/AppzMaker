import { Users, Building2, ShieldCheck, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const sampleChart = [
  { month: 'Jan', requests: 4500, logins: 3200 },
  { month: 'Feb', requests: 5000, logins: 3400 },
  { month: 'Mar', requests: 5500, logins: 3900 },
  { month: 'Apr', requests: 6200, logins: 4100 },
  { month: 'May', requests: 6000, logins: 4000 },
];

export function AdminDashboardView({
  employees,
  hrUsers,
  companies,
}) {
  const activeCount = employees.filter(e => e.status === 'active').length + hrUsers.filter(h => h.status === 'active').length;

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div>
        <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>Super Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Control panel for global system aggregates</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Registered Companies', value: companies.length, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: `${companies.filter(c => c.status === 'active').length} active nodes` },
          { label: 'System Active Accounts', value: activeCount, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Employees + HR active' },
          { label: 'HR Managers', value: hrUsers.length, icon: ShieldCheck, color: 'text-sky-600', bg: 'bg-sky-50', sub: 'Department managers' },
          { label: 'System Traffic', value: '12.4k', icon: Activity, color: 'text-violet-600', bg: 'bg-violet-50', sub: 'Requests last 24h' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-border p-5">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="text-slate-800 mb-0.5" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.5rem' }}>{s.value}</div>
              <div className="text-slate-800 text-sm font-medium">{s.label}</div>
              <div className="text-slate-400 text-xs mt-0.5">{s.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global systems telemetry */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-4">System Traffic Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sampleChart} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="requests" name="API Requests" fill="#4338ca" radius={[4,4,0,0]} />
              <Bar dataKey="logins" name="User Logins" fill="#0ea5e9" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* System audit log feed */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-4">Live System Health</h3>
          <div className="space-y-3.5">
            {[
              { status: 'healthy', label: 'DB connection cluster', desc: 'Latency 4ms, operational' },
              { status: 'healthy', label: 'Redis active sessions', desc: '143 connected, clear logs' },
              { status: 'warning', label: 'Backup status', desc: 'Backup completed 14 hrs ago' },
              { status: 'healthy', label: 'Express gateway', desc: 'Port 5000 active, OK' },
            ].map(log => (
              <div key={log.label} className="flex gap-2.5 items-start">
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${log.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <div>
                  <div className="text-slate-700 text-xs font-semibold">{log.label}</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">{log.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
