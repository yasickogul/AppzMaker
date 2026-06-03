export function AdminCompaniesView() {
  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div>
        <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>Clients</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage client accounts and projects</p>
      </div>
      <div className="bg-white rounded-2xl border border-border p-12 text-center">
        <div className="text-slate-300 mb-3" style={{ fontSize: '3rem' }}>🏢</div>
        <p className="text-slate-500">Client management is available under User Management → Clients tab.</p>
      </div>
    </div>
  );
}
