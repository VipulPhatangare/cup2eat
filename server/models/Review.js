import mongoose from 'mongoose';

export const CUSTOMER_TYPES = ['Cafe', 'Event', 'Corporate', 'College', 'Personal'];

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    city: { type: String, trim: true, maxlength: 60 },
    customerType: { type: String, enum: CUSTOMER_TYPES, default: 'Personal' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    flavour: { type: String, trim: true, maxlength: 30 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true, maxlength: 600 },
    photos: [String],
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    featured: { type: Boolean, default: false },
    // set from the admin panel
    reply: { type: String, trim: true, maxlength: 400 },
    repliedAt: Date,
    rejectReason: { type: String, trim: true, maxlength: 200 },
    moderatedBy: String,
    moderatedAt: Date,
  },
  { timestamps: true }
);

reviewSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);
