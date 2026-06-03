import { Coffee, LogIn, LogOut, TrendingUp, CalendarDays, Timer, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { monthlyHoursData } from '../../../models/mockData';

export function EmployeeDashboardView({
  employee,
  checkedIn,
  onBreak,
  sessionSecs,
  breakSecs,
  checkInTime,
  balance,
  presentDays,
  absentDays,
  totalWorkingDays,
  attendancePct,
  monthlyHours,
  totalLeaveUsed,
  totalLeave,
  filteredLeaves,
  filteredAttendance,
  formatDuration,
  handleCheckIn,
  handleCheckOut,
  handleBreak,
  // New props
  settings,
  remainingBreakSecs,
  isBreakOver,
  targetWorkSecs,
  totalExtraHours,
  totalLessHours,
}) {
  const recentAttendance = filteredAttendance.slice(0, 5);

  const statusColor = {
    present: 'text-emerald-600 bg-emerald-50',
    late: 'text-amber-600 bg-amber-50',
    absent: 'text-red-600 bg-red-50',
    'half-day': 'text-sky-600 bg-sky-50',
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Exceeded Break Time Notification */}
      {checkedIn && isBreakOver && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-700 text-sm font-medium animate-pulse">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <div>
            <div className="font-semibold text-rose-800">Break time over! Go back to work.</div>
            <div className="text-xs text-rose-600 mt-0.5">Your standard daily work target hours are automatically adjusted to compensate for extra break duration.</div>
          </div>
        </div>
      )}

      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>Good morning, {employee.name.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 text-sm mt-0.5">{employee.position} · {employee.department}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-xl text-sm text-slate-500">
          <span>Today's Target Break: {settings?.breakTime || '1 hour'}</span>
        </div>
      </div>

      {/* Attendance action widget */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-slate-500 text-sm mb-1">Today's Session</p>
            <div className="text-4xl text-slate-800 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
              {checkedIn ? formatDuration(sessionSecs) : '—:——:——'}
            </div>
            {checkedIn && (
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>Check-in: <strong className="text-slate-600">{checkInTime}</strong></span>
                {onBreak && <span className="flex items-center gap-1 text-amber-500"><Coffee className="w-3 h-3" />Break: {formatDuration(breakSecs)}</span>}
              </div>
            )}
            {!checkedIn && <p className="text-slate-400 text-xs">You haven't checked in yet today</p>}
          </div>

          <div className="flex items-center gap-3">
            {checkedIn && (
              <button
                onClick={handleBreak}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                  onBreak ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' : 'bg-slate-50 text-slate-600 border-border hover:bg-slate-100'
                }`}
              >
                <Coffee className="w-4 h-4" />
                {onBreak ? 'End Break' : 'Start Break'}
              </button>
            )}
            <button
              onClick={checkedIn ? handleCheckOut : handleCheckIn}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                checkedIn ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {checkedIn ? <><LogOut className="w-4 h-4" />Check Out</> : <><LogIn className="w-4 h-4" />Check In</>}
            </button>
          </div>
        </div>

        {checkedIn && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-emerald-600 text-sm" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                {formatDuration(sessionSecs)}
              </div>
              <div className="text-slate-400 text-xs mt-0.5">Net Work Time</div>
            </div>
            <div className="text-center">
              <div className="text-amber-500 text-sm" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                {formatDuration(breakSecs)}
              </div>
              <div className="text-slate-400 text-xs mt-0.5">Total Break Time</div>
            </div>
            <div className="text-center">
              <div className={`${isBreakOver ? 'text-rose-600 font-bold' : 'text-slate-600'} text-sm`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {isBreakOver ? 'Over Limit!' : formatDuration(remainingBreakSecs)}
              </div>
              <div className="text-slate-400 text-xs mt-0.5">Remaining Break</div>
            </div>
            <div className="text-center">
              <div className="text-indigo-600 text-sm" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                {formatDuration(Math.max(0, targetWorkSecs - sessionSecs))}
              </div>
              <div className="text-slate-400 text-xs mt-0.5">Remaining Work</div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Attendance Rate', value: `${attendancePct}%`, sub: `${presentDays}/${totalWorkingDays} days`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Monthly Hours', value: `${monthlyHours.toFixed(1)}h`, sub: 'This month', icon: Timer, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Extra Hours', value: `${totalExtraHours.toFixed(1)}h`, sub: 'Total excess hours', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Less Hours', value: `${totalLessHours.toFixed(1)}h`, sub: 'Total deficit hours', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-border p-5">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="text-slate-800 mb-0.5" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.375rem' }}>{s.value}</div>
              <div className="text-slate-800 text-sm font-medium">{s.label}</div>
              <div className="text-slate-400 text-xs mt-0.5">{s.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly hours chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-4">Weekly Hours — May 2026</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlyHoursData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4338ca" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4338ca" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="hours" stroke="#4338ca" strokeWidth={2} fill="url(#hoursGrad)" dot={{ fill: '#4338ca', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Leave balance */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-4">Leave Balance</h3>
          <div className="space-y-4">
            {[
              { label: 'Annual', data: balance.annual, color: 'bg-indigo-500' },
              { label: 'Casual', data: balance.casual, color: 'bg-sky-500' },
              { label: 'Personal', data: balance.personal, color: 'bg-emerald-500' },
            ].map(({ label, data, color }) => {
              if (!data) return null;
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-600">{label}</span>
                    <span className="text-slate-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{data.total - data.used}/{data.total} remaining</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${((data.total - data.used) / data.total) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent attendance */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="text-slate-800 font-semibold mb-4">Recent Attendance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Date', 'Check In', 'Check Out', 'Worked Hours', 'Extra Hours', 'Less Hours', 'Status'].map(h => (
                  <th key={h} className="text-left text-slate-400 font-medium pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentAttendance.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 pr-4 text-slate-700">{new Date(rec.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}</td>
                  <td className="py-3 pr-4 text-slate-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{rec.checkIn || '—'}</td>
                  <td className="py-3 pr-4 text-slate-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{rec.checkOut || <span className="text-emerald-500 text-xs">Active</span>}</td>
                  <td className="py-3 pr-4 text-slate-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{rec.totalHours > 0 ? `${rec.totalHours.toFixed(2)}h` : '—'}</td>
                  <td className="py-3 pr-4 text-emerald-600 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {rec.extraHours > 0 ? `+${rec.extraHours.toFixed(2)}h` : '—'}
                  </td>
                  <td className="py-3 pr-4 text-red-500 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {rec.lessHours > 0 ? `-${rec.lessHours.toFixed(2)}h` : '—'}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor[rec.status]}`}>{rec.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent leave requests */}
      {filteredLeaves.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-4">Recent Leave Requests</h3>
          <div className="space-y-3">
            {filteredLeaves.slice(0, 3).map((leave) => (
              <div key={leave.id} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-slate-50 border border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-700 font-medium capitalize">{leave.type} Leave</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      leave.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                      leave.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                    }`}>{leave.status}</span>
                  </div>
                  <div className="text-slate-400 text-xs mt-1">{leave.startDate} → {leave.endDate} · {leave.days} day{leave.days !== 1 ? 's' : ''}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{leave.reason}</div>
                </div>
                {leave.status === 'approved' ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /> :
                 leave.status === 'rejected' ? <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" /> : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
