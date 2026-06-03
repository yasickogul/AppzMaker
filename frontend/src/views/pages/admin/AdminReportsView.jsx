export function AdminReportsView() {
  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div>
        <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>System Reports</h1>
        <p className="text-slate-500 text-sm mt-0.5">System-wide analytics and reports</p>
      </div>
      <div className="bg-white rounded-2xl border border-border p-12 text-center">
        <div className="text-slate-300 mb-3" style={{ fontSize: '3rem' }}>📊</div>
        <p className="text-slate-500">Full system reports module — coming soon.</p>
        <p className="text-slate-400 text-sm mt-1">Includes attendance reports, payroll summaries, company analytics, and audit logs.</p>
      </div>
    </div>
  );
}
