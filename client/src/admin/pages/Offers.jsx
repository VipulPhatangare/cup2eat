import { useState } from 'react';
import { Flame, Pencil, Plus, Trash2 } from 'lucide-react';
import { adm } from '../api';
import { useToast } from '../../context/AppContext';
import { Badge, Btn, Card, Empty, ErrorBox, Field, Modal, PageTitle, Spinner, Toggle, fmtDate, inputCls, toLocalInput, useConfirm, useLoad } from '../ui';

function status(o) {
  const now = Date.now();
  if (!o.isActive) return ['Off', 'grey'];
  if (new Date(o.endsAt) <= now) return ['Ended', 'red'];
  if (new Date(o.startsAt) > now) return ['Scheduled', 'blue'];
  return ['Live now', 'green'];
}

// same look as the real top bar of the website
function Preview({ text }) {
  return (
    <div className="rounded-xl bg-gold px-4 py-2 text-center text-sm font-semibold text-deep">
      <span className="inline-flex items-center gap-1.5"><Flame className="size-4" /> {text || 'Your offer text appears here'}</span>
      <span className="ml-3 rounded-full bg-deep px-2.5 py-0.5 font-mono text-xs text-gold">Ends in 6d 04h 12m 30s</span>
    </div>
  );
}

export default function Offers() {
  const toast = useToast();
  const confirm = useConfirm();
  const { data, loading, error, reload } = useLoad(() => adm.get('/offers'), []);
  const [edit, setEdit] = useState(null); // offer being edited, or {} for new
  const [f, setF] = useState({});
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const openForm = (o) => {
    setEdit(o);
    setErrors({});
    const now = new Date();
    const end = new Date(Date.now() + 7 * 86400000);
    setF(o._id
      ? { title: o.title, text: o.text, startsAt: toLocalInput(o.startsAt), endsAt: toLocalInput(o.endsAt), isActive: o.isActive }
      : { title: '', text: '', startsAt: toLocalInput(now), endsAt: toLocalInput(end), isActive: true });
  };

  const save = async () => {
    setBusy(true);
    setErrors({});
    const body = { title: f.title, text: f.text, startsAt: new Date(f.startsAt).toISOString(), endsAt: new Date(f.endsAt).toISOString(), isActive: f.isActive };
    try {
      if (edit._id) await adm.put(`/offers/${edit._id}`, body); else await adm.post('/offers', body);
      toast('Saved. The website bar is updated.');
      setEdit(null);
      reload();
    } catch (e) { setErrors(e.fields || {}); toast(e.message, 'error'); } finally { setBusy(false); }
  };

  const del = async (o) => {
    if (await confirm({ title: 'Delete this offer?', text: `"${o.title}" will be removed.`, action: 'Delete', danger: true })) {
      try { await adm.del(`/offers/${o._id}`); toast('Offer deleted'); reload(); } catch (e) { toast(e.message, 'error'); }
    }
  };

  const setActive = async (o, isActive) => {
    try {
      await adm.put(`/offers/${o._id}`, { title: o.title, text: o.text, startsAt: o.startsAt, endsAt: o.endsAt, isActive });
      toast(isActive ? 'Offer switched on (others switched off)' : 'Offer switched off');
      reload();
    } catch (e) { toast(e.message, 'error'); }
  };

  if (loading && !data) return <Spinner />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  return (
    <>
      <PageTitle title="Offers" subtitle="The gold bar at the top of the website, with the countdown. Only one offer shows at a time.">
        <Btn variant="gold" onClick={() => openForm({})}><Plus className="size-4" /> New offer</Btn>
      </PageTitle>

      {data.length === 0 ? <Empty title="No offers yet" text="Create one and it appears at the top of the site." /> : (
        <ul className="space-y-4">
          {data.map((o) => {
            const [label, tone] = status(o);
            return (
              <li key={o._id}>
                <Card className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2"><h2 className="font-semibold">{o.title}</h2><Badge tone={tone}>{label}</Badge></div>
                    <Toggle checked={o.isActive} onChange={(v) => setActive(o, v)} label="On" />
                  </div>
                  <Preview text={o.text} />
                  <p className="text-xs text-choco/60">{fmtDate(o.startsAt)} → {fmtDate(o.endsAt)}</p>
                  <div className="flex gap-2">
                    <Btn variant="outline" size="sm" onClick={() => openForm(o)}><Pencil className="size-4" /> Edit</Btn>
                    <Btn variant="dangerSoft" size="sm" onClick={() => del(o)}><Trash2 className="size-4" /> Delete</Btn>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?._id ? 'Edit offer' : 'New offer'}>
        <div className="space-y-4">
          <Field label="Name (for you)" error={errors.title}><input value={f.title || ''} onChange={(e) => setF({ ...f, title: e.target.value })} className={inputCls} placeholder="Diwali special" autoFocus /></Field>
          <Field label="Text shown on the website" error={errors.text}><input value={f.text || ''} onChange={(e) => setF({ ...f, text: e.target.value })} maxLength={160} className={inputCls} placeholder="396 edible cups for just ₹3,999, delivery included" /></Field>
          <Preview text={f.text} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Starts"><input type="datetime-local" value={f.startsAt || ''} onChange={(e) => setF({ ...f, startsAt: e.target.value })} className={inputCls} /></Field>
            <Field label="Ends" error={errors.endsAt}><input type="datetime-local" value={f.endsAt || ''} onChange={(e) => setF({ ...f, endsAt: e.target.value })} className={inputCls} /></Field>
          </div>
          <Toggle checked={!!f.isActive} onChange={(v) => setF({ ...f, isActive: v })} label="Switch on (turns other offers off)" />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Btn variant="outline" onClick={() => setEdit(null)}>Cancel</Btn>
          <Btn busy={busy} onClick={save}>Save offer</Btn>
        </div>
      </Modal>
    </>
  );
}
