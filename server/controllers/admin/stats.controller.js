import Enquiry from '../../models/Enquiry.js';
import Review from '../../models/Review.js';
import Offer from '../../models/Offer.js';
import AuditLog from '../../models/AuditLog.js';

const IST = 5.5 * 3600 * 1000; // India time, so "today" matches the owner's day

function istDayStart(offsetDays = 0) {
  const d = new Date(Date.now() + IST);
  d.setUTCHours(0, 0, 0, 0);
  return new Date(d.getTime() - IST + offsetDays * 86400000);
}

export async function stats(req, res) {
  const today = istDayStart();
  const weekAgo = istDayStart(-6);
  const from30 = istDayStart(-29);
  const now = new Date();

  const [newToday, newWeek, newTotal, dueFollowUps, pendingReviews, ratingAgg, offer, byDay, latestEnquiries, latestActivity] = await Promise.all([
    Enquiry.countDocuments({ createdAt: { $gte: today } }),
    Enquiry.countDocuments({ createdAt: { $gte: weekAgo } }),
    Enquiry.countDocuments({ status: 'new' }),
    Enquiry.countDocuments({ followUpAt: { $lte: now }, status: { $in: ['new', 'contacted'] } }),
    Review.countDocuments({ status: 'pending' }),
    Review.aggregate([{ $match: { status: 'approved' } }, { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } }]),
    Offer.findOne({ isActive: true, startsAt: { $lte: now }, endsAt: { $gt: now } }).sort({ endsAt: 1 }),
    Enquiry.aggregate([
      { $match: { createdAt: { $gte: from30 } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' } }, n: { $sum: 1 } } },
    ]),
    Enquiry.find().sort({ createdAt: -1 }).limit(5).populate('product', 'capacityMl').select('name phone city quantity status source createdAt product'),
    AuditLog.find().sort({ createdAt: -1 }).limit(6),
  ]);

  // fill days with no enquiries so the chart has 30 bars
  const map = Object.fromEntries(byDay.map((d) => [d._id, d.n]));
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(from30.getTime() + i * 86400000 + IST).toISOString().slice(0, 10);
    return { date: d, n: map[d] || 0 };
  });

  res.json({
    enquiries: { today: newToday, week: newWeek, newTotal, dueFollowUps },
    reviews: { pending: pendingReviews, average: ratingAgg[0] ? Math.round(ratingAgg[0].avg * 10) / 10 : 0, approved: ratingAgg[0]?.n || 0 },
    offer: offer ? { title: offer.title, endsAt: offer.endsAt } : null,
    days,
    latestEnquiries,
    latestActivity: req.admin.role === 'owner' ? latestActivity : [], // history is owner-only
  });
}

export async function activity(req, res) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const size = 30;
  const [items, total] = await Promise.all([
    AuditLog.find().sort({ createdAt: -1 }).skip((page - 1) * size).limit(size),
    AuditLog.countDocuments(),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / size) });
}
