import multer from 'multer';
import { ZodError } from 'zod';

export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    const fields = {};
    for (const issue of err.issues) fields[issue.path.join('.') || '_'] = issue.message;
    return res.status(400).json({ message: 'Please check the highlighted fields.', fields });
  }
  if (err instanceof multer.MulterError) {
    const map = {
      LIMIT_FILE_SIZE: 'That photo is too large. Reviews allow 2 MB per photo, the admin panel 8 MB.',
      LIMIT_FILE_COUNT: 'You can upload up to 3 photos.',
      LIMIT_UNEXPECTED_FILE: 'You can upload up to 3 photos.',
    };
    return res.status(400).json({ message: map[err.code] || err.message });
  }
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ message: err.message });
  }
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ message: err.message });
  }
  console.error('[error]', err);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
}
