import mongoose from 'mongoose';

export const BUSINESS_TYPES = ['Cafe', 'Restaurant', 'Event', 'Corporate', 'College', 'Other'];

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, match: /^[6-9]\d{9}$/ },
    email: { type: String, trim: true, lowercase: true },
    city: { type: String, trim: true, maxlength: 60 },
    businessType: { type: String, enum: BUSINESS_TYPES, default: 'Other' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, min: 1 },
    message: { type: String, trim: true, maxlength: 800 },
    source: { type: String, enum: ['form', 'calculator'], default: 'form' },
    status: { type: String, enum: ['new', 'contacted', 'converted', 'closed'], default: 'new' },
    // set from the admin panel
    notes: [{ text: { type: String, maxlength: 500 }, by: String, at: { type: Date, default: Date.now }, _id: false }],
    followUpAt: Date,
    lastContactedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Enquiry', enquirySchema);
