import { z } from 'zod';
import Enquiry from '../../models/Enquiry.js';
import { audit, escapeRegex, pageParams, httpError } from '../../lib/helpers.js';

export const patchBody = z
  .object({
    status: z.enum(['new', 'contacted', 'converted', 'closed']).optional(),
    followUpAt: z.union([z.coerce.date(), z.null()]).optional(),
  })
  .strict();

export const noteBody = z.object({ text: z.string().trim().min(1, 'Write a note').max(500) });

function buildFilter(query) {
  const filter = {};
  if (['new', 'contacted', 'converted', 'closed'].includes(query.status)) filter.status = query.status;
  if (['form', 'calculator'].includes(query.source)) filter.source = query.source;
  const q = String(query.q || '').trim().slice(0, 60);
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { phone: rx }, { city: rx }, { message: rx }];
  }
  const from = query.from ? new Date(query.from) : null;
  const to = query.to ? new Date(query.to) : null;
  if ((from && !isNaN(from)) || (to && !isNaN(to))) {
    filter.createdAt = {};
    if (from && !isNaN(from)) filter.createdAt.$gte = from;
    if (to && !isNaN(to)) filter.createdAt.$lte = new Date(to.getTime() + 24 * 3600 * 1000 - 1);
  }
  return filter;
}

export async function list(req, res) {
  const { page, size, skip } = pageParams(req.query);
  const filter = buildFilter(req.query);
  const [items, total, counts] = await Promise.all([
    Enquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(size).populate('product', 'name capacityMl').select('-__v'),
    Enquiry.countDocuments(filter),
    Enquiry.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
  ]);
  const tabs = { new: 0, contacted: 0, converted: 0, closed: 0 };
  counts.forEach((c) => { tabs[c._id] = c.n; });
  res.json({ items, total, page, pages: Math.ceil(total / size), counts: tabs });
}

export async function patch(req, res) {
  const e = await Enquiry.findById(req.params.id);
  if (!e) throw httpError(404, 'Enquiry not found.');
  const { status, followUpAt } = req.valid;
  const did = [];
  if (status && status !== e.status) {
    e.status = status;
    if (status === 'contacted') e.lastContactedAt = new Date();
    did.push(`status → ${status}`);
  }
  if (followUpAt !== undefined) {
    e.followUpAt = followUpAt || undefined;
    did.push(followUpAt ? 'follow-up set' : 'follow-up cleared');
  }
  await e.save();
  if (did.length) await audit(req, 'enquiry.update', `${e.name} · ${e.phone}`, did.join(', '));
  res.json(await e.populate('product', 'name capacityMl'));
}

export async function addNote(req, res) {
  const e = await Enquiry.findById(req.params.id);
  if (!e) throw httpError(404, 'Enquiry not found.');
  e.notes.push({ text: req.valid.text, by: req.admin.name, at: new Date() });
  await e.save();
  res.status(201).json(await e.populate('product', 'name capacityMl'));
}

export async function remove(req, res) {
  const e = await Enquiry.findByIdAndDelete(req.params.id);
  if (!e) throw httpError(404, 'Enquiry not found.');
  await audit(req, 'enquiry.delete', `${e.name} · ${e.phone}`);
  res.json({ ok: true });
}

// spreadsheet formulas: a cell starting with = + - @ would run in Excel, so we defuse it
const cell = (v) => {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function exportCsv(req, res) {
  const rows = await Enquiry.find(buildFilter(req.query)).sort({ createdAt: -1 }).limit(5000).populate('product', 'capacityMl');
  const head = ['Date', 'Name', 'Phone', 'Email', 'City', 'Type', 'Cup size', 'Quantity', 'Source', 'Status', 'Message', 'Notes'];
  const lines = [head.map(cell).join(',')];
  for (const e of rows) {
    lines.push([
      e.createdAt.toISOString().slice(0, 16).replace('T', ' '), e.name, e.phone, e.email, e.city, e.businessType,
      e.product ? `${e.product.capacityMl} ml` : '', e.quantity, e.source, e.status, e.message,
      (e.notes || []).map((n) => `${n.by}: ${n.text}`).join(' | '),
    ].map(cell).join(','));
  }
  await audit(req, 'enquiry.export', `${rows.length} rows`);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="cup2eat-enquiries-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send('﻿' + lines.join('\r\n')); // BOM so Excel reads UTF-8
}
