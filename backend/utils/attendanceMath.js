export const getSecsFromTime = (tStr) => {
  if (!tStr) return 0;
  const parts = tStr.split(':').map(Number);
  const h = parts[0] || 0;
  const m = parts[1] || 0;
  const s = parts[2] || 0;
  return h * 3600 + m * 60 + s;
};

export const parseBreakMinutes = (breakTime) => {
  let allowedBreakMin = 60;
  if (breakTime) {
    const match = breakTime.match(/(\d+)\s*(hour|minute|min)/i);
    if (match) {
      const val = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      allowedBreakMin = unit.startsWith('hour') ? val * 60 : val;
    }
  }
  return allowedBreakMin;
};

export const parseStdHours = (workHours) => {
  if (workHours) {
    const match = workHours.match(/(\d+)/);
    if (match) return parseInt(match[1], 10);
  }
  return 8;
};

export const finalizeClockOut = (record, checkOutTime, systemSettings) => {
  let totalBreakSecs = 0;
  if (record.breaks) {
    record.breaks.forEach((b) => {
      if (b.start && b.end) {
        totalBreakSecs += getSecsFromTime(b.end) - getSecsFromTime(b.start);
      }
    });
  }

  const actualBreakMin = Math.round(totalBreakSecs / 60);
  record.breakMinutes = actualBreakMin;
  record.checkOut = checkOutTime;

  const inSecs = getSecsFromTime(record.checkIn);
  const outSecs = getSecsFromTime(checkOutTime);
  const allowedBreakMin = parseBreakMinutes(systemSettings.breakTime);
  const stdHours = parseStdHours(systemSettings.workHours);

  let elapsedHrs = (outSecs - inSecs) / 3600;
  let totalHr = elapsedHrs - totalBreakSecs / 3600;
  totalHr = Math.max(0, Math.round(totalHr * 100) / 100);
  record.totalHours = totalHr;

  let targetHours = stdHours;
  if (actualBreakMin > allowedBreakMin) {
    targetHours += (actualBreakMin - allowedBreakMin) / 60;
  }

  if (totalHr > targetHours) {
    record.extraHours = Math.round((totalHr - targetHours) * 100) / 100;
    record.lessHours = 0;
  } else {
    record.extraHours = 0;
    record.lessHours = Math.round((targetHours - totalHr) * 100) / 100;
  }
};
