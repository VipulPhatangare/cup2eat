import { useEffect, useState } from 'react';
import { KeyRound, Save } from 'lucide-react';
import { adm } from '../api';
import { useToast } from '../../context/AppContext';
import { Btn, Card, ErrorBox, Field, PageTitle, Spinner, inputCls, useLoad } from '../ui';

function SiteForm() {
  const toast = useToast();
  const { data, loading, error, reload } = useLoad(() => adm.get('/settings'), []);
  const [f, setF] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data) setF({ phone: data.phone || '', instagram: data.instagram || '', email: data.email || '', address: data.address || '', fssaiNo: data.fssaiNo || '', founder: data.founder || '', followers: data.followers ?? '' });
  }, [data]);

  if (loading && !f) return <Spinner />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  if (!f) return null;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const body = { ...f, followers: f.followers === '' ? undefined : Number(f.followers) };
    try { await adm.put('/settings', body); toast('Saved. The website footer, links and buttons use these now.'); reload(); } catch (err) { setErrors(err.fields || {}); toast(err.message, 'error'); } finally { setBusy(false); }
  };

  return (
    <Card>
      <h2 className="mb-4 font-display text-lg font-bold text-forest">Contact & business details</h2>
      <form onSubmit={save} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone / WhatsApp number" error={errors.phone} hint="10 digits. The WhatsApp button and Call button use this.">
          <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} inputMode="tel" className={inputCls} />
        </Field>
        <Field label="FSSAI licence number" error={errors.fssaiNo} hint="14 digits. Shown in the website footer. Leave empty if you do not have it yet.">
          <input value={f.fssaiNo} onChange={(e) => setF({ ...f, fssaiNo: e.target.value.replace(/\D/g, '').slice(0, 14) })} inputMode="numeric" className={inputCls} />
        </Field>
        <Field label="Instagram username" error={errors.instagram} hint="Without the @"><input value={f.instagram} onChange={set('instagram')} className={inputCls} /></Field>
        <Field label="Email" error={errors.email}><input type="email" value={f.email} onChange={set('email')} className={inputCls} /></Field>
        <Field label="Founder name"><input value={f.founder} onChange={set('founder')} className={inputCls} /></Field>
        <Field label="Instagram followers" hint="Shown in “Our story”"><input type="number" min="0" value={f.followers} onChange={set('followers')} className={inputCls} /></Field>
        <Field label="Address / city" className="sm:col-span-2"><input value={f.address} onChange={set('address')} className={inputCls} /></Field>
        <div className="sm:col-span-2"><Btn type="submit" busy={busy}><Save className="size-4" /> Save details</Btn></div>
      </form>
    </Card>
  );
}

function PasswordForm() {
  const toast = useToast();
  const [f, setF] = useState({ current: '', next: '', again: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setErrors({});
    if (f.next !== f.again) { setErrors({ again: 'The two new passwords are different' }); return; }
    setBusy(true);
    try {
      await adm.post('/auth/password', { current: f.current, next: f.next });
      toast('Password changed. Other devices are logged out.');
      setF({ current: '', next: '', again: '' });
    } catch (err) { setErrors(err.fields || { current: err.message }); toast(err.message, 'error'); } finally { setBusy(false); }
  };

  return (
    <Card>
      <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-forest"><KeyRound className="size-5" /> Change password</h2>
      <p className="mb-4 text-sm text-choco/65">Changing it logs out every other device.</p>
      <form onSubmit={save} noValidate className="grid gap-4 sm:grid-cols-3">
        <Field label="Current password" error={errors.current}><input type="password" autoComplete="current-password" value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} className={inputCls} /></Field>
        <Field label="New password" error={errors.next} hint="At least 10 characters"><input type="password" autoComplete="new-password" value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} className={inputCls} /></Field>
        <Field label="New password again" error={errors.again}><input type="password" autoComplete="new-password" value={f.again} onChange={(e) => setF({ ...f, again: e.target.value })} className={inputCls} /></Field>
        <div className="sm:col-span-3"><Btn type="submit" busy={busy}>Change password</Btn></div>
      </form>
    </Card>
  );
}

export default function Settings() {
  return (
    <>
      <PageTitle title="Settings" subtitle="Details shown across the website." />
      <div className="space-y-6"><SiteForm /><PasswordForm /></div>
    </>
  );
}
