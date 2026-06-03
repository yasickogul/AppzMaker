import { useState } from 'react';
import { demoCredentials } from '../models/mockData';

const defaultPages = {
  employee: 'dashboard',
  hr: 'dashboard',
  company: 'dashboard',
  superadmin: 'dashboard',
};

const BACKEND_URL = 'http://localhost:5001/api';

export function useAuthController() {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('wf_auth');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('wf_page') || 'dashboard';
  });
  const [selectedRole, setSelectedRole] = useState('employee');
  
  const initialCreds = demoCredentials[selectedRole];
  const [email, setEmail] = useState(initialCreds.email);
  const [password, setPassword] = useState(initialCreds.password);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    const c = demoCredentials[role];
    setEmail(c.email);
    setPassword(c.password);
    setError('');
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Login failed');
      }

      const data = await response.json();
      setAuth(data);
      localStorage.setItem('wf_auth', JSON.stringify(data));
      
      const defaultPage = defaultPages[selectedRole];
      setCurrentPage(defaultPage);
      localStorage.setItem('wf_page', defaultPage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem('wf_auth');
    localStorage.removeItem('wf_page');
    setCurrentPage('dashboard');
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    localStorage.setItem('wf_page', page);
  };

  return {
    auth,
    currentPage,
    setCurrentPage: navigateTo,
    selectedRole,
    setSelectedRole: handleRoleChange,
    email,
    setEmail,
    password,
    setPassword,
    showPass,
    setShowPass,
    handleLogin,
    handleLogout,
    error,
    loading
  };
}
