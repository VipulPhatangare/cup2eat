import { z } from 'zod';
import Review from '../../models/Review.js';
import { audit, escapeRegex, pageParams, removeUpload, httpError } from '../../lib/helpers.js';

const id24 = z.string().regex(/^[a-f\d]{24}$/i);

export const patchBody = z
  .object({
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    featured: z.boolean().optional(),
    reply: z.string().trim().max(400, 'Max 400 characters').optional(),
    rejectReason: z.string().trim().max(200).optional(),
  })
  .strict();

export const bulkBody = z.object({ ids: z.array(id24).min(1).max(100), action: z.enum(['approve', 'reject']) });

export async function list(req, res) {
  const { page, size, skip } = pageParams(req.query);
  const filter = {};
  if (['pending', 'approved', 'rejected'].includes(req.query.status)) filter.status = req.query.status;
  const q = String(req.query.q || '').trim().slice(0, 60);
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { city: rx }, { text: rx }];
  }
  const [items, total, counts] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(size).populate('product', 'name capacityMl').select('-__v'),
    Review.countDocuments(filter),
    Review.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
  ]);
  const tabs = { pending: 0, approved: 0, rejected: 0 };
  counts.forEach((c) => { tabs[c._id] = c.n; });
  res.json({ items, total, page, pages: Math.ceil(total / size), counts: tabs });
}

export async function patch(req, res) {
  const review = await Review.findById(req.params.id);
  if (!review) throw httpError(404, 'Review not found.');
  const { status, featured, reply, rejectReason } = req.valid;
  const did = [];

  if (status && status !== review.status) {
    review.status = status;
    review.moderatedBy = req.admin.name;
    review.moderatedAt = new Date();
    if (status !== 'rejected') review.rejectReason = undefined;
    did.push(status);
  }
  if (rejectReason !== undefined) review.rejectReason = rejectReason || undefined;
  if (featured !== undefined && featured !== review.featured) {
    review.featured = featured;
    did.push(featured ? 'featured' : 'unfeatured');
  }
  if (reply !== undefined) {
    review.reply = reply || undefined;
    review.repliedAt = reply ? new Date() : undefined;
    did.push(reply ? 'replied' : 'reply removed');
  }
  await review.save();
  if (did.length) await audit(req, 'review.update', `${review.name} (${review.rating}★)`, did.join(', '));
  res.json(await review.populate('product', 'name capacityMl'));
}

export async function bulk(req, res) {
  const { ids, action } = req.valid;
  const status = action === 'approve' ? 'approved' : 'rejected';
  const r = await Review.updateMany({ _id: { $in: ids } }, { $set: { status, moderatedBy: req.admin.name, moderatedAt: new Date() } });
  await audit(req, `review.bulk_${action}`, `${r.modifiedCount} reviews`);
  res.json({ modified: r.modifiedCount });
}

export async function remove(req, res) {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw httpError(404, 'Review not found.');
  await Promise.all((review.photos || []).map((p) => removeUpload(p, ['reviews'])));
  await audit(req, 'review.delete', `${review.name} (${review.rating}★)`, `${review.photos?.length || 0} photos removed`);
  res.json({ ok: true });
}
