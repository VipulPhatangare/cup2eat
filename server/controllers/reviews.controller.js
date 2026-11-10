import { z } from 'zod';
import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import Review, { CUSTOMER_TYPES } from '../models/Review.js';
import { REVIEW_DIR } from '../middleware/upload.js';

export const listQuery = z.object({
  product: z.string().regex(/^[a-f\d]{24}$/i).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  page: z.coerce.number().int().min(1).default(1),
});

export const createBody = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(60),
  city: z.string().trim().max(60).optional().default(''),
  customerType: z.enum(CUSTOMER_TYPES).default('Personal'),
  product: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid product').optional().or(z.literal('')),
  flavour: z.string().trim().max(30).optional().default(''),
  rating: z.coerce.number().int('Pick a star rating').min(1, 'Pick a star rating').max(5),
  text: z.string().trim().min(10, 'Please write at least 10 characters').max(600, 'Max 600 characters'),
});

export async function listReviews(req, res) {
  const { product, limit, page } = req.valid;
  const filter = { status: 'approved' };
  if (product) filter.product = product;
  const [items, total] = await Promise.all([
    Review.find(filter)
      .sort({ featured: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('name city customerType product flavour rating text photos featured reply repliedAt createdAt')
      .populate('product', 'name capacityMl'),
    Review.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
}

export async function reviewStats(req, res) {
  const match = { status: 'approved' };
  if (req.query.product && mongoose.isValidObjectId(req.query.product)) {
    match.product = new mongoose.Types.ObjectId(req.query.product);
  }
  const rows = await Review.aggregate([
    { $match: match },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
  ]);
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  let sum = 0;
  for (const r of rows) {
    breakdown[r._id] = r.count;
    total += r.count;
    sum += r._id * r.count;
  }
  res.json({ total, average: total ? Math.round((sum / total) * 10) / 10 : 0, breakdown });
}

export async function createReview(req, res) {
  const data = req.valid;
  const photos = (req.files || []).map((f) => `/uploads/reviews/${f.filename}`);
  const doc = { ...data, photos, status: 'pending' };
  if (!doc.product) delete doc.product;
  try {
    await Review.create(doc);
  } catch (err) {
    // don't leave orphan files if the DB write fails
    await Promise.all((req.files || []).map((f) => fs.unlink(path.join(REVIEW_DIR, f.filename)).catch(() => {})));
    throw err;
  }
  res.status(201).json({ message: 'Thank you! Your review will appear after approval.' });
}
