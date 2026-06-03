import { UserCircle, Users, Building2, ShieldCheck, Clock, Eye, EyeOff } from 'lucide-react';
import { demoCredentials } from '../../models/mockData';

const roles = [
  { id: 'employee', label: 'Employee', icon: UserCircle, desc: 'Track attendance & leaves', color: 'from-indigo-500 to-indigo-600' },
  { id: 'hr', label: 'HR Manager', icon: Users, desc: 'Manage team & approvals', color: 'from-sky-500 to-sky-600' },
  { id: 'company', label: 'Hiring Company', icon: Building2, desc: 'Monitor your workforce', color: 'from-emerald-500 to-emerald-600' },
  { id: 'superadmin', label: 'Super Admin', icon: ShieldCheck, desc: 'Full system control', color: 'from-violet-500 to-violet-600' },
];

export function Login({
  selectedRole,
  setSelectedRole,
  email,
  setEmail,
  password,
  setPassword,
  showPass,
  setShowPass,
  handleLogin,
}) {
  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-[#0f172a]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-600/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xl" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>WorkForge</span>
          </div>
          <p className="text-slate-400 text-sm mt-1">Remote Workforce Management</p>
        </div>

        <div className="relative space-y-8">
          <div>
            <h1 className="text-white mb-4" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '2.25rem', lineHeight: 1.2 }}>
              Manage your remote team with confidence
            </h1>
            <p className="text-slate-400 leading-relaxed" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Track attendance, manage leaves, monitor productivity — all in one unified platform built for distributed teams.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Active Employees', value: '1,200+' },
              { label: 'Companies', value: '48' },
              { label: 'Leaves Managed', value: '3,800+' },
              { label: 'Uptime', value: '99.9%' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-white mb-1" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, fontSize: '1.5rem' }}>{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-slate-500 text-xs">© 2026 WorkForge. All rights reserved.</div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <span className="text-white" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>WorkForge</span>
          </div>

          <div className="mb-8">
            <h2 className="text-white mb-2" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '1.75rem' }}>Welcome back</h2>
            <p className="text-slate-400 text-sm">Select your role and sign in to continue</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center mb-2`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-white text-sm" style={{ fontWeight: 600 }}>{role.label}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{role.desc}</div>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-white/8 transition-all"
                placeholder="your@email.com"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-white/8 transition-all pr-12"
                  placeholder="••••••••"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input type="checkbox" className="rounded" />
                Remember me
              </label>
              <button type="button" className="text-indigo-400 hover:text-indigo-300">Forgot password?</button>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl transition-colors mt-2"
              style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}
            >
              Sign In to WorkForge
            </button>
          </form>

          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-slate-400 text-xs mb-2">Demo credentials pre-filled for: <span className="text-indigo-400">{roles.find(r => r.id === selectedRole)?.label}</span></p>
            <p className="text-slate-500 text-xs">Switch roles above to auto-fill credentials</p>
          </div>
        </div>
      </div>
    </div>
  );
}
