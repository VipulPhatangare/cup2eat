import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validate.js';
import { reviewUpload } from '../middleware/upload.js';
import { listProducts } from '../controllers/products.controller.js';
import { listReviews, reviewStats, createReview, listQuery, createBody } from '../controllers/reviews.controller.js';
import { createEnquiry, enquiryBody } from '../controllers/enquiries.controller.js';
import adminRoutes from './admin.js';
import { activeOffer, listGallery, getSettings, health } from '../controllers/misc.controller.js';

const router = Router();

const limiter = (max, windowMin, message) =>
  rateLimit({
    windowMs: windowMin * 60 * 1000,
    limit: max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
  });

router.get('/health', health);
router.get('/products', listProducts);
router.get('/offers/active', activeOffer);
router.get('/gallery', listGallery);
router.get('/settings', getSettings);

router.get('/reviews', validate(listQuery, 'query'), listReviews);
router.get('/reviews/stats', reviewStats);
router.post(
  '/reviews',
  limiter(5, 60, 'Too many reviews from this device. Please try again later.'),
  reviewUpload,
  validate(createBody),
  createReview
);

router.post(
  '/enquiries',
  limiter(10, 60, 'Too many enquiries. Please call us on 9818192575.'),
  validate(enquiryBody),
  createEnquiry
);

// admin panel API (login required, see routes/admin.js)
router.use('/admin', adminRoutes);

export default router;
