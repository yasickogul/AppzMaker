import LeaveBalance from '../models/LeaveBalance.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Attendance from '../models/Attendance.js';
import Company from '../models/Company.js';
import { findEmployee, getEmployeeLegacyId } from '../utils/entityLookup.js';
import { toEmployeeJSON, toAttendanceJSON, toLeaveJSON, toLeaveBalanceJSON } from '../utils/formatters.js';
import { getSettings } from '../services/settingsService.js';
import { syncCompanyEmployeeCounts } from '../services/companyService.js';
import { getSecsFromTime, finalizeClockOut } from '../utils/attendanceMath.js';

export const getProfile = async (req, res) => {
  try {
    const emp = await findEmployee(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const empId = getEmployeeLegacyId(emp);
    let balance = await LeaveBalance.findOne({ employeeId: empId });
    const settings = await getSettings();

    if (!balance) {
      balance = await LeaveBalance.create({
        employeeId: empId,
        annual: { total: settings.leaveAllocations?.annual || 15, used: 0 },
        casual: { total: settings.leaveAllocations?.casual || 10, used: 0 },
        personal: { total: settings.leaveAllocations?.personal || 10, used: 0 },
      });
    }

    res.json({
      employee: toEmployeeJSON(emp),
      leaveBalance: toLeaveBalanceJSON(balance),
      settings,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const emp = await findEmployee(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const records = await Attendance.find({ employeeId: getEmployeeLegacyId(emp) }).sort({ date: -1 });
    res.json(records.map(toAttendanceJSON));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logAttendance = async (req, res) => {
  try {
    const { action, time, date } = req.body;
    const emp = await findEmployee(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const empId = getEmployeeLegacyId(emp);
    const settings = await getSettings();

    let todayRecord = await Attendance.findOne({ employeeId: empId, date });

    if (action === 'clock-in') {
      if (todayRecord) return res.status(400).json({ error: 'Already clocked in today' });

      todayRecord = await Attendance.create({
        employeeId: empId,
        date,
        checkIn: time,
        checkOut: null,
        status: 'present',
        totalHours: 0,
        breakMinutes: 0,
        onBreak: false,
        breaks: [],
        extraHours: 0,
        lessHours: 0,
      });
    } else if (action === 'start-break') {
      if (!todayRecord) return res.status(400).json({ error: 'Not clocked in today' });
      todayRecord.onBreak = true;
      if (!todayRecord.breaks) todayRecord.breaks = [];
      todayRecord.breaks.push({ start: time, end: null });
      await todayRecord.save();
    } else if (action === 'end-break') {
      if (!todayRecord) return res.status(400).json({ error: 'Not clocked in today' });
      todayRecord.onBreak = false;
      if (!todayRecord.breaks) todayRecord.breaks = [];
      const activeBreak = todayRecord.breaks.find((b) => !b.end);
      if (activeBreak) activeBreak.end = time;

      let totalBreakSecs = 0;
      todayRecord.breaks.forEach((b) => {
        if (b.start && b.end) {
          totalBreakSecs += getSecsFromTime(b.end) - getSecsFromTime(b.start);
        }
      });
      todayRecord.breakMinutes = Math.round(totalBreakSecs / 60);
      await todayRecord.save();
    } else if (action === 'clock-out') {
      if (!todayRecord) return res.status(400).json({ error: 'Not clocked in today' });

      if (todayRecord.onBreak) {
        todayRecord.onBreak = false;
        const activeBreak = todayRecord.breaks?.find((b) => !b.end);
        if (activeBreak) activeBreak.end = time;
      }

      finalizeClockOut(todayRecord, time, settings);
      await todayRecord.save();
    }

    res.json({ message: `Successfully executed ${action}`, record: toAttendanceJSON(todayRecord) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLeaves = async (req, res) => {
  try {
    const emp = await findEmployee(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const leaves = await LeaveRequest.find({ employeeId: getEmployeeLegacyId(emp) }).sort({ createdAt: -1 });
    res.json(leaves.map(toLeaveJSON));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createLeaveRequest = async (req, res) => {
  try {
    const emp = await findEmployee(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const { type, startDate, endDate, days, reason } = req.body;
    const empId = getEmployeeLegacyId(emp);

    const newLeave = await LeaveRequest.create({
      employeeId: empId,
      employeeName: emp.name,
      department: emp.department,
      type,
      startDate,
      endDate,
      days: Number(days),
      reason,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
    });

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leave: toLeaveJSON(newLeave),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateClient = async (req, res) => {
  try {
    const emp = await findEmployee(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const { clientId } = req.body;
    if (!clientId || clientId === 'unassigned' || clientId === 'Unassigned' || clientId === 'Our Company') {
      emp.companyId = null;
      emp.company = 'Our Company';
    } else {
      const comp = await Company.findOne({
        $or: [{ legacyId: clientId }, { _id: clientId }],
      });
      if (!comp) return res.status(404).json({ error: 'Client not found' });
      emp.companyId = comp.legacyId || comp._id.toString();
      emp.company = comp.name;
    }
    await emp.save();
    await syncCompanyEmployeeCounts();

    res.json({ message: 'Employee client updated successfully', employee: toEmployeeJSON(emp) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
