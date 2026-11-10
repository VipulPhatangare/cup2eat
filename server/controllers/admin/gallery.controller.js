import { z } from 'zod';
import GalleryItem from '../../models/GalleryItem.js';
import { audit, saveImage, removeUpload, httpError } from '../../lib/helpers.js';

const fields = z.object({
  title: z.string().trim().min(2, 'Enter a title').max(80),
  place: z.string().trim().max(100).optional().default(''),
  category: z.enum(['Event', 'Cafe', 'College', 'Product']).default('Event'),
});
export const createBody = fields;
export const patchBody = fields.partial().strict();
export const reorderBody = z.object({ ids: z.array(z.string().regex(/^[a-f\d]{24}$/i)).min(1).max(200) });

export async function list(req, res) {
  res.json(await GalleryItem.find().sort({ order: 1, createdAt: 1 }));
}

export async function create(req, res) {
  if (!req.file) throw httpError(400, 'Choose a photo first.');
  const image = await saveImage(req.file.buffer, 'gallery', 1600);
  const last = await GalleryItem.findOne().sort({ order: -1 });
  const item = await GalleryItem.create({ ...req.valid, image, order: (last?.order || 0) + 1 });
  await audit(req, 'gallery.add', item.title);
  res.status(201).json(item);
}

export async function update(req, res) {
  const item = await GalleryItem.findByIdAndUpdate(req.params.id, req.valid, { new: true });
  if (!item) throw httpError(404, 'Photo not found.');
  await audit(req, 'gallery.update', item.title);
  res.json(item);
}

export async function reorder(req, res) {
  await GalleryItem.bulkWrite(req.valid.ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: i + 1 } } } })));
  res.json({ ok: true });
}

export async function remove(req, res) {
  const item = await GalleryItem.findByIdAndDelete(req.params.id);
  if (!item) throw httpError(404, 'Photo not found.');
  await removeUpload(item.image, ['gallery']); // seeded site photos (uploads/site) are never deleted
  await audit(req, 'gallery.delete', item.title);
  res.json({ ok: true });
}
