import { Plus, Edit2, Trash2, Search, Users, Building2, ShieldCheck } from 'lucide-react';

export function AdminUsersView({
  employees,
  hrUsers,
  companies,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  showModal,
  setShowModal,
  empForm,
  setEmpForm,
  filteredEmployees,
  filteredHR,
  filteredCompanies,
  handleDeleteEmployee,
  handleDeleteHR,
  handleDeleteCompany,
  handleAddEmployee,
  handleAssignClient,
}) {
  const tabs = [
    { id: 'employees', label: 'Employees', icon: Users, count: employees.length },
    { id: 'hr', label: 'HR Managers', icon: ShieldCheck, count: hrUsers.length },
    { id: 'companies', label: 'Clients', icon: Building2, count: companies.length },
  ];

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>User Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage all employees, HR managers, and clients in the platform</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />Add {activeTab === 'employees' ? 'Employee' : activeTab === 'hr' ? 'HR Manager' : 'Client'}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-border p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setSearchQuery(''); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === id ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Icon className="w-3.5 h-3.5" />{label} <span className="text-slate-400">({count})</span>
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
          />
        </div>
      </div>

      {/* Employees table */}
      {activeTab === 'employees' && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/50">
                  {['Employee', 'Position', 'Department', 'Client', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-slate-400 font-medium py-3 px-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold">{emp.avatar}</div>
                        <div>
                          <div className="text-slate-700 font-medium whitespace-nowrap">{emp.name}</div>
                          <div className="text-slate-400 text-xs">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{emp.position}</td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{emp.department}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={emp.companyId || 'Our Company'}
                        onChange={(e) => handleAssignClient(emp.id, e.target.value)}
                        className="text-xs border border-border rounded-xl px-2.5 py-1.5 bg-slate-50 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="Our Company">Our Company (Internal)</option>
                        {companies.map(co => (
                          <option key={co.id} value={co.id}>{co.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${emp.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{emp.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button type="button" className="w-7 h-7 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 text-slate-400 rounded-lg flex items-center justify-center transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => handleDeleteEmployee(emp.id)} className="w-7 h-7 bg-slate-100 hover:bg-red-100 hover:text-red-500 text-slate-400 rounded-lg flex items-center justify-center transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-slate-400 text-sm">No employees found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HR table */}
      {activeTab === 'hr' && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/50">
                  {['HR Manager', 'Department', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-slate-400 font-medium py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredHR.map(hr => (
                  <tr key={hr.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center text-sky-700 text-xs font-bold">
                          {hr.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-slate-700 font-medium">{hr.name}</div>
                          <div className="text-slate-400 text-xs">{hr.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{hr.department}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${hr.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{hr.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button type="button" className="w-7 h-7 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 text-slate-400 rounded-lg flex items-center justify-center transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => handleDeleteHR(hr.id)} className="w-7 h-7 bg-slate-100 hover:bg-red-100 hover:text-red-500 text-slate-400 rounded-lg flex items-center justify-center transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredHR.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-slate-400 text-sm">No HR accounts found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Clients table */}
      {activeTab === 'companies' && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/50">
                  {['Client', 'Industry', 'Contact', 'Employees', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-slate-400 font-medium py-3 px-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCompanies.map(co => (
                  <tr key={co.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 text-xs font-bold">
                          {co.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="text-slate-700 font-medium whitespace-nowrap">{co.name}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{co.industry}</td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{co.contact}</td>
                    <td className="py-3 px-4 text-slate-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{employees.filter(e => e.companyId === co.id).length}</td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{co.joinedDate}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${co.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{co.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button type="button" className="w-7 h-7 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 text-slate-400 rounded-lg flex items-center justify-center transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => handleDeleteCompany(co.id)} className="w-7 h-7 bg-slate-100 hover:bg-red-100 hover:text-red-500 text-slate-400 rounded-lg flex items-center justify-center transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCompanies.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-slate-400 text-sm">No clients found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showModal && activeTab === 'employees' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-slate-800 font-semibold mb-5">Add New Employee</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'name', label: 'Full Name', placeholder: 'Jane Smith' },
                  { key: 'email', label: 'Email', placeholder: 'jane@company.com' },
                  { key: 'position', label: 'Position', placeholder: 'Software Engineer' },
                  { key: 'department', label: 'Department', placeholder: 'Engineering' },
                ].map(f => (
                  <div key={f.key} className={f.key === 'name' || f.key === 'email' ? 'col-span-2' : ''}>
                    <label className="block text-slate-600 text-sm mb-1.5">{f.label}</label>
                    <input
                      type="text"
                      value={empForm[f.key] || ''}
                      onChange={e => setEmpForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      required
                      className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">Add Employee</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-border py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && activeTab !== 'employees' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-slate-800 font-semibold mb-4">Add {activeTab === 'hr' ? 'HR Manager' : 'Client'}</h3>
            <p className="text-slate-400 text-sm mb-4">Feature coming soon. Use the employee form as a reference.</p>
            <button type="button" onClick={() => setShowModal(false)} className="w-full border border-border py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-50">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
