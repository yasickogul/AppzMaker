import Company from '../models/Company.js';
import HRUser from '../models/HRUser.js';
import Employee from '../models/Employee.js';
import LeaveRequest from '../models/LeaveRequest.js';
import LeaveBalance from '../models/LeaveBalance.js';
import Attendance from '../models/Attendance.js';
import { getTodayString } from '../utils/helpers.js';
import { findEmployee, findHRUser, findCompany, findLeave } from '../utils/entityLookup.js';
import { toCompanyJSON, toHRJSON, toEmployeeJSON, toLeaveJSON } from '../utils/formatters.js';
import {
  getSettings as fetchSystemSettings,
  updateSettings as updateSettingsDoc,
} from '../services/settingsService.js';
import { syncCompanyEmployeeCounts } from '../services/companyService.js';

export const getDashboard = async (req, res) => {
  try {
    await syncCompanyEmployeeCounts();
    const today = getTodayString();
    const companies = (await Company.find()).map(toCompanyJSON);
    const hrUsers = (await HRUser.find()).map(toHRJSON);
    const employees = (await Employee.find()).map(toEmployeeJSON);
    const pendingLeaves = (await LeaveRequest.find({ status: 'pending' })).map(toLeaveJSON);
    const activeEmployees = employees.filter((e) => e.status === 'active');
    const todayAttendanceRecords = await Attendance.countDocuments({ date: today });

    res.json({
      companies,
      hrUsers,
      employees,
      stats: {
        totalCompanies: companies.length,
        activeCompanies: companies.filter((c) => c.status === 'active').length,
        totalEmployees: employees.length,
        activeEmployees: activeEmployees.length,
        totalHR: hrUsers.length,
        activeHR: hrUsers.filter((h) => h.status === 'active').length,
        pendingLeaveApprovals: pendingLeaves.length,
        todayAttendanceRecords,
      },
      pendingLeaves,
      leaveCounts: {
        pending: pendingLeaves.length,
        approved: await LeaveRequest.countDocuments({ status: 'approved' }),
        rejected: await LeaveRequest.countDocuments({ status: 'rejected' }),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

export const createHR = async (req, res) => {
  try {
    const { name, email, department } = req.body;
    const count = await HRUser.countDocuments();
    const newHr = await HRUser.create({
      legacyId: `hr${String(count + 1).padStart(3, '0')}`,
      name,
      email: email.toLowerCase(),
      department: department || 'Human Resources',
      status: 'active',
    });
    res.status(201).json(toHRJSON(newHr));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createCompany = async (req, res) => {
  try {
    const { name, industry, contact, email, phone } = req.body;
    const count = await Company.countDocuments();
    const newComp = await Company.create({
      legacyId: `co${String(count + 1).padStart(3, '0')}`,
      name,
      industry,
      contact,
      email: email.toLowerCase(),
      phone,
      employeeCount: 0,
      status: 'active',
      joinedDate: getTodayString(),
    });
    res.status(201).json(toCompanyJSON(newComp));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const emp = await findEmployee(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const empId = emp.legacyId || emp._id.toString();
    await Employee.deleteOne({ _id: emp._id });
    await LeaveBalance.deleteOne({ employeeId: empId });
    await LeaveRequest.deleteMany({ employeeId: empId });
    await Attendance.deleteMany({ employeeId: empId });
    await syncCompanyEmployeeCounts();

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteHR = async (req, res) => {
  try {
    const hr = await findHRUser(req.params.id);
    if (!hr) return res.status(404).json({ error: 'HR user not found' });
    await HRUser.deleteOne({ _id: hr._id });
    res.json({ message: 'HR user deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const comp = await findCompany(req.params.id);
    if (!comp) return res.status(404).json({ error: 'Company not found' });

    const cid = comp.legacyId || comp._id.toString();
    await Employee.updateMany({ companyId: cid }, { companyId: null, company: 'Our Company' });
    await Company.deleteOne({ _id: comp._id });
    await syncCompanyEmployeeCounts();

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSettings = async (req, res) => {
  try {
    res.json(await fetchSystemSettings());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const newSettings = req.body;
    const current = await fetchSystemSettings();
    const merged = { ...current };

    Object.keys(newSettings).forEach((key) => {
      if (key !== 'leaveAllocations') {
        merged[key] = newSettings[key];
      }
    });

    if (newSettings.leaveAllocations) {
      merged.leaveAllocations = {
        ...merged.leaveAllocations,
        ...newSettings.leaveAllocations,
      };

      const annualTotal = Number(merged.leaveAllocations.annual);
      const casualTotal = Number(merged.leaveAllocations.casual);
      const personalTotal = Number(merged.leaveAllocations.personal);

      const balances = await LeaveBalance.find();
      for (const balance of balances) {
        balance.annual.total = annualTotal;
        balance.casual.total = casualTotal;
        balance.personal.total = personalTotal;
        await balance.save();
      }
    }

    const settings = await updateSettingsDoc(merged);
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
