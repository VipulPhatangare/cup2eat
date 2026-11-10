import mongoose from 'mongoose';

// who changed what, and when
const auditSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    adminName: String,
    action: { type: String, required: true }, // e.g. review.approve, product.update
    target: String, // short label of the thing that was changed
    detail: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditSchema.index({ createdAt: -1 });

export default mongoose.model('AuditLog', auditSchema);
