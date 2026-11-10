import { z } from 'zod';
import Setting from '../../models/Setting.js';
import { audit } from '../../lib/helpers.js';

export const body = z.object({
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a 10-digit mobile number'),
  instagram: z
    .string()
    .trim()
    .transform((s) => s.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/\/.*$/, ''))
    .pipe(z.string().regex(/^[A-Za-z0-9._]{1,30}$/, 'Enter the Instagram username, e.g. cup2eat')),
  email: z.string().trim().email('Enter a valid email').or(z.literal('')).default(''),
  address: z.string().trim().max(160).default(''),
  fssaiNo: z.string().trim().regex(/^\d{14}$/, 'An FSSAI number has 14 digits').or(z.literal('')).default(''),
  founder: z.string().trim().max(60).default(''),
  followers: z.coerce.number().int().min(0).max(100000000).optional(),
});

export async function get(req, res) {
  res.json((await Setting.findOne({ key: 'site' })) || {});
}

export async function put(req, res) {
  const data = { ...req.valid, whatsapp: `91${req.valid.phone}` }; // WhatsApp links always use the main number
  const s = await Setting.findOneAndUpdate({ key: 'site' }, { $set: data }, { new: true, upsert: true });
  await audit(req, 'settings.update', 'Site settings', data.fssaiNo ? `FSSAI ${data.fssaiNo}` : '');
  res.json(s);
}
