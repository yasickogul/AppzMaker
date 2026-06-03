import { useState, useEffect } from 'react';

const BACKEND_URL = 'http://localhost:5001/api';

export function useAdminController() {
  const [employees, setEmployees] = useState([]);
  const [hrUsers, setHRUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [leavesList, setLeavesList] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [pendingLeaves, setPendingLeaves] = useState([]);

  const [activeTab, setActiveTab] = useState('employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [empForm, setEmpForm] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    company: 'TechVentures Ltd',
  });

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [hrNote, setHrNote] = useState('');
  const [leaveAction, setLeaveAction] = useState(null);

  const [settings, setSettings] = useState({
    workHours: '8 hours',
    breakTime: '45 minutes',
    lateThreshold: '15 minutes',
    overtimeRate: '1.5x',
    sessionTimeout: '30 minutes',
    backupSchedule: 'Daily at 2 AM',
    leaveAllocations: { annual: 15, casual: 10, personal: 10 },
  });

  const fetchData = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/dashboard`);
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees || []);
        setHRUsers(data.hrUsers || []);
        setCompanies(data.companies || []);
        setDashboardStats(data.stats || {});
        setPendingLeaves((data.pendingLeaves || []).filter((l) => l.status === 'pending'));
      }

      const leavesRes = await fetch(`${BACKEND_URL}/admin/leaves`);
      if (leavesRes.ok) {
        setLeavesList(await leavesRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/settings`);
      if (res.ok) setSettings(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchSettings();
  }, []);

  const filteredEmployees = employees.filter(
    (e) =>
      searchQuery === '' ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHR = hrUsers.filter(
    (h) =>
      searchQuery === '' ||
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompanies = companies.filter(
    (c) => searchQuery === '' || c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteEmployee = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/employees/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHR = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/hr/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCompany = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/companies/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
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
          address: 'Austin, TX',
        }),
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

  const handleConfirmLeaveAction = async () => {
    if (!selectedLeave) return;
    try {
      const res = await fetch(`${BACKEND_URL}/admin/leaves/${selectedLeave.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: leaveAction === 'approve' ? 'approved' : 'rejected',
          note: hrNote,
          rejectionReason: rejectReason,
        }),
      });
      if (res.ok) {
        setSelectedLeave(null);
        setRejectReason('');
        setHrNote('');
        setLeaveAction(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSetting = async (key, value) => {
    try {
      let updatedPayload = {};
      if (key.startsWith('leaveAllocations.')) {
        const subKey = key.split('.')[1];
        updatedPayload = { leaveAllocations: { [subKey]: value } };
      } else {
        updatedPayload = { [key]: value };
      }

      const res = await fetch(`${BACKEND_URL}/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
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
        body: JSON.stringify({ clientId }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const leaveCounts = {
    pending: leavesList.filter((l) => l.status === 'pending').length,
    approved: leavesList.filter((l) => l.status === 'approved').length,
    rejected: leavesList.filter((l) => l.status === 'rejected').length,
  };

  return {
    employees,
    hrUsers,
    companies,
    leavesList,
    dashboardStats,
    pendingLeaves,
    leaveCounts,

    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    showModal,
    setShowModal,
    empForm,
    setEmpForm,
    settings,

    selectedLeave,
    setSelectedLeave,
    rejectReason,
    setRejectReason,
    hrNote,
    setHrNote,
    leaveAction,
    setLeaveAction,
    handleConfirmLeaveAction,

    filteredEmployees,
    filteredHR,
    filteredCompanies,

    handleDeleteEmployee,
    handleDeleteHR,
    handleDeleteCompany,
    handleAddEmployee,
    handleUpdateSetting,
    handleAssignClient,
  };
}
