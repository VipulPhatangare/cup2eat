import { z } from 'zod';
import Product from '../../models/Product.js';
import Review from '../../models/Review.js';
import { audit, saveImage, removeUpload, httpError } from '../../lib/helpers.js';

const list20 = (max = 20) => z.array(z.string().trim().min(1).max(60)).max(max);
const pack = z.object({ cups: z.coerce.number().int().min(1).max(100000), price: z.coerce.number().min(1).max(10000000) });

export const body = z.object({
  name: z.string().trim().min(2, 'Enter a name').max(80),
  tagline: z.string().trim().max(120).optional().default(''),
  capacityMl: z.coerce.number().int().min(10).max(2000),
  usage: list20().default([]),
  flavours: list20().default([]),
  features: list20(12).default([]),
  wholesale: pack,
  retail: pack.nullable().optional(),
  deliveryIncluded: z.boolean().default(true),
  isActive: z.boolean().default(true),
  order: z.coerce.number().int().min(0).max(999).default(0),
});

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'product';

export async function list(req, res) {
  const products = await Product.find().sort({ order: 1, createdAt: 1 });
  const counts = await Review.aggregate([{ $group: { _id: '$product', n: { $sum: 1 } } }]);
  const byId = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  res.json(products.map((p) => ({ ...p.toJSON(), reviewCount: byId[String(p._id)] || 0 })));
}

export async function create(req, res) {
  const data = { ...req.valid };
  if (!data.retail) delete data.retail;
  let slug = slugify(data.name);
  if (await Product.exists({ slug })) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  const p = await Product.create({ ...data, slug });
  await audit(req, 'product.create', p.name);
  res.status(201).json(p);
}

export async function update(req, res) {
  const p = await Product.findById(req.params.id);
  if (!p) throw httpError(404, 'Product not found.');
  const data = req.valid;
  const before = `${p.wholesale?.price}/${p.wholesale?.cups}`;
  const { retail, ...rest } = data;
  Object.assign(p, rest);
  p.retail = retail || undefined;
  await p.save();
  const after = `${p.wholesale.price}/${p.wholesale.cups}`;
  await audit(req, 'product.update', p.name, before !== after ? `wholesale ₹${before.split('/')[0]} for ${before.split('/')[1]} → ₹${after.split('/')[0]} for ${after.split('/')[1]}` : 'details edited');
  res.json(p);
}

export async function uploadImage(req, res) {
  if (!req.file) throw httpError(400, 'Choose a photo first.');
  const p = await Product.findById(req.params.id);
  if (!p) throw httpError(404, 'Product not found.');
  const url = await saveImage(req.file.buffer, 'products', 1200);
  await removeUpload(p.image, ['products']);
  p.image = url;
  await p.save();
  await audit(req, 'product.image', p.name);
  res.json(p);
}

export async function remove(req, res) {
  const p = await Product.findById(req.params.id);
  if (!p) throw httpError(404, 'Product not found.');
  const reviews = await Review.countDocuments({ product: p._id });
  if (reviews) throw httpError(409, `This product has ${reviews} review(s). Hide it instead of deleting it.`);
  await p.deleteOne();
  await removeUpload(p.image, ['products']);
  await audit(req, 'product.delete', p.name);
  res.json({ ok: true });
}
