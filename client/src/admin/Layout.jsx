import { useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { History, ImagePlus, Inbox, LayoutDashboard, LogOut, Menu, MessageSquareText, Package, Settings, Tag, X } from 'lucide-react';
import { useAuth } from './AuthContext';
import { adm } from './api';
import { Spinner } from './ui';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquareText, badge: 'reviews' },
  { to: '/admin/enquiries', label: 'Enquiries', icon: Inbox, badge: 'enquiries' },
  { to: '/admin/products', label: 'Products', icon: Package, owner: true },
  { to: '/admin/offers', label: 'Offers', icon: Tag, owner: true },
  { to: '/admin/gallery', label: 'Gallery', icon: ImagePlus },
  { to: '/admin/settings', label: 'Settings', icon: Settings, owner: true },
  { to: '/admin/activity', label: 'Activity', icon: History, owner: true },
];

export default function Layout() {
  const { admin, loading, logout, isOwner } = useAuth();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [badges, setBadges] = useState({ reviews: 0, enquiries: 0 });

  // keep the red numbers fresh on every page change
  useEffect(() => {
    if (!admin) return;
    adm.get('/stats').then((s) => setBadges({ reviews: s.reviews.pending, enquiries: s.enquiries.newTotal })).catch(() => {});
  }, [admin, loc.pathname]);

  useEffect(() => { setOpen(false); }, [loc.pathname]);

  // never let search engines index the panel
  useEffect(() => {
    const m = document.createElement('meta');
    m.name = 'robots';
    m.content = 'noindex,nofollow';
    document.head.appendChild(m);
    const prev = document.title;
    document.title = 'CUP2EAT Admin';
    return () => { m.remove(); document.title = prev; };
  }, []);

  if (loading) return <div className="grid min-h-svh place-items-center bg-[#f5f1e6]"><Spinner /></div>;
  if (!admin) return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />;

  const items = NAV.filter((n) => !n.owner || isOwner);
  const links = (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {items.map(({ to, label, icon: Icon, end, badge }) => (
        <NavLink
          key={to} to={to} end={end}
          className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition ${isActive ? 'bg-gold text-deep' : 'text-cream/80 hover:bg-white/10'}`}
        >
          <Icon className="size-5 shrink-0" />
          <span className="flex-1">{label}</span>
          {badge && badges[badge] > 0 && <span className="grid min-w-6 place-items-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">{badges[badge]}</span>}
        </NavLink>
      ))}
    </nav>
  );

  const userBox = (
    <div className="border-t border-white/10 pt-4">
      <p className="truncate text-sm font-semibold text-cream">{admin.name}</p>
      <p className="truncate text-xs text-cream/60">{admin.email} · {admin.role}</p>
      <div className="mt-3 flex gap-2">
        <a href="/" target="_blank" rel="noreferrer" className="flex-1 rounded-lg border border-white/20 px-3 py-2 text-center text-xs font-semibold text-cream hover:bg-white/10">View site</a>
        <button onClick={logout} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-cream hover:bg-white/20"><LogOut className="size-3.5" /> Log out</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-svh bg-[#f5f1e6] text-choco lg:grid lg:grid-cols-[250px_1fr]">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh flex-col justify-between bg-forest p-5 lg:flex">
        <div>
          <div className="mb-7 flex items-center gap-2.5">
            <img src="/logo.png" alt="" width="38" height="38" className="size-[38px] rounded-full ring-2 ring-gold/60" />
            <div><p className="font-display text-lg font-extrabold leading-none text-cream">CUP2EAT</p><p className="text-[11px] uppercase tracking-widest text-gold">Admin</p></div>
          </div>
          {links}
        </div>
        {userBox}
      </aside>

      {/* phone header + drawer */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-forest px-4 text-cream lg:hidden">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="" width="32" height="32" className="size-8 rounded-full ring-2 ring-gold/60" />
          <span className="font-display text-lg font-extrabold">CUP2EAT <span className="text-xs font-semibold uppercase tracking-widest text-gold">Admin</span></span>
        </div>
        <button onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} className="relative grid size-11 place-items-center rounded-full hover:bg-white/10">
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
          {!open && badges.reviews + badges.enquiries > 0 && <span className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-red-500" />}
        </button>
      </header>
      {open && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-30 flex flex-col justify-between overflow-y-auto bg-forest p-4 lg:hidden">
          {links}
          <div className="mt-6">{userBox}</div>
        </div>
      )}

      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-9">
        <div className="mx-auto max-w-6xl"><Outlet /></div>
      </main>
    </div>
  );
}
