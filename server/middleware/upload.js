import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REVIEW_DIR = path.join(__dirname, '..', 'uploads', 'reviews');

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, REVIEW_DIR),
  // random file name; extension comes from the checked mime type, never from the user
  filename: (req, file, cb) => cb(null, `${crypto.randomBytes(12).toString('hex')}${EXT[file.mimetype]}`),
});

export const reviewUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 3 },
  fileFilter: (req, file, cb) => {
    if (EXT[file.mimetype]) return cb(null, true);
    const err = new Error('Only JPG, PNG or WebP photos are allowed.');
    err.status = 400;
    cb(err);
  },
}).array('photos', 3);
