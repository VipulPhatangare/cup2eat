import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    place: String,
    image: { type: String, required: true },
    category: { type: String, enum: ['Event', 'Cafe', 'College', 'Product'], default: 'Event' },
    date: Date,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('GalleryItem', gallerySchema);
