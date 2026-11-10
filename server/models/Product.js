import mongoose from 'mongoose';

const packSchema = new mongoose.Schema(
  { cups: { type: Number, min: 1 }, price: { type: Number, min: 0 } },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    tagline: String,
    capacityMl: { type: Number, required: true },
    usage: [String],
    flavours: [String],
    features: [String],
    wholesale: packSchema,
    retail: packSchema, // left empty until real retail prices are confirmed
    deliveryIncluded: { type: Boolean, default: true },
    image: String,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

productSchema.virtual('pricePerCup').get(function () {
  if (!this.wholesale?.cups) return null;
  return Math.round((this.wholesale.price / this.wholesale.cups) * 100) / 100;
});

export default mongoose.model('Product', productSchema);
