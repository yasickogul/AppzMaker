import { hiringCompanies, employees } from '../models/store.js';

export const getDashboard = (req, res) => {
  const comp = hiringCompanies.find(c => c.id === req.params.id);
  if (!comp) return res.status(404).json({ error: 'Company not found' });

  const compEmployees = employees.filter(e => e.companyId === comp.id);
  res.json({
    company: comp,
    employees: compEmployees
  });
};
