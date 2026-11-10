import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true },
    brand: { type: String, default: 'CUP2EAT' },
    phone: String,
    whatsapp: String,
    instagram: String,
    email: String,
    address: String,
    fssaiNo: String,
    founder: String,
    followers: Number,
  },
  { timestamps: true }
);

export default mongoose.model('Setting', settingSchema);
