import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarClock, ChevronDown, Download, MessageCircle, Phone, Plus, Search, Trash2 } from 'lucide-react';
import { adm } from '../api';
import { useToast } from '../../context/AppContext';
import { Badge, Btn, Card, Empty, ErrorBox, Field, PageTitle, Pager, Spinner, ago, fmtDate, inputCls, useConfirm, useLoad } from '../ui';

const STATUSES = ['new', 'contacted', 'converted', 'closed'];
const TYPE = { Cafe: 'Café', Restaurant: 'Restaurant', Event: 'Event', Corporate: 'Corporate', College: 'College / School', Other: 'Other' };

function Row({ e, onChange, onDelete }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const due = e.followUpAt && new Date(e.followUpAt) <= new Date() && ['new', 'contacted'].includes(e.status);

  const run = async (fn, msg) => {
    setBusy(true);
    try { const r = await fn(); onChange(r); if (msg) toast(msg); } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  };
  const wa = `https://wa.me/91${e.phone}?text=${encodeURIComponent(`Hi ${e.name}, this is CUP2EAT. Thank you for your enquiry${e.quantity ? ` for ${e.quantity} cups` : ''}!`)}`;

  return (
    <Card className={`!p-0 ${e.status === 'new' ? 'border-sky-300' : ''}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
        <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex min-w-0 flex-1 basis-56 items-center gap-3 text-left">
          <ChevronDown className={`size-5 shrink-0 text-choco/50 transition ${open ? 'rotate-180' : ''}`} />
          <span className="min-w-0">
            <span className="block truncate font-semibold">{e.name}</span>
            <span className="block truncate text-xs text-choco/60">{[e.city, TYPE[e.businessType], e.quantity ? `${e.quantity} cups` : null, e.product ? `${e.product.capacityMl} ml` : null].filter(Boolean).join(' · ') || 'No details'} · {ago(e.createdAt)}</span>
          </span>
        </button>
        <div className="flex flex-wrap items-center gap-2">
          {due && <Badge tone="red">Follow-up due</Badge>}
          <Badge tone={e.source === 'calculator' ? 'gold' : 'grey'}>{e.source}</Badge>
          <select value={e.status} disabled={busy} onChange={(ev) => run(() => adm.patch(`/enquiries/${e._id}`, { status: ev.target.value }), 'Status updated')}
            aria-label={`Status for ${e.name}`} className={`${inputCls} !w-auto !py-1.5 font-semibold`}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <a href={`tel:+91${e.phone}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-forest px-3 text-[13px] font-semibold text-cream hover:bg-deep"><Phone className="size-4" /> {e.phone}</a>
          <a href={wa} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${e.name}`} className="grid size-9 place-items-center rounded-xl bg-[#25D366] text-white hover:brightness-95"><MessageCircle className="size-5" /></a>
        </div>
      </div>

      {open && (
        <div className="grid gap-5 border-t border-forest/10 p-4 md:grid-cols-2">
          <div className="space-y-3 text-sm">
            <p><span className="font-semibold">Received:</span> {fmtDate(e.createdAt)}</p>
            {e.email && <p><span className="font-semibold">Email:</span> <a href={`mailto:${e.email}`} className="underline">{e.email}</a></p>}
            {e.message && <p className="whitespace-pre-line rounded-xl bg-stone-100 p-3">{e.message}</p>}
            {e.lastContactedAt && <p className="text-choco/65">Last contacted {ago(e.lastContactedAt)}</p>}
            <Field label="Follow up on" className="max-w-[240px]">
              <input type="date" value={e.followUpAt ? e.followUpAt.slice(0, 10) : ''} disabled={busy} className={inputCls}
                onChange={(ev) => run(() => adm.patch(`/enquiries/${e._id}`, { followUpAt: ev.target.value || null }), ev.target.value ? 'Follow-up set' : 'Follow-up cleared')} />
            </Field>
            <Btn variant="dangerSoft" size="sm" onClick={() => onDelete(e)}><Trash2 className="size-4" /> Delete enquiry</Btn>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-forest"><CalendarClock className="size-4" /> Notes</p>
            {e.notes?.length === 0 && <p className="mb-2 text-sm text-choco/55">No notes yet. Write what was said on the call.</p>}
            <ul className="mb-3 space-y-2">
              {e.notes?.map((n, i) => (
                <li key={i} className="rounded-xl bg-forest/5 p-3 text-sm">
                  <p className="whitespace-pre-line">{n.text}</p>
                  <p className="mt-1 text-xs text-choco/55">{n.by} · {fmtDate(n.at)}</p>
                </li>
              ))}
            </ul>
            <form className="flex gap-2" onSubmit={(ev) => { ev.preventDefault(); if (!note.trim()) return; run(() => adm.post(`/enquiries/${e._id}/notes`, { text: note.trim() }), 'Note added').then(() => setNote('')); }}>
              <input value={note} onChange={(ev) => setNote(ev.target.value)} maxLength={500} placeholder="Add a note…" aria-label="New note" className={inputCls} />
              <Btn type="submit" size="sm" busy={busy} className="shrink-0"><Plus className="size-4" /> Add</Btn>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function Enquiries() {
  const toast = useToast();
  const confirm = useConfirm();
  const [sp, setSp] = useSearchParams();
  const status = STATUSES.includes(sp.get('status')) ? sp.get('status') : '';
  const [source, setSource] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { const t = setTimeout(() => { setQuery(q.trim()); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);
  useEffect(() => { setPage(1); }, [status, source, from, to]);

  const qs = new URLSearchParams({ ...(status && { status }), ...(source && { source }), ...(from && { from }), ...(to && { to }), ...(query && { q: query }) });
  const { data, loading, error, reload, setData } = useLoad(() => adm.get(`/enquiries?${qs}&page=${page}`), [qs.toString(), page]);

  const replace = (row) => setData({ ...data, items: data.items.map((x) => (x._id === row._id ? row : x)) });
  const del = async (e) => {
    if (await confirm({ title: 'Delete this enquiry?', text: `${e.name} (${e.phone}) will be removed for good. Mark it "closed" instead to keep the history.`, action: 'Delete', danger: true })) {
      try { await adm.del(`/enquiries/${e._id}`); toast('Enquiry deleted'); reload(); } catch (err) { toast(err.message, 'error'); }
    }
  };

  const counts = data?.counts || {};
  const all = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <>
      <PageTitle title="Enquiries" subtitle="Leads from the contact form and the bulk-order calculator.">
        <Btn variant="outline" href={`/api/admin/enquiries/export.csv?${qs}`} download><Download className="size-4" /> Export CSV</Btn>
      </PageTitle>

      <div className="mb-4 flex flex-wrap gap-2">
        {[['', 'All', all], ...STATUSES.map((s) => [s, s[0].toUpperCase() + s.slice(1), counts[s] ?? 0])].map(([k, l, n]) => (
          <button key={k || 'all'} onClick={() => setSp(k ? { status: k } : {})} aria-pressed={status === k}
            className={`min-h-10 rounded-full px-4 text-sm font-semibold transition ${status === k ? 'bg-forest text-cream' : 'bg-white text-forest hover:bg-forest/10'}`}>
            {l} <span className={`ml-1 text-xs ${status === k ? 'text-cream/80' : 'text-choco/55'}`}>{n}</span>
          </button>
        ))}
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-choco/50" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, city…" aria-label="Search enquiries" className={`${inputCls} pl-9`} />
        </div>
        <select value={source} onChange={(e) => setSource(e.target.value)} aria-label="Source" className={inputCls}>
          <option value="">Any source</option><option value="form">Contact form</option><option value="calculator">Calculator</option>
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" className={inputCls} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" className={inputCls} />
      </div>

      {loading && !data ? <Spinner /> : error ? <ErrorBox error={error} onRetry={reload} /> : data.items.length === 0 ? (
        <Empty title="No enquiries" text={query || status || source || from || to ? 'Nothing matches these filters.' : 'When someone fills the contact form or the calculator, it shows up here.'} />
      ) : (
        <div className="space-y-3">{data.items.map((e) => <Row key={e._id} e={e} onChange={replace} onDelete={del} />)}</div>
      )}
      <Pager page={data?.page || 1} pages={data?.pages || 1} onPage={setPage} />
    </>
  );
}
