import mongoose from 'mongoose';

const breakSchema = new mongoose.Schema(
  { start: String, end: String },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    checkIn: { type: String, default: null },
    checkOut: { type: String, default: null },
    status: {
      type: String,
      enum: ['present', 'late', 'absent', 'half-day'],
      default: 'present',
    },
    totalHours: { type: Number, default: 0 },
    breakMinutes: { type: Number, default: 0 },
    extraHours: { type: Number, default: 0 },
    lessHours: { type: Number, default: 0 },
    onBreak: { type: Boolean, default: false },
    breaks: [breakSchema],
  },
  { timestamps: true }
);

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
