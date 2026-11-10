import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validate.js';
import { requireAdmin, requireOwner } from '../middleware/auth.js';
import { photoUpload } from '../middleware/adminUpload.js';
import { idParam } from '../lib/helpers.js';
import * as auth from '../controllers/admin/auth.controller.js';
import * as stats from '../controllers/admin/stats.controller.js';
import * as reviews from '../controllers/admin/reviews.controller.js';
import * as enquiries from '../controllers/admin/enquiries.controller.js';
import * as products from '../controllers/admin/products.controller.js';
import * as offers from '../controllers/admin/offers.controller.js';
import * as gallery from '../controllers/admin/gallery.controller.js';
import * as settings from '../controllers/admin/settings.controller.js';

const router = Router();

// ---- login (the only route without a session) ----
router.post(
  '/auth/login',
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many login attempts. Please wait a few minutes.' } }),
  validate(auth.loginBody),
  auth.login
);

// ---- everything below needs a logged-in admin ----
router.use(requireAdmin);

router.post('/auth/logout', auth.logout);
router.get('/auth/me', auth.me);
router.post('/auth/password', validate(auth.passwordBody), auth.changePassword);

router.get('/stats', stats.stats);

router.get('/reviews', reviews.list);
router.post('/reviews/bulk', validate(reviews.bulkBody), reviews.bulk);
router.patch('/reviews/:id', idParam, validate(reviews.patchBody), reviews.patch);
router.delete('/reviews/:id', idParam, reviews.remove);

router.get('/enquiries', enquiries.list);
router.get('/enquiries/export.csv', enquiries.exportCsv);
router.patch('/enquiries/:id', idParam, validate(enquiries.patchBody), enquiries.patch);
router.post('/enquiries/:id/notes', idParam, validate(enquiries.noteBody), enquiries.addNote);
router.delete('/enquiries/:id', idParam, enquiries.remove);

router.get('/gallery', gallery.list);
router.post('/gallery', photoUpload('image'), validate(gallery.createBody), gallery.create);
router.post('/gallery/reorder', validate(gallery.reorderBody), gallery.reorder);
router.patch('/gallery/:id', idParam, validate(gallery.patchBody), gallery.update);
router.delete('/gallery/:id', idParam, gallery.remove);

// ---- owner only: money, offers, site details, history ----
router.get('/products', requireOwner, products.list);
router.post('/products', requireOwner, validate(products.body), products.create);
router.put('/products/:id', requireOwner, idParam, validate(products.body), products.update);
router.post('/products/:id/image', requireOwner, idParam, photoUpload('image'), products.uploadImage);
router.delete('/products/:id', requireOwner, idParam, products.remove);

router.get('/offers', requireOwner, offers.list);
router.post('/offers', requireOwner, validate(offers.body), offers.create);
router.put('/offers/:id', requireOwner, idParam, validate(offers.body), offers.update);
router.delete('/offers/:id', requireOwner, idParam, offers.remove);

router.get('/settings', requireOwner, settings.get);
router.put('/settings', requireOwner, validate(settings.body), settings.put);

router.get('/activity', requireOwner, stats.activity);

export default router;
