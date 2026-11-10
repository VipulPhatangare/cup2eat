import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useApi } from '../hooks/useApi';

// the site keeps working with these values even if the API is down
const DEFAULTS = {
  phone: '9818192575',
  whatsapp: '919818192575',
  instagram: 'cup2eat',
  founder: 'Varun Khera',
  followers: 1114,
  fssaiNo: '',
  address: 'Ghaziabad, Uttar Pradesh',
};

const SiteContext = createContext(null);
const OrderContext = createContext(null);
const ToastContext = createContext(null);
const ProductsContext = createContext({ products: [], loading: true, error: null, reload: () => {} });

export function AppProviders({ children }) {
  const { data } = useApi('/settings');
  const productsApi = useApi('/products');
  const products = useMemo(
    () => ({ products: productsApi.data || [], loading: productsApi.loading, error: productsApi.error, reload: productsApi.reload }),
    [productsApi.data, productsApi.loading, productsApi.error, productsApi.reload]
  );
  const site = useMemo(() => {
    const merged = { ...DEFAULTS };
    for (const [k, v] of Object.entries(data || {})) if (v !== '' && v != null) merged[k] = v;
    merged.waLink = (text = 'Hi CUP2EAT! I would like to know more about your edible cups.') =>
      `https://wa.me/${merged.whatsapp}?text=${encodeURIComponent(text)}`;
    return merged;
  }, [data]);

  // what the visitor picked in "Products" / "Calculator", so the contact form can be pre-filled
  const [selection, setSelection] = useState({ productId: '', quantity: '' });

  const [toasts, setToasts] = useState([]);
  const toast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  }, []);

  return (
    <SiteContext.Provider value={site}>
      <OrderContext.Provider value={{ selection, setSelection }}>
        <ToastContext.Provider value={toast}>
          <ProductsContext.Provider value={products}>
          {children}
          </ProductsContext.Provider>
          <div className="pointer-events-none fixed inset-x-0 top-20 z-[100] flex flex-col items-center gap-2 px-4" aria-live="polite">
            <AnimatePresence>
              {toasts.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: -16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl px-4 py-3 text-sm font-medium shadow-xl ${
                    t.type === 'error' ? 'bg-red-700 text-white' : 'bg-forest text-cream'
                  }`}
                >
                  {t.type === 'error' ? <AlertCircle className="mt-0.5 size-5 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-gold" />}
                  {t.message}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ToastContext.Provider>
      </OrderContext.Provider>
    </SiteContext.Provider>
  );
}

export const useSite = () => useContext(SiteContext);
export const useOrder = () => useContext(OrderContext);
export const useToast = () => useContext(ToastContext);
export const useProducts = () => useContext(ProductsContext);
