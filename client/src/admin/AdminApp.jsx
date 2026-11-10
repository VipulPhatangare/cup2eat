import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { ConfirmProvider } from './ui';
import Layout from './Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reviews from './pages/Reviews';
import Enquiries from './pages/Enquiries';
import Products from './pages/Products';
import Offers from './pages/Offers';
import Gallery from './pages/Gallery';
import Settings from './pages/Settings';
import Activity from './pages/Activity';

// pages only the owner may open: staff are sent back to the dashboard (the API refuses them anyway)
function OwnerOnly({ children }) {
  const { isOwner } = useAuth();
  return isOwner ? children : <Navigate to="/admin" replace />;
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <ConfirmProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="enquiries" element={<Enquiries />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="products" element={<OwnerOnly><Products /></OwnerOnly>} />
            <Route path="offers" element={<OwnerOnly><Offers /></OwnerOnly>} />
            <Route path="settings" element={<OwnerOnly><Settings /></OwnerOnly>} />
            <Route path="activity" element={<OwnerOnly><Activity /></OwnerOnly>} />
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </ConfirmProvider>
    </AuthProvider>
  );
}
