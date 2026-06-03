import { useState, useEffect } from 'react';

const BACKEND_URL = 'http://localhost:5001/api';

export function useHRController() {
  const [employeesList, setEmployeesList] = useState([]);
  const [leavesList, setLeavesList] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [clients, setClients] = useState([]);

  // Filters for Directory
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // Leave Approvals States
  const [leaveTabFilter, setLeaveTabFilter] = useState('pending');
  const [leaveSearch, setLeaveSearch] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [hrNote, setHrNote] = useState('');
  const [leaveAction, setLeaveAction] = useState(null);

  // Report panel selection state
  const [reportType, setReportType] = useState('attendance');

  // Load telemetry from backend
  const fetchData = async () => {
    try {
      const empRes = await fetch(`${BACKEND_URL}/hr/employees`);
      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployeesList(empData);
      }

      const leavesRes = await fetch(`${BACKEND_URL}/hr/leaves`);
      if (leavesRes.ok) {
        const leavesData = await leavesRes.json();
        setLeavesList(leavesData);
      }

      // Fetch dashboard register metadata for global telemetry
      const dbRes = await fetch(`${BACKEND_URL}/admin/dashboard`);
      if (dbRes.ok) {
        const dbData = await dbRes.json();
        setClients(dbData.companies || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // De-duplicate departments
  const departments = ['All', ...new Set(employeesList.map(e => e.department))];

  // Filters for Employee List
  const filteredEmployees = employeesList.filter(e => {
    const matchSearch = search === '' || 
      e.name.toLowerCase().includes(search.toLowerCase()) || 
      e.email.toLowerCase().includes(search.toLowerCase()) || 
      e.position.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || e.department === deptFilter;
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const selectedEmployee = selectedEmployeeId ? employeesList.find(e => e.id === selectedEmployeeId) : null;
  const selectedAttendance = []; // Optional detailed attendance log
  const selectedBalance = null; // Can request as needed

  // Stats helper
  const getEmployeeStats = (empId) => {
    return { present: 15, total: 16, pct: 93, hours: 120 };
  };

  // Leave approvals actions
  const handleConfirmLeaveAction = async () => {
    if (!selectedLeave) return;
    
    try {
      const res = await fetch(`${BACKEND_URL}/hr/leaves/${selectedLeave.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: leaveAction === 'approve' ? 'approved' : 'rejected',
          note: hrNote,
          rejectionReason: rejectReason
        })
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

  const filteredLeaves = leavesList
    .filter(l => leaveTabFilter === 'all' || l.status === leaveTabFilter)
    .filter(l => leaveSearch === '' || 
      l.employeeName.toLowerCase().includes(leaveSearch.toLowerCase()) || 
      l.department.toLowerCase().includes(leaveSearch.toLowerCase())
    );

  const leaveCounts = {
    all: leavesList.length,
    pending: leavesList.filter(l => l.status === 'pending').length,
    approved: leavesList.filter(l => l.status === 'approved').length,
    rejected: leavesList.filter(l => l.status === 'rejected').length,
  };

  // Dashboard calculations
  const totalEmployees = employeesList.length;
  const activeEmployees = employeesList.filter(e => e.status === 'active').length;
  const presentToday = activeEmployees; // Fallback simulation
  const onLeaveToday = leavesList.filter(l => l.status === 'approved').length;

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
    employeesList,
    setEmployeesList,
    leavesList,
    setLeavesList,
    
    // Employee lists states
    search,
    setSearch,
    deptFilter,
    setDeptFilter,
    statusFilter,
    setStatusFilter,
    selectedEmployeeId,
    setSelectedEmployeeId,
    departments,
    filteredEmployees,
    selectedEmployee,
    selectedAttendance,
    selectedBalance,
    getEmployeeStats,

    // Leave approvals states
    leaveTabFilter,
    setLeaveTabFilter,
    leaveSearch,
    setLeaveSearch,
    selectedLeave,
    setSelectedLeave,
    rejectReason,
    setRejectReason,
    hrNote,
    setHrNote,
    leaveAction,
    setLeaveAction,
    handleConfirmLeaveAction,
    filteredLeaves,
    leaveCounts,

    // Reports states
    reportType,
    setReportType,

    // Dashboard calculations
    totalEmployees,
    activeEmployees,
    presentToday,
    onLeaveToday,

    clients,
    handleAssignClient,
  };
}
