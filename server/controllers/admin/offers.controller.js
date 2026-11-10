import { z } from 'zod';
import Offer from '../../models/Offer.js';
import { audit, httpError } from '../../lib/helpers.js';

export const body = z
  .object({
    title: z.string().trim().min(2, 'Enter a title').max(100),
    text: z.string().trim().min(2, 'Enter the offer text').max(160),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    isActive: z.boolean().default(true),
  })
  .refine((o) => o.endsAt > o.startsAt, { message: 'The end must be after the start', path: ['endsAt'] });

// the site shows ONE offer at a time: switching one on switches the others off
async function exclusive(offer) {
  if (offer.isActive) await Offer.updateMany({ _id: { $ne: offer._id }, isActive: true }, { $set: { isActive: false } });
}

export async function list(req, res) {
  res.json(await Offer.find().sort({ endsAt: -1 }));
}

export async function create(req, res) {
  const o = await Offer.create(req.valid);
  await exclusive(o);
  await audit(req, 'offer.create', o.title, o.text);
  res.status(201).json(o);
}

export async function update(req, res) {
  const o = await Offer.findById(req.params.id);
  if (!o) throw httpError(404, 'Offer not found.');
  Object.assign(o, req.valid);
  await o.save();
  await exclusive(o);
  await audit(req, 'offer.update', o.title, o.isActive ? 'active' : 'off');
  res.json(o);
}

export async function remove(req, res) {
  const o = await Offer.findByIdAndDelete(req.params.id);
  if (!o) throw httpError(404, 'Offer not found.');
  await audit(req, 'offer.delete', o.title);
  res.json({ ok: true });
}
