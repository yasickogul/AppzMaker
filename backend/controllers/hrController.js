import {
  employees,
  leaveRequests,
  leaveBalances,
  hiringCompanies,
  systemSettings,
  attendanceRecords,
} from '../models/store.js';
import {
  getTodayString,
  formatDisplayDate,
  getTodayAttendanceForEmployees,
  computeEmployeeStats,
  getWeeklyAttendanceData,
  getDeptAttendanceData,
  computeLeaveTypeData,
  computeMonthlyTrend,
  syncCompanyEmployeeCounts,
  isEmployeeOnLeave,
} from '../utils/helpers.js';

export const getLeaves = (req, res) => {
  res.json(leaveRequests);
};

export const reviewLeave = (req, res) => {
  const { status, note, rejectionReason } = req.body;
  const leave = leaveRequests.find((l) => l.id === req.params.id);

  if (!leave) return res.status(404).json({ error: 'Leave request not found' });
  if (leave.status !== 'pending') {
    return res.status(400).json({ error: 'Leave request has already been reviewed' });
  }

  leave.status = status;
  if (note) leave.hrNote = note;
  if (rejectionReason) leave.rejectionReason = rejectionReason;

  const balance = leaveBalances.find((b) => b.employeeId === leave.employeeId);
  if (balance && balance[leave.type]) {
    if (status === 'approved') {
      balance[leave.type].used += leave.days;
    }
  }

  res.json({ message: `Leave request ${status} successfully`, leave });
};

export const getEmployees = (req, res) => {
  res.json(employees);
};

export const getEmployeeDetail = (req, res) => {
  const emp = employees.find((e) => e.id === req.params.id);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  const balance = leaveBalances.find((b) => b.employeeId === emp.id) || null;
  const attendance = attendanceRecords
    .filter((r) => r.employeeId === emp.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);
  const stats = computeEmployeeStats(emp.id, attendanceRecords);

  res.json({ employee: emp, leaveBalance: balance, attendance, stats });
};

export const createEmployee = (req, res) => {
  const { name, email, position, department, companyId, phone, address } = req.body;

  const comp = hiringCompanies.find((c) => c.id === companyId);
  const companyName = comp ? comp.name : 'Our Company';
  const finalCompanyId = comp ? comp.id : null;

  const newEmp = {
    id: `emp${String(employees.length + 1).padStart(3, '0')}`,
    name,
    email,
    position,
    department,
    company: companyName,
    companyId: finalCompanyId,
    avatar: name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase(),
    joinDate: getTodayString(),
    status: 'active',
    phone: phone || '+1 (555) 000-0000',
    address: address || 'Austin, TX',
  };

  employees.push(newEmp);
  syncCompanyEmployeeCounts(hiringCompanies, employees);

  leaveBalances.push({
    employeeId: newEmp.id,
    annual: { total: parseInt(systemSettings.leaveAllocations.annual) || 15, used: 0 },
    casual: { total: parseInt(systemSettings.leaveAllocations.casual) || 10, used: 0 },
    personal: { total: parseInt(systemSettings.leaveAllocations.personal) || 10, used: 0 },
  });

  res.json({ message: 'Employee created successfully', employee: newEmp });
};

export const getDashboard = (req, res) => {
  const today = getTodayString();
  const activeEmployees = employees.filter((e) => e.status === 'active');
  const todayAttendance = getTodayAttendanceForEmployees(activeEmployees, attendanceRecords, today);
  const present = todayAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const absent = todayAttendance.filter((a) => a.status === 'absent').length;
  const late = todayAttendance.filter((a) => a.status === 'late').length;
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'pending');
  const onLeaveToday = activeEmployees.filter((e) => isEmployeeOnLeave(e.id, leaveRequests, today)).length;

  res.json({
    todayDate: today,
    todayLabel: formatDisplayDate(),
    employees: employees,
    todayAttendance,
    weeklyAttendanceData: getWeeklyAttendanceData(
      attendanceRecords,
      activeEmployees.map((e) => e.id)
    ),
    deptData: getDeptAttendanceData(activeEmployees, todayAttendance),
    leaveCounts: {
      all: leaveRequests.length,
      pending: pendingLeaves.length,
      approved: leaveRequests.filter((l) => l.status === 'approved').length,
      rejected: leaveRequests.filter((l) => l.status === 'rejected').length,
    },
    pendingLeaves,
    stats: {
      totalEmployees: employees.length,
      activeEmployees: activeEmployees.length,
      presentToday: present,
      absentToday: absent,
      lateToday: late,
      onLeaveToday,
    },
  });
};

export const getReports = (req, res) => {
  const activeEmployees = employees.filter((e) => e.status === 'active');
  const employeeIds = activeEmployees.map((e) => e.id);
  const today = getTodayString();
  const todayAttendance = getTodayAttendanceForEmployees(activeEmployees, attendanceRecords, today);
  const employeeStats = {};

  activeEmployees.forEach((emp) => {
    employeeStats[emp.id] = computeEmployeeStats(emp.id, attendanceRecords);
  });

  const allStats = Object.values(employeeStats);
  const avgAttendance =
    allStats.length > 0
      ? Math.round(allStats.reduce((sum, s) => sum + s.pct, 0) / allStats.length)
      : 0;
  const totalHours = allStats.reduce((sum, s) => sum + s.hours, 0);

  res.json({
    employees: employees,
    leaves: leaveRequests,
    todayAttendance,
    weeklyAttendanceData: getWeeklyAttendanceData(attendanceRecords, employeeIds),
    leaveTypeData: computeLeaveTypeData(leaveRequests),
    monthlyTrend: computeMonthlyTrend(attendanceRecords, employeeIds),
    employeeStats,
    summary: {
      totalEmployees: employees.length,
      activeEmployees: activeEmployees.length,
      avgAttendance,
      totalHours,
      leaveDaysUsed: leaveRequests
        .filter((l) => l.status === 'approved')
        .reduce((s, l) => s + l.days, 0),
    },
  });
};
