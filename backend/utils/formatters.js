/** Shape Mongoose documents for frontend (expects `id` string fields). */
export const toEmployeeJSON = (doc) => {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o.legacyId || o._id?.toString(),
    _id: o._id?.toString(),
    name: o.name,
    email: o.email,
    position: o.position,
    department: o.department,
    company: o.company,
    companyId: o.companyId,
    avatar: o.avatar,
    joinDate: o.joinDate,
    status: o.status,
    phone: o.phone,
    address: o.address,
  };
};

export const toCompanyJSON = (doc) => {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o.legacyId || o._id?.toString(),
    name: o.name,
    industry: o.industry,
    contact: o.contact,
    email: o.email,
    phone: o.phone,
    employeeCount: o.employeeCount,
    status: o.status,
    joinedDate: o.joinedDate,
  };
};

export const toHRJSON = (doc) => {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o.legacyId || o._id?.toString(),
    name: o.name,
    email: o.email,
    department: o.department,
    status: o.status,
  };
};

export const toAttendanceJSON = (doc) => {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id?.toString(),
    employeeId: o.employeeId,
    date: o.date,
    checkIn: o.checkIn,
    checkOut: o.checkOut,
    status: o.status,
    totalHours: o.totalHours,
    breakMinutes: o.breakMinutes,
    extraHours: o.extraHours,
    lessHours: o.lessHours,
    onBreak: o.onBreak,
    breaks: o.breaks,
  };
};

export const toLeaveJSON = (doc) => {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id?.toString(),
    employeeId: o.employeeId,
    employeeName: o.employeeName,
    department: o.department,
    type: o.type,
    startDate: o.startDate,
    endDate: o.endDate,
    days: o.days,
    reason: o.reason,
    status: o.status,
    appliedOn: o.appliedOn,
    hrNote: o.hrNote,
    rejectionReason: o.rejectionReason,
  };
};

export const toLeaveBalanceJSON = (doc) => {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    employeeId: o.employeeId,
    annual: o.annual,
    casual: o.casual,
    personal: o.personal,
  };
};
