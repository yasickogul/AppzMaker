import { 
  employees, 
  attendanceRecords, 
  leaveRequests, 
  leaveBalances,
  systemSettings,
  hiringCompanies
} from '../models/store.js';

export const getProfile = (req, res) => {
  const emp = employees.find(e => e.id === req.params.id);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  
  const balance = leaveBalances.find(b => b.employeeId === emp.id) || {
    annual: { total: parseInt(systemSettings.leaveAllocations.annual) || 15, used: 0 },
    casual: { total: parseInt(systemSettings.leaveAllocations.casual) || 10, used: 0 },
    personal: { total: parseInt(systemSettings.leaveAllocations.personal) || 10, used: 0 }
  };

  res.json({ employee: emp, leaveBalance: balance, settings: systemSettings });
};

export const getAttendance = (req, res) => {
  const records = attendanceRecords.filter(r => r.employeeId === req.params.id);
  res.json(records);
};

export const logAttendance = (req, res) => {
  const { action, time, date } = req.body;
  const empId = req.params.id;

  let todayRecord = attendanceRecords.find(r => r.employeeId === empId && r.date === date);

  const getSecsFromTime = (tStr) => {
    if (!tStr) return 0;
    const parts = tStr.split(':').map(Number);
    const h = parts[0] || 0;
    const m = parts[1] || 0;
    const s = parts[2] || 0;
    return h * 3600 + m * 60 + s;
  };

  if (action === 'clock-in') {
    if (todayRecord) return res.status(400).json({ error: 'Already clocked in today' });
    
    todayRecord = {
      id: `att${String(attendanceRecords.length + 1).padStart(3, '0')}`,
      employeeId: empId,
      date,
      checkIn: time,
      checkOut: null,
      status: 'present',
      totalHours: 0,
      breakMinutes: 0,
      onBreak: false,
      breaks: [],
      overtime: 0
    };
    attendanceRecords.push(todayRecord);
  } else if (action === 'start-break') {
    if (!todayRecord) return res.status(400).json({ error: 'Not clocked in today' });
    todayRecord.onBreak = true;
    if (!todayRecord.breaks) todayRecord.breaks = [];
    todayRecord.breaks.push({ start: time, end: null });
  } else if (action === 'end-break') {
    if (!todayRecord) return res.status(400).json({ error: 'Not clocked in today' });
    todayRecord.onBreak = false;
    if (!todayRecord.breaks) todayRecord.breaks = [];
    const activeBreak = todayRecord.breaks.find(b => !b.end);
    if (activeBreak) {
      activeBreak.end = time;
    }
    
    // Recalculate breakMinutes
    let totalBreakSecs = 0;
    todayRecord.breaks.forEach(b => {
      if (b.start && b.end) {
        totalBreakSecs += (getSecsFromTime(b.end) - getSecsFromTime(b.start));
      }
    });
    todayRecord.breakMinutes = Math.round(totalBreakSecs / 60);
  } else if (action === 'clock-out') {
    if (!todayRecord) return res.status(400).json({ error: 'Not clocked in today' });
    
    todayRecord.checkOut = time;
    if (todayRecord.onBreak) {
      todayRecord.onBreak = false;
      const activeBreak = todayRecord.breaks.find(b => !b.end);
      if (activeBreak) {
        activeBreak.end = time;
      }
    }

    // Recalculate breakMinutes
    let totalBreakSecs = 0;
    if (todayRecord.breaks) {
      todayRecord.breaks.forEach(b => {
        if (b.start && b.end) {
          totalBreakSecs += (getSecsFromTime(b.end) - getSecsFromTime(b.start));
        }
      });
    }
    
    const actualBreakMin = Math.round(totalBreakSecs / 60);
    todayRecord.breakMinutes = actualBreakMin;

    const inSecs = getSecsFromTime(todayRecord.checkIn);
    const outSecs = getSecsFromTime(time);
    
    // Parse allowed break minutes
    let allowedBreakMin = 60;
    if (systemSettings.breakTime) {
      const match = systemSettings.breakTime.match(/(\d+)\s*(hour|minute|min)/i);
      if (match) {
        const val = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        allowedBreakMin = unit.startsWith('hour') ? val * 60 : val;
      }
    }

    // Parse standard work hours
    let stdHours = 8;
    if (systemSettings.workHours) {
      const match = systemSettings.workHours.match(/(\d+)/);
      if (match) {
        stdHours = parseInt(match[1]);
      }
    }

    // Elapsed hours
    let elapsedHrs = (outSecs - inSecs) / 3600;

    // Actual worked hours = elapsed hours - actual break hours
    let totalHr = elapsedHrs - (totalBreakSecs / 3600);
    totalHr = Math.max(0, Math.round(totalHr * 100) / 100);
    todayRecord.totalHours = totalHr;

    // Increase target hours if actual break is over limit
    let targetHours = stdHours;
    if (actualBreakMin > allowedBreakMin) {
      const extraBreakHrs = (actualBreakMin - allowedBreakMin) / 60;
      targetHours += extraBreakHrs;
    }

    if (totalHr > targetHours) {
      todayRecord.extraHours = Math.round((totalHr - targetHours) * 100) / 100;
      todayRecord.lessHours = 0;
    } else {
      todayRecord.extraHours = 0;
      todayRecord.lessHours = Math.round((targetHours - totalHr) * 100) / 100;
    }
  }

  res.json({ message: `Successfully executed ${action}`, record: todayRecord });
};

export const getLeaves = (req, res) => {
  const leaves = leaveRequests.filter(l => l.employeeId === req.params.id);
  res.json(leaves);
};

export const createLeaveRequest = (req, res) => {
  const emp = employees.find(e => e.id === req.params.id);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  const { type, startDate, endDate, days, reason } = req.body;
  const newLeave = {
    id: `lv${String(leaveRequests.length + 1).padStart(3, '0')}`,
    employeeId: emp.id,
    employeeName: emp.name,
    department: emp.department,
    type,
    startDate,
    endDate,
    days: Number(days),
    reason,
    status: 'pending',
    appliedOn: new Date().toISOString().split('T')[0]
  };

  leaveRequests.push(newLeave);

  // Update used balance locally
  const balance = leaveBalances.find(b => b.employeeId === emp.id);
  if (balance && balance[type]) {
    balance[type].used += Number(days);
  }

  res.json({ message: 'Leave request submitted successfully', leave: newLeave });
};

export const updateClient = (req, res) => {
  const emp = employees.find(e => e.id === req.params.id);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  const { clientId } = req.body;
  if (!clientId || clientId === 'unassigned' || clientId === 'Unassigned' || clientId === 'Our Company') {
    emp.companyId = null;
    emp.company = 'Our Company';
  } else {
    const comp = hiringCompanies.find(c => c.id === clientId);
    if (!comp) return res.status(404).json({ error: 'Client not found' });
    emp.companyId = comp.id;
    emp.company = comp.name;
  }
  res.json({ message: 'Employee client updated successfully', employee: emp });
};
