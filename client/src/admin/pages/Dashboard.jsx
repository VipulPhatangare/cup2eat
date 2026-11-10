import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Inbox, MessageSquareText, Phone, Star, TrendingUp } from 'lucide-react';
import { adm } from '../api';
import { useAuth } from '../AuthContext';
import { Badge, Card, ErrorBox, PageTitle, Spinner, ago, fmtDate, useLoad } from '../ui';

const ACTION_LABEL = {
  'review.update': 'Review', 'review.delete': 'Review deleted', 'review.bulk_approve': 'Reviews approved', 'review.bulk_reject': 'Reviews rejected',
  'enquiry.update': 'Enquiry', 'enquiry.delete': 'Enquiry deleted', 'enquiry.export': 'CSV export',
  'product.create': 'Product added', 'product.update': 'Product edited', 'product.image': 'Product photo', 'product.delete': 'Product deleted',
  'offer.create': 'Offer created', 'offer.update': 'Offer edited', 'offer.delete': 'Offer deleted',
  'gallery.add': 'Photo added', 'gallery.update': 'Photo edited', 'gallery.delete': 'Photo deleted',
  'settings.update': 'Settings saved', 'auth.login': 'Login', 'auth.password': 'Password changed',
};
export const actionLabel = (a) => ACTION_LABEL[a] || a;

function Stat({ icon: Icon, label, value, sub, to, tone = 'forest', alert = false }) {
  const body = (
    <Card className={`h-full transition ${to ? 'hover:-translate-y-0.5 hover:shadow-md' : ''} ${alert ? 'ring-2 ring-red-400/60' : ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-choco/65">{label}</p>
        <span className={`grid size-9 place-items-center rounded-xl ${tone === 'gold' ? 'bg-gold/25 text-choco' : 'bg-forest/10 text-forest'}`}><Icon className="size-5" /></span>
      </div>
      <p className="mt-2 font-display text-4xl font-extrabold text-forest">{value}</p>
      {sub && <p className="mt-1 text-xs text-choco/60">{sub}</p>}
    </Card>
  );
  return to ? <Link to={to} className="block h-full">{body}</Link> : body;
}

// 30 bars drawn in SVG; the number above each bar is shown on hover/focus through <title>
function Chart({ days }) {
  const max = Math.max(3, ...days.map((d) => d.n));
  const w = 600, h = 140, bw = w / days.length;
  return (
    <svg viewBox={`0 0 ${w} ${h + 22}`} className="w-full" role="img" aria-label={`Enquiries per day over the last 30 days, ${days.reduce((a, d) => a + d.n, 0)} in total`}>
      {[0.5, 1].map((f) => <line key={f} x1="0" x2={w} y1={h - h * f} y2={h - h * f} stroke="currentColor" className="text-forest/10" />)}
      {days.map((d, i) => {
        const bh = (d.n / max) * (h - 8);
        return (
          <g key={d.date}>
            <rect x={i * bw + 3} y={h - bh} width={bw - 6} height={Math.max(bh, d.n ? 3 : 1.5)} rx="3" className={d.n ? 'fill-forest' : 'fill-forest/15'}>
              <title>{`${d.date}: ${d.n} enquir${d.n === 1 ? 'y' : 'ies'}`}</title>
            </rect>
          </g>
        );
      })}
      <text x="0" y={h + 16} className="fill-choco/50 text-[10px]">{days[0].date.slice(5)}</text>
      <text x={w} y={h + 16} textAnchor="end" className="fill-choco/50 text-[10px]">{days[days.length - 1].date.slice(5)}</text>
    </svg>
  );
}

const STATUS_TONE = { new: 'blue', contacted: 'amber', converted: 'green', closed: 'grey' };

export default function Dashboard() {
  const { admin, isOwner } = useAuth();
  const { data: s, loading, error, reload } = useLoad(() => adm.get('/stats'), []);

  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  const hello = new Date().toLocaleString('en-IN', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' });
  const greeting = Number(hello) < 12 ? 'Good morning' : Number(hello) < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <PageTitle title={`${greeting}, ${admin.name.split(' ')[0]}`} subtitle="Here is what needs you today." />

      {(s.reviews.pending > 0 || s.enquiries.newTotal > 0 || s.enquiries.dueFollowUps > 0) && (
        <div className="mb-6 flex flex-wrap gap-3">
          {s.reviews.pending > 0 && <Link to="/admin/reviews?status=pending" className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-deep hover:bg-gold-soft"><MessageSquareText className="size-4" /> Approve {s.reviews.pending} new review{s.reviews.pending > 1 ? 's' : ''} <ArrowRight className="size-4" /></Link>}
          {s.enquiries.newTotal > 0 && <Link to="/admin/enquiries?status=new" className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream hover:bg-deep"><Phone className="size-4" /> Call {s.enquiries.newTotal} new lead{s.enquiries.newTotal > 1 ? 's' : ''} <ArrowRight className="size-4" /></Link>}
          {s.enquiries.dueFollowUps > 0 && <Link to="/admin/enquiries" className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-200">{s.enquiries.dueFollowUps} follow-up{s.enquiries.dueFollowUps > 1 ? 's' : ''} due <ArrowRight className="size-4" /></Link>}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Inbox} label="Enquiries today" value={s.enquiries.today} sub={`${s.enquiries.week} in the last 7 days`} to="/admin/enquiries" />
        <Stat icon={Phone} label="Waiting for a call" value={s.enquiries.newTotal} sub="status: new" to="/admin/enquiries?status=new" alert={s.enquiries.newTotal > 0} />
        <Stat icon={MessageSquareText} label="Reviews to approve" value={s.reviews.pending} sub={`${s.reviews.approved} live on the site`} to="/admin/reviews?status=pending" alert={s.reviews.pending > 0} />
        <Stat icon={Star} label="Average rating" value={s.reviews.approved ? s.reviews.average.toFixed(1) : '–'} sub={s.reviews.approved ? `from ${s.reviews.approved} approved reviews` : 'No approved reviews yet'} tone="gold" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-forest"><TrendingUp className="size-5" /> Enquiries, last 30 days</h2>
            <span className="text-sm font-semibold text-choco/70">{s.days.reduce((a, d) => a + d.n, 0)} total</span>
          </div>
          <Chart days={s.days} />
        </Card>

        <Card>
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-forest"><Flame className="size-5" /> Offer on the site</h2>
          {s.offer ? (
            <>
              <p className="font-semibold">{s.offer.title}</p>
              <p className="mt-1 text-sm text-choco/70">Ends {fmtDate(s.offer.endsAt)}</p>
              <Badge tone="green">Live</Badge>
            </>
          ) : (
            <p className="text-sm text-choco/70">No offer is running. The top bar is hidden on the site.</p>
          )}
          {isOwner && <Link to="/admin/offers" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-forest underline underline-offset-2">Manage offers <ArrowRight className="size-4" /></Link>}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-forest">Latest enquiries</h2>
            <Link to="/admin/enquiries" className="text-sm font-semibold text-forest underline underline-offset-2">See all</Link>
          </div>
          {s.latestEnquiries.length === 0 ? <p className="py-6 text-center text-sm text-choco/60">No enquiries yet.</p> : (
            <ul className="divide-y divide-forest/10">
              {s.latestEnquiries.map((e) => (
                <li key={e._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{e.name} <span className="font-normal text-choco/60">· {e.city || 'city not given'}</span></p>
                    <p className="text-xs text-choco/60">{e.quantity ? `${e.quantity} cups · ` : ''}{e.source === 'calculator' ? 'from calculator' : 'from form'} · {ago(e.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone={STATUS_TONE[e.status]}>{e.status}</Badge>
                    <a href={`tel:+91${e.phone}`} aria-label={`Call ${e.name}`} className="grid size-9 place-items-center rounded-full bg-forest/10 text-forest hover:bg-forest/20"><Phone className="size-4" /></a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {isOwner && (
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-forest">Recent activity</h2>
              <Link to="/admin/activity" className="text-sm font-semibold text-forest underline underline-offset-2">See all</Link>
            </div>
            {s.latestActivity.length === 0 ? <p className="py-6 text-center text-sm text-choco/60">Nothing yet.</p> : (
              <ul className="divide-y divide-forest/10">
                {s.latestActivity.map((a) => (
                  <li key={a._id} className="py-3 text-sm">
                    <p><span className="font-semibold">{actionLabel(a.action)}</span>{a.target ? ` · ${a.target}` : ''}</p>
                    <p className="text-xs text-choco/60">{a.adminName} · {ago(a.createdAt)}{a.detail ? ` · ${a.detail}` : ''}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
