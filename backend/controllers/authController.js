import { demoCredentials } from '../models/store.js';

export const login = (req, res) => {
  const { email, password, role } = req.body;
  
  if (!role || !email || !password) {
    return res.status(400).json({ error: 'Missing email, password, or role' });
  }

  const roleCreds = demoCredentials[role];
  if (!roleCreds) {
    return res.status(400).json({ error: 'Invalid role specified' });
  }

  if (roleCreds.email === email && roleCreds.password === password) {
    const responsePayload = {
      email: roleCreds.email,
      role: role,
      userId: role === 'company' ? roleCreds.companyId : roleCreds.userId
    };
    return res.json(responsePayload);
  }

  return res.status(401).json({ error: 'Invalid credentials' });
};
