import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import AuditLog from '../models/AuditLog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS = path.join(__dirname, '..', 'uploads');

export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 400 instead of a Mongoose CastError for a bad :id
export function idParam(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid id.' });
  next();
}

export function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

// record an admin action (never lets logging break the request)
export async function audit(req, action, target = '', detail = '') {
  try {
    await AuditLog.create({ admin: req.admin?._id, adminName: req.admin?.name || req.admin?.email, action, target: String(target).slice(0, 120), detail: String(detail).slice(0, 300) });
  } catch (err) {
    console.error('[audit]', err.message);
  }
}

// Shrinks an uploaded photo and saves it as WebP in uploads/<folder>/. Returns the public URL.
export async function saveImage(buffer, folder, width = 1600) {
  const dir = path.join(UPLOADS, folder);
  await fs.mkdir(dir, { recursive: true });
  const name = `${crypto.randomBytes(10).toString('hex')}.webp`;
  try {
    await sharp(buffer).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(dir, name));
  } catch {
    throw httpError(400, 'That file is not a valid image.');
  }
  return `/uploads/${folder}/${name}`;
}

// delete a file we stored. Only touches files inside the given upload folders, never the seeded site photos
export async function removeUpload(url, folders = ['gallery', 'products', 'reviews']) {
  if (!url || typeof url !== 'string') return;
  const m = url.match(/^\/uploads\/([a-z]+)\/([A-Za-z0-9._-]+)$/);
  if (!m || !folders.includes(m[1])) return;
  await fs.unlink(path.join(UPLOADS, m[1], m[2])).catch(() => {});
}

export function pageParams(query, defSize = 20) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const size = Math.min(100, Math.max(1, parseInt(query.size, 10) || defSize));
  return { page, size, skip: (page - 1) * size };
}
