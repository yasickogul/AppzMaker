import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Download, BarChart3, Users, Calendar } from 'lucide-react';
import { weeklyAttendanceData } from '../../../models/mockData';

const leaveTypeData = [
  { name: 'Annual', value: 12, color: '#4338ca' },
  { name: 'Casual', value: 8, color: '#0ea5e9' },
  { name: 'Personal', value: 18, color: '#ef4444' },
];

const monthlyTrend = [
  { month: 'Jan', attendance: 91, leaves: 18 },
  { month: 'Feb', attendance: 88, leaves: 22 },
  { month: 'Mar', attendance: 93, leaves: 14 },
  { month: 'Apr', attendance: 89, leaves: 19 },
  { month: 'May', attendance: 85, leaves: 26 },
];

export function HRReportsView({
  reportType,
  setReportType,
  employeesList,
  leavesList,
  getEmployeeStats,
}) {
  // Attendance calculations for dashboard
  const todayDate = '2026-05-31';
  const todayAttendance = employeesList.map(e => {
    return {
      employeeId: e.id,
      date: todayDate,
      status: e.id === 'emp001' ? 'present' : e.id === 'emp002' ? 'present' : e.id === 'emp003' ? 'late' : e.id === 'emp005' ? 'present' : e.id === 'emp006' ? 'present' : e.id === 'emp007' ? 'late' : 'absent',
      checkIn: e.id === 'emp001' ? '09:02' : e.id === 'emp002' ? '08:45' : e.id === 'emp003' ? '09:15' : e.id === 'emp005' ? '08:58' : e.id === 'emp006' ? '09:00' : e.id === 'emp007' ? '09:20' : null,
      checkOut: null,
      totalHours: e.id === 'emp001' ? 8.1 : e.id === 'emp002' ? 7.8 : e.id === 'emp003' ? 8.0 : e.id === 'emp005' ? 7.9 : e.id === 'emp006' ? 8.2 : e.id === 'emp007' ? 8.0 : 0
    };
  });

  const totalHours = todayAttendance.reduce((s, r) => s + r.totalHours, 0);

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>Reports</h1>
          <p className="text-slate-500 text-sm mt-0.5">Generate and export workforce analytics</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />PDF
          </button>
          <button type="button" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />Export Excel
          </button>
        </div>
      </div>

      {/* Report type selector */}
      <div className="bg-white rounded-2xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {[
              { id: 'attendance', label: 'Attendance', icon: BarChart3 },
              { id: 'leave', label: 'Leave', icon: Calendar },
              { id: 'summary', label: 'Summary', icon: Users },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setReportType(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${reportType === id ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Employees', value: employeesList.length, sub: `${employeesList.filter(e => e.status === 'active').length} active` },
          { label: 'Avg Attendance', value: '88%', sub: 'This period' },
          { label: 'Total Hours', value: `${totalHours.toFixed(0)}h`, sub: 'All employees' },
          { label: 'Leave Days Used', value: leavesList.filter(l => l.status === 'approved').reduce((s, l) => s + l.days, 0), sub: 'Approved leaves' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-5">
            <div className="text-slate-800 mb-0.5" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.5rem' }}>{s.value}</div>
            <div className="text-slate-700 text-sm font-medium">{s.label}</div>
            <div className="text-slate-400 text-xs mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {reportType === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="text-slate-800 font-semibold mb-4">Weekly Attendance Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyAttendanceData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="present" name="Present" fill="#10b981" radius={[3,3,0,0]} />
                <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[3,3,0,0]} />
                <Bar dataKey="late" name="Late" fill="#f59e0b" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="text-slate-800 font-semibold mb-4">Monthly Attendance Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyTrend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="attendance" name="Attendance %" stroke="#4338ca" strokeWidth={2} dot={{ fill: '#4338ca', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Attendance detail table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
            <h3 className="text-slate-800 font-semibold mb-4">Employee Attendance Report</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Employee', 'Department', 'Present', 'Absent', 'Late', 'Total Hours', 'Att. Rate'].map(h => (
                      <th key={h} className="text-left text-slate-400 font-medium pb-3 pr-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {employeesList.map(emp => {
                    const stats = getEmployeeStats(emp.id);
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/50">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">{emp.avatar}</div>
                            <span className="text-slate-700">{emp.name}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-slate-500">{emp.department}</td>
                        <td className="py-3 pr-4 text-emerald-600 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{stats.present}</td>
                        <td className="py-3 pr-4 text-red-500 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{stats.total - stats.present}</td>
                        <td className="py-3 pr-4 text-amber-600 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{Math.floor(stats.present * 0.1)}</td>
                        <td className="py-3 pr-4 text-slate-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{stats.hours.toFixed(1)}h</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full max-w-16">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${stats.pct}%` }} />
                            </div>
                            <span className="text-slate-600 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{stats.pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportType === 'leave' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="text-slate-800 font-semibold mb-4">Leave by Type</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={leaveTypeData} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {leaveTypeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {leaveTypeData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="text-slate-800 font-semibold mb-4">Leave Requests Overview</h3>
            <div className="space-y-4">
              {[
                { label: 'Total Requests', value: leavesList.length, color: 'text-slate-700' },
                { label: 'Approved', value: leavesList.filter(l => l.status === 'approved').length, color: 'text-emerald-600' },
                { label: 'Rejected', value: leavesList.filter(l => l.status === 'rejected').length, color: 'text-red-500' },
                { label: 'Pending', value: leavesList.filter(l => l.status === 'pending').length, color: 'text-amber-600' },
                { label: 'Total Days Off', value: leavesList.filter(l => l.status === 'approved').reduce((s, l) => s + l.days, 0), color: 'text-indigo-600' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-slate-500 text-sm">{s.label}</span>
                  <span className={`font-semibold ${s.color}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
            <h3 className="text-slate-800 font-semibold mb-4">Leave Request Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Employee', 'Dept', 'Type', 'From', 'To', 'Days', 'Status', 'Applied'].map(h => (
                      <th key={h} className="text-left text-slate-400 font-medium pb-3 pr-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leavesList.map(l => {
                    const sc = { approved: 'bg-emerald-50 text-emerald-700', rejected: 'bg-red-50 text-red-600', pending: 'bg-amber-50 text-amber-600' };
                    return (
                      <tr key={l.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 pr-3 text-slate-700 font-medium whitespace-nowrap">{l.employeeName}</td>
                        <td className="py-2.5 pr-3 text-slate-500 whitespace-nowrap">{l.department}</td>
                        <td className="py-2.5 pr-3 capitalize text-slate-500 whitespace-nowrap">{l.type}</td>
                        <td className="py-2.5 pr-3 text-slate-500 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{l.startDate}</td>
                        <td className="py-2.5 pr-3 text-slate-500 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{l.endDate}</td>
                        <td className="py-2.5 pr-3 text-slate-600 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{l.days}</td>
                        <td className="py-2.5 pr-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc[l.status] || 'bg-slate-50'}`}>{l.status}</span>
                        </td>
                        <td className="py-2.5 text-slate-400 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{l.appliedOn}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportType === 'summary' && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-4">Employee Work Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Employee', 'Company', 'Department', 'Position', 'Join Date', 'Status'].map(h => (
                    <th key={h} className="text-left text-slate-400 font-medium pb-3 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employeesList.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/50">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold">{emp.avatar}</div>
                        <span className="text-slate-700 font-medium whitespace-nowrap">{emp.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">{emp.company}</td>
                    <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">{emp.department}</td>
                    <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">{emp.position}</td>
                    <td className="py-3 pr-4 text-slate-400 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{emp.joinDate}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${emp.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{emp.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
