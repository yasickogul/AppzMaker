import Company from '../models/Company.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import LeaveRequest from '../models/LeaveRequest.js';
import {
  getTodayString,
  getTodayAttendanceForEmployees,
  getWeeklyAttendanceData,
  isEmployeeOnLeave,
} from '../utils/helpers.js';
import { findCompany } from '../utils/entityLookup.js';
import { toCompanyJSON, toEmployeeJSON, toAttendanceJSON } from '../utils/formatters.js';
import { syncCompanyEmployeeCounts } from '../services/companyService.js';

export const getDashboard = async (req, res) => {
  try {
    const comp = await findCompany(req.params.id);
    if (!comp) return res.status(404).json({ error: 'Company not found' });

    await syncCompanyEmployeeCounts();

    const cid = comp.legacyId || comp._id.toString();
    const compEmployees = await Employee.find({ companyId: cid });
    const employeesJson = compEmployees.map(toEmployeeJSON);
    const employeeIds = employeesJson.map((e) => e.id);
    const today = getTodayString();

    const attendanceRecords = await Attendance.find({ employeeId: { $in: employeeIds } });
    const attJson = attendanceRecords.map(toAttendanceJSON);
    const todayRecs = getTodayAttendanceForEmployees(employeesJson, attJson, today);

    const presentCount = todayRecs.filter((r) => r.status === 'present' || r.status === 'late').length;
    const absentCount = todayRecs.filter((r) => r.status === 'absent').length;
    const leaves = await LeaveRequest.find({ employeeId: { $in: employeeIds }, status: 'pending' });
    const pendingLeaves = leaves.length;
    const totalHours = attJson.reduce((sum, r) => sum + (r.totalHours || 0), 0);
    const allLeaves = await LeaveRequest.find();
    const onLeaveCount = employeesJson.filter((e) =>
      isEmployeeOnLeave(e.id, allLeaves.map((l) => l.toObject()), today)
    ).length;

    res.json({
      company: { ...toCompanyJSON(comp), employeeCount: employeesJson.length },
      employees: employeesJson,
      todayRecs,
      weeklyData: getWeeklyAttendanceData(attJson, employeeIds),
      stats: {
        presentCount,
        absentCount,
        pendingLeaves,
        totalHours,
        onLeaveCount,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
