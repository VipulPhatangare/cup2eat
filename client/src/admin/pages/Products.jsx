import { useRef, useState } from 'react';
import { ImagePlus, Plus, Save, Trash2 } from 'lucide-react';
import { adm } from '../api';
import { useToast } from '../../context/AppContext';
import { Badge, Btn, Card, ErrorBox, Field, PageTitle, Spinner, Toggle, inputCls, useConfirm, useLoad } from '../ui';

const inr2 = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
const csv = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);
const lines = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean);

const blank = () => ({ _new: true, name: '', tagline: '', capacityMl: 100, usage: [], flavours: [], features: [], wholesale: { cups: '', price: '' }, deliveryIncluded: true, isActive: true, order: 9 });

function ProductForm({ product, onSaved, onGone }) {
  const toast = useToast();
  const confirm = useConfirm();
  const fileRef = useRef(null);
  const isNew = !!product._new;
  const [f, setF] = useState({
    name: product.name, tagline: product.tagline || '', capacityMl: product.capacityMl,
    usage: product.usage.join(', '), flavours: product.flavours.join(', '), features: product.features.join('\n'),
    cups: product.wholesale?.cups ?? '', price: product.wholesale?.price ?? '',
    rCups: product.retail?.cups ?? '', rPrice: product.retail?.price ?? '',
    deliveryIncluded: product.deliveryIncluded, isActive: product.isActive, order: product.order ?? 0,
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const perCup = Number(f.cups) > 0 && Number(f.price) > 0 ? Number(f.price) / Number(f.cups) : null;
  const wasPerCup = product.wholesale?.cups ? product.wholesale.price / product.wholesale.cups : null;

  const save = async () => {
    const body = {
      name: f.name, tagline: f.tagline, capacityMl: Number(f.capacityMl),
      usage: csv(f.usage), flavours: csv(f.flavours), features: lines(f.features),
      wholesale: { cups: Number(f.cups), price: Number(f.price) },
      retail: f.rCups && f.rPrice ? { cups: Number(f.rCups), price: Number(f.rPrice) } : null,
      deliveryIncluded: f.deliveryIncluded, isActive: f.isActive, order: Number(f.order) || 0,
    };
    if (wasPerCup && perCup && Math.abs(perCup - wasPerCup) / wasPerCup > 0.3) {
      const ok = await confirm({ title: 'Big price change', text: `The price per cup goes from ${inr2(wasPerCup)} to ${inr2(perCup)}. Is that right?`, action: 'Yes, save it' });
      if (!ok) return;
    }
    setBusy(true);
    setErrors({});
    try {
      const saved = isNew ? await adm.post('/products', body) : await adm.put(`/products/${product._id}`, body);
      toast(isNew ? 'Product added' : 'Saved. The website shows the new details now.');
      onSaved(saved, product);
    } catch (e) {
      setErrors(e.fields || {});
      toast(e.message, 'error');
    } finally { setBusy(false); }
  };

  const upload = async (file) => {
    if (!file) return;
    const form = new FormData();
    form.append('image', file);
    setBusy(true);
    try { const saved = await adm.postForm(`/products/${product._id}/image`, form); toast('Photo updated'); onSaved(saved, product); } catch (e) { toast(e.message, 'error'); } finally { setBusy(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const remove = async () => {
    if (isNew) return onGone(product);
    if (await confirm({ title: `Delete "${product.name}"?`, text: 'This cannot be undone. If it has reviews you can only hide it.', action: 'Delete', danger: true })) {
      try { await adm.del(`/products/${product._id}`); toast('Deleted'); onGone(product); } catch (e) { toast(e.message, 'error'); }
    }
  };

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {!isNew && (
            <div className="relative size-20 overflow-hidden rounded-2xl bg-forest/10 ring-1 ring-forest/15">
              {product.image && <img src={product.image} alt="" className="size-full object-cover" />}
              <button type="button" onClick={() => fileRef.current?.click()} aria-label="Change photo" className="absolute inset-0 grid place-items-center bg-black/0 text-white opacity-0 transition hover:bg-black/50 hover:opacity-100 focus-visible:opacity-100"><ImagePlus className="size-6" /></button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Upload product photo" onChange={(e) => upload(e.target.files?.[0])} />
            </div>
          )}
          <div>
            <h2 className="font-display text-xl font-bold text-forest">{isNew ? 'New product' : product.name}</h2>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {!isNew && <Badge tone={product.isActive ? 'green' : 'grey'}>{product.isActive ? 'Shown on site' : 'Hidden'}</Badge>}
              {!isNew && product.reviewCount > 0 && <Badge tone="gold">{product.reviewCount} review{product.reviewCount > 1 ? 's' : ''}</Badge>}
            </div>
          </div>
        </div>
        <Toggle checked={f.isActive} onChange={(v) => setF((x) => ({ ...x, isActive: v }))} label="Show on website" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" error={errors.name}><input value={f.name} onChange={set('name')} className={inputCls} placeholder="Edible Cup 100 ml" /></Field>
        <Field label="Short line under the name"><input value={f.tagline} onChange={set('tagline')} className={inputCls} placeholder="For chai, coffee & ice cream" /></Field>
        <Field label="Capacity (ml)" error={errors.capacityMl}><input type="number" min="10" value={f.capacityMl} onChange={set('capacityMl')} className={inputCls} /></Field>
        <Field label="Position on the site" hint="Smaller numbers come first."><input type="number" min="0" value={f.order} onChange={set('order')} className={inputCls} /></Field>
      </div>

      <div className="rounded-2xl bg-forest/5 p-4">
        <p className="mb-3 text-sm font-semibold text-forest">Wholesale pack (delivery included)</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Cups in a pack" error={errors['wholesale.cups']}><input type="number" min="1" value={f.cups} onChange={set('cups')} className={inputCls} /></Field>
          <Field label="Pack price (₹)" error={errors['wholesale.price']}><input type="number" min="1" value={f.price} onChange={set('price')} className={inputCls} /></Field>
          <div className="flex flex-col justify-end pb-1">
            <p className="text-xs text-choco/60">Price per cup</p>
            <p className="font-display text-2xl font-extrabold text-forest">{perCup ? inr2(perCup) : '–'}</p>
            {perCup && wasPerCup && Math.abs(perCup - wasPerCup) > 0.005 && <p className="text-xs text-choco/60">was {inr2(wasPerCup)}</p>}
          </div>
        </div>
        <div className="mt-4">
  <Toggle checked={f.deliveryIncluded} onChange={(v) => setF((x) => ({ ...x, deliveryIncluded: v }))} label="Delivery included all over India" />
        </div>
      </div>

      <details className="rounded-2xl border border-forest/10 p-4" open={!!(f.rCups || f.rPrice)}>
        <summary className="cursor-pointer text-sm font-semibold text-forest">Retail pack (optional, not shown on the site yet)</summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="Cups in a retail pack"><input type="number" min="1" value={f.rCups} onChange={set('rCups')} className={inputCls} /></Field>
          <Field label="Retail price (₹)"><input type="number" min="1" value={f.rPrice} onChange={set('rPrice')} className={inputCls} /></Field>
        </div>
        <p className="mt-2 text-xs text-choco/55">Leave both empty if there is no retail pack. Confirm the real retail prices before filling this.</p>
      </details>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Best for" hint="Separate with commas"><input value={f.usage} onChange={set('usage')} className={inputCls} placeholder="Chai, Coffee, Ice cream" /></Field>
        <Field label="Flavours" hint="Separate with commas"><input value={f.flavours} onChange={set('flavours')} className={inputCls} placeholder="Chocolate, Vanilla, Elaichi" /></Field>
      </div>
      <Field label="Feature ticks" hint="One per line"><textarea rows={4} value={f.features} onChange={set('features')} className={inputCls} /></Field>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-forest/10 pt-4">
        <Btn variant="dangerSoft" onClick={remove}><Trash2 className="size-4" /> {isNew ? 'Discard' : 'Delete'}</Btn>
        <Btn busy={busy} onClick={save}><Save className="size-4" /> {isNew ? 'Add product' : 'Save changes'}</Btn>
      </div>
    </Card>
  );
}

export default function Products() {
  const { data, loading, error, reload, setData } = useLoad(() => adm.get('/products'), []);
  const [drafts, setDrafts] = useState([]);

  if (loading && !data) return <Spinner />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  return (
    <>
      <PageTitle title="Products" subtitle="Change prices, pack sizes and details. The website updates as soon as you save.">
        <Btn variant="gold" onClick={() => setDrafts((d) => [...d, { ...blank(), _key: Date.now() }])}><Plus className="size-4" /> Add product</Btn>
      </PageTitle>
      <div className="space-y-6">
        {data.map((p) => (
          <ProductForm key={p._id + p.updatedAt} product={p}
            onSaved={(saved) => setData(data.map((x) => (x._id === saved._id ? { ...saved.toJSON?.() ?? saved, reviewCount: x.reviewCount } : x)))}
            onGone={() => reload()} />
        ))}
        {drafts.map((d) => (
          <ProductForm key={d._key} product={d}
            onSaved={() => { setDrafts((ds) => ds.filter((x) => x._key !== d._key)); reload(); }}
            onGone={() => setDrafts((ds) => ds.filter((x) => x._key !== d._key))} />
        ))}
      </div>
      <p className="mt-6 text-sm text-choco/60">Current prices: {data.map((p) => `${p.capacityMl} ml ${inr(p.wholesale.price)}`).join(' · ')}</p>
    </>
  );
}
