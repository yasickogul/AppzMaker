import { useState, useEffect } from 'react';

const BACKEND_URL = 'http://localhost:5001/api';

export function useHRController() {
  const [employeesList, setEmployeesList] = useState([]);
  const [leavesList, setLeavesList] = useState([]);
  const [clients, setClients] = useState([]);

  const [todayAttendance, setTodayAttendance] = useState([]);
  const [weeklyAttendanceData, setWeeklyAttendanceData] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [todayDate, setTodayDate] = useState('');
  const [todayLabel, setTodayLabel] = useState('');
  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    onLeaveToday: 0,
  });
  const [employeeStatsMap, setEmployeeStatsMap] = useState({});
  const [reportsSummary, setReportsSummary] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    avgAttendance: 0,
    totalHours: 0,
    leaveDaysUsed: 0,
  });
  const [leaveTypeData, setLeaveTypeData] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedAttendance, setSelectedAttendance] = useState([]);
  const [selectedBalance, setSelectedBalance] = useState(null);

  const [leaveTabFilter, setLeaveTabFilter] = useState('pending');
  const [leaveSearch, setLeaveSearch] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [hrNote, setHrNote] = useState('');
  const [leaveAction, setLeaveAction] = useState(null);

  const [reportType, setReportType] = useState('attendance');

  const fetchData = async () => {
    try {
      const [dashRes, reportsRes, dbRes, leavesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/hr/dashboard`),
        fetch(`${BACKEND_URL}/hr/reports`),
        fetch(`${BACKEND_URL}/admin/dashboard`),
        fetch(`${BACKEND_URL}/hr/leaves`),
      ]);

      if (leavesRes.ok) {
        setLeavesList(await leavesRes.json());
      }

      if (dashRes.ok) {
        const dashData = await dashRes.json();
        setEmployeesList(dashData.employees || []);
        setTodayAttendance(dashData.todayAttendance || []);
        setWeeklyAttendanceData(dashData.weeklyAttendanceData || []);
        setDeptData(dashData.deptData || []);
        setTodayDate(dashData.todayDate || '');
        setTodayLabel(dashData.todayLabel || '');
        setDashboardStats(dashData.stats || {});
      }

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setEmployeeStatsMap(reportsData.employeeStats || {});
        setReportsSummary(reportsData.summary || {});
        setLeaveTypeData(reportsData.leaveTypeData || []);
        setMonthlyTrend(reportsData.monthlyTrend || []);
      }

      if (dbRes.ok) {
        const dbData = await dbRes.json();
        setClients(dbData.companies || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployeeDetail = async (empId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/hr/employees/${empId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedAttendance(data.attendance || []);
        setSelectedBalance(data.leaveBalance);
        if (data.stats) {
          setEmployeeStatsMap((prev) => ({ ...prev, [empId]: data.stats }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchEmployeeDetail(selectedEmployeeId);
    } else {
      setSelectedAttendance([]);
      setSelectedBalance(null);
    }
  }, [selectedEmployeeId]);

  const departments = ['All', ...new Set(employeesList.map((e) => e.department))];

  const filteredEmployees = employeesList.filter((e) => {
    const matchSearch =
      search === '' ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.position.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || e.department === deptFilter;
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const selectedEmployee = selectedEmployeeId
    ? employeesList.find((e) => e.id === selectedEmployeeId)
    : null;

  const getEmployeeStats = (empId) =>
    employeeStatsMap[empId] || { present: 0, total: 0, pct: 0, hours: 0, late: 0, absent: 0 };

  const handleConfirmLeaveAction = async () => {
    if (!selectedLeave) return;

    try {
      const res = await fetch(`${BACKEND_URL}/hr/leaves/${selectedLeave.id}/review`, {
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

  const filteredLeaves = leavesList
    .filter((l) => leaveTabFilter === 'all' || l.status === leaveTabFilter)
    .filter(
      (l) =>
        leaveSearch === '' ||
        l.employeeName.toLowerCase().includes(leaveSearch.toLowerCase()) ||
        l.department.toLowerCase().includes(leaveSearch.toLowerCase())
    );

  const leaveCounts = {
    all: leavesList.length,
    pending: leavesList.filter((l) => l.status === 'pending').length,
    approved: leavesList.filter((l) => l.status === 'approved').length,
    rejected: leavesList.filter((l) => l.status === 'rejected').length,
  };

  const totalEmployees = dashboardStats.totalEmployees || employeesList.length;
  const activeEmployees = dashboardStats.activeEmployees || employeesList.filter((e) => e.status === 'active').length;
  const presentToday = dashboardStats.presentToday || 0;
  const onLeaveToday = dashboardStats.onLeaveToday || 0;

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

  return {
    employeesList,
    leavesList,
    todayAttendance,
    weeklyAttendanceData,
    deptData,
    todayDate,
    todayLabel,
    dashboardStats,
    reportsSummary,
    leaveTypeData,
    monthlyTrend,

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

    reportType,
    setReportType,

    totalEmployees,
    activeEmployees,
    presentToday,
    onLeaveToday,

    clients,
    handleAssignClient,
  };
}
