import { useState, useEffect } from 'react';

const BACKEND_URL = 'http://localhost:5001/api';

export function useAdminController() {
  // Global registries states loaded from backend
  const [employees, setEmployees] = useState([]);
  const [hrUsers, setHRUsers] = useState([]);
  const [companies, setCompanies] = useState([]);

  // Tab management ('employees' | 'hr' | 'companies')
  const [activeTab, setActiveTab] = useState('employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Employee creation form state
  const [empForm, setEmpForm] = useState({ 
    name: '', 
    email: '', 
    position: '', 
    department: '', 
    company: 'TechVentures Ltd'
  });

  // Global settings state (initially loaded from backend)
  const [settings, setSettings] = useState({
    workHours: '8 hours',
    breakTime: '45 minutes',
    lateThreshold: '15 minutes',
    overtimeRate: '1.5x',
    sessionTimeout: '30 minutes',
    backupSchedule: 'Daily at 2 AM',
    leaveAllocations: {
      annual: 15,
      casual: 10,
      personal: 10
    }
  });

  const fetchData = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/dashboard`);
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees);
        setHRUsers(data.hrUsers);
        setCompanies(data.companies);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchSettings();
  }, []);

  // Filters
  const filteredEmployees = employees.filter(e => 
    searchQuery === '' || 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredHR = hrUsers.filter(h => 
    searchQuery === '' || 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredCompanies = companies.filter(c => 
    searchQuery === '' || 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Actions
  const handleDeleteEmployee = (id) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const handleDeleteHR = (id) => {
    setHRUsers(prev => prev.filter(h => h.id !== id));
  };

  const handleDeleteCompany = (id) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
  };

  const handleAddEmployee = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/hr/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: empForm.name,
          email: empForm.email,
          position: empForm.position,
          department: empForm.department,
          companyId: 'co001',
          phone: '+1 (555) 000-0000',
          address: 'Austin, TX'
        })
      });

      if (res.ok) {
        setEmpForm({ name: '', email: '', position: '', department: '', company: 'TechVentures Ltd' });
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Configurations edit action
  const handleUpdateSetting = async (key, value) => {
    try {
      let updatedPayload = {};
      if (key.startsWith('leaveAllocations.')) {
        const subKey = key.split('.')[1];
        updatedPayload = {
          leaveAllocations: {
            [subKey]: value
          }
        };
      } else {
        updatedPayload = { [key]: value };
      }

      const res = await fetch(`${BACKEND_URL}/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload)
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        // Refresh employees database to sync new leave balances
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignClient = async (employeeId, clientId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/employees/${employeeId}/client`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return {
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
    settings,
    
    // Filtered lists
    filteredEmployees,
    filteredHR,
    filteredCompanies,

    // Operations
    handleDeleteEmployee,
    handleDeleteHR,
    handleDeleteCompany,
    handleAddEmployee,
    handleUpdateSetting,
    handleAssignClient
  };
}
