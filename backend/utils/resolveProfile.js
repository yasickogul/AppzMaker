import { employees, hrUsers, hiringCompanies } from '../models/store.js';

const normalizeRole = (role) => {
  if (role === 'admin') return 'superadmin';
  return role;
};

export const resolveProfileId = (user) => {
  const role = normalizeRole(user.role);

  if (user.profileId) {
    return user.profileId;
  }

  const email = user.email?.toLowerCase();

  if (role === 'employee') {
    const emp = employees.find((e) => e.email?.toLowerCase() === email);
    if (emp) return emp.id;
    const firstName = user.name?.split(' ')[0]?.toLowerCase();
    if (firstName) {
      const byName = employees.find((e) => e.name?.toLowerCase().startsWith(firstName));
      if (byName) return byName.id;
    }
    return null;
  }

  if (role === 'hr') {
    const hr = hrUsers.find((h) => h.email?.toLowerCase() === email);
    return hr?.id || null;
  }

  if (role === 'company') {
    const co = hiringCompanies.find((c) => c.email?.toLowerCase() === email);
    return co?.id || null;
  }

  return null;
};

export { normalizeRole };
