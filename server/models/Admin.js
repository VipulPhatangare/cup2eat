import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, trim: true, default: 'Admin' },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['owner', 'staff'], default: 'owner' },
    lastLoginAt: Date,
    failedAttempts: { type: Number, default: 0 },
    lockedUntil: Date,
    // tokens issued before this moment are rejected (set when the password changes)
    passwordChangedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Admin', adminSchema);
