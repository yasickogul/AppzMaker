import { UserCircle, Users, Building2, ShieldCheck, Clock, Eye, EyeOff } from 'lucide-react';

const roles = [
  { id: 'employee', label: 'Employee', icon: UserCircle, desc: 'Track attendance & leaves', color: 'from-indigo-500 to-indigo-600' },
  { id: 'hr', label: 'HR Manager', icon: Users, desc: 'Manage team & approvals', color: 'from-sky-500 to-sky-600' },
  { id: 'company', label: 'Hiring Company', icon: Building2, desc: 'Monitor your workforce', color: 'from-emerald-500 to-emerald-600' },
  { id: 'superadmin', label: 'Super Admin', icon: ShieldCheck, desc: 'Full system control', color: 'from-violet-500 to-violet-600' },
];

export function Login({
  mode,
  toggleMode,
  selectedRole,
  setSelectedRole,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  showPass,
  setShowPass,
  handleLogin,
  handleSignup,
  error,
  loading,
}) {
  const isSignup = mode === 'signup';

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
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
        </div>

        <div className="relative text-slate-500 text-xs">© 2026 WorkForge. All rights reserved.</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <span className="text-white" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>WorkForge</span>
          </div>

          <div className="mb-8">
            <h2 className="text-white mb-2" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '1.75rem' }}>
              {isSignup ? 'Create account' : 'Welcome back'}
            </h2>
            <p className="text-slate-400 text-sm">
              {isSignup ? 'Register with your role to join WorkForge' : 'Select your role and sign in to continue'}
            </p>
          </div>

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

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-slate-300 text-sm mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-white/8 transition-all"
                  placeholder="Your name"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                />
              </div>
            )}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                  required
                  minLength={6}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white py-3 rounded-xl transition-colors mt-2"
              style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}
            >
              {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In to WorkForge'}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-400 text-sm">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" onClick={toggleMode} className="text-indigo-400 hover:text-indigo-300 font-medium">
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>

          {!isSignup && (
            <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-slate-400 text-xs">
                Use your MongoDB account credentials. For the seeded employee, try{' '}
                <span className="text-indigo-400">sarah@techventures.com</span> with password{' '}
                <span className="text-indigo-400">123456</span> (if that was the hashed password).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
