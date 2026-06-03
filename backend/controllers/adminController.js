import {
  hiringCompanies,
  hrUsers,
  employees,
  systemSettings,
  leaveBalances,
  leaveRequests,
  attendanceRecords,
} from '../models/store.js';
import { getTodayString, syncCompanyEmployeeCounts } from '../utils/helpers.js';

export const getDashboard = (req, res) => {
  syncCompanyEmployeeCounts(hiringCompanies, employees);
  const today = getTodayString();
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'pending');
  const activeEmployees = employees.filter((e) => e.status === 'active');

  res.json({
    companies: hiringCompanies,
    hrUsers,
    employees,
    stats: {
      totalCompanies: hiringCompanies.length,
      activeCompanies: hiringCompanies.filter((c) => c.status === 'active').length,
      totalEmployees: employees.length,
      activeEmployees: activeEmployees.length,
      totalHR: hrUsers.length,
      activeHR: hrUsers.filter((h) => h.status === 'active').length,
      pendingLeaveApprovals: pendingLeaves.length,
      todayAttendanceRecords: attendanceRecords.filter((r) => r.date === today).length,
    },
    pendingLeaves,
    leaveCounts: {
      pending: pendingLeaves.length,
      approved: leaveRequests.filter((l) => l.status === 'approved').length,
      rejected: leaveRequests.filter((l) => l.status === 'rejected').length,
    },
  });
};

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
  if (balance && balance[leave.type] && status === 'approved') {
    balance[leave.type].used += leave.days;
  }

  res.json({ message: `Leave request ${status} successfully`, leave });
};

export const createHR = (req, res) => {
  const { name, email, department } = req.body;
  const newHr = {
    id: `hr${String(hrUsers.length + 1).padStart(3, '0')}`,
    name,
    email,
    department: department || 'Human Resources',
    status: 'active',
  };
  hrUsers.push(newHr);
  res.json(newHr);
};

export const createCompany = (req, res) => {
  const { name, industry, contact, email, phone } = req.body;
  const newComp = {
    id: `co${String(hiringCompanies.length + 1).padStart(3, '0')}`,
    name,
    industry,
    contact,
    email,
    phone,
    employeeCount: 0,
    status: 'active',
    joinedDate: getTodayString(),
  };
  hiringCompanies.push(newComp);
  res.json(newComp);
};

export const deleteEmployee = (req, res) => {
  const idx = employees.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Employee not found' });

  employees.splice(idx, 1);
  syncCompanyEmployeeCounts(hiringCompanies, employees);

  const balanceIdx = leaveBalances.findIndex((b) => b.employeeId === req.params.id);
  if (balanceIdx !== -1) leaveBalances.splice(balanceIdx, 1);

  for (let i = leaveRequests.length - 1; i >= 0; i -= 1) {
    if (leaveRequests[i].employeeId === req.params.id) leaveRequests.splice(i, 1);
  }

  for (let i = attendanceRecords.length - 1; i >= 0; i -= 1) {
    if (attendanceRecords[i].employeeId === req.params.id) attendanceRecords.splice(i, 1);
  }

  res.json({ message: 'Employee deleted successfully' });
};

export const deleteHR = (req, res) => {
  const idx = hrUsers.findIndex((h) => h.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'HR user not found' });
  hrUsers.splice(idx, 1);
  res.json({ message: 'HR user deleted successfully' });
};

export const deleteCompany = (req, res) => {
  const idx = hiringCompanies.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Company not found' });

  employees.forEach((emp) => {
    if (emp.companyId === req.params.id) {
      emp.companyId = null;
      emp.company = 'Our Company';
    }
  });

  hiringCompanies.splice(idx, 1);
  syncCompanyEmployeeCounts(hiringCompanies, employees);
  res.json({ message: 'Company deleted successfully' });
};

export const getSettings = (req, res) => {
  res.json(systemSettings);
};

export const updateSettings = (req, res) => {
  const newSettings = req.body;

  Object.keys(newSettings).forEach((key) => {
    if (key !== 'leaveAllocations') {
      systemSettings[key] = newSettings[key];
    }
  });

  if (newSettings.leaveAllocations) {
    const prevAllocations = systemSettings.leaveAllocations;
    systemSettings.leaveAllocations = {
      ...prevAllocations,
      ...newSettings.leaveAllocations,
    };

    const annualTotal = Number(systemSettings.leaveAllocations.annual);
    const casualTotal = Number(systemSettings.leaveAllocations.casual);
    const personalTotal = Number(systemSettings.leaveAllocations.personal);

    leaveBalances.forEach((balance) => {
      if (balance.annual) balance.annual.total = annualTotal;
      else balance.annual = { total: annualTotal, used: 0 };

      if (balance.casual) balance.casual.total = casualTotal;
      else balance.casual = { total: casualTotal, used: 0 };

      if (balance.personal) balance.personal.total = personalTotal;
      else balance.personal = { total: personalTotal, used: 0 };

      delete balance.sick;
      delete balance.emergency;
    });
  }

  res.json({ message: 'Settings updated successfully', settings: systemSettings });
};
