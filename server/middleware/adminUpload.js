import multer from 'multer';

// admin photos are held in memory, then resized and converted to WebP by lib/helpers.saveImage
export const photoUpload = (field = 'image') =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
      if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return cb(null, true);
      cb(Object.assign(new Error('Only JPG, PNG or WebP photos are allowed.'), { status: 400 }));
    },
  }).single(field);
