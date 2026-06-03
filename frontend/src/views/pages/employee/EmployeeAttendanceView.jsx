import { LogIn, LogOut, Coffee, Clock, Calendar } from 'lucide-react';

const statusStyles = {
  present: { label: 'Present', cls: 'bg-emerald-50 text-emerald-700' },
  late: { label: 'Late', cls: 'bg-amber-50 text-amber-700' },
  absent: { label: 'Absent', cls: 'bg-red-50 text-red-700' },
  'half-day': { label: 'Half Day', cls: 'bg-sky-50 text-sky-700' },
};

export function EmployeeAttendanceView({
  checkedIn,
  onBreak,
  sessionSecs,
  breakSecs,
  checkInTime,
  breaks,
  selectedMonth,
  setSelectedMonth,
  filteredAttendance,
  formatDuration,
  handleCheckIn,
  handleCheckOut,
  handleBreak,
  // New props
  settings,
  targetWorkSecs,
  totalExtraHours,
  totalLessHours,
  remainingBreakSecs,
  isBreakOver,
}) {
  const netWork = sessionSecs;
  const currentTarget = targetWorkSecs || 28800;
  const progress = Math.min(100, (netWork / currentTarget) * 100);

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div>
        <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>Attendance</h1>
        <p className="text-slate-500 text-sm mt-0.5">Track your daily check-in, check-out, and breaks</p>
      </div>

      {/* Main clock */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-center">
          <p className="text-slate-400 text-sm mb-2">Current Session Timer</p>
          <div className="text-white mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '3.5rem', letterSpacing: '0.05em' }}>
            {formatDuration(sessionSecs)}
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
            {checkedIn ? (
              <>
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Session active {checkInTime ? `since ${checkInTime}` : ''}
              </>
            ) : (
              <span>Not checked in</span>
            )}
          </div>

          {/* Progress ring area */}
          {checkedIn && (
            <div className="mt-6 max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>0h</span>
                <span className="text-slate-300">{Math.round(progress)}% of {Math.round(currentTarget / 3600)}h target</span>
                <span>{Math.round(currentTarget / 3600)}h</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%`, background: progress >= 100 ? '#10b981' : '#4338ca' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {!checkedIn ? (
              <button
                onClick={handleCheckIn}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-medium transition-colors"
              >
                <LogIn className="w-5 h-5" />
                Mark Check-In
              </button>
            ) : (
              <>
                <button
                  onClick={handleBreak}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium transition-colors border ${
                    onBreak
                      ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      : 'bg-slate-50 text-slate-700 border-border hover:bg-slate-100'
                  }`}
                >
                  <Coffee className="w-5 h-5" />
                  {onBreak ? 'End Break' : 'Start Break'}
                </button>
                <button
                  onClick={handleCheckOut}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-xl font-medium transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Mark Check-Out
                </button>
              </>
            )}
          </div>

          {checkedIn && (
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
              {[
                { label: 'Work Time', value: formatDuration(netWork), color: 'text-emerald-600' },
                { label: 'Break Time', value: isBreakOver ? 'Over Limit!' : formatDuration(remainingBreakSecs), color: 'text-amber-500' },
                { label: 'Remaining', value: formatDuration(Math.max(0, currentTarget - netWork)), color: 'text-indigo-600' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className={`${s.color} font-semibold`} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1rem' }}>{s.value}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Breaks today */}
      {breaks.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2"><Coffee className="w-4 h-4 text-amber-500" />Today's Breaks</h3>
          <div className="space-y-2">
            {breaks.map((b, i) => (
              <div key={i} className="flex items-center justify-between text-sm px-3 py-2 bg-amber-50 rounded-lg">
                <span className="text-slate-600">Break {i + 1}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-slate-500">
                  {b.start} → {b.end || <span className="text-amber-600">ongoing</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance history */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="text-slate-800 font-semibold flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-500" />Attendance History</h3>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="2026-06">June 2026</option>
            <option value="2026-05">May 2026</option>
            <option value="2026-04">April 2026</option>
            <option value="2026-03">March 2026</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Date', 'Check In', 'Check Out', 'Break', 'Net Hours', 'Extra Hours', 'Less Hours', 'Status'].map(h => (
                  <th key={h} className="text-left text-slate-400 font-medium pb-3 pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAttendance.map((rec) => {
                const st = statusStyles[rec.status] || { label: rec.status, cls: 'bg-slate-50 text-slate-700' };
                return (
                  <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pr-4 text-slate-700 whitespace-nowrap">{new Date(rec.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                    <td className="py-3 pr-4 text-slate-600 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{rec.checkIn || '—'}</td>
                    <td className="py-3 pr-4 text-slate-600 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{rec.checkOut || (rec.checkIn ? <span className="text-emerald-500 text-xs">Active</span> : '—')}</td>
                    <td className="py-3 pr-4 text-slate-500 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{rec.breakMinutes > 0 ? `${rec.breakMinutes}m` : '—'}</td>
                    <td className="py-3 pr-4 text-slate-700 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{rec.totalHours > 0 ? `${rec.totalHours.toFixed(2)}h` : '—'}</td>
                    <td className="py-3 pr-4 whitespace-nowrap text-emerald-600 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {rec.extraHours > 0 ? `+${rec.extraHours.toFixed(2)}h` : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap text-red-500 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {rec.lessHours > 0 ? `-${rec.lessHours.toFixed(2)}h` : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                    </td>
                  </tr>
                );
              })}
              {filteredAttendance.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-slate-400 text-sm">No records for this month</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary row */}
        {filteredAttendance.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: 'Present Days', value: filteredAttendance.filter(r => r.status === 'present' || r.status === 'late').length },
              { label: 'Absent Days', value: filteredAttendance.filter(r => r.status === 'absent').length },
              { label: 'Total Hours', value: `${filteredAttendance.reduce((s, r) => s + r.totalHours, 0).toFixed(1)}h` },
              { label: 'Extra Hours', value: `${filteredAttendance.reduce((s, r) => s + (r.extraHours || 0), 0).toFixed(1)}h` },
              { label: 'Less Hours', value: `${filteredAttendance.reduce((s, r) => s + (r.lessHours || 0), 0).toFixed(1)}h` },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-slate-800 font-semibold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.value}</div>
                <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
