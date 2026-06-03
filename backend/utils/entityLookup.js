import mongoose from 'mongoose';
import Employee from '../models/Employee.js';
import Company from '../models/Company.js';
import HRUser from '../models/HRUser.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Attendance from '../models/Attendance.js';

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);

export const findEmployee = async (id) => {
  if (!id) return null;
  if (isObjectId(id)) return Employee.findById(id);
  return Employee.findOne({ legacyId: id });
};

export const findCompany = async (id) => {
  if (!id) return null;
  if (isObjectId(id)) return Company.findById(id);
  return Company.findOne({ legacyId: id });
};

export const findHRUser = async (id) => {
  if (!id) return null;
  if (isObjectId(id)) return HRUser.findById(id);
  return HRUser.findOne({ legacyId: id });
};

export const findLeave = async (id) => {
  if (!id) return null;
  return LeaveRequest.findById(id);
};

export const getEmployeeLegacyId = (emp) => emp?.legacyId || emp?._id?.toString();

export const getCompanyLegacyId = (co) => co?.legacyId || co?._id?.toString();
