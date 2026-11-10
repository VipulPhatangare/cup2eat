import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Pencil, Trash2, Upload } from 'lucide-react';
import { adm } from '../api';
import { useToast } from '../../context/AppContext';
import { Badge, Btn, Card, Empty, ErrorBox, Field, Modal, PageTitle, Spinner, inputCls, useConfirm, useLoad } from '../ui';

const CATS = [['Event', 'Event'], ['Cafe', 'Café'], ['College', 'College / School'], ['Product', 'Our cups']];

export default function Gallery() {
  const toast = useToast();
  const confirm = useConfirm();
  const fileRef = useRef(null);
  const { data, loading, error, reload, setData } = useLoad(() => adm.get('/gallery'), []);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [f, setF] = useState({ title: '', place: '', category: 'Event' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState(null);

  useEffect(() => {
    if (!file) { setPreview(''); return undefined; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) { toast('Choose a photo first.', 'error'); return; }
    setBusy(true);
    setErrors({});
    const form = new FormData();
    form.append('image', file);
    Object.entries(f).forEach(([k, v]) => form.append(k, v));
    try {
      await adm.postForm('/gallery', form);
      toast('Photo added to the website gallery');
      setFile(null); setF({ title: '', place: '', category: 'Event' });
      if (fileRef.current) fileRef.current.value = '';
      reload();
    } catch (err) { setErrors(err.fields || {}); toast(err.message, 'error'); } finally { setBusy(false); }
  };

  const move = async (i, d) => {
    const next = [...data];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setData(next);
    try { await adm.post('/gallery/reorder', { ids: next.map((g) => g._id) }); } catch (err) { toast(err.message, 'error'); reload(); }
  };

  const del = async (g) => {
    if (await confirm({ title: 'Remove this photo?', text: `"${g.title}" will disappear from the website gallery.`, action: 'Remove', danger: true })) {
      try { await adm.del(`/gallery/${g._id}`); toast('Photo removed'); reload(); } catch (err) { toast(err.message, 'error'); }
    }
  };

  const saveEdit = async () => {
    setBusy(true);
    try { await adm.patch(`/gallery/${edit._id}`, { title: edit.title, place: edit.place, category: edit.category }); toast('Saved'); setEdit(null); reload(); } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  };

  return (
    <>
      <PageTitle title="Gallery" subtitle="Photos from cafés, events and colleges. Shown in the “CUP2EAT in the real world” section." />

      <Card className="mb-8">
        <h2 className="mb-4 font-display text-lg font-bold text-forest">Add a photo</h2>
        <form onSubmit={upload} noValidate className="grid gap-4 md:grid-cols-[180px_1fr]">
          <button type="button" onClick={() => fileRef.current?.click()} aria-label="Choose a photo"
            className="relative grid aspect-square w-full max-w-[200px] place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-forest/30 text-forest transition hover:bg-forest/5">
            {preview ? <img src={preview} alt="Selected" className="size-full object-cover" /> : <span className="flex flex-col items-center gap-1 text-sm font-medium"><Upload className="size-7" /> Choose photo</span>}
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Photo file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <div className="grid content-start gap-4 sm:grid-cols-2">
            <Field label="Title" error={errors.title}><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={inputCls} placeholder="Grand opening day" /></Field>
            <Field label="Place"><input value={f.place} onChange={(e) => setF({ ...f, place: e.target.value })} className={inputCls} placeholder="Sewa Nagar, Ghaziabad" /></Field>
            <Field label="Category"><select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className={inputCls}>{CATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
            <div className="flex items-end"><Btn type="submit" busy={busy} className="w-full sm:w-auto"><Upload className="size-4" /> Add to gallery</Btn></div>
            <p className="text-xs text-choco/55 sm:col-span-2">JPG, PNG or WebP up to 8 MB. It is resized and converted automatically.</p>
          </div>
        </form>
      </Card>

      {loading && !data ? <Spinner /> : error ? <ErrorBox error={error} onRetry={reload} /> : data.length === 0 ? (
        <Empty title="No photos yet" text="Add your first event or café photo above." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((g, i) => (
            <li key={g._id}>
              <Card className="!p-0 overflow-hidden">
                <img src={g.image} alt={g.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0"><p className="truncate font-semibold">{g.title}</p><p className="truncate text-xs text-choco/60">{g.place || 'No place'}</p></div>
                    <Badge tone="gold">{CATS.find(([v]) => v === g.category)?.[1] || g.category}</Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Btn variant="outline" size="sm" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move earlier"><ArrowLeft className="size-4" /></Btn>
                    <Btn variant="outline" size="sm" disabled={i === data.length - 1} onClick={() => move(i, 1)} aria-label="Move later"><ArrowRight className="size-4" /></Btn>
                    <span className="text-xs text-choco/50">#{i + 1}</span>
                    <Btn variant="outline" size="sm" className="ml-auto" onClick={() => setEdit({ ...g })} aria-label={`Edit ${g.title}`}><Pencil className="size-4" /></Btn>
                    <Btn variant="dangerSoft" size="sm" onClick={() => del(g)} aria-label={`Remove ${g.title}`}><Trash2 className="size-4" /></Btn>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit photo details">
        {edit && (
          <div className="space-y-4">
            <Field label="Title"><input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} className={inputCls} /></Field>
            <Field label="Place"><input value={edit.place || ''} onChange={(e) => setEdit({ ...edit, place: e.target.value })} className={inputCls} /></Field>
            <Field label="Category"><select value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} className={inputCls}>{CATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
            <div className="flex justify-end gap-2"><Btn variant="outline" onClick={() => setEdit(null)}>Cancel</Btn><Btn busy={busy} onClick={saveEdit}>Save</Btn></div>
          </div>
        )}
      </Modal>
    </>
  );
}
