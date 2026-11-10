import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';

// the admin panel is its own chunk: visitors of the public site never download it
const AdminApp = lazy(() => import('./admin/AdminApp'));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<div className="grid min-h-svh place-items-center bg-deep text-cream/70">Loading…</div>}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
