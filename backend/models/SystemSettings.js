import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'default', unique: true },
    workHours: { type: String, default: '8 hours' },
    breakTime: { type: String, default: '1 hour' },
    lateThreshold: { type: String, default: '15 minutes' },
    overtimeRate: { type: String, default: '1.5x' },
    sessionTimeout: { type: String, default: '30 minutes' },
    backupSchedule: { type: String, default: 'Daily at 2 AM' },
    leaveAllocations: {
      annual: { type: Number, default: 15 },
      casual: { type: Number, default: 10 },
      personal: { type: Number, default: 10 },
    },
  },
  { timestamps: true }
);

export default mongoose.model('SystemSettings', systemSettingsSchema);
