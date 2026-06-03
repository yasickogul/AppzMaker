import { hiringCompanies, employees, attendanceRecords, leaveRequests } from '../models/store.js';
import {
  getTodayString,
  getTodayAttendanceForEmployees,
  getWeeklyAttendanceData,
  isEmployeeOnLeave,
  syncCompanyEmployeeCounts,
} from '../utils/helpers.js';

export const getDashboard = (req, res) => {
  const comp = hiringCompanies.find((c) => c.id === req.params.id);
  if (!comp) return res.status(404).json({ error: 'Company not found' });

  syncCompanyEmployeeCounts(hiringCompanies, employees);

  const compEmployees = employees.filter((e) => e.companyId === comp.id);
  const employeeIds = compEmployees.map((e) => e.id);
  const today = getTodayString();
  const todayRecs = getTodayAttendanceForEmployees(compEmployees, attendanceRecords, today);

  const presentCount = todayRecs.filter((r) => r.status === 'present' || r.status === 'late').length;
  const absentCount = todayRecs.filter((r) => r.status === 'absent').length;
  const pendingLeaves = leaveRequests.filter(
    (l) => employeeIds.includes(l.employeeId) && l.status === 'pending'
  ).length;
  const totalHours = attendanceRecords
    .filter((r) => employeeIds.includes(r.employeeId))
    .reduce((sum, r) => sum + (r.totalHours || 0), 0);

  const onLeaveCount = compEmployees.filter((e) => isEmployeeOnLeave(e.id, leaveRequests, today)).length;

  res.json({
    company: { ...comp, employeeCount: compEmployees.length },
    employees: compEmployees,
    todayRecs,
    weeklyData: getWeeklyAttendanceData(attendanceRecords, employeeIds),
    stats: {
      presentCount,
      absentCount,
      pendingLeaves,
      totalHours,
      onLeaveCount,
    },
  });
};
