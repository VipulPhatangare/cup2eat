import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Ban, Check, Reply, Search, Star, Trash2 } from 'lucide-react';
import { adm } from '../api';
import { useToast } from '../../context/AppContext';
import Lightbox from '../../components/ui/Lightbox';
import { Badge, Btn, Card, Empty, ErrorBox, Modal, PageTitle, Pager, Spinner, Field, inputCls, ago, useConfirm, useLoad } from '../ui';

const TABS = [['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']];
const TYPE = { Cafe: 'Café', Event: 'Event', Corporate: 'Corporate', College: 'College / School', Personal: 'Customer' };

function Stars({ n }) {
  return <span className="inline-flex" aria-label={`${n} out of 5`}>{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`size-4 ${i <= n ? 'fill-gold text-gold' : 'text-stone-300'}`} />)}</span>;
}

export default function Reviews() {
  const toast = useToast();
  const confirm = useConfirm();
  const [sp, setSp] = useSearchParams();
  const status = TABS.some(([k]) => k === sp.get('status')) ? sp.get('status') : 'pending';
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [picked, setPicked] = useState(new Set());
  const [photo, setPhoto] = useState(null);
  const [replying, setReplying] = useState(null); // review being answered
  const [replyText, setReplyText] = useState('');
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { const t = setTimeout(() => { setQuery(q.trim()); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);
  useEffect(() => { setPage(1); setPicked(new Set()); }, [status]);

  const { data, loading, error, reload } = useLoad(
    () => adm.get(`/reviews?status=${status}&page=${page}&q=${encodeURIComponent(query)}`),
    [status, page, query]
  );

  const act = useCallback(async (fn, okMsg) => {
    setBusy(true);
    try { await fn(); if (okMsg) toast(okMsg); await reload(); } catch (e) { toast(e.message, 'error'); } finally { setBusy(false); }
  }, [reload, toast]);

  const patch = (r, body, msg) => act(() => adm.patch(`/reviews/${r._id}`, body), msg);
  const toggle = (id) =>
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const bulk = (action) => act(async () => { await adm.post('/reviews/bulk', { ids: [...picked], action }); setPicked(new Set()); }, action === 'approve' ? 'Approved' : 'Rejected');

  const del = async (r) => {
    if (await confirm({ title: 'Delete this review?', text: `${r.name}'s review${r.photos?.length ? ' and its photos' : ''} will be removed for good. Reject it instead if you may need it later.`, action: 'Delete', danger: true })) {
      act(() => adm.del(`/reviews/${r._id}`), 'Review deleted');
    }
  };

  const items = data?.items || [];
  const counts = data?.counts || {};

  return (
    <>
      <PageTitle title="Reviews" subtitle="Only approved reviews appear on the website." />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div role="tablist" className="flex gap-1 rounded-2xl bg-white p-1 shadow-sm">
          {TABS.map(([k, l]) => (
            <button key={k} role="tab" aria-selected={status === k} onClick={() => setSp({ status: k })}
              className={`min-h-10 rounded-xl px-4 text-sm font-semibold transition ${status === k ? 'bg-forest text-cream' : 'text-forest hover:bg-forest/10'}`}>
              {l} <span className={`ml-1 rounded-full px-1.5 text-xs ${status === k ? 'bg-white/20' : 'bg-forest/10'}`}>{counts[k] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-choco/50" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, city or text" aria-label="Search reviews" className={`${inputCls} pl-9`} />
        </div>
      </div>

      {picked.size > 0 && (
        <div className="sticky top-14 z-20 mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-forest p-3 text-cream shadow-lg lg:top-3">
          <span className="px-2 text-sm font-semibold">{picked.size} selected</span>
          <Btn variant="gold" size="sm" busy={busy} onClick={() => bulk('approve')}><Check className="size-4" /> Approve</Btn>
          <Btn variant="dangerSoft" size="sm" busy={busy} onClick={() => bulk('reject')}><Ban className="size-4" /> Reject</Btn>
          <button onClick={() => setPicked(new Set())} className="ml-auto px-2 text-sm underline">Clear</button>
        </div>
      )}

      {loading && !data ? <Spinner /> : error ? <ErrorBox error={error} onRetry={reload} /> : items.length === 0 ? (
        <Empty title={status === 'pending' ? 'All caught up' : 'Nothing here'} text={status === 'pending' ? 'New reviews from the website will appear here for your approval.' : query ? 'No review matches your search.' : `There are no ${status} reviews.`} />
      ) : (
        <ul className="space-y-4">
          {items.map((r) => (
            <li key={r._id}>
              <Card className={picked.has(r._id) ? 'ring-2 ring-gold' : ''}>
                <div className="flex gap-3">
                  <input type="checkbox" checked={picked.has(r._id)} onChange={() => toggle(r._id)} aria-label={`Select review by ${r.name}`} className="mt-1.5 size-5 shrink-0 accent-forest" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Stars n={r.rating} />
                      <span className="font-semibold">{r.name}{r.city ? <span className="font-normal text-choco/60">, {r.city}</span> : null}</span>
                      <span className="text-xs text-choco/55">{ago(r.createdAt)}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Badge tone="grey">{TYPE[r.customerType] || 'Customer'}</Badge>
                      {r.product && <Badge tone="gold">{r.product.capacityMl} ml{r.flavour ? ` · ${r.flavour}` : ''}</Badge>}
                      {r.featured && <Badge tone="amber">★ Featured</Badge>}
                      {status !== 'pending' && <Badge tone={r.status === 'approved' ? 'green' : 'red'}>{r.status}{r.moderatedBy ? ` by ${r.moderatedBy}` : ''}</Badge>}
                    </div>
                    <p className="mt-3 whitespace-pre-line break-words text-[15px] leading-relaxed">{r.text}</p>

                    {r.photos?.length > 0 && (
                      <div className="mt-3 flex gap-2">
                        {r.photos.map((src, i) => (
                          <button key={src} onClick={() => setPhoto({ src, alt: `Photo ${i + 1} from ${r.name}`, caption: r.name })} className="size-20 overflow-hidden rounded-xl ring-1 ring-forest/15" aria-label={`Open photo ${i + 1} from ${r.name}`}>
                            <img src={src} alt="" loading="lazy" className="size-full object-cover transition hover:scale-105" />
                          </button>
                        ))}
                      </div>
                    )}

                    {r.reply && (
                      <div className="mt-3 rounded-xl bg-forest/5 p-3 text-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-forest">Your reply (shown on the site)</p>
                        <p className="mt-0.5">{r.reply}</p>
                      </div>
                    )}
                    {r.status === 'rejected' && r.rejectReason && <p className="mt-2 text-sm text-red-700">Reason: {r.rejectReason}</p>}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {r.status !== 'approved' && <Btn variant="primary" size="sm" disabled={busy} onClick={() => patch(r, { status: 'approved' }, 'Approved. It is live on the site.')}><Check className="size-4" /> Approve</Btn>}
                      {r.status !== 'rejected' && <Btn variant="dangerSoft" size="sm" disabled={busy} onClick={() => { setRejecting(r); setReason(''); }}><Ban className="size-4" /> Reject</Btn>}
                      {r.status === 'approved' && <Btn variant={r.featured ? 'gold' : 'outline'} size="sm" disabled={busy} onClick={() => patch(r, { featured: !r.featured }, r.featured ? 'Removed from featured' : 'Featured: shown first on the site')}><Star className="size-4" /> {r.featured ? 'Featured' : 'Feature'}</Btn>}
                      {r.status === 'approved' && <Btn variant="outline" size="sm" disabled={busy} onClick={() => { setReplying(r); setReplyText(r.reply || ''); }}><Reply className="size-4" /> {r.reply ? 'Edit reply' : 'Reply'}</Btn>}
                      <Btn variant="outline" size="sm" disabled={busy} onClick={() => del(r)} className="ml-auto !text-red-700"><Trash2 className="size-4" /> Delete</Btn>
                    </div>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <Pager page={data?.page || 1} pages={data?.pages || 1} onPage={setPage} />

      <Lightbox item={photo} onClose={() => setPhoto(null)} />

      <Modal open={!!replying} onClose={() => setReplying(null)} title={`Reply to ${replying?.name || ''}`}>
        <Field label="Your public reply" hint="Shown under the review on the website. Leave empty to remove it.">
          <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} maxLength={400} className={inputCls} autoFocus />
        </Field>
        <p className="mt-1 text-right text-xs text-choco/50">{replyText.length}/400</p>
        <div className="mt-4 flex justify-end gap-2">
          <Btn variant="outline" onClick={() => setReplying(null)}>Cancel</Btn>
          <Btn busy={busy} onClick={async () => { const r = replying; setReplying(null); await patch(r, { reply: replyText.trim() }, replyText.trim() ? 'Reply saved' : 'Reply removed'); }}>Save reply</Btn>
        </div>
      </Modal>

      <Modal open={!!rejecting} onClose={() => setRejecting(null)} title="Reject this review?">
        <p className="mb-3 text-sm text-choco/75">It will not appear on the website. You can approve it again later.</p>
        <Field label="Reason (only you will see it)">
          <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={200} placeholder="e.g. spam, not a customer" className={inputCls} autoFocus />
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <Btn variant="outline" onClick={() => setRejecting(null)}>Cancel</Btn>
          <Btn variant="danger" busy={busy} onClick={async () => { const r = rejecting; setRejecting(null); await patch(r, { status: 'rejected', rejectReason: reason.trim() }, 'Rejected'); }}>Reject</Btn>
        </div>
      </Modal>
    </>
  );
}
