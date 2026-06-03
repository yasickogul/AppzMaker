import { useState, useEffect } from 'react';

const BACKEND_URL = 'http://localhost:5001/api';

export function useEmployeeController(userId) {
  // Real HTTP state stores
  const [employee, setEmployee] = useState(null);
  const [balance, setBalance] = useState({
    annual: { total: 15, used: 3 },
    casual: { total: 10, used: 2 },
    personal: { total: 10, used: 0 }
  });
  const [myAttendance, setMyAttendance] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [mySalary, setMySalary] = useState(null);
  const [settings, setSettings] = useState({
    workHours: '8 hours',
    breakTime: '1 hour'
  });

  // Loading state
  const [loading, setLoading] = useState(true);

  // Timers and checkin/checkout states
  const [checkedIn, setCheckedIn] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [sessionSecs, setSessionSecs] = useState(0);
  const [breakSecs, setBreakSecs] = useState(0);
  const [checkInTime, setCheckInTime] = useState(null);
  const [breaks, setBreaks] = useState([]);
  const [currentBreakStart, setCurrentBreakStart] = useState(null);

  // Leave form states
  const [showForm, setShowForm] = useState(false);
  const [leaveFilter, setLeaveFilter] = useState('all');
  const [leaveForm, setLeaveForm] = useState({
    type: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // Attendance history selection state
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  // Load all user profile, leave, and attendance data from backend
  const fetchData = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      // Fetch Employee Profile & Leave Balance
      const empRes = await fetch(`${BACKEND_URL}/employees/${userId}`);
      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployee(empData.employee);
        setBalance(empData.leaveBalance);
        if (empData.settings) {
          setSettings(empData.settings);
        }
      }

      // Fetch Attendance Log
      const attRes = await fetch(`${BACKEND_URL}/employees/${userId}/attendance`);
      if (attRes.ok) {
        const attData = await attRes.json();
        setMyAttendance(attData);

        // Detect if already clocked in today
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRecord = attData.find(a => a.date === todayStr);
        if (todayRecord) {
          setCheckInTime(todayRecord.checkIn);
          setCheckedIn(!!todayRecord.checkIn && !todayRecord.checkOut);
          if (todayRecord.checkIn && !todayRecord.checkOut) {
            const recBreaks = todayRecord.breaks || [];
            const recOnBreak = !!todayRecord.onBreak;
            setBreaks(recBreaks);
            setOnBreak(recOnBreak);

            const now = new Date();
            const nowSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
            const getSecsFromTime = (tStr) => {
              if (!tStr) return 0;
              const parts = tStr.split(':').map(Number);
              const h = parts[0] || 0;
              const m = parts[1] || 0;
              const s = parts[2] || 0;
              return h * 3600 + m * 60 + s;
            };
            const inSecs = getSecsFromTime(todayRecord.checkIn);

            let accumulatedBreakSecs = 0;
            recBreaks.forEach(b => {
              if (b.start && b.end) {
                accumulatedBreakSecs += (getSecsFromTime(b.end) - getSecsFromTime(b.start));
              } else if (b.start && !b.end) {
                accumulatedBreakSecs += (nowSecs - getSecsFromTime(b.start));
              }
            });

            setBreakSecs(Math.max(0, accumulatedBreakSecs));

            // Net work secs = elapsed total secs since check-in minus accumulated break secs
            const totalElapsedSecs = nowSecs - inSecs;
            const netWorkSecs = totalElapsedSecs - accumulatedBreakSecs;
            setSessionSecs(Math.max(0, netWorkSecs));
          }
        }
      }

      // Fetch Leaves
      const leavesRes = await fetch(`${BACKEND_URL}/employees/${userId}/leaves`);
      if (leavesRes.ok) {
        const leavesData = await leavesRes.json();
        setAllLeaves(leavesData);
      }

    } catch (err) {
      console.error('Error fetching employee telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  // Sync timers
  useEffect(() => {
    let interval = null;
    if (checkedIn) {
      interval = setInterval(() => {
        if (onBreak) {
          setBreakSecs(b => b + 1);
        } else {
          setSessionSecs(s => s + 1);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [checkedIn, onBreak]);

  // Helpers
  const formatDuration = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getTimeString = () => {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  // Actions
  const handleCheckIn = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeNow = getTimeString();

    try {
      const res = await fetch(`${BACKEND_URL}/employees/${userId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clock-in', time: timeNow, date: todayStr })
      });
      if (res.ok) {
        setCheckedIn(true);
        setCheckInTime(timeNow);
        setSessionSecs(0);
        setBreakSecs(0);
        setBreaks([]);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckOut = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeNow = getTimeString();

    try {
      const res = await fetch(`${BACKEND_URL}/employees/${userId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'clock-out', 
          time: timeNow, 
          date: todayStr
        })
      });
      if (res.ok) {
        setCheckedIn(false);
        setOnBreak(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBreak = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeNow = getTimeString();
    const newOnBreak = !onBreak;

    try {
      const res = await fetch(`${BACKEND_URL}/employees/${userId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: newOnBreak ? 'start-break' : 'end-break',
          time: timeNow,
          date: todayStr
        })
      });
      if (res.ok) {
        setOnBreak(newOnBreak);
        if (newOnBreak) {
          setCurrentBreakStart(timeNow);
          setBreaks(prev => [...prev, { start: timeNow, end: null }]);
        } else {
          setBreaks(prev => prev.map((b, i) => i === prev.length - 1 ? { ...b, end: timeNow } : b));
          setCurrentBreakStart(null);
        }
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaveSubmit = async (e) => {
    if (e) e.preventDefault();
    const start = new Date(leaveForm.startDate);
    const end = new Date(leaveForm.endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1);

    try {
      const res = await fetch(`${BACKEND_URL}/employees/${userId}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: leaveForm.type,
          startDate: leaveForm.startDate,
          endDate: leaveForm.endDate,
          days,
          reason: leaveForm.reason
        })
      });

      if (res.ok) {
        setLeaveForm({ type: 'annual', startDate: '', endDate: '', reason: '' });
        setShowForm(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculations for profile
  const presentDays = myAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const absentDays = myAttendance.filter(a => a.status === 'absent').length;
  const totalWorkingDays = myAttendance.length;
  const attendancePct = totalWorkingDays > 0 ? Math.round((presentDays / totalWorkingDays) * 100) : 0;
  const monthlyHours = myAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);

  const totalLeaveUsed = (balance.annual?.used || 0) + (balance.casual?.used || 0) + (balance.personal?.used || 0);
  const totalLeave = (balance.annual?.total || 0) + (balance.casual?.total || 0) + (balance.personal?.total || 0);

  // Parse allowed break limits
  let allowedBreakMin = 60;
  if (settings && settings.breakTime) {
    const match = settings.breakTime.match(/(\d+)\s*(hour|minute|min)/i);
    if (match) {
      const val = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      allowedBreakMin = unit.startsWith('hour') ? val * 60 : val;
    }
  }
  const allowedBreakSecs = allowedBreakMin * 60;
  const remainingBreakSecs = Math.max(0, allowedBreakSecs - breakSecs);
  const isBreakOver = breakSecs > allowedBreakSecs;

  // Parse standard target work hours
  let stdHours = 8;
  if (settings && settings.workHours) {
    const match = settings.workHours.match(/(\d+)/);
    if (match) stdHours = parseInt(match[1]);
  }
  const targetWorkSecs = stdHours * 3600 + (breakSecs > allowedBreakSecs ? (breakSecs - allowedBreakSecs) : 0);

  const totalExtraHours = myAttendance.reduce((sum, a) => sum + (a.extraHours || 0), 0);
  const totalLessHours = myAttendance.reduce((sum, a) => sum + (a.lessHours || 0), 0);

  const filteredLeaves = leaveFilter === 'all' ? allLeaves : allLeaves.filter(l => l.status === leaveFilter);
  const filteredAttendance = myAttendance.filter(a => a.date.startsWith(selectedMonth));

  const joinDateSafe = employee ? employee.joinDate : '2023-01-01';
  const yearsTenure = Math.floor((new Date().getTime() - new Date(joinDateSafe).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) || 0;
  const monthsTenure = Math.floor(((new Date().getTime() - new Date(joinDateSafe).getTime()) % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000)) || 0;

  // Use a fallback empty object for loading state
  const currentEmployee = employee || {
    name: 'Sarah Johnson',
    email: 'sarah.j@techventures.com',
    position: 'Senior Developer',
    department: 'Engineering',
    company: 'TechVentures Ltd',
    phone: '+1 (555) 234-5678',
    address: '142 Oak Street, Austin TX 78701',
    avatar: 'SJ'
  };

  return {
    employee: currentEmployee,
    myAttendance,
    balance,
    mySalary,
    checkedIn,
    onBreak,
    sessionSecs,
    breakSecs,
    checkInTime,
    breaks,
    currentBreakStart,
    showForm,
    setShowForm,
    leaveFilter,
    setLeaveFilter,
    leaveForm,
    setLeaveForm,
    selectedMonth,
    setSelectedMonth,
    loading,
    settings,
    allowedBreakSecs,
    remainingBreakSecs,
    isBreakOver,
    targetWorkSecs,
    totalExtraHours,
    totalLessHours,
    
    // Calculated statistics
    presentDays,
    absentDays,
    totalWorkingDays,
    attendancePct,
    monthlyHours,
    totalLeaveUsed,
    totalLeave,
    filteredLeaves,
    filteredAttendance,
    yearsTenure,
    monthsTenure,
    
    // Formatting & actions
    formatDuration,
    handleCheckIn,
    handleCheckOut,
    handleBreak,
    handleLeaveSubmit
  };
}
