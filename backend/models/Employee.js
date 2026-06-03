import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    legacyId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    position: { type: String, default: '' },
    department: { type: String, default: '' },
    company: { type: String, default: 'Our Company' },
    companyId: { type: String, default: null },
    avatar: { type: String, default: '' },
    joinDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Employee', employeeSchema);
