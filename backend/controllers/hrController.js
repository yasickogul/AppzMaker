import Employee from '../models/Employee.js';
import LeaveRequest from '../models/LeaveRequest.js';
import LeaveBalance from '../models/LeaveBalance.js';
import Attendance from '../models/Attendance.js';
import Company from '../models/Company.js';
import {
  getTodayString,
  formatDisplayDate,
  getTodayAttendanceForEmployees,
  computeEmployeeStats,
  getWeeklyAttendanceData,
  getDeptAttendanceData,
  computeLeaveTypeData,
  computeMonthlyTrend,
  isEmployeeOnLeave,
} from '../utils/helpers.js';
import { findEmployee, findLeave, getEmployeeLegacyId } from '../utils/entityLookup.js';
import { toEmployeeJSON, toLeaveJSON, toLeaveBalanceJSON, toAttendanceJSON } from '../utils/formatters.js';
import { getSettings } from '../services/settingsService.js';
import { syncCompanyEmployeeCounts } from '../services/companyService.js';

export const getLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find().sort({ createdAt: -1 });
    res.json(leaves.map(toLeaveJSON));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const reviewLeave = async (req, res) => {
  try {
    const { status, note, rejectionReason } = req.body;
    const leave = await findLeave(req.params.id);
    if (!leave) return res.status(404).json({ error: 'Leave request not found' });
    if (leave.status !== 'pending') {
      return res.status(400).json({ error: 'Leave request has already been reviewed' });
    }

    leave.status = status;
    if (note) leave.hrNote = note;
    if (rejectionReason) leave.rejectionReason = rejectionReason;
    await leave.save();

    if (status === 'approved') {
      const balance = await LeaveBalance.findOne({ employeeId: leave.employeeId });
      if (balance && balance[leave.type]) {
        balance[leave.type].used += leave.days;
        await balance.save();
      }
    }

    res.json({ message: `Leave request ${status} successfully`, leave: toLeaveJSON(leave) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees.map(toEmployeeJSON));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEmployeeDetail = async (req, res) => {
  try {
    const emp = await findEmployee(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const empId = getEmployeeLegacyId(emp);
    const balance = await LeaveBalance.findOne({ employeeId: empId });
    const attendance = await Attendance.find({ employeeId: empId }).sort({ date: -1 }).limit(10);
    const allAttendance = await Attendance.find({ employeeId: empId });
    const stats = computeEmployeeStats(empId, allAttendance.map(toAttendanceJSON));

    res.json({
      employee: toEmployeeJSON(emp),
      leaveBalance: balance ? toLeaveBalanceJSON(balance) : null,
      attendance: attendance.map(toAttendanceJSON),
      stats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { name, email, position, department, companyId, phone, address } = req.body;
    const settings = await getSettings();

    let comp = null;
    if (companyId) {
      comp = await Company.findOne({ $or: [{ legacyId: companyId }, { _id: companyId }] });
    }

    const count = await Employee.countDocuments();
    const legacyId = `emp${String(count + 1).padStart(3, '0')}`;

    const newEmp = await Employee.create({
      legacyId,
      name,
      email: email.toLowerCase(),
      position,
      department,
      company: comp ? comp.name : 'Our Company',
      companyId: comp ? comp.legacyId || comp._id.toString() : null,
      avatar: name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase(),
      phone: phone || '',
      address: address || '',
      status: 'active',
    });

    await LeaveBalance.create({
      employeeId: legacyId,
      annual: { total: settings.leaveAllocations?.annual || 15, used: 0 },
      casual: { total: settings.leaveAllocations?.casual || 10, used: 0 },
      personal: { total: settings.leaveAllocations?.personal || 10, used: 0 },
    });

    await syncCompanyEmployeeCounts();

    res.status(201).json({ message: 'Employee created successfully', employee: toEmployeeJSON(newEmp) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const today = getTodayString();
    const employees = await Employee.find();
    const employeesJson = employees.map(toEmployeeJSON);
    const activeEmployees = employeesJson.filter((e) => e.status === 'active');
    const attendanceRecords = await Attendance.find();
    const attJson = attendanceRecords.map(toAttendanceJSON);
    const leaveRequests = await LeaveRequest.find();
    const leavesJson = leaveRequests.map(toLeaveJSON);

    const todayAttendance = getTodayAttendanceForEmployees(activeEmployees, attJson, today);
    const present = todayAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
    const absent = todayAttendance.filter((a) => a.status === 'absent').length;
    const late = todayAttendance.filter((a) => a.status === 'late').length;
    const pendingLeaves = leavesJson.filter((l) => l.status === 'pending');
    const onLeaveToday = activeEmployees.filter((e) =>
      isEmployeeOnLeave(e.id, leavesJson, today)
    ).length;

    res.json({
      todayDate: today,
      todayLabel: formatDisplayDate(),
      employees: employeesJson,
      todayAttendance,
      weeklyAttendanceData: getWeeklyAttendanceData(
        attJson,
        activeEmployees.map((e) => e.id)
      ),
      deptData: getDeptAttendanceData(activeEmployees, todayAttendance),
      leaveCounts: {
        all: leavesJson.length,
        pending: pendingLeaves.length,
        approved: leavesJson.filter((l) => l.status === 'approved').length,
        rejected: leavesJson.filter((l) => l.status === 'rejected').length,
      },
      pendingLeaves,
      stats: {
        totalEmployees: employeesJson.length,
        activeEmployees: activeEmployees.length,
        presentToday: present,
        absentToday: absent,
        lateToday: late,
        onLeaveToday,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const employees = await Employee.find();
    const employeesJson = employees.map(toEmployeeJSON);
    const activeEmployees = employeesJson.filter((e) => e.status === 'active');
    const employeeIds = activeEmployees.map((e) => e.id);
    const today = getTodayString();
    const attendanceRecords = await Attendance.find();
    const attJson = attendanceRecords.map(toAttendanceJSON);
    const leaveRequests = await LeaveRequest.find();
    const leavesJson = leaveRequests.map(toLeaveJSON);

    const todayAttendance = getTodayAttendanceForEmployees(activeEmployees, attJson, today);
    const employeeStats = {};
    activeEmployees.forEach((emp) => {
      employeeStats[emp.id] = computeEmployeeStats(emp.id, attJson);
    });

    const allStats = Object.values(employeeStats);
    const avgAttendance =
      allStats.length > 0
        ? Math.round(allStats.reduce((sum, s) => sum + s.pct, 0) / allStats.length)
        : 0;
    const totalHours = allStats.reduce((sum, s) => sum + s.hours, 0);

    res.json({
      employees: employeesJson,
      leaves: leavesJson,
      todayAttendance,
      weeklyAttendanceData: getWeeklyAttendanceData(attJson, employeeIds),
      leaveTypeData: computeLeaveTypeData(leavesJson),
      monthlyTrend: computeMonthlyTrend(attJson, employeeIds),
      employeeStats,
      summary: {
        totalEmployees: employeesJson.length,
        activeEmployees: activeEmployees.length,
        avgAttendance,
        totalHours,
        leaveDaysUsed: leavesJson
          .filter((l) => l.status === 'approved')
          .reduce((s, l) => s + l.days, 0),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
