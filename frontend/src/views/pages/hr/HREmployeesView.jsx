import { Search, Users, Mail, Phone, Calendar } from 'lucide-react';

export function HREmployeesView({
  search,
  setSearch,
  deptFilter,
  setDeptFilter,
  statusFilter,
  setStatusFilter,
  selectedEmployeeId,
  setSelectedEmployeeId,
  departments,
  filteredEmployees,
  selectedEmployee,
  selectedAttendance,
  selectedBalance,
  getEmployeeStats,
  clients = [],
  handleAssignClient,
}) {
  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div>
        <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>Employees</h1>
        <p className="text-slate-500 text-sm mt-0.5">View and manage all employee records</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
          />
        </div>
        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          className="border border-border rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none bg-slate-50"
        >
          {departments.map(d => <option key={d}>{d}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-border rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none bg-slate-50"
        >
          <option value="All">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className={`grid gap-6 ${selectedEmployee ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {/* Employee list */}
        <div className={selectedEmployee ? 'lg:col-span-2' : ''}>
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <span className="text-slate-500 text-sm">{filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found</span>
            </div>
            <div className="divide-y divide-border">
              {filteredEmployees.map(emp => {
                const stats = getEmployeeStats(emp.id);
                const isSelected = selectedEmployeeId === emp.id;
                return (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmployeeId(isSelected ? null : emp.id)}
                    className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${emp.status === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                      {emp.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700 font-medium">{emp.name}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${emp.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{emp.status}</span>
                      </div>
                      <div className="text-slate-400 text-xs mt-0.5">{emp.position} · {emp.department}</div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400">
                      <div className="text-right">
                        <div className="font-medium text-slate-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{stats.pct}%</div>
                        <div>attendance</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredEmployees.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No employees found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Employee detail panel */}
        {selectedEmployee && (() => {
          const stats = getEmployeeStats(selectedEmployee.id);
          const recentRecs = selectedAttendance.slice(0, 5);
          return (
            <div className="space-y-4">
              {/* Profile card */}
              <div className="bg-white rounded-2xl border border-border p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold">{selectedEmployee.avatar}</div>
                  <div>
                    <div className="font-semibold text-slate-800">{selectedEmployee.name}</div>
                    <div className="text-slate-400 text-xs">{selectedEmployee.position}</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    { icon: Mail, value: selectedEmployee.email },
                    { icon: Phone, value: selectedEmployee.phone },
                  ].map(({ icon: Icon, value }) => (
                    <div key={value} className="flex items-center gap-2 text-slate-500">
                      <Icon className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                      <span className="truncate text-xs">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Work Assignment Card */}
              <div className="bg-white rounded-2xl border border-border p-5">
                <h4 className="text-slate-700 font-medium mb-3 text-sm flex items-center gap-1.5">
                  💼 Client Assignment
                </h4>
                <div className="space-y-3">
                  <div className="text-xs text-slate-500">
                    Current Client: <strong className="text-slate-700">{selectedEmployee.company || 'Our Company'}</strong>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 text-xs">Assign to Client</label>
                    <select
                      value={selectedEmployee.companyId || ''}
                      onChange={(e) => handleAssignClient(selectedEmployee.id, e.target.value)}
                      className="w-full border border-border rounded-xl px-3 py-2 text-xs text-slate-600 focus:outline-none bg-slate-50"
                    >
                      <option value="" disabled>-- Select Client --</option>
                      {clients.map(co => (
                        <option key={co.id} value={co.id}>{co.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-2xl border border-border p-5">
                <h4 className="text-slate-700 font-medium mb-3 text-sm">Performance</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Attendance', value: `${stats.pct}%`, color: 'text-emerald-600' },
                    { label: 'Hours', value: `${stats.hours.toFixed(0)}h`, color: 'text-indigo-600' },
                    { label: 'Present', value: `${stats.present}`, color: 'text-sky-600' },
                    { label: 'Absent', value: `${stats.total - stats.present}`, color: 'text-red-500' },
                  ].map(s => (
                    <div key={s.label} className="bg-slate-50 rounded-xl p-3">
                      <div className={`${s.color} font-semibold`} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1rem' }}>{s.value}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leave balance */}
              {selectedBalance && (
                <div className="bg-white rounded-2xl border border-border p-5">
                  <h4 className="text-slate-700 font-medium mb-3 text-sm flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-violet-400" />Leave Balance</h4>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Annual', data: selectedBalance.annual, color: 'bg-indigo-400' },
                      { label: 'Casual', data: selectedBalance.casual, color: 'bg-sky-400' },
                      { label: 'Personal', data: selectedBalance.personal, color: 'bg-rose-400' },
                    ].map(({ label, data, color }) => {
                      if (!data) return null;
                      return (
                        <div key={label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">{label}</span>
                            <span className="text-slate-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{data.total - data.used}/{data.total}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full">
                            <div className={`h-full ${color} rounded-full`} style={{ width: `${((data.total - data.used) / data.total) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent attendance */}
              <div className="bg-white rounded-2xl border border-border p-5">
                <h4 className="text-slate-700 font-medium mb-3 text-sm">Recent Attendance</h4>
                <div className="space-y-2">
                  {recentRecs.map(rec => {
                    const s = { present: 'text-emerald-600 bg-emerald-50', late: 'text-amber-600 bg-amber-50', absent: 'text-red-500 bg-red-50', 'half-day': 'text-sky-600 bg-sky-50' };
                    return (
                      <div key={rec.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">{new Date(rec.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className="text-slate-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{rec.checkIn || '—'}</span>
                        <span className={`px-1.5 py-0.5 rounded-full ${s[rec.status] || 'bg-slate-100 text-slate-700'} capitalize`}>{rec.status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
