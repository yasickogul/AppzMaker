import { Mail, Phone, MapPin, Calendar, Briefcase, Building2, DollarSign, TrendingUp } from 'lucide-react';

export function EmployeeProfileView({
  employee,
  mySalary,
  balance,
  attendancePct,
  presentDays,
  absentDays,
  myAttendance,
  yearsTenure,
  monthsTenure,
}) {
  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div>
        <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>My Profile</h1>
        <p className="text-slate-500 text-sm mt-0.5">Your personal information and employment details</p>
      </div>

      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-indigo-600 to-indigo-800" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10 mb-5">
            <div className="w-20 h-20 bg-indigo-500 rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-lg flex-shrink-0" style={{ fontWeight: 700, fontSize: '1.5rem' }}>
              {employee.avatar}
            </div>
            <div className="pb-1">
              <h2 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.25rem' }}>{employee.name}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-500 text-sm">{employee.position}</span>
                <span className="text-slate-300">·</span>
                <span className="text-indigo-600 text-sm font-medium">{employee.department}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${employee.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {employee.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Mail, label: 'Email', value: employee.email },
              { icon: Phone, label: 'Phone', value: employee.phone },
              { icon: MapPin, label: 'Address', value: employee.address },
              { icon: Building2, label: 'Company', value: employee.company },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-2.5">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <div className="text-slate-400 text-xs">{label}</div>
                  <div className="text-slate-700 text-sm mt-0.5">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employment details */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-5 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-500" />Employment Details
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Employee ID', value: employee.id.toUpperCase() },
              { label: 'Position', value: employee.position },
              { label: 'Department', value: employee.department },
              { label: 'Join Date', value: new Date(employee.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
              { label: 'Tenure', value: `${yearsTenure} yr${yearsTenure !== 1 ? 's' : ''} ${monthsTenure} mo${monthsTenure !== 1 ? 's' : ''}` },
              { label: 'Employment Status', value: employee.status.charAt(0).toUpperCase() + employee.status.slice(1) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-slate-400 text-sm">{label}</span>
                <span className="text-slate-700 text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance stats */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-5 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-violet-500" />Attendance Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Attendance Rate', value: `${attendancePct}%`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Present Days', value: `${presentDays}`, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Absent Days', value: `${absentDays}`, color: 'text-red-500', bg: 'bg-red-50' },
              { label: 'Late Days', value: `${myAttendance.filter(a => a.status === 'late').length}`, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                <div className={`${s.color} mb-0.5`} style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.5rem' }}>{s.value}</div>
                <div className="text-slate-500 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Leave summary */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-5 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-violet-500" />Leave Summary
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Annual Leave', data: balance.annual, color: 'bg-indigo-500' },
              { label: 'Casual Leave', data: balance.casual, color: 'bg-sky-500' },
              { label: 'Personal Leave', data: balance.personal, color: 'bg-rose-500' },
            ].map(({ label, data, color }) => {
              if (!data) return null;
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-600">{label}</span>
                    <span className="text-slate-400" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem' }}>{data.total - data.used} / {data.total}</span>
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
    </div>
  );
}
